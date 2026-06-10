# Phase 32 Vanrot Forge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task in the current Vanrot workspace. Vanrot `AGENTS.md` disables subagents for Superpowers workflows. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the first release of `@vanrot/forge` as the native Vanrot app engine, while keeping Vite as the supported compatibility engine.

**Status:** Implemented and ready for final verification.

**Architecture:** `@vanrot/forge` owns the Vanrot app graph, dev server, build pipeline, diagnostics, first-party hooks, and benchmarks. `@vanrot/cli` stays the user command surface and dispatches `vr dev` / `vr build` by the configured engine. `@vanrot/config` owns `engine: 'forge' | 'vite'`. `@vanrot/vite-plugin` stays maintained for compatibility.

**Tech Stack:** TypeScript 6, Vitest, Node.js built-ins for the first Forge server, `@vanrot/compiler`, `@vanrot/config`, `@vanrot/router`, `@vanrot/seo`, `@vanrot/devtools`, docs page components, generated AI docs, and existing `pnpm verify` gates. AI/editor metadata integrates through the Forge hook API (Task 8), not a hard `@vanrot/ai` dependency, so the engine stays lighter than the Vite path.

---

## Release Boundary

Phase 32 is a production implementation phase for Forge. Do not reduce it to a wrapper around Vite.

Forge v1 must prove these things:

- The project engine is a first-class config contract.
- `vr create`, `vr dev`, `vr build`, and `vr doctor` understand that contract.
- Forge runs through `@vanrot/forge`, not `@vanrot/vite-plugin`.
- Vite remains usable when a project chooses `engine: 'vite'`.
- Forge has committed benchmark fixtures before public performance claims are made.
- Forge docs are rich real docs-site pages, not one overview article with fake child anchors.

Commit steps are written for execution discipline, but Vanrot git ownership rules still apply: run commit commands only when the user explicitly approves commits in the same task.

## File Structure

### Config

- Modify: `packages/config/src/constants.ts`
- Modify: `packages/config/src/types.ts`
- Modify: `packages/config/src/defaults.ts`
- Modify: `packages/config/src/diagnostics.ts`
- Modify: `packages/config/src/validate.ts`
- Modify: `packages/config/src/migrate.ts`
- Modify: `packages/config/src/recover.ts`
- Modify: `packages/config/src/index.ts`
- Modify: `packages/config/tests/defaults.test.ts`
- Modify: `packages/config/tests/migrate.test.ts`
- Modify: `packages/config/tests/recover.test.ts`
- Modify: `packages/config/tests/validate.test.ts`

### Forge Package

- Create: `packages/forge/package.json`
- Create: `packages/forge/tsconfig.json`
- Create: `packages/forge/tests/tsconfig.json`
- Create: `packages/forge/src/index.ts`
- Create: `packages/forge/src/bin.ts`
- Create: `packages/forge/src/core/app-graph.ts`
- Create: `packages/forge/src/core/file-roles.ts`
- Create: `packages/forge/src/core/source-files.ts`
- Create: `packages/forge/src/core/routes.ts`
- Create: `packages/forge/src/diagnostics/codes.ts`
- Create: `packages/forge/src/diagnostics/format.ts`
- Create: `packages/forge/src/dev/reload-planner.ts`
- Create: `packages/forge/src/dev/server.ts`
- Create: `packages/forge/src/build/build.ts`
- Create: `packages/forge/src/hooks/hooks.ts`
- Create: `packages/forge/src/benchmarks/fixtures.ts`
- Create: `packages/forge/tests/*.test.ts`

### CLI

- Modify: `packages/cli/package.json`
- Modify: `packages/cli/src/commands/dev.ts`
- Modify: `packages/cli/src/commands/build.ts`
- Modify: `packages/cli/src/commands/create.ts`
- Modify: `packages/cli/src/commands/doctor.ts`
- Modify: `packages/cli/src/commands/metadata.ts`
- Modify: `packages/cli/src/create/app-template.ts`
- Modify: `packages/cli/src/create/write-app.ts`
- Create: `packages/cli/src/create/engine-prompt.ts`
- Create: `packages/cli/src/engine/engine-flags.ts`
- Create: `packages/cli/src/engine/run-engine-command.ts`
- Modify: `packages/cli/tests/create.test.ts`
- Modify: `packages/cli/tests/runner-commands.test.ts`
- Modify: `packages/cli/tests/doctor.test.ts`
- Modify: `packages/cli/tests/metadata-site.test.ts`

### Docs Site

