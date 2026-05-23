# Phase 16A UI October Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking. This repository forbids subagent-driven Superpowers workflows and user-owned git means every task ends with a review checkpoint, not an automatic commit.

**Goal:** Establish the production foundation for UI October: package metadata, package inventory docs, dark/light tokens, `vanrotstyles.css`, typed UI config modes, starter-app wiring, and updated compiler diagnostics.

**Architecture:** Keep `@vanrot/ui` as the owner of UI assets, package inventory, component registry metadata, and style asset paths. Keep `@vanrot/config` as the owner of `vanrot.config.ts` schema and normalized UI style choices. Wire the CLI to copy or import the package-owned CSS assets without making Tailwind or `vanrotstyles` mandatory for every app.

**Tech Stack:** TypeScript, Vitest, Node file assets, CSS custom properties, Vanrot CLI template generation, `@vanrot/config` normalization and validation, existing compiler-lowered `<vr-button>`.

---

## Scope Check

Phase 16 is the full UI ecosystem. That is too broad for one executable plan.

This plan implements **Phase 16A: October Foundation** only:

- October naming and metadata
- package inventory and guidelines
- token architecture for dark and light themes
- typography tokens for Geist and JetBrains Mono numerics
- `vanrotstyles.css`
- `vanrot.config.ts` UI style modes
- starter-app and `vr add button` wiring for style assets
- compiler diagnostic wording and UI tag source-of-truth cleanup
- docs completion updates after verification

Phase 16B through Phase 16E own the broader component catalog, layout/data components, overlays, app shell, visual QA pages, and deeper accessibility primitives.

## Preconditions

Required existing surface:

- `@vanrot/ui` exists and exports `defaultUiPrefix`, `uiAppFile`, `uiAssetUrl`, `uiPrimitive`, and `uiPrimitiveType`.
- `packages/ui/src/tokens/vanrot-tokens.css` is copied into starter apps.
- `vr add button` copies `src/ui/button/ui.button.ts/html/css` into user apps.
- The compiler already lowers `<vr-button>` to a native `<button>`.
- `@vanrot/config` loads and normalizes `vanrot.config.ts`.
- `docs/superpowers/specs/Phase-16.md` contains the approved October and `vanrotstyles` architecture.

## File Structure

- `packages/ui/src/metadata.ts`: expand the UI source of truth with October flavor metadata, style asset paths, package inventory URLs, and component catalog metadata.
- `packages/ui/src/index.ts`: export the new metadata and public types.
- `packages/ui/src/tokens/vanrot-tokens.css`: replace the Phase 9 starter token layer with October dark/light, typography, spacing, surface, radius, shadow, z-index, and motion tokens.
- `packages/ui/src/styles/vanrotstyles.css`: new first-party utility stylesheet with unprefixed utility classes.
- `packages/ui/src/docs/package-inventory.md`: new human-readable list of what `@vanrot/ui` includes.
- `packages/ui/src/docs/guidelines.md`: new package guidelines for ownership, styling modes, theming, typography, accessibility, and Tailwind interop.
- `packages/ui/tests/metadata.test.ts`: metadata tests for October, `vanrotstyles`, app file paths, registry entries, and docs asset URLs.
- `packages/ui/tests/assets.test.ts`: asset tests for tokens, utilities, inventory docs, and guidelines.
- `packages/ui/package.json`: include `src/styles` and `src/docs` in published files.
- `packages/config/src/types.ts`: add typed UI config mode types.
- `packages/config/src/defaults.ts`: normalize UI defaults.
- `packages/config/src/diagnostics.ts`: add stable UI config diagnostic codes.
- `packages/config/src/validate.ts`: validate `ui.flavor`, `ui.styles`, and `ui.prefix`.
- `packages/config/tests/defaults.test.ts`: test normalized UI defaults and explicit values.
- `packages/config/tests/validate.test.ts`: test invalid UI config diagnostics.
- `packages/config/src/migrate.ts`: render canonical config with October UI defaults.
- `packages/cli/src/create/app-template.ts`: import `vanrotstyles.css` in new apps and write canonical UI config defaults.
- `packages/cli/src/create/starter-ui-assets.ts`: include package-owned `vanrotstyles.css` in starter apps.
- `packages/cli/tests/create.test.ts`: verify new apps include tokens, `vanrotstyles.css`, imports, and config defaults.
- `packages/cli/src/add/ui-assets.ts`: expose `readVanrotStylesCss()` and utility style import helpers from UI package assets.
- `packages/cli/src/add/add-ui.ts`: ensure `vr add button` respects config style mode while still adding component styles.
- `packages/cli/tests/add.test.ts`: verify `vr add button` default, `tailwind`, and `none` style-mode behavior.
- `packages/compiler/src/codegen/ui-elements.ts`: new compiler-local source of truth for supported compiler-lowered UI tags and unsupported-tag messaging.
- `packages/compiler/src/codegen/generate-component.ts`: use UI element constants instead of scattered UI tag literals.
- `packages/compiler/tests/codegen/generate-component.test.ts`: verify October diagnostic wording and existing `<vr-button>` lowering.
- `docs/superpowers/feature-maturity.md`: update Phase 16 wording from the older flavor language to October and mark 16A foundation rows appropriately after verification.
- `docs/superpowers/final-tdd-inventory.md`: add Phase 16A package, config, CLI, compiler, token, and style inventory entries after verification.
- `docs/vanrot-presentation.html`: update the roadmap wording to UI October after verification.

## Task 1: UI Metadata, Registry, And Package Docs

**Files:**
- Modify: `packages/ui/src/metadata.ts`
- Modify: `packages/ui/src/index.ts`
- Modify: `packages/ui/package.json`
- Create: `packages/ui/src/docs/package-inventory.md`
- Create: `packages/ui/src/docs/guidelines.md`
- Test: `packages/ui/tests/metadata.test.ts`
- Test: `packages/ui/tests/assets.test.ts`

- [x] **Step 1: Add failing metadata tests**

Modify `packages/ui/tests/metadata.test.ts` so the imports include the new metadata:

```ts
import {
  defaultUiPrefix,
  uiAppFile,
  uiAssetUrl,
  uiComponentCatalog,
  uiFlavor,
  uiPackageInventory,
  uiPrimitive,
  uiPrimitiveType,
  uiStyleMode,
} from '../src/index.js';
```

Add these tests inside the existing `describe('@vanrot/ui metadata', () => { ... })` block:

```ts
  it('exports October flavor and style mode metadata', () => {
    expect(uiFlavor.october).toBe('october');
    expect(uiStyleMode.vanrotstyles).toBe('vanrotstyles');
    expect(uiStyleMode.tailwind).toBe('tailwind');
    expect(uiStyleMode.none).toBe('none');
    expect(uiPackageInventory.name).toBe('@vanrot/ui');
    expect(uiPackageInventory.flavor).toBe(uiFlavor.october);
    expect(uiPackageInventory.stylesheet).toBe('vanrotstyles.css');
  });

  it('exports vanrotstyles app file paths', () => {
    expect(uiAppFile.vanrotstyles).toBe('src/styles/vanrotstyles.css');
    expect(uiAppFile.vanrotstylesImport).toBe("import './styles/vanrotstyles.css';");
  });

  it('exports the Phase 16A component catalog shape', () => {
    expect(uiComponentCatalog.button.selector).toBe('vr-button');
    expect(uiComponentCatalog.button.phase).toBe('16A');
    expect(uiComponentCatalog.card.selector).toBe('vr-card');
    expect(uiComponentCatalog.card.phase).toBe('16B');
    expect(uiComponentCatalog.dialog.selector).toBe('vr-dialog');
    expect(uiComponentCatalog.dialog.phase).toBe('16D');
  });

  it('exports file-backed documentation and style asset URLs', () => {
    expect(uiAssetUrl.vanrotstyles.href).toContain('/src/styles/vanrotstyles.css');
    expect(uiAssetUrl.docs.packageInventory.href).toContain('/src/docs/package-inventory.md');
    expect(uiAssetUrl.docs.guidelines.href).toContain('/src/docs/guidelines.md');
  });
```

