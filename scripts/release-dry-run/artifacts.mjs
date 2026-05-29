import { cp, mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { failedRequiredSteps } from './model.mjs';

const keptArtifactRelativePath = ['.vanrot', 'release-dry-run'];
const rewritableArtifactSuffixes = ['.json', '.md', '.yaml', '.yml'];

export async function createArtifactWorkspace({ repositoryRoot, keep }) {
  const temporaryRoot = await mkdtemp(join(tmpdir(), 'vanrot-release-dry-run-'));
  const artifactsDirectory = join(temporaryRoot, 'artifacts');
  const packageCopiesDirectory = join(temporaryRoot, 'package-copies');
  const pnpmConsumerDirectory = join(temporaryRoot, 'pnpm-consumer');
  const npmConsumerDirectory = join(temporaryRoot, 'npm-consumer');
  const homebrewDirectory = join(temporaryRoot, 'homebrew');
  const keptRoot = join(repositoryRoot, ...keptArtifactRelativePath);

  await mkdir(artifactsDirectory, { recursive: true });
  await mkdir(packageCopiesDirectory, { recursive: true });
  await mkdir(pnpmConsumerDirectory, { recursive: true });
  await mkdir(npmConsumerDirectory, { recursive: true });
  await mkdir(homebrewDirectory, { recursive: true });

  return {
    keep,
    repositoryRoot,
    temporaryRoot,
    artifactsDirectory,
    packageCopiesDirectory,
    pnpmConsumerDirectory,
    npmConsumerDirectory,
    homebrewDirectory,
    keptRoot,
  };
}

export function shouldKeepArtifacts({ keep, failedSteps }) {
  return keep || failedSteps.length > 0;
}

export async function finalizeArtifactWorkspace({ workspace, keep }) {
  if (keep) {
    await rm(workspace.keptRoot, { force: true, recursive: true });
    await mkdir(workspace.keptRoot, { recursive: true });
    await cp(workspace.temporaryRoot, workspace.keptRoot, { recursive: true });
    await rewriteKeptArtifactPaths({
      directory: workspace.keptRoot,
      from: workspace.temporaryRoot,
      to: workspace.keptRoot,
    });
    return;
  }

  await rm(workspace.temporaryRoot, { force: true, recursive: true });
}

export function shouldKeepForSteps({ keep, steps }) {
  return shouldKeepArtifacts({ keep, failedSteps: failedRequiredSteps(steps) });
}

async function rewriteKeptArtifactPaths({ directory, from, to }) {
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      await rewriteKeptArtifactPaths({ directory: entryPath, from, to });
      continue;
    }

    if (!isRewritableArtifact(entry.name)) {
      continue;
    }

    const content = await readFile(entryPath, 'utf8');

    if (!content.includes(from)) {
      continue;
    }

    await writeFile(entryPath, content.split(from).join(to), 'utf8');
  }
}

function isRewritableArtifact(fileName) {
  return rewritableArtifactSuffixes.some((suffix) => fileName.endsWith(suffix));
}
