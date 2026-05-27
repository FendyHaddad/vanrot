# Phase 26 Release Dry-Run Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task in the current Vanrot workspace. Do not use subagents, worktrees, branches, staging, commits, or pushes unless the user explicitly asks. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a strict local release dry-run gate that proves packed Vanrot packages install and work in fresh consumer apps before public publishing.

**Architecture:** Keep Phase 26 repo-owned: a root verifier script orchestrates focused helper modules for metadata checks, tarball packing, consumer workflows, optional Homebrew checks, and report writing. The verifier runs in temp directories by default and keeps `.vanrot/release-dry-run/` artifacts on failure or `--keep`.

**Tech Stack:** Node.js ESM scripts, `node:child_process`, `node:fs/promises`, `node:path`, `node:os`, Vitest, pnpm, npm, optional Homebrew.

---

## Project Rules

- Work on current `main`; do not create a branch or worktree.
- Do not stage, commit, or push.
- Use guard clauses.
- Keep public CLI unchanged; this phase adds repo scripts only.
- Add no provider-specific AI calls.
- Keep release artifacts out of git.
- Update phase docs and trackers before final verification.

## File Map

- Create: `scripts/release-dry-run/model.mjs`
  - Defines step statuses, report models, summary helpers, and failure classification.
- Create: `scripts/release-dry-run/metadata.mjs`
  - Discovers public packages and validates package metadata.
- Create: `scripts/release-dry-run/artifacts.mjs`
  - Creates temp/kept workspaces, copies failure artifacts, and cleans successful runs.
- Create: `scripts/release-dry-run/runner.mjs`
  - Runs commands with captured stdout/stderr tails and stable exit-code records.
- Create: `scripts/release-dry-run/package-workflows.mjs`
  - Packs packages, writes consumer apps, runs pnpm and npm smoke workflows.
- Create: `scripts/release-dry-run/homebrew.mjs`
  - Detects Homebrew and runs or skips the local formula check.
- Create: `scripts/release-dry-run/reports.mjs`
  - Writes `report.json`, `report.md`, and formats concise console output.
- Create: `scripts/verify-release-dry-run.mjs`
  - Orchestrates the full verifier.
- Create: `scripts/verify-release-dry-run.test.mjs`
  - Unit coverage for metadata, report shape, artifact retention, command result handling, and Homebrew classification.
- Modify: `package.json`
  - Add `verify:release-dry-run`.
  - Add verifier tests to `test:phase-docs`.
  - Include `verify:release-dry-run` in root `verify`.
- Modify: `.gitignore`
  - Ignore `.vanrot/release-dry-run/`.
- Modify: `packages/*/package.json`
  - Add release `engines` metadata to every public package.
- Modify: `docs/superpowers/feature-maturity.md`
  - Mark Phase 26 line and release-dry-run rows when implementation passes.
- Modify: `docs/superpowers/final-tdd-inventory.md`
  - Add release dry-run verifier and package metadata coverage.
- Modify: `docs/vanrot-presentation.html`
  - Mark Phase 26 as active or done according to completion state.

## Release Metadata Contract

Use this shared Node engine for root and public packages:

```json
{
  "engines": {
    "node": ">=20.19.0"
  }
}
```

Public packages are every non-private package in `packages/*/package.json`. Current public package names:

```text
@vanrot/ai
@vanrot/cli
@vanrot/compiler
@vanrot/config
@vanrot/devtools
@vanrot/router
@vanrot/runtime
@vanrot/testing
@vanrot/ui
@vanrot/vite-plugin
```

---

### Task 1: Add Release Dry-Run Models And Report Shape

**Files:**
- Create: `scripts/release-dry-run/model.mjs`
- Create: `scripts/verify-release-dry-run.test.mjs`

- [x] **Step 1: Write failing tests for step summaries and failure classification**

Add this test block to `scripts/verify-release-dry-run.test.mjs`:

```js
import { describe, expect, it } from 'vitest';
import {
  createCommandStep,
  createSkippedStep,
  failedRequiredSteps,
  summarizeStep,
} from './release-dry-run/model.mjs';

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
          name: 'npm smoke',
          command: 'npm test',
          cwd: '/tmp/npm-app',
          exitCode: 1,
          stdout: '',
          stderr: 'missing export',
          required: true,
        }),
      ),
    ).toBe('fail npm smoke - npm test');

    expect(
      summarizeStep(
        createSkippedStep({
          name: 'homebrew install',
          reason: 'Homebrew is not installed.',
        }),
      ),
    ).toBe('skip homebrew install - Homebrew is not installed.');
  });

  it('treats required command failures as blocking and skips as non-blocking', () => {
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
    ];

    expect(failedRequiredSteps(steps).map((step) => step.name)).toEqual([
      'pnpm consumer build',
    ]);
  });
});
```

- [x] **Step 2: Run the failing tests**

Run:

```bash
vitest run scripts/verify-release-dry-run.test.mjs
```

Expected: fail because `scripts/release-dry-run/model.mjs` does not exist.

- [x] **Step 3: Implement the model helpers**

Create `scripts/release-dry-run/model.mjs`:

