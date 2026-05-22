# Phase 13 Project Configuration System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a production-ready `vanrot.config.ts` system that is typed, validated, shared by CLI and Vite plugin, install-aware, and recoverable without Git.

**Architecture:** Add a new `@vanrot/config` package as the single owner for config types, defaults, loading, validation, diagnostics, migration, editing, and recovery. Wire `@vanrot/cli` and `@vanrot/vite-plugin` to consume the same normalized loader output so config behavior is consistent everywhere. Roll out features by slice (`13A` to `13E`) with failing tests first, minimal implementation next, then integration and docs updates.

**Tech Stack:** TypeScript, Vitest, Vite plugin API, Node.js filesystem APIs, `typescript` AST API for config edits, pnpm workspace references.

---

## Project Rules For This Plan

- Do not create a branch or worktree.
- Do not run `git add`, `git commit`, or `git push` unless the user explicitly asks.
- Keep literals centralized in source-of-truth constants (config domains, command names, diagnostics codes, filenames).
- Use guard clauses in all new logic and parser flows.
- Keep test-first flow for each behavior: red test, minimal code, green test.

## File Structure

### New Package: `@vanrot/config`

- Create `packages/config/package.json`
  - Workspace package metadata, scripts, and exports.
- Create `packages/config/tsconfig.json`
  - Composite TypeScript build.
- Create `packages/config/src/constants.ts`
  - Single source for config filename, schema version, diagnostic prefixes, and default values.
- Create `packages/config/src/types.ts`
  - Public config types (`VanrotConfig`, domains, diagnostics, normalized output).
- Create `packages/config/src/define-config.ts`
  - `defineVanrotConfig()` helper.
- Create `packages/config/src/defaults.ts`
  - Normalization and default application.
- Create `packages/config/src/diagnostics.ts`
  - Shared config diagnostic factory and formatter.
- Create `packages/config/src/validate.ts`
  - Schema + semantic validation.
- Create `packages/config/src/load.ts`
  - Root config discovery, load, normalization, validation.
- Create `packages/config/src/migrate.ts`
  - Migration planning and canonical config rendering.
- Create `packages/config/src/recover.ts`
  - No-Git config reconstruction from project files.
- Create `packages/config/src/editor.ts`
  - AST-preserving config block insertion and update helpers.
- Create `packages/config/src/index.ts`
  - Public package exports.

### New Tests: `@vanrot/config`

- Create `packages/config/tests/define-config.test.ts`
- Create `packages/config/tests/defaults.test.ts`
- Create `packages/config/tests/validate.test.ts`
- Create `packages/config/tests/load.test.ts`
- Create `packages/config/tests/migrate.test.ts`
- Create `packages/config/tests/recover.test.ts`
- Create `packages/config/tests/editor.test.ts`
- Create `packages/config/tests/smoke.test.ts`

### CLI Integration

- Modify `packages/cli/package.json`
  - Add `@vanrot/config` dependency.
- Modify `packages/cli/tsconfig.json`
  - Add project reference to `../config`.
- Modify `packages/cli/src/commands/metadata.ts`
  - Add `config` command metadata and usages.
- Modify `packages/cli/src/cli.ts`
  - Register new `config` command handler.
- Create `packages/cli/src/commands/config.ts`
  - Parse `vr config migrate` and `vr config recover` subcommands.
- Modify `packages/cli/src/create/app-template.ts`
  - Generate canonical `vanrot.config.ts` in new apps.
- Modify `packages/cli/src/commands/dev.ts`
  - Load normalized config and pass port to Vite.
- Modify `packages/cli/src/commands/build.ts`
  - Load config and report config diagnostics before build.
- Modify `packages/cli/src/commands/test.ts`
  - Load config and report config diagnostics before tests.
- Modify `packages/cli/src/commands/doctor.ts`
  - Include config diagnostics in doctor findings output.
- Modify `packages/cli/src/add/add-ui.ts`
  - Call install-aware config editor for UI domain.

### Vite Plugin Integration

- Modify `packages/vite-plugin/package.json`
  - Add `@vanrot/config` dependency.
- Modify `packages/vite-plugin/tsconfig.json`
  - Add project reference to `../config`.
- Modify `packages/vite-plugin/src/options.ts`
  - Support `source.root` defaults from normalized Vanrot config.
- Modify `packages/vite-plugin/src/plugin.ts`
  - Load normalized Vanrot config once and reuse for include/exclude/root behavior.

### Repo Wiring And Docs

- Modify `tsconfig.json`
  - Add workspace reference to `packages/config`.
- Modify `docs/superpowers/feature-maturity.md`
  - Mark only completed Phase 13 rows and checklist items.
- Create `docs/superpowers/plans/Phase-13.md`
  - Canonical plan checklist for phase completion protocol.
- Modify `docs/superpowers/final-tdd-inventory.md`
  - Record all new config package and CLI/Vite coverage.
- Modify `docs/vanrot-presentation.html`
  - Roadmap slide alignment with maturity ledger.

---

### Task 1: Scaffold `@vanrot/config` Workspace Package (`13A` Foundation)

**Files:**
- Create: `packages/config/package.json`
- Create: `packages/config/tsconfig.json`
- Create: `packages/config/src/index.ts`
- Create: `packages/config/tests/smoke.test.ts`
- Modify: `tsconfig.json`
- Test: `packages/config/tests/smoke.test.ts`

- [ ] **Step 1: Write the failing smoke test for the new package export surface**

Create `packages/config/tests/smoke.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  configSchemaVersion,
  defineVanrotConfig,
  normalizeVanrotConfig,
  vanrotConfigFileName,
} from '../src/index.js';

describe('@vanrot/config exports', () => {
  it('exposes constants and helper functions', () => {
    expect(vanrotConfigFileName).toBe('vanrot.config.ts');
    expect(configSchemaVersion).toBe(1);

    const config = defineVanrotConfig({});
    const normalized = normalizeVanrotConfig(config);

    expect(normalized.schemaVersion).toBe(1);
    expect(normalized.source.root).toBe('src');
    expect(normalized.devServer.port).toBe(1010);
  });
});
```

- [ ] **Step 2: Run test and confirm failure before package exists**

Run:

```bash
pnpm --filter @vanrot/config test -- tests/smoke.test.ts
```

Expected: FAIL because `@vanrot/config` package is not yet defined.

- [ ] **Step 3: Create package metadata, TypeScript project, and bootstrap exports**

Create `packages/config/package.json`:

```json
{
  "name": "@vanrot/config",
  "version": "0.0.0",
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": [
    "dist"
  ],
  "dependencies": {
    "typescript": "^5.9.3"
  },
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "test": "vitest run",
    "clean": "node -e \"import('node:fs').then(({ rmSync }) => rmSync('dist', { recursive: true, force: true }))\""
  }
}
```

Create `packages/config/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "composite": true,
    "tsBuildInfoFile": "dist/tsconfig.tsbuildinfo"
  },
  "include": ["src/**/*.ts"]
}
```

Create `packages/config/src/index.ts`:

```ts
export const vanrotConfigFileName = 'vanrot.config.ts';
export const configSchemaVersion = 1;

export function defineVanrotConfig<T extends Record<string, unknown>>(config: T): T {
  return config;
}

export function normalizeVanrotConfig(
  config: { schemaVersion?: number; source?: { root?: string }; devServer?: { port?: number } } = {},
) {
  return {
    schemaVersion: config.schemaVersion ?? configSchemaVersion,
    source: { root: config.source?.root ?? 'src' },
    devServer: { port: config.devServer?.port ?? 1010 },
  };
}
```