- [x] **Step 2: Add failing docs asset tests**

Modify `packages/ui/tests/assets.test.ts` so the existing import remains:

```ts
import { uiAssetUrl } from '../src/index.js';
```

Add these tests inside the existing `describe('@vanrot/ui assets', () => { ... })` block:

```ts
  it('ships human-readable package inventory docs', async () => {
    const inventory = await readFile(fileURLToPath(uiAssetUrl.docs.packageInventory), 'utf8');

    expect(inventory).toContain('# @vanrot/ui Package Inventory');
    expect(inventory).toContain('October');
    expect(inventory).toContain('vanrotstyles.css');
    expect(inventory).toContain('compiler-lowered semantic elements');
  });

  it('ships UI ownership and styling guidelines', async () => {
    const guidelines = await readFile(fileURLToPath(uiAssetUrl.docs.guidelines), 'utf8');

    expect(guidelines).toContain('# @vanrot/ui Guidelines');
    expect(guidelines).toContain('developer-owned');
    expect(guidelines).toContain('Tailwind');
    expect(guidelines).toContain('Geist');
    expect(guidelines).toContain('JetBrains Mono');
  });
```

- [x] **Step 3: Run tests to verify they fail**

Run:

```bash
pnpm --filter @vanrot/ui test -- tests/metadata.test.ts tests/assets.test.ts
```

Expected: FAIL because `uiFlavor`, `uiStyleMode`, `uiComponentCatalog`, `uiPackageInventory`, `uiAssetUrl.vanrotstyles`, and docs asset URLs do not exist.

- [x] **Step 4: Add metadata source of truth**

Modify `packages/ui/src/metadata.ts` by adding these constants after `defaultUiPrefix`:

```ts
export const uiFlavor = {
  october: 'october',
} as const;

export type UiFlavor = (typeof uiFlavor)[keyof typeof uiFlavor];

export const uiStyleMode = {
  vanrotstyles: 'vanrotstyles',
  tailwind: 'tailwind',
  none: 'none',
} as const;

export type UiStyleMode = (typeof uiStyleMode)[keyof typeof uiStyleMode];

export const uiComponentPhase = {
  foundation: '16A',
  core: '16B',
  layoutData: '16C',
  overlays: '16D',
  shellPatterns: '16E',
} as const;

export type UiComponentPhase = (typeof uiComponentPhase)[keyof typeof uiComponentPhase];
```

Extend `uiAppFile`:

```ts
export const uiAppFile = {
  tokens: 'src/styles/vanrot-tokens.css',
  vanrotstyles: 'src/styles/vanrotstyles.css',
  styleEntry: 'src/styles/vanrot-ui.css',
  tokenImport: "import './styles/vanrot-tokens.css';",
  vanrotstylesImport: "import './styles/vanrotstyles.css';",
  styleEntryImport: "import './styles/vanrot-ui.css';",
} as const;
```

Add this catalog below `uiPrimitive`:

```ts
export const uiComponentCatalog = {
  button: {
    selector: 'vr-button',
    nativeTag: 'button',
    phase: uiComponentPhase.foundation,
    status: 'compiler-lowered',
  },
  card: {
    selector: 'vr-card',
    nativeTag: 'article',
    phase: uiComponentPhase.core,
    status: 'planned',
  },
  input: {
    selector: 'vr-input',
    nativeTag: 'input',
    phase: uiComponentPhase.core,
    status: 'planned',
  },
  dialog: {
    selector: 'vr-dialog',
    nativeTag: 'dialog',
    phase: uiComponentPhase.overlays,
    status: 'planned',
  },
  table: {
    selector: 'vr-table',
    nativeTag: 'table',
    phase: uiComponentPhase.layoutData,
    status: 'planned',
  },
  shell: {
    selector: 'vr-shell',
    nativeTag: 'div',
    phase: uiComponentPhase.shellPatterns,
    status: 'planned',
  },
} as const;

export const uiPackageInventory = {
  name: '@vanrot/ui',
  flavor: uiFlavor.october,
  stylesheet: 'vanrotstyles.css',
  tokens: 'vanrot-tokens.css',
  ownership: 'developer-owned',
} as const;
```

Extend `uiAssetUrl`:

```ts
export const uiAssetUrl = {
  tokens: new URL('../src/tokens/vanrot-tokens.css', import.meta.url),
  vanrotstyles: new URL('../src/styles/vanrotstyles.css', import.meta.url),
  docs: {
    packageInventory: new URL('../src/docs/package-inventory.md', import.meta.url),
    guidelines: new URL('../src/docs/guidelines.md', import.meta.url),
  },
  button: {
    typescript: new URL('../src/primitives/button/ui.button.ts', import.meta.url),
    html: new URL('../src/primitives/button/ui.button.html', import.meta.url),
    css: new URL('../src/primitives/button/ui.button.css', import.meta.url),
    test: new URL('../src/primitives/button/ui.button.test.ts', import.meta.url),
    homeUsage: new URL('../src/primitives/button/usage.home.html', import.meta.url),
  },
} as const;
```

- [x] **Step 5: Export metadata types and constants**

Modify `packages/ui/src/index.ts`:

```ts
export type {
  UiComponentPhase,
  UiFlavor,
  UiPrimitiveType,
  UiStyleMode,
} from './metadata.js';

export {
  defaultUiPrefix,
  uiAppFile,
  uiAssetUrl,
  uiComponentCatalog,
  uiComponentPhase,
  uiFlavor,
  uiPackageInventory,
  uiPrimitive,
  uiPrimitiveType,
  uiStyleMode,
} from './metadata.js';
```

- [x] **Step 6: Add package inventory docs**

Create `packages/ui/src/docs/package-inventory.md`:

```md
# @vanrot/ui Package Inventory

`@vanrot/ui` is the first-party Vanrot UI package for the October flavor.

It includes:

- October design tokens in `vanrot-tokens.css`
- first-party utility classes in `vanrotstyles.css`
- compiler-lowered semantic elements such as `<vr-button>`
- generated source templates for developer-owned UI primitives
- component registry metadata for CLI and docs
- package guidelines for theming, accessibility, typography, and style-mode choices

October is dark-first and light-capable. Teams can override semantic tokens to use their own brand colors without rewriting every component.

The package is developer-owned in spirit: generated component source belongs to the app after `vr add ...` writes it.
```

Create `packages/ui/src/docs/guidelines.md`:

```md
# @vanrot/ui Guidelines

Vanrot UI is developer-owned. Generated component files are readable app source, not a closed runtime dependency.

Use `vanrotstyles.css` when you want Vanrot's first-party utility layer. Use `vanrot.config.ts` with `ui.styles: 'tailwind'` when your project owns a Tailwind path. Use `ui.styles: 'none'` when your app owns all utilities.

October uses Geist for UI text and JetBrains Mono for numeric surfaces. Data tables, counters, financial values, and statistics should use tabular lining numbers.

Semantic colors, surfaces, radius, shadow, motion, and typography should be customized through tokens.

Interactive components must preserve native behavior where possible and provide keyboard, focus, contrast, and reduced-motion support.
```

- [x] **Step 7: Include docs and styles in package files**

Modify `packages/ui/package.json`:

```json
"files": [
  "dist",
  "src/docs",
  "src/primitives",
  "src/styles",
  "src/tokens"
],
```

- [x] **Step 8: Run UI metadata and asset tests**

Run:

```bash
pnpm --filter @vanrot/ui test -- tests/metadata.test.ts tests/assets.test.ts
```

Expected: FAIL only because `packages/ui/src/styles/vanrotstyles.css` has not been created yet. All metadata and docs assertions should be satisfied after Task 2 and Task 3.

- [x] **Step 9: Review checkpoint**

Review these files before continuing:

