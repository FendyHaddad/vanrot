import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  createCheckFailureStep,
  createCommandStep,
  createSkippedStep,
  failedRequiredSteps,
  summarizeStep,
} from './release-dry-run/model.mjs';
import {
  createArtifactWorkspace,
  finalizeArtifactWorkspace,
  shouldKeepArtifacts,
} from './release-dry-run/artifacts.mjs';
import { createHomebrewStep } from './release-dry-run/homebrew.mjs';
import {
  createPackageSpecifier,
  createPnpmWorkspaceYaml,
  createTarballName,
  createTarballSpecifiers,
  createWorkspacePackageJson,
} from './release-dry-run/package-workflows.mjs';
import {
  createReleaseManifest,
  discoverPublicPackages,
  validatePackageMetadata,
} from './release-dry-run/metadata.mjs';
import { createReport, formatConsoleReport, writeReports } from './release-dry-run/reports.mjs';
import { runCommand } from './release-dry-run/runner.mjs';
import { parseOptions } from './verify-release-dry-run.mjs';

describe('npm publish script', () => {
  it('publishes release package copies in dependency order with web auth', async () => {
    const script = await readFile(new URL('../publish.sh', import.meta.url), 'utf8');
    const publishOrder = script.match(/PUBLISH_PACKAGES=\(([\s\S]*?)\)/)?.[1] ?? '';

    expect(script).toContain('set -euo pipefail');
    expect(script).toContain('node scripts/verify-release-dry-run.mjs --keep');
    expect(script).toContain('--auth-type=web');
    expect(script).toContain('--access public');
    expect(script).toContain('PUBLISH_DRY_RUN');
    expect(script).toContain('SKIP_EXISTING="${SKIP_EXISTING:-1}"');
    expect(script).toContain('published_count=');
    expect(publishOrder.match(/devtools[\s\S]*config[\s\S]*ai[\s\S]*runtime/)).not.toBeNull();
    expect(publishOrder.match(/forms[\s\S]*store[\s\S]*formatters[\s\S]*ui/)).not.toBeNull();
    expect(publishOrder.match(/testing[\s\S]*cli[\s\S]*language-server[\s\S]*seo[\s\S]*vite-plugin/)).not.toBeNull();

    const publishPackageDirectories = publishOrder.trim().split(/\s+/);
    const publicPackageDirectories = (await discoverPublicPackages(fileURLToPath(new URL('..', import.meta.url)))).map(
      (releasePackage) => releasePackage.directoryName,
    );

    expect(new Set(publishPackageDirectories)).toEqual(new Set(publicPackageDirectories));
  });
});

describe('verify-release-dry-run models', () => {
  it('summarizes passed, failed, and skipped steps', () => {
    expect(
      summarizeStep(
        createCommandStep({
          name: 'pnpm consumer install',
          command: 'pnpm install',
          cwd: '/tmp/app',
          exitCode: 0,
          stdout: 'done',
          stderr: '',
          required: true,
        }),
      ),
    ).toBe('pass pnpm consumer install');

    expect(
      summarizeStep(
        createCommandStep({
          name: 'npm smoke import',
          command: 'node smoke.mjs',
          cwd: '/tmp/app',
          exitCode: 1,
          stdout: '',
          stderr: 'Cannot find package',
          required: true,
        }),
      ),
    ).toBe('fail npm smoke import - node smoke.mjs');

    expect(
      summarizeStep(
        createSkippedStep({
          name: 'homebrew install',
          reason: 'Homebrew is not installed.',
        }),
      ),
    ).toBe('skip homebrew install - Homebrew is not installed.');
  });

  it('treats required command and check failures as blocking and skips as non-blocking', () => {
    const steps = [
      createCommandStep({
        name: 'metadata',
        command: 'node metadata',
        cwd: '/repo',
        exitCode: 0,
        stdout: '',
        stderr: '',
        required: true,
      }),
      createSkippedStep({
        name: 'homebrew install',
        reason: 'Homebrew is not installed.',
      }),
      createCommandStep({
        name: 'pnpm consumer build',
        command: 'pnpm build',
        cwd: '/tmp/app',
        exitCode: 1,
        stdout: '',
        stderr: 'build failed',
        required: true,
      }),
      createCheckFailureStep({
        name: 'package metadata',
        message: 'Missing engines.node.',
      }),
    ];

    expect(failedRequiredSteps(steps).map((step) => step.name)).toEqual([
      'pnpm consumer build',
      'package metadata',
    ]);
  });
});