```js
export function createCommandStep({
  name,
  command,
  cwd,
  exitCode,
  stdout,
  stderr,
  required,
}) {
  return {
    type: 'command',
    name,
    command,
    cwd,
    exitCode,
    stdoutTail: tail(stdout),
    stderrTail: tail(stderr),
    required,
    status: exitCode === 0 ? 'pass' : 'fail',
  };
}

export function createPassedStep({ name, message }) {
  return {
    type: 'check',
    name,
    status: 'pass',
    message,
    required: true,
  };
}

export function createFailedStep({ name, message }) {
  return {
    type: 'check',
    name,
    status: 'fail',
    message,
    required: true,
  };
}

export function createSkippedStep({ name, reason }) {
  return {
    type: 'skip',
    name,
    status: 'skip',
    reason,
    required: false,
  };
}

export function failedRequiredSteps(steps) {
  return steps.filter((step) => step.required && step.status === 'fail');
}

export function summarizeStep(step) {
  if (step.status === 'skip') {
    return `skip ${step.name} - ${step.reason}`;
  }

  if (step.status === 'fail' && step.command !== undefined) {
    return `fail ${step.name} - ${step.command}`;
  }

  if (step.status === 'fail') {
    return `fail ${step.name} - ${step.message}`;
  }

  return `pass ${step.name}`;
}

export function tail(value, maxLines = 30) {
  return String(value)
    .split('\n')
    .slice(-maxLines)
    .join('\n')
    .trim();
}
```

- [x] **Step 4: Verify tests pass**

Run:

```bash
vitest run scripts/verify-release-dry-run.test.mjs
```

Expected: pass.

---

### Task 2: Add Package Discovery And Metadata Validation

**Files:**
- Create: `scripts/release-dry-run/metadata.mjs`
- Modify: `scripts/verify-release-dry-run.test.mjs`
- Modify: `package.json`
- Modify: `packages/ai/package.json`
- Modify: `packages/cli/package.json`
- Modify: `packages/compiler/package.json`
- Modify: `packages/config/package.json`
- Modify: `packages/devtools/package.json`
- Modify: `packages/router/package.json`
- Modify: `packages/runtime/package.json`
- Modify: `packages/testing/package.json`
- Modify: `packages/ui/package.json`
- Modify: `packages/vite-plugin/package.json`

- [x] **Step 1: Add metadata validation tests**

Append this import:

```js
import {
  discoverPublicPackagesFromManifests,
  validatePackageManifest,
} from './release-dry-run/metadata.mjs';
```

Append this test block:

```js
describe('release package metadata', () => {
  it('discovers only non-private packages', () => {
    const packages = discoverPublicPackagesFromManifests([
      {
        directory: '/repo/packages/runtime',
        manifest: {
          name: '@vanrot/runtime',
          version: '0.0.0',
          exports: { '.': './dist/index.js' },
          files: ['dist'],
          engines: { node: '>=20.19.0' },
        },
      },
      {
        directory: '/repo/apps/site',
        manifest: {
          name: '@vanrot/site',
          private: true,
        },
      },
    ]);

    expect(packages.map((item) => item.manifest.name)).toEqual(['@vanrot/runtime']);
  });

  it('requires release-critical metadata', () => {
    expect(
      validatePackageManifest({
        name: '@vanrot/cli',
        version: '0.0.0',
        exports: { '.': './dist/index.js' },
        bin: { vr: './dist/bin.js' },
        files: ['dist'],
        engines: { node: '>=20.19.0' },
      }),
    ).toEqual([]);

    expect(
      validatePackageManifest({
        name: '@vanrot/runtime',
        version: '0.0.0',
        exports: undefined,
        files: [],
        engines: undefined,
      }),
    ).toEqual([
      '@vanrot/runtime missing exports',
      '@vanrot/runtime missing files',
      '@vanrot/runtime missing engines.node',
    ]);
  });
});
```

- [x] **Step 2: Run the failing tests**

Run:

```bash
vitest run scripts/verify-release-dry-run.test.mjs
```

Expected: fail because `metadata.mjs` is missing.

- [x] **Step 3: Implement metadata helpers**

Create `scripts/release-dry-run/metadata.mjs`:

```js
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

export async function discoverPublicPackages(root) {
  const packageRoot = join(root, 'packages');
  const entries = await readdir(packageRoot, { withFileTypes: true });
  const manifests = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const directory = join(packageRoot, entry.name);
    const manifest = JSON.parse(await readFile(join(directory, 'package.json'), 'utf8'));
    manifests.push({ directory, manifest });
  }

  return discoverPublicPackagesFromManifests(manifests);
}

export function discoverPublicPackagesFromManifests(manifests) {
  return manifests.filter((item) => item.manifest.private !== true);
}

export function validatePackages(packages) {
  return packages.flatMap((item) => validatePackageManifest(item.manifest));
}

export function validatePackageManifest(manifest) {
  const failures = [];
  const packageName = manifest.name ?? '<unnamed package>';

  if (typeof manifest.name !== 'string' || !manifest.name.startsWith('@vanrot/')) {
    failures.push(`${packageName} invalid package name`);
  }

  if (typeof manifest.version !== 'string' || manifest.version.length === 0) {
    failures.push(`${packageName} missing version`);
  }

  if (manifest.exports === undefined) {
    failures.push(`${packageName} missing exports`);
  }

  if (!Array.isArray(manifest.files) || manifest.files.length === 0) {
    failures.push(`${packageName} missing files`);
  }

  if (manifest.engines?.node !== '>=20.19.0') {
    failures.push(`${packageName} missing engines.node`);
  }

  if (manifest.bin !== undefined && typeof manifest.bin !== 'object') {
    failures.push(`${packageName} invalid bin`);
  }

  return failures;
}
```