```bash
git diff -- packages/ui/src/metadata.ts packages/ui/src/index.ts packages/ui/package.json packages/ui/src/docs/package-inventory.md packages/ui/src/docs/guidelines.md packages/ui/tests/metadata.test.ts packages/ui/tests/assets.test.ts
```

Expected: metadata owns UI strings, docs are Markdown assets, and no generated UI markup was added to TypeScript strings.

## Task 2: October Tokens And Typography

**Files:**
- Modify: `packages/ui/src/tokens/vanrot-tokens.css`
- Test: `packages/ui/tests/assets.test.ts`

- [x] **Step 1: Add failing token architecture tests**

Modify `packages/ui/tests/assets.test.ts` by expanding `it('keeps tokens in CSS instead of TypeScript strings', ...)`:

```ts
  it('keeps October dark and light tokens in CSS instead of TypeScript strings', async () => {
    const tokens = await readFile(fileURLToPath(uiAssetUrl.tokens), 'utf8');

    expect(tokens).toContain(':root');
    expect(tokens).toContain('[data-theme="dark"]');
    expect(tokens).toContain('[data-theme="light"]');
    expect(tokens).toContain('--vr-color-canvas');
    expect(tokens).toContain('--vr-surface-card');
    expect(tokens).toContain('--vr-font-sans');
    expect(tokens).toContain('Geist');
    expect(tokens).toContain('--vr-font-number');
    expect(tokens).toContain('JetBrains Mono');
    expect(tokens).toContain('--vr-font-feature-numeric');
    expect(tokens).toContain('"tnum" 1');
    expect(tokens).toContain('--vr-radius-md');
    expect(tokens).toContain('--vr-shadow-2');
    expect(tokens).toContain('--vr-z-modal');
    expect(tokens).toContain('--vr-motion-fast');
  });
```

Remove or update the older assertion that only checks `--vr-color-surface` and `--vr-radius-control`, because Phase 16A expands those names into the October token system.

- [x] **Step 2: Run the failing token test**

Run:

```bash
pnpm --filter @vanrot/ui test -- tests/assets.test.ts
```

Expected: FAIL because the current token file is still the small Phase 9 token layer.

- [x] **Step 3: Replace the token CSS with October tokens**

Replace `packages/ui/src/tokens/vanrot-tokens.css`:

```css
:root {
  color-scheme: dark light;
  --vr-font-sans: Geist, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --vr-font-number: "JetBrains Mono", "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  --vr-font-feature-numeric: "tnum" 1, "lnum" 1;
  --vr-text-xs: 0.75rem;
  --vr-text-sm: 0.875rem;
  --vr-text-md: 1rem;
  --vr-text-lg: 1.125rem;
  --vr-text-xl: 1.25rem;
  --vr-leading-tight: 1.2;
  --vr-leading-normal: 1.5;
  --vr-space-0: 0;
  --vr-space-1: 0.25rem;
  --vr-space-2: 0.5rem;
  --vr-space-3: 0.75rem;
  --vr-space-4: 1rem;
  --vr-space-5: 1.25rem;
  --vr-space-6: 1.5rem;
  --vr-space-8: 2rem;
  --vr-space-10: 2.5rem;
  --vr-space-12: 3rem;
  --vr-radius-none: 0;
  --vr-radius-sm: 0.25rem;
  --vr-radius-md: 0.5rem;
  --vr-radius-lg: 0.75rem;
  --vr-radius-xl: 1rem;
  --vr-radius-full: 999px;
  --vr-shadow-0: none;
  --vr-shadow-1: 0 1px 2px rgb(0 0 0 / 0.14);
  --vr-shadow-2: 0 10px 28px rgb(0 0 0 / 0.24);
  --vr-shadow-3: 0 18px 48px rgb(0 0 0 / 0.32);
  --vr-z-base: 0;
  --vr-z-dropdown: 300;
  --vr-z-sticky: 400;
  --vr-z-overlay: 600;
  --vr-z-modal: 700;
  --vr-z-toast: 800;
  --vr-z-tooltip: 900;
  --vr-motion-fast: 140ms ease;
  --vr-motion-normal: 220ms ease;
  --vr-motion-slow: 360ms ease;
}

:root,
[data-theme="dark"] {
  color-scheme: dark;
  --vr-color-canvas: #080c11;
  --vr-color-page: #0d1219;
  --vr-color-surface: #121922;
  --vr-surface-card: #151e29;
  --vr-surface-raised: #1a2532;
  --vr-surface-popover: #202c3a;
  --vr-surface-muted: #101720;
  --vr-color-text: #eef4fb;
  --vr-color-muted: #9aa8b8;
  --vr-color-line: rgb(238 244 251 / 0.14);
  --vr-color-focus: #ff8a70;
  --vr-color-brand: #f05a3d;
  --vr-color-brand-foreground: #170806;
  --vr-color-success: #48c78e;
  --vr-color-warning: #f5c451;
  --vr-color-danger: #ff6b6b;
  --vr-color-info: #63b3ff;
}

[data-theme="light"] {
  color-scheme: light;
  --vr-color-canvas: #f7f8fa;
  --vr-color-page: #ffffff;
  --vr-color-surface: #ffffff;
  --vr-surface-card: #ffffff;
  --vr-surface-raised: #f2f5f8;
  --vr-surface-popover: #ffffff;
  --vr-surface-muted: #eef2f6;
  --vr-color-text: #101720;
  --vr-color-muted: #5d6978;
  --vr-color-line: rgb(16 23 32 / 0.14);
  --vr-color-focus: #d94f36;
  --vr-color-brand: #d94f36;
  --vr-color-brand-foreground: #ffffff;
  --vr-color-success: #147a4b;
  --vr-color-warning: #946200;
  --vr-color-danger: #c53636;
  --vr-color-info: #0b67b2;
}

html {
  background: var(--vr-color-canvas);
  color: var(--vr-color-text);
  font-family: var(--vr-font-sans);
}

.vr-numeric,
[data-vr-numeric="true"] {
  font-family: var(--vr-font-number);
  font-feature-settings: var(--vr-font-feature-numeric);
  font-variant-numeric: tabular-nums lining-nums;
}
```

- [x] **Step 4: Run the token tests**

Run:

```bash
pnpm --filter @vanrot/ui test -- tests/assets.test.ts
```

Expected: FAIL only because `uiAssetUrl.vanrotstyles` still points to a missing file until Task 3, or PASS if Task 3 has already created it during execution order.

- [x] **Step 5: Review checkpoint**

Review the token diff:

```bash
git diff -- packages/ui/src/tokens/vanrot-tokens.css packages/ui/tests/assets.test.ts
```

Expected: tokens are CSS-owned, include dark and light themes, include Geist and JetBrains Mono token hooks, and do not hard-code component markup in TypeScript.

## Task 3: `vanrotstyles.css` Utility Layer

**Files:**
- Create: `packages/ui/src/styles/vanrotstyles.css`
- Test: `packages/ui/tests/assets.test.ts`

- [x] **Step 1: Add failing utility CSS tests**

Add this test to `packages/ui/tests/assets.test.ts`:

```ts
  it('ships vanrotstyles utilities without vr-prefixed utility names', async () => {
    const styles = await readFile(fileURLToPath(uiAssetUrl.vanrotstyles), 'utf8');

    expect(styles).toContain('@layer vanrotstyles');
    expect(styles).toContain('.flex');
    expect(styles).toContain('.grid');
    expect(styles).toContain('.gap-2');
    expect(styles).toContain('.p-4');
    expect(styles).toContain('.radius-md');
    expect(styles).toContain('.shadow-2');
    expect(styles).toContain('.surface-card');
    expect(styles).toContain('.tabular-nums');
    expect(styles).toContain('.sr-only');
    expect(styles).not.toContain('.vr-flex');
    expect(styles).not.toContain('.vr-grid');
  });
```

- [x] **Step 2: Run the failing utility CSS test**

Run:

```bash
pnpm --filter @vanrot/ui test -- tests/assets.test.ts
```

Expected: FAIL because `packages/ui/src/styles/vanrotstyles.css` does not exist.

