# Vanrot Phase 12E TypeScript Contract Hardening Implementation Plan

> **For inline execution:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove user-facing `@ts-expect-error` suppressions by making named Vanrot role imports typecheck and resolve to compiled component modules at runtime.

**Architecture:** Preserve named role class exports as the authoring contract. Make Vite-transformed modules export the compiled component object under the same named symbol, then align router/template/example usage with `ComponentType` so TypeScript accepts source-visible classes while runtime receives compiled modules.

**Tech Stack:** TypeScript, Vite 8 plugin API, Vitest, pnpm, Markdown.

**Execution Rule:** Work in the current `main` workspace only. Do not stage, commit, push, create a branch, create a worktree, or delegate work unless the user explicitly asks.

---

## File Structure

```txt
packages/vite-plugin/src/compile-for-vite.ts
  Modify. Export the compiled component object as the metadata-derived named role symbol in addition to the default export.

packages/vite-plugin/tests/compile-for-vite.test.ts
  Modify. Add red/green coverage that compileForVite emits named compiled exports for component, page, and button role modules.

packages/vite-plugin/tests/plugin-transform.test.ts
  Modify. Assert transform output preserves the named compiled export through the plugin hook.

packages/router/src/route/route-types.ts
  Modify. Let eager and lazy route pages use the shared runtime ComponentType instead of only compiled component modules.

packages/router/src/route/page-loader.ts
  Review. Keep route page resolution compatible with ComponentType and default dynamic import modules.

packages/router/tests/route/define-routes.test.ts
  Modify. Add coverage that defineRoutes accepts a source-visible no-argument page class.

packages/router/tests/route/page-loader.test.ts
  Modify. Add coverage that resolveRoutePage returns eager class pages and lazy class pages.

examples/counter/src/main.ts
  Modify. Replace default component import plus suppression with named CounterComponent import.

packages/vite-plugin/tests/fixtures/basic-app/src/main.ts
  Modify. Replace default App import plus suppression with named AppComponent import.

packages/vite-plugin/tests/fixtures/basic-app/src/routes.ts
  Modify. Replace default HomePage import plus suppression with named HomePage import. Make lazy AboutPage loading return the named symbol.

packages/ui/src/primitives/button/ui.button.test.ts
  Modify. Replace default UiButton import plus suppression with named UiButton import.

packages/cli/src/create/app-template.ts
  Modify. Generate named imports and no suppressions in starter `src/main.ts` and `src/routes.ts`.

packages/cli/tests/create.test.ts
  Modify. Assert generated files use named imports and do not contain `@ts-expect-error`.

docs/superpowers/final-tdd-inventory.md
  Modify at completion. Mark transformed component imports as Production-Ready.

docs/superpowers/feature-maturity.md
  Modify at completion. Mark the TypeScript contract row and Phase 12 audit lane complete; mark Phase 12 complete only after verification.

docs/vanrot-presentation.html
  Modify at completion. Mark Phase 12 complete and make Phase 13 active.

docs/superpowers/plans/Phase-12E.md
  Track this plan as tasks are completed.
```

## Task 1: Add Red Coverage For Named Vite Exports

**Files:**
- Modify: `packages/vite-plugin/tests/compile-for-vite.test.ts`
- Modify: `packages/vite-plugin/tests/plugin-transform.test.ts`
- Read: `packages/vite-plugin/src/compile-for-vite.ts`

- [x] **Step 1: Add compileForVite named export assertions**

In `packages/vite-plugin/tests/compile-for-vite.test.ts`, update the first test name from:

```ts
  it('wraps generated JS with CSS import and default component export', async () => {
```

to:

```ts
  it('wraps generated JS with CSS import plus default and named component exports', async () => {
```

In the same test, after the existing `export default component;` assertion, add:

```ts
    expect(result.code).toContain('export { component as AppComponent };');
```

- [x] **Step 2: Add page and button role export cases**