- [x] **Step 4: Add engines metadata to root and packages**

Add this object to root `package.json` and every public `packages/*/package.json` that lacks it:

```json
"engines": {
  "node": ">=20.19.0"
}
```

Keep existing fields and ordering close to each file's current style.

- [x] **Step 5: Verify metadata tests pass**

Run:

```bash
vitest run scripts/verify-release-dry-run.test.mjs
```

Expected: pass.

---

### Task 3: Add Artifact Workspace And Command Runner

**Files:**
- Create: `scripts/release-dry-run/artifacts.mjs`
- Create: `scripts/release-dry-run/runner.mjs`
- Modify: `scripts/verify-release-dry-run.test.mjs`
- Modify: `.gitignore`

- [x] **Step 1: Add artifact and runner tests**

Append these imports:

```js
import { shouldKeepArtifacts, releaseDryRunDirectory } from './release-dry-run/artifacts.mjs';
import { commandText, runCommandWithRunner } from './release-dry-run/runner.mjs';
```

Append this test block:

```js
describe('release dry-run artifacts and commands', () => {
  it('keeps artifacts on failure or explicit keep', () => {
    expect(shouldKeepArtifacts({ keep: false, failed: false })).toBe(false);
    expect(shouldKeepArtifacts({ keep: true, failed: false })).toBe(true);
    expect(shouldKeepArtifacts({ keep: false, failed: true })).toBe(true);
  });

  it('uses the repo-local keep directory', () => {
    expect(releaseDryRunDirectory('/repo')).toBe('/repo/.vanrot/release-dry-run');
  });

  it('records command results through an injectable runner', async () => {
    const step = await runCommandWithRunner({
      name: 'npm smoke',
      command: 'npm',
      args: ['test'],
      cwd: '/tmp/npm-app',
      required: true,
      runner: async () => ({ exitCode: 1, stdout: '', stderr: 'boom' }),
    });

    expect(commandText('npm', ['test'])).toBe('npm test');
    expect(step).toMatchObject({
      name: 'npm smoke',
      command: 'npm test',
      cwd: '/tmp/npm-app',
      exitCode: 1,
      status: 'fail',
      required: true,
    });
  });
});
```

- [x] **Step 2: Run the failing tests**

Run:

```bash
vitest run scripts/verify-release-dry-run.test.mjs
```

Expected: fail because artifact and runner modules are missing.

- [x] **Step 3: Implement artifact helpers**

Create `scripts/release-dry-run/artifacts.mjs`:

```js
import { cp, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export function releaseDryRunDirectory(root) {
  return join(root, '.vanrot', 'release-dry-run');
}

export function shouldKeepArtifacts({ keep, failed }) {
  return keep || failed;
}

export async function createWorkDirectory(root, keep) {
  if (keep) {
    const directory = releaseDryRunDirectory(root);
    await rm(directory, { recursive: true, force: true });
    await mkdir(directory, { recursive: true });
    return { directory, keptPath: directory, temporary: false };
  }

  const directory = await mkdtemp(join(tmpdir(), 'vanrot-release-dry-run-'));
  return { directory, keptPath: releaseDryRunDirectory(root), temporary: true };
}

export async function finalizeWorkDirectory({ workDirectory, keep, failed }) {
  if (shouldKeepArtifacts({ keep, failed })) {
    if (workDirectory.temporary) {
      await rm(workDirectory.keptPath, { recursive: true, force: true });
      await mkdir(workDirectory.keptPath, { recursive: true });
      await cp(workDirectory.directory, workDirectory.keptPath, { recursive: true });
      await rm(workDirectory.directory, { recursive: true, force: true });
      return workDirectory.keptPath;
    }

    return workDirectory.directory;
  }

  await rm(workDirectory.directory, { recursive: true, force: true });
  return undefined;
}
```

- [x] **Step 4: Implement command runner**

Create `scripts/release-dry-run/runner.mjs`:

```js
import { execFile } from 'node:child_process';
import { createCommandStep } from './model.mjs';

export function commandText(command, args) {
  return [command, ...args].join(' ');
}

export async function runCommand({ name, command, args, cwd, required = true }) {
  return runCommandWithRunner({
    name,
    command,
    args,
    cwd,
    required,
    runner: () => execFilePromise(command, args, cwd),
  });
}

export async function runCommandWithRunner({ name, command, args, cwd, required, runner }) {
  const result = await runner();

  return createCommandStep({
    name,
    command: commandText(command, args),
    cwd,
    exitCode: result.exitCode,
    stdout: result.stdout,
    stderr: result.stderr,
    required,
  });
}

function execFilePromise(command, args, cwd) {
  return new Promise((resolve) => {
    execFile(command, args, { cwd, maxBuffer: 1024 * 1024 * 20 }, (error, stdout, stderr) => {
      resolve({
        exitCode: typeof error?.code === 'number' ? error.code : 0,
        stdout,
        stderr,
      });
    });
  });
}
```