describe('verify-release-dry-run metadata', () => {
  it('discovers public workspace packages and skips private packages', async () => {
    const root = await mkdtemp(join(tmpdir(), 'vanrot-metadata-'));
    await writeJson(join(root, 'packages', 'runtime', 'package.json'), {
      name: '@vanrot/runtime',
      version: '1.0.0',
      type: 'module',
      exports: './dist/index.js',
      files: ['dist'],
      engines: { node: '>=22' },
    });
    await writeJson(join(root, 'packages', 'site', 'package.json'), {
      name: '@vanrot/site',
      version: '1.0.0',
      private: true,
    });

    try {
      await expect(discoverPublicPackages(root)).resolves.toEqual([
        expect.objectContaining({
          name: '@vanrot/runtime',
          directoryName: 'runtime',
          manifestPath: join(root, 'packages', 'runtime', 'package.json'),
        }),
      ]);
    } finally {
      await rm(root, { force: true, recursive: true });
    }
  });

  it('reports missing release metadata with package names', () => {
    const failures = validatePackageMetadata([
      {
        name: '@vanrot/runtime',
        directory: '/repo/packages/runtime',
        manifest: {
          name: '@vanrot/runtime',
          version: '0.0.0',
          type: 'module',
          exports: './dist/index.js',
          files: ['dist'],
        },
      },
      {
        name: '@vanrot/cli',
        directory: '/repo/packages/cli',
        manifest: {
          name: '@vanrot/cli',
          version: '0.0.0',
          type: 'module',
          exports: './dist/index.js',
          bin: { vr: './dist/bin.js' },
          files: ['dist'],
          engines: { node: '>=22' },
          dependencies: { '@vanrot/runtime': 'workspace:*' },
        },
      },
    ]);

    expect(failures).toEqual([
      '@vanrot/runtime is missing engines.node.',
      '@vanrot/cli dependency @vanrot/runtime must not use workspace:* for release packaging.',
    ]);
  });

  it('allows local internal source links while rewriting release manifests', () => {
    const releasePackage = {
      name: '@vanrot/cli',
      manifest: {
        name: '@vanrot/cli',
        version: '0.1.0',
        type: 'module',
        exports: './dist/index.js',
        files: ['dist'],
        engines: { node: '>=22.14.0' },
        dependencies: {
          '@vanrot/config': 'file:../config',
          typescript: '^5.9.3',
        },
      },
    };
    const packageVersions = new Map([
      ['@vanrot/cli', '0.1.0'],
      ['@vanrot/config', '0.1.0'],
    ]);

    expect(
      validatePackageMetadata(
        [
          releasePackage,
          {
            name: '@vanrot/config',
            manifest: {
              name: '@vanrot/config',
              version: '0.1.0',
              type: 'module',
              exports: './dist/index.js',
              files: ['dist'],
              engines: { node: '>=22.14.0' },
            },
          },
        ],
        { allowLocalInternalSpecifiers: true },
      ),
    ).toEqual([]);
    expect(createReleaseManifest(releasePackage, packageVersions).dependencies).toEqual({
      '@vanrot/config': '0.1.0',
      typescript: '^5.9.3',
    });
  });
});