- Modify: `apps/vanrot-site/src/docs/docs-page-tree.ts`
- Create: `apps/vanrot-site/src/pages/docs/framework/forge/forge.page.ts`
- Create: `apps/vanrot-site/src/pages/docs/framework/forge/forge.page.html`
- Create: `apps/vanrot-site/src/pages/docs/framework/forge/forge.page.css`
- Create: `apps/vanrot-site/src/pages/docs/framework/forge/dev/dev.page.ts`
- Create: `apps/vanrot-site/src/pages/docs/framework/forge/dev/dev.page.html`
- Create: `apps/vanrot-site/src/pages/docs/framework/forge/dev/dev.page.css`
- Create: `apps/vanrot-site/src/pages/docs/framework/forge/build/build.page.ts`
- Create: `apps/vanrot-site/src/pages/docs/framework/forge/build/build.page.html`
- Create: `apps/vanrot-site/src/pages/docs/framework/forge/build/build.page.css`
- Create: `apps/vanrot-site/src/pages/docs/framework/forge/config/config.page.ts`
- Create: `apps/vanrot-site/src/pages/docs/framework/forge/config/config.page.html`
- Create: `apps/vanrot-site/src/pages/docs/framework/forge/config/config.page.css`
- Create: `apps/vanrot-site/src/pages/docs/framework/forge/hooks/hooks.page.ts`
- Create: `apps/vanrot-site/src/pages/docs/framework/forge/hooks/hooks.page.html`
- Create: `apps/vanrot-site/src/pages/docs/framework/forge/hooks/hooks.page.css`
- Create: `apps/vanrot-site/src/pages/docs/framework/forge/benchmarks/benchmarks.page.ts`
- Create: `apps/vanrot-site/src/pages/docs/framework/forge/benchmarks/benchmarks.page.html`
- Create: `apps/vanrot-site/src/pages/docs/framework/forge/benchmarks/benchmarks.page.css`
- Modify: `apps/vanrot-site/tests/docs-page-files.test.ts`
- Modify: `apps/vanrot-site/tests/docs-page-tree.test.ts`
- Modify: `apps/vanrot-site/tests/framework-reference.test.ts`
- Modify: `apps/vanrot-site/tests/site-pages.test.ts`
- Modify: `scripts/verify-ai-docs.test.mjs`
- Modify generated docs artifacts if the existing docs generation command updates them.

### Benchmarks And Trackers

- Create: `scripts/benchmark-forge.mjs`
- Create: `scripts/benchmark-forge.test.mjs`
- Modify: `package.json`
- Modify: `docs/superpowers/feature-maturity.md`
- Modify: `docs/superpowers/final-tdd-inventory.md`
- Modify: `docs/superpowers/future-pipeline.md`

---

## Tasks

### Task 1: Baseline And Guardrail Tests

**Goal:** Add failing tests that describe the engine contract before implementation.

- [x] Run current narrow baselines:

  ```sh
  pnpm --filter @vanrot/config test
  pnpm --filter @vanrot/cli test
  pnpm verify:phase-docs
  ```

  Expected before edits: all pass, except unrelated local issues must be reported before continuing.

- [x] Add config tests.

  Modify `packages/config/tests/defaults.test.ts`:

  ```ts
  it('defaults new projects to the Forge engine', () => {
    expect(normalizeVanrotConfig().engine).toBe(vanrotEngine.forge);
  });
  ```

  Modify `packages/config/tests/validate.test.ts`:

  ```ts
  it('reports invalid engines', () => {
    expect(validateVanrotConfig({ engine: 'webpack' as never })).toEqual([
      {
        code: configDiagnosticCode.invalidEngine,
        severity: 'error',
        message: 'Invalid engine: webpack',
        suggestion: 'Use forge or vite.',
      },
    ]);
  });
  ```

  Modify `packages/config/tests/migrate.test.ts` and `packages/config/tests/recover.test.ts` to assert canonical config includes:

  ```ts
  engine: 'forge',
  ```

- [x] Add CLI dispatch tests.

  Modify `packages/cli/tests/runner-commands.test.ts`:

  ```ts
  it('runs Forge for vr dev when config selects Forge', async () => {
    // Write vanrot.config.ts in a temp project with engine: 'forge'.
    // Assert runner call:
    // { command: 'vanrot-forge', args: ['dev', '--host', '127.0.0.1', '--port', '1964'] }
  });

  it('runs Vite for vr dev when config selects Vite', async () => {
    // Write vanrot.config.ts in a temp project with engine: 'vite'.
    // Assert runner call:
    // { command: 'vite', args: ['--host', '127.0.0.1', '--port', '1964'] }
  });

  it('runs Forge for vr build when config selects Forge', async () => {
    // Assert runner call:
    // { command: 'vanrot-forge', args: ['build'] }
  });

  it('honors --vite and --forge one-command overrides', async () => {
    // Assert overrides do not rewrite vanrot.config.ts.
  });
  ```