- [x] **Step 5: Ignore kept release dry-run artifacts**

Add this line to `.gitignore`:

```gitignore
.vanrot/release-dry-run/
```

- [x] **Step 6: Verify tests pass**

Run:

```bash
vitest run scripts/verify-release-dry-run.test.mjs
```

Expected: pass.

---

### Task 4: Add Package Packing And Consumer Workflow Helpers

**Files:**
- Create: `scripts/release-dry-run/package-workflows.mjs`
- Modify: `scripts/verify-release-dry-run.test.mjs`

- [x] **Step 1: Add tarball and consumer manifest tests**

Append these imports:

```js
import {
  npmImportSmokeSource,
  packageTarballName,
  rewriteVanrotDependencies,
  tarballDependencyMap,
} from './release-dry-run/package-workflows.mjs';
```

Append this test block:

```js
describe('release package workflows', () => {
  it('creates stable tarball names for scoped packages', () => {
    expect(packageTarballName('@vanrot/runtime', '0.0.0')).toBe('vanrot-runtime-0.0.0.tgz');
  });

  it('maps Vanrot dependencies to local tarballs', () => {
    const map = tarballDependencyMap('/work/tarballs', [
      { manifest: { name: '@vanrot/runtime', version: '0.0.0' } },
      { manifest: { name: '@vanrot/cli', version: '0.0.0' } },
    ]);

    expect(map).toEqual({
      '@vanrot/runtime': 'file:/work/tarballs/vanrot-runtime-0.0.0.tgz',
      '@vanrot/cli': 'file:/work/tarballs/vanrot-cli-0.0.0.tgz',
    });
  });

  it('rewrites generated app dependencies to tarball dependencies', () => {
    const manifest = {
      dependencies: {
        '@vanrot/runtime': 'latest',
        '@vanrot/router': '^0.0.0',
        vite: '^8.0.0',
      },
      devDependencies: {
        '@vanrot/vite-plugin': 'latest',
      },
    };

    expect(
      rewriteVanrotDependencies(manifest, {
        '@vanrot/runtime': 'file:/work/vanrot-runtime-0.0.0.tgz',
        '@vanrot/router': 'file:/work/vanrot-router-0.0.0.tgz',
        '@vanrot/vite-plugin': 'file:/work/vanrot-vite-plugin-0.0.0.tgz',
      }),
    ).toEqual({
      dependencies: {
        '@vanrot/runtime': 'file:/work/vanrot-runtime-0.0.0.tgz',
        '@vanrot/router': 'file:/work/vanrot-router-0.0.0.tgz',
        vite: '^8.0.0',
      },
      devDependencies: {
        '@vanrot/vite-plugin': 'file:/work/vanrot-vite-plugin-0.0.0.tgz',
      },
    });
  });

  it('creates npm import smoke source for public package entrypoints', () => {
    expect(
      npmImportSmokeSource([
        { manifest: { name: '@vanrot/runtime' } },
        { manifest: { name: '@vanrot/compiler' } },
      ]),
    ).toContain("await import('@vanrot/runtime');");
  });
});
```

- [x] **Step 2: Run the failing tests**

Run:

```bash
vitest run scripts/verify-release-dry-run.test.mjs
```

Expected: fail because `package-workflows.mjs` is missing.

- [x] **Step 3: Implement pure package workflow helpers**

Create the first version of `scripts/release-dry-run/package-workflows.mjs`:

```js
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { runCommand } from './runner.mjs';

export function packageTarballName(packageName, version) {
  return `${packageName.replace('@', '').replace('/', '-')}-${version}.tgz`;
}

export function tarballDependencyMap(tarballDirectory, packages) {
  return Object.fromEntries(
    packages.map((item) => [
      item.manifest.name,
      `file:${join(tarballDirectory, packageTarballName(item.manifest.name, item.manifest.version))}`,
    ]),
  );
}

export function rewriteVanrotDependencies(manifest, dependencyMap) {
  return {
    ...manifest,
    dependencies: rewriteDependencyBlock(manifest.dependencies, dependencyMap),
    devDependencies: rewriteDependencyBlock(manifest.devDependencies, dependencyMap),
  };
}

export function npmImportSmokeSource(packages) {
  return [
    "console.log('vanrot npm smoke start');",
    ...packages.map((item) => `await import('${item.manifest.name}');`),
    "console.log('vanrot npm smoke done');",
    '',
  ].join('\n');
}

export async function packPackages({ root, packages, tarballDirectory }) {
  await mkdir(tarballDirectory, { recursive: true });
  const steps = [];

  for (const item of packages) {
    steps.push(
      await runCommand({
        name: `pack ${item.manifest.name}`,
        command: 'pnpm',
        args: ['pack', '--pack-destination', tarballDirectory],
        cwd: item.directory,
        required: true,
      }),
    );
  }

  return { root, steps };
}

export async function runPnpmConsumerWorkflow({ root, workDirectory, packages }) {
  const tarballDirectory = join(workDirectory, 'tarballs');
  const consumerDirectory = join(workDirectory, 'consumer-pnpm');
  const appDirectory = join(consumerDirectory, 'release-smoke');
  const dependencyMap = tarballDependencyMap(tarballDirectory, packages);
  const steps = [];

  await mkdir(consumerDirectory, { recursive: true });
  steps.push(await runCommand({ name: 'pnpm consumer init', command: 'pnpm', args: ['init'], cwd: consumerDirectory, required: true }));
  steps.push(await runCommand({ name: 'pnpm consumer install cli', command: 'pnpm', args: ['add', dependencyMap['@vanrot/cli']], cwd: consumerDirectory, required: true }));
  steps.push(await runCommand({ name: 'pnpm consumer create app', command: 'pnpm', args: ['exec', 'vr', 'create', 'release-smoke'], cwd: consumerDirectory, required: true }));

  await rewriteGeneratedAppManifest(appDirectory, dependencyMap);

  steps.push(await runCommand({ name: 'pnpm generated app install', command: 'pnpm', args: ['install'], cwd: appDirectory, required: true }));
  steps.push(await runCommand({ name: 'pnpm generated app build', command: 'pnpm', args: ['exec', 'vr', 'build'], cwd: appDirectory, required: true }));
  steps.push(await runCommand({ name: 'pnpm generated app ai verify', command: 'pnpm', args: ['exec', 'vr', 'ai', 'verify'], cwd: root, required: true }));

  return steps;
}

export async function runNpmConsumerSmoke({ workDirectory, packages }) {
  const tarballDirectory = join(workDirectory, 'tarballs');
  const consumerDirectory = join(workDirectory, 'consumer-npm');
  const dependencyMap = tarballDependencyMap(tarballDirectory, packages);
  const packageManifest = {
    name: 'vanrot-npm-release-smoke',
    private: true,
    type: 'module',
    dependencies: dependencyMap,
  };
  const steps = [];

  await mkdir(consumerDirectory, { recursive: true });
  await writeFile(join(consumerDirectory, 'package.json'), `${JSON.stringify(packageManifest, null, 2)}\n`);
  await writeFile(join(consumerDirectory, 'smoke.mjs'), npmImportSmokeSource(packages));

  steps.push(await runCommand({ name: 'npm consumer install', command: 'npm', args: ['install'], cwd: consumerDirectory, required: true }));
  steps.push(await runCommand({ name: 'npm consumer import smoke', command: 'node', args: ['smoke.mjs'], cwd: consumerDirectory, required: true }));

  return steps;
}

async function rewriteGeneratedAppManifest(appDirectory, dependencyMap) {
  const manifestPath = join(appDirectory, 'package.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  await writeFile(manifestPath, `${JSON.stringify(rewriteVanrotDependencies(manifest, dependencyMap), null, 2)}\n`);
}

function rewriteDependencyBlock(block, dependencyMap) {
  if (block === undefined) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(block).map(([name, version]) => [
      name,
      dependencyMap[name] ?? version,
    ]),
  );
}
```

- [x] **Step 4: Verify helper tests pass**

Run:

```bash
vitest run scripts/verify-release-dry-run.test.mjs
```

Expected: pass.

---

### Task 5: Add Homebrew Classification And Local Check

**Files:**
- Create: `scripts/release-dry-run/homebrew.mjs`
- Modify: `scripts/verify-release-dry-run.test.mjs`

- [x] **Step 1: Add Homebrew tests**

Append this import:

```js
import { classifyHomebrewResult } from './release-dry-run/homebrew.mjs';
```

Append this test block:

```js
describe('release Homebrew check', () => {
  it('skips when Homebrew is not installed', () => {
    expect(classifyHomebrewResult({ brewPath: undefined })).toEqual({
      status: 'skip',
      reason: 'Homebrew is not installed.',
    });
  });

  it('fails when Homebrew exists but local install fails', () => {
    expect(classifyHomebrewResult({ brewPath: '/opt/homebrew/bin/brew', exitCode: 1 })).toEqual({
      status: 'fail',
      reason: 'Homebrew local formula check failed.',
    });
  });

  it('passes when Homebrew exists and local install succeeds', () => {
    expect(classifyHomebrewResult({ brewPath: '/opt/homebrew/bin/brew', exitCode: 0 })).toEqual({
      status: 'pass',
      reason: 'Homebrew local formula check passed.',
    });
  });
});
```

- [x] **Step 2: Run the failing tests**

Run:

```bash
vitest run scripts/verify-release-dry-run.test.mjs
```

Expected: fail because `homebrew.mjs` is missing.

- [x] **Step 3: Implement Homebrew helper**

Create `scripts/release-dry-run/homebrew.mjs`:

```js
import { access, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createCommandStep, createPassedStep, createSkippedStep } from './model.mjs';
import { runCommand } from './runner.mjs';

const brewCandidates = ['/opt/homebrew/bin/brew', '/usr/local/bin/brew'];

export async function runHomebrewCheck({ workDirectory, cliTarballPath }) {
  const brewPath = await findBrew();

  if (brewPath === undefined) {
    return createSkippedStep({
      name: 'homebrew local install',
      reason: 'Homebrew is not installed.',
    });
  }

  const formulaPath = join(workDirectory, 'vanrot.rb');
  await writeFile(formulaPath, formulaSource(cliTarballPath));

  const step = await runCommand({
    name: 'homebrew local install',
    command: brewPath,
    args: ['install', '--formula', formulaPath],
    cwd: workDirectory,
    required: true,
  });

  return createCommandStep({
    ...step,
    required: true,
  });
}

export function classifyHomebrewResult({ brewPath, exitCode }) {
  if (brewPath === undefined) {
    return { status: 'skip', reason: 'Homebrew is not installed.' };
  }

  if (exitCode !== 0) {
    return { status: 'fail', reason: 'Homebrew local formula check failed.' };
  }

  return { status: 'pass', reason: 'Homebrew local formula check passed.' };
}

export function formulaSource(cliTarballPath) {
  return [
    'class Vanrot < Formula',
    '  desc \"Vanrot local release dry-run formula\"',
    '  homepage \"https://vanrot.vankode.com\"',
    `  url \"file://${cliTarballPath}\"`,
    '  version \"0.0.0\"',
    '  depends_on \"node\"',
    '  def install',
    '    system \"npm\", \"install\", \"--global-style\", \"--prefix\", libexec, cached_download',
    '    bin.install_symlink Dir[libexec/\"bin/*\"]',
    '  end',
    '  test do',
    '    system \"#{bin}/vr\", \"--help\"',
    '  end',
    'end',
    '',
  ].join('\n');
}

async function findBrew() {
  for (const candidate of brewCandidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      continue;
    }
  }

  return undefined;
}
```

- [x] **Step 4: Verify tests pass**

Run:

```bash
vitest run scripts/verify-release-dry-run.test.mjs
```

Expected: pass.

---

### Task 6: Add Report Writers

**Files:**
- Create: `scripts/release-dry-run/reports.mjs`
- Modify: `scripts/verify-release-dry-run.test.mjs`

- [x] **Step 1: Add report tests**

Append this import:

```js
import { createReport, markdownReport, textSummary } from './release-dry-run/reports.mjs';
```

Append this test block:

```js
describe('release dry-run reports', () => {
  it('creates machine and human summaries', () => {
    const report = createReport({
      root: '/repo',
      startedAt: '2026-05-28T00:00:00.000Z',
      endedAt: '2026-05-28T00:01:00.000Z',
      packages: [{ manifest: { name: '@vanrot/runtime', version: '0.0.0' } }],
      steps: [
        createCommandStep({
          name: 'pnpm consumer build',
          command: 'pnpm build',
          cwd: '/tmp/app',
          exitCode: 1,
          stdout: '',
          stderr: 'build failed',
          required: true,
        }),
      ],
      artifactPath: '/repo/.vanrot/release-dry-run',
    });

    expect(report.ok).toBe(false);
    expect(textSummary(report)).toContain('Release dry-run failed.');
    expect(markdownReport(report)).toContain('## Failed Steps');
    expect(markdownReport(report)).toContain('pnpm consumer build');
  });
});
```

- [x] **Step 2: Run failing tests**

Run:

```bash
vitest run scripts/verify-release-dry-run.test.mjs
```

Expected: fail because `reports.mjs` is missing.

- [x] **Step 3: Implement report helpers**

Create `scripts/release-dry-run/reports.mjs`:

```js
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { failedRequiredSteps, summarizeStep } from './model.mjs';

export function createReport({ root, startedAt, endedAt, packages, steps, artifactPath }) {
  const failedSteps = failedRequiredSteps(steps);

  return {
    ok: failedSteps.length === 0,
    startedAt,
    endedAt,
    root,
    packages: packages.map((item) => ({
      name: item.manifest.name,
      version: item.manifest.version,
    })),
    steps,
    failedSteps,
    artifactPath,
  };
}

export function textSummary(report) {
  const heading = report.ok ? 'Release dry-run passed.' : 'Release dry-run failed.';
  const lines = [heading, ...report.steps.map((step) => `- ${summarizeStep(step)}`)];

  if (report.artifactPath !== undefined) {
    lines.push(`Artifacts: ${report.artifactPath}`);
  }

  return lines.join('\n');
}

export function markdownReport(report) {
  const failed = report.failedSteps.length === 0
    ? 'No failed required steps.'
    : report.failedSteps.map((step) => `- ${step.name}: ${step.command ?? step.message}`).join('\n');

  return [
    `# Vanrot Release Dry-Run ${report.ok ? 'Passed' : 'Failed'}`,
    '',
    `- Started: ${report.startedAt}`,
    `- Ended: ${report.endedAt}`,
    `- Root: ${report.root}`,
    report.artifactPath === undefined ? '- Artifacts: cleaned' : `- Artifacts: ${report.artifactPath}`,
    '',
    '## Steps',
    '',
    ...report.steps.map((step) => `- ${summarizeStep(step)}`),
    '',
    '## Failed Steps',
    '',
    failed,
    '',
  ].join('\n');
}

