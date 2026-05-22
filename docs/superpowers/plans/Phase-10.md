# Vanrot Phase 10 Testing Foundation Implementation Plan

**Date:** 2026-05-22
**Spec:** `docs/superpowers/specs/Phase-10.md`
**Goal:** Add the demo-capable `@vanrot/testing` package and opt-in `vr add button --test` generation.
**Execution rule:** Work in the current `main` workspace only. Do not stage, commit, push, branch, or create a worktree.

---

## Architecture

Phase 10 adds one small testing package and one CLI extension.

`@vanrot/testing` wraps Vitest for user app tests. It mounts a compiled Vanrot component with `@vanrot/runtime`, gives the test body a readable `screen` helper, and guarantees cleanup.

`@vanrot/cli` keeps default `vr add button` output unchanged. When the final `--test` flag is present, the CLI writes one extra colocated `.button.test.ts` file beside the existing three button files.

`@vanrot/ui` continues to own file-backed UI primitive blueprints. The button test blueprint should live beside the button primitive assets so the CLI does not embed reusable UI files as TypeScript strings.

---

## Task 1: Create `@vanrot/testing` Package

- [x] Add `packages/testing/package.json`.
- [x] Add `packages/testing/tsconfig.json`.
- [x] Add `packages/testing/src/index.ts`.
- [x] Export `testComponent` and screen types.
- [x] Add package to the workspace by relying on existing `packages/*` workspace glob.

Expected package dependencies:

```txt
@vanrot/runtime workspace dependency
vitest peer dependency
vitest dev dependency for package tests
jsdom dev dependency for generated app tests that opt into DOM testing
```

Verification:

```bash
pnpm --filter @vanrot/testing typecheck
```

---

## Task 2: Test-Drive The Screen Helper

- [x] Add `packages/testing/tests/screen.test.ts`.
- [x] Prove `screen.expect.text(value)` passes when text exists.
- [x] Prove `screen.expect.text(value)` fails when text does not exist.
- [x] Prove `screen.click.button(label)` clicks a matching button.
- [x] Prove `screen.click.button(label)` fails with a readable error when no matching button exists.

Implementation files:

```txt
packages/testing/src/screen.ts
```

Design notes:

```txt
screen.expect.text(value) should use Vitest expect internally
screen.click.button(label) should match button text after trimming whitespace
screen.click.button(label) should return Promise<void>
```

Verification:

```bash
pnpm --filter @vanrot/testing test
```

---

## Task 3: Test-Drive `testComponent(...).can(...)`

- [x] Add `packages/testing/tests/component-test.test.ts`.
- [x] Prove `.can(...)` registers and runs a Vitest test.
- [x] Prove it mounts a compiled component module into jsdom.
- [x] Prove it passes `screen` to the body.
- [x] Prove it destroys the mounted component after a passing body.
- [x] Prove it destroys the mounted component after a failing body.
- [x] Prove sync and async bodies are supported.

Implementation files:

```txt
packages/testing/src/component-test.ts
```

Design notes:

```txt
testComponent(Component).can(description, function (screen) {})
testComponent should call Vitest test internally
the component type should match @vanrot/runtime ComponentType
cleanup should happen in finally
```

Verification:

```bash
pnpm --filter @vanrot/testing test
```

---

## Task 4: Add Button Test Blueprint To `@vanrot/ui`

- [x] Add `packages/ui/src/primitives/button/ui.button.test.ts`.
- [x] Add `uiAssetUrl.button.test` to `packages/ui/src/metadata.ts`.
- [x] Keep label text owned by a local `buttonCopy` object in the generated test.
- [x] Use `function (screen)` syntax.
- [x] Import `testComponent` from `@vanrot/testing`.

Expected default blueprint:

```ts
// @vitest-environment jsdom

import { testComponent } from '@vanrot/testing';
// @ts-expect-error Vanrot's Vite plugin compiles button modules to default exports.
import UiButton from './ui.button.ts';

const buttonCopy = {
  label: 'Button',
} as const;

testComponent(UiButton).can('render its label', function (screen) {
  screen.expect.text(buttonCopy.label);
});
```

Verification:

```bash
pnpm --filter @vanrot/ui test
```

---

## Task 5: Extend CLI `vr add ... --test`

- [x] Update `packages/cli/src/add/add-ui.ts` request parsing to accept trailing `--test`.
- [x] Keep `vr add button` and `vr add primary button` behavior unchanged.
- [x] Reject unsupported shapes with clear usage text.
- [x] Update `packages/cli/src/add/ui-assets.ts` so `renderButtonFiles(prefix, { includeTest })` can include the `.button.test.ts` file.
- [x] Rename the generated test class import and `testComponent(...)` target from `UiButton` to the requested class name.
- [x] Include the `.test.ts` path in the all-or-nothing overwrite check.
- [x] Add missing `@vanrot/testing` and `jsdom` dev dependencies when a project `package.json` exists.

Supported Phase 10 commands:

```bash
vr add button --test
vr add primary button --test
```

Verification:

```bash
pnpm --filter @vanrot/cli test
```

---

## Task 6: Test-Drive CLI Generation

- [x] Add a CLI test proving `vr add primary button` still creates only the three source files.
- [x] Add a CLI test proving `vr add primary button --test` creates `primary.button.test.ts`.
- [x] Assert the generated test imports `@vanrot/testing`.
- [x] Assert the generated test uses `@vitest-environment jsdom`.
- [x] Assert the generated test imports `PrimaryButton` from `./primary.button.ts`.
- [x] Assert the generated test uses `function (screen)`.
- [x] Assert repeated button label text stays inside `buttonCopy`.
- [x] Add a collision test proving an existing `.button.test.ts` blocks the whole command.

Implementation files:

```txt
packages/cli/tests/add.test.ts
```

Verification:

```bash
pnpm --filter @vanrot/cli test
```

---

## Task 7: Update Phase Completion Docs

After implementation verification passes:

- [x] Mark Phase 10 complete in `docs/brainstorm.md`.
- [x] Mark Phase 10 complete and Phase 11 active in `docs/vanrot-presentation.html`.
- [x] Mark only verified Phase 10 rows as `Demo-Capable` in `docs/superpowers/feature-maturity.md`.
- [x] Mark this plan's completed tasks.
- [x] Do not mark framework docs, `testPage(...)`, `vr generate component --test`, or `vr generate page --test` as complete.

Verification:

```bash
pnpm verify:phase-docs
```

---

## Final Verification

Run:

```bash
pnpm --filter @vanrot/testing test
pnpm --filter @vanrot/cli test
pnpm verify:phase-docs
pnpm verify
git diff --check
git status --short --branch
```

Completion means all commands pass and Phase 10 docs reflect only demo-capable verified work.