describe('verify-release-dry-run artifacts and Homebrew', () => {
  it('keeps artifacts on explicit keep or blocking failure', () => {
    expect(shouldKeepArtifacts({ keep: true, failedSteps: [] })).toBe(true);
    expect(
      shouldKeepArtifacts({
        keep: false,
        failedSteps: [createCheckFailureStep({ name: 'metadata', message: 'bad' })],
      }),
    ).toBe(true);
    expect(shouldKeepArtifacts({ keep: false, failedSteps: [] })).toBe(false);
  });

  it('creates temp workspaces and keeps reports under the repo when requested', async () => {
    const root = await mkdtemp(join(tmpdir(), 'vanrot-artifacts-'));
    const workspace = await createArtifactWorkspace({ repositoryRoot: root, keep: true });
    const temporaryTarballSpecifier = `file:${join(
      workspace.temporaryRoot,
      'artifacts',
      'vanrot-ai-0.0.0.tgz',
    )}`;

    try {
      expect(workspace.temporaryRoot).toContain('vanrot-release-dry-run-');
      expect(workspace.keptRoot).toBe(join(root, '.vanrot', 'release-dry-run'));
      await mkdir(join(workspace.temporaryRoot, 'npm-consumer'), { recursive: true });
      await writeFile(
        join(workspace.temporaryRoot, 'npm-consumer', 'package.json'),
        `${JSON.stringify({ dependencies: { '@vanrot/ai': temporaryTarballSpecifier } }, null, 2)}\n`,
      );
      await finalizeArtifactWorkspace({ workspace, keep: true });
      await expect(stat(workspace.keptRoot)).resolves.toEqual(expect.any(Object));
      await expect(
        readFile(join(workspace.keptRoot, 'npm-consumer', 'package.json'), 'utf8'),
      ).resolves.toContain(
        `file:${join(workspace.keptRoot, 'artifacts', 'vanrot-ai-0.0.0.tgz')}`,
      );
      await expect(
        readFile(join(workspace.keptRoot, 'npm-consumer', 'package.json'), 'utf8'),
      ).resolves.not.toContain(workspace.temporaryRoot);
    } finally {
      await rm(root, { force: true, recursive: true });
    }
  });

  it('skips Homebrew when brew is unavailable and fails when brew commands fail', async () => {
    await expect(
      createHomebrewStep({
        runner: async () =>
          createCommandStep({
            name: 'which brew',
            command: 'which brew',
            cwd: '/repo',
            exitCode: 1,
            stdout: '',
            stderr: '',
            required: false,
          }),
        repositoryRoot: '/repo',
      }),
    ).resolves.toEqual(
      createSkippedStep({
        name: 'homebrew local install',
        reason: 'Homebrew is not installed.',
      }),
    );

    const root = await mkdtemp(join(tmpdir(), 'vanrot-homebrew-test-'));
    const tapRoot = join(root, 'tap');
    const formulaPath = join(root, 'vanrot.rb');
    await writeFile(formulaPath, 'class Vanrot < Formula\nend\n', 'utf8');

    try {
      const commands = [];
      await expect(
        createHomebrewStep({
          runner: async (request) => {
            const renderedCommand = [request.command, ...(request.args ?? [])].join(' ');
            commands.push(renderedCommand);
            return createCommandStep({
              name: request.name,
              command: renderedCommand,
              cwd: request.cwd,
              exitCode: renderedCommand.includes('brew install') ? 1 : 0,
              stdout: renderedCommand.includes('brew --repository')
                ? tapRoot
                : '/opt/homebrew/bin/brew',
              stderr: renderedCommand.includes('brew install') ? 'formula failed' : '',
              required: request.required,
            });
          },
          repositoryRoot: root,
          formulaPath,
        }),
      ).resolves.toEqual(
        expect.objectContaining({
          command: expect.stringContaining('brew install'),
          status: 'fail',
        }),
      );
    } finally {
      await rm(root, { force: true, recursive: true });
    }
  });

  it('links the local Homebrew formula before running brew test', async () => {
    const root = await mkdtemp(join(tmpdir(), 'vanrot-homebrew-link-test-'));
    const tapRoot = join(root, 'tap');
    const formulaPath = join(root, 'vanrot.rb');
    await writeFile(formulaPath, 'class Vanrot < Formula\nend\n', 'utf8');

    try {
      const commands = [];
      const step = await createHomebrewStep({
        runner: async (request) => {
          const renderedCommand = [request.command, ...(request.args ?? [])].join(' ');
          commands.push(renderedCommand);

          return createCommandStep({
            name: request.name,
            command: renderedCommand,
            cwd: request.cwd,
            exitCode: 0,
            stdout: renderedCommand.includes('brew --repository') ? tapRoot : '/opt/homebrew/bin/brew',
            stderr: '',
            required: request.required,
          });
        },
        repositoryRoot: root,
        formulaPath,
      });

      expect(step).toEqual(
        expect.objectContaining({
          command: expect.stringContaining('brew install'),
          status: 'pass',
        }),
      );
      expect(commands).toContain('brew link --overwrite vanrot');
      expect(commands.indexOf('brew link --overwrite vanrot')).toBeLessThan(
        commands.indexOf('brew test vanrot/local/vanrot'),
      );
    } finally {
      await rm(root, { force: true, recursive: true });
    }
  });
});