- [x] Add create tests.

  Modify `packages/cli/tests/create.test.ts`:

  ```ts
  it('creates Forge apps by default', async () => {
    // Assert generated vanrot.config.ts contains engine: 'forge'.
    // Assert package.json includes @vanrot/forge.
    // Assert package.json scripts are "dev": "vr dev" and "build": "vr build".
  });

  it('creates Vite apps when requested', async () => {
    // Use --engine vite.
    // Assert generated vanrot.config.ts contains engine: 'vite'.
    // Assert package.json includes vite and @vanrot/vite-plugin.
  });
  ```

- [x] Add Forge package shell tests.

  Create `packages/forge/tests/smoke.test.ts`:

  ```ts
  import { describe, expect, it } from 'vitest';
  import { forgePackageName } from '../src/index.js';

  describe('@vanrot/forge', () => {
    it('exports the Forge package name', () => {
      expect(forgePackageName).toBe('@vanrot/forge');
    });
  });
  ```

- [x] Add docs guardrail tests before pages exist.

  Modify docs tests so they expect real routes for:

  - `/docs/forge`
  - `/docs/forge/dev`
  - `/docs/forge/build`
  - `/docs/forge/config`
  - `/docs/forge/hooks`
  - `/docs/forge/benchmarks`

  Tests should fail if these are only `#section` links.

- [x] Run the focused tests and confirm they fail for the expected reasons:

  ```sh
  pnpm --filter @vanrot/config test
  pnpm --filter @vanrot/cli test
  pnpm --filter @vanrot/forge test
  pnpm --filter @vanrot/vanrot-site test
  ```

  Expected: failures reference missing engine support, missing Forge package, missing CLI dispatch, and missing docs routes.

### Task 2: Config Engine Contract

**Goal:** Make `engine: 'forge' | 'vite'` a first-class config field.

- [x] Modify `packages/config/src/constants.ts`.

  Add:

  ```ts
  export const defaultVanrotEngine = 'forge';
  ```

  Add `engine` to `configDomain`:

  ```ts
  engine: 'engine',
  ```

- [x] Modify `packages/config/src/types.ts`.

  Add:

  ```ts
  export const vanrotEngine = {
    forge: 'forge',
    vite: 'vite',
  } as const;

  export type VanrotEngine = (typeof vanrotEngine)[keyof typeof vanrotEngine];
  ```

  Add to `VanrotConfig`:

  ```ts
  engine?: VanrotEngine;
  ```

  Update `NormalizedVanrotConfig` omit list and add:

  ```ts
  engine: VanrotEngine;
  ```

- [x] Modify `packages/config/src/defaults.ts`.

  Import `defaultVanrotEngine`, then normalize:

  ```ts
  engine: config.engine ?? defaultVanrotEngine,
  ```

- [x] Modify `packages/config/src/diagnostics.ts`.

  Add:

  ```ts
  invalidEngine: 'VRCFG021',
  ```

- [x] Modify `packages/config/src/validate.ts`.

  Import `vanrotEngine`, add:

  ```ts
  const knownEngines = new Set<string>(Object.values(vanrotEngine));
  ```

  Add validation near the top-level checks:

  ```ts
  const engine = config.engine;
  if (engine !== undefined && !knownEngines.has(String(engine))) {
    diagnostics.push({
      code: configDiagnosticCode.invalidEngine,
      severity: 'error',
      message: `Invalid engine: ${String(engine)}`,
      suggestion: 'Use forge or vite.',
    });
  }
  ```

- [x] Modify `packages/config/src/migrate.ts`.

  Render the canonical config with:

  ```ts
  "  engine: 'forge',",
  ```

  Put it immediately after `schemaVersion` so the lifecycle choice is visible.

- [x] Modify `packages/config/src/recover.ts`.

  Keep recovered config defaulting to Forge. Do not infer Vite from dependency shape unless the user explicitly chooses migration behavior in a later task. Existing apps can keep `engine: 'vite'` if their config already says so.

- [x] Modify `packages/config/src/index.ts`.

  Export:

  ```ts
  defaultVanrotEngine,
  vanrotEngine,
  VanrotEngine,
  ```

- [x] Run:

  ```sh
  pnpm --filter @vanrot/config test
  pnpm --filter @vanrot/config typecheck
  ```

  Expected: all config tests pass.

### Task 3: Forge Package Shell

**Goal:** Add `@vanrot/forge` as a real workspace package with a thin CLI binary and typed exports.