Modify root `tsconfig.json` references:

```json
{
  "files": [],
  "references": [
    { "path": "./packages/runtime" },
    { "path": "./packages/ui" },
    { "path": "./packages/router" },
    { "path": "./packages/compiler" },
    { "path": "./packages/config" },
    { "path": "./packages/vite-plugin" },
    { "path": "./packages/cli" }
  ]
}
```

- [ ] **Step 4: Run the new package test to confirm green baseline**

Run:

```bash
pnpm --filter @vanrot/config test -- tests/smoke.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit checkpoint**

```bash
git add tsconfig.json packages/config/package.json packages/config/tsconfig.json packages/config/src/index.ts packages/config/tests/smoke.test.ts
git commit -m "feat(config): scaffold @vanrot/config package"
```

---

### Task 2: Implement Typed Config Model, Defaults, and Canonical Authoring (`13A`)

**Files:**
- Create: `packages/config/src/constants.ts`
- Create: `packages/config/src/types.ts`
- Create: `packages/config/src/define-config.ts`
- Create: `packages/config/src/defaults.ts`
- Modify: `packages/config/src/index.ts`
- Create: `packages/config/tests/define-config.test.ts`
- Create: `packages/config/tests/defaults.test.ts`
- Test: `packages/config/tests/define-config.test.ts`
- Test: `packages/config/tests/defaults.test.ts`

- [ ] **Step 1: Write failing tests for authoring helper and normalization defaults**

Create `packages/config/tests/define-config.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { defineVanrotConfig } from '../src/index.js';

describe('defineVanrotConfig', () => {
  it('preserves the provided object shape with type-safe return', () => {
    const config = defineVanrotConfig({
      schemaVersion: 1,
      source: { root: 'client' },
      devServer: { port: 2222 },
    });

    expect(config.source?.root).toBe('client');
    expect(config.devServer?.port).toBe(2222);
  });
});
```

Create `packages/config/tests/defaults.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { normalizeVanrotConfig } from '../src/index.js';

describe('normalizeVanrotConfig', () => {
  it('fills missing required domains with production defaults', () => {
    const normalized = normalizeVanrotConfig({});

    expect(normalized.schemaVersion).toBe(1);
    expect(normalized.source.root).toBe('src');
    expect(normalized.devServer.port).toBe(1010);
  });

  it('respects explicit user values', () => {
    const normalized = normalizeVanrotConfig({
      schemaVersion: 1,
      source: { root: 'app' },
      devServer: { port: 5174 },
      project: { name: 'demo' },
    });

    expect(normalized.source.root).toBe('app');
    expect(normalized.devServer.port).toBe(5174);
    expect(normalized.project?.name).toBe('demo');
  });
});
```

- [ ] **Step 2: Run tests and confirm red state**

Run:

```bash
pnpm --filter @vanrot/config test -- tests/define-config.test.ts tests/defaults.test.ts
```

Expected: FAIL because full type model and public functions are not implemented.

- [ ] **Step 3: Implement config constants, types, helper, and defaults normalizer**

Create `packages/config/src/constants.ts`:

```ts
export const vanrotConfigFileName = 'vanrot.config.ts';
export const configSchemaVersion = 1;
export const defaultSourceRoot = 'src';
export const defaultDevServerPort = 1010;

export const configDomain = {
  project: 'project',
  source: 'source',
  devServer: 'devServer',
  router: 'router',
  ui: 'ui',
  store: 'store',
  testing: 'testing',
  build: 'build',
  cache: 'cache',
  docs: 'docs',
  ai: 'ai',
  conventions: 'conventions',
} as const;
```

Create `packages/config/src/types.ts`:

```ts
export interface VanrotConfig {
  schemaVersion?: number;
  project?: { name?: string };
  source?: { root?: string };
  devServer?: { port?: number };
  router?: Record<string, unknown>;
  ui?: Record<string, unknown>;
  store?: Record<string, unknown>;
  testing?: Record<string, unknown>;
  build?: Record<string, unknown>;
  cache?: Record<string, unknown>;
  docs?: Record<string, unknown>;
  ai?: Record<string, unknown>;
  conventions?: Record<string, unknown>;
}

export interface NormalizedVanrotConfig extends Omit<VanrotConfig, 'schemaVersion' | 'source' | 'devServer'> {
  schemaVersion: number;
  source: { root: string };
  devServer: { port: number };
}
```

Create `packages/config/src/define-config.ts`:

```ts
import type { VanrotConfig } from './types.js';

export function defineVanrotConfig<T extends VanrotConfig>(config: T): T {
  return config;
}
```

Create `packages/config/src/defaults.ts`:

```ts
import { configSchemaVersion, defaultDevServerPort, defaultSourceRoot } from './constants.js';
import type { NormalizedVanrotConfig, VanrotConfig } from './types.js';

export function normalizeVanrotConfig(config: VanrotConfig = {}): NormalizedVanrotConfig {
  return {
    ...config,
    schemaVersion: config.schemaVersion ?? configSchemaVersion,
    source: {
      root: config.source?.root ?? defaultSourceRoot,
    },
    devServer: {
      port: config.devServer?.port ?? defaultDevServerPort,
    },
  };
}
```

Update `packages/config/src/index.ts`:

```ts
export {
  configDomain,
  configSchemaVersion,
  defaultDevServerPort,
  defaultSourceRoot,
  vanrotConfigFileName,
} from './constants.js';
export { defineVanrotConfig } from './define-config.js';
export { normalizeVanrotConfig } from './defaults.js';
export type { NormalizedVanrotConfig, VanrotConfig } from './types.js';
```

- [ ] **Step 4: Run the new tests and confirm green**

Run:

```bash
pnpm --filter @vanrot/config test -- tests/define-config.test.ts tests/defaults.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit checkpoint**

```bash
git add packages/config/src/constants.ts packages/config/src/types.ts packages/config/src/define-config.ts packages/config/src/defaults.ts packages/config/src/index.ts packages/config/tests/define-config.test.ts packages/config/tests/defaults.test.ts
git commit -m "feat(config): add typed config model and defaults"
```

---

### Task 3: Add Config Validation and Shared Diagnostics (`13B`)

**Files:**
- Create: `packages/config/src/diagnostics.ts`
- Create: `packages/config/src/validate.ts`
- Modify: `packages/config/src/index.ts`
- Create: `packages/config/tests/validate.test.ts`
- Test: `packages/config/tests/validate.test.ts`

- [ ] **Step 1: Write failing tests for schema and semantic diagnostics**

Create `packages/config/tests/validate.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { validateVanrotConfig } from '../src/index.js';

describe('validateVanrotConfig', () => {
  it('reports invalid port ranges as semantic errors', () => {
    const diagnostics = validateVanrotConfig({
      schemaVersion: 1,
      devServer: { port: 80_000 },
    });

    expect(diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'VRCFG003',
          severity: 'error',
        }),
      ]),
    );
  });

  it('reports unknown top-level keys as schema errors', () => {
    const diagnostics = validateVanrotConfig({
      schemaVersion: 1,
      source: { root: 'src' },
      devServer: { port: 1010 },
      ghost: true,
    } as unknown as Parameters<typeof validateVanrotConfig>[0]);

    expect(diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'VRCFG002',
          severity: 'error',
        }),
      ]),
    );
  });
});
```