In `packages/vite-plugin/tests/compile-for-vite.test.ts`, add this test after the first test:

```ts
  it.each([
    {
      componentPath: '/repo/src/pages/home/home.page.ts',
      componentName: 'HomePage',
      expectedExport: 'export { component as HomePage };',
    },
    {
      componentPath: '/repo/src/ui/button/ui.button.ts',
      componentName: 'UiButton',
      expectedExport: 'export { component as UiButton };',
    },
  ])('emits the named compiled export for $componentName', async ({ componentPath, componentName, expectedExport }) => {
    const result = await compileForVite(componentPath, async () => ({
      js: 'export function createComponent() { return { node: document.createTextNode("ok"), ctx: {} }; }',
      css: '',
      diagnostics: [],
      metadata: {
        componentName,
        scopeAttribute: 'data-vr-test',
        features: [],
        componentDependencies: [],
        mappings: [],
      },
    }));

    expect(result.code).toContain('const component = { createComponent };');
    expect(result.code).toContain(expectedExport);
    expect(result.code).toContain('export default component;');
  });
```

- [x] **Step 3: Add plugin transform named export assertion**

In `packages/vite-plugin/tests/plugin-transform.test.ts`, in the test named `transforms component entries and registers sibling files`, change the compile stub code from:

```ts
        code: 'export function createComponent() { return { node: document.createTextNode("ok"), ctx: {} }; }\nconst component = { createComponent };\nexport default component;',
```

to:

```ts
        code: 'export function createComponent() { return { node: document.createTextNode("ok"), ctx: {} }; }\nconst component = { createComponent };\nexport { component as AppComponent };\nexport default component;',
```

Then change the result expectation from:

```ts
      code: expect.stringContaining('export default component;'),
```

to:

```ts
      code: expect.stringContaining('export { component as AppComponent };'),
```

- [x] **Step 4: Run the focused Vite tests and confirm the new compileForVite assertions fail**

Run:

```bash
pnpm --filter @vanrot/vite-plugin test -- compile-for-vite.test.ts plugin-transform.test.ts
```

Expected before implementation: `compile-for-vite.test.ts` fails because `result.code` does not contain `export { component as AppComponent };`, `export { component as HomePage };`, or `export { component as UiButton };`.

## Task 2: Emit Named Compiled Exports From Vite Transform Output

**Files:**
- Modify: `packages/vite-plugin/src/compile-for-vite.ts`
- Test: `packages/vite-plugin/tests/compile-for-vite.test.ts`
- Test: `packages/vite-plugin/tests/plugin-transform.test.ts`

- [x] **Step 1: Add metadata-derived named export to compileForVite output**

In `packages/vite-plugin/src/compile-for-vite.ts`, replace the `code` array:

```ts
  const code = [
    `import '${cssModuleId}';`,
    result.js,
    'const component = { createComponent };',
    'export default component;',
  ].join('\n\n');
```

with:

```ts
  const code = [
    `import '${cssModuleId}';`,
    result.js,
    'const component = { createComponent };',
    `export { component as ${result.metadata.componentName} };`,
    'export default component;',
  ].join('\n\n');
```

- [x] **Step 2: Run focused Vite transform tests**

Run:

```bash
pnpm --filter @vanrot/vite-plugin test -- compile-for-vite.test.ts plugin-transform.test.ts
```

Expected: all tests in both files pass.

- [x] **Step 3: Run Vite plugin typecheck**

Run:

```bash
pnpm --filter @vanrot/vite-plugin typecheck
```

Expected: TypeScript reports no errors.

## Task 3: Align Router Page Types With Runtime ComponentType

**Files:**
- Modify: `packages/router/src/route/route-types.ts`
- Modify: `packages/router/src/route/page-loader.ts`
- Modify: `packages/router/tests/route/define-routes.test.ts`
- Modify: `packages/router/tests/route/page-loader.test.ts`

- [x] **Step 1: Add defineRoutes coverage for source-visible page classes**