- [x] Create `packages/forge/package.json`.

  Use the existing package style:

  ```json
  {
    "name": "@vanrot/forge",
    "version": "0.2.1",
    "type": "module",
    "engines": {
      "node": ">=22.14.0"
    },
    "main": "./dist/index.js",
    "module": "./dist/index.js",
    "types": "./dist/index.d.ts",
    "bin": {
      "vanrot-forge": "./dist/bin.js"
    },
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
      "@vanrot/compiler": "file:../compiler",
      "@vanrot/config": "file:../config",
      "@vanrot/devtools": "file:../devtools",
      "@vanrot/router": "file:../router",
      "@vanrot/seo": "file:../seo"
    },
    "devDependencies": {
      "@types/node": "^22.19.19"
    },
    "scripts": {
      "prebuild": "pnpm --filter @vanrot/config build && pnpm --filter @vanrot/compiler build && pnpm --filter @vanrot/router build && pnpm --filter @vanrot/devtools build && pnpm --filter @vanrot/seo build",
      "build": "tsc -p tsconfig.json",
      "pretypecheck": "pnpm run build",
      "typecheck": "tsc -p tsconfig.json --noEmit && tsc -p tests/tsconfig.json --noEmit",
      "pretest": "pnpm run build",
      "test": "vitest run",
      "clean": "node -e \"import('node:fs').then(({ rmSync }) => rmSync('dist', { recursive: true, force: true }))\""
    }
  }
  ```

- [x] Create `packages/forge/tsconfig.json` and `packages/forge/tests/tsconfig.json` using the package pattern from `@vanrot/vite-plugin`.

- [x] Create `packages/forge/src/index.ts`.

  Initial exports — only modules that exist after Task 3, so the package builds cleanly:

  ```ts
  export const forgePackageName = '@vanrot/forge';
  export { runForgeDev } from './dev/server.js';
  export { runForgeBuild } from './build/build.js';
  ```

  Extend exports in their owning tasks as the modules land:
  `classifyForgeFileRole` and `createForgeAppGraph` (Task 5),
  `planForgeReload` (Task 6), and the `ForgeHook` / `ForgeHookContext`
  types (Task 8). Do not export a module before it is created — Task 3
  must `pnpm --filter @vanrot/forge build` green on its own.

- [x] Create `packages/forge/src/bin.ts`.

  Behavior:

  - `vanrot-forge dev` calls `runForgeDev`.
  - `vanrot-forge build` calls `runForgeBuild`.
  - Unknown commands print a Forge diagnostic and exit `1`.

- [x] Create minimal implementations that compile:

  - `runForgeDev` returns `{ exitCode: 1 }` with a clear "Forge dev server is not implemented yet" diagnostic until Task 6.
  - `runForgeBuild` returns `{ exitCode: 1 }` with a clear "Forge build is not implemented yet" diagnostic until Task 7.
  - Do not call Vite from Forge.

- [x] Add tests:

  - `packages/forge/tests/smoke.test.ts`

  `file-roles.test.ts` and `reload-planner.test.ts` ship with their modules in
  Tasks 5 and 6 — do not add them here, since their source files do not exist yet.

- [x] Run:

  ```sh
  pnpm --filter @vanrot/forge test
  pnpm --filter @vanrot/forge typecheck
  pnpm --filter @vanrot/forge build
  ```

  Expected: package shell passes.

### Task 4: CLI Engine Dispatch And Project Creation

**Goal:** Make `vr dev`, `vr build`, and `vr create` route by engine without hiding the engine inside package scripts.

- [x] Modify `packages/cli/package.json`.

  Add:

  ```json
  "@vanrot/forge": "file:../forge"
  ```

  Add Forge to `prebuild`, `pretypecheck`, and any command that needs built workspace dependencies.

- [x] Create `packages/cli/src/engine/engine-flags.ts`.

  Implement:

  ```ts
  export interface EngineFlagResult {
    engineOverride?: 'forge' | 'vite';
    remainingArgs: string[];
  }

  export function parseEngineFlags(args: string[]): EngineFlagResult {
    // Accept --forge, --vite, and --engine forge|vite.
    // Reject conflicting flags through a caller-visible diagnostic shape.
  }
  ```

- [x] Create `packages/cli/src/engine/run-engine-command.ts`.

  Implement:

  ```ts
  export type EngineCommandName = 'dev' | 'build';

  export async function runEngineCommand(options: {
    command: EngineCommandName;
    engine: 'forge' | 'vite';
    cwd: string;
    port: number;
    runner: ProcessRunner;
  }): Promise<number> {
    if (options.engine === 'vite') {
      if (options.command === 'dev') {
        return options.runner.run('vite', ['--host', '127.0.0.1', '--port', String(options.port)], {
          cwd: options.cwd,
        });
      }

      return options.runner.run('vite', ['build'], { cwd: options.cwd });
    }

    if (options.command === 'dev') {
      return options.runner.run('vanrot-forge', ['dev', '--host', '127.0.0.1', '--port', String(options.port)], {
        cwd: options.cwd,
      });
    }

    return options.runner.run('vanrot-forge', ['build'], { cwd: options.cwd });
  }
  ```