- [ ] **Step 2: Run tests to confirm red state**

Run:

```bash
pnpm --filter @vanrot/config test -- tests/validate.test.ts
```

Expected: FAIL because validator and diagnostic catalog are missing.

- [ ] **Step 3: Implement diagnostic model and validation rules**

Create `packages/config/src/diagnostics.ts`:

```ts
export type ConfigDiagnosticSeverity = 'error' | 'warning';

export interface ConfigDiagnostic {
  code: string;
  severity: ConfigDiagnosticSeverity;
  message: string;
  suggestion: string;
  filePath?: string;
}

export const configDiagnosticCode = {
  loadFailed: 'VRCFG001',
  unknownTopLevelKey: 'VRCFG002',
  invalidPort: 'VRCFG003',
  migrationSuggested: 'VRCFG004',
  recoverAmbiguous: 'VRCFG005',
} as const;

export function formatConfigDiagnostic(diagnostic: ConfigDiagnostic): string {
  const location = diagnostic.filePath === undefined ? '' : `${diagnostic.filePath} `;
  const suggestion = diagnostic.suggestion === '' ? '' : `\nSuggestion: ${diagnostic.suggestion}`;
  return `${location}${diagnostic.code} ${diagnostic.message}${suggestion}`;
}
```

Create `packages/config/src/validate.ts`:

```ts
import type { VanrotConfig } from './types.js';
import { configDiagnosticCode, type ConfigDiagnostic } from './diagnostics.js';
import { configDomain } from './constants.js';

const knownTopLevelKeys = new Set<string>(['schemaVersion', ...Object.values(configDomain)]);

export function validateVanrotConfig(config: VanrotConfig): ConfigDiagnostic[] {
  const diagnostics: ConfigDiagnostic[] = [];

  for (const key of Object.keys(config)) {
    if (knownTopLevelKeys.has(key)) {
      continue;
    }

    diagnostics.push({
      code: configDiagnosticCode.unknownTopLevelKey,
      severity: 'error',
      message: `Unknown top-level config key: ${key}`,
      suggestion: 'Remove the key or move it under a supported domain.',
    });
  }

  const port = config.devServer?.port;
  if (port !== undefined && (!Number.isInteger(port) || port < 1 || port > 65_535)) {
    diagnostics.push({
      code: configDiagnosticCode.invalidPort,
      severity: 'error',
      message: `Invalid devServer.port: ${String(port)}`,
      suggestion: 'Use an integer from 1 to 65535.',
    });
  }

  return diagnostics;
}
```

Update `packages/config/src/index.ts` exports:

```ts
export {
  configDiagnosticCode,
  formatConfigDiagnostic,
  type ConfigDiagnostic,
  type ConfigDiagnosticSeverity,
} from './diagnostics.js';
export { validateVanrotConfig } from './validate.js';
```

- [ ] **Step 4: Run tests and confirm green validation behavior**

Run:

```bash
pnpm --filter @vanrot/config test -- tests/validate.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit checkpoint**

```bash
git add packages/config/src/diagnostics.ts packages/config/src/validate.ts packages/config/src/index.ts packages/config/tests/validate.test.ts
git commit -m "feat(config): add schema validation and VRCFG diagnostics"
```

---

### Task 4: Implement Config Loader with Normalization and Migration Warning (`13C`)

**Files:**
- Create: `packages/config/src/load.ts`
- Modify: `packages/config/src/index.ts`
- Create: `packages/config/tests/load.test.ts`
- Test: `packages/config/tests/load.test.ts`

- [ ] **Step 1: Write failing loader tests for missing-file fallback and defaults**

Create `packages/config/tests/load.test.ts`:

```ts
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadVanrotProjectConfig } from '../src/index.js';

async function tempRoot() {
  return mkdtemp(join(tmpdir(), 'vanrot-config-load-'));
}

describe('loadVanrotProjectConfig', () => {
  it('normalizes defaults when config file is missing', async () => {
    const cwd = await tempRoot();
    const result = await loadVanrotProjectConfig(cwd);

    expect(result.config.source.root).toBe('src');
    expect(result.config.devServer.port).toBe(1010);
    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'VRCFG004', severity: 'warning' }),
      ]),
    );
  });

  it('loads explicit values from vanrot.config.ts', async () => {
    const cwd = await tempRoot();
    await writeFile(
      join(cwd, 'vanrot.config.ts'),
      "export default { schemaVersion: 1, source: { root: 'client' }, devServer: { port: 2020 } };\n",
    );

    const result = await loadVanrotProjectConfig(cwd);
    expect(result.config.source.root).toBe('client');
    expect(result.config.devServer.port).toBe(2020);
  });
});
```

- [ ] **Step 2: Run loader tests and confirm red**

Run:

```bash
pnpm --filter @vanrot/config test -- tests/load.test.ts
```

Expected: FAIL because loader does not exist.

- [ ] **Step 3: Implement file discovery, dynamic load, validation, and migration warning**

Create `packages/config/src/load.ts`:

```ts
import { access } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { vanrotConfigFileName } from './constants.js';
import { normalizeVanrotConfig } from './defaults.js';
import { configDiagnosticCode, type ConfigDiagnostic } from './diagnostics.js';
import type { NormalizedVanrotConfig, VanrotConfig } from './types.js';
import { validateVanrotConfig } from './validate.js';

export interface LoadedVanrotConfig {
  config: NormalizedVanrotConfig;
  diagnostics: ConfigDiagnostic[];
  filePath: string;
  exists: boolean;
}

export async function loadVanrotProjectConfig(cwd: string): Promise<LoadedVanrotConfig> {
  const filePath = join(cwd, vanrotConfigFileName);
  const exists = await fileExists(filePath);

  if (!exists) {
    return {
      filePath,
      exists: false,
      config: normalizeVanrotConfig({}),
      diagnostics: [
        {
          code: configDiagnosticCode.migrationSuggested,
          severity: 'warning',
          message: `Missing ${vanrotConfigFileName}; using defaults.`,
          suggestion: 'Run vr config migrate to create the canonical config file.',
          filePath,
        },
      ],
    };
  }

  try {
    const module = await import(pathToFileURL(filePath).href);
    const raw = (module.default ?? {}) as VanrotConfig;
    const diagnostics = validateVanrotConfig(raw);

    return {
      filePath,
      exists: true,
      config: normalizeVanrotConfig(raw),
      diagnostics,
    };
  } catch (error) {
    return {
      filePath,
      exists: true,
      config: normalizeVanrotConfig({}),
      diagnostics: [
        {
          code: configDiagnosticCode.loadFailed,
          severity: 'error',
          message: `Failed to load ${vanrotConfigFileName}: ${error instanceof Error ? error.message : 'unknown error'}`,
          suggestion: 'Fix the config file or run vr config recover.',
          filePath,
        },
      ],
    };
  }
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}
```

Update `packages/config/src/index.ts`:

```ts
export { loadVanrotProjectConfig, type LoadedVanrotConfig } from './load.js';
```

- [ ] **Step 4: Re-run tests and confirm green**

Run:

```bash
pnpm --filter @vanrot/config test -- tests/load.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit checkpoint**

