# Phase 16H Behavior Package Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. This repo disables subagent workflows; execute inline with review checkpoints.

**Goal:** Move headless behavior helpers out of `@vanrot/runtime` into optional `@vanrot/behavior`, then make create/remove/doctor/docs understand opt-in behavior selection.

**Architecture:** `@vanrot/runtime` returns to the small framework core: signals, lifecycle, mounting, input helpers, events, and compiler-facing internals. `@vanrot/behavior` becomes the optional headless behavior package, depends on `@vanrot/runtime`, exposes explicit subpaths for each behavior, and has no hard cap for `@vanrot/behavior/all` because that import is user choice. `vanrot.config.ts` records selected behavior names so `vr create`, `vr remove behavior`, and `vr doctor` can keep projects clean.

**Tech Stack:** TypeScript ESM, Vitest with jsdom for behavior tests, pnpm workspaces, `size-limit`, `@vanrot/config`, `@vanrot/cli`, and the `apps/vanrot-site` docs registry.

**Source Spec:** `docs/superpowers/specs/Phase-16H.md`

---

## File Structure

Create:
- `packages/behavior/package.json`: package manifest, build/typecheck/test scripts, root and subpath exports.
- `packages/behavior/tsconfig.json`: composite TypeScript package config referencing `../runtime`.
- `packages/behavior/src/index.ts`: root export for all first-migration behavior helpers.
- `packages/behavior/src/all.ts`: explicit all-behavior export for users who choose the full surface.
- `packages/behavior/src/form.ts`: form controller public subpath.
- `packages/behavior/src/table.ts`: table controller public subpath.
- `packages/behavior/src/overlay.ts`: overlay controller public subpath.
- `packages/behavior/src/tabs.ts`: tabs controller public subpath.
- `packages/behavior/src/tooltip.ts`: tooltip controller public subpath.
- `packages/behavior/src/toast.ts`: toast controller public subpath.
- `packages/behavior/src/command-menu.ts`: command menu controller public subpath.
- `packages/behavior/src/positioned-layer.ts`: positioned-layer helper public subpath.
- `packages/behavior/src/forms/form-controller.ts`: moved implementation from runtime with imports changed to `@vanrot/runtime`.
- `packages/behavior/src/ui/table-controller.ts`: moved implementation from runtime with imports changed to `@vanrot/runtime`.
- `packages/behavior/src/ui/overlay-controller.ts`: moved implementation from runtime with imports changed to `@vanrot/runtime`.
- `packages/behavior/src/ui/tabs-controller.ts`: moved implementation from runtime with imports changed to `@vanrot/runtime`.
- `packages/behavior/src/ui/tooltip-controller.ts`: moved implementation from runtime with imports changed to `@vanrot/runtime`.
- `packages/behavior/src/ui/toast-controller.ts`: moved implementation from runtime with imports changed to `@vanrot/runtime`.
- `packages/behavior/src/ui/command-menu-controller.ts`: moved implementation from runtime with imports changed to `@vanrot/runtime`.
- `packages/behavior/src/ui/positioned-layer.ts`: moved implementation from runtime without runtime imports.
- `packages/behavior/tests/exports/exports.test.ts`: package export and subpath import coverage.
- `packages/behavior/tests/forms/form-controller.test.ts`: moved form behavior tests.
- `packages/behavior/tests/ui/table-controller.test.ts`: moved table behavior tests.
- `packages/behavior/tests/ui/overlay-controller.test.ts`: moved overlay behavior tests.
- `packages/behavior/tests/ui/tabs-controller.test.ts`: moved tabs behavior tests.
- `packages/behavior/tests/ui/tooltip-controller.test.ts`: moved tooltip behavior tests.
- `packages/behavior/tests/ui/toast-controller.test.ts`: moved toast behavior tests.
- `packages/behavior/tests/ui/command-menu-controller.test.ts`: moved command menu behavior tests.
- `packages/behavior/tests/ui/positioned-layer.test.ts`: moved positioned-layer behavior tests.
- `packages/cli/src/behavior/catalog.ts`: CLI-owned list of behavior names, labels, package subpaths, config values, and import matchers.
- `packages/cli/src/create/behavior-prompt.ts`: interactive and flag-driven behavior selection for `vr create`.
- `packages/cli/src/remove/remove-behavior.ts`: implementation for `vr remove behavior <name>`.
- `packages/cli/src/commands/remove.ts`: command dispatcher for remove subcommands.
- `packages/cli/src/doctor/behavior.ts`: behavior-specific doctor checks.
- `packages/cli/tests/behavior-command.test.ts`: remove behavior command tests.
- `packages/cli/tests/behavior-doctor.test.ts`: unused/undeclared/stale behavior doctor tests.

Modify:
- `package.json`: keep `test:phase-docs` running runtime size verifier after the budget changes.
- `packages/runtime/package.json`: remove behavior-owned exports and keep runtime dependency graph core-only.
- `packages/runtime/tsconfig.json`: remove references that only existed for moved behavior if no longer needed.
- `packages/runtime/.size-limit.json`: lower runtime cap after behavior migration.
- `packages/runtime/src/index.ts`: remove public behavior exports.
- `packages/runtime/src/internal.ts`: remove compiler-internal form/table behavior exports.
- `packages/runtime/tests/exports/exports.test.ts`: assert runtime no longer exposes behavior helpers.
- `packages/runtime/tests/forms/form-controller.test.ts`: delete after moving to `packages/behavior`.
- `packages/runtime/tests/ui/*.test.ts`: delete moved behavior tests.
- `packages/config/src/types.ts`: add `behavior.enabled` config types.
- `packages/config/src/defaults.ts`: normalize `behavior.enabled` to an empty array by default.
- `packages/config/src/diagnostics.ts`: add behavior validation diagnostic code.
- `packages/config/src/validate.ts`: validate `behavior.enabled`.
- `packages/config/src/index.ts`: export behavior config types and constants.
- `packages/config/tests/defaults.test.ts`: cover default and explicit behavior config.
- `packages/config/tests/validate.test.ts`: cover invalid behavior config.
- `packages/cli/package.json`: make CLI build/test depend on `@vanrot/behavior` and `@vanrot/config` changes.
- `packages/cli/src/create/app-template.ts`: add optional behavior dependency and config output.
- `packages/cli/src/create/write-app.ts`: thread selected behavior names into template creation.
- `packages/cli/src/commands/create.ts`: parse behavior flags and call the create behavior prompt.
- `packages/cli/src/commands/metadata.ts`: document `vr remove behavior`, `--behavior`, and `--no-behavior`.
- `packages/cli/src/cli.ts`: register the remove command.
- `packages/cli/tests/create.test.ts`: cover prompt/flag/no-behavior create output.
- `packages/cli/tests/cli.test.ts`: cover help text for remove and behavior flags.
- `packages/cli/tests/doctor.test.ts`: keep existing doctor tests passing after new behavior checks are wired.
- `apps/vanrot-site/src/docs/framework-reference.json`: add `@vanrot/behavior`, behavior commands, and behavior config docs.
- `apps/vanrot-site/src/docs/site-data.ts`: add `behavior` to the `siteArticleKey` source of truth so nav and routes can reference it.
- `apps/vanrot-site/src/docs/site-data.json`: add the behavior article body to the `articles` array.
- `apps/vanrot-site/src/docs/site-navigation.ts`: add the behavior guide nav entry via `navItem(siteArticleKey.behavior)`.
- `apps/vanrot-site/src/routes.ts`: register the `/docs/behavior` article route via `articlePage(siteArticleKey.behavior)` and add it to the docs route table.
- `apps/vanrot-site/src/docs/example-matrix.ts`: include a behavior workflow/package example.
- `apps/vanrot-site/tests/framework-reference.test.ts`: update package, command, and example coverage.
- `apps/vanrot-site/tests/site-pages.test.ts`: add route coverage if a behavior article route is added.
- `docs/ai/index.json`: refresh generated AI docs after docs changes.
- `docs/ai/manifest.json`: refresh generated AI docs fingerprint after docs changes.
- `docs/ai/knowledge/routes.md`: refresh generated AI route knowledge after docs changes.
- `docs/superpowers/final-tdd-inventory.md`: add `@vanrot/behavior` package and update runtime boundary rows.
- `docs/superpowers/post-production-implementation-ideas.md`: record future behavior backlog from the design spec.
- `AGENTS.md`: update runtime size budget note after behavior leaves runtime.
- `CLAUDE.md`: mirror the runtime size budget note.
- `scripts/verify-runtime-size-budget.test.mjs`: assert the new post-migration runtime cap and docs wording.

Delete after moving:
- `packages/runtime/src/forms/form-controller.ts`
- `packages/runtime/src/ui/table-controller.ts`
- `packages/runtime/src/ui/overlay-controller.ts`
- `packages/runtime/src/ui/tabs-controller.ts`
- `packages/runtime/src/ui/tooltip-controller.ts`
- `packages/runtime/src/ui/toast-controller.ts`
- `packages/runtime/src/ui/command-menu-controller.ts`
- `packages/runtime/src/ui/positioned-layer.ts`

---

### Task 1: Add Behavior Config Schema

**Files:**
- Modify: `packages/config/src/types.ts`
- Modify: `packages/config/src/defaults.ts`
- Modify: `packages/config/src/diagnostics.ts`
- Modify: `packages/config/src/validate.ts`
- Modify: `packages/config/src/index.ts`
- Test: `packages/config/tests/defaults.test.ts`
- Test: `packages/config/tests/validate.test.ts`

- [x] **Step 1: Write failing default config tests**

Add these tests to `packages/config/tests/defaults.test.ts`:

```ts
it('defaults behavior helpers to an empty opt-in list', () => {
  const normalized = normalizeVanrotConfig({});

  expect(normalized.behavior.enabled).toEqual([]);
});

it('respects explicit behavior helper selections', () => {
  const normalized = normalizeVanrotConfig({
    behavior: {
      enabled: ['tooltip', 'toast'],
    },
  });

  expect(normalized.behavior.enabled).toEqual(['tooltip', 'toast']);
});
```