describe('verify-release-dry-run package workflows and reports', () => {
  it('creates stable tarball names and consumer dependency specifiers', () => {
    const runtimePackage = {
      name: '@vanrot/runtime',
      directoryName: 'runtime',
      manifest: { name: '@vanrot/runtime', version: '1.2.3' },
    };

    expect(createTarballName(runtimePackage)).toBe('vanrot-runtime-1.2.3.tgz');
    expect(createPackageSpecifier('/tmp/artifacts/vanrot-runtime-1.2.3.tgz')).toBe(
      'file:/tmp/artifacts/vanrot-runtime-1.2.3.tgz',
    );
    expect(createTarballSpecifiers([runtimePackage], '/tmp/artifacts')).toEqual({
      '@vanrot/runtime': 'file:/tmp/artifacts/vanrot-runtime-1.2.3.tgz',
    });
  });

  it('writes consumer manifests with packed tarball dependencies', () => {
    expect(
      createWorkspacePackageJson({
        name: 'vanrot-release-pnpm-consumer',
        tarballSpecifiers: {
          '@vanrot/runtime': 'file:/tmp/artifacts/vanrot-runtime-1.2.3.tgz',
        },
      }),
    ).toEqual({
      name: 'vanrot-release-pnpm-consumer',
      private: true,
      type: 'module',
      scripts: {
        build: 'vite build',
        smoke: 'node smoke.mjs',
      },
      packageManager: 'pnpm@11.1.3',
      dependencies: {
        '@vanrot/runtime': 'file:/tmp/artifacts/vanrot-runtime-1.2.3.tgz',
        typescript: '^5.9.3',
        vite: '^8.0.10',
        vitest: '^4.0.14',
      },
      devDependencies: {},
    });
    expect(
      createPnpmWorkspaceYaml({
        '@vanrot/runtime': 'file:/tmp/artifacts/vanrot-runtime-1.2.3.tgz',
      }),
    ).toBe(
      'packages:\n  - .\noverrides:\n  "@vanrot/runtime": "file:/tmp/artifacts/vanrot-runtime-1.2.3.tgz"\n',
    );
  });

  it('creates JSON and Markdown reports for failed or kept runs', async () => {
    const root = await mkdtemp(join(tmpdir(), 'vanrot-report-'));
    const reportDirectory = join(root, '.vanrot', 'release-dry-run');
    const failedStep = createCommandStep({
      name: 'npm smoke import',
      command: 'node smoke.mjs',
      cwd: '/tmp/app',
      exitCode: 1,
      stdout: '',
      stderr: 'Cannot find package',
      required: true,
    });
    const report = createReport({
      repositoryRoot: root,
      packages: [{ name: '@vanrot/runtime' }],
      tarballs: ['/tmp/artifacts/vanrot-runtime-1.2.3.tgz'],
      steps: [failedStep],
      warnings: ['Homebrew is not installed.'],
      artifacts: [reportDirectory],
      startedAt: '2026-05-28T00:00:00.000Z',
      endedAt: '2026-05-28T00:01:00.000Z',
    });

    await writeReports({ report, reportDirectory });

    await expect(readFile(join(reportDirectory, 'report.json'), 'utf8')).resolves.toContain(
      '"success": false',
    );
    await expect(readFile(join(reportDirectory, 'report.md'), 'utf8')).resolves.toContain(
      'npm smoke import',
    );
    expect(formatConsoleReport(report)).toContain('fail npm smoke import - node smoke.mjs');
  });

  it('closes command stdin so package-manager installs cannot wait for input', async () => {
    const stdinWaiter =
      'process.stdin.resume(); process.stdin.on("end", () => process.exit(0)); setTimeout(() => process.exit(2), 1000);';
    const result = await Promise.race([
      runCommand({
        name: 'stdin eof',
        command: process.execPath,
        args: ['-e', stdinWaiter],
        cwd: process.cwd(),
      }),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('command waited for stdin')), 500);
      }),
    ]);

    expect(result.status).toBe('pass');
  });
});

describe('verify-release-dry-run CLI options', () => {
  it('parses --keep and rejects unknown options', () => {
    expect(parseOptions(['--', '--keep'])).toEqual({ keep: true });
    expect(parseOptions(['--keep'])).toEqual({ keep: true });
    expect(() => parseOptions(['--wat'])).toThrow('Unknown option: --wat');
  });
});

async function writeJson(path, value) {
  await mkdir(path.split('/').slice(0, -1).join('/'), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}