In `packages/router/tests/route/define-routes.test.ts`, add this class near the route constants:

```ts
class HomePage {}
```

Then add this test before the missing-page test:

```ts
  it('accepts source-visible page classes for eager routes', () => {
    const route = defineRoutes({
      home: {
        path: routePath.home,
        label: routeLabel.home,
        page: HomePage,
      },
    });

    expect(route.home.page).toBe(HomePage);
  });
```

- [x] **Step 2: Add page loader coverage for class pages**

In `packages/router/tests/route/page-loader.test.ts`, add this class near the top of the file:

```ts
class SettingsPage {}
```

Add these tests inside `describe('resolveRoutePage', ...)`:

```ts
  it('returns eager source-visible page classes', async () => {
    const page = await resolveRoutePage({
      key: 'settings',
      path: '/settings',
      label: 'Settings',
      page: SettingsPage,
    });

    expect(page).toBe(SettingsPage);
  });

  it('returns lazy source-visible page classes', async () => {
    const page = await resolveRoutePage({
      key: 'settings',
      path: '/settings',
      label: 'Settings',
      loadPage: async () => SettingsPage,
    });

    expect(page).toBe(SettingsPage);
  });
```

- [x] **Step 3: Run router tests and confirm type failures**

Run:

```bash
pnpm --filter @vanrot/router test -- define-routes.test.ts page-loader.test.ts
```

Expected before implementation: TypeScript or Vitest transform reports that `typeof HomePage` / `typeof SettingsPage` is not assignable to `RoutePageModule`.

- [x] **Step 4: Widen router route page types to ComponentType**

In `packages/router/src/route/route-types.ts`, change:

```ts
import type { CompiledComponentModule, Signal } from '@vanrot/runtime';
```

to:

```ts
import type { ComponentType, Signal } from '@vanrot/runtime';
```

Then replace:

```ts
export type RoutePageModule = CompiledComponentModule;
```

with:

```ts
export type RoutePageModule = ComponentType;
```

Keep:

```ts
export type RoutePageLoader = () => Promise<RoutePageModule | { default: RoutePageModule }>;
```

- [x] **Step 5: Confirm page-loader implementation still matches the widened type**

Open `packages/router/src/route/page-loader.ts`. It should still be:

```ts
import type { DefinedRoute, RoutePageModule } from './route-types.js';

export async function resolveRoutePage(route: DefinedRoute): Promise<RoutePageModule> {
  if (route.page !== undefined) {
    return route.page;
  }

  if (route.loadPage === undefined) {
    throw new Error(`Route "${route.key}" must define page or loadPage.`);
  }

  const loaded = await route.loadPage();

  if ('default' in loaded) {
    return loaded.default;
  }

  return loaded;
}
```

If this file already matches, leave it unchanged.

- [x] **Step 6: Run router tests and typecheck**

Run:

```bash
pnpm --filter @vanrot/router test -- define-routes.test.ts page-loader.test.ts
pnpm --filter @vanrot/router typecheck
```

Expected: both commands pass.

## Task 4: Replace App-Facing Suppressions With Named Imports

**Files:**
- Modify: `examples/counter/src/main.ts`
- Modify: `packages/vite-plugin/tests/fixtures/basic-app/src/main.ts`
- Modify: `packages/vite-plugin/tests/fixtures/basic-app/src/routes.ts`
- Modify: `packages/ui/src/primitives/button/ui.button.test.ts`
- Test: `audits/core/typescript-contracts.audit.ts`

- [x] **Step 1: Update the counter example import**

Replace `examples/counter/src/main.ts` with:

```ts
import { mount } from '@vanrot/runtime';
import { CounterComponent } from './counter/counter.component.ts';

const target = document.getElementById('app');

if (target === null) {
  throw new Error('Missing #app mount target.');
}

mount(CounterComponent, target);
```

- [x] **Step 2: Update the basic app root import**