- [x] **Step 2: Write failing validation tests**

Add these tests to `packages/config/tests/validate.test.ts`:

```ts
it('accepts known behavior helper names', () => {
  const diagnostics = validateVanrotConfig({
    behavior: {
      enabled: ['form', 'table', 'overlay', 'tabs', 'tooltip', 'toast', 'command-menu', 'positioned-layer'],
    },
  });

  expect(diagnostics).toEqual([]);
});

it('reports invalid behavior helper names', () => {
  const diagnostics = validateVanrotConfig({
    behavior: {
      enabled: ['accordion'],
    },
  } as unknown as Parameters<typeof validateVanrotConfig>[0]);

  expect(diagnostics).toEqual([
    {
      code: configDiagnosticCode.invalidBehavior,
      severity: 'error',
      message: 'Invalid behavior.enabled entry: accordion',
      suggestion: 'Use form, table, overlay, tabs, tooltip, toast, command-menu, or positioned-layer.',
    },
  ]);
});

it('reports non-array behavior helper config', () => {
  const diagnostics = validateVanrotConfig({
    behavior: {
      enabled: 'tooltip',
    },
  } as unknown as Parameters<typeof validateVanrotConfig>[0]);

  expect(diagnostics).toEqual([
    {
      code: configDiagnosticCode.invalidBehavior,
      severity: 'error',
      message: 'Invalid behavior.enabled: tooltip',
      suggestion: 'Use an array of behavior helper names.',
    },
  ]);
});
```

- [x] **Step 3: Run the config tests to verify they fail**

Run: `pnpm --filter @vanrot/config test -- defaults validate`

Expected: FAIL because `NormalizedVanrotConfig` has no `behavior` field, `configDiagnosticCode.invalidBehavior` does not exist, and `validateVanrotConfig` treats `behavior` as an unknown top-level key.

- [x] **Step 4: Add behavior config types**

In `packages/config/src/types.ts`, add this near the UI/router constants:

```ts
export const vanrotBehavior = {
  form: 'form',
  table: 'table',
  overlay: 'overlay',
  tabs: 'tabs',
  tooltip: 'tooltip',
  toast: 'toast',
  commandMenu: 'command-menu',
  positionedLayer: 'positioned-layer',
} as const;

export type VanrotBehaviorName = (typeof vanrotBehavior)[keyof typeof vanrotBehavior];

export interface VanrotBehaviorConfig {
  enabled?: VanrotBehaviorName[];
}

export interface NormalizedVanrotBehaviorConfig {
  enabled: VanrotBehaviorName[];
}
```

Update the config interfaces in the same file:

```ts
export interface VanrotConfig {
  schemaVersion?: number;
  project?: { name?: string };
  source?: { root?: string };
  devServer?: { port?: number };
  router?: VanrotRouterConfig;
  ui?: VanrotUiConfig;
  behavior?: VanrotBehaviorConfig;
  store?: Record<string, unknown>;
  testing?: Record<string, unknown>;
  build?: Record<string, unknown>;
  cache?: Record<string, unknown>;
  docs?: Record<string, unknown>;
  ai?: VanrotAiConfig;
  conventions?: Record<string, unknown>;
}

export interface NormalizedVanrotConfig
  extends Omit<
    VanrotConfig,
    'schemaVersion' | 'source' | 'devServer' | 'router' | 'ui' | 'behavior' | 'ai'
  > {
  schemaVersion: number;
  source: { root: string };
  devServer: { port: number };
  router: NormalizedVanrotRouterConfig;
  ui: NormalizedVanrotUiConfig;
  behavior: NormalizedVanrotBehaviorConfig;
  ai: NormalizedVanrotAiConfig;
}
```

- [x] **Step 5: Normalize behavior config**

In `packages/config/src/defaults.ts`, add `behavior` to the returned object:

```ts
behavior: {
  enabled: config.behavior?.enabled ?? [],
},
```

- [x] **Step 6: Add validation diagnostics**

In `packages/config/src/diagnostics.ts`, add the next code:

```ts
invalidBehavior: 'VRCFG013',
```

In `packages/config/src/validate.ts`, import `vanrotBehavior`, add `behavior` to `knownTopLevelKeys`, and add this validation block:

```ts
const knownBehaviorNames = new Set<string>(Object.values(vanrotBehavior));

const behavior = config.behavior as { enabled?: unknown } | undefined;
if (behavior?.enabled !== undefined && !Array.isArray(behavior.enabled)) {
  diagnostics.push({
    code: configDiagnosticCode.invalidBehavior,
    severity: 'error',
    message: `Invalid behavior.enabled: ${String(behavior.enabled)}`,
    suggestion: 'Use an array of behavior helper names.',
  });
}

if (Array.isArray(behavior?.enabled)) {
  for (const behaviorName of behavior.enabled) {
    if (knownBehaviorNames.has(String(behaviorName))) {
      continue;
    }

    diagnostics.push({
      code: configDiagnosticCode.invalidBehavior,
      severity: 'error',
      message: `Invalid behavior.enabled entry: ${String(behaviorName)}`,
      suggestion: 'Use form, table, overlay, tabs, tooltip, toast, command-menu, or positioned-layer.',
    });
  }
}
```

- [x] **Step 7: Export behavior config types and constants**

In `packages/config/src/index.ts`, add value exports:

```ts
export { vanrotBehavior } from './types.js';
```

Add type exports:

```ts
NormalizedVanrotBehaviorConfig,
VanrotBehaviorConfig,
VanrotBehaviorName,
```

- [x] **Step 8: Run config tests to verify they pass**

Run: `pnpm --filter @vanrot/config test -- defaults validate`

Expected: PASS for defaults and validate tests.

- [x] **Step 9: Checkpoint**

Run: `git status --short`

Expected: config source and config test files are modified only. Do not stage or commit unless the user explicitly asks.

---

### Task 2: Create `@vanrot/behavior` Package Shell

**Files:**
- Create: `packages/behavior/package.json`
- Create: `packages/behavior/tsconfig.json`
- Create: `packages/behavior/src/index.ts`
- Create: `packages/behavior/src/all.ts`
- Create: `packages/behavior/src/form.ts`
- Create: `packages/behavior/src/table.ts`
- Create: `packages/behavior/src/overlay.ts`
- Create: `packages/behavior/src/tabs.ts`
- Create: `packages/behavior/src/tooltip.ts`
- Create: `packages/behavior/src/toast.ts`
- Create: `packages/behavior/src/command-menu.ts`
- Create: `packages/behavior/src/positioned-layer.ts`
- Create: `packages/behavior/tests/exports/exports.test.ts`

- [x] **Step 1: Write the failing package export test**

Create `packages/behavior/tests/exports/exports.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import * as behavior from '../../src/index.js';

describe('@vanrot/behavior exports', () => {
  it('exposes the migrated behavior helpers at the package root', () => {
    expect(behavior.createFormController).toBeTypeOf('function');
    expect(behavior.createTableController).toBeTypeOf('function');
    expect(behavior.connectTableFilter).toBeTypeOf('function');
    expect(behavior.createOverlayController).toBeTypeOf('function');
    expect(behavior.createTabsController).toBeTypeOf('function');
    expect(behavior.createTooltipController).toBeTypeOf('function');
    expect(behavior.createToastController).toBeTypeOf('function');
    expect(behavior.createCommandMenuController).toBeTypeOf('function');
    expect(behavior.positionLayer).toBeTypeOf('function');
  });

  it('supports explicit subpath source modules', async () => {
    await expect(import('../../src/form.js')).resolves.toMatchObject({
      createFormController: expect.any(Function),
    });
    await expect(import('../../src/table.js')).resolves.toMatchObject({
      createTableController: expect.any(Function),
      connectTableFilter: expect.any(Function),
    });
    await expect(import('../../src/tooltip.js')).resolves.toMatchObject({
      createTooltipController: expect.any(Function),
    });
    await expect(import('../../src/all.js')).resolves.toMatchObject({
      createCommandMenuController: expect.any(Function),
      positionLayer: expect.any(Function),
    });
  });
});
```

- [x] **Step 2: Run the behavior test to verify it fails**

Run: `pnpm --filter @vanrot/behavior test -- exports`

Expected: FAIL because `@vanrot/behavior` does not exist.

- [x] **Step 3: Create the behavior package manifest**

Create `packages/behavior/package.json`:

```json
{
  "name": "@vanrot/behavior",
  "version": "0.1.0",
  "type": "module",
  "engines": {
    "node": ">=22.14.0"
  },
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./all": {
      "types": "./dist/all.d.ts",
      "import": "./dist/all.js"
    },
    "./form": {
      "types": "./dist/form.d.ts",
      "import": "./dist/form.js"
    },
    "./table": {
      "types": "./dist/table.d.ts",
      "import": "./dist/table.js"
    },
    "./overlay": {
      "types": "./dist/overlay.d.ts",
      "import": "./dist/overlay.js"
    },
    "./tabs": {
      "types": "./dist/tabs.d.ts",
      "import": "./dist/tabs.js"
    },
    "./tooltip": {
      "types": "./dist/tooltip.d.ts",
      "import": "./dist/tooltip.js"
    },
    "./toast": {
      "types": "./dist/toast.d.ts",
      "import": "./dist/toast.js"
    },
    "./command-menu": {
      "types": "./dist/command-menu.d.ts",
      "import": "./dist/command-menu.js"
    },
    "./positioned-layer": {
      "types": "./dist/positioned-layer.d.ts",
      "import": "./dist/positioned-layer.js"
    }
  },
  "files": [
    "dist"
  ],
  "dependencies": {
    "@vanrot/runtime": "file:../runtime"
  },
  "scripts": {
    "prebuild": "pnpm --filter @vanrot/runtime build",
    "build": "tsc -p tsconfig.json",
    "pretypecheck": "pnpm --filter @vanrot/runtime build",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "pretest": "pnpm --filter @vanrot/runtime build",
    "test": "vitest run",
    "clean": "node -e \"import('node:fs').then(({ rmSync }) => rmSync('dist', { recursive: true, force: true }))\""
  }
}
```