- [x] Modify `packages/cli/src/commands/dev.ts`.

  - Parse engine override flags.
  - Load config.
  - Use `loaded.config.engine`.
  - Dispatch through `runEngineCommand`.
  - Keep config diagnostics before dispatch.

- [x] Modify `packages/cli/src/commands/build.ts`.

  Same pattern as `dev.ts`.

- [x] Create `packages/cli/src/create/engine-prompt.ts`.

  Behavior:

  - default selection: Forge;
  - `--engine forge` and `--forge` select Forge;
  - `--engine vite` and `--vite` select Vite;
  - interactive prompt can be added only if current create flow already has stdin available;
  - tests should cover non-interactive flags first.

- [x] Modify `packages/cli/src/create/app-template.ts` and `packages/cli/src/create/write-app.ts`.

  - Add `engine` to create options.
  - Render `vanrot.config.ts` with the selected engine.
  - For Forge apps, include `@vanrot/forge` dependency and avoid `vite` / `@vanrot/vite-plugin` unless another selected feature requires them.
  - For Vite apps, include `vite` and `@vanrot/vite-plugin`.
  - Keep package scripts:

    ```json
    {
      "dev": "vr dev",
      "build": "vr build"
    }
    ```

- [x] Modify `packages/cli/src/commands/metadata.ts`.

  - Document `--engine forge|vite`.
  - Document `--forge` and `--vite` overrides for `dev` and `build`.
  - Keep wording direct: Forge is recommended; Vite is compatibility.

- [x] Modify `packages/cli/src/commands/doctor.ts`.

  Add checks:

  - `engine: 'forge'` but `@vanrot/forge` missing.
  - `engine: 'vite'` but `vite` or `@vanrot/vite-plugin` missing.
  - Forge project with Vite-only config surfaces.
  - Vite project with Forge-only config surfaces.

- [x] Run:

  ```sh
  pnpm --filter @vanrot/forge build
  pnpm --filter @vanrot/cli test
  pnpm --filter @vanrot/cli typecheck
  ```

  Expected: CLI tests pass, with Forge selected by default for create.

### Task 5: Forge Core App Graph And Diagnostics

**Goal:** Build the Vanrot-native graph that dev, build, docs, benchmarks, and diagnostics share.

- [x] Create `packages/forge/src/core/file-roles.ts`.

  Include the role suffixes:

  ```ts
  export const forgeRoleSuffix = {
    page: 'page',
    component: 'component',
    layout: 'layout',
    widget: 'widget',
    form: 'form',
  } as const;
  ```

  Implement:

  - `classifyForgeFileRole(filePath)`;
  - `findOwnerRoleFile(filePath)`;
  - CSS/HTML owner mapping like `packages/vite-plugin/src/hot-update.ts`, but without Vite module graph types.

- [x] Create `packages/forge/src/core/source-files.ts`.

  - Recursively scan the configured source root.
  - Ignore `dist`, `node_modules`, `.vanrot`, and hidden build/cache folders.
  - Return normalized POSIX-style paths for diagnostics.

- [x] Create `packages/forge/src/core/app-graph.ts`.

  Build:

  ```ts
  export interface ForgeAppGraph {
    root: string;
    sourceRoot: string;
    files: ForgeSourceFile[];
    roleFiles: ForgeRoleFile[];
    routes: ForgeRouteGraph;
    diagnostics: ForgeDiagnostic[];
  }
  ```

  Use `@vanrot/config` to load normalized config. Use `@vanrot/compiler` helpers for component metadata where possible.

- [x] Create `packages/forge/src/core/routes.ts`.

  - Discover route files and page entries conservatively.
  - Do not invent route semantics outside existing router conventions.
  - If route discovery is incomplete, emit diagnostics instead of guessing.

- [x] Create `packages/forge/src/diagnostics/codes.ts`.

  Start with:

  ```ts
  export const forgeDiagnosticCode = {
    devNotImplemented: 'VRFORGE001',
    buildNotImplemented: 'VRFORGE002',
    unknownCommand: 'VRFORGE003',
    missingSourceRoot: 'VRFORGE004',
    unsupportedFileRole: 'VRFORGE005',
    routeDiscoveryFailed: 'VRFORGE006',
  } as const;
  ```

- [x] Create `packages/forge/src/diagnostics/format.ts`.

  Format diagnostics with:

  - code;
  - severity;
  - message;
  - file path;
  - affected role/route when known;
  - suggestion;
  - docs path.

- [x] Add tests:

  - `packages/forge/tests/app-graph.test.ts`
  - `packages/forge/tests/source-files.test.ts`
  - `packages/forge/tests/diagnostics.test.ts`