export async function writeReports(directory, report) {
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(join(directory, 'report.md'), markdownReport(report));
}
```

- [x] **Step 4: Verify tests pass**

Run:

```bash
vitest run scripts/verify-release-dry-run.test.mjs
```

Expected: pass.

---

### Task 7: Add Main Release Dry-Run Verifier

**Files:**
- Create: `scripts/verify-release-dry-run.mjs`
- Modify: `scripts/verify-release-dry-run.test.mjs`
- Modify: `package.json`

- [x] **Step 1: Add CLI option parsing test**

Append this import:

```js
import { parseReleaseDryRunArgs } from './verify-release-dry-run.mjs';
```

Append this test block:

```js
describe('verify-release-dry-run entrypoint', () => {
  it('parses keep mode', () => {
    expect(parseReleaseDryRunArgs(['--keep'])).toEqual({ keep: true });
    expect(parseReleaseDryRunArgs([])).toEqual({ keep: false });
  });
});
```

- [x] **Step 2: Run failing tests**

Run:

```bash
vitest run scripts/verify-release-dry-run.test.mjs
```

Expected: fail because `scripts/verify-release-dry-run.mjs` is missing.

- [x] **Step 3: Implement verifier orchestration**

Create `scripts/verify-release-dry-run.mjs`:

```js
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createFailedStep, createPassedStep, failedRequiredSteps } from './release-dry-run/model.mjs';
import { discoverPublicPackages, validatePackages } from './release-dry-run/metadata.mjs';
import { createWorkDirectory, finalizeWorkDirectory } from './release-dry-run/artifacts.mjs';
import { packPackages, packageTarballName, runNpmConsumerSmoke, runPnpmConsumerWorkflow } from './release-dry-run/package-workflows.mjs';
import { runHomebrewCheck } from './release-dry-run/homebrew.mjs';
import { createReport, textSummary, writeReports } from './release-dry-run/reports.mjs';
import { runCommand } from './release-dry-run/runner.mjs';

export function parseReleaseDryRunArgs(args) {
  return { keep: args.includes('--keep') };
}