- [x] **Step 3: Create `vanrotstyles.css`**

Create `packages/ui/src/styles/vanrotstyles.css`:

```css
@layer vanrotstyles {
  .block { display: block; }
  .inline { display: inline; }
  .inline-block { display: inline-block; }
  .flex { display: flex; }
  .inline-flex { display: inline-flex; }
  .grid { display: grid; }
  .hidden { display: none; }
  .contents { display: contents; }

  .relative { position: relative; }
  .absolute { position: absolute; }
  .fixed { position: fixed; }
  .sticky { position: sticky; }
  .inset-0 { inset: 0; }
  .top-0 { top: 0; }
  .right-0 { right: 0; }
  .bottom-0 { bottom: 0; }
  .left-0 { left: 0; }

  .flex-row { flex-direction: row; }
  .flex-col { flex-direction: column; }
  .flex-wrap { flex-wrap: wrap; }
  .items-start { align-items: flex-start; }
  .items-center { align-items: center; }
  .items-end { align-items: flex-end; }
  .items-stretch { align-items: stretch; }
  .justify-start { justify-content: flex-start; }
  .justify-center { justify-content: center; }
  .justify-between { justify-content: space-between; }
  .justify-end { justify-content: flex-end; }
  .grow { flex-grow: 1; }
  .shrink-0 { flex-shrink: 0; }

  .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
  .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)); }
  .col-span-2 { grid-column: span 2 / span 2; }
  .col-span-3 { grid-column: span 3 / span 3; }
  .place-items-center { place-items: center; }

  .p-0 { padding: var(--vr-space-0); }
  .p-1 { padding: var(--vr-space-1); }
  .p-2 { padding: var(--vr-space-2); }
  .p-3 { padding: var(--vr-space-3); }
  .p-4 { padding: var(--vr-space-4); }
  .p-6 { padding: var(--vr-space-6); }
  .p-8 { padding: var(--vr-space-8); }
  .px-4 { padding-inline: var(--vr-space-4); }
  .py-2 { padding-block: var(--vr-space-2); }
  .py-4 { padding-block: var(--vr-space-4); }
  .m-0 { margin: var(--vr-space-0); }
  .mt-2 { margin-top: var(--vr-space-2); }
  .mt-4 { margin-top: var(--vr-space-4); }
  .mb-2 { margin-bottom: var(--vr-space-2); }
  .mb-4 { margin-bottom: var(--vr-space-4); }
  .gap-1 { gap: var(--vr-space-1); }
  .gap-2 { gap: var(--vr-space-2); }
  .gap-3 { gap: var(--vr-space-3); }
  .gap-4 { gap: var(--vr-space-4); }
  .gap-6 { gap: var(--vr-space-6); }

  .w-full { width: 100%; }
  .h-full { height: 100%; }
  .min-w-0 { min-width: 0; }
  .min-h-0 { min-height: 0; }
  .max-w-sm { max-width: 24rem; }
  .max-w-md { max-width: 28rem; }
  .max-w-lg { max-width: 32rem; }
  .max-w-xl { max-width: 36rem; }
  .max-w-screen { max-width: 100vw; }

  .font-sans { font-family: var(--vr-font-sans); }
  .font-mono { font-family: var(--vr-font-number); }
  .text-xs { font-size: var(--vr-text-xs); }
  .text-sm { font-size: var(--vr-text-sm); }
  .text-md { font-size: var(--vr-text-md); }
  .text-lg { font-size: var(--vr-text-lg); }
  .text-xl { font-size: var(--vr-text-xl); }
  .text-muted { color: var(--vr-color-muted); }
  .font-medium { font-weight: 500; }
  .font-semibold { font-weight: 600; }
  .leading-tight { line-height: var(--vr-leading-tight); }
  .leading-normal { line-height: var(--vr-leading-normal); }
  .tabular-nums {
    font-family: var(--vr-font-number);
    font-feature-settings: var(--vr-font-feature-numeric);
    font-variant-numeric: tabular-nums lining-nums;
  }
  .lining-nums { font-variant-numeric: lining-nums; }

  .text-default { color: var(--vr-color-text); }
  .text-brand { color: var(--vr-color-brand); }
  .text-success { color: var(--vr-color-success); }
  .text-warning { color: var(--vr-color-warning); }
  .text-danger { color: var(--vr-color-danger); }
  .text-info { color: var(--vr-color-info); }
  .surface-canvas { background: var(--vr-color-canvas); }
  .surface-page { background: var(--vr-color-page); }
  .surface-card { background: var(--vr-surface-card); }
  .surface-raised { background: var(--vr-surface-raised); }
  .surface-popover { background: var(--vr-surface-popover); }
  .surface-muted { background: var(--vr-surface-muted); }

  .border { border: 1px solid var(--vr-color-line); }
  .border-0 { border: 0; }
  .border-t { border-top: 1px solid var(--vr-color-line); }
  .border-b { border-bottom: 1px solid var(--vr-color-line); }
  .radius-none { border-radius: var(--vr-radius-none); }
  .radius-sm { border-radius: var(--vr-radius-sm); }
  .radius-md { border-radius: var(--vr-radius-md); }
  .radius-lg { border-radius: var(--vr-radius-lg); }
  .radius-xl { border-radius: var(--vr-radius-xl); }
  .radius-full { border-radius: var(--vr-radius-full); }
  .shadow-0 { box-shadow: var(--vr-shadow-0); }
  .shadow-1 { box-shadow: var(--vr-shadow-1); }
  .shadow-2 { box-shadow: var(--vr-shadow-2); }
  .shadow-3 { box-shadow: var(--vr-shadow-3); }

  .transition { transition-duration: var(--vr-motion-normal); transition-property: all; }
  .transition-colors { transition-duration: var(--vr-motion-fast); transition-property: background-color, border-color, color, fill, stroke; }
  .transition-transform { transition-duration: var(--vr-motion-fast); transition-property: transform; }
  .duration-fast { transition-duration: var(--vr-motion-fast); }
  .duration-normal { transition-duration: var(--vr-motion-normal); }
  .duration-slow { transition-duration: var(--vr-motion-slow); }
  .cursor-pointer { cursor: pointer; }
  .cursor-not-allowed { cursor: not-allowed; }
  .select-none { user-select: none; }
  .pointer-events-none { pointer-events: none; }
  .pointer-events-auto { pointer-events: auto; }

  .overflow-hidden { overflow: hidden; }
  .overflow-auto { overflow: auto; }
  .overflow-x-auto { overflow-x: auto; }
  .overflow-y-auto { overflow-y: auto; }
  .scroll-smooth { scroll-behavior: smooth; }
  .z-base { z-index: var(--vr-z-base); }
  .z-dropdown { z-index: var(--vr-z-dropdown); }
  .z-sticky { z-index: var(--vr-z-sticky); }
  .z-overlay { z-index: var(--vr-z-overlay); }
  .z-modal { z-index: var(--vr-z-modal); }
  .z-toast { z-index: var(--vr-z-toast); }
  .z-tooltip { z-index: var(--vr-z-tooltip); }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
  .not-sr-only {
    position: static;
    width: auto;
    height: auto;
    padding: 0;
    margin: 0;
    overflow: visible;
    clip: auto;
    white-space: normal;
  }
  .focus-ring:focus-visible {
    outline: 2px solid var(--vr-color-focus);
    outline-offset: 2px;
  }
  .touch-target { min-height: 44px; min-width: 44px; }

  @media (min-width: 48rem) {
    .md\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .md\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .md\:p-4 { padding: var(--vr-space-4); }
  }

  @media (prefers-reduced-motion: reduce) {
    .transition,
    .transition-colors,
    .transition-transform {
      transition-duration: 1ms;
    }
  }
}
```

- [x] **Step 4: Run UI package tests**

Run:

```bash
pnpm --filter @vanrot/ui test
```

Expected: PASS.

- [x] **Step 5: Review checkpoint**

Review the style asset:

```bash
git diff -- packages/ui/src/styles/vanrotstyles.css packages/ui/tests/assets.test.ts
```

Expected: utilities are unprefixed, token-backed, and scoped inside `@layer vanrotstyles`.

## Task 4: Typed UI Config Defaults And Validation

**Files:**
- Modify: `packages/config/src/types.ts`
- Modify: `packages/config/src/defaults.ts`
- Modify: `packages/config/src/diagnostics.ts`
- Modify: `packages/config/src/validate.ts`
- Modify: `packages/config/src/migrate.ts`
- Modify: `packages/config/src/index.ts`
- Test: `packages/config/tests/defaults.test.ts`
- Test: `packages/config/tests/validate.test.ts`

- [x] **Step 1: Add failing config defaults tests**

Add imports in `packages/config/tests/defaults.test.ts`:

```ts
import { normalizeVanrotConfig, vanrotUiFlavor, vanrotUiStyleMode } from '../src/index.js';
```

Add these tests:

```ts
  it('fills UI October defaults', () => {
    const normalized = normalizeVanrotConfig({});

    expect(normalized.ui.flavor).toBe(vanrotUiFlavor.october);
    expect(normalized.ui.styles).toBe(vanrotUiStyleMode.vanrotstyles);
    expect(normalized.ui.prefix).toBe('ui');
  });

  it('respects explicit UI style choices', () => {
    const normalized = normalizeVanrotConfig({
      ui: {
        flavor: vanrotUiFlavor.october,
        styles: vanrotUiStyleMode.tailwind,
        prefix: 'marketing',
      },
    });

    expect(normalized.ui.flavor).toBe(vanrotUiFlavor.october);
    expect(normalized.ui.styles).toBe(vanrotUiStyleMode.tailwind);
    expect(normalized.ui.prefix).toBe('marketing');
  });
```

- [x] **Step 2: Add failing config validation tests**

Modify `packages/config/tests/validate.test.ts` imports:

```ts
import { configDiagnosticCode, validateVanrotConfig } from '../src/index.js';
```

Add these tests:

```ts
  it('reports invalid UI flavor values', () => {
    const diagnostics = validateVanrotConfig({
      schemaVersion: 1,
      ui: { flavor: 'summer' },
    } as unknown as Parameters<typeof validateVanrotConfig>[0]);

    expect(diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: configDiagnosticCode.invalidUiFlavor,
          severity: 'error',
        }),
      ]),
    );
  });

  it('reports invalid UI style modes', () => {
    const diagnostics = validateVanrotConfig({
      schemaVersion: 1,
      ui: { styles: 'primeflex' },
    } as unknown as Parameters<typeof validateVanrotConfig>[0]);

    expect(diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: configDiagnosticCode.invalidUiStyleMode,
          severity: 'error',
        }),
      ]),
    );
  });

  it('reports invalid UI prefixes', () => {
    const diagnostics = validateVanrotConfig({
      schemaVersion: 1,
      ui: { prefix: 'Not Valid' },
    } as unknown as Parameters<typeof validateVanrotConfig>[0]);

    expect(diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: configDiagnosticCode.invalidUiPrefix,
          severity: 'error',
        }),
      ]),
    );
  });
```

- [x] **Step 3: Run failing config tests**

Run:

```bash
pnpm --filter @vanrot/config test -- tests/defaults.test.ts tests/validate.test.ts
```

Expected: FAIL because UI config constants, normalized defaults, and diagnostic codes do not exist.

- [x] **Step 4: Add UI config types**

Modify `packages/config/src/types.ts`:

```ts
export const vanrotUiFlavor = {
  october: 'october',
} as const;

export type VanrotUiFlavor = (typeof vanrotUiFlavor)[keyof typeof vanrotUiFlavor];

export const vanrotUiStyleMode = {
  vanrotstyles: 'vanrotstyles',
  tailwind: 'tailwind',
  none: 'none',
} as const;

export type VanrotUiStyleMode = (typeof vanrotUiStyleMode)[keyof typeof vanrotUiStyleMode];

export interface VanrotUiConfig {
  flavor?: VanrotUiFlavor;
  styles?: VanrotUiStyleMode;
  prefix?: string;
}

export interface NormalizedVanrotUiConfig {
  flavor: VanrotUiFlavor;
  styles: VanrotUiStyleMode;
  prefix: string;
}
```

Change `VanrotConfig`:

```ts
export interface VanrotConfig {
  schemaVersion?: number;
  project?: { name?: string };
  source?: { root?: string };
  devServer?: { port?: number };
  router?: Record<string, unknown>;
  ui?: VanrotUiConfig;
  store?: Record<string, unknown>;
  testing?: Record<string, unknown>;
  build?: Record<string, unknown>;
  cache?: Record<string, unknown>;
  docs?: Record<string, unknown>;
  ai?: Record<string, unknown>;
  conventions?: Record<string, unknown>;
}
```

Change `NormalizedVanrotConfig`:

```ts
export interface NormalizedVanrotConfig
  extends Omit<VanrotConfig, 'schemaVersion' | 'source' | 'devServer' | 'ui'> {
  schemaVersion: number;
  source: { root: string };
  devServer: { port: number };
  ui: NormalizedVanrotUiConfig;
}
```

- [x] **Step 5: Normalize UI defaults**

Modify `packages/config/src/defaults.ts`:

```ts
import { configSchemaVersion, defaultDevServerPort, defaultSourceRoot } from './constants.js';
import {
  vanrotUiFlavor,
  vanrotUiStyleMode,
  type NormalizedVanrotConfig,
  type VanrotConfig,
} from './types.js';

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
    ui: {
      flavor: config.ui?.flavor ?? vanrotUiFlavor.october,
      styles: config.ui?.styles ?? vanrotUiStyleMode.vanrotstyles,
      prefix: config.ui?.prefix ?? 'ui',
    },
  };
}
```

- [x] **Step 6: Add diagnostic codes**

Modify `packages/config/src/diagnostics.ts`:

```ts
export const configDiagnosticCode = {
  loadFailed: 'VRCFG001',
  unknownTopLevelKey: 'VRCFG002',
  invalidPort: 'VRCFG003',
  migrationSuggested: 'VRCFG004',
  recoverAmbiguous: 'VRCFG005',
  invalidUiFlavor: 'VRCFG006',
  invalidUiStyleMode: 'VRCFG007',
  invalidUiPrefix: 'VRCFG008',
} as const;
```

- [x] **Step 7: Validate UI config values**

Modify `packages/config/src/validate.ts` imports:

```ts
import { configDomain } from './constants.js';
import { configDiagnosticCode, type ConfigDiagnostic } from './diagnostics.js';
import {
  vanrotUiFlavor,
  vanrotUiStyleMode,
  type VanrotConfig,
} from './types.js';
```

Add these constants near `knownTopLevelKeys`:

```ts
const knownUiFlavors = new Set<string>(Object.values(vanrotUiFlavor));
const knownUiStyleModes = new Set<string>(Object.values(vanrotUiStyleMode));
const uiPrefixPattern = /^[a-z][a-z0-9-]*$/;
```

Add this block before `return diagnostics;`:

```ts
  const ui = config.ui;
  if (ui !== undefined) {
    if (ui.flavor !== undefined && !knownUiFlavors.has(String(ui.flavor))) {
      diagnostics.push({
        code: configDiagnosticCode.invalidUiFlavor,
        severity: 'error',
        message: `Invalid ui.flavor: ${String(ui.flavor)}`,
        suggestion: `Use ${vanrotUiFlavor.october}.`,
      });
    }

    if (ui.styles !== undefined && !knownUiStyleModes.has(String(ui.styles))) {
      diagnostics.push({
        code: configDiagnosticCode.invalidUiStyleMode,
        severity: 'error',
        message: `Invalid ui.styles: ${String(ui.styles)}`,
        suggestion: `Use ${vanrotUiStyleMode.vanrotstyles}, ${vanrotUiStyleMode.tailwind}, or ${vanrotUiStyleMode.none}.`,
      });
    }

    if (ui.prefix !== undefined && !uiPrefixPattern.test(String(ui.prefix))) {
      diagnostics.push({
        code: configDiagnosticCode.invalidUiPrefix,
        severity: 'error',
        message: `Invalid ui.prefix: ${String(ui.prefix)}`,
        suggestion: 'Use lowercase kebab-case, for example ui or marketing-primary.',
      });
    }
  }
```