- [x] Run:

  ```sh
  pnpm --filter @vanrot/forge test
  pnpm --filter @vanrot/forge typecheck
  ```

  Expected: app graph scans fixtures and reports deterministic diagnostics.

### Task 6: Forge Dev Server MVP

**Goal:** Make `vanrot-forge dev` useful for a basic Vanrot app without calling Vite.

- [x] Create test fixtures under `packages/forge/tests/fixtures/dev-basic-app`.

  Fixture should include:

  - `vanrot.config.ts` with `engine: 'forge'`;
  - `src/main.ts`;
  - one `.page.ts/.page.html/.page.css` triplet;
  - one `.component.ts/.component.html/.component.css` triplet;
  - route metadata if required by the current router convention.

- [x] Create `packages/forge/src/dev/reload-planner.ts`.

  Implement reload plans:

  - `.page.html` -> `route-refresh`;
  - `.page.css` -> `style-patch`;
  - `.page.ts` -> `route-refresh`;
  - `.component.html` -> `component-refresh`;
  - `.component.css` -> `style-patch`;
  - `.component.ts` -> `component-refresh`;
  - `.layout.*` -> `layout-refresh`;
  - `vanrot.config.ts` -> `server-restart`;
  - unknown source file -> `full-reload`.

- [x] Create `packages/forge/src/dev/server.ts`.

  Use Node built-ins first:

  - `node:http` for server;
  - `node:fs/promises` for file reads;
  - `node:fs` watch APIs only if they stay reliable in tests;
  - server-sent events for push-based reload messages. Do not poll from the
    browser client — polling adds edit-loop latency and undercuts the
    "faster edit loop than Vite" benchmark target.

  Keep browser client code generated by Forge and scoped to dev.

- [x] Use `@vanrot/compiler`.

  Compile owner role files with `compileComponentFromFiles`. Do not duplicate compiler behavior inside Forge.

- [x] Add tests:

  - `packages/forge/tests/dev-server.test.ts`
  - `packages/forge/tests/reload-planner.test.ts`
  - `packages/forge/tests/dev-diagnostics.test.ts`

  Tests should verify:

  - server starts on configured port;
  - index route responds;
  - template/style edits produce the expected reload plan;
  - compile diagnostics are formatted as Forge diagnostics;
  - Forge dev does not invoke Vite.

- [x] Run:

  ```sh
  pnpm --filter @vanrot/forge test
  pnpm --filter @vanrot/cli test
  ```

  Expected: `vr dev` dispatches to Forge and Forge dev fixture passes.

### Task 7: Forge Build MVP

**Goal:** Make `vanrot-forge build` emit deployable Vanrot output from the app graph.

- [x] Create `packages/forge/src/build/build.ts`.

  Build pipeline:

  1. Load config.
  2. Build app graph.
  3. Compile role files with `@vanrot/compiler`.
  4. Emit browser assets.
  5. Emit route manifest.
  6. Emit asset manifest.
  7. Emit diagnostics summary.

- [x] Start with static output.

  SSR-ready entries can be added after static output is deterministic. Do not fake SSR output.

- [x] Add build output fixtures.

  Create `packages/forge/tests/fixtures/build-basic-app` and assert `dist/` output contains:

  - `index.html`;
  - browser JS;
  - CSS output;
  - `vanrot-routes.json`;
  - `vanrot-assets.json`;
  - diagnostics summary when warnings exist.

- [x] Integrate SEO and AI outputs only through stable package APIs.

  If an API is not stable enough, add a Forge diagnostic and a tracked TODO in `docs/superpowers/final-tdd-inventory.md` instead of inventing an unreviewed contract.

- [x] Add tests:

  - `packages/forge/tests/build.test.ts`
  - `packages/forge/tests/build-manifests.test.ts`
  - `packages/forge/tests/build-diagnostics.test.ts`

- [x] Run:

  ```sh
  pnpm --filter @vanrot/forge test
  pnpm --filter @vanrot/forge build
  pnpm --filter @vanrot/cli test
  ```

  Expected: Forge build emits static output and CLI dispatch passes.

### Task 8: First-Party Hook API

**Goal:** Add a narrow Vanrot-native hook API without cloning Vite plugins.

- [x] Create `packages/forge/src/hooks/hooks.ts`.

  Initial types:

  ```ts
  export interface ForgeHookContext {
    root: string;
    sourceRoot: string;
    graph: ForgeAppGraph;
    mode: 'dev' | 'build';
  }

  export interface ForgeHook {
    name: string;
    diagnostics?(context: ForgeHookContext): Promise<ForgeDiagnostic[]> | ForgeDiagnostic[];
    routeMetadata?(context: ForgeHookContext): Promise<unknown> | unknown;
    buildMetadata?(context: ForgeHookContext): Promise<unknown> | unknown;
    devtoolsMetadata?(context: ForgeHookContext): Promise<unknown> | unknown;
    aiMetadata?(context: ForgeHookContext): Promise<unknown> | unknown;
  }
  ```