export async function verifyReleaseDryRun(root = process.cwd(), options = {}) {
  const startedAt = new Date().toISOString();
  const workDirectory = await createWorkDirectory(root, options.keep === true);
  const steps = [];
  let packages = [];
  let artifactPath;

  try {
    steps.push(await runCommand({
      name: 'repository build',
      command: 'pnpm',
      args: ['build'],
      cwd: root,
      required: true,
    }));

    packages = await discoverPublicPackages(root);
    const metadataFailures = validatePackages(packages);

    if (metadataFailures.length > 0) {
      steps.push(createFailedStep({
        name: 'package metadata',
        message: metadataFailures.join('; '),
      }));
    } else {
      steps.push(createPassedStep({
        name: 'package metadata',
        message: `${packages.length} public packages validated.`,
      }));
    }

    const tarballDirectory = join(workDirectory.directory, 'tarballs');
    await mkdir(tarballDirectory, { recursive: true });
    steps.push(...(await packPackages({ root, packages, tarballDirectory })).steps);
    steps.push(...(await runPnpmConsumerWorkflow({ root, workDirectory: workDirectory.directory, packages })));
    steps.push(...(await runNpmConsumerSmoke({ workDirectory: workDirectory.directory, packages })));

    const cliPackage = packages.find((item) => item.manifest.name === '@vanrot/cli');
    const cliTarballPath = cliPackage === undefined
      ? undefined
      : join(tarballDirectory, packageTarballName(cliPackage.manifest.name, cliPackage.manifest.version));

    if (cliTarballPath === undefined) {
      steps.push(createFailedStep({ name: 'homebrew local install', message: '@vanrot/cli tarball is missing.' }));
    } else {
      steps.push(await runHomebrewCheck({ workDirectory: workDirectory.directory, cliTarballPath }));
    }
  } finally {
    const failed = failedRequiredSteps(steps).length > 0;
    artifactPath = await finalizeWorkDirectory({ workDirectory, keep: options.keep === true, failed });
  }

  const report = createReport({
    root,
    startedAt,
    endedAt: new Date().toISOString(),
    packages,
    steps,
    artifactPath,
  });

  if (artifactPath !== undefined) {
    await writeReports(artifactPath, report);
  }

  return {
    exitCode: report.ok ? 0 : 1,
    message: textSummary(report),
    report,
  };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = await verifyReleaseDryRun(process.cwd(), parseReleaseDryRunArgs(process.argv.slice(2)));
  console.log(result.message);
  process.exitCode = result.exitCode;
}
```

- [x] **Step 4: Add package scripts**

Modify root `package.json` scripts:

```json
"test:phase-docs": "vitest run scripts/verify-phase-docs.test.mjs scripts/verify-site-docs.test.mjs scripts/verify-site-format.test.mjs scripts/verify-ai-docs.test.mjs scripts/verify-security-leaks.test.mjs scripts/verify-release-dry-run.test.mjs",
"verify:release-dry-run": "node scripts/verify-release-dry-run.mjs",
"verify": "pnpm typecheck && pnpm test && pnpm build && pnpm verify:size && pnpm verify:site-docs && pnpm verify:site-format && pnpm verify:ai-docs && pnpm verify:security-leaks && pnpm verify:phase-docs && pnpm verify:release-dry-run"
```

- [x] **Step 5: Verify unit tests pass**

Run:

```bash
vitest run scripts/verify-release-dry-run.test.mjs
```

Expected: pass.

---

### Task 8: Run And Repair The Real Release Dry-Run

**Files:**
- Modify only files needed by failures found by the real verifier.

- [x] **Step 1: Run the real verifier**

Run:

```bash
pnpm verify:release-dry-run -- --keep
```

Expected first run may fail on real packaging, generated app, npm import, or Homebrew formula details. Artifacts should be kept in `.vanrot/release-dry-run/`.

- [x] **Step 2: Inspect the report**

Run:

```bash
sed -n '1,220p' .vanrot/release-dry-run/report.md
```

Expected: readable step list with failure details.

- [x] **Step 3: Fix only the failing release-path issue**

Use the report to choose the smallest fix. Examples:

```text
If a package is missing dist files, fix its package.json files list or build output.
If generated app install fails, fix rewriteVanrotDependencies or CLI create output.
If npm import fails, fix package exports or smoke exclusions only when a package is intentionally non-importable.
If Homebrew formula fails on a present Homebrew install, fix formulaSource or command arguments.
```

- [x] **Step 4: Re-run the real verifier**

Run:

```bash
pnpm verify:release-dry-run -- --keep
```

Expected: pass or expose the next concrete release-path defect.

- [x] **Step 5: Repeat until the release dry-run passes**

Run:

```bash
pnpm verify:release-dry-run
```

Expected: pass and clean temporary artifacts on default success.

---

### Task 9: Update Phase Trackers And Release Inventory

**Files:**
- Modify: `docs/superpowers/feature-maturity.md`
- Modify: `docs/superpowers/final-tdd-inventory.md`
- Modify: `docs/vanrot-presentation.html`
- Modify: `docs/superpowers/plans/Phase-26.md`

- [x] **Step 1: Mark completed plan tasks as checked**

Update each completed task and step in this file from `- [ ]` to `- [x]` as implementation finishes.

- [x] **Step 2: Update feature maturity**

In `docs/superpowers/feature-maturity.md`, update the Phase 26 row only after the verifier passes:

```markdown
| [x] | Phase 26 | Distribution and release hardening | npm publishing dry-run, package metadata, release verification, Homebrew local check, install verification | Vanrot can be packed, installed, and smoke-tested from release-like artifacts before publishing. |
```

Keep Phase 17-22 post-production rows unchecked.

- [x] **Step 3: Update final TDD inventory**

Add rows to `docs/superpowers/final-tdd-inventory.md` for:

```markdown
| release | `verify:release-dry-run` | Production-Ready | Packs public packages, installs packed artifacts into pnpm and npm consumer apps, checks metadata, reports failures, and runs Homebrew local verification when available. | Phase 26 | Runs inside root `pnpm verify`. |
| release | public package metadata | Production-Ready | Every public package declares exports, files, engines, versions, bins where relevant, and dependency shape suitable for package consumers. | Phase 26 | Covered by `scripts/release-dry-run/metadata.mjs`. |
| release | release dry-run reports | Production-Ready | Failure and kept runs write `.vanrot/release-dry-run/report.json` and `report.md` with command steps, warnings, and output tails. | Phase 26 | Successful default runs clean temporary artifacts. |
```

- [x] **Step 4: Update presentation roadmap**

In `docs/vanrot-presentation.html`, mark Phase 26 as completed only after `pnpm verify` passes with the release dry-run included. Keep the slide language short:

```text
Phase 26: Distribution and release hardening
Release dry-run gate verifies packed packages, consumer installs, npm smoke, and Homebrew local checks.
```

- [x] **Step 5: Run phase docs guard**

Run:

```bash
pnpm verify:phase-docs
```

Expected: `Phase documentation verification passed.`

---

### Task 10: Final Verification

**Files:**
- No new files unless verification exposes a real defect.

- [x] **Step 1: Run release dry-run unit tests**

Run:

```bash
vitest run scripts/verify-release-dry-run.test.mjs
```

Expected: pass.

- [x] **Step 2: Run the release dry-run gate**

Run:

```bash
pnpm verify:release-dry-run
```

Expected: pass. If Homebrew is missing, output must include an explicit skip. If Homebrew exists, the Homebrew step must pass.

- [x] **Step 3: Run full verification**

Run:

```bash
pnpm verify
```

Expected: pass with `verify:release-dry-run` included.

- [x] **Step 4: Run security and audit checks**

Run:

```bash
pnpm audit --audit-level moderate
pnpm audit:core
git diff --check
```

Expected:

```text
No known vulnerabilities found
Test Files  4 passed
EXIT_CODE:0 for git diff --check
```

- [x] **Step 5: Report final git state without staging**

Run:

```bash
git status --short --branch
```

Expected: working tree shows Phase 26 changes only. Do not stage or commit.