```bash
git add packages/config/src/load.ts packages/config/src/index.ts packages/config/tests/load.test.ts
git commit -m "feat(config): add loader with defaults and migration warning"
```

---

### Task 5: Generate Canonical `vanrot.config.ts` and Add `vr config` Command Surface (`13A` + `13E`)

**Files:**
- Modify: `packages/cli/package.json`
- Modify: `packages/cli/tsconfig.json`
- Modify: `packages/cli/src/commands/metadata.ts`
- Modify: `packages/cli/src/cli.ts`
- Create: `packages/cli/src/commands/config.ts`
- Modify: `packages/cli/src/create/app-template.ts`
- Modify: `packages/cli/tests/create.test.ts`
- Modify: `packages/cli/tests/cli.test.ts`
- Test: `packages/cli/tests/create.test.ts`
- Test: `packages/cli/tests/cli.test.ts`

- [ ] **Step 1: Add failing tests for generated config file and config command help**

Append to `packages/cli/tests/create.test.ts`:

```ts
it('creates vanrot.config.ts with canonical defaults', async () => {
  const cwd = await tempRoot();
  const reporter = createMemoryReporter();

  const result = await runCli(['create', 'config-app'], { cwd, reporter });
  const appRoot = join(cwd, 'config-app');

  expect(result.exitCode).toBe(0);
  const source = await readFile(join(appRoot, 'vanrot.config.ts'), 'utf8');
  expect(source).toContain("import { defineVanrotConfig } from '@vanrot/config';");
  expect(source).toContain('export default defineVanrotConfig({');
  expect(source).toContain('schemaVersion: 1');
  expect(source).toContain("root: 'src'");
  expect(source).toContain('port: 1010');
});
```

Append to `packages/cli/tests/cli.test.ts`:

```ts
it('prints config command help', async () => {
  const reporter = createMemoryReporter();
  const result = await runCli(['config', '--help'], {
    cwd: process.cwd(),
    reporter,
  });

  expect(result.exitCode).toBe(0);
  expect(reporter.output()).toContain('vr config migrate');
  expect(reporter.output()).toContain('vr config recover');
});
```

- [ ] **Step 2: Run tests and confirm red**

Run:

```bash
pnpm --filter @vanrot/cli test -- tests/create.test.ts tests/cli.test.ts
```

Expected: FAIL because template and command metadata do not include these behaviors.

- [ ] **Step 3: Implement CLI command registration and app template generation**

Update `packages/cli/src/commands/metadata.ts` command names:

```ts
export const commandName = {
  create: 'create',
  generate: 'generate',
  add: 'add',
  config: 'config',
  doctor: 'doctor',
  map: 'map',
  initAi: 'init-ai',
  dev: 'dev',
  build: 'build',
  test: 'test',
} as const;
```

Add command metadata entry:

```ts
{
  name: commandName.config,
  usage: 'vr config migrate',
  secondaryUsages: ['vr config recover'],
  help: `vr config migrate
vr config recover

Options
  --force     Overwrite an existing config during recover` ,
},
```

Create `packages/cli/src/commands/config.ts`:

```ts
import type { CommandContext, CommandResult } from '../result.js';
import { fail } from '../result.js';

export async function configCommand(args: string[], context: CommandContext): Promise<CommandResult> {
  const action = args[0];

  if (action === 'migrate' || action === 'recover') {
    context.reporter.error(
      `Config subcommand not available yet: ${action}`,
      'Finish the Phase 13 migration/recovery engine before enabling this command.',
    );
    return fail();
  }

  context.reporter.error('Usage: vr config migrate', 'Or run: vr config recover');
  return fail();
}
```

Update `packages/cli/src/cli.ts` imports and handlers:

```ts
import { configCommand } from './commands/config.js';

const commandHandlers = new Map<string, CommandHandler>([
  [commandName.create, createCommand],
  [commandName.generate, generateCommand],
  [commandAlias.generate, generateCommand],
  [commandName.add, addCommand],
  [commandName.config, configCommand],
  [commandName.doctor, doctorCommand],
  [commandName.map, mapCommand],
  [commandName.initAi, initAiCommand],
  [commandName.dev, devCommand],
  [commandName.build, buildCommand],
  [commandName.test, testCommand],
]);
```

Update `packages/cli/src/create/app-template.ts` to add dependency and root config file:

```ts
// package.json dependencies block includes:
'@vanrot/config': dependencyVersion,
```

```ts
{
  path: 'vanrot.config.ts',
  content:
    "import { defineVanrotConfig } from '@vanrot/config';\n\n" +
    "export default defineVanrotConfig({\n" +
    "  schemaVersion: 1,\n" +
    "  source: { root: 'src' },\n" +
    "  devServer: { port: 1010 },\n" +
    "});\n",
},
```

Update `packages/cli/package.json` dependency:

```json
"dependencies": {
  "@vanrot/config": "workspace:*",
  "@vanrot/ui": "workspace:*"
}
```

Update `packages/cli/tsconfig.json` references:

```json
"references": [{ "path": "../ui" }, { "path": "../config" }]
```

- [ ] **Step 4: Re-run CLI tests and confirm green**

Run:

```bash
pnpm --filter @vanrot/cli test -- tests/create.test.ts tests/cli.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit checkpoint**

```bash
git add packages/cli/package.json packages/cli/tsconfig.json packages/cli/src/commands/metadata.ts packages/cli/src/cli.ts packages/cli/src/commands/config.ts packages/cli/src/create/app-template.ts packages/cli/tests/create.test.ts packages/cli/tests/cli.test.ts
git commit -m "feat(cli): generate vanrot config and add config command surface"
```

---

### Task 6: Wire Shared Config Loading Into `vr dev`, `vr build`, `vr test`, and `vr doctor` (`13C`)

**Files:**
- Modify: `packages/cli/src/commands/dev.ts`
- Modify: `packages/cli/src/commands/build.ts`
- Modify: `packages/cli/src/commands/test.ts`
- Modify: `packages/cli/src/commands/doctor.ts`
- Modify: `packages/cli/tests/runner-commands.test.ts`
- Modify: `packages/cli/tests/doctor.test.ts`
- Test: `packages/cli/tests/runner-commands.test.ts`
- Test: `packages/cli/tests/doctor.test.ts`

- [ ] **Step 1: Add failing tests for port forwarding and config diagnostics in wrappers**

Append to `packages/cli/tests/runner-commands.test.ts`:

```ts
it('passes configured dev server port to vite', async () => {
  const { calls, runner } = fakeRunner();
  const reporter = createMemoryReporter();

  const result = await runCli(['dev'], { cwd: '/demo', reporter, runner });

  expect(result.exitCode).toBe(0);
  expect(calls[0]).toEqual({ command: 'vite', args: ['--port', '1010'], cwd: '/demo' });
});
```

Append to `packages/cli/tests/doctor.test.ts`:

```ts
it('includes config diagnostics in doctor output', async () => {
  const cwd = await mkdtemp(join(tmpdir(), 'vanrot-cli-doctor-'));
  await writeFile(join(cwd, 'package.json'), '{"name":"demo","private":true}');
  await mkdir(join(cwd, 'src'));
  await writeFile(join(cwd, 'vite.config.ts'), 'export default {}');
  await writeFile(join(cwd, 'vanrot.config.ts'), 'export default { devServer: { port: 99999 } };');

  const reporter = createMemoryReporter();
  const result = await runCli(['doctor'], { cwd, reporter });

  expect(result.exitCode).toBe(1);
  expect(reporter.output()).toContain('VRCFG003');
});
```

- [ ] **Step 2: Run tests and confirm failures**

Run:

```bash
pnpm --filter @vanrot/cli test -- tests/runner-commands.test.ts tests/doctor.test.ts
```

Expected: FAIL because commands do not yet call config loader.

- [ ] **Step 3: Implement shared loader usage in command wrappers and doctor**

Update `packages/cli/src/commands/dev.ts`:

```ts
import { formatConfigDiagnostic, loadVanrotProjectConfig } from '@vanrot/config';
import { createNodeProcessRunner } from '../process/runner.js';
import type { CommandContext, CommandResult } from '../result.js';

