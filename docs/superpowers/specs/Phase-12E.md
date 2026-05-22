# Vanrot Phase 12E TypeScript Contract Hardening Design

**Date:** 2026-05-22
**Phase:** Phase 12E - TypeScript Contract Hardening
**Packages:** vite-plugin, compiler, runtime, router, testing, cli, examples, ui, docs
**Status:** Draft for review
**Related:**
- `AGENTS.md`
- `audits/core/typescript-contracts.audit.ts`
- `docs/superpowers/feature-maturity.md`
- `docs/superpowers/final-tdd-inventory.md`
- `packages/vite-plugin`
- `packages/compiler`
- `packages/runtime`
- `packages/router`
- `packages/testing`
- `packages/cli`

## 1. Goal

Phase 12E removes the remaining user-facing TypeScript suppressions around transformed Vanrot role modules.

Vanrot role files already use named class exports such as `AppComponent`, `HomePage`, and `UiButton`. The production contract should match what authors see in source: app code imports named role symbols from `.component.ts`, `.page.ts`, and `.button.ts` files without `@ts-expect-error`.

The Vite plugin may still emit a default compiled component module for existing runtime paths, but named imports are the public TypeScript-safe authoring boundary.

## 2. Scope

Phase 12E covers:

- named role imports for `.component.ts`, `.page.ts`, and `.button.ts` app-facing files;
- Vite transform output that exposes a named compiled component export matching compiler metadata;
- runtime, router, and testing types that accept the public role-module contract where they already consume components;
- the counter example;
- the Vite basic app fixture;
- the UI button primitive test;
- the CLI starter template;
- the 12E audit lane and tracker updates needed to complete Phase 12.

The TypeScript contract row in `docs/superpowers/final-tdd-inventory.md` may be marked `Production-Ready` only after user-facing suppressions are gone, focused package tests cover the contract, the 12E audit is green, and `pnpm verify` passes.

## 3. Public Import Contract

Author-facing code should use named imports:

```ts
import { AppComponent } from './app/app.component.ts';
import { HomePage } from './pages/home/home.page.ts';
import { UiButton } from './ui.button.ts';
```

Consumers should pass those symbols directly:

```ts
mount(AppComponent, target);

defineRoutes({
  home: {
    path: '/',
    label: 'Home',
    page: HomePage,
  },
});

testComponent(UiButton).can('render its label', function (screen) {
  screen.expect.text('Button');
});
```

This contract intentionally keeps role files as named class exports. It does not require default class exports and does not require app authors to import generated virtual modules.

## 4. Architecture

Phase 12E is a contract-alignment slice, not a declaration-generation system.

The main boundary remains simple:

- source role files keep named class exports;
- compiler metadata continues to identify the expected class and export name for the role file;
- the Vite plugin wraps compiler output around the compiled `component` object;
- transformed modules export that compiled object as both the existing default export and a named export matching the role class name;
- runtime, router, and testing code continue to accept raw no-argument role classes where TypeScript sees untransformed source, and compiled component modules where Vite has transformed the module at runtime.

This keeps TypeScript, Vite, and runtime behavior aligned without wildcard `.d.ts` declarations.

## 5. Vite Transform Contract

For a file such as `app.component.ts` with compiler metadata `componentName: 'AppComponent'`, the Vite transform should emit code with this public shape:

```ts
const component = { createComponent };
export { component as AppComponent };
export default component;
```

The named export must be derived from compiler metadata, not from ad hoc path parsing in the Vite plugin. If `compileForVite()` does not already receive the metadata cleanly, the compiler-facing result type should be extended narrowly to expose the existing component name.

The default export remains available to avoid unnecessary breakage in generated code paths and internal tests, but examples and generated starter code should move to named imports.

## 6. Runtime, Router, And Testing Types

Runtime already accepts both raw constructable classes and compiled component modules through `ComponentType`. Phase 12E should preserve that model.

