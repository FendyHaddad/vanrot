# Phase 16C Vanrot Learning Site Base Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Subagents are not allowed in this repository. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create `apps/vanrot-site`, the shadcn-style public Vanrot learning and documentation site base for `vanrot.vankode.com`, with docs for the implemented framework surface through Phase 15 plus Phase 16A and Phase 16B.

**Architecture:** Build the site as a separate workspace app that dogfoods Vanrot runtime, router, compiler role files, `@vanrot/ui` primitives, October tokens, and `vanrotstyles.css`. Keep docs data in one site registry, use package metadata where it already exists, and add a deterministic `verify:site-docs` guard so implemented framework surface area cannot drift from the site.

**Tech Stack:** Vanrot runtime, Vanrot router, Vanrot Vite plugin, `@vanrot/ui`, `vanrotstyles.css`, TypeScript, Vite, Vitest, Node verification scripts.

---

## Local Rules For This Plan

- Do not create a branch, worktree, commit, push, or stage files unless the user explicitly asks.
- Do not use subagents.
- Keep UI markup in `.html`, application logic in `.ts`, and styling in scoped `.css`.
- Put route names, route paths, labels, command names, status names, and docs copy in source-of-truth data modules instead of scattering string literals across pages.
- Use `Phase-16C.md` naming because this is a numbered Vanrot phase slice.
- Run the final verification commands before reporting completion.

## File Structure

Create:

- `apps/vanrot-site/package.json`: private workspace app scripts and local package dependencies.
- `apps/vanrot-site/tsconfig.json`: site TypeScript config with JSON docs data imports.
- `apps/vanrot-site/vite.config.ts`: Vanrot Vite plugin entry.
- `apps/vanrot-site/vanrot.config.ts`: canonical Vanrot config for the site.
- `apps/vanrot-site/index.html`: static mount shell.
- `apps/vanrot-site/src/main.ts`: imports tokens/styles, provides router, mounts app.
- `apps/vanrot-site/src/routes.ts`: route definitions sourced from docs metadata.
- `apps/vanrot-site/src/app/app.layout.ts/html/css`: global site shell with root router.
- `apps/vanrot-site/src/layouts/docs/docs.layout.ts/html/css`: docs shell with left navigation and route outlet.
- `apps/vanrot-site/src/pages/home/home.page.ts/html/css`: public landing page.
- `apps/vanrot-site/src/pages/docs/docs-article.page.ts/html/css`: generic framework docs page.
- `apps/vanrot-site/src/pages/components/component-gallery.page.ts/html/css`: preview-first Phase 16B primitive gallery using the saved visual baseline direction.
- `apps/vanrot-site/src/pages/components/component-article.page.ts/html/css`: generic UI primitive docs page.
- `apps/vanrot-site/src/pages/reference/reference.page.ts/html/css`: command/package/diagnostic/status reference page.
- `apps/vanrot-site/src/docs/site-data.json`: source-owned docs content and route metadata.
- `apps/vanrot-site/src/docs/site-data.ts`: typed accessors around docs JSON.
- `apps/vanrot-site/src/docs/site-navigation.ts`: navigation groups derived from docs data.
- `apps/vanrot-site/src/docs/component-docs.ts`: UI primitive docs derived from `@vanrot/ui` metadata plus site-owned copy.
- `apps/vanrot-site/src/docs/site-reference.ts`: commands, packages, diagnostics, and maturity reference data.
- `apps/vanrot-site/src/styles/site.css`: temporary site-only CSS for missing layout/nav primitives.
- `apps/vanrot-site/tests/site-data.test.ts`: docs data coverage tests.
- `apps/vanrot-site/tests/site-workspace.test.ts`: workspace wiring tests.
- `apps/vanrot-site/tests/site-pages.test.ts`: source convention tests for page files.
- `scripts/verify-site-docs.mjs`: deterministic docs drift guard.
- `scripts/verify-site-docs.test.mjs`: unit tests for the drift guard.

Modify:

- `package.json`: add `verify:site-docs`, include it in `verify`, and include its test in docs script coverage.
- `packages/ui/src/metadata.ts`: update Phase 16 slice names so 16C means site base, not layout/data.
- `packages/ui/src/index.ts`: export updated phase metadata names if needed by tests.
- `packages/ui/tests/metadata.test.ts`: assert the new Phase 16 slice map.
- `docs/superpowers/feature-maturity.md`: mark Phase 16C rows when implementation is complete.
- `docs/superpowers/final-tdd-inventory.md`: add Phase 16C site, data, guard, and generated app coverage.
- `docs/vanrot-presentation.html`: mark Phase 16C complete after verification and show Phase 16D as active.
- `docs/superpowers/plans/Phase-16C.md`: tick completed steps during execution.

---

## Task 1: Realign UI Phase Metadata

**Files:**

- Modify: `packages/ui/src/metadata.ts`
- Modify: `packages/ui/tests/metadata.test.ts`

- [x] **Step 1: Write the failing metadata test**

Add `uiComponentPhase` to the import list in `packages/ui/tests/metadata.test.ts`:

```ts
import {
  defaultUiPrefix,
  uiAppFile,
  uiAssetUrl,
  uiComponentCatalog,
  uiComponentPhase,
  uiFlavor,
  uiPackageInventory,
  uiPrimitive,
  uiPrimitiveOrder,
  uiPrimitiveType,
  uiPrimitiveVariant,
  uiStyleMode,
} from '../src/index.js';
```

Add this test after the October flavor/style test:

```ts
  it('exports the updated Phase 16 slice map', () => {
    expect(uiComponentPhase.foundation).toBe('16A');
    expect(uiComponentPhase.core).toBe('16B');
    expect(uiComponentPhase.site).toBe('16C');
    expect(uiComponentPhase.layoutNavigationMedia).toBe('16D');
    expect(uiComponentPhase.formsData).toBe('16E');
    expect(uiComponentPhase.overlaysInteraction).toBe('16F');
  });
```

- [x] **Step 2: Run the test to verify it fails**

Run:

```bash
pnpm --filter @vanrot/ui test -- tests/metadata.test.ts
```

Expected: FAIL because `uiComponentPhase.site`, `layoutNavigationMedia`, `formsData`, and `overlaysInteraction` do not exist yet.

- [x] **Step 3: Update the metadata source**

In `packages/ui/src/metadata.ts`, replace the current `uiComponentPhase` object with:

```ts
export const uiComponentPhase = {
  foundation: '16A',
  core: '16B',
  site: '16C',
  layoutNavigationMedia: '16D',
  formsData: '16E',
  overlaysInteraction: '16F',
} as const;
```

Keep existing Phase 16B primitive `productionPhase` values pointed at `uiComponentPhase.core`.

- [x] **Step 4: Run the test to verify it passes**

Run:

```bash
pnpm --filter @vanrot/ui test -- tests/metadata.test.ts
```

Expected: PASS.

- [x] **Step 5: Checkpoint**

Run:

```bash
git diff -- packages/ui/src/metadata.ts packages/ui/tests/metadata.test.ts
```

Expected: only the Phase 16 slice metadata and matching test changed.

---

## Task 2: Create The Site Workspace App

**Files:**

- Create: `apps/vanrot-site/package.json`
- Create: `apps/vanrot-site/tsconfig.json`
- Create: `apps/vanrot-site/vite.config.ts`
- Create: `apps/vanrot-site/vanrot.config.ts`
- Create: `apps/vanrot-site/index.html`
- Create: `apps/vanrot-site/tests/site-workspace.test.ts`

- [x] **Step 1: Write the failing workspace test**

Create `apps/vanrot-site/tests/site-workspace.test.ts`:

```ts
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const appRoot = join(process.cwd());

async function readJson<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(join(appRoot, path), 'utf8')) as T;
}

describe('vanrot site workspace', () => {
  it('is a private workspace app with Vanrot scripts and dependencies', async () => {
    const packageJson = await readJson<{
      private?: boolean;
      scripts?: Record<string, string>;
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    }>('package.json');

    expect(packageJson.private).toBe(true);
    expect(packageJson.scripts?.dev).toBe('vr dev');
    expect(packageJson.scripts?.build).toBe('vr build');
    expect(packageJson.scripts?.test).toBe('vitest run');
    expect(packageJson.scripts?.typecheck).toBe('tsc -p tsconfig.json --noEmit');
    expect(packageJson.dependencies?.['@vanrot/runtime']).toBe('file:../../packages/runtime');
    expect(packageJson.dependencies?.['@vanrot/router']).toBe('file:../../packages/router');
    expect(packageJson.dependencies?.['@vanrot/ui']).toBe('file:../../packages/ui');
    expect(packageJson.devDependencies?.['@vanrot/vite-plugin']).toBe('file:../../packages/vite-plugin');
  });

  it('uses Vanrot plugin and Vanrot config', async () => {
    await expect(readFile(join(appRoot, 'vite.config.ts'), 'utf8')).resolves.toContain(
      "import vanrot from '@vanrot/vite-plugin';",
    );
    await expect(readFile(join(appRoot, 'vanrot.config.ts'), 'utf8')).resolves.toContain(
      'defineVanrotConfig',
    );
    await expect(readFile(join(appRoot, 'index.html'), 'utf8')).resolves.toContain(
      'src="/src/main.ts"',
    );
  });
});
```

- [x] **Step 2: Run the test to verify it fails**

Run:

```bash
pnpm --filter @vanrot/vanrot-site test -- tests/site-workspace.test.ts
```

Expected: FAIL because `@vanrot/vanrot-site` and the test files do not exist yet.