- [x] Keep hook names readable and first-party.

  Do not add generic `transform`, `resolveId`, or Vite-compatible hook names in the first release.

- [x] Add hook registry helpers:

  - `createForgeHookRegistry`;
  - `runForgeDiagnosticsHooks`;
  - `runForgeBuildMetadataHooks`;
  - `runForgeDevtoolsMetadataHooks`;
  - `runForgeAiMetadataHooks`.

- [x] Add tests:

  - `packages/forge/tests/hooks.test.ts`
  - `packages/forge/tests/hook-diagnostics.test.ts`

- [x] Add first integrations only where public package APIs are stable.

  Priority:

  - router route metadata;
  - SEO build metadata;
  - AI/editor metadata;
  - devtools graph metadata.

- [x] Run:

  ```sh
  pnpm --filter @vanrot/forge test
  pnpm --filter @vanrot/router test
  pnpm --filter @vanrot/seo test
  pnpm --filter @vanrot/ai test
  ```

  Expected: hooks are deterministic and do not require Vite.

### Task 9: Benchmarks

**Goal:** Make "Forge is faster and lighter for Vanrot apps" testable.

- [x] Create benchmark fixtures:

  - `packages/forge/tests/fixtures/benchmarks/forge-basic-app`
  - `packages/forge/tests/fixtures/benchmarks/vite-basic-app`

  Fixtures should be equivalent Vanrot apps, with only the engine/tooling path changed.

- [x] Create `scripts/benchmark-forge.mjs`.

  Measure:

  - cold `vr dev` startup;
  - `.page.html` edit loop;
  - `.page.css` edit loop;
  - `.page.ts` edit loop;
  - `.component.*` edit loop;
  - route metadata edit loop;
  - dependency count / install surface;
  - production build output files.

- [x] Create `scripts/benchmark-forge.test.mjs`.

  This test should verify the benchmark harness is deterministic and reports required fields. It should not require strict timing thresholds on every machine.

- [x] Add package script in root `package.json`:

  ```json
  "benchmark:forge": "node scripts/benchmark-forge.mjs"
  ```

- [x] Document benchmark interpretation in the docs page task.

- [x] Run:

  ```sh
  pnpm vitest run scripts/benchmark-forge.test.mjs
  pnpm benchmark:forge
  ```

  Expected: benchmark command prints structured results and records whether Forge is faster for the checked fixture. If Forge is not faster yet, do not claim it publicly; keep the result as release-blocking evidence.

### Task 10: Rich Forge Docs IA

**Goal:** Ship rich docs-site pages that follow the real page-component convention.

- [x] Add docs tree entries in `apps/vanrot-site/src/docs/docs-page-tree.ts`.

  Required routes:

  - `/docs/forge`
  - `/docs/forge/dev`
  - `/docs/forge/build`
  - `/docs/forge/config`
  - `/docs/forge/hooks`
  - `/docs/forge/benchmarks`

  Required sidebar labels:

  - Forge
  - Dev Server
  - Build
  - Config
  - Hooks
  - Benchmarks

- [x] Create real page triplets for every route.

  Use shared docs components and shared docs CSS where possible. Page-local CSS should only hold page-specific layout exceptions.

- [x] Parent page `/docs/forge`.

  Must teach:

  - what Forge is;
  - why Vanrot has a native engine;
  - Forge vs Vite positioning;
  - package boundaries;
  - create -> dev -> build -> deploy lifecycle;
  - benchmark proof model;
  - links to all child pages.

- [x] Child page `/docs/forge/dev`.

  Must teach:

  - Vanrot file roles;
  - app graph scanning;
  - route-aware reloads;
  - reload planner outcomes;
  - diagnostics and overlays;
  - config/dependency changes;
  - failure states and repairs;
  - Vite compatibility comparison.

- [x] Child page `/docs/forge/build`.

  Must teach:

  - static output;
  - SSR-ready output boundary;
  - assets;
  - route manifest;
  - SEO outputs;
  - AI/editor metadata;
  - devtools metadata;
  - build diagnostics;
  - Vite compatibility comparison.

- [x] Child page `/docs/forge/config`.

  Must teach:

  - `engine: 'forge' | 'vite'`;
  - `vr create` engine choice;
  - command overrides;
  - starter scripts;
  - dependencies;
  - doctor checks;
  - migration in both directions.

- [x] Child page `/docs/forge/hooks`.

  Must teach:

  - first-party hook lifecycle;
  - supported hook capabilities;
  - unsupported generic plugin expectations;
  - package integration examples;
  - diagnostics;
  - why this is narrower than Vite plugins.