- [x] **Step 8: Render canonical config with UI defaults**

Modify `packages/config/src/migrate.ts` `renderCanonicalVanrotConfig()` body so the rendered config includes UI:

```ts
export function renderCanonicalVanrotConfig(): string {
  return [
    "import { defineVanrotConfig } from '@vanrot/config';",
    '',
    'export default defineVanrotConfig({',
    '  schemaVersion: 1,',
    "  source: { root: 'src' },",
    '  devServer: { port: 1010 },',
    "  ui: { flavor: 'october', styles: 'vanrotstyles', prefix: 'ui' },",
    '});',
    '',
  ].join('\n');
}
```

- [x] **Step 9: Export UI config types and constants**

Modify `packages/config/src/index.ts` type exports:

```ts
export type {
  NormalizedVanrotConfig,
  NormalizedVanrotUiConfig,
  VanrotConfig,
  VanrotUiConfig,
  VanrotUiFlavor,
  VanrotUiStyleMode,
} from './types.js';
```

Add value exports:

```ts
export { vanrotUiFlavor, vanrotUiStyleMode } from './types.js';
```

- [x] **Step 10: Run config tests and typecheck**

Run:

```bash
pnpm --filter @vanrot/config test -- tests/defaults.test.ts tests/validate.test.ts && pnpm --filter @vanrot/config typecheck
```

Expected: PASS.

- [x] **Step 11: Review checkpoint**

Review config changes:

```bash
git diff -- packages/config/src/types.ts packages/config/src/defaults.ts packages/config/src/diagnostics.ts packages/config/src/validate.ts packages/config/src/migrate.ts packages/config/src/index.ts packages/config/tests/defaults.test.ts packages/config/tests/validate.test.ts
```

Expected: config owns config values, defaults normalize October and `vanrotstyles`, and invalid values have stable diagnostics.

## Task 5: Starter App Installs Tokens And `vanrotstyles.css`

**Files:**
- Modify: `packages/cli/src/create/app-template.ts`
- Modify: `packages/cli/src/create/starter-ui-assets.ts`
- Test: `packages/cli/tests/create.test.ts`

- [x] **Step 1: Add failing starter app tests**

In `packages/cli/tests/create.test.ts`, update the existing starter-app test that checks UI tokens. Add these expectations after reading `tokens`:

```ts
    const vanrotstyles = await readFile(join(appRoot, 'src', 'styles', 'vanrotstyles.css'), 'utf8');
    expect(main).toContain("import './styles/vanrot-tokens.css';");
    expect(main).toContain("import './styles/vanrotstyles.css';");
    expect(tokens).toContain('[data-theme="dark"]');
    expect(tokens).toContain('[data-theme="light"]');
    expect(vanrotstyles).toContain('@layer vanrotstyles');
    expect(vanrotstyles).toContain('.surface-card');
```

Update the canonical config test in `packages/cli/tests/create.test.ts`:

```ts
    expect(source).toContain("ui: { flavor: 'october', styles: 'vanrotstyles', prefix: 'ui' }");
```

- [x] **Step 2: Run failing CLI create tests**

Run:

```bash
pnpm --filter @vanrot/cli test -- tests/create.test.ts
```

Expected: FAIL because starter apps do not write `vanrotstyles.css`, do not import it, and do not render UI config defaults.

- [x] **Step 3: Include `vanrotstyles.css` in starter assets**

Modify `packages/cli/src/create/starter-ui-assets.ts`:

```ts
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { uiAppFile, uiAssetUrl } from '@vanrot/ui';
import type { TemplateFile } from './app-template.js';

export async function createStarterUiAssets(): Promise<TemplateFile[]> {
  const [tokens, vanrotstyles] = await Promise.all([
    readFile(fileURLToPath(uiAssetUrl.tokens), 'utf8'),
    readFile(fileURLToPath(uiAssetUrl.vanrotstyles), 'utf8'),
  ]);

  return [
    {
      path: uiAppFile.tokens,
      content: tokens,
    },
    {
      path: uiAppFile.vanrotstyles,
      content: vanrotstyles,
    },
  ];
}
```

- [x] **Step 4: Import `vanrotstyles.css` and render UI config defaults**

Modify `packages/cli/src/create/app-template.ts` in the `vanrot.config.ts` template:

```ts
    {
      path: 'vanrot.config.ts',
      content:
        `import { defineVanrotConfig } from '@vanrot/config';\n\n` +
        `export default defineVanrotConfig({\n` +
        `  schemaVersion: 1,\n` +
        `  source: { root: 'src' },\n` +
        `  devServer: { port: 1010 },\n` +
        `  ui: { flavor: 'october', styles: 'vanrotstyles', prefix: 'ui' },\n` +
        `});\n`,
    },
```

Modify the `src/main.ts` template imports:

```ts
${uiAppFile.tokenImport}
${uiAppFile.vanrotstylesImport}
```

- [x] **Step 5: Run CLI create tests**

Run:

```bash
pnpm --filter @vanrot/cli test -- tests/create.test.ts
```

Expected: PASS.

- [x] **Step 6: Review checkpoint**

Review starter app changes:

```bash
git diff -- packages/cli/src/create/app-template.ts packages/cli/src/create/starter-ui-assets.ts packages/cli/tests/create.test.ts
```

Expected: new apps get tokens, `vanrotstyles.css`, and canonical UI config defaults.

## Task 6: `vr add button` Respects UI Style Mode

**Files:**
- Modify: `packages/cli/src/add/ui-assets.ts`
- Modify: `packages/cli/src/add/add-ui.ts`
- Test: `packages/cli/tests/add.test.ts`

- [x] **Step 1: Add failing default `vr add button` style tests**

In the existing `packages/cli/tests/add.test.ts` test named `adds the default button primitive to a generated app`, add:

```ts
    await expect(readFile(join(appRoot, 'src', 'styles', 'vanrotstyles.css'), 'utf8')).resolves.toContain(
      '@layer vanrotstyles',
    );
    await expect(readFile(join(appRoot, 'src', 'main.ts'), 'utf8')).resolves.toContain(
      "import './styles/vanrotstyles.css';",
    );
    await expect(readFile(join(appRoot, 'vanrot.config.ts'), 'utf8')).resolves.toContain(
      "ui: { flavor: 'october', styles: 'vanrotstyles', prefix: 'ui' },",
    );
```

Replace the old config expectation:

```ts
    await expect(readFile(join(appRoot, 'vanrot.config.ts'), 'utf8')).resolves.toContain(
      'ui: { prefix: "ui" },',
    );
```

with the October expectation above.

- [x] **Step 2: Add failing Tailwind and none style-mode tests**

Add these tests to `packages/cli/tests/add.test.ts`:

```ts
  it('does not add vanrotstyles when project config selects Tailwind', async () => {
    const cwd = await tempRoot();
    const createReporter = createMemoryReporter();
    await runCli(['create', 'tailwind-app', '--workspace'], { cwd, reporter: createReporter });
    const appRoot = join(cwd, 'tailwind-app');
    const mainPath = join(appRoot, 'src', 'main.ts');
    const starterMain = await readFile(mainPath, 'utf8');
    await writeFile(mainPath, starterMain.replace("import './styles/vanrotstyles.css';\n", ''));
    await writeFile(
      join(appRoot, 'vanrot.config.ts'),
      [
        "import { defineVanrotConfig } from '@vanrot/config';",
        '',
        'export default defineVanrotConfig({',
        '  schemaVersion: 1,',
        "  source: { root: 'src' },",
        '  devServer: { port: 1010 },',
        "  ui: { flavor: 'october', styles: 'tailwind', prefix: 'ui' },",
        '});',
        '',
      ].join('\n'),
    );
    const reporter = createMemoryReporter();

    const result = await runCli(['add', 'button'], { cwd: appRoot, reporter });

    expect(result.exitCode).toBe(0);
    await expect(readFile(join(appRoot, 'src', 'styles', 'vanrotstyles.css'), 'utf8')).resolves.toContain(
      '@layer vanrotstyles',
    );
    const main = await readFile(join(appRoot, 'src', 'main.ts'), 'utf8');
    expect(main).not.toContain("import './styles/vanrotstyles.css';");
    expect(main).toContain("import './styles/vanrot-tokens.css';");
  });

  it('does not add vanrotstyles when project config selects no utility layer', async () => {
    const cwd = await tempRoot();
    const createReporter = createMemoryReporter();
    await runCli(['create', 'plain-app', '--workspace'], { cwd, reporter: createReporter });
    const appRoot = join(cwd, 'plain-app');
    const mainPath = join(appRoot, 'src', 'main.ts');
    const starterMain = await readFile(mainPath, 'utf8');
    await writeFile(mainPath, starterMain.replace("import './styles/vanrotstyles.css';\n", ''));
    await writeFile(
      join(appRoot, 'vanrot.config.ts'),
      [
        "import { defineVanrotConfig } from '@vanrot/config';",
        '',
        'export default defineVanrotConfig({',
        '  schemaVersion: 1,',
        "  source: { root: 'src' },",
        '  devServer: { port: 1010 },',
        "  ui: { flavor: 'october', styles: 'none', prefix: 'ui' },",
        '});',
        '',
      ].join('\n'),
    );
    const reporter = createMemoryReporter();

    const result = await runCli(['add', 'button'], { cwd: appRoot, reporter });

    expect(result.exitCode).toBe(0);
    const main = await readFile(join(appRoot, 'src', 'main.ts'), 'utf8');
    expect(main).not.toContain("import './styles/vanrotstyles.css';");
    expect(main).toContain("import './styles/vanrot-tokens.css';");
  });
```

These tests start from generated apps, so `vanrotstyles.css` may already exist as a file. The behavior being tested is import policy: `tailwind` and `none` must not force the app to use the utility layer.

- [x] **Step 3: Run failing CLI add tests**

Run:

```bash
pnpm --filter @vanrot/cli test -- tests/add.test.ts
```

Expected: FAIL because `vr add button` still writes old config content and always imports only token/style entry files.

- [x] **Step 4: Expose `vanrotstyles` asset reader**

Modify `packages/cli/src/add/ui-assets.ts`:

```ts
export async function readVanrotStylesCss(): Promise<string> {
  return readAsset(uiAssetUrl.vanrotstyles);
}
```

- [x] **Step 5: Respect UI style mode in add command**

Modify `packages/cli/src/add/add-ui.ts` imports:

```ts
import {
  loadVanrotProjectConfig,
  upsertVanrotConfigDomain,
  vanrotConfigFileName,
  vanrotUiStyleMode,
} from '@vanrot/config';
import { defaultUiPrefix, uiAppFile, uiPrimitiveType } from '@vanrot/ui';
```

Import the new asset reader:

```ts
import {
  buttonStyleImport,
  readHomeButtonUsage,
  readTokenCss,
  readVanrotStylesCss,
  renderButtonFiles,
} from './ui-assets.js';
```

Inside `addUiPrimitive(...)`, after `const tokens = await readTokenCss();`, add:

```ts
    const vanrotstyles = await readVanrotStylesCss();
    const styleMode = await readUiStyleMode(context.cwd);
```

After writing tokens:

```ts
    if (styleMode === vanrotUiStyleMode.vanrotstyles) {
      await writeFileIfMissing(context.cwd, uiAppFile.vanrotstyles, vanrotstyles);
      await ensureMainImport(context.cwd, uiAppFile.vanrotstylesImport);
    }
```

Keep the existing component CSS entry import:

```ts
    await ensureLineInFile(context.cwd, uiAppFile.styleEntry, buttonStyleImport(request.prefix));
    await ensureMainImport(context.cwd, uiAppFile.styleEntryImport);
```

Add this helper near `ensureUiDomainInConfig(...)`:

```ts
async function readUiStyleMode(cwd: string): Promise<string> {
  const loaded = await loadVanrotProjectConfig(cwd);
  return loaded.config.ui.styles;
}
```

Change `ensureUiDomainInConfig(...)` to use October defaults:

```ts
  const nextConfig = upsertVanrotConfigDomain(
    currentConfig,
    'ui',
    "{ flavor: 'october', styles: 'vanrotstyles', prefix: 'ui' }",
  );
```

- [x] **Step 6: Run CLI add tests**

Run:

```bash
pnpm --filter @vanrot/cli test -- tests/add.test.ts
```

Expected: PASS.

- [x] **Step 7: Review checkpoint**

Review CLI add changes:

```bash
git diff -- packages/cli/src/add/ui-assets.ts packages/cli/src/add/add-ui.ts packages/cli/tests/add.test.ts
```

Expected: `vr add button` defaults to `vanrotstyles`, respects `tailwind` and `none`, and does not remove user-owned files.

## Task 7: Compiler UI Tag Source Of Truth And October Diagnostics

**Files:**
- Create: `packages/compiler/src/codegen/ui-elements.ts`
- Modify: `packages/compiler/src/codegen/generate-component.ts`
- Test: `packages/compiler/tests/codegen/generate-component.test.ts`

- [x] **Step 1: Add failing compiler tests**

Add these tests to `packages/compiler/tests/codegen/generate-component.test.ts`:

```ts
  it('lowers vr-button through compiler-known October UI metadata', () => {
    const result = generateComponent({
      metadata,
      nodes: parseTemplate('<vr-button class="primary" type="button">Save</vr-button>', 'button.html'),
      scopeAttribute: 'data-vr-test',
      templatePath: 'button.html',
      templateSource: '<vr-button class="primary" type="button">Save</vr-button>',
    });

    expect(result.diagnostics).toEqual([]);
    expect(result.features).toContain('ui-button');
    expect(result.js).toContain('document.createElement("button")');
    expect(result.js).toContain('vr-button primary');
  });

  it('reports unsupported October UI tags with production wording', () => {
    const templateSource = '<vr-card>Draft card</vr-card>';
    const result = generateComponent({
      metadata,
      nodes: parseTemplate(templateSource, 'card.html'),
      scopeAttribute: 'data-vr-test',
      templatePath: 'card.html',
      templateSource,
    });

    expect(result.diagnostics).toEqual([
      expect.objectContaining({
        code: 'VR010',
        severity: 'error',
        message: '<vr-card> is not available in UI October yet. Add the primitive through a Phase 16 UI slice before using it.',
      }),
    ]);
  });
```

- [x] **Step 2: Run failing compiler tests**

Run:

```bash
pnpm --filter @vanrot/compiler test -- tests/codegen/generate-component.test.ts
```

Expected: FAIL because the diagnostic still says Phase 9 and UI tag literals are local to `generate-component.ts`.

- [x] **Step 3: Create compiler UI element metadata**

Create `packages/compiler/src/codegen/ui-elements.ts`:

```ts
export const compilerUiTag = {
  button: 'vr-button',
} as const;

export const compilerUiNativeTag = {
  button: 'button',
} as const;

export const compilerUiClass = {
  button: 'vr-button',
} as const;

export function isUnsupportedVanrotUiTag(tagName: string): boolean {
  return tagName.startsWith('vr-');
}

export function unsupportedVanrotUiTagMessage(tagName: string): string {
  return `<${tagName}> is not available in UI October yet. Add the primitive through a Phase 16 UI slice before using it.`;
}
```

- [x] **Step 4: Use UI element metadata in code generation**

Modify `packages/compiler/src/codegen/generate-component.ts` imports:

```ts
import {
  compilerUiClass,
  compilerUiNativeTag,
  compilerUiTag,
  isUnsupportedVanrotUiTag,
  unsupportedVanrotUiTagMessage,
} from './ui-elements.js';
```

Remove these local constants:

```ts
const uiButtonTagName = 'vr-button';
const uiButtonNativeTagName = 'button';
const uiButtonBaseClass = 'vr-button';
```

Change the button branch:

```ts
  if (node.tagName === compilerUiTag.button) {
    generateUiButton(node, parentName, scopeAttribute, state);
    return;
  }
```

Change `generateUiButton(...)`:

```ts
function generateUiButton(
  node: ElementNode,
  parentName: string,
  scopeAttribute: string,
  state: GenerateState,
): void {
  const buttonName = state.ids.next(compilerUiNativeTag.button);

  state.features.add('ui-button');
  state.lines.push(`  const ${buttonName} = document.createElement(${quoteString(compilerUiNativeTag.button)});`);
  state.lines.push(`  ${buttonName}.setAttribute(${quoteString(scopeAttribute)}, '');`);
  generateUiButtonClass(node.attributes, buttonName, state);
```

Change `generateUiButtonClass(...)`:

```ts
  const classValue = mergeClassValue(compilerUiClass.button, classAttribute?.value ?? '');
```

Replace `diagnoseUnsupportedVanrotUiTag(...)` message:

```ts
function diagnoseUnsupportedVanrotUiTag(tagName: string, state: GenerateState): void {
  state.diagnostics.push(
    createDiagnostic(
      'VR010',
      'error',
      unsupportedVanrotUiTagMessage(tagName),
      state.templatePath,
    ),
  );
}
```

Remove the old local `isUnsupportedVanrotUiTag(...)` function from `generate-component.ts`.

- [x] **Step 5: Run compiler tests**

Run:

```bash
pnpm --filter @vanrot/compiler test -- tests/codegen/generate-component.test.ts && pnpm --filter @vanrot/compiler typecheck
```

Expected: PASS.

- [x] **Step 6: Review checkpoint**

Review compiler changes:

```bash
git diff -- packages/compiler/src/codegen/ui-elements.ts packages/compiler/src/codegen/generate-component.ts packages/compiler/tests/codegen/generate-component.test.ts
```

Expected: `<vr-button>` behavior is unchanged, unsupported `vr-*` tags use October wording, and UI tag strings are in a named source of truth.

## Task 8: Cross-Package Verification

**Files:**
- No source edits in this task.

- [x] **Step 1: Run focused package tests**

Run:

```bash
pnpm --filter @vanrot/ui test && pnpm --filter @vanrot/ui typecheck
pnpm --filter @vanrot/config test && pnpm --filter @vanrot/config typecheck
pnpm --filter @vanrot/cli test -- tests/create.test.ts tests/add.test.ts && pnpm --filter @vanrot/cli typecheck
pnpm --filter @vanrot/compiler test -- tests/codegen/generate-component.test.ts && pnpm --filter @vanrot/compiler typecheck
```

Expected: PASS.

- [x] **Step 2: Run repo verification**

Run:

```bash
pnpm verify
```

Expected: PASS, including `verify:phase-docs` and the runtime size budget.

- [x] **Step 3: Review checkpoint**

Check status:

```bash
git status --short --branch
```

Expected: only Phase 16A files plus any pre-existing unrelated local files are modified.

## Task 9: Phase 16A Completion Docs

**Files:**
- Modify: `docs/superpowers/feature-maturity.md`
- Modify: `docs/superpowers/final-tdd-inventory.md`
- Modify: `docs/vanrot-presentation.html`
- Modify: `docs/superpowers/plans/Phase-16A.md`

- [x] **Step 1: Update feature maturity wording**

Modify `docs/superpowers/feature-maturity.md`:

- Rename the top-level Phase 16 track to `UI October production`.
- Change older flavor wording in the `@vanrot/ui` section to `October`.
- Keep the top-level Phase 16 checkbox unchecked until every Phase 16 slice is complete.
- Mark Phase 16A-owned rows as no longer only deferred:
  - UI package foundation notes mention package inventory and guidelines.
  - Design tokens notes mention October dark/light and typography tokens.
  - Vanrot utility class layer notes mention `vanrotstyles.css`.
  - Tailwind interoperability notes mention config style mode `tailwind`.
  - UI flavor row becomes `UI flavor October`.

Use wording like:

```md
| UI flavor October * | ui | Phase 16A | October foundation assets, tokens, utilities, docs, and config mode are available | Full component coverage, accessibility, examples, and visual QA verified across Phase 16B-16E | In Progress | Phase 16A establishes the flavor foundation; component catalog production readiness remains sliced across Phase 16B-16E. |
```

- [x] **Step 2: Update final TDD inventory**

Modify `docs/superpowers/final-tdd-inventory.md` by adding Phase 16A entries under the UI section:

```md
| package | `@vanrot/ui` October inventory | Production-Ready for Phase 16A foundation | Package exports October metadata, package inventory docs, guidelines, tokens, `vanrotstyles.css`, and asset URLs. | Phase 16A | Component catalog implementation remains Phase 16B-16E. |
| asset | `vanrotstyles.css` | Production-Ready for Phase 16A foundation | Unprefixed utility classes cover display, flex, grid, spacing, sizing, typography, surfaces, borders, radius, shadows, motion, overflow, z-index, and accessibility helpers. | Phase 16A | Teams can disable usage through config style mode. |
| config | `ui.styles` | Production-Ready for Phase 16A foundation | `vanrot.config.ts` normalizes and validates `vanrotstyles`, `tailwind`, and `none` style modes. | Phase 16A | CLI create/add respects the style mode. |
| compiler | October UI tag diagnostics | Production-Ready for Phase 16A foundation | `<vr-button>` remains compiler-lowered and unsupported `vr-*` UI tags use October diagnostics. | Phase 16A | Additional semantic tags remain sliced. |
```

- [x] **Step 3: Update presentation status**

Modify `docs/vanrot-presentation.html`:

- Change Phase 16 display text to `UI October Component System`.
- Keep Phase 16 active.
- Add a short Phase 16A note for October foundation: tokens, `vanrotstyles.css`, config modes, package inventory.

- [x] **Step 4: Mark completed checkboxes in this plan**

After implementation and verification pass, change completed task checkboxes in `docs/superpowers/plans/Phase-16A.md` from `- [x]` to `- [x]`.

Do not mark the top-level Phase 16 roadmap checkbox done unless Phase 16B through Phase 16E are also complete.

- [x] **Step 5: Run phase docs verification**

Run:

```bash
pnpm verify:phase-docs
```

Expected: PASS.

- [x] **Step 6: Run full verification again**

Run:

```bash
pnpm verify
```

Expected: PASS.

- [x] **Step 7: Final review checkpoint**

Run:

```bash
git status --short --branch
```

Expected: Phase 16A source, tests, docs, and plan updates are present. Pre-existing unrelated local changes remain untouched.

## Self-Review Checklist

- [x] Spec coverage: Phase 16A covers October naming, package inventory, `vanrotstyles.css`, dark/light tokens, typography tokens, config style modes, starter wiring, Tailwind opt-out, and compiler diagnostic cleanup.
- [x] Scope check: broad component catalog work remains in Phase 16B through Phase 16E.
- [x] Placeholder scan: this plan contains no placeholder implementation steps.
- [x] Type consistency: `vanrotstyles`, `vanrotstyles.css`, `october`, `ui.styles`, `ui.flavor`, and `ui.prefix` names match across UI, config, CLI, compiler, and docs.
- [x] Git ownership: no task runs `git add`, `git commit`, or `git push`; implementation ends with review checkpoints.

## Execution Handoff

Use inline execution only in this repository:

```txt
superpowers:executing-plans Phase-16A
```

Subagent-driven execution is intentionally not offered because `AGENTS.md` forbids subagent-driven Superpowers workflows in this repo.