- [x] **Step 3: Create `apps/vanrot-site/package.json`**

Create:

```json
{
  "name": "@vanrot/vanrot-site",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "packageManager": "pnpm@11.1.3",
  "scripts": {
    "dev": "vr dev",
    "build": "vr build",
    "test": "vitest run",
    "doctor": "vr doctor",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "clean": "node -e \"import('node:fs').then(({ rmSync }) => rmSync('dist', { recursive: true, force: true }))\""
  },
  "dependencies": {
    "@vanrot/config": "file:../../packages/config",
    "@vanrot/runtime": "file:../../packages/runtime",
    "@vanrot/router": "file:../../packages/router",
    "@vanrot/ui": "file:../../packages/ui"
  },
  "devDependencies": {
    "@vanrot/cli": "file:../../packages/cli",
    "@vanrot/vite-plugin": "file:../../packages/vite-plugin",
    "typescript": "^5.9.3",
    "vite": "^8.0.10",
    "vitest": "^4.0.14"
  }
}
```

- [x] **Step 4: Create config and mount shell files**

Create `apps/vanrot-site/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "types": ["node", "vite/client", "vitest/globals"]
  },
  "include": ["src/**/*.ts", "src/**/*.json", "tests/**/*.ts", "vite.config.ts", "vanrot.config.ts"]
}
```

Create `apps/vanrot-site/vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import vanrot from '@vanrot/vite-plugin';

export default defineConfig({
  plugins: [vanrot()],
});
```

Create `apps/vanrot-site/vanrot.config.ts`:

```ts
import { defineVanrotConfig } from '@vanrot/config';

export default defineVanrotConfig({
  schemaVersion: 1,
  project: { name: 'Vanrot Site' },
  source: { root: 'src' },
  devServer: { port: 1010 },
  ui: { flavor: 'october', styles: 'vanrotstyles', prefix: 'ui' },
  docs: { site: 'vanrot.vankode.com' },
});
```

Create `apps/vanrot-site/index.html`:

```html
<div id="app"></div>
<script type="module" src="/src/main.ts"></script>
```

- [x] **Step 5: Run the workspace test**

Run:

```bash
pnpm install
pnpm --filter @vanrot/vanrot-site test -- tests/site-workspace.test.ts
```

Expected: PASS. `pnpm install` updates the lockfile so the new workspace dependency graph is known.

- [x] **Step 6: Checkpoint**

Run:

```bash
git diff -- apps/vanrot-site/package.json apps/vanrot-site/tsconfig.json apps/vanrot-site/vite.config.ts apps/vanrot-site/vanrot.config.ts apps/vanrot-site/index.html pnpm-lock.yaml
```

Expected: new app workspace files plus lockfile changes only.

---

## Task 3: Create Site Data And Reference Registries

**Files:**

- Create: `apps/vanrot-site/src/docs/site-data.json`
- Create: `apps/vanrot-site/src/docs/site-data.ts`
- Create: `apps/vanrot-site/src/docs/site-navigation.ts`
- Create: `apps/vanrot-site/src/docs/component-docs.ts`
- Create: `apps/vanrot-site/src/docs/site-reference.ts`
- Create: `apps/vanrot-site/tests/site-data.test.ts`

- [x] **Step 1: Write the failing docs data test**

Create `apps/vanrot-site/tests/site-data.test.ts`:

```ts
import { cliCommandDocs, packageReferenceDocs, siteArticleKeys, siteArticles } from '../src/docs/site-data.ts';
import { componentDocs } from '../src/docs/component-docs.ts';
import { siteNavigationGroups } from '../src/docs/site-navigation.ts';
import { describe, expect, it } from 'vitest';
import { uiPrimitiveOrder } from '@vanrot/ui';

describe('vanrot site docs data', () => {
  it('documents the required framework learning pages', () => {
    expect(siteArticleKeys).toEqual([
      'introduction',
      'installation',
      'projectStructure',
      'runtime',
      'compiler',
      'vitePlugin',
      'cli',
      'configuration',
      'routing',
      'uiOctober',
      'theming',
      'vanrotstyles',
      'testing',
      'examples',
      'conventions',
      'referenceStatus',
    ]);

    for (const key of siteArticleKeys) {
      const article = siteArticles[key];
      expect(article.title.length).toBeGreaterThan(0);
      expect(article.summary.length).toBeGreaterThan(0);
      expect(article.sections.length).toBeGreaterThan(0);
    }
  });

  it('documents every current Phase 16B primitive from @vanrot/ui metadata', () => {
    expect(componentDocs.map((doc) => doc.primitive)).toEqual(uiPrimitiveOrder);

    for (const doc of componentDocs) {
      expect(doc.title.length).toBeGreaterThan(0);
      expect(doc.usage.length).toBeGreaterThan(0);
      expect(doc.accessibility.length).toBeGreaterThan(0);
      expect(doc.api.length).toBeGreaterThan(0);
    }
  });

  it('documents current commands and implemented packages', () => {
    expect(cliCommandDocs.map((command) => command.name)).toEqual([
      'create',
      'generate',
      'add',
      'config',
      'doctor',
      'map',
      'init-ai',
      'ai',
      'dev',
      'build',
      'test',
    ]);
    expect(packageReferenceDocs.map((item) => item.name)).toEqual([
      '@vanrot/runtime',
      '@vanrot/compiler',
      '@vanrot/config',
      '@vanrot/router',
      '@vanrot/vite-plugin',
      '@vanrot/cli',
      '@vanrot/ui',
      '@vanrot/testing',
    ]);
  });

  it('builds navigation for the whole framework, not only UI', () => {
    expect(siteNavigationGroups.map((group) => group.label)).toEqual([
      'Get Started',
      'Framework',
      'UI',
      'Examples',
      'Reference',
    ]);
  });
});
```

- [x] **Step 2: Run the test to verify it fails**

Run:

```bash
pnpm --filter @vanrot/vanrot-site test -- tests/site-data.test.ts
```

Expected: FAIL because the docs data modules do not exist.

- [x] **Step 3: Create `site-data.json`**

Create `apps/vanrot-site/src/docs/site-data.json` with these keys and enough prose to make the first site useful:

```json
{
  "articles": [
    {
      "key": "introduction",
      "section": "getStarted",
      "path": "/docs",
      "label": "Introduction",
      "title": "Vanrot",
      "summary": "Vanrot is a small frontend framework with compiler-known templates, signals, route ownership, source-owned UI, and a documentation-first development path.",
      "status": "available-now",
      "sections": [
        {
          "id": "what-it-is",
          "title": "What Vanrot Gives You",
          "body": "Vanrot combines a small runtime, compiler role files, a Vite plugin, a typed router, a guided CLI, and source-owned UI primitives."
        },
        {
          "id": "what-exists-now",
          "title": "What Exists Now",
          "body": "The implemented surface includes runtime signals, compiled components and pages, scoped CSS, config loading, CLI commands, production router behavior, October tokens, vanrotstyles, and Phase 16B UI primitives."
        }
      ]
    },
    {
      "key": "installation",
      "section": "getStarted",
      "path": "/docs/installation",
      "label": "Installation",
      "title": "Installation",
      "summary": "Create or run a Vanrot app through the CLI and workspace package graph.",
      "status": "demo-capable",
      "sections": [
        { "id": "create", "title": "Create A Project", "body": "Use vr create <name> for generated apps. In this monorepo, workspace links are used until package publishing is complete." },
        { "id": "scripts", "title": "Scripts", "body": "Generated apps use vr dev, vr build, vr test, and vr doctor so project commands stay conventional." }
      ]
    },
    {
      "key": "projectStructure",
      "section": "getStarted",
      "path": "/docs/project-structure",
      "label": "Project Structure",
      "title": "Project Structure",
      "summary": "Vanrot keeps source roles explicit with TypeScript, HTML, and CSS side by side.",
      "status": "available-now",
      "sections": [
        { "id": "role-files", "title": "Role Files", "body": "Components use .component.ts/html/css, pages use .page.ts/html/css, layouts use .layout.ts/html/css, and UI primitives use role suffixes such as .button.ts/html/css." },
        { "id": "source-root", "title": "Source Root", "body": "vanrot.config.ts owns the source root. The default is src." }
      ]
    },
    {
      "key": "runtime",
      "section": "framework",
      "path": "/docs/runtime",
      "label": "Runtime",
      "title": "Runtime",
      "summary": "The runtime owns signals, computed values, effects, lifecycle hooks, inputs, and mounting.",
      "status": "production-ready-through-phase-12",
      "sections": [
        { "id": "signals", "title": "Signals", "body": "Use signal(), computed(), effect(), batch(), and untrack() for reactive state. The runtime stays small and is protected by the size budget." },
        { "id": "lifecycle", "title": "Lifecycle", "body": "Use onMount() and onDestroy() for component lifecycle work. Cleanup scopes are automatic through mount and generated code." }
      ]
    },
    {
      "key": "compiler",
      "section": "framework",
      "path": "/docs/compiler",
      "label": "Compiler",
      "title": "Compiler",
      "summary": "The compiler turns role files into mounted DOM with scoped CSS, diagnostics, source maps, control flow, child components, slots, and UI primitive lowering.",
      "status": "production-ready-through-phase-12",
      "sections": [
        { "id": "templates", "title": "Templates", "body": "Vanrot templates support interpolation, property binding, event binding, @if, @for, child components, slots, route links, and supported vr-* UI primitives." },
        { "id": "diagnostics", "title": "Diagnostics", "body": "Compiler diagnostics include stable codes, source locations, suggestions, and docs paths." }
      ]
    },
    {
      "key": "vitePlugin",
      "section": "framework",
      "path": "/docs/vite-plugin",
      "label": "Vite Plugin",
      "title": "Vite Plugin",
      "summary": "The Vite plugin compiles Vanrot role files in dev and build, bridges diagnostics, watches sibling files, and emits source maps.",
      "status": "production-ready-through-phase-12",
      "sections": [
        { "id": "usage", "title": "Usage", "body": "Add vanrot() to Vite plugins. The plugin reads vanrot.config.ts and uses the configured source root." },
        { "id": "hmr", "title": "HMR", "body": "HTML and CSS sibling edits invalidate the owner role module so development stays predictable." }
      ]
    },
    {
      "key": "cli",
      "section": "framework",
      "path": "/docs/cli",
      "label": "CLI",
      "title": "CLI",
      "summary": "The CLI provides project creation, generation, UI primitive add flows, dev/build/test wrappers, doctor, map, config maintenance, and AI-readable local context.",
      "status": "demo-capable-through-phase-14",
      "sections": [
        { "id": "commands", "title": "Commands", "body": "Current commands are create, generate, add, config, doctor, map, init-ai, ai, dev, build, and test." },
        { "id": "output", "title": "Output", "body": "Phase 14 made CLI output grouped, readable, colored where supported, and structured for selected read commands." }
      ]
    },
    {
      "key": "configuration",
      "section": "framework",
      "path": "/docs/configuration",
      "label": "Configuration",
      "title": "Configuration",
      "summary": "vanrot.config.ts is the typed source of truth for source roots, dev server port, UI flavor, UI style mode, and future package domains.",
      "status": "production-ready-through-phase-13",
      "sections": [
        { "id": "defaults", "title": "Defaults", "body": "The default source root is src, the default dev server port is 1010, the default UI flavor is october, and the default UI style mode is vanrotstyles." },
        { "id": "maintenance", "title": "Maintenance", "body": "Use vr config migrate and vr config recover to create or repair canonical config." }
      ]
    },
    {
      "key": "routing",
      "section": "framework",
      "path": "/docs/routing",
      "label": "Routing",
      "title": "Routing",
      "summary": "The router owns route refs, nested layouts, params, query strings, redirects, guards, active links, breadcrumbs, preloading, and keepAlive.",
      "status": "production-ready-through-phase-15",
      "sections": [
        { "id": "define-routes", "title": "Define Routes", "body": "Use createRoutes() and defineRoutes({ ... }) so paths, labels, navigation metadata, breadcrumbs, and route refs live in one place." },
        { "id": "performance", "title": "Performance", "body": "Routes can opt into intent preloading and same-day keepAlive policies." }
      ]
    },
    {
      "key": "uiOctober",
      "section": "ui",
      "path": "/docs/ui",
      "label": "October",
      "title": "UI October",
      "summary": "October is Vanrot's dark-first, light-capable UI foundation with source-owned primitives, tokens, and vanrotstyles.",
      "status": "in-progress-through-phase-16b",
      "sections": [
        { "id": "ownership", "title": "Source Ownership", "body": "Vanrot UI follows a developer-owned model. Primitives are readable source files and compiler-lowered semantic tags, not opaque black boxes." },
        { "id": "current-primitives", "title": "Current Primitives", "body": "Phase 16B includes button, card, badge, avatar, alert, loader, skeleton, and separator." }
      ]
    },
    {
      "key": "theming",
      "section": "ui",
      "path": "/docs/theming",
      "label": "Theming",
      "title": "Theming",
      "summary": "Vanrot themes use CSS custom properties for colors, surfaces, radius, shadows, typography, motion, and z-index layers.",
      "status": "available-now",
      "sections": [
        { "id": "dark-light", "title": "Dark First, Light Capable", "body": "October defaults to a dark-first theme and supports data-theme=\"light\" for light mode." },
        { "id": "typography", "title": "Typography", "body": "The default identity uses Geist for text and JetBrains Mono for numeric UI." }
      ]
    },
    {
      "key": "vanrotstyles",
      "section": "ui",
      "path": "/docs/vanrotstyles",
      "label": "vanrotstyles",
      "title": "vanrotstyles",
      "summary": "vanrotstyles.css is Vanrot's first-party utility CSS layer with unprefixed utility classes.",
      "status": "available-now",
      "sections": [
        { "id": "usage", "title": "Usage", "body": "Use ui.styles: 'vanrotstyles' to use the first-party utility layer. Use 'tailwind' or 'none' when the app owns another style path." },
        { "id": "utilities", "title": "Utilities", "body": "Utilities cover display, flex, grid, spacing, sizing, typography, surfaces, borders, radius, shadows, motion, overflow, z-index, and accessibility helpers." }
      ]
    },
    {
      "key": "testing",
      "section": "framework",
      "path": "/docs/testing",
      "label": "Testing",
      "title": "Testing",
      "summary": "Vanrot testing currently provides component test helpers and will expand after the production UI and site base are in place.",
      "status": "demo-capable",
      "sections": [
        { "id": "current", "title": "Current Helper", "body": "testComponent(...) mounts a component through the runtime and exposes a small screen helper." },
        { "id": "future-scope", "title": "Future Scope", "body": "Phase 18 owns page tests, router workflows, accessibility assertions, async helpers, fake timers, and generator-wide test output." }
      ]
    },
    {
      "key": "examples",
      "section": "examples",
      "path": "/docs/examples",
      "label": "Examples",
      "title": "Examples",
      "summary": "Examples show practical Vanrot usage without hiding the source files.",
      "status": "demo-capable",
      "sections": [
        { "id": "counter", "title": "Counter", "body": "examples/counter demonstrates runtime state, compiler role files, Vite integration, and build verification." },
        { "id": "site", "title": "Vanrot Site", "body": "apps/vanrot-site becomes the framework's living documentation example." }
      ]
    },
    {
      "key": "conventions",
      "section": "framework",
      "path": "/docs/conventions",
      "label": "Conventions",
      "title": "Conventions",
      "summary": "Vanrot conventions keep projects readable for humans and AI tools.",
      "status": "available-now",
      "sections": [
        { "id": "roles", "title": "Role Suffixes", "body": "Use .component, .page, .layout, .dialog, .widget, .form, and UI primitive role suffixes for Vanrot-owned files." },
        { "id": "source-of-truth", "title": "Source Of Truth", "body": "Avoid reused strings for routes, command names, diagnostics, paths, labels, generated copy, and file suffixes." }
      ]
    },
    {
      "key": "referenceStatus",
      "section": "reference",
      "path": "/reference",
      "label": "Status",
      "title": "Reference Status",
      "summary": "The reference section shows what is available now, demo-capable, in progress, planned, or deferred.",
      "status": "available-now",
      "sections": [
        { "id": "phases", "title": "Production Phases", "body": "Phases 11 through 15 are complete. Phase 16A and 16B are complete slices. Phase 16C creates this learning site base." },
        { "id": "audit", "title": "Final Audit", "body": "Phase 24 remains the final documentation and public web presence audit after the feature surface stabilizes." }
      ]
    }
  ],
  "primitiveDocs": [
    { "primitive": "button", "title": "Button", "summary": "Use buttons for actions and command triggers.", "usage": "<vr-button variant=\"default\" type=\"button\">Save</vr-button>", "accessibility": "Buttons lower to native button elements and preserve focus, disabled, keyboard, and type behavior." },
    { "primitive": "card", "title": "Card", "summary": "Use cards for grouped content surfaces.", "usage": "<vr-card variant=\"default\">Content</vr-card>", "accessibility": "Cards lower to article-like surfaces and keep child content readable." },
    { "primitive": "badge", "title": "Badge", "summary": "Use badges for short status, category, or metadata labels.", "usage": "<vr-badge variant=\"success\">Ready</vr-badge>", "accessibility": "Badge examples should not rely on color alone for meaning." },
    { "primitive": "avatar", "title": "Avatar", "summary": "Use avatars for person, tenant, team, or entity identity.", "usage": "<vr-avatar variant=\"soft\">VR</vr-avatar>", "accessibility": "Avatar content should include accessible names when it represents a person or entity." },
    { "primitive": "alert", "title": "Alert", "summary": "Use alerts for persistent inline feedback.", "usage": "<vr-alert variant=\"info\">Project ready.</vr-alert>", "accessibility": "Alerts use severity-aware semantics without making every note interruptive." },
    { "primitive": "loader", "title": "Loader", "summary": "Use loaders for pending activity.", "usage": "<vr-loader variant=\"spinner\" aria-label=\"Loading\"></vr-loader>", "accessibility": "Decorative loaders are hidden by default unless labelled." },
    { "primitive": "skeleton", "title": "Skeleton", "summary": "Use skeletons to preserve layout while content loads.", "usage": "<vr-skeleton variant=\"text\"></vr-skeleton>", "accessibility": "Skeletons are decorative by default and should not replace real loading labels." },
    { "primitive": "separator", "title": "Separator", "summary": "Use separators to divide related content.", "usage": "<vr-separator variant=\"horizontal\"></vr-separator>", "accessibility": "Separators expose orientation when semantics are needed." }
  ],
  "commands": [
    { "name": "create", "usage": "vr create <name>", "status": "demo-capable" },
    { "name": "generate", "usage": "vr generate <role> <name>", "status": "demo-capable" },
    { "name": "add", "usage": "vr add <primitive>", "status": "demo-capable-through-phase-16b" },
    { "name": "config", "usage": "vr config <action>", "status": "production-ready-through-phase-13" },
    { "name": "doctor", "usage": "vr doctor", "status": "demo-capable" },
    { "name": "map", "usage": "vr map", "status": "demo-capable" },
    { "name": "init-ai", "usage": "vr init-ai", "status": "demo-capable" },
    { "name": "ai", "usage": "vr ai <action>", "status": "demo-capable" },
    { "name": "dev", "usage": "vr dev", "status": "demo-capable" },
    { "name": "build", "usage": "vr build", "status": "demo-capable" },
    { "name": "test", "usage": "vr test", "status": "demo-capable" }
  ],
  "packages": [
    { "name": "@vanrot/runtime", "area": "Runtime", "status": "production-ready-through-phase-12" },
    { "name": "@vanrot/compiler", "area": "Compiler", "status": "production-ready-through-phase-12" },
    { "name": "@vanrot/config", "area": "Configuration", "status": "production-ready-through-phase-13" },
    { "name": "@vanrot/router", "area": "Router", "status": "production-ready-through-phase-15" },
    { "name": "@vanrot/vite-plugin", "area": "Vite", "status": "production-ready-through-phase-12" },
    { "name": "@vanrot/cli", "area": "CLI", "status": "demo-capable-through-phase-14" },
    { "name": "@vanrot/ui", "area": "UI", "status": "in-progress-through-phase-16b" },
    { "name": "@vanrot/testing", "area": "Testing", "status": "demo-capable" }
  ],
  "diagnostics": {
    "compiler": ["VR001", "VR002", "VR003", "VR004", "VR005", "VR006", "VR007", "VR008", "VR009", "VR010", "VR011", "VR012", "VR013", "VR014", "VR015", "VR016", "VR017", "VR018", "VR019"],
    "config": ["VRCFG001", "VRCFG002", "VRCFG003", "VRCFG004", "VRCFG005", "VRCFG006", "VRCFG007", "VRCFG008"],
    "router": ["VR_ROUTE_DUPLICATE_PATH", "VR_ROUTE_INVALID_PARENT_PATH", "VR_ROUTE_MISSING_RENDER_TARGET", "VR_CHILD_BEFORE_PARENT", "VR_ROUTE_PRELOAD_FAILED", "VR_KEEP_ALIVE_RESTORE_BLOCKED"]
  }
}
```