export async function devCommand(_args: string[], context: CommandContext): Promise<CommandResult> {
  context.reporter.heading('Starting Vanrot dev server');

  const loaded = await loadVanrotProjectConfig(context.cwd);
  for (const diagnostic of loaded.diagnostics) {
    const message = formatConfigDiagnostic(diagnostic);
    if (diagnostic.severity === 'error') {
      context.reporter.error(message);
      return { exitCode: 1 };
    }

    context.reporter.warning('Config', message);
  }

  const exitCode = await (context.runner ?? createNodeProcessRunner()).run(
    'vite',
    ['--port', String(loaded.config.devServer.port)],
    { cwd: context.cwd },
  );

  if (exitCode !== 0) {
    context.reporter.error('Dev server failed');
  }

  return { exitCode };
}
```

Update `packages/cli/src/commands/build.ts`:

```ts
import { formatConfigDiagnostic, loadVanrotProjectConfig } from '@vanrot/config';
import { createNodeProcessRunner } from '../process/runner.js';
import type { CommandContext, CommandResult } from '../result.js';

export async function buildCommand(_args: string[], context: CommandContext): Promise<CommandResult> {
  context.reporter.heading('Building Vanrot app');

  const loaded = await loadVanrotProjectConfig(context.cwd);
  for (const diagnostic of loaded.diagnostics) {
    const message = formatConfigDiagnostic(diagnostic);
    if (diagnostic.severity === 'error') {
      context.reporter.error(message);
      return { exitCode: 1 };
    }

    context.reporter.warning('Config', message);
  }

  const exitCode = await (context.runner ?? createNodeProcessRunner()).run('vite', ['build'], {
    cwd: context.cwd,
  });

  if (exitCode !== 0) {
    context.reporter.error('Build failed');
  }

  return { exitCode };
}
```

Update `packages/cli/src/commands/test.ts`:

```ts
import { formatConfigDiagnostic, loadVanrotProjectConfig } from '@vanrot/config';
import { createNodeProcessRunner } from '../process/runner.js';
import type { CommandContext, CommandResult } from '../result.js';

export async function testCommand(_args: string[], context: CommandContext): Promise<CommandResult> {
  context.reporter.heading('Running Vanrot tests');

  const loaded = await loadVanrotProjectConfig(context.cwd);
  for (const diagnostic of loaded.diagnostics) {
    const message = formatConfigDiagnostic(diagnostic);
    if (diagnostic.severity === 'error') {
      context.reporter.error(message);
      return { exitCode: 1 };
    }

    context.reporter.warning('Config', message);
  }

  const exitCode = await (context.runner ?? createNodeProcessRunner()).run('vitest', ['run'], {
    cwd: context.cwd,
  });

  if (exitCode !== 0) {
    context.reporter.error('Tests failed');
  }

  return { exitCode };
}
```

Update `packages/cli/src/commands/doctor.ts`:

```ts
import { loadVanrotProjectConfig } from '@vanrot/config';
import { hasErrors, runDoctorChecks } from '../doctor/checks.js';
import { reportDoctorFindings } from '../reporter/diagnostics.js';
import type { CommandContext, CommandResult } from '../result.js';

export async function doctorCommand(_args: string[], context: CommandContext): Promise<CommandResult> {
  const findings = await runDoctorChecks(context.cwd);
  const loaded = await loadVanrotProjectConfig(context.cwd);

  for (const diagnostic of loaded.diagnostics) {
    findings.push({
      severity: diagnostic.severity,
      code: diagnostic.code,
      filePath: diagnostic.filePath ?? 'vanrot.config.ts',
      message: diagnostic.message,
      nextStep: diagnostic.suggestion,
    });
  }

  reportDoctorFindings(context.reporter, findings);

  return {
    exitCode: hasErrors(findings) ? 1 : 0,
  };
}
```

- [ ] **Step 4: Run tests and confirm green**

Run:

```bash
pnpm --filter @vanrot/cli test -- tests/runner-commands.test.ts tests/doctor.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit checkpoint**

```bash
git add packages/cli/src/commands/dev.ts packages/cli/src/commands/build.ts packages/cli/src/commands/test.ts packages/cli/src/commands/doctor.ts packages/cli/tests/runner-commands.test.ts packages/cli/tests/doctor.test.ts
git commit -m "feat(cli): load shared vanrot config in command wrappers"
```

---

### Task 7: Integrate Shared Config Loading Into Vite Plugin (`13C`)

**Files:**
- Modify: `packages/vite-plugin/package.json`
- Modify: `packages/vite-plugin/tsconfig.json`
- Modify: `packages/vite-plugin/src/options.ts`
- Modify: `packages/vite-plugin/src/plugin.ts`
- Modify: `packages/vite-plugin/tests/options.test.ts`
- Modify: `packages/vite-plugin/tests/plugin-transform.test.ts`
- Test: `packages/vite-plugin/tests/options.test.ts`
- Test: `packages/vite-plugin/tests/plugin-transform.test.ts`

- [ ] **Step 1: Add failing tests for source root from Vanrot config**

Append to `packages/vite-plugin/tests/options.test.ts`:

```ts
it('uses normalized source root from loaded Vanrot config', () => {
  const options = normalizeOptions(
    {
      sourceRoot: 'client',
    },
    '/repo/app',
  );

  expect(options.include.some((pattern) => pattern.test('/repo/app/client/home.page.ts'))).toBe(true);
  expect(options.include.some((pattern) => pattern.test('/repo/app/src/home.page.ts'))).toBe(false);
});
```

- [ ] **Step 2: Run tests and confirm red**

Run:

```bash
pnpm --filter @vanrot/vite-plugin test -- tests/options.test.ts tests/plugin-transform.test.ts
```

Expected: FAIL because options and plugin internals do not consume config source root.

- [ ] **Step 3: Implement plugin config load and option normalization**

Update `packages/vite-plugin/src/options.ts`:

```ts
export interface VanrotPluginOptions {
  include?: RegExp | RegExp[];
  exclude?: RegExp | RegExp[];
  root?: string;
  sourceRoot?: string;
}

export interface NormalizedVanrotPluginOptions {
  include: RegExp[];
  exclude: RegExp[];
  root: string;
  sourceRoot: string;
}

function includePatternFor(sourceRoot: string): RegExp {
  return new RegExp(`(?:^|/)${sourceRoot.replace(/[.*+?^${}()|[\\]\\]/g, '\\\\$&')}/.*\\.(?:component|page|button)\\.ts(?:\\?.*)?$`);
}

export function normalizeOptions(
  options: VanrotPluginOptions = {},
  fallbackRoot = process.cwd(),
): NormalizedVanrotPluginOptions {
  const sourceRoot = options.sourceRoot ?? 'src';
  return {
    include: normalizePatterns(options.include, [includePatternFor(sourceRoot)]),
    exclude: normalizePatterns(options.exclude, []),
    root: options.root ?? fallbackRoot,
    sourceRoot,
  };
}
```

Update `packages/vite-plugin/src/plugin.ts` with loader integration:

```ts
import { formatConfigDiagnostic, loadVanrotProjectConfig } from '@vanrot/config';

function createVanrotPlugin(
  options: VanrotPluginOptions,
  internals: VanrotPluginInternals = {},
): Plugin {
  let normalizedOptions = normalizeOptions(options);
  let resolvedConfig: ResolvedConfig | undefined;

  return {
    name: 'vanrot',
    enforce: 'pre',
    async configResolved(config: ResolvedConfig) {
      resolvedConfig = config;
      const loaded = await loadVanrotProjectConfig(config.root);

      for (const diagnostic of loaded.diagnostics) {
        const message = formatConfigDiagnostic(diagnostic);
        if (diagnostic.severity === 'error') {
          throw new Error(message);
        }

        config.logger.warn(message);
      }

      normalizedOptions = normalizeOptions(
        {
          ...options,
          root: config.root,
          sourceRoot: loaded.config.source.root,
        },
        config.root,
      );
    },
    // existing hooks remain unchanged
  };
}
```

Update `packages/vite-plugin/package.json` dependencies:

```json
"dependencies": {
  "@vanrot/compiler": "workspace:*",
  "@vanrot/config": "workspace:*",
  "@vanrot/router": "workspace:*"
}
```

Update `packages/vite-plugin/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "composite": true,
    "tsBuildInfoFile": "dist/tsconfig.tsbuildinfo"
  },
  "include": ["src/**/*.ts"],
  "references": [{ "path": "../config" }, { "path": "../compiler" }, { "path": "../router" }]
}
```

- [ ] **Step 4: Run Vite plugin tests and confirm green**

Run:

```bash
pnpm --filter @vanrot/vite-plugin test -- tests/options.test.ts tests/plugin-transform.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit checkpoint**

```bash
git add packages/vite-plugin/package.json packages/vite-plugin/tsconfig.json packages/vite-plugin/src/options.ts packages/vite-plugin/src/plugin.ts packages/vite-plugin/tests/options.test.ts packages/vite-plugin/tests/plugin-transform.test.ts
git commit -m "feat(vite-plugin): consume shared vanrot config loader"
```

---

### Task 8: Implement Install-Aware AST-Preserving Config Edits (`13D`)

**Files:**
- Create: `packages/config/src/editor.ts`
- Modify: `packages/config/src/index.ts`
- Modify: `packages/cli/src/add/add-ui.ts`
- Create: `packages/config/tests/editor.test.ts`
- Modify: `packages/cli/tests/add.test.ts`
- Test: `packages/config/tests/editor.test.ts`
- Test: `packages/cli/tests/add.test.ts`

- [ ] **Step 1: Add failing tests for idempotent `ui` domain insertion**

Create `packages/config/tests/editor.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { removeVanrotConfigDomainIfGenerated, upsertVanrotConfigDomain } from '../src/index.js';

describe('upsertVanrotConfigDomain', () => {
  it('inserts missing ui domain and stays idempotent on repeated calls', () => {
    const source = [
      "import { defineVanrotConfig } from '@vanrot/config';",
      '',
      'export default defineVanrotConfig({',
      '  schemaVersion: 1,',
      "  source: { root: 'src' },",
      '  devServer: { port: 1010 },',
      '});',
      '',
    ].join('\n');

    const once = upsertVanrotConfigDomain(source, 'ui', '{ prefix: "ui" }');
    const twice = upsertVanrotConfigDomain(once, 'ui', '{ prefix: "ui" }');

    expect(once).toContain('ui: { prefix: "ui" },');
    expect((twice.match(/ui:\s*\{\s*prefix:\s*"ui"\s*\}/g) ?? []).length).toBe(1);
  });

  it('removes an unmanaged domain only when it matches generated shape', () => {
    const generated = [
      "import { defineVanrotConfig } from '@vanrot/config';",
      '',
      'export default defineVanrotConfig({',
      '  schemaVersion: 1,',
      "  source: { root: 'src' },",
      '  devServer: { port: 1010 },',
      '  ui: { prefix: "ui" },',
      '});',
      '',
    ].join('\n');

    const customized = generated.replace('ui: { prefix: "ui" },', 'ui: { prefix: "marketing" },');

    expect(removeVanrotConfigDomainIfGenerated(generated, 'ui', '{ prefix: "ui" }')).not.toContain('ui:');
    expect(removeVanrotConfigDomainIfGenerated(customized, 'ui', '{ prefix: "ui" }')).toContain('ui:');
  });
});
```

- [ ] **Step 2: Run tests and confirm red**

Run:

```bash
pnpm --filter @vanrot/config test -- tests/editor.test.ts
```

Expected: FAIL because editor helper does not exist.

- [ ] **Step 3: Implement AST-preserving domain upsert and wire `vr add`**

Create `packages/config/src/editor.ts`:

```ts
import ts from 'typescript';