Replace `packages/vite-plugin/tests/fixtures/basic-app/src/main.ts` with:

```ts
import { mount } from '@vanrot/runtime';
import { provideRouter } from '@vanrot/router';
import { AppComponent } from './app/app.component.ts';
import { route as appRoute } from './routes.ts';
import './styles/vanrot-tokens.css';
import './styles/vanrot-ui.css';

const target = document.getElementById('app');

if (target === null) {
  throw new Error('Missing app target.');
}

provideRouter(appRoute);
mount(AppComponent, target);
```

- [x] **Step 3: Update the basic app route imports**

Replace `packages/vite-plugin/tests/fixtures/basic-app/src/routes.ts` with:

```ts
import { defineRoutes } from '@vanrot/router';
import { HomePage } from './pages/home/home.page.ts';

export const route = defineRoutes({
  home: {
    path: '/',
    label: 'Home',
    page: HomePage,
  },
  about: {
    path: '/about',
    label: 'About',
    loadPage: () => import('./pages/about/about.page.ts').then((module) => module.AboutPage),
  },
});
```

- [x] **Step 4: Update the UI button primitive test import**

Replace `packages/ui/src/primitives/button/ui.button.test.ts` with:

```ts
// @vitest-environment jsdom

import { testComponent } from '@vanrot/testing';
import { UiButton } from './ui.button.ts';

const buttonCopy = {
  label: 'Button',
} as const;

testComponent(UiButton).can('render its label', function (screen) {
  screen.expect.text(buttonCopy.label);
});
```

- [x] **Step 5: Run the 12E audit**

Run:

```bash
pnpm audit:core
```

Expected after this task: the audit no longer lists these files as `@ts-expect-error` offenders. If type changes are incomplete, other focused commands in later tasks may still fail.

## Task 5: Update CLI Starter Template And Tests

**Files:**
- Modify: `packages/cli/src/create/app-template.ts`
- Modify: `packages/cli/tests/create.test.ts`

- [x] **Step 1: Update generated starter `src/main.ts` content**

In `packages/cli/src/create/app-template.ts`, replace the `src/main.ts` template content with:

```ts
      content: `import { mount } from '@vanrot/runtime';\nimport { provideRouter } from '@vanrot/router';\nimport { AppComponent } from './app/app.component.ts';\nimport { route as appRoute } from './routes.ts';\n${uiAppFile.tokenImport}\n\nconst target = document.getElementById('app');\n\nif (target === null) {\n  throw new Error('Missing #app mount target.');\n}\n\nprovideRouter(appRoute);\nmount(AppComponent, target);\n`,
```

- [x] **Step 2: Update generated starter `src/routes.ts` content**

In `packages/cli/src/create/app-template.ts`, replace the `src/routes.ts` template content with:

```ts
      content: `import { defineRoutes } from '@vanrot/router';\nimport { HomePage } from './pages/home/home.page.ts';\n\nexport const route = defineRoutes({\n  home: {\n    path: '/',\n    label: 'Home',\n    page: HomePage,\n  },\n  about: {\n    path: '/about',\n    label: 'About',\n    loadPage: () => import('./pages/about/about.page.ts').then((module) => module.AboutPage),\n  },\n});\n`,
```

- [x] **Step 3: Update create command test assertions**

In `packages/cli/tests/create.test.ts`, in the test named `creates a router-enabled Vanrot app`, replace the assertion that expects the suppression comment:

```ts
    await expect(readFile(join(appRoot, 'src', 'main.ts'), 'utf8')).resolves.toContain(
      "// @ts-expect-error Vanrot's Vite plugin compiles component modules to default exports.",
    );
```

with:

```ts
    const generatedMain = await readFile(join(appRoot, 'src', 'main.ts'), 'utf8');
    expect(generatedMain).toContain("import { AppComponent } from './app/app.component.ts';");
    expect(generatedMain).toContain('mount(AppComponent, target);');
    expect(generatedMain).not.toContain('@ts-expect-error');
```