- [x] **Step 4: Create typed docs accessors**

Create `apps/vanrot-site/src/docs/site-data.ts`:

```ts
import siteDataJson from './site-data.json';

export const siteSectionKey = {
  getStarted: 'getStarted',
  framework: 'framework',
  ui: 'ui',
  examples: 'examples',
  reference: 'reference',
} as const;

export type SiteSectionKey = (typeof siteSectionKey)[keyof typeof siteSectionKey];

export const siteStatus = {
  availableNow: 'available-now',
  demoCapable: 'demo-capable',
  productionReadyThroughPhase12: 'production-ready-through-phase-12',
  productionReadyThroughPhase13: 'production-ready-through-phase-13',
  productionReadyThroughPhase15: 'production-ready-through-phase-15',
  demoCapableThroughPhase14: 'demo-capable-through-phase-14',
  inProgressThroughPhase16B: 'in-progress-through-phase-16b',
} as const;

export type SiteStatus = (typeof siteStatus)[keyof typeof siteStatus];

export interface SiteArticleSection {
  id: string;
  title: string;
  body: string;
}

export interface SiteArticle {
  key: SiteArticleKey;
  section: SiteSectionKey;
  path: string;
  label: string;
  title: string;
  summary: string;
  status: string;
  sections: readonly SiteArticleSection[];
}

export const siteArticleKey = {
  introduction: 'introduction',
  installation: 'installation',
  projectStructure: 'projectStructure',
  runtime: 'runtime',
  compiler: 'compiler',
  vitePlugin: 'vitePlugin',
  cli: 'cli',
  configuration: 'configuration',
  routing: 'routing',
  uiOctober: 'uiOctober',
  theming: 'theming',
  vanrotstyles: 'vanrotstyles',
  testing: 'testing',
  examples: 'examples',
  conventions: 'conventions',
  referenceStatus: 'referenceStatus',
} as const;

export type SiteArticleKey = (typeof siteArticleKey)[keyof typeof siteArticleKey];

export const siteArticleKeys = Object.values(siteArticleKey);

const rawArticles = siteDataJson.articles as SiteArticle[];

export const siteArticles = Object.fromEntries(
  rawArticles.map((article) => [article.key, article]),
) as Record<SiteArticleKey, SiteArticle>;

export function getSiteArticle(key: SiteArticleKey): SiteArticle {
  return siteArticles[key];
}

export const primitiveDocCopy = siteDataJson.primitiveDocs;
export const cliCommandDocs = siteDataJson.commands;
export const packageReferenceDocs = siteDataJson.packages;
export const diagnosticReferenceDocs = siteDataJson.diagnostics;
```

- [x] **Step 5: Create navigation and component docs**

Create `apps/vanrot-site/src/docs/site-navigation.ts`:

```ts
import {
  getSiteArticle,
  siteArticleKey,
  siteSectionKey,
  type SiteArticleKey,
  type SiteSectionKey,
} from './site-data.ts';

export interface SiteNavigationItem {
  key: SiteArticleKey;
  href: string;
  label: string;
}

export interface SiteNavigationGroup {
  section: SiteSectionKey;
  label: string;
  items: readonly SiteNavigationItem[];
}

function navItem(key: SiteArticleKey): SiteNavigationItem {
  const article = getSiteArticle(key);
  return {
    key,
    href: article.path,
    label: article.label,
  };
}

export const siteNavigationGroups: readonly SiteNavigationGroup[] = [
  {
    section: siteSectionKey.getStarted,
    label: 'Get Started',
    items: [
      navItem(siteArticleKey.introduction),
      navItem(siteArticleKey.installation),
      navItem(siteArticleKey.projectStructure),
    ],
  },
  {
    section: siteSectionKey.framework,
    label: 'Framework',
    items: [
      navItem(siteArticleKey.runtime),
      navItem(siteArticleKey.compiler),
      navItem(siteArticleKey.vitePlugin),
      navItem(siteArticleKey.cli),
      navItem(siteArticleKey.configuration),
      navItem(siteArticleKey.routing),
      navItem(siteArticleKey.testing),
      navItem(siteArticleKey.conventions),
    ],
  },
  {
    section: siteSectionKey.ui,
    label: 'UI',
    items: [
      navItem(siteArticleKey.uiOctober),
      navItem(siteArticleKey.theming),
      navItem(siteArticleKey.vanrotstyles),
    ],
  },
  {
    section: siteSectionKey.examples,
    label: 'Examples',
    items: [navItem(siteArticleKey.examples)],
  },
  {
    section: siteSectionKey.reference,
    label: 'Reference',
    items: [navItem(siteArticleKey.referenceStatus)],
  },
];
```

Create `apps/vanrot-site/src/docs/component-docs.ts`:

```ts
import { uiPrimitive, uiPrimitiveOrder, type UiPrimitiveType } from '@vanrot/ui';
import { primitiveDocCopy } from './site-data.ts';

export interface ComponentDoc {
  primitive: UiPrimitiveType;
  href: string;
  title: string;
  summary: string;
  usage: string;
  accessibility: string;
  api: string;
}

const componentDocCopy = Object.fromEntries(
  primitiveDocCopy.map((doc) => [doc.primitive, doc]),
) as Record<
  UiPrimitiveType,
  { title: string; summary: string; usage: string; accessibility: string }
>;

export const componentDocs: readonly ComponentDoc[] = uiPrimitiveOrder.map((primitive) => {
  const metadata = uiPrimitive[primitive];
  const copy = componentDocCopy[primitive];

  return {
    primitive,
    href: metadata.docsPath,
    title: copy.title,
    summary: copy.summary,
    usage: copy.usage,
    accessibility: copy.accessibility,
    api: `Selector ${metadata.selector}; native tag ${metadata.nativeTag}; variants ${metadata.variants.join(', ')}.`,
  };
});
```

Create `apps/vanrot-site/src/docs/site-reference.ts`:

```ts
import {
  cliCommandDocs,
  diagnosticReferenceDocs,
  packageReferenceDocs,
} from './site-data.ts';

export const commandReference = cliCommandDocs;
export const packageReference = packageReferenceDocs;

export const diagnosticReference = diagnosticReferenceDocs;
```

- [x] **Step 6: Run docs data tests**

Run:

```bash
pnpm --filter @vanrot/vanrot-site test -- tests/site-data.test.ts
```

Expected: PASS.

---

## Task 4: Implement Routes And Page Shells

**Files:**

- Create: `apps/vanrot-site/src/main.ts`
- Create: `apps/vanrot-site/src/routes.ts`
- Create: `apps/vanrot-site/src/app/app.layout.ts`
- Create: `apps/vanrot-site/src/app/app.layout.html`
- Create: `apps/vanrot-site/src/app/app.layout.css`
- Create: `apps/vanrot-site/src/layouts/docs/docs.layout.ts`
- Create: `apps/vanrot-site/src/layouts/docs/docs.layout.html`
- Create: `apps/vanrot-site/src/layouts/docs/docs.layout.css`
- Create: `apps/vanrot-site/tests/site-pages.test.ts`

- [x] **Step 1: Write failing source convention tests**

Create `apps/vanrot-site/tests/site-pages.test.ts`:

```ts
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const appRoot = process.cwd();

async function readSiteFile(path: string): Promise<string> {
  return readFile(join(appRoot, path), 'utf8');
}

describe('vanrot site pages', () => {
  it('mounts the app through Vanrot runtime and router', async () => {
    const main = await readSiteFile('src/main.ts');

    expect(main).toContain("import { mount } from '@vanrot/runtime';");
    expect(main).toContain("import { provideRouter } from '@vanrot/router';");
    expect(main).toContain("import './styles/site.css';");
    expect(main).toContain('provideRouter(siteRoute);');
  });

  it('uses a single root vr-router in the app layout', async () => {
    const appLayout = await readSiteFile('src/app/app.layout.html');

    expect(appLayout.match(/<vr-router><\\/vr-router>/g)).toHaveLength(1);
    expect(appLayout).not.toContain('<vr-outlet>');
  });

  it('uses a route outlet only in docs layout', async () => {
    const docsLayout = await readSiteFile('src/layouts/docs/docs.layout.html');

    expect(docsLayout.match(/<vr-outlet><\\/vr-outlet>/g)).toHaveLength(1);
    expect(docsLayout).not.toContain('<vr-router>');
  });
});
```

- [x] **Step 2: Run the test to verify it fails**

Run:

```bash
pnpm --filter @vanrot/vanrot-site test -- tests/site-pages.test.ts
```

Expected: FAIL because the route and layout files do not exist.

- [x] **Step 3: Create the app entry**

Create `apps/vanrot-site/src/main.ts`:

```ts
import { mount } from '@vanrot/runtime';
import { provideRouter } from '@vanrot/router';
import { AppLayout } from './app/app.layout.ts';
import { route as siteRoute } from './routes.ts';
import './styles/site.css';
import './styles/vanrot-tokens.css';
import './styles/vanrotstyles.css';

const target = document.getElementById('app');

if (target === null) {
  throw new Error('Missing #app mount target.');
}

provideRouter(siteRoute);
mount(AppLayout, target);
```

Copy the current UI assets into the site:

```bash
mkdir -p apps/vanrot-site/src/styles
cp packages/ui/src/tokens/vanrot-tokens.css apps/vanrot-site/src/styles/vanrot-tokens.css
cp packages/ui/src/styles/vanrotstyles.css apps/vanrot-site/src/styles/vanrotstyles.css
```

- [x] **Step 4: Create route definitions**

Create `apps/vanrot-site/src/routes.ts`:

```ts
import { createRoutes, defineRoutes } from '@vanrot/router';
import { AppLayout } from './app/app.layout.ts';
import { DocsLayout } from './layouts/docs/docs.layout.ts';
import { ComponentArticlePage } from './pages/components/component-article.page.ts';
import { DocsArticlePage } from './pages/docs/docs-article.page.ts';
import { HomePage } from './pages/home/home.page.ts';
import { ReferencePage } from './pages/reference/reference.page.ts';

const routes = createRoutes();

const home = routes.page({
  path: '/',
  label: 'Vanrot',
  page: HomePage,
  nav: routes.nav.primary(),
  breadcrumb: routes.breadcrumb.root(),
});

const docs = routes.layout({
  path: '/docs',
  label: 'Docs',
  layout: DocsLayout,
  nav: routes.nav.primary(),
  breadcrumb: routes.breadcrumb.root(),
});

const docsIntroduction = docs.page({
  path: '',
  label: 'Introduction',
  page: DocsArticlePage,
  nav: routes.nav.hidden(),
  breadcrumb: routes.breadcrumb.parent(docs),
});

const docsInstallation = docs.page({ path: 'installation', label: 'Installation', page: DocsArticlePage, breadcrumb: routes.breadcrumb.parent(docs) });
const docsProjectStructure = docs.page({ path: 'project-structure', label: 'Project Structure', page: DocsArticlePage, breadcrumb: routes.breadcrumb.parent(docs) });
const docsRuntime = docs.page({ path: 'runtime', label: 'Runtime', page: DocsArticlePage, breadcrumb: routes.breadcrumb.parent(docs) });
const docsCompiler = docs.page({ path: 'compiler', label: 'Compiler', page: DocsArticlePage, breadcrumb: routes.breadcrumb.parent(docs) });
const docsVitePlugin = docs.page({ path: 'vite-plugin', label: 'Vite Plugin', page: DocsArticlePage, breadcrumb: routes.breadcrumb.parent(docs) });
const docsCli = docs.page({ path: 'cli', label: 'CLI', page: DocsArticlePage, breadcrumb: routes.breadcrumb.parent(docs) });
const docsConfiguration = docs.page({ path: 'configuration', label: 'Configuration', page: DocsArticlePage, breadcrumb: routes.breadcrumb.parent(docs) });
const docsRouting = docs.page({ path: 'routing', label: 'Routing', page: DocsArticlePage, breadcrumb: routes.breadcrumb.parent(docs) });
const docsUi = docs.page({ path: 'ui', label: 'UI October', page: DocsArticlePage, breadcrumb: routes.breadcrumb.parent(docs) });
const docsTheming = docs.page({ path: 'theming', label: 'Theming', page: DocsArticlePage, breadcrumb: routes.breadcrumb.parent(docs) });
const docsVanrotstyles = docs.page({ path: 'vanrotstyles', label: 'vanrotstyles', page: DocsArticlePage, breadcrumb: routes.breadcrumb.parent(docs) });
const docsTesting = docs.page({ path: 'testing', label: 'Testing', page: DocsArticlePage, breadcrumb: routes.breadcrumb.parent(docs) });
const docsExamples = docs.page({ path: 'examples', label: 'Examples', page: DocsArticlePage, breadcrumb: routes.breadcrumb.parent(docs) });
const docsConventions = docs.page({ path: 'conventions', label: 'Conventions', page: DocsArticlePage, breadcrumb: routes.breadcrumb.parent(docs) });

const reference = routes.page({
  path: '/reference',
  label: 'Reference',
  page: ReferencePage,
  nav: routes.nav.primary(),
  breadcrumb: routes.breadcrumb.root(),
});

const uiButton = docs.page({ path: 'ui/button', label: 'Button', page: ComponentArticlePage, breadcrumb: routes.breadcrumb.parent(docs) });
const uiCard = docs.page({ path: 'ui/card', label: 'Card', page: ComponentArticlePage, breadcrumb: routes.breadcrumb.parent(docs) });
const uiBadge = docs.page({ path: 'ui/badge', label: 'Badge', page: ComponentArticlePage, breadcrumb: routes.breadcrumb.parent(docs) });
const uiAvatar = docs.page({ path: 'ui/avatar', label: 'Avatar', page: ComponentArticlePage, breadcrumb: routes.breadcrumb.parent(docs) });
const uiAlert = docs.page({ path: 'ui/alert', label: 'Alert', page: ComponentArticlePage, breadcrumb: routes.breadcrumb.parent(docs) });
const uiLoader = docs.page({ path: 'ui/loader', label: 'Loader', page: ComponentArticlePage, breadcrumb: routes.breadcrumb.parent(docs) });
const uiSkeleton = docs.page({ path: 'ui/skeleton', label: 'Skeleton', page: ComponentArticlePage, breadcrumb: routes.breadcrumb.parent(docs) });
const uiSeparator = docs.page({ path: 'ui/separator', label: 'Separator', page: ComponentArticlePage, breadcrumb: routes.breadcrumb.parent(docs) });

export const route = defineRoutes({
  home,
  docs,
  docsIntroduction,
  docsInstallation,
  docsProjectStructure,
  docsRuntime,
  docsCompiler,
  docsVitePlugin,
  docsCli,
  docsConfiguration,
  docsRouting,
  docsUi,
  docsTheming,
  docsVanrotstyles,
  docsTesting,
  docsExamples,
  docsConventions,
  reference,
  uiButton,
  uiCard,
  uiBadge,
  uiAvatar,
  uiAlert,
  uiLoader,
  uiSkeleton,
  uiSeparator,
});
```

If line length becomes hard to read during implementation, split the repeated `docs.page(...)` calls into a helper that still reads labels and paths from docs data.

- [x] **Step 5: Create the app and docs layouts**

Create `apps/vanrot-site/src/app/app.layout.ts`:

```ts
import { route as siteRoute } from '../routes.ts';

export class AppLayout {
  route = siteRoute;
}
```

Create `apps/vanrot-site/src/app/app.layout.html`:

```html
<div class="site-shell">
  <header class="site-header">
    <a class="site-brand" href="/">Vanrot</a>
    <nav class="site-top-nav" aria-label="Primary">
      <vr route.docs />
      <vr route.reference />
    </nav>
  </header>

  <vr-router></vr-router>
</div>
```

Create `apps/vanrot-site/src/app/app.layout.css`:

```css
.site-shell {
  min-height: 100vh;
}

.site-header {
  position: sticky;
  top: 0;
  z-index: var(--vr-z-sticky);
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 56px;
  padding: 0 24px;
  border-bottom: 1px solid var(--vr-border-subtle);
  background: color-mix(in srgb, var(--vr-color-canvas) 92%, transparent);
  backdrop-filter: blur(16px);
}

.site-brand {
  color: var(--vr-color-text);
  font-weight: 650;
  text-decoration: none;
}

.site-top-nav {
  display: flex;
  gap: 16px;
}
```

Create `apps/vanrot-site/src/layouts/docs/docs.layout.ts`:

```ts
import { siteNavigationGroups } from '../../docs/site-navigation.ts';

export class DocsLayout {
  groups = siteNavigationGroups;
}
```

Create `apps/vanrot-site/src/layouts/docs/docs.layout.html`:

```html
<div class="docs-layout">
  <aside class="docs-sidebar" aria-label="Documentation">
    @for (group of groups; track group.section) {
      <section class="docs-nav-group">
        <h2>{{ group.label }}</h2>
        @for (item of group.items; track item.key) {
          <a [href]="item.href">{{ item.label }}</a>
        }
      </section>
    }
  </aside>

  <main class="docs-main">
    <vr-outlet></vr-outlet>
  </main>
</div>
```

Create `apps/vanrot-site/src/layouts/docs/docs.layout.css`:

```css
.docs-layout {
  display: grid;
  grid-template-columns: minmax(220px, 280px) minmax(0, 1fr);
  gap: 32px;
  width: min(1280px, calc(100vw - 48px));
  margin: 0 auto;
  padding: 32px 0 72px;
}

.docs-sidebar {
  position: sticky;
  top: 80px;
  align-self: start;
  display: grid;
  gap: 22px;
  max-height: calc(100vh - 104px);
  overflow: auto;
  padding-right: 16px;
}

.docs-nav-group {
  display: grid;
  gap: 8px;
}

.docs-nav-group h2 {
  margin: 0;
  color: var(--vr-color-muted);
  font-size: 12px;
  font-weight: 650;
  text-transform: uppercase;
}

.docs-nav-group a {
  color: var(--vr-color-text-soft);
  font-size: 14px;
  text-decoration: none;
}

.docs-nav-group a:hover {
  color: var(--vr-color-text);
}

.docs-main {
  min-width: 0;
}

@media (max-width: 860px) {
  .docs-layout {
    grid-template-columns: 1fr;
  }

  .docs-sidebar {
    position: static;
    max-height: none;
  }
}
```

- [x] **Step 6: Run page source tests**

Run:

```bash
pnpm --filter @vanrot/vanrot-site test -- tests/site-pages.test.ts
```

Expected: PASS.

---

## Task 5: Implement Landing, Framework Docs, Component Docs, Reference, And Site CSS

**Files:**

- Create: `apps/vanrot-site/src/pages/home/home.page.ts/html/css`
- Create: `apps/vanrot-site/src/pages/docs/docs-article.page.ts/html/css`
- Create: `apps/vanrot-site/src/pages/components/component-gallery.page.ts/html/css`
- Create: `apps/vanrot-site/src/pages/components/component-article.page.ts/html/css`
- Create: `apps/vanrot-site/src/pages/reference/reference.page.ts/html/css`
- Create: `apps/vanrot-site/src/styles/site.css`

- [x] **Step 1: Create the landing page**

Create `apps/vanrot-site/src/pages/home/home.page.ts`:

```ts
import { componentDocs } from '../../docs/component-docs.ts';
import { packageReferenceDocs } from '../../docs/site-data.ts';

const homeCopy = {
  title: 'Vanrot',
  summary: 'A small frontend framework with signals, compiler role files, typed routes, source-owned UI, and documentation that grows with the framework.',
  primaryCta: 'Read the docs',
  secondaryCta: 'View components',
} as const;

export class HomePage {
  copy = homeCopy;
  components = componentDocs.slice(0, 4);
  packages = packageReferenceDocs;
}
```

Create `apps/vanrot-site/src/pages/home/home.page.html`:

```html
<main class="home-page">
  <section class="home-hero">
    <vr-badge variant="secondary">October docs</vr-badge>
    <h1>{{ copy.title }}</h1>
    <p>{{ copy.summary }}</p>
    <div class="home-actions">
      <vr-button variant="default" type="button">
        <a href="/docs">{{ copy.primaryCta }}</a>
      </vr-button>
      <vr-button variant="outline" type="button">
        <a href="/docs/ui/button">{{ copy.secondaryCta }}</a>
      </vr-button>
    </div>
  </section>

  <section class="home-grid" aria-label="Framework packages">
    @for (item of packages; track item.name) {
      <vr-card variant="default">
        <h2>{{ item.name }}</h2>
        <p>{{ item.area }}</p>
        <vr-badge variant="outline">{{ item.status }}</vr-badge>
      </vr-card>
    }
  </section>
</main>
```

Create `apps/vanrot-site/src/pages/home/home.page.css`:

```css
.home-page {
  width: min(1180px, calc(100vw - 48px));
  margin: 0 auto;
  padding: 72px 0;
}

.home-hero {
  display: grid;
  gap: 18px;
  max-width: 760px;
}

.home-hero h1 {
  margin: 0;
  font-size: 64px;
  line-height: 0.95;
}

.home-hero p {
  margin: 0;
  color: var(--vr-color-text-soft);
  font-size: 18px;
  line-height: 1.7;
}

.home-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.home-actions a {
  color: inherit;
  text-decoration: none;
}

.home-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
  margin-top: 56px;
}
```

- [x] **Step 2: Create the generic framework docs page**

Create `apps/vanrot-site/src/pages/docs/docs-article.page.ts`:

```ts
import { getCurrentMatch } from '@vanrot/router';
import {
  getSiteArticle,
  siteArticleKey,
  siteArticles,
  type SiteArticle,
} from '../../docs/site-data.ts';

const routeKeyToArticleKey = {
  docsIntroduction: siteArticleKey.introduction,
  docsInstallation: siteArticleKey.installation,
  docsProjectStructure: siteArticleKey.projectStructure,
  docsRuntime: siteArticleKey.runtime,
  docsCompiler: siteArticleKey.compiler,
  docsVitePlugin: siteArticleKey.vitePlugin,
  docsCli: siteArticleKey.cli,
  docsConfiguration: siteArticleKey.configuration,
  docsRouting: siteArticleKey.routing,
  docsUi: siteArticleKey.uiOctober,
  docsTheming: siteArticleKey.theming,
  docsVanrotstyles: siteArticleKey.vanrotstyles,
  docsTesting: siteArticleKey.testing,
  docsExamples: siteArticleKey.examples,
  docsConventions: siteArticleKey.conventions,
} as const;

type ArticleRouteKey = keyof typeof routeKeyToArticleKey;

export class DocsArticlePage {
  article(): SiteArticle {
    const routeKey = getCurrentMatch()?.route.key;

    if (isArticleRouteKey(routeKey)) {
      return getSiteArticle(routeKeyToArticleKey[routeKey]);
    }

    return siteArticles.introduction;
  }
}

function isArticleRouteKey(value: string | undefined): value is ArticleRouteKey {
  return value !== undefined && value in routeKeyToArticleKey;
}
```

Create `apps/vanrot-site/src/pages/docs/docs-article.page.html`:

```html
<article class="docs-article">
  <vr-badge variant="secondary">{{ article().status }}</vr-badge>
  <h1>{{ article().title }}</h1>
  <p class="docs-summary">{{ article().summary }}</p>

  <vr-separator variant="horizontal"></vr-separator>

  @for (section of article().sections; track section.id) {
    <section class="docs-section" id="{{ section.id }}">
      <h2>{{ section.title }}</h2>
      <p>{{ section.body }}</p>
    </section>
  }
</article>
```

Create `apps/vanrot-site/src/pages/docs/docs-article.page.css`:

```css
.docs-article {
  display: grid;
  gap: 18px;
  max-width: 780px;
}

.docs-article h1 {
  margin: 0;
  font-size: 44px;
  line-height: 1.05;
}

.docs-summary,
.docs-section p {
  color: var(--vr-color-text-soft);
  line-height: 1.75;
}

.docs-section {
  display: grid;
  gap: 8px;
}

.docs-section h2 {
  margin: 0;
  font-size: 24px;
}
```

- [x] **Step 3: Create the component docs page**

Create `apps/vanrot-site/src/pages/components/component-article.page.ts`:

```ts
import { getCurrentMatch } from '@vanrot/router';
import { componentDocs, type ComponentDoc } from '../../docs/component-docs.ts';

const routeKeyToPrimitive = {
  uiButton: 'button',
  uiCard: 'card',
  uiBadge: 'badge',
  uiAvatar: 'avatar',
  uiAlert: 'alert',
  uiLoader: 'loader',
  uiSkeleton: 'skeleton',
  uiSeparator: 'separator',
} as const;

type ComponentRouteKey = keyof typeof routeKeyToPrimitive;

export class ComponentArticlePage {
  doc(): ComponentDoc {
    const routeKey = getCurrentMatch()?.route.key;
    const primitive = isComponentRouteKey(routeKey) ? routeKeyToPrimitive[routeKey] : 'button';

    return componentDocs.find((doc) => doc.primitive === primitive) ?? componentDocs[0];
  }
}

function isComponentRouteKey(value: string | undefined): value is ComponentRouteKey {
  return value !== undefined && value in routeKeyToPrimitive;
}
```

Create `apps/vanrot-site/src/pages/components/component-article.page.html`:

```html
<article class="component-article">
  <vr-badge variant="secondary">UI primitive</vr-badge>
  <h1>{{ doc().title }}</h1>
  <p class="component-summary">{{ doc().summary }}</p>

  <section class="component-preview">
    <h2>Preview</h2>
    <vr-card variant="default">
      @if (doc().primitive === 'button') {
        <vr-button variant="default" type="button">Button</vr-button>
      }
      @if (doc().primitive === 'card') {
        <vr-card variant="muted">Card surface</vr-card>
      }
      @if (doc().primitive === 'badge') {
        <vr-badge variant="success">Ready</vr-badge>
      }
      @if (doc().primitive === 'avatar') {
        <vr-avatar variant="soft">VR</vr-avatar>
      }
      @if (doc().primitive === 'alert') {
        <vr-alert variant="info">Project ready.</vr-alert>
      }
      @if (doc().primitive === 'loader') {
        <vr-loader variant="spinner" aria-label="Loading"></vr-loader>
      }
      @if (doc().primitive === 'skeleton') {
        <vr-skeleton variant="text"></vr-skeleton>
      }
      @if (doc().primitive === 'separator') {
        <vr-separator variant="horizontal"></vr-separator>
      }
    </vr-card>
  </section>

  <section class="component-section">
    <h2>Usage</h2>
    <pre><code>{{ doc().usage }}</code></pre>
  </section>

  <section class="component-section">
    <h2>Accessibility</h2>
    <p>{{ doc().accessibility }}</p>
  </section>

  <section class="component-section">
    <h2>API</h2>
    <p>{{ doc().api }}</p>
  </section>
</article>
```