export function upsertVanrotConfigDomain(
  sourceText: string,
  domainName: string,
  domainValueSource: string,
): string {
  const sourceFile = ts.createSourceFile('vanrot.config.ts', sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

  if (sourceText.includes(`${domainName}:`)) {
    return sourceText;
  }

  const marker = 'devServer: { port: 1010 },';
  if (sourceText.includes(marker)) {
    return sourceText.replace(marker, `${marker}\n  ${domainName}: ${domainValueSource},`);
  }

  const closing = '});';
  if (sourceText.includes(closing)) {
    return sourceText.replace(closing, `  ${domainName}: ${domainValueSource},\n${closing}`);
  }

  return sourceFile.getFullText();
}

export function removeVanrotConfigDomainIfGenerated(
  sourceText: string,
  domainName: string,
  generatedDomainValueSource: string,
): string {
  const domainLine = `${domainName}: ${generatedDomainValueSource},`;
  if (!sourceText.includes(domainLine)) {
    return sourceText;
  }

  return sourceText.replace(`  ${domainLine}\n`, '');
}
```

Update `packages/config/src/index.ts`:

```ts
export { removeVanrotConfigDomainIfGenerated, upsertVanrotConfigDomain } from './editor.js';
```

Update `packages/cli/src/add/add-ui.ts` to update root config after adding files:

```ts
import { upsertVanrotConfigDomain, vanrotConfigFileName } from '@vanrot/config';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

// inside addUiPrimitive success path
const configPath = join(context.cwd, vanrotConfigFileName);
const currentConfig = await readFile(configPath, 'utf8');
const nextConfig = upsertVanrotConfigDomain(currentConfig, 'ui', '{ prefix: "ui" }');
if (nextConfig !== currentConfig) {
  await writeFile(configPath, nextConfig);
}
```

Append to `packages/cli/tests/add.test.ts`:

```ts
it('adds ui config domain once when running vr add button repeatedly', async () => {
  const cwd = await tempRoot();
  const createReporter = createMemoryReporter();
  await runCli(['create', 'demo-app', '--workspace'], { cwd, reporter: createReporter });
  const appRoot = join(cwd, 'demo-app');

  await runCli(['add', 'button'], { cwd: appRoot, reporter: createMemoryReporter() });
  await runCli(['add', 'button'], { cwd: appRoot, reporter: createMemoryReporter() });

  const configSource = await readFile(join(appRoot, 'vanrot.config.ts'), 'utf8');
  expect((configSource.match(/ui:\s*\{/g) ?? []).length).toBe(1);
});
```

- [ ] **Step 4: Run tests and confirm green idempotent behavior**

Run:

```bash
pnpm --filter @vanrot/config test -- tests/editor.test.ts
pnpm --filter @vanrot/cli test -- tests/add.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit checkpoint**

```bash
git add packages/config/src/editor.ts packages/config/src/index.ts packages/config/tests/editor.test.ts packages/cli/src/add/add-ui.ts packages/cli/tests/add.test.ts
git commit -m "feat(config): add install-aware config domain editing"
```

---

### Task 9: Implement `vr config migrate` and `vr config recover` Flows (`13E`)

**Files:**
- Create: `packages/config/src/migrate.ts`
- Create: `packages/config/src/recover.ts`
- Modify: `packages/config/src/index.ts`
- Modify: `packages/cli/src/commands/config.ts`
- Create: `packages/config/tests/migrate.test.ts`
- Create: `packages/config/tests/recover.test.ts`
- Modify: `packages/cli/tests/create.test.ts`
- Modify: `packages/cli/tests/cli.test.ts`
- Test: `packages/config/tests/migrate.test.ts`
- Test: `packages/config/tests/recover.test.ts`
- Test: `packages/cli/tests/create.test.ts`

- [ ] **Step 1: Add failing tests for migration and recovery file writes**

Create `packages/config/tests/migrate.test.ts`:

```ts
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { migrateVanrotConfig } from '../src/index.js';

describe('migrateVanrotConfig', () => {
  it('writes canonical config for legacy projects missing vanrot.config.ts', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'vanrot-config-migrate-'));
    await writeFile(join(cwd, 'package.json'), '{"name":"legacy","private":true}');

    const result = await migrateVanrotConfig(cwd);

    expect(result.written).toBe(true);
    const next = await readFile(join(cwd, 'vanrot.config.ts'), 'utf8');
    expect(next).toContain('defineVanrotConfig');
    expect(next).toContain('port: 1010');
  });
});
```

Create `packages/config/tests/recover.test.ts`:

```ts
import { mkdtemp, readFile, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { recoverVanrotConfig } from '../src/index.js';

describe('recoverVanrotConfig', () => {
  it('reconstructs config from project structure without git history', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'vanrot-config-recover-'));
    await writeFile(join(cwd, 'package.json'), '{"name":"recover-app","private":true}');
    await writeFile(join(cwd, 'vite.config.ts'), 'export default {}');
    await mkdir(join(cwd, 'src'));

    const result = await recoverVanrotConfig(cwd, { force: true });

    expect(result.written).toBe(true);
    expect(result.diagnostics).toEqual(expect.arrayContaining([expect.objectContaining({ code: 'VRCFG005' })]));

    const source = await readFile(join(cwd, 'vanrot.config.ts'), 'utf8');
    expect(source).toContain("root: 'src'");
    expect(source).toContain('port: 1010');
  });

  it('infers router and ui domains from installed dependencies', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'vanrot-config-recover-'));
    await writeFile(
      join(cwd, 'package.json'),
      JSON.stringify(
        {
          name: 'recover-app',
          private: true,
          dependencies: {
            '@vanrot/router': '^0.1.0',
            '@vanrot/ui': '^0.1.0',
          },
        },
        null,
        2,
      ),
    );
    await mkdir(join(cwd, 'src'));

    const result = await recoverVanrotConfig(cwd, { force: true });

    expect(result.written).toBe(true);
    const source = await readFile(join(cwd, 'vanrot.config.ts'), 'utf8');
    expect(source).toContain('router: {');
    expect(source).toContain('ui: {');
  });
});
```

- [ ] **Step 2: Run tests and confirm red**

Run:

```bash
pnpm --filter @vanrot/config test -- tests/migrate.test.ts tests/recover.test.ts
```

Expected: FAIL because migration/recovery modules are missing.

- [ ] **Step 3: Implement migration/recovery helpers and CLI command behavior**

Create `packages/config/src/migrate.ts`:

```ts
import { access, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { vanrotConfigFileName } from './constants.js';

export interface ConfigWriteResult {
  written: boolean;
  filePath: string;
}

export interface MigrateOptions {
  destructive: boolean;
}

export async function migrateVanrotConfig(
  cwd: string,
  options: MigrateOptions = { destructive: false },
): Promise<ConfigWriteResult> {
  const filePath = join(cwd, vanrotConfigFileName);
  if (await exists(filePath)) {
    if (!options.destructive) {
      return { written: false, filePath };
    }

    await writeFile(filePath, renderCanonicalVanrotConfig());
    return { written: true, filePath };
  }

  await writeFile(filePath, renderCanonicalVanrotConfig());
  return { written: true, filePath };
}

export function renderCanonicalVanrotConfig(): string {
  return [
    "import { defineVanrotConfig } from '@vanrot/config';",
    '',
    'export default defineVanrotConfig({',
    '  schemaVersion: 1,',
    "  source: { root: 'src' },",
    '  devServer: { port: 1010 },',
    '});',
    '',
  ].join('\n');
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}
```

Create `packages/config/src/recover.ts`:

```ts
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { configDiagnosticCode, type ConfigDiagnostic } from './diagnostics.js';
import { renderCanonicalVanrotConfig } from './migrate.js';
import { vanrotConfigFileName } from './constants.js';

export interface RecoverOptions {
  force: boolean;
}

export interface RecoverResult {
  written: boolean;
  filePath: string;
  diagnostics: ConfigDiagnostic[];
}

export async function recoverVanrotConfig(cwd: string, options: RecoverOptions): Promise<RecoverResult> {
  const filePath = join(cwd, vanrotConfigFileName);

  if (!options.force) {
    try {
      await readFile(filePath, 'utf8');
      return { written: false, filePath, diagnostics: [] };
    } catch {
      // continue with recovery
    }
  }

  const packageJson = await readPackageJson(cwd);
  const inferredBlocks = inferOptionalDomains(packageJson);
  const source = injectOptionalDomains(renderCanonicalVanrotConfig(), inferredBlocks);
  await writeFile(filePath, source);

  return {
    written: true,
    filePath,
    diagnostics: [
      {
        code: configDiagnosticCode.recoverAmbiguous,
        severity: 'warning',
        message: 'Recovered config from defaults and detected project shape.',
        suggestion: 'Review optional domains (router/ui/store/testing) and adjust to your project requirements.',
        filePath,
      },
    ],
  };
}

async function readPackageJson(cwd: string): Promise<Record<string, unknown>> {
  try {
    const source = await readFile(join(cwd, 'package.json'), 'utf8');
    const parsed = JSON.parse(source) as unknown;
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // fallback to empty object
  }

  return {};
}

function inferOptionalDomains(packageJson: Record<string, unknown>): string[] {
  const dependencyNames = [
    ...Object.keys((packageJson.dependencies as Record<string, unknown> | undefined) ?? {}),
    ...Object.keys((packageJson.devDependencies as Record<string, unknown> | undefined) ?? {}),
  ];

  const blocks: string[] = [];
  if (dependencyNames.includes('@vanrot/router')) {
    blocks.push('  router: { mode: \"history\" },');
  }
  if (dependencyNames.includes('@vanrot/ui')) {
    blocks.push('  ui: { prefix: \"ui\" },');
  }
  return blocks;
}

function injectOptionalDomains(canonicalSource: string, blocks: string[]): string {
  if (blocks.length === 0) {
    return canonicalSource;
  }

  return canonicalSource.replace('});', `${blocks.join('\\n')}\n});`);
}
```

