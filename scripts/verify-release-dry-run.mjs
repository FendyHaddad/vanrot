import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  createArtifactWorkspace,
  finalizeArtifactWorkspace,
  shouldKeepForSteps,
} from './release-dry-run/artifacts.mjs';
import { createHomebrewStep, writeLocalFormula } from './release-dry-run/homebrew.mjs';
import {
  createCheckFailureStep,
  createCheckPassStep,
  failedRequiredSteps,
} from './release-dry-run/model.mjs';
import { discoverPublicPackages, validatePackageMetadata } from './release-dry-run/metadata.mjs';
import {
  copyTarballsForHomebrew,
  createTarballSpecifiers,
  packPackages,
  runNpmConsumerWorkflow,
  runPnpmConsumerWorkflow,
  writeNpmConsumer,
  writePnpmConsumer,
} from './release-dry-run/package-workflows.mjs';
import { createReport, formatConsoleReport, writeReports } from './release-dry-run/reports.mjs';
import { runCommand } from './release-dry-run/runner.mjs';

export function parseOptions(args) {
  const options = { keep: false };

  for (const arg of args) {
    if (arg === '--') {
      continue;
    }

    if (arg === '--keep') {
      options.keep = true;
      continue;
    }

    throw new Error(`Unknown option: ${arg}`);
  }

  return options;
}

export async function runReleaseDryRun({ repositoryRoot, keep }) {
  const startedAt = new Date().toISOString();
  const workspace = await createArtifactWorkspace({ repositoryRoot, keep });
  const steps = [];
  const warnings = [];
  let packages = [];
  let tarballs = [];

  steps.push(
    await runCommand({
      name: 'build public packages',
      command: 'pnpm',
      args: ['-r', '--filter', './packages/*', '--if-present', 'run', 'build'],
      cwd: repositoryRoot,
      required: true,
    }),
  );

  if (failedRequiredSteps(steps).length === 0) {
    packages = await discoverPublicPackages(repositoryRoot);
    const metadataFailures = validatePackageMetadata(packages, {
      allowLocalInternalSpecifiers: true,
    });
    steps.push(
      metadataFailures.length === 0
        ? createCheckPassStep({ name: 'package metadata', message: 'Package metadata is release-ready.' })
        : createCheckFailureStep({
            name: 'package metadata',
            message: metadataFailures.join('\n'),
          }),
    );
  }

  if (failedRequiredSteps(steps).length === 0) {
    const packed = await packPackages({
      packages,
      artifactsDirectory: workspace.artifactsDirectory,
      packageCopiesDirectory: workspace.packageCopiesDirectory,
    });
    steps.push(...packed.steps);
    tarballs = packed.tarballs;
  }

  if (failedRequiredSteps(steps).length === 0) {
    const tarballSpecifiers = createTarballSpecifiers(packages, workspace.artifactsDirectory);
    await writePnpmConsumer({
      directory: workspace.pnpmConsumerDirectory,
      tarballSpecifiers,
    });
    steps.push(...(await runPnpmConsumerWorkflow({ directory: workspace.pnpmConsumerDirectory })));
  }

  if (failedRequiredSteps(steps).length === 0) {
    const tarballSpecifiers = createTarballSpecifiers(packages, workspace.artifactsDirectory);
    await writeNpmConsumer({
      directory: workspace.npmConsumerDirectory,
      tarballSpecifiers,
    });
    steps.push(...(await runNpmConsumerWorkflow({ directory: workspace.npmConsumerDirectory })));
  }

  if (failedRequiredSteps(steps).length === 0) {
    const homebrewSourceDirectory = join(workspace.homebrewDirectory, 'source');
    await copyTarballsForHomebrew({ tarballs, directory: homebrewSourceDirectory });
    const sourceArchivePath = join(workspace.homebrewDirectory, 'vanrot-homebrew-source.tar.gz');
    await mkdir(workspace.homebrewDirectory, { recursive: true });
    steps.push(
      await runCommand({
        name: 'homebrew source archive',
        command: 'tar',
        args: ['-czf', sourceArchivePath, '-C', homebrewSourceDirectory, '.'],
        cwd: repositoryRoot,
        required: true,
      }),
    );

    if (failedRequiredSteps(steps).length === 0) {
      const formulaPath = await writeLocalFormula({
        directory: join(workspace.homebrewDirectory, 'Formula'),
        sourceArchivePath,
      });
      const homebrewStep = await createHomebrewStep({
        repositoryRoot,
        formulaPath,
      });
      steps.push(homebrewStep);

      if (homebrewStep.status === 'skip') {
        warnings.push(homebrewStep.reason);
      }
    }
  }

  const endedAt = new Date().toISOString();
  const keepArtifacts = shouldKeepForSteps({ keep, steps });
  const report = createReport({
    repositoryRoot,
    packages,
    tarballs,
    steps,
    warnings,
    artifacts: keepArtifacts ? [workspace.keptRoot] : [],
    startedAt,
    endedAt,
  });

  if (keepArtifacts) {
    await writeReports({ report, reportDirectory: workspace.temporaryRoot });
  }

  await finalizeArtifactWorkspace({ workspace, keep: keepArtifacts });

  if (keepArtifacts) {
    await writeReports({ report, reportDirectory: workspace.keptRoot });
  }

  return report;
}

async function main() {
  try {
    const options = parseOptions(process.argv.slice(2));
    const report = await runReleaseDryRun({
      repositoryRoot: process.cwd(),
      keep: options.keep,
    });
    console.log(formatConsoleReport(report));
    process.exitCode = report.success ? 0 : 1;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? fileURLToPath(import.meta.url)).href) {
  await main();
}