In the same test, replace:

```ts
    await expect(readFile(join(appRoot, 'src', 'routes.ts'), 'utf8')).resolves.toContain(
      'defineRoutes',
    );
    await expect(readFile(join(appRoot, 'src', 'routes.ts'), 'utf8')).resolves.toContain(
      "loadPage: () => import('./pages/about/about.page.ts')",
    );
```

with:

```ts
    const generatedRoutes = await readFile(join(appRoot, 'src', 'routes.ts'), 'utf8');
    expect(generatedRoutes).toContain('defineRoutes');
    expect(generatedRoutes).toContain("import { HomePage } from './pages/home/home.page.ts';");
    expect(generatedRoutes).toContain(
      "loadPage: () => import('./pages/about/about.page.ts').then((module) => module.AboutPage)",
    );
    expect(generatedRoutes).not.toContain('@ts-expect-error');
```

- [x] **Step 4: Run CLI create tests**

Run:

```bash
pnpm --filter @vanrot/cli test -- create.test.ts
```

Expected: create tests pass and generated starter files contain no TypeScript suppressions.

## Task 6: Verify Cross-Package Type Contracts

**Files:**
- Test: `examples/counter/tsconfig.json`
- Test: `packages/vite-plugin/tests/fixtures/basic-app/tsconfig.json`
- Test: `packages/ui/src/primitives/button/ui.button.test.ts`
- Test: `packages/router/src/route/route-types.ts`

- [x] **Step 1: Run Vite plugin tests and typecheck**

Run:

```bash
pnpm --filter @vanrot/vite-plugin test
pnpm --filter @vanrot/vite-plugin typecheck
```

Expected: both commands pass.

- [x] **Step 2: Run router and testing typechecks**

Run:

```bash
pnpm --filter @vanrot/router typecheck
pnpm --filter @vanrot/testing typecheck
```

Expected: both commands pass.

- [x] **Step 3: Run UI package tests**

Run:

```bash
pnpm --filter @vanrot/ui test
```

Expected: UI tests pass, including `ui.button.test.ts` with named `UiButton` import.

- [x] **Step 4: Run CLI tests**

Run:

```bash
pnpm --filter @vanrot/cli test
```

Expected: CLI tests pass, including starter template assertions.

- [x] **Step 5: Run the core audit**

Run:

```bash
pnpm audit:core
```

Expected: all Phase 12 audit slices pass, including `12E TypeScript contracts and maturity gates`.

## Task 7: Update Phase 12 Trackers And Presentation

**Files:**
- Modify: `docs/superpowers/final-tdd-inventory.md`
- Modify: `docs/superpowers/feature-maturity.md`
- Modify: `docs/vanrot-presentation.html`
- Modify: `docs/superpowers/plans/Phase-12E.md`

- [x] **Step 1: Update the final TDD inventory typing row**

In `docs/superpowers/final-tdd-inventory.md`, change the Vite plugin typing row from:

```md
| typing | transformed component imports | Production-Ready | App authors can import compiled `.component.ts`, `.page.ts`, and `.button.ts` modules without `@ts-expect-error`. | Phase 12E | Named Vite exports, router `ComponentType` page contracts, examples, UI button tests, and CLI generated files are covered. |
```

to:

```md
| typing | transformed component imports | Production-Ready | App authors can import compiled `.component.ts`, `.page.ts`, and `.button.ts` modules without `@ts-expect-error`. | Phase 12E | Phase 12E verifies named role imports in examples, fixtures, UI primitive tests, generated starter templates, and Vite transform output. |
```

Change the final audit memory row from:

```md
| TypeScript import boundary | compiler, vite-plugin | `@ts-expect-error` still needed | Red/green tests proving app authors can import transformed role modules cleanly. | Phase 12E |
```

to:

```md
| TypeScript import boundary | compiler, vite-plugin | Production coverage exists | Red/green tests proving app authors can import transformed role modules cleanly. | Phase 12E |
```