Create `apps/vanrot-site/src/pages/components/component-article.page.css`:

```css
.component-article {
  display: grid;
  gap: 18px;
  max-width: 820px;
}

.component-article h1 {
  margin: 0;
  font-size: 44px;
  line-height: 1.05;
}

.component-summary,
.component-section p {
  color: var(--vr-color-text-soft);
  line-height: 1.75;
}

.component-preview,
.component-section {
  display: grid;
  gap: 12px;
}

.component-section pre {
  overflow: auto;
  margin: 0;
  padding: 16px;
  border: 1px solid var(--vr-border-subtle);
  border-radius: var(--vr-radius-md);
  background: var(--vr-surface-muted);
}
```

- [x] **Step 4: Create the reference page**

Create `apps/vanrot-site/src/pages/reference/reference.page.ts`:

```ts
import {
  commandReference,
  diagnosticReference,
  packageReference,
} from '../../docs/site-reference.ts';

const referenceCopy = {
  title: 'Reference',
  summary: 'Commands, packages, diagnostics, and current maturity status for the implemented Vanrot framework surface.',
} as const;

export class ReferencePage {
  copy = referenceCopy;
  commands = commandReference;
  packages = packageReference;
  diagnostics = diagnosticReference;
}
```

Create `apps/vanrot-site/src/pages/reference/reference.page.html`:

```html
<article class="reference-page">
  <h1>{{ copy.title }}</h1>
  <p>{{ copy.summary }}</p>

  <section class="reference-section">
    <h2>Commands</h2>
    @for (command of commands; track command.name) {
      <vr-card variant="default">
        <h3>{{ command.name }}</h3>
        <code>{{ command.usage }}</code>
        <vr-badge variant="outline">{{ command.status }}</vr-badge>
      </vr-card>
    }
  </section>

  <section class="reference-section">
    <h2>Packages</h2>
    @for (item of packages; track item.name) {
      <vr-card variant="default">
        <h3>{{ item.name }}</h3>
        <p>{{ item.area }}</p>
        <vr-badge variant="outline">{{ item.status }}</vr-badge>
      </vr-card>
    }
  </section>

  <section class="reference-section">
    <h2>Diagnostics</h2>
    <vr-card variant="muted">
      <p>Compiler: {{ diagnostics.compiler.length }}</p>
      <p>Config: {{ diagnostics.config.length }}</p>
      <p>Router: {{ diagnostics.router.length }}</p>
    </vr-card>
  </section>
</article>
```

Create `apps/vanrot-site/src/pages/reference/reference.page.css`:

```css
.reference-page {
  display: grid;
  gap: 24px;
  max-width: 860px;
  margin: 0 auto;
  padding: 32px 0 72px;
}

.reference-page h1 {
  margin: 0;
  font-size: 44px;
}

.reference-page > p {
  color: var(--vr-color-text-soft);
  line-height: 1.75;
}

.reference-section {
  display: grid;
  gap: 12px;
}
```

- [x] **Step 5: Create temporary site CSS**

Create `apps/vanrot-site/src/styles/site.css`:

```css
:root {
  color-scheme: dark;
  background: var(--vr-color-canvas);
  color: var(--vr-color-text);
  font-family: var(--vr-font-sans);
  font-feature-settings: var(--vr-font-feature-text);
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--vr-color-brand) 8%, transparent), transparent 360px),
    var(--vr-color-canvas);
}

a {
  color: var(--vr-color-brand);
}

code,
pre {
  font-family: var(--vr-font-number);
  font-variant-numeric: tabular-nums lining-nums;
}
```

- [x] **Step 6: Run site tests and typecheck**

Run:

```bash
pnpm --filter @vanrot/vanrot-site test
pnpm --filter @vanrot/vanrot-site typecheck
```

Expected: PASS.

---

## Task 6: Add Docs Drift Guard

**Files:**

- Create: `scripts/verify-site-docs.mjs`
- Create: `scripts/verify-site-docs.test.mjs`
- Modify: `package.json`

- [x] **Step 1: Write failing guard tests**

Create `scripts/verify-site-docs.test.mjs`:

```js
import { describe, expect, it } from 'vitest';
import {
  checkCommandCoverage,
  checkDiagnosticCoverage,
  checkPackageCoverage,
  checkPrimitiveCoverage,
  checkRequiredArticleCoverage,
} from './verify-site-docs.mjs';

describe('site docs verification', () => {
  it('fails when a required framework article is missing', () => {
    const failures = checkRequiredArticleCoverage(
      ['runtime', 'compiler'],
      [{ key: 'runtime', path: '/docs/runtime' }],
    );

    expect(failures).toEqual(['Missing framework docs article: compiler']);
  });

  it('fails when a primitive has no docs page', () => {
    const failures = checkPrimitiveCoverage(
      ['button', 'card'],
      [{ primitive: 'button', href: '/docs/ui/button', usage: '<vr-button></vr-button>', accessibility: 'Native button.', api: 'Selector vr-button.' }],
    );

    expect(failures).toEqual(['Missing UI primitive docs page: card']);
  });

  it('fails when a command is missing from reference docs', () => {
    const failures = checkCommandCoverage(
      ['create', 'dev'],
      [{ name: 'create', usage: 'vr create <name>' }],
    );

    expect(failures).toEqual(['Missing CLI command docs entry: dev']);
  });

  it('fails when a package is missing from reference docs', () => {
    const failures = checkPackageCoverage(
      ['@vanrot/runtime', '@vanrot/router'],
      [{ name: '@vanrot/runtime' }],
    );

    expect(failures).toEqual(['Missing package reference docs entry: @vanrot/router']);
  });

  it('fails when a diagnostic code is missing from reference docs', () => {
    const failures = checkDiagnosticCoverage(['VR001', 'VR019'], ['VR001'], 'compiler');

    expect(failures).toEqual(['Missing compiler diagnostic docs entry: VR019']);
  });
});
```

- [x] **Step 2: Run guard tests to verify they fail**

Run:

```bash
pnpm test:phase-docs
```

Expected: FAIL because `scripts/verify-site-docs.mjs` does not exist and the root script does not include the new test.

- [x] **Step 3: Create the guard implementation**

Create `scripts/verify-site-docs.mjs`:

```js
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const siteDataPath = join(projectRoot, 'apps/vanrot-site/src/docs/site-data.json');

export function checkRequiredArticleCoverage(requiredKeys, articles) {
  const available = new Set(articles.map((article) => article.key));
  return requiredKeys
    .filter((key) => !available.has(key))
    .map((key) => `Missing framework docs article: ${key}`);
}

export function checkPrimitiveCoverage(requiredPrimitives, componentDocs) {
  const available = new Set(componentDocs.map((doc) => doc.primitive));
  const failures = [];

  for (const primitive of requiredPrimitives) {
    const doc = componentDocs.find((candidate) => candidate.primitive === primitive);

    if (doc === undefined) {
      failures.push(`Missing UI primitive docs page: ${primitive}`);
      continue;
    }

    if (doc.usage === '') {
      failures.push(`Missing UI primitive usage example: ${primitive}`);
    }

    if (doc.accessibility === '') {
      failures.push(`Missing UI primitive accessibility notes: ${primitive}`);
    }

    if (doc.api === '') {
      failures.push(`Missing UI primitive API notes: ${primitive}`);
    }
  }

  return failures;
}

export function checkCommandCoverage(requiredCommands, commandDocs) {
  const available = new Set(commandDocs.map((command) => command.name));
  return requiredCommands
    .filter((command) => !available.has(command))
    .map((command) => `Missing CLI command docs entry: ${command}`);
}

export function checkPackageCoverage(requiredPackages, packageDocs) {
  const available = new Set(packageDocs.map((item) => item.name));
  return requiredPackages
    .filter((packageName) => !available.has(packageName))
    .map((packageName) => `Missing package reference docs entry: ${packageName}`);
}

export function checkDiagnosticCoverage(requiredCodes, documentedCodes, label) {
  const available = new Set(documentedCodes);
  return requiredCodes
    .filter((code) => !available.has(code))
    .map((code) => `Missing ${label} diagnostic docs entry: ${code}`);
}

async function readSiteData() {
  return JSON.parse(await readFile(siteDataPath, 'utf8'));
}

async function readUiMetadata() {
  const indexPath = join(projectRoot, 'packages/ui/dist/index.js');

  if (!existsSync(indexPath)) {
    throw new Error('packages/ui/dist/index.js is missing. Run pnpm build before pnpm verify:site-docs.');
  }

  return import(pathToFileURL(indexPath).href);
}

async function readCliMetadata() {
  const metadataPath = join(projectRoot, 'packages/cli/dist/commands/metadata.js');

  if (!existsSync(metadataPath)) {
    throw new Error('packages/cli/dist/commands/metadata.js is missing. Run pnpm build before pnpm verify:site-docs.');
  }

  return import(pathToFileURL(metadataPath).href);
}

async function verifySiteDocs() {
  const siteData = await readSiteData();
  const ui = await readUiMetadata();
  const cli = await readCliMetadata();
  const articles = siteData.articles ?? [];
  const primitiveDocs = siteData.primitiveDocs ?? [];
  const commandDocs = siteData.commands ?? [];
  const packageDocs = siteData.packages ?? [];
  const diagnostics = siteData.diagnostics ?? {};
  const requiredArticleKeys = [
    'introduction',
    'installation',
    'projectStructure',
    'runtime',
    'compiler',
    'vitePlugin',
    'cli',
    'configuration',
    'routing',
    'uiOctober',
    'theming',
    'vanrotstyles',
    'testing',
    'examples',
    'conventions',
    'referenceStatus',
  ];
  const requiredPackages = [
    '@vanrot/runtime',
    '@vanrot/compiler',
    '@vanrot/config',
    '@vanrot/router',
    '@vanrot/vite-plugin',
    '@vanrot/cli',
    '@vanrot/ui',
    '@vanrot/testing',
  ];
  const failures = [
    ...checkRequiredArticleCoverage(requiredArticleKeys, articles),
    ...checkPrimitiveCoverage(ui.uiPrimitiveOrder, primitiveDocs),
    ...checkCommandCoverage(cli.cliCommands.map((command) => command.name), commandDocs),
    ...checkPackageCoverage(requiredPackages, packageDocs),
    ...checkDiagnosticCoverage(['VR001', 'VR019'], diagnostics.compiler ?? [], 'compiler'),
    ...checkDiagnosticCoverage(['VRCFG001', 'VRCFG008'], diagnostics.config ?? [], 'config'),
    ...checkDiagnosticCoverage(['VR_CHILD_BEFORE_PARENT'], diagnostics.router ?? [], 'router'),
  ];

  if (failures.length > 0) {
    throw new Error(failures.join('\n'));
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  verifySiteDocs()
    .then(() => {
      console.log('Site documentation verification passed.');
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    });
}
```