Router route definitions should accept page symbols that TypeScript sees as no-argument role classes. At runtime, the Vite plugin transforms those imports into compiled component modules. The router should continue to resolve eager and lazy route modules, including dynamic imports that return a default compiled module.

Testing helpers should keep accepting `ComponentType`, so `testComponent(UiButton)` works when `UiButton` is seen by TypeScript as a class and by Vite/Vitest as a compiled component module.

If type changes are needed, keep them narrow and anchored in existing runtime types. Do not introduce a second component type hierarchy.

## 7. User-Facing File Updates

The 12E audit currently checks these files:

- `examples/counter/src/main.ts`
- `packages/vite-plugin/tests/fixtures/basic-app/src/main.ts`
- `packages/vite-plugin/tests/fixtures/basic-app/src/routes.ts`
- `packages/ui/src/primitives/button/ui.button.test.ts`
- `packages/cli/src/create/app-template.ts`

Phase 12E should remove every `@ts-expect-error` from these files and replace default role imports with named role imports.

CLI tests that currently assert the suppression comment should instead assert the named import contract and the absence of `@ts-expect-error`.

## 8. Testing Model

Focused tests should cover:

- `compileForVite()` emits the default export and named component export;
- Vite plugin transform output includes the metadata-derived named export for `.component.ts`, `.page.ts`, and `.button.ts`;
- the basic app fixture typechecks with named page/component imports;
- the counter example typechecks with named component imports;
- the UI button test typechecks with a named button import;
- CLI generated `main.ts` and `routes.ts` use named imports and no suppressions;
- `pnpm audit:core` no longer reports the 12E TypeScript contract audit failure.

Where package scripts already cover these files, prefer strengthening existing tests over adding broad new harnesses.

## 9. Documentation And Tracker Updates

When Phase 12E implementation completes:

- create and complete `docs/superpowers/plans/Phase-12E.md`;
- update `docs/superpowers/final-tdd-inventory.md` so transformed component imports are `Production-Ready`;
- update `docs/superpowers/feature-maturity.md` so the TypeScript contract row is `Production-Ready`;
- mark Phase 12 complete only if 12A through 12E are all green and documented;
- update `docs/vanrot-presentation.html` so Phase 12 appears complete and Phase 13 becomes the next active phase.

Do not mark Phase 12 complete before the phase docs guardrail and `pnpm verify` pass.

## 10. Verification Gates

Phase 12E should run:

```sh
pnpm --filter @vanrot/vite-plugin test
pnpm --filter @vanrot/vite-plugin typecheck
pnpm --filter @vanrot/router typecheck
pnpm --filter @vanrot/testing typecheck
pnpm --filter @vanrot/cli test
pnpm audit:core
pnpm verify
```

`pnpm audit:core` must pass with no remaining Phase 12 audit failures. `pnpm verify` remains the final completion gate.

## 11. Non-Goals

Phase 12E does not include:

- generated `.d.ts` files for role modules;
- wildcard module declarations for `*.component.ts`, `*.page.ts`, or `*.button.ts`;
- switching role files to default class exports;
- custom role suffixes or Phase 13 configuration conventions;
- constructor-injected component support;
- router redesign beyond accepting the existing component type contract;
- generated HMR accept/dispose behavior.

## 12. Acceptance Criteria

Phase 12E is accepted when:

- app-facing role imports use named symbols and no `@ts-expect-error`;
- transformed Vite modules export a named compiled component matching the role class name;
- eager route pages, lazy route pages, root mounts, and UI component tests typecheck cleanly;
- CLI generated starter files use the same named import contract;
- the 12E audit passes;
- `pnpm verify` passes;
- Phase 12 tracker rows and presentation state match the completed audit lane.

## 13. Self-Review Notes

This spec has no placeholder requirements. The chosen approach is explicit: preserve named role class exports and align transformed module exports with that public contract. Declaration generation, default class exports, Phase 13 configuration, and broader router redesign are intentionally out of scope.