- [x] **Step 4: Create the TypeScript config**

Create `packages/behavior/tsconfig.json`:

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
  "references": [{ "path": "../runtime" }]
}
```

- [x] **Step 5: Create public barrel files**

Create `packages/behavior/src/index.ts`:

```ts
export type {
  FormController,
  FormErrors,
  FormFieldController,
  FormFieldOptions,
  FormFieldValue,
  FormValidator,
  FormValues,
} from './forms/form-controller.js';
export {
  createFormController,
  emailValidator,
  minLengthValidator,
  requiredValidator,
} from './forms/form-controller.js';
export type { OverlayController, OverlayControllerOptions } from './ui/overlay-controller.js';
export { createOverlayController } from './ui/overlay-controller.js';
export type {
  CommandMenuController,
  CommandMenuControllerOptions,
} from './ui/command-menu-controller.js';
export { createCommandMenuController } from './ui/command-menu-controller.js';
export type { LayerAlign, LayerSide, PositionLayerOptions } from './ui/positioned-layer.js';
export { positionLayer } from './ui/positioned-layer.js';
export type { TabsController, TabsControllerOptions } from './ui/tabs-controller.js';
export { createTabsController } from './ui/tabs-controller.js';
export type { TooltipController, TooltipControllerOptions } from './ui/tooltip-controller.js';
export { createTooltipController } from './ui/tooltip-controller.js';
export type {
  ToastController,
  ToastControllerOptions,
  ToastMessage,
  ToastMessageInput,
  ToastTone,
} from './ui/toast-controller.js';
export { createToastController } from './ui/toast-controller.js';
export type {
  TableColumn,
  TableController,
  TableControllerOptions,
  TableFilterOptions,
  TableSortDirection,
  TableState,
} from './ui/table-controller.js';
export { connectTableFilter, createTableController } from './ui/table-controller.js';
```

Create `packages/behavior/src/all.ts`:

```ts
export * from './index.js';
```

Create `packages/behavior/src/form.ts`:

```ts
export type {
  FormController,
  FormErrors,
  FormFieldController,
  FormFieldOptions,
  FormFieldValue,
  FormValidator,
  FormValues,
} from './forms/form-controller.js';
export {
  createFormController,
  emailValidator,
  minLengthValidator,
  requiredValidator,
} from './forms/form-controller.js';
```

Create `packages/behavior/src/table.ts`:

```ts
export type {
  TableColumn,
  TableController,
  TableControllerOptions,
  TableFilterOptions,
  TableSortDirection,
  TableState,
} from './ui/table-controller.js';
export { connectTableFilter, createTableController } from './ui/table-controller.js';
```

Create `packages/behavior/src/overlay.ts`:

```ts
export type { OverlayController, OverlayControllerOptions } from './ui/overlay-controller.js';
export { createOverlayController } from './ui/overlay-controller.js';
```

Create `packages/behavior/src/tabs.ts`:

```ts
export type { TabsController, TabsControllerOptions } from './ui/tabs-controller.js';
export { createTabsController } from './ui/tabs-controller.js';
```

Create `packages/behavior/src/tooltip.ts`:

```ts
export type { TooltipController, TooltipControllerOptions } from './ui/tooltip-controller.js';
export { createTooltipController } from './ui/tooltip-controller.js';
```

Create `packages/behavior/src/toast.ts`:

```ts
export type {
  ToastController,
  ToastControllerOptions,
  ToastMessage,
  ToastMessageInput,
  ToastTone,
} from './ui/toast-controller.js';
export { createToastController } from './ui/toast-controller.js';
```

Create `packages/behavior/src/command-menu.ts`:

```ts
export type {
  CommandMenuController,
  CommandMenuControllerOptions,
} from './ui/command-menu-controller.js';
export { createCommandMenuController } from './ui/command-menu-controller.js';
```

Create `packages/behavior/src/positioned-layer.ts`:

```ts
export type { LayerAlign, LayerSide, PositionLayerOptions } from './ui/positioned-layer.js';
export { positionLayer } from './ui/positioned-layer.js';
```

- [x] **Step 6: Run the behavior test to verify the shell still fails for missing implementations**

Run: `pnpm --filter @vanrot/behavior test -- exports`

Expected: FAIL because barrel files reference implementation files that are not created yet.

- [x] **Step 7: Checkpoint**

Run: `git status --short`

Expected: new `packages/behavior` package shell and export test files are visible. Do not stage or commit.

---

### Task 3: Move Behavior Implementations And Tests

**Files:**
- Create: `packages/behavior/src/forms/form-controller.ts`
- Create: `packages/behavior/src/ui/table-controller.ts`
- Create: `packages/behavior/src/ui/overlay-controller.ts`
- Create: `packages/behavior/src/ui/tabs-controller.ts`
- Create: `packages/behavior/src/ui/tooltip-controller.ts`
- Create: `packages/behavior/src/ui/toast-controller.ts`
- Create: `packages/behavior/src/ui/command-menu-controller.ts`
- Create: `packages/behavior/src/ui/positioned-layer.ts`
- Create: `packages/behavior/tests/forms/form-controller.test.ts`
- Create: `packages/behavior/tests/ui/table-controller.test.ts`
- Create: `packages/behavior/tests/ui/overlay-controller.test.ts`
- Create: `packages/behavior/tests/ui/tabs-controller.test.ts`
- Create: `packages/behavior/tests/ui/tooltip-controller.test.ts`
- Create: `packages/behavior/tests/ui/toast-controller.test.ts`
- Create: `packages/behavior/tests/ui/command-menu-controller.test.ts`
- Create: `packages/behavior/tests/ui/positioned-layer.test.ts`
- Delete: matching `packages/runtime/tests/forms` and `packages/runtime/tests/ui` behavior tests after the new tests pass.

- [x] **Step 1: Copy behavior source files into the new package**

Create these files with the exact current source from the matching runtime file:

```text
packages/runtime/src/forms/form-controller.ts -> packages/behavior/src/forms/form-controller.ts
packages/runtime/src/ui/table-controller.ts -> packages/behavior/src/ui/table-controller.ts
packages/runtime/src/ui/overlay-controller.ts -> packages/behavior/src/ui/overlay-controller.ts
packages/runtime/src/ui/tabs-controller.ts -> packages/behavior/src/ui/tabs-controller.ts
packages/runtime/src/ui/tooltip-controller.ts -> packages/behavior/src/ui/tooltip-controller.ts
packages/runtime/src/ui/toast-controller.ts -> packages/behavior/src/ui/toast-controller.ts
packages/runtime/src/ui/command-menu-controller.ts -> packages/behavior/src/ui/command-menu-controller.ts
packages/runtime/src/ui/positioned-layer.ts -> packages/behavior/src/ui/positioned-layer.ts
```

In every copied behavior implementation that currently has this import:

```ts
import { signal, type WritableSignal } from '../reactive/signal.js';
```

Replace it with this import:

```ts
import { signal, type WritableSignal } from '@vanrot/runtime';
```

`packages/behavior/src/ui/positioned-layer.ts` has no runtime import and should keep its existing implementation unchanged.

- [x] **Step 2: Copy behavior tests into the new package**

Create these tests with the exact current source from the matching runtime test:

```text
packages/runtime/tests/forms/form-controller.test.ts -> packages/behavior/tests/forms/form-controller.test.ts
packages/runtime/tests/ui/table-controller.test.ts -> packages/behavior/tests/ui/table-controller.test.ts
packages/runtime/tests/ui/overlay-controller.test.ts -> packages/behavior/tests/ui/overlay-controller.test.ts
packages/runtime/tests/ui/tabs-controller.test.ts -> packages/behavior/tests/ui/tabs-controller.test.ts
packages/runtime/tests/ui/tooltip-controller.test.ts -> packages/behavior/tests/ui/tooltip-controller.test.ts
packages/runtime/tests/ui/toast-controller.test.ts -> packages/behavior/tests/ui/toast-controller.test.ts
packages/runtime/tests/ui/command-menu-controller.test.ts -> packages/behavior/tests/ui/command-menu-controller.test.ts
packages/runtime/tests/ui/positioned-layer.test.ts -> packages/behavior/tests/ui/positioned-layer.test.ts
```

In copied tests, replace runtime source imports:

```ts
import { createTooltipController } from '../../src/ui/tooltip-controller.js';
```

with behavior source imports at the same relative depth:

```ts
import { createTooltipController } from '../../src/ui/tooltip-controller.js';
```

The text remains the same for copied `tests/ui/*` files because their relative depth matches. For copied `tests/forms/*`, keep the relative import target:

```ts
import { createFormController } from '../../src/forms/form-controller.js';
```

- [x] **Step 3: Run behavior tests**

Run: `pnpm --filter @vanrot/behavior test`

Expected: PASS for all moved behavior tests and the export test.

- [x] **Step 4: Run behavior typecheck**

Run: `pnpm --filter @vanrot/behavior typecheck`

Expected: PASS. If TypeScript cannot resolve `@vanrot/runtime`, confirm `packages/behavior/tsconfig.json` references `../runtime` and `packages/behavior/package.json` depends on `@vanrot/runtime`.

- [x] **Step 5: Delete moved runtime behavior tests**

Delete these files only after the behavior package tests pass:

```text
packages/runtime/tests/forms/form-controller.test.ts
packages/runtime/tests/ui/table-controller.test.ts
packages/runtime/tests/ui/overlay-controller.test.ts
packages/runtime/tests/ui/tabs-controller.test.ts
packages/runtime/tests/ui/tooltip-controller.test.ts
packages/runtime/tests/ui/toast-controller.test.ts
packages/runtime/tests/ui/command-menu-controller.test.ts
packages/runtime/tests/ui/positioned-layer.test.ts
```

- [x] **Step 6: Checkpoint**

Run: `git status --short`

Expected: behavior implementation and test files exist, runtime behavior tests are deleted, and runtime behavior source files still exist until Task 4 removes runtime exports safely.

---

### Task 4: Strip Behavior From Runtime And Restore Core Runtime Budget

**Files:**
- Modify: `packages/runtime/src/index.ts`
- Modify: `packages/runtime/src/internal.ts`
- Modify: `packages/runtime/tests/exports/exports.test.ts`
- Modify: `packages/runtime/.size-limit.json`
- Modify: `scripts/verify-runtime-size-budget.test.mjs`
- Modify: `AGENTS.md`
- Modify: `CLAUDE.md`
- Delete: `packages/runtime/src/forms/form-controller.ts`
- Delete: `packages/runtime/src/ui/table-controller.ts`
- Delete: `packages/runtime/src/ui/overlay-controller.ts`
- Delete: `packages/runtime/src/ui/tabs-controller.ts`
- Delete: `packages/runtime/src/ui/tooltip-controller.ts`
- Delete: `packages/runtime/src/ui/toast-controller.ts`
- Delete: `packages/runtime/src/ui/command-menu-controller.ts`
- Delete: `packages/runtime/src/ui/positioned-layer.ts`

- [x] **Step 1: Write failing runtime export assertions**

In `packages/runtime/tests/exports/exports.test.ts`, replace the public behavior assertions:

```ts
expect(runtime.createFormController).toBeTypeOf('function');
expect(runtime.emailValidator).toBeTypeOf('function');
expect(runtime.positionLayer).toBeTypeOf('function');
expect(runtime.createTooltipController).toBeTypeOf('function');
expect(runtime.createCommandMenuController).toBeTypeOf('function');
```

with absence checks:

```ts
expect('createFormController' in runtime).toBe(false);
expect('emailValidator' in runtime).toBe(false);
expect('positionLayer' in runtime).toBe(false);
expect('createTooltipController' in runtime).toBe(false);
expect('createCommandMenuController' in runtime).toBe(false);
```

Replace compiler-internal behavior assertions:

```ts
expect(internal.connectFormControl).toBeTypeOf('function');
expect(internal.createTableController).toBeTypeOf('function');
expect(internal.connectTableFilter).toBeTypeOf('function');
```

with absence checks:

```ts
expect('connectFormControl' in internal).toBe(false);
expect('createTableController' in internal).toBe(false);
expect('connectTableFilter' in internal).toBe(false);
```

- [x] **Step 2: Run runtime export test to verify it fails**

Run: `pnpm --filter @vanrot/runtime test -- exports`

Expected: FAIL because runtime still exports behavior helpers.

- [x] **Step 3: Remove behavior exports from runtime barrels**

In `packages/runtime/src/index.ts`, remove every export line for:

```text
./forms/form-controller.js
./ui/overlay-controller.js
./ui/command-menu-controller.js
./ui/positioned-layer.js
./ui/tabs-controller.js
./ui/tooltip-controller.js
./ui/toast-controller.js
./ui/table-controller.js
```

In `packages/runtime/src/internal.ts`, keep compiler-facing lifecycle and event exports, and remove:

```ts
export { connectFormControl } from './forms/form-controller.js';
export { connectTableFilter, createTableController } from './ui/table-controller.js';
```

- [x] **Step 4: Delete runtime behavior implementation files**

Delete:

```text
packages/runtime/src/forms/form-controller.ts
packages/runtime/src/ui/table-controller.ts
packages/runtime/src/ui/overlay-controller.ts
packages/runtime/src/ui/tabs-controller.ts
packages/runtime/src/ui/tooltip-controller.ts
packages/runtime/src/ui/toast-controller.ts
packages/runtime/src/ui/command-menu-controller.ts
packages/runtime/src/ui/positioned-layer.ts
```

Leave empty directories only if needed by the current tree. Prefer deleting empty `packages/runtime/src/forms` and `packages/runtime/src/ui` directories after their files are gone.

- [x] **Step 5: Measure the stripped runtime core, then set the cap**

Do not hardcode the cap before measuring. The `3.99 KB` figure below is an expected ceiling, not a guarantee — the controllers are ~67% of runtime source today, so the core should land well under it, but the only authority is the measured number.

First build and measure the stripped core:

```sh
pnpm --filter @vanrot/runtime build
pnpm --filter @vanrot/runtime size
```

Read the measured gzip size for `dist/index.js` + `dist/internal.js`. Choose the cap as `ceil(measured * 1.10)` rounded to two decimals (≈10% headroom), and use that value everywhere below. Call this value `<RUNTIME_CAP>`.

- If `<RUNTIME_CAP>` ≤ `3.99 KB`, use the measured-derived value (it should be smaller — good).
- If the measured core already exceeds `3.99 KB`, STOP and report the exact size to the user before writing any cap: this contradicts the spec's "smaller core" expectation and means something behavior-shaped is still in the core or runtime grew. Resolve that before continuing.

In `packages/runtime/.size-limit.json`, set the limit to `<RUNTIME_CAP>`:

```json
[
  {
    "name": "@vanrot/runtime (public + internal)",
    "path": ["dist/index.js", "dist/internal.js"],
    "limit": "<RUNTIME_CAP>",
    "gzip": true
  }
]
```

In `scripts/verify-runtime-size-budget.test.mjs`, update expectations so the verifier asserts `<RUNTIME_CAP>` (and the matching docs wording) and no longer treats behavior controllers as justified runtime content.

In `AGENTS.md` and `CLAUDE.md`, replace the 9.99 KB behavior-era wording with the same `<RUNTIME_CAP>` value:

```md
## Runtime Size Budget Protocol

`@vanrot/runtime` is the core browser runtime and must stay under `<RUNTIME_CAP>` gzipped for `dist/index.js` plus `dist/internal.js`.

Headless UI/application behavior belongs in `@vanrot/behavior`, not `@vanrot/runtime`. If `pnpm verify:size` reaches or breaches the runtime cap, report the exact size and explain which core runtime feature caused it before raising the cap.
```

Keep `<RUNTIME_CAP>` identical across `.size-limit.json`, `verify-runtime-size-budget.test.mjs`, `AGENTS.md`, and `CLAUDE.md` — one value, four files.

- [x] **Step 6: Run runtime tests and size verification**

Run: `pnpm --filter @vanrot/runtime test`

Expected: PASS with only core runtime tests.

Run: `pnpm --filter @vanrot/runtime typecheck`

Expected: PASS.

Run: `pnpm --filter @vanrot/runtime size`

Expected: PASS and runtime size at or below `<RUNTIME_CAP>` (the measured-derived value from Step 5).

Run: `pnpm exec vitest run scripts/verify-runtime-size-budget.test.mjs`

Expected: PASS.

- [x] **Step 7: Checkpoint**

Run: `git status --short`

Expected: runtime no longer contains behavior implementations or behavior tests, behavior package owns them, and runtime cap is restored below 4 KB.

---

### Task 5: Wire CLI Create Behavior Selection

**Files:**
- Create: `packages/cli/src/behavior/catalog.ts`
- Create: `packages/cli/src/create/behavior-prompt.ts`
- Modify: `packages/cli/src/create/app-template.ts`
- Modify: `packages/cli/src/create/write-app.ts`
- Modify: `packages/cli/src/commands/create.ts`
- Modify: `packages/cli/package.json`
- Test: `packages/cli/tests/create.test.ts`

- [x] **Step 1: Write failing create tests for behavior selection**

Add these tests to `packages/cli/tests/create.test.ts`:

```ts
it('scaffolds behavior config and dependency when behavior helpers are selected', async () => {
  const cwd = await createTempDirectory();
  const reporter = createMemoryReporter();

  const result = await runCli(['create', 'behavior-app', '--behavior', 'tooltip,toast'], {
    cwd,
    reporter,
  });

  const appRoot = join(cwd, 'behavior-app');
  const packageJson = JSON.parse(await readFile(join(appRoot, 'package.json'), 'utf8')) as {
    dependencies?: Record<string, string>;
  };
  const configSource = await readFile(join(appRoot, 'vanrot.config.ts'), 'utf8');

  expect(result.exitCode).toBe(0);
  expect(packageJson.dependencies).toMatchObject({
    '@vanrot/behavior': expect.stringMatching(/^\\^\\d+\\.\\d+\\.\\d+/),
  });
  expect(configSource).toContain("behavior: {");
  expect(configSource).toContain("enabled: ['tooltip', 'toast']");
});

it('does not install behavior when behavior helpers are declined', async () => {
  const cwd = await createTempDirectory();
  const reporter = createMemoryReporter();

  const result = await runCli(['create', 'lean-app', '--no-behavior'], { cwd, reporter });

  const appRoot = join(cwd, 'lean-app');
  const packageJson = JSON.parse(await readFile(join(appRoot, 'package.json'), 'utf8')) as {
    dependencies?: Record<string, string>;
  };
  const configSource = await readFile(join(appRoot, 'vanrot.config.ts'), 'utf8');

  expect(result.exitCode).toBe(0);
  expect(packageJson.dependencies?.['@vanrot/behavior']).toBeUndefined();
  expect(configSource).not.toContain('behavior:');
});

it('rejects unknown behavior helper names during create', async () => {
  const cwd = await createTempDirectory();
  const reporter = createMemoryReporter();

  const result = await runCli(['create', 'bad-behavior-app', '--behavior', 'accordion'], {
    cwd,
    reporter,
  });

  expect(result.exitCode).toBe(1);
  expect(reporter.messages.some((message) => message.includes('Unknown behavior helper'))).toBe(true);
});
```

- [x] **Step 2: Run create tests to verify they fail**

Run: `pnpm --filter @vanrot/cli test -- create`

Expected: FAIL because `--behavior`, `--no-behavior`, behavior dependency output, and config output are not implemented.

- [x] **Step 3: Create behavior catalog**

Create `packages/cli/src/behavior/catalog.ts`:

```ts
import { vanrotBehavior, type VanrotBehaviorName } from '@vanrot/config';

export interface BehaviorDefinition {
  name: VanrotBehaviorName;
  label: string;
  importPath: string;
  symbols: readonly string[];
}

export const behaviorDefinitions: readonly BehaviorDefinition[] = [
  {
    name: vanrotBehavior.form,
    label: 'Form controller',
    importPath: '@vanrot/behavior/form',
    symbols: ['createFormController', 'connectFormControl'],
  },
  {
    name: vanrotBehavior.table,
    label: 'Table controller',
    importPath: '@vanrot/behavior/table',
    symbols: ['createTableController', 'connectTableFilter'],
  },
  {
    name: vanrotBehavior.overlay,
    label: 'Overlay controller',
    importPath: '@vanrot/behavior/overlay',
    symbols: ['createOverlayController'],
  },
  {
    name: vanrotBehavior.tabs,
    label: 'Tabs controller',
    importPath: '@vanrot/behavior/tabs',
    symbols: ['createTabsController'],
  },
  {
    name: vanrotBehavior.tooltip,
    label: 'Tooltip controller',
    importPath: '@vanrot/behavior/tooltip',
    symbols: ['createTooltipController'],
  },
  {
    name: vanrotBehavior.toast,
    label: 'Toast controller',
    importPath: '@vanrot/behavior/toast',
    symbols: ['createToastController'],
  },
  {
    name: vanrotBehavior.commandMenu,
    label: 'Command menu controller',
    importPath: '@vanrot/behavior/command-menu',
    symbols: ['createCommandMenuController'],
  },
  {
    name: vanrotBehavior.positionedLayer,
    label: 'Positioned layer helper',
    importPath: '@vanrot/behavior/positioned-layer',
    symbols: ['positionLayer'],
  },
];

export const behaviorNames = behaviorDefinitions.map((definition) => definition.name);

export function findBehaviorDefinition(name: string): BehaviorDefinition | undefined {
  return behaviorDefinitions.find((definition) => definition.name === name);
}

export function parseBehaviorList(value: string): VanrotBehaviorName[] {
  const names = value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item !== '');
  const selected: VanrotBehaviorName[] = [];

  for (const name of names) {
    const definition = findBehaviorDefinition(name);
    if (definition === undefined) {
      throw new Error(`Unknown behavior helper: ${name}.`);
    }

    if (!selected.includes(definition.name)) {
      selected.push(definition.name);
    }
  }

  return selected;
}
```

- [x] **Step 4: Add create behavior prompt helper**

Create `packages/cli/src/create/behavior-prompt.ts`:

```ts
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import type { VanrotBehaviorName } from '@vanrot/config';
import { behaviorDefinitions, parseBehaviorList } from '../behavior/catalog.js';

export interface BehaviorSelectionOptions {
  behaviorFlag?: string;
  noBehavior: boolean;
  interactive: boolean;
}

export async function resolveCreateBehaviorSelection(
  options: BehaviorSelectionOptions,
): Promise<VanrotBehaviorName[]> {
  if (options.noBehavior) {
    return [];
  }

  if (options.behaviorFlag !== undefined) {
    return parseBehaviorList(options.behaviorFlag);
  }

  if (!options.interactive) {
    return [];
  }

  const reader = createInterface({ input, output });

  try {
    const wantsBehavior = await reader.question('Add optional @vanrot/behavior helpers? (y/N) ');
    if (wantsBehavior.trim().toLowerCase() !== 'y') {
      return [];
    }

    const menu = behaviorDefinitions
      .map((definition, index) => `${index + 1}. ${definition.name} - ${definition.label}`)
      .join('\n');
    const selected = await reader.question(`${menu}\nPick behavior numbers or names, comma-separated: `);
    const names = selected
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item !== '')
      .map((item) => {
        const index = Number(item) - 1;
        return Number.isInteger(index) && behaviorDefinitions[index] !== undefined
          ? behaviorDefinitions[index].name
          : item;
      })
      .join(',');

    return parseBehaviorList(names);
  } finally {
    reader.close();
  }
}
```

- [x] **Step 5: Thread behavior selection through app writing**

In `packages/cli/src/create/write-app.ts`, import the type and add `behavior`:

```ts
import type { VanrotBehaviorName } from '@vanrot/config';

export interface WriteAppOptions {
  cwd: string;
  appName: string;
  workspace: boolean;
  force: boolean;
  behavior: VanrotBehaviorName[];
}
```

Pass it into the template:

```ts
...createAppTemplate({
  appName: options.appName,
  workspace: options.workspace,
  behavior: options.behavior,
}),
```

In `packages/cli/src/create/app-template.ts`, extend `AppTemplateOptions`:

```ts
import type { VanrotBehaviorName } from '@vanrot/config';

export interface AppTemplateOptions {
  appName: string;
  workspace: boolean;
  behavior: VanrotBehaviorName[];
}
```

Add `@vanrot/behavior` only when behavior is selected:

```ts
const dependencies: Record<string, string> = {
  '@vanrot/config': dependencyVersion,
  '@vanrot/runtime': dependencyVersion,
  '@vanrot/router': dependencyVersion,
  '@vanrot/ui': dependencyVersion,
};

if (options.behavior.length > 0) {
  dependencies['@vanrot/behavior'] = dependencyVersion;
}
```

Use that `dependencies` object in `package.json` output instead of the current inline dependency object.

Render behavior config in `vanrot.config.ts` only when selected:

```ts
${renderBehaviorConfig(options.behavior)}
```

Add this helper in the same file:

```ts
function renderBehaviorConfig(behavior: readonly VanrotBehaviorName[]): string {
  if (behavior.length === 0) {
    return '';
  }

  const enabled = behavior.map((name) => `'${name}'`).join(', ');
  return `  behavior: {
    enabled: [${enabled}],
  },
`;
}
```

- [x] **Step 6: Parse create behavior flags**

In `packages/cli/src/commands/create.ts`, import the prompt helper:

```ts
import { resolveCreateBehaviorSelection } from '../create/behavior-prompt.js';
```

Add local flag parsing:

```ts
const behaviorFlag = valueAfter(args, '--behavior');
const noBehavior = args.includes('--no-behavior');

if (behaviorFlag !== undefined && noBehavior) {
  context.reporter.error('Choose either --behavior or --no-behavior.');
  return fail();
}
```

Before calling `writeApp`, resolve behavior:

```ts
const behavior = await resolveCreateBehaviorSelection({
  behaviorFlag,
  noBehavior,
  interactive: process.stdin.isTTY === true && process.stdout.isTTY === true,
});
```

Pass it to `writeApp`:

```ts
behavior,
```

Add this helper at the bottom of `create.ts`:

```ts
function valueAfter(args: readonly string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  if (index === -1) {
    return undefined;
  }

  return args[index + 1];
}
```

- [x] **Step 7: Update CLI package build dependencies**

In `packages/cli/package.json`, add `@vanrot/behavior` to dependencies:

```json
"@vanrot/behavior": "file:../behavior"
```

Add `pnpm --filter @vanrot/behavior build` to `prebuild`, `pretypecheck`, and `pretest` after runtime/config build dependencies are available.

- [x] **Step 8: Run create tests**

Run: `pnpm --filter @vanrot/cli test -- create`

Expected: PASS.

- [x] **Step 9: Checkpoint**

Run: `git status --short`

Expected: CLI create path and config behavior support are modified, with no docs changes yet.

---

### Task 6: Add `vr remove behavior`

**Files:**
- Create: `packages/cli/src/remove/remove-behavior.ts`
- Create: `packages/cli/src/commands/remove.ts`
- Modify: `packages/cli/src/cli.ts`
- Modify: `packages/cli/src/commands/metadata.ts`
- Test: `packages/cli/tests/behavior-command.test.ts`
- Test: `packages/cli/tests/cli.test.ts`

- [x] **Step 1: Write failing remove behavior tests**

Create `packages/cli/tests/behavior-command.test.ts`:

```ts
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { runCli } from '../src/cli.js';
import { createMemoryReporter } from '../src/reporter/reporter.js';

describe('vr remove behavior', () => {
  it('removes a behavior name from vanrot.config.ts and keeps the package by default', async () => {
    const cwd = await createFixtureProject({
      packageJson: {
        dependencies: {
          '@vanrot/behavior': '^0.1.0',
        },
      },
      config: `import { defineVanrotConfig } from '@vanrot/config';

export default defineVanrotConfig({
  schemaVersion: 1,
  behavior: {
    enabled: ['tooltip', 'toast'],
  },
});
`,
    });
    const reporter = createMemoryReporter();

    const result = await runCli(['remove', 'behavior', 'tooltip'], { cwd, reporter });

    const configSource = await readFile(join(cwd, 'vanrot.config.ts'), 'utf8');
    const packageJson = JSON.parse(await readFile(join(cwd, 'package.json'), 'utf8')) as {
      dependencies?: Record<string, string>;
    };

    expect(result.exitCode).toBe(0);
    expect(configSource).not.toContain("'tooltip'");
    expect(configSource).toContain("'toast'");
    expect(packageJson.dependencies?.['@vanrot/behavior']).toBe('^0.1.0');
  });

  it('removes the behavior package with --package when no behavior remains', async () => {
    const cwd = await createFixtureProject({
      packageJson: {
        dependencies: {
          '@vanrot/behavior': '^0.1.0',
        },
      },
      config: `import { defineVanrotConfig } from '@vanrot/config';

export default defineVanrotConfig({
  schemaVersion: 1,
  behavior: {
    enabled: ['tooltip'],
  },
});
`,
    });

    const result = await runCli(['remove', 'behavior', 'tooltip', '--package'], {
      cwd,
      reporter: createMemoryReporter(),
    });

    const packageJson = JSON.parse(await readFile(join(cwd, 'package.json'), 'utf8')) as {
      dependencies?: Record<string, string>;
    };
    const configSource = await readFile(join(cwd, 'vanrot.config.ts'), 'utf8');

    expect(result.exitCode).toBe(0);
    expect(packageJson.dependencies?.['@vanrot/behavior']).toBeUndefined();
    expect(configSource).not.toContain('behavior:');
  });

  it('rejects unknown behavior names', async () => {
    const cwd = await createFixtureProject({
      packageJson: { dependencies: { '@vanrot/behavior': '^0.1.0' } },
      config: 'export default { schemaVersion: 1 };\\n',
    });
    const reporter = createMemoryReporter();

    const result = await runCli(['remove', 'behavior', 'accordion'], { cwd, reporter });

    expect(result.exitCode).toBe(1);
    expect(reporter.messages.some((message) => message.includes('Unknown behavior helper'))).toBe(true);
  });
});

async function createFixtureProject(options: {
  packageJson: { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
  config: string;
}): Promise<string> {
  const cwd = await mkdtemp(join(tmpdir(), 'vanrot-behavior-remove-'));
  await mkdir(join(cwd, 'src'));
  await writeFile(
    join(cwd, 'package.json'),
    JSON.stringify(
      {
        name: 'fixture-app',
        scripts: {
          dev: 'vr dev',
          build: 'vr build',
          test: 'vr test',
          doctor: 'vr doctor',
        },
        ...options.packageJson,
      },
      null,
      2,
    ),
  );
  await writeFile(join(cwd, 'vite.config.ts'), 'export default {};\\n');
  await writeFile(join(cwd, 'vanrot.config.ts'), options.config);
  return cwd;
}
```

- [x] **Step 2: Run remove behavior test to verify it fails**

Run: `pnpm --filter @vanrot/cli test -- behavior-command`

Expected: FAIL because `vr remove` is not registered.

- [x] **Step 3: Implement config and package editing**

Create `packages/cli/src/remove/remove-behavior.ts`:

```ts
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { findBehaviorDefinition } from '../behavior/catalog.js';

export interface RemoveBehaviorOptions {
  cwd: string;
  behaviorName: string;
  removePackage: boolean;
}

export interface RemoveBehaviorResult {
  changedFiles: string[];
}

export async function removeBehavior(options: RemoveBehaviorOptions): Promise<RemoveBehaviorResult> {
  const definition = findBehaviorDefinition(options.behaviorName);
  if (definition === undefined) {
    throw new Error(`Unknown behavior helper: ${options.behaviorName}.`);
  }

  const changedFiles: string[] = [];
  const configPath = join(options.cwd, 'vanrot.config.ts');
  const configSource = await readFile(configPath, 'utf8');
  const nextConfigSource = removeBehaviorFromConfig(configSource, definition.name);

  if (nextConfigSource !== configSource) {
    await writeFile(configPath, nextConfigSource);
    changedFiles.push('vanrot.config.ts');
  }

  if (options.removePackage && !hasBehaviorConfigEntries(nextConfigSource)) {
    const packageJsonPath = join(options.cwd, 'package.json');
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8')) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    delete packageJson.dependencies?.['@vanrot/behavior'];
    delete packageJson.devDependencies?.['@vanrot/behavior'];
    await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
    changedFiles.push('package.json');
  }

  return { changedFiles };
}

function removeBehaviorFromConfig(source: string, behaviorName: string): string {
  const singleQuoted = `'${behaviorName}'`;
  const doubleQuoted = `"${behaviorName}"`;
  let next = source
    .replace(new RegExp(`\\s*${escapeRegExp(singleQuoted)},?`, 'g'), '')
    .replace(new RegExp(`\\s*${escapeRegExp(doubleQuoted)},?`, 'g'), '');

  next = next.replace(/enabled: \\[\\s*\\],?\\n/g, '');
  next = next.replace(/\\s*behavior: \\{\\s*\\},?\\n/g, '');
  return next;
}

function hasBehaviorConfigEntries(source: string): boolean {
  return /behavior:\\s*\\{[\\s\\S]*enabled:\\s*\\[[^\\]]+\\]/.test(source);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');
}
```

- [x] **Step 4: Implement remove command dispatch**

Create `packages/cli/src/commands/remove.ts`:

```ts
import { removeBehavior } from '../remove/remove-behavior.js';
import type { CommandContext, CommandResult } from '../result.js';
import { fail, ok } from '../result.js';
import { commandName, commandUsage } from './metadata.js';

export async function removeCommand(
  args: string[],
  context: CommandContext,
): Promise<CommandResult> {
  const [target, behaviorName] = args.filter((arg) => !arg.startsWith('-'));
  const removePackage = args.includes('--package');

  if (target !== 'behavior' || behaviorName === undefined) {
    context.reporter.error('Missing behavior name.', `Run ${commandUsage(commandName.remove)}.`);
    return fail();
  }

  try {
    const result = await removeBehavior({
      cwd: context.cwd,
      behaviorName,
      removePackage,
    });

    context.reporter.success('removed behavior', result.changedFiles.join(', '));
    return ok();
  } catch (error) {
    context.reporter.error(
      'Could not remove behavior.',
      error instanceof Error ? error.message : undefined,
    );
    return fail();
  }
}
```

In `packages/cli/src/commands/metadata.ts`, add `remove`:

```ts
remove: 'remove',
```

Add command metadata:

```ts
{
  name: commandName.remove,
  usage: 'vr remove behavior <name>',
  rootUsage: 'remove behavior <name>',
  description: 'Remove an optional behavior helper from project config',
  help: `vr remove behavior <name>

Examples
  vr remove behavior tooltip
  vr remove behavior tooltip --package

Options
  --package   Remove @vanrot/behavior when no behavior helpers remain`,
},
```

Add `commandName.remove` to the Scaffold command group after `add`.

In `packages/cli/src/cli.ts`, import and register:

```ts
import { removeCommand } from './commands/remove.js';
```

```ts
[commandName.remove, removeCommand],
```

- [x] **Step 5: Update CLI help tests**

In `packages/cli/tests/cli.test.ts`, add assertions that root help includes `remove behavior <name>` and `vr remove --help` includes `--package`.

- [x] **Step 6: Run CLI remove/help tests**

Run: `pnpm --filter @vanrot/cli test -- behavior-command cli`

Expected: PASS.

- [x] **Step 7: Checkpoint**

Run: `git status --short`

Expected: remove command files are created, metadata/dispatch/tests are updated, and create tests still pass.

---

### Task 7: Add Behavior Doctor Checks

**Files:**
- Create: `packages/cli/src/doctor/behavior.ts`
- Modify: `packages/cli/src/doctor/checks.ts`
- Test: `packages/cli/tests/behavior-doctor.test.ts`

- [x] **Step 1: Write failing doctor tests**

Create `packages/cli/tests/behavior-doctor.test.ts`:

```ts
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { runCli } from '../src/cli.js';
import { createMemoryReporter } from '../src/reporter/reporter.js';

describe('vr doctor behavior checks', () => {
  it('warns when @vanrot/behavior is installed but no behavior is configured or imported', async () => {
    const cwd = await createDoctorProject({
      dependencies: { '@vanrot/behavior': '^0.1.0' },
      config: 'export default { schemaVersion: 1 };\\n',
      source: 'export const value = 1;\\n',
    });
    const reporter = createMemoryReporter();

    const result = await runCli(['doctor'], { cwd, reporter });

    expect(result.exitCode).toBe(0);
    expect(reporter.messages.some((message) => message.includes('VRTB001'))).toBe(true);
  });

  it('warns when configured behavior has no matching import', async () => {
    const cwd = await createDoctorProject({
      dependencies: { '@vanrot/behavior': '^0.1.0' },
      config: `export default {
  schemaVersion: 1,
  behavior: { enabled: ['tooltip'] },
};
`,
      source: 'export const value = 1;\\n',
    });
    const reporter = createMemoryReporter();

    const result = await runCli(['doctor'], { cwd, reporter });

    expect(result.exitCode).toBe(0);
    expect(reporter.messages.some((message) => message.includes('VRTB002'))).toBe(true);
  });

  it('warns when behavior imports are not declared in config', async () => {
    const cwd = await createDoctorProject({
      dependencies: { '@vanrot/behavior': '^0.1.0' },
      config: 'export default { schemaVersion: 1 };\\n',
      source: "import { createTooltipController } from '@vanrot/behavior/tooltip';\\n",
    });
    const reporter = createMemoryReporter();

    const result = await runCli(['doctor'], { cwd, reporter });

    expect(result.exitCode).toBe(0);
    expect(reporter.messages.some((message) => message.includes('VRTB003'))).toBe(true);
  });

  it('warns about stale runtime behavior imports', async () => {
    const cwd = await createDoctorProject({
      dependencies: { '@vanrot/runtime': '^0.1.0' },
      config: 'export default { schemaVersion: 1 };\\n',
      source: "import { createTooltipController } from '@vanrot/runtime';\\n",
    });
    const reporter = createMemoryReporter();

    const result = await runCli(['doctor'], { cwd, reporter });

    expect(result.exitCode).toBe(0);
    expect(reporter.messages.some((message) => message.includes('VRTB004'))).toBe(true);
  });

  it('warns about root behavior imports when a subpath is cleaner', async () => {
    const cwd = await createDoctorProject({
      dependencies: { '@vanrot/behavior': '^0.1.0' },
      config: `export default {
  schemaVersion: 1,
  behavior: { enabled: ['tooltip'] },
};
`,
      source: "import { createTooltipController } from '@vanrot/behavior';\\n",
    });
    const reporter = createMemoryReporter();

    const result = await runCli(['doctor'], { cwd, reporter });

    expect(result.exitCode).toBe(0);
    expect(reporter.messages.some((message) => message.includes('VRTB005'))).toBe(true);
  });
});

async function createDoctorProject(options: {
  dependencies: Record<string, string>;
  config: string;
  source: string;
}): Promise<string> {
  const cwd = await mkdtemp(join(tmpdir(), 'vanrot-behavior-doctor-'));
  await mkdir(join(cwd, 'src'));
  await writeFile(
    join(cwd, 'package.json'),
    JSON.stringify(
      {
        name: 'doctor-fixture',
        scripts: {
          dev: 'vr dev',
          build: 'vr build',
          test: 'vr test',
          doctor: 'vr doctor',
        },
        dependencies: options.dependencies,
      },
      null,
      2,
    ),
  );
  await writeFile(join(cwd, 'vite.config.ts'), 'export default {};\\n');
  await writeFile(join(cwd, 'vanrot.config.ts'), options.config);
  await writeFile(join(cwd, 'src', 'app.page.ts'), options.source);
  await writeFile(join(cwd, 'src', 'app.page.html'), '<main></main>\\n');
  await writeFile(join(cwd, 'src', 'app.page.css'), ':host { display: block; }\\n');
  return cwd;
}
```

- [x] **Step 2: Run doctor tests to verify they fail**

Run: `pnpm --filter @vanrot/cli test -- behavior-doctor`

Expected: FAIL because behavior doctor checks do not exist.

- [x] **Step 3: Implement behavior doctor checks**

Create `packages/cli/src/doctor/behavior.ts`:

```ts
import { readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { behaviorDefinitions } from '../behavior/catalog.js';
import type { DoctorFinding } from './checks.js';
import { walkFiles } from './vanrot-rules.js';

export async function checkBehaviorUsage(cwd: string): Promise<DoctorFinding[]> {
  const findings: DoctorFinding[] = [];
  const packageJson = await readJson(join(cwd, 'package.json'));
  const configSource = await readOptional(join(cwd, 'vanrot.config.ts'));
  const sourceFiles = await readSourceFiles(cwd);
  const installed = hasDependency(packageJson, '@vanrot/behavior');
  const configured = configuredBehaviorNames(configSource);
  const imported = importedBehaviorNames(sourceFiles.map((file) => file.content).join('\n'));

  if (installed && configured.length === 0 && imported.length === 0) {
    findings.push(warning('VRTB001', 'package.json', '@vanrot/behavior is installed but unused', 'Run vr remove behavior <name> --package when no behavior helpers are needed.'));
  }

  for (const name of configured) {
    if (!imported.includes(name)) {
      findings.push(warning('VRTB002', 'vanrot.config.ts', `Configured behavior is not imported: ${name}`, `Run vr remove behavior ${name}.`));
    }
  }

  for (const name of imported) {
    if (!configured.includes(name)) {
      findings.push(warning('VRTB003', 'vanrot.config.ts', `Imported behavior is not listed in behavior.enabled: ${name}`, `Add ${name} to behavior.enabled.`));
    }
  }

  for (const file of sourceFiles) {
    if (/@vanrot\/runtime/.test(file.content) && behaviorDefinitions.some((definition) => definition.symbols.some((symbol) => file.content.includes(symbol)))) {
      findings.push(warning('VRTB004', relative(cwd, file.path), 'Behavior helper imported from @vanrot/runtime', 'Import the helper from @vanrot/behavior/<name>.'));
    }

    if (/from ['"]@vanrot\/behavior['"]/.test(file.content)) {
      findings.push(warning('VRTB005', relative(cwd, file.path), 'Root @vanrot/behavior import found', 'Prefer the behavior subpath import for the helper you use.'));
    }
  }

  return findings;
}

function warning(code: string, filePath: string, message: string, nextStep: string): DoctorFinding {
  return { severity: 'warning', code, filePath, message, nextStep };
}

async function readJson(path: string): Promise<{ dependencies?: Record<string, string>; devDependencies?: Record<string, string> }> {
  return JSON.parse(await readFile(path, 'utf8')) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
}

async function readOptional(path: string): Promise<string> {
  try {
    return await readFile(path, 'utf8');
  } catch {
    return '';
  }
}

async function readSourceFiles(cwd: string): Promise<Array<{ path: string; content: string }>> {
  const srcRoot = join(cwd, 'src');
  const files = await walkFiles(srcRoot);
  const sourceFiles = files.filter((file) => /\.(ts|tsx|js|jsx)$/.test(file));
  return Promise.all(
    sourceFiles.map(async (file) => ({
      path: file,
      content: await readFile(file, 'utf8'),
    })),
  );
}

function hasDependency(packageJson: { dependencies?: Record<string, string>; devDependencies?: Record<string, string> }, name: string): boolean {
  return packageJson.dependencies?.[name] !== undefined || packageJson.devDependencies?.[name] !== undefined;
}

function configuredBehaviorNames(configSource: string): string[] {
  const enabledMatch = configSource.match(/enabled:\s*\[([\s\S]*?)\]/);
  if (enabledMatch?.[1] === undefined) {
    return [];
  }

  return behaviorDefinitions
    .map((definition) => definition.name)
    .filter((name) => enabledMatch[1]?.includes(`'${name}'`) || enabledMatch[1]?.includes(`"${name}"`));
}

function importedBehaviorNames(source: string): string[] {
  return behaviorDefinitions
    .filter((definition) => source.includes(definition.importPath) || definition.symbols.some((symbol) => source.includes(symbol)))
    .map((definition) => definition.name);
}
```

In `packages/cli/src/doctor/checks.ts`, import and call it:

```ts
import { checkBehaviorUsage } from './behavior.js';
```

```ts
return [
  ...(await checkProjectHealth(cwd)),
  ...(await checkVanrotRules(cwd)),
  ...(await checkBehaviorUsage(cwd)),
];
```

- [x] **Step 4: Run behavior doctor tests**

Run: `pnpm --filter @vanrot/cli test -- behavior-doctor doctor`

Expected: PASS.

- [x] **Step 5: Checkpoint**

Run: `git status --short`

Expected: doctor checks are behavior-aware and existing doctor behavior remains intact.

---

### Task 8: Update Documentation, AI Knowledge, And Backlog

**Files:**
- Modify: `apps/vanrot-site/src/docs/framework-reference.json`
- Modify: `apps/vanrot-site/src/docs/site-data.ts`
- Modify: `apps/vanrot-site/src/docs/site-data.json`
- Modify: `apps/vanrot-site/src/docs/site-navigation.ts`
- Modify: `apps/vanrot-site/src/routes.ts`
- Modify: `apps/vanrot-site/src/docs/example-matrix.ts`
- Modify: `apps/vanrot-site/tests/framework-reference.test.ts`
- Modify: `apps/vanrot-site/tests/site-pages.test.ts`
- Modify: `docs/ai/index.json`
- Modify: `docs/ai/manifest.json`
- Modify: `docs/ai/knowledge/routes.md`
- Modify: `docs/superpowers/final-tdd-inventory.md`
- Modify: `docs/superpowers/post-production-implementation-ideas.md`

- [x] **Step 1: Write failing docs registry tests**

In `apps/vanrot-site/tests/framework-reference.test.ts`, update package list expectation by inserting `@vanrot/behavior` after `@vanrot/runtime`:

```ts
expect(frameworkReference.packages.map((item) => item.name)).toEqual([
  '@vanrot/runtime',
  '@vanrot/behavior',
  '@vanrot/compiler',
  '@vanrot/config',
  '@vanrot/language-server',
  '@vanrot/router',
  '@vanrot/vite-plugin',
  '@vanrot/cli',
  '@vanrot/ui',
  '@vanrot/testing',
  '@vanrot/devtools',
  '@vanrot/ai',
]);
```

Update command list expectation by inserting `remove` after `add`:

```ts
expect(frameworkReference.commands.map((command) => command.name)).toEqual([
  'create',
  'generate',
  'add',
  'remove',
  'ui',
  'config',
  'update',
  'upgrade',
  'doctor',
  'map',
  'init-ai',
  'ai',
  'dev',
  'build',
  'test',
]);
```

Add `behavior-helpers` to `requiredExampleWorkflows` expectation and ensure at least one example contains `@vanrot/behavior`.

In `apps/vanrot-site/tests/site-pages.test.ts`, add a concrete assertion that the behavior article route exists (mirror the `route.docsVitePlugin.path` style):

```ts
expect(route.docsBehavior.path).toBe('behavior');
```

- [x] **Step 2: Run docs tests to verify they fail**

Run: `pnpm --filter @vanrot/vanrot-site test -- framework-reference site-pages`

Expected: FAIL because docs data has no behavior package, remove command, or behavior example.

- [x] **Step 3: Update framework reference data**

In `apps/vanrot-site/src/docs/framework-reference.json`:

Add package entry:

```json
{
  "name": "@vanrot/behavior",
  "status": "production-ready",
  "summary": "Optional headless behavior helpers for forms, tables, overlays, tabs, tooltips, toasts, command menus, and positioned layers.",
  "exports": [
    "@vanrot/behavior/form",
    "@vanrot/behavior/table",
    "@vanrot/behavior/overlay",
    "@vanrot/behavior/tabs",
    "@vanrot/behavior/tooltip",
    "@vanrot/behavior/toast",
    "@vanrot/behavior/command-menu",
    "@vanrot/behavior/positioned-layer",
    "@vanrot/behavior/all"
  ],
  "docsPath": "/docs/behavior"
}
```

Update the runtime package summary so it states runtime no longer owns behavior helpers.

Add command entry:

```json
{
  "name": "remove",
  "usage": "vr remove behavior <name>",
  "examples": ["vr remove behavior tooltip", "vr remove behavior tooltip --package"],
  "notes": [
    "Removes a behavior helper from behavior.enabled without removing @vanrot/behavior by default.",
    "--package removes @vanrot/behavior only when no behavior helpers remain."
  ]
}
```

Update the create command notes to mention `--behavior tooltip,toast` and `--no-behavior`.

Add config reference text for `behavior.enabled`.

- [x] **Step 4: Add behavior docs article**

Docs articles are not a single dynamic route. Each article is registered explicitly and its key is the single source of truth in `siteArticleKey`. Wire all four touch points in this order.

**4a. Add the article key (source of truth).** In `apps/vanrot-site/src/docs/site-data.ts`, add `behavior: 'behavior',` to the `siteArticleKey` object (place it after the runtime keys, before `compiler`). `siteArticleKeys` and `SiteArticleKey` derive from this object automatically.

**4b. Add the article body.** In `apps/vanrot-site/src/docs/site-data.json`, append an entry to the `articles` array. Mirror the full field shape of an existing runtime article entry (do not invent fields — copy the keys an existing article uses, e.g. `key`, `label`, `path`/slug, `title`, `summary`, `sections`). Use `key: "behavior"`, path `/docs/behavior`, and this content model:

```json
{
  "key": "behavior",
  "path": "/docs/behavior",
  "title": "Behavior",
  "summary": "@vanrot/behavior is optional and lets apps pick only the headless behavior helpers they use.",
  "sections": [
    {
      "title": "Package boundary",
      "body": "@vanrot/runtime stays small. @vanrot/behavior owns optional headless interaction helpers and is installed only when a project selects behavior helpers."
    },
    {
      "title": "Create flow",
      "body": "vr create asks whether to add behavior helpers. Non-interactive runs can use --behavior tooltip,toast or --no-behavior."
    },
    {
      "title": "Subpath imports",
      "body": "Import only the behavior you use, such as @vanrot/behavior/tooltip or @vanrot/behavior/toast. @vanrot/behavior/all is available when an app intentionally wants every helper."
    },
    {
      "title": "Cleanup",
      "body": "vr remove behavior <name> removes a selected helper from behavior.enabled. Add --package when no helper remains and the package should be removed too."
    },
    {
      "title": "Doctor",
      "body": "vr doctor reports installed-but-unused behavior, configured-but-unused behavior, imports missing from config, root imports that should use subpaths, and stale @vanrot/runtime behavior imports."
    }
  ]
}
```

**4c. Add the nav entry.** In `apps/vanrot-site/src/docs/site-navigation.ts`, add `navItem(siteArticleKey.behavior)` to the docs navigation, near the runtime section (it documents the optional runtime companion).

**4d. Register the route.** In `apps/vanrot-site/src/routes.ts`:

- Add the article-page const next to the other docs consts:

```ts
const docsBehavior = articlePage(siteArticleKey.behavior);
```

- Add `docsBehavior,` to the docs route table array (the same array that lists `docsRuntime`, `docsRuntimeControllers`, etc.), placed after the runtime article entries.

`articlePage` derives the child path from the key, so `siteArticleKey.behavior` produces `/docs/behavior` and exposes it as `route.docsBehavior`.

- [x] **Step 5: Update example matrix**

In `apps/vanrot-site/src/docs/example-matrix.ts`, add `behavior-helpers` to `requiredExampleWorkflows` and add `@vanrot/behavior` to a relevant example package list. If no existing example fits, add an example entry:

```ts
{
  id: 'behavior-helpers',
  title: 'Behavior Helpers',
  path: 'examples/behavior-helpers',
  packages: ['@vanrot/behavior', '@vanrot/runtime', '@vanrot/config'],
  workflows: ['behavior-helpers'],
  docsPath: '/docs/behavior',
}
```

- [x] **Step 6: Update final TDD inventory and post-production backlog**

In `docs/superpowers/final-tdd-inventory.md`:

Add `@vanrot/behavior` to the package shell inventory row.

Add a package section:

```md
## `@vanrot/behavior`

| Done | Area | Surface | Status | Coverage | Phase | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| [x] | package boundary | optional behavior package | Production-Ready | Export tests, moved controller tests, create/remove/doctor/docs coverage. | Phase 16H | Behavior moved out of runtime so apps only install the helpers they choose. |
| [x] | subpath imports | `@vanrot/behavior/<name>` | Production-Ready | Subpath export tests cover form, table, overlay, tabs, tooltip, toast, command-menu, positioned-layer, and all. | Phase 16H | `@vanrot/behavior/all` has no hard cap because it is explicit opt-in. |
```

Update the `@vanrot/runtime` section to say behavior controllers moved to `@vanrot/behavior` and runtime cap is `<RUNTIME_CAP>` (the measured-derived value set in Task 4 Step 5).

In `docs/superpowers/post-production-implementation-ideas.md`, add a behavior backlog entry:

```md
## Optional Behavior Package Expansion

- Accordion / Collapsible / Disclosure.
- Select / Listbox / Combobox.
- Context Menu / Menubar / Navigation Menu.
- Toggle Group / Toolbar.
- Scroll Area, Portal, focus utilities, and visually hidden accessibility helpers.
- Date picker/calendar, drag and drop, table column resizing, and richer multi-selection.
```

- [x] **Step 7: Regenerate AI docs**

Run: `pnpm --filter @vanrot/cli build`

Expected: PASS.

Run: `pnpm exec vr ai build`

Expected: PASS and updates AI knowledge files such as `docs/ai/index.json`, `docs/ai/manifest.json`, and `docs/ai/knowledge/routes.md`.

- [x] **Step 8: Run docs tests**

Run: `pnpm --filter @vanrot/vanrot-site test -- framework-reference site-pages`

Expected: PASS.

- [x] **Step 9: Checkpoint**

Run: `git status --short`

Expected: docs, AI knowledge, and inventory files reflect behavior package migration.

---

### Task 9: Repository Integration And Release Guardrails

**Files:**
- Modify: `package.json`
- Modify: `packages/cli/package.json`
- Modify: `packages/runtime/package.json`
- Modify: `packages/behavior/package.json`
- Modify: `pnpm-lock.yaml` if pnpm updates workspace lock metadata.

- [x] **Step 1: Run package-level tests**

Run: `pnpm --filter @vanrot/config test`

Expected: PASS.

Run: `pnpm --filter @vanrot/runtime test`

Expected: PASS.

Run: `pnpm --filter @vanrot/behavior test`

Expected: PASS.

Run: `pnpm --filter @vanrot/cli test`

Expected: PASS.

Run: `pnpm --filter @vanrot/vanrot-site test`

Expected: PASS.

- [x] **Step 2: Run package-level typechecks**

Run: `pnpm --filter @vanrot/config typecheck`

Expected: PASS.

Run: `pnpm --filter @vanrot/runtime typecheck`

Expected: PASS.

Run: `pnpm --filter @vanrot/behavior typecheck`

Expected: PASS.

Run: `pnpm --filter @vanrot/cli typecheck`

Expected: PASS.

Run: `pnpm --filter @vanrot/vanrot-site typecheck`

Expected: PASS.

- [x] **Step 3: Run package builds**

Run: `pnpm --filter @vanrot/runtime build`

Expected: PASS.

Run: `pnpm --filter @vanrot/behavior build`

Expected: PASS.

Run: `pnpm --filter @vanrot/cli build`

Expected: PASS.

Run: `pnpm --filter @vanrot/vanrot-site build`

Expected: PASS.

- [x] **Step 4: Run size and phase-doc gates**

Run: `pnpm verify:size`

Expected: PASS with `@vanrot/runtime` at or below `<RUNTIME_CAP>` (from Task 4 Step 5). `@vanrot/behavior/all` has no hard cap.

Run: `pnpm test:phase-docs`

Expected: PASS, including runtime size budget docs, site docs, AI docs, release dry-run, final TDD inventory, and web-types coverage.

- [x] **Step 5: Run full verification**

Run: `pnpm verify`

Expected: PASS.

- [x] **Step 6: Restart and verify the Vanrot site**

Run:

```sh
pkill -f "vite/bin/vite.js.*--port 1964" || true
pnpm --filter @vanrot/vanrot-site dev -- --host 127.0.0.1 --port 1964
```

Expected: dev server starts on `http://127.0.0.1:1964/`.

Verify:

```sh
curl -I http://127.0.0.1:1964/docs/behavior
```

Expected: `HTTP/1.1 200 OK`.

- [x] **Step 7: Browser verification**

Open `http://127.0.0.1:1964/docs/behavior` in the in-app browser.

Expected:
- Page renders without console errors.
- The docs explain optional behavior package, create flags, subpath imports, remove command, and doctor checks.
- No layout overlap on desktop width.

- [x] **Step 8: Final checkpoint**

Run: `git status --short --branch`

Expected: modified and created files match this plan. Do not stage or commit unless the user explicitly asks.

---

## Self-Review

- Spec coverage: Runtime Boundary is covered by Task 4; new behavior package and current behavior migration are covered by Tasks 2 and 3; create prompts are covered by Task 5; remove behavior is covered by Task 6; doctor cleanup rules are covered by Task 7; docs, AI docs, inventory, and post-production backlog are covered by Task 8; verification is covered by Task 9.
- Placeholder scan: no unchecked design gaps, no vague edge-case instructions, no references to undefined functions without a creation step. The one intentional token is `<RUNTIME_CAP>` in Task 4 Step 5 — a measured-derived value the executor must compute (build + `size`) and write identically across `.size-limit.json`, `verify-runtime-size-budget.test.mjs`, `AGENTS.md`, `CLAUDE.md`, and the TDD inventory. It is deliberately not hardcoded.
- Type consistency: behavior names use `VanrotBehaviorName` from `@vanrot/config`; CLI catalog uses the same names; `vanrot.config.ts` stores `behavior.enabled`; doctor checks use the same catalog.
- Docs route wiring: the `/docs/behavior` article is registered through the explicit-route model, not a dynamic route. Task 8 Step 4 adds `siteArticleKey.behavior` (single source of truth in `site-data.ts`), the article body in `site-data.json`, the `navItem` in `site-navigation.ts`, and the `articlePage(siteArticleKey.behavior)` route in `routes.ts`, with `route.docsBehavior.path` covered in `site-pages.test.ts`.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/Phase-16H.md`.

Use inline execution with `superpowers:executing-plans`. This repository disables subagent workflows and the user owns staging/commits, so task checkpoints use `git status` instead of `git add` or `git commit`.