The first implementation deliberately keeps command and package docs in the guard until a shared docs metadata export exists. A later phase can move those arrays into package-owned metadata.

- [x] **Step 4: Update root scripts**

Modify the root `package.json` scripts:

```json
{
  "scripts": {
    "build": "pnpm -r --if-present run build",
    "typecheck": "pnpm -r --if-present run typecheck",
    "test": "pnpm -r --if-present run test && pnpm test:phase-docs",
    "test:phase-docs": "vitest run scripts/verify-phase-docs.test.mjs scripts/verify-site-docs.test.mjs",
    "audit:core": "vitest run --config vitest.audit.config.ts",
    "lint": "pnpm -r --if-present run lint",
    "clean": "pnpm -r --if-present run clean",
    "verify:phase-docs": "node scripts/verify-phase-docs.mjs",
    "verify:site-docs": "node scripts/verify-site-docs.mjs",
    "verify:size": "pnpm --filter @vanrot/runtime size",
    "verify": "pnpm typecheck && pnpm test && pnpm build && pnpm verify:size && pnpm verify:site-docs && pnpm verify:phase-docs"
  }
}
```

- [x] **Step 5: Run guard tests and guard**

Run:

```bash
pnpm test:phase-docs
pnpm build
pnpm verify:site-docs
```

Expected: PASS.

---

## Task 7: Build And Browser Verify The Site

**Files:**

- No new files unless visual verification finds a defect.

- [x] **Step 1: Typecheck, test, and build the site**

Run:

```bash
pnpm --filter @vanrot/vanrot-site typecheck
pnpm --filter @vanrot/vanrot-site test
pnpm --filter @vanrot/vanrot-site build
```

Expected: PASS.

- [x] **Step 2: Start the local site**

Run:

```bash
pnpm --filter @vanrot/vanrot-site dev
```

Expected: the dev server starts on the configured Vanrot/Vite port. If port `1010` is occupied, use the next available port printed by Vite.

- [x] **Step 3: Open the browser and inspect key pages**

Use the Browser plugin to open the local site. Check:

- `/`
- `/docs`
- `/docs/routing`
- `/docs/ui/button`
- `/reference`

Expected:

- top nav is visible;
- docs sidebar is visible on desktop;
- content is not blank;
- Phase 16B primitives render as native lowered UI;
- mobile viewport has no incoherent overlap;
- code blocks do not overflow the viewport;
- page copy is readable and dark-first.

- [x] **Step 4: Capture visual evidence**

Use Browser screenshots for desktop and mobile widths.

Expected: screenshots show the shadcn-style docs rhythm: top nav, left docs navigation, central content, component preview/code/API sections, and reference cards.

---

## Task 8: Complete Phase 16C Documentation State

**Files:**

- Modify: `docs/superpowers/feature-maturity.md`
- Modify: `docs/superpowers/final-tdd-inventory.md`
- Modify: `docs/vanrot-presentation.html`
- Modify: `docs/superpowers/plans/Phase-16C.md`

- [x] **Step 1: Update feature maturity**

Update `docs/superpowers/feature-maturity.md` after implementation and verification:

- Keep the top-level Phase 16 checkbox unchecked.
- Mark Phase 16C site rows as no longer only planned.
- Keep Phase 16D as the next active UI primitive slice.
- Keep Phase 24 as final docs audit and public web presence hardening.

Expected wording:

```text
Phase 16C creates apps/vanrot-site as the dogfooded Vanrot learning site base with current framework docs, command/reference data, a preview-first Phase 16B primitive gallery, Phase 16B component docs, and verify:site-docs drift checks.
```

- [x] **Step 2: Update final TDD inventory**

Add Phase 16C rows to `docs/superpowers/final-tdd-inventory.md`:

```markdown
| docs and web | `apps/vanrot-site` workspace app | Demo-Capable through Phase 16C | Site builds as a Vanrot app with router, pages, October tokens, vanrotstyles, the Phase 16B primitive gallery, and Phase 16B primitives. | Phase 16C, Phase 24 | Phase 24 remains the exhaustive final docs audit. |
| docs and web | site docs data registry | Demo-Capable through Phase 16C | Registry covers implemented framework docs, commands, package references, diagnostics, conventions, examples, UI primitives, and maturity status. | Phase 16C, Phase 24 | Future package metadata can replace temporary site-owned data. |
| docs and web | `verify:site-docs` | Demo-Capable through Phase 16C | Guard catches missing framework docs, primitive docs, command docs, package references, diagnostic paths, and maturity reference coverage. | Phase 16C, Phase 24 | Runs inside root `pnpm verify` after build. |
```

- [x] **Step 3: Update presentation**

Modify `docs/vanrot-presentation.html`:

- Keep Phase 16 active.
- Update the status line to say Phase 16C is done and Phase 16D is active.
- Add a short note that `apps/vanrot-site` exists and documents the implemented framework surface.

Expected status line:

```html
<span style="color:var(--green);">Done: production phases 11-15 plus 16A-16C slices</span>
<span style="color:var(--cyan);">Active: Phase 16D layout, navigation, and media primitives</span>
```

- [x] **Step 4: Tick this plan**

After every task passes, change completed checkboxes in this file from `- [ ]` to `- [x]`.

Keep unchecked tasks only if execution intentionally stops before Phase 16C completion.

- [x] **Step 5: Run phase docs verification**

Run:

```bash
pnpm verify:phase-docs
```

Expected: PASS.

---

## Task 9: Final Verification

**Files:**

- No new files unless a failing check identifies a defect.

- [x] **Step 1: Run focused checks**

Run:

```bash
pnpm --filter @vanrot/ui test -- tests/metadata.test.ts
pnpm --filter @vanrot/vanrot-site test
pnpm --filter @vanrot/vanrot-site typecheck
pnpm --filter @vanrot/vanrot-site build
pnpm test:phase-docs
pnpm build
pnpm verify:site-docs
pnpm verify:phase-docs
```

Expected: PASS.

- [x] **Step 2: Run root verification**

Run:

```bash
pnpm verify
```

Expected: PASS, including typecheck, tests, build, runtime size budget, `verify:site-docs`, and `verify:phase-docs`.

- [x] **Step 3: Check whitespace**

Run:

```bash
git diff --check
```

Expected: no output.

- [x] **Step 4: Check final status**

Run:

```bash
git status --short --branch
```

Expected: Phase 16C source, tests, scripts, docs, presentation, lockfile, and plan updates are visible. Do not run `git add`, `git commit`, or `git push`.

---

## Self-Review

- [x] **Spec coverage:** Phase 16C app, framework-wide docs, existing Phase 1-15 coverage, Phase 16A/16B coverage, component pages, source data, docs drift guard, temporary CSS, build, browser verification, and Phase 24 final-audit separation are covered by tasks above.
- [x] **Placeholder scan:** Search this file for placeholder words before execution.

Run:

```bash
node -e "const fs=require('fs');const text=fs.readFileSync('docs/superpowers/plans/Phase-16C.md','utf8');const terms=['TB'+'D','TO'+'DO','implement '+'later','fill '+'in','appropr'+'iate','similar '+'to','the '+'above'];const hits=terms.filter((term)=>text.includes(term));if(hits.length){console.error(hits.join('\\n'));process.exit(1);}"
```

Expected: no output.

- [x] **Type consistency:** `SiteArticleKey`, `SiteSectionKey`, `ComponentDoc`, `siteNavigationGroups`, `componentDocs`, `commandReference`, `packageReference`, and `diagnosticReference` are introduced before they are used by pages.

---

## Execution Handoff

Plan execution should use inline `superpowers:executing-plans 16c`.

Do not use subagent-driven development for this repository.