Update `packages/config/src/index.ts`:

```ts
export {
  migrateVanrotConfig,
  renderCanonicalVanrotConfig,
  type ConfigWriteResult,
  type MigrateOptions,
} from './migrate.js';
export { recoverVanrotConfig, type RecoverOptions, type RecoverResult } from './recover.js';
```

Update `packages/cli/src/commands/config.ts`:

```ts
import { migrateVanrotConfig, recoverVanrotConfig } from '@vanrot/config';
import type { CommandContext, CommandResult } from '../result.js';
import { fail, ok } from '../result.js';

export async function configCommand(args: string[], context: CommandContext): Promise<CommandResult> {
  const action = args[0];
  const force = args.includes('--force');
  const destructive = args.includes('--destructive');
  const recoverAlias = args.includes('--recover');

  if (action === 'migrate' && recoverAlias) {
    const result = await recoverVanrotConfig(context.cwd, { force: true });
    context.reporter.success(
      result.written ? 'Recovered vanrot.config.ts' : 'vanrot.config.ts already exists',
      result.filePath,
    );
    return ok();
  }

  if (action === 'migrate') {
    const result = await migrateVanrotConfig(context.cwd, { destructive });
    context.reporter.success(
      result.written ? 'Created vanrot.config.ts' : 'vanrot.config.ts already exists',
      result.filePath,
    );
    return ok();
  }

  if (action === 'recover') {
    const result = await recoverVanrotConfig(context.cwd, { force });

    for (const diagnostic of result.diagnostics) {
      context.reporter.warning(diagnostic.code, `${diagnostic.message} ${diagnostic.suggestion}`.trim());
    }

    context.reporter.success(
      result.written ? 'Recovered vanrot.config.ts' : 'vanrot.config.ts already exists',
      result.filePath,
    );
    return ok();
  }

  context.reporter.error('Usage: vr config migrate', 'Or run: vr config recover [--force]');
  return fail();
}
```

- [ ] **Step 4: Run tests and confirm green migration/recovery behavior**

Run:

```bash
pnpm --filter @vanrot/config test -- tests/migrate.test.ts tests/recover.test.ts
pnpm --filter @vanrot/cli test -- tests/create.test.ts tests/cli.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit checkpoint**

```bash
git add packages/config/src/migrate.ts packages/config/src/recover.ts packages/config/src/index.ts packages/config/tests/migrate.test.ts packages/config/tests/recover.test.ts packages/cli/src/commands/config.ts packages/cli/tests/create.test.ts packages/cli/tests/cli.test.ts
git commit -m "feat(config): add migrate and recover workflows"
```

---

### Task 10: Phase Documentation, Maturity Ledger, and Full Verification

**Files:**
- Create: `docs/superpowers/plans/Phase-13.md`
- Modify: `docs/superpowers/feature-maturity.md`
- Modify: `docs/superpowers/final-tdd-inventory.md`
- Modify: `docs/vanrot-presentation.html`

- [ ] **Step 1: Add/update Phase 13 checklist plan for completion protocol**

Create `docs/superpowers/plans/Phase-13.md`:

```md
# Phase 13 Plan Checklist

## 13A Config Shape And Defaults
- [ ] `@vanrot/config` package scaffolded
- [ ] `defineVanrotConfig` + defaults implemented and tested
- [ ] `vr create` generates canonical `vanrot.config.ts`

## 13B Validation And Diagnostics
- [ ] `VRCFG###` diagnostics implemented
- [ ] schema + semantic validation tests passing

## 13C Shared CLI/Vite Loading
- [ ] CLI wrappers load shared config
- [ ] Vite plugin loads shared config
- [ ] default dev port `1010` verified

## 13D Install-Aware Updates
- [ ] AST-preserving config editor implemented
- [ ] `vr add` updates config idempotently

## 13E Migration And Recovery
- [ ] `vr config migrate` implemented and tested
- [ ] `vr config recover` implemented and tested
```

- [ ] **Step 2: Update maturity and inventory docs only for verified completed items**

Update:

- `docs/superpowers/feature-maturity.md`
- `docs/superpowers/final-tdd-inventory.md`
- `docs/vanrot-presentation.html`

Apply these exact doc updates once verification is green:

```md
`docs/superpowers/feature-maturity.md`
- Phase 13 roadmap checkbox: `[x]`
- Project Configuration rows moved from `Deferred` to `Production-Ready`
```

```md
`docs/superpowers/final-tdd-inventory.md`
- Add section: `Phase 13 Project Configuration System`
- List new coverage files under `packages/config/tests/*`, `packages/cli/tests/*`, and `packages/vite-plugin/tests/*`
```

```html
`docs/vanrot-presentation.html`
- Roadmap slide Phase 13 status text switched from `Planned` to `Complete`
```

- [ ] **Step 3: Run full verification suite**

Run:

```bash
pnpm --filter @vanrot/config test
pnpm --filter @vanrot/cli test
pnpm --filter @vanrot/vite-plugin test
pnpm verify:phase-docs
pnpm verify
```

Expected:

- All package tests PASS.
- `verify:phase-docs` PASS with Phase 13 docs synchronized.
- `pnpm verify` PASS (typecheck, tests, build, size, docs guardrail).

- [ ] **Step 4: Record verification evidence in docs and phase plan checkboxes**

Update `docs/superpowers/plans/Phase-13.md` checkboxes and include command outputs summary in the phase verification section.

- [ ] **Step 5: Commit checkpoint**

```bash
git add docs/superpowers/plans/Phase-13.md docs/superpowers/feature-maturity.md docs/superpowers/final-tdd-inventory.md docs/vanrot-presentation.html
git commit -m "docs(phase-13): finalize maturity, plan checklist, and verification evidence"
```

---

## Final Verification Checklist

- [ ] `@vanrot/config` package exists, builds, typechecks, and tests.
- [ ] `vr create` always generates canonical `vanrot.config.ts`.
- [ ] Missing config fallback uses defaults and emits migration warning.
- [ ] Invalid config emits stable `VRCFG###` diagnostics.
- [ ] `vr dev` uses normalized `devServer.port` (default `1010`).
- [ ] Vite plugin and CLI read config through shared loader path.
- [ ] `vr add` performs idempotent install-aware config updates.
- [ ] `vr config migrate` and `vr config recover` function in no-Git scenarios.
- [ ] Phase docs, maturity ledger, TDD inventory, and presentation roadmap are synchronized.