- [x] Child page `/docs/forge/benchmarks`.

  Must teach:

  - benchmark fixtures;
  - cold start;
  - edit loop timings;
  - dependency surface;
  - build output checks;
  - how to run `pnpm benchmark:forge`;
  - how to read failures;
  - why performance claims require evidence.

- [x] Update docs tests.

  Required proof:

  - every Forge page has a `.page.ts/.page.html/.page.css` triplet;
  - every Forge child is a real route;
  - sidebar includes parent and children;
  - route-to-article mapping works;
  - generated AI docs include every Forge page;
  - no Forge child is represented by a `#section` link.

- [x] Run:

  ```sh
  pnpm --filter @vanrot/vanrot-site test
  pnpm verify:site-docs
  pnpm verify:ai-docs
  pnpm verify:site-format
  ```

  Expected: docs routes, sidebar, generated docs, and formatting pass.

- [x] Restart the site dev server after docs edits:

  ```sh
  pkill -f "vite/bin/vite.js.*--port 1964" || true
  pnpm --filter @vanrot/vanrot-site dev -- --host 127.0.0.1 --port 1964
  ```

  Verify:

  ```sh
  curl -I http://localhost:1964/docs/forge
  curl -I http://localhost:1964/docs/forge/benchmarks
  ```

  Use browser inspection for visible layout, sidebar, and mobile readability.

### Task 11: Trackers, Inventory, And Release Closeout

**Goal:** Keep the Vanrot truth surface synchronized.

- [x] Update `docs/superpowers/feature-maturity.md`.

  Add Phase 32 as future-pipeline implementation work only when execution starts. Do not mark it `Production-Ready` until implementation, docs, benchmarks, and verification pass.

- [x] Update `docs/superpowers/final-tdd-inventory.md`.

  Add coverage entries for:

  - `@vanrot/forge`;
  - `engine: 'forge' | 'vite'`;
  - CLI dispatch;
  - create engine selection;
  - Forge app graph;
  - Forge dev server;
  - Forge build;
  - Forge hooks;
  - Forge benchmarks;
  - Forge docs IA.

- [x] Update `docs/superpowers/future-pipeline.md`.

  When implementation completes, tick only the shipped Forge scope. Leave unfinished future scope unchecked.

- [x] Update `docs/superpowers/plans/Phase-32.md` checkboxes as tasks complete.

- [x] Run final verification:

  ```sh
  pnpm verify
  pnpm benchmark:forge
  ```

  Expected:

  - `pnpm verify` passes;
  - runtime size budget still passes;
  - benchmark output exists and is truthful;
  - any benchmark where Forge is not faster is reported as release risk, not hidden.

- [x] Report final git status:

  ```sh
  git status --short --branch
  ```

  Include changed files, verification evidence, benchmark evidence, and unrelated local changes left untouched.

## Final Verification Checklist

- [x] `pnpm --filter @vanrot/config test`
- [x] `pnpm --filter @vanrot/forge test`
- [x] `pnpm --filter @vanrot/cli test`
- [x] `pnpm --filter @vanrot/vanrot-site test`
- [x] `pnpm verify:site-docs`
- [x] `pnpm verify:ai-docs`
- [x] `pnpm verify:site-format`
- [x] `pnpm verify:phase-docs`
- [x] `pnpm verify:size`
- [x] `pnpm verify`
- [x] `pnpm benchmark:forge`
- [x] Browser verification for `/docs/forge`
- [x] Browser verification for `/docs/forge/benchmarks`

## Self-Review

### Spec Coverage

- [x] Covers `@vanrot/forge` package.
- [x] Covers `engine: 'forge' | 'vite'`.
- [x] Keeps Vite as compatibility path.
- [x] Routes `vr dev` and `vr build` by engine choice.
- [x] Keeps package scripts engine-neutral.
- [x] Includes Forge dev server.
- [x] Includes Forge build pipeline.
- [x] Includes first-party hooks without cloning Vite plugins.
- [x] Includes benchmarks before public performance claims.
- [x] Includes rich docs IA with real child routes.
- [x] Includes tracker and inventory closeout.

### Placeholder Scan

- [x] No `TODO` placeholders without an owner task.
- [x] No fake docs child routes.
- [x] No hidden Vite dependency inside Forge.
- [x] No runtime package size increase.
- [x] No claims that Forge is faster without benchmark evidence.

### Type Consistency

- [x] Engine constants and types exported from `@vanrot/config`.
- [x] CLI engine parsing uses the config type, not duplicate string unions.
- [x] Forge diagnostics use named codes.
- [x] Docs route keys, article keys, and paths share one source of truth in `docs-page-tree.ts`.