- [x] **Step 2: Update the feature maturity TypeScript row**

In `docs/superpowers/feature-maturity.md`, change the `Component module TypeScript typing` row from `Deferred` to `Production-Ready` and replace its notes with:

```md
Phase 12E verifies named role imports for `.component.ts`, `.page.ts`, and `.button.ts`; Vite-transformed modules export the compiled component object under the source-visible role name while preserving the default export.
```

- [x] **Step 3: Mark Phase 12 complete in the top roadmap**

In `docs/superpowers/feature-maturity.md`, change the Phase 12 top row from:

```md
| [x]  | Phase 12 | Core framework hardening
```

to:

```md
| [x]  | Phase 12 | Core framework hardening
```

Update the `Core production audit lane` notes to:

```md
Phase 12A created the red lane. Phase 12B burned down runtime audit failures, Phase 12C burned down compiler audit failures, Phase 12D burned down Vite plugin audit failures, and Phase 12E burned down TypeScript contract audit failures.
```

- [x] **Step 4: Update the production slicing map**

In `docs/superpowers/feature-maturity.md`, change the Phase 12 slicing-map `Slice Needed` value from `Yes` to `No` and update its notes to:

```md
Completed across 12A through 12E; keep later config, router, UI, testing, and store hardening in their own phases.
```

- [x] **Step 5: Update the presentation roadmap**

In `docs/vanrot-presentation.html`, replace the Phase 12 status text:

```html
Done
```

with:

```html
12B runtime, 12C compiler, 12D Vite plugin, and 12E TypeScript contracts complete.
```

Replace:

```html
<span style="color:var(--cyan);">Active: Phase 13 Project configuration system</span>
<span style="color:var(--muted);">Completed: Phase 12 core framework hardening</span>
```

with:

```html
<span style="color:var(--cyan);">Active: Phase 13 project configuration system</span>
<span style="color:var(--muted);">Remaining: configuration, CLI, router, UI, testing, and store production hardening</span>
```

- [x] **Step 6: Mark this plan complete only after verification**

After Task 8 passes, change every completed checkbox in `docs/superpowers/plans/Phase-12E.md` from `- [ ]` to `- [x]`.

## Task 8: Final Verification

**Files:**
- Read: `docs/superpowers/plans/Phase-12E.md`
- Read: `docs/superpowers/feature-maturity.md`
- Read: `docs/superpowers/final-tdd-inventory.md`
- Read: `docs/vanrot-presentation.html`

- [x] **Step 1: Run phase docs verification**

Run:

```bash
pnpm verify:phase-docs
```

Expected: phase documentation guardrail passes. If it fails because Phase 12 is marked complete while this plan has unchecked tasks, finish the implementation and mark completed tasks before rerunning.

- [x] **Step 2: Run full verification**

Run:

```bash
pnpm verify
```

Expected: typecheck, tests, build, runtime size budget, and phase docs verification pass.

- [x] **Step 3: Record final working tree state**

Run:

```bash
git status --short --branch
```

Expected: changed files are limited to Phase 12E implementation, tests, examples, generated template, docs, and this plan/spec. No files are staged.

## Self-Review

- Spec coverage: The plan covers named role imports, Vite named compiled exports, runtime/router/testing component type alignment, user-facing suppressions, CLI starter output, audit verification, tracker updates, and Phase 12 completion gates.
- Placeholder scan: The plan contains no placeholder tasks. Every code-changing step includes the exact target file and replacement or insertion snippet.
- Type consistency: `RoutePageModule` is consistently widened to `ComponentType`; named role symbols are `CounterComponent`, `AppComponent`, `HomePage`, `AboutPage`, and `UiButton`; Vite output uses `result.metadata.componentName`.
- Scope check: Declaration generation, default class exports, Phase 13 config conventions, constructor injection, broad router redesign, and HMR accept/dispose remain out of scope.
