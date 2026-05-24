# Phase 16B UI October Core Primitives Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task in the current session. Vanrot rules forbid subagents, parallel agents, worktrees, staging, committing, and pushing unless the user explicitly asks. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Phase 16B October core primitive set so `@vanrot/ui`, the compiler, CLI, docs, and tests all support the approved shadcn-style visual direction.

**Architecture:** Keep `@vanrot/ui` as the source of truth for primitive names, selectors, variants, assets, and docs paths. Keep `@vanrot/compiler` responsible for lowering semantic `vr-*` tags into native markup with variant class handling and accessibility defaults. Keep `@vanrot/cli` responsible for copying app-owned primitive files through `vr add <primitive>` while respecting `ui.styles`.

**Tech Stack:** TypeScript, Vitest, Vanrot compiler codegen, Vanrot CLI, `@vanrot/ui`, `vanrotstyles.css`, October tokens, Markdown docs.

---

## Source Material

Use these files as the source of truth before editing:

- Spec: `docs/superpowers/specs/Phase-16B.md`
- Approved visual reference: `.superpowers/brainstorm/75913-1779602752/content/phase-16b-core-primitives.html`
- Existing UI metadata: `packages/ui/src/metadata.ts`
- Existing UI asset reader: `packages/cli/src/add/ui-assets.ts`
- Existing CLI add command: `packages/cli/src/add/add-ui.ts`
- Existing compiler UI map: `packages/compiler/src/codegen/ui-elements.ts`
- Existing compiler lowering: `packages/compiler/src/codegen/generate-component.ts`

Do not treat Phase 16B as the whole UI ecosystem. Phase 16C, 16D, and 16E keep layout, forms, data display, overlays, app shell, and stateful interaction outside this plan.

## File Structure

Create or modify these files:

- Modify: `packages/ui/src/metadata.ts`
  - Own primitive names, selector names, variant names, phase metadata, file names, docs paths, and file-backed asset URLs.
- Modify: `packages/ui/src/index.ts`
  - Export new metadata types/constants.
- Create: `packages/ui/src/primitives/card/ui.card.ts`
- Create: `packages/ui/src/primitives/card/ui.card.html`
- Create: `packages/ui/src/primitives/card/ui.card.css`
- Create: `packages/ui/src/primitives/card/ui.card.test.ts`
- Create: `packages/ui/src/primitives/card/usage.home.html`
- Create the same five-file template set for `badge`, `avatar`, `alert`, `loader`, `skeleton`, and `separator`.
- Modify: `packages/ui/src/primitives/button/ui.button.css`
  - Align button variants with the approved preview.
- Modify: `packages/ui/src/primitives/button/usage.home.html`
  - Use the Phase 16B button variant language.
- Modify: `packages/ui/tests/metadata.test.ts`
  - Cover all Phase 16B metadata and variants.
- Modify: `packages/ui/tests/assets.test.ts`
  - Cover all primitive template assets.
- Modify: `packages/cli/src/add/ui-assets.ts`
  - Replace button-only rendering with registry-driven primitive rendering.
- Modify: `packages/cli/src/add/add-ui.ts`
  - Support `vr add` for all Phase 16B primitives.
- Modify: `packages/cli/tests/add.test.ts`
  - Cover supported primitives, unsupported primitive messaging, local prefix rendering, `--test`, and style mode behavior.
- Modify: `packages/compiler/src/api/types.ts`
  - Add compile feature names and diagnostic code for invalid UI variants.
- Modify: `packages/compiler/src/diagnostics/catalog.ts`
  - Document the invalid UI variant diagnostic.
- Modify: `packages/compiler/src/codegen/ui-elements.ts`
  - Add Phase 16B compiler UI element metadata.
- Modify: `packages/compiler/src/codegen/generate-component.ts`
  - Lower variants into classes, skip framework-only attributes, and add accessibility defaults.
- Modify: `packages/compiler/tests/codegen/generate-component.test.ts`
  - Cover lowering, variants, classes, diagnostics, and accessibility behavior.
- Modify: `packages/ui/src/docs/package-inventory.md`
  - List Phase 16B primitives and future slices.
- Modify: `packages/ui/src/docs/guidelines.md`
  - Add shadcn-style docs/page guidance and source-owned primitive rules.
- Modify: `docs/superpowers/feature-maturity.md`
  - Mark Phase 16B rows as implemented only when verification passes.
- Modify: `docs/superpowers/final-tdd-inventory.md`
  - Add every Phase 16B package, primitive, command, compiler behavior, and docs convention.
- Modify: `docs/vanrot-presentation.html`
  - Update roadmap status after implementation.

## Primitive Source Of Truth

Phase 16B primitive names:

```ts
export const uiPrimitiveType = {
  button: 'button',
  card: 'card',
  badge: 'badge',
  avatar: 'avatar',
  alert: 'alert',
  loader: 'loader',
  skeleton: 'skeleton',
  separator: 'separator',
} as const;
```

Phase 16B variants:

```ts
export const uiPrimitiveVariant = {
  button: ['default', 'secondary', 'outline', 'ghost', 'danger', 'link'],
  card: ['default', 'muted', 'interactive'],
  badge: ['default', 'secondary', 'success', 'warning', 'danger', 'outline'],
  avatar: ['default', 'soft', 'outline'],
  alert: ['info', 'success', 'warning', 'danger'],
  loader: ['spinner', 'dots', 'bar'],
  skeleton: ['text', 'avatar', 'card', 'block'],
  separator: ['horizontal', 'vertical'],
} as const;
```

Use these constants everywhere. Do not repeat primitive or variant lists in CLI, compiler, docs tests, or package tests.

## Task 1: Add UI Metadata Red Tests

**Files:**

- Modify: `packages/ui/tests/metadata.test.ts`

- [x] **Step 1: Import the new metadata names**

Update the import from `../src/index.js` to include these names:

```ts
import {
  defaultUiPrefix,
  uiAppFile,
  uiAssetUrl,
  uiComponentCatalog,
  uiFlavor,
  uiPackageInventory,
  uiPrimitive,
  uiPrimitiveOrder,
  uiPrimitiveType,
  uiPrimitiveVariant,
  uiStyleMode,
} from '../src/index.js';
```

- [x] **Step 2: Add a failing test for the Phase 16B primitive order**

Append this test inside `describe('@vanrot/ui metadata', ...)`:

```ts
it('exports the Phase 16B core primitive order', () => {
  expect(uiPrimitiveOrder).toEqual([
    uiPrimitiveType.button,
    uiPrimitiveType.card,
    uiPrimitiveType.badge,
    uiPrimitiveType.avatar,
    uiPrimitiveType.alert,
    uiPrimitiveType.loader,
    uiPrimitiveType.skeleton,
    uiPrimitiveType.separator,
  ]);
});
```

- [x] **Step 3: Add a failing test for primitive variants**

Append this test:

```ts
it('exports source-of-truth variants for Phase 16B primitives', () => {
  expect(uiPrimitiveVariant.button).toEqual([
    'default',
    'secondary',
    'outline',
    'ghost',
    'danger',
    'link',
  ]);
  expect(uiPrimitiveVariant.card).toEqual(['default', 'muted', 'interactive']);
  expect(uiPrimitiveVariant.badge).toEqual([
    'default',
    'secondary',
    'success',
    'warning',
    'danger',
    'outline',
  ]);
  expect(uiPrimitiveVariant.avatar).toEqual(['default', 'soft', 'outline']);
  expect(uiPrimitiveVariant.alert).toEqual(['info', 'success', 'warning', 'danger']);
  expect(uiPrimitiveVariant.loader).toEqual(['spinner', 'dots', 'bar']);
  expect(uiPrimitiveVariant.skeleton).toEqual(['text', 'avatar', 'card', 'block']);
  expect(uiPrimitiveVariant.separator).toEqual(['horizontal', 'vertical']);
});
```

- [x] **Step 4: Replace the old Phase 16A catalog test with a Phase 16B catalog test**

Replace the test named `exports the Phase 16A component catalog shape` with:

```ts
it('exports the Phase 16B component catalog shape', () => {
  for (const primitive of uiPrimitiveOrder) {
    expect(uiPrimitive[primitive].type).toBe(primitive);
    expect(uiPrimitive[primitive].selector).toBe(`vr-${primitive}`);
    expect(uiPrimitive[primitive].directory).toBe(`src/ui/${primitive}`);
    expect(uiPrimitive[primitive].productionPhase).toBe('16B');
    expect(uiPrimitive[primitive].variants).toEqual(uiPrimitiveVariant[primitive]);
    expect(uiComponentCatalog[primitive].selector).toBe(`vr-${primitive}`);
    expect(uiComponentCatalog[primitive].productionPhase).toBe('16B');
  }

  expect(uiPrimitive.button.introducedPhase).toBe('16A');
  expect(uiPrimitive.card.nativeTag).toBe('article');
  expect(uiPrimitive.separator.nativeTag).toBe('hr');
});
```

- [x] **Step 5: Expand the asset URL test**

Replace the button-only asset assertions with:

```ts
for (const primitive of uiPrimitiveOrder) {
  expect(uiAssetUrl[primitive].typescript.href).toContain(
    `/src/primitives/${primitive}/ui.${primitive}.ts`,
  );
  expect(uiAssetUrl[primitive].html.href).toContain(
    `/src/primitives/${primitive}/ui.${primitive}.html`,
  );
  expect(uiAssetUrl[primitive].css.href).toContain(
    `/src/primitives/${primitive}/ui.${primitive}.css`,
  );
  expect(uiAssetUrl[primitive].test.href).toContain(
    `/src/primitives/${primitive}/ui.${primitive}.test.ts`,
  );
  expect(uiAssetUrl[primitive].homeUsage.href).toContain(
    `/src/primitives/${primitive}/usage.home.html`,
  );
}
```

- [x] **Step 6: Run the metadata test and confirm it fails**

Run:

```bash
pnpm --filter @vanrot/ui test -- tests/metadata.test.ts
```

Expected: FAIL because `uiPrimitiveOrder`, `uiPrimitiveVariant`, and new primitive asset URLs do not exist yet.

## Task 2: Implement UI Metadata

**Files:**

- Modify: `packages/ui/src/metadata.ts`
- Modify: `packages/ui/src/index.ts`

- [x] **Step 1: Replace `uiPrimitiveType` with the Phase 16B primitive map**

In `packages/ui/src/metadata.ts`, replace the current `uiPrimitiveType` object with:

```ts
export const uiPrimitiveType = {
  button: 'button',
  card: 'card',
  badge: 'badge',
  avatar: 'avatar',
  alert: 'alert',
  loader: 'loader',
  skeleton: 'skeleton',
  separator: 'separator',
} as const;

export type UiPrimitiveType = (typeof uiPrimitiveType)[keyof typeof uiPrimitiveType];

export const uiPrimitiveOrder = [
  uiPrimitiveType.button,
  uiPrimitiveType.card,
  uiPrimitiveType.badge,
  uiPrimitiveType.avatar,
  uiPrimitiveType.alert,
  uiPrimitiveType.loader,
  uiPrimitiveType.skeleton,
  uiPrimitiveType.separator,
] as const satisfies readonly UiPrimitiveType[];
```

- [x] **Step 2: Add the source-of-truth variant map**

Add this below `uiPrimitiveOrder`:

```ts
export const uiPrimitiveVariant = {
  button: ['default', 'secondary', 'outline', 'ghost', 'danger', 'link'],
  card: ['default', 'muted', 'interactive'],
  badge: ['default', 'secondary', 'success', 'warning', 'danger', 'outline'],
  avatar: ['default', 'soft', 'outline'],
  alert: ['info', 'success', 'warning', 'danger'],
  loader: ['spinner', 'dots', 'bar'],
  skeleton: ['text', 'avatar', 'card', 'block'],
  separator: ['horizontal', 'vertical'],
} as const satisfies Record<UiPrimitiveType, readonly string[]>;

export type UiPrimitiveVariantMap = typeof uiPrimitiveVariant;
export type UiPrimitiveVariant<TPrimitive extends UiPrimitiveType> =
  UiPrimitiveVariantMap[TPrimitive][number];
```

- [x] **Step 3: Replace `uiPrimitive` with the Phase 16B registry**

Replace the existing `uiPrimitive` object with:

```ts
export const uiPrimitive = {
  button: {
    type: uiPrimitiveType.button,
    directory: 'src/ui/button',
    role: 'button',
    defaultFiles: ['ui.button.ts', 'ui.button.html', 'ui.button.css'],
    selector: 'vr-button',
    nativeTag: 'button',
    baseClass: 'vr-button',
    introducedPhase: uiComponentPhase.foundation,
    productionPhase: uiComponentPhase.core,
    variants: uiPrimitiveVariant.button,
    defaultVariant: 'default',
    docsPath: '/docs/components/button',
  },
  card: {
    type: uiPrimitiveType.card,
    directory: 'src/ui/card',
    role: 'card',
    defaultFiles: ['ui.card.ts', 'ui.card.html', 'ui.card.css'],
    selector: 'vr-card',
    nativeTag: 'article',
    baseClass: 'vr-card',
    introducedPhase: uiComponentPhase.core,
    productionPhase: uiComponentPhase.core,
    variants: uiPrimitiveVariant.card,
    defaultVariant: 'default',
    docsPath: '/docs/components/card',
  },
  badge: {
    type: uiPrimitiveType.badge,
    directory: 'src/ui/badge',
    role: 'badge',
    defaultFiles: ['ui.badge.ts', 'ui.badge.html', 'ui.badge.css'],
    selector: 'vr-badge',
    nativeTag: 'span',
    baseClass: 'vr-badge',
    introducedPhase: uiComponentPhase.core,
    productionPhase: uiComponentPhase.core,
    variants: uiPrimitiveVariant.badge,
    defaultVariant: 'default',
    docsPath: '/docs/components/badge',
  },
  avatar: {
    type: uiPrimitiveType.avatar,
    directory: 'src/ui/avatar',
    role: 'avatar',
    defaultFiles: ['ui.avatar.ts', 'ui.avatar.html', 'ui.avatar.css'],
    selector: 'vr-avatar',
    nativeTag: 'span',
    baseClass: 'vr-avatar',
    introducedPhase: uiComponentPhase.core,
    productionPhase: uiComponentPhase.core,
    variants: uiPrimitiveVariant.avatar,
    defaultVariant: 'default',
    docsPath: '/docs/components/avatar',
  },
  alert: {
    type: uiPrimitiveType.alert,
    directory: 'src/ui/alert',
    role: 'alert',
    defaultFiles: ['ui.alert.ts', 'ui.alert.html', 'ui.alert.css'],
    selector: 'vr-alert',
    nativeTag: 'section',
    baseClass: 'vr-alert',
    introducedPhase: uiComponentPhase.core,
    productionPhase: uiComponentPhase.core,
    variants: uiPrimitiveVariant.alert,
    defaultVariant: 'info',
    docsPath: '/docs/components/alert',
  },
  loader: {
    type: uiPrimitiveType.loader,
    directory: 'src/ui/loader',
    role: 'loader',
    defaultFiles: ['ui.loader.ts', 'ui.loader.html', 'ui.loader.css'],
    selector: 'vr-loader',
    nativeTag: 'span',
    baseClass: 'vr-loader',
    introducedPhase: uiComponentPhase.core,
    productionPhase: uiComponentPhase.core,
    variants: uiPrimitiveVariant.loader,
    defaultVariant: 'spinner',
    docsPath: '/docs/components/loader',
  },
  skeleton: {
    type: uiPrimitiveType.skeleton,
    directory: 'src/ui/skeleton',
    role: 'skeleton',
    defaultFiles: ['ui.skeleton.ts', 'ui.skeleton.html', 'ui.skeleton.css'],
    selector: 'vr-skeleton',
    nativeTag: 'span',
    baseClass: 'vr-skeleton',
    introducedPhase: uiComponentPhase.core,
    productionPhase: uiComponentPhase.core,
    variants: uiPrimitiveVariant.skeleton,
    defaultVariant: 'text',
    docsPath: '/docs/components/skeleton',
  },
  separator: {
    type: uiPrimitiveType.separator,
    directory: 'src/ui/separator',
    role: 'separator',
    defaultFiles: ['ui.separator.ts', 'ui.separator.html', 'ui.separator.css'],
    selector: 'vr-separator',
    nativeTag: 'hr',
    baseClass: 'vr-separator',
    introducedPhase: uiComponentPhase.core,
    productionPhase: uiComponentPhase.core,
    variants: uiPrimitiveVariant.separator,
    defaultVariant: 'horizontal',
    docsPath: '/docs/components/separator',
  },
} as const;
```

- [x] **Step 4: Replace `uiComponentCatalog` with a registry-derived catalog**

Replace the existing object with:

```ts
export const uiComponentCatalog = Object.fromEntries(
  uiPrimitiveOrder.map((primitive) => {
    const metadata = uiPrimitive[primitive];

    return [
      primitive,
      {
        selector: metadata.selector,
        nativeTag: metadata.nativeTag,
        introducedPhase: metadata.introducedPhase,
        productionPhase: metadata.productionPhase,
        status: 'compiler-lowered',
        docsPath: metadata.docsPath,
        variants: metadata.variants,
      },
    ];
  }),
) as {
  readonly [Primitive in UiPrimitiveType]: {
    readonly selector: (typeof uiPrimitive)[Primitive]['selector'];
    readonly nativeTag: (typeof uiPrimitive)[Primitive]['nativeTag'];
    readonly introducedPhase: (typeof uiPrimitive)[Primitive]['introducedPhase'];
    readonly productionPhase: (typeof uiPrimitive)[Primitive]['productionPhase'];
    readonly status: 'compiler-lowered';
    readonly docsPath: (typeof uiPrimitive)[Primitive]['docsPath'];
    readonly variants: (typeof uiPrimitive)[Primitive]['variants'];
  };
};
```

- [x] **Step 5: Expand `uiAssetUrl`**

Keep `tokens`, `vanrotstyles`, and `docs`. Replace the `button` block with one block per primitive:

```ts
  button: {
    typescript: new URL('../src/primitives/button/ui.button.ts', import.meta.url),
    html: new URL('../src/primitives/button/ui.button.html', import.meta.url),
    css: new URL('../src/primitives/button/ui.button.css', import.meta.url),
    test: new URL('../src/primitives/button/ui.button.test.ts', import.meta.url),
    homeUsage: new URL('../src/primitives/button/usage.home.html', import.meta.url),
  },
  card: {
    typescript: new URL('../src/primitives/card/ui.card.ts', import.meta.url),
    html: new URL('../src/primitives/card/ui.card.html', import.meta.url),
    css: new URL('../src/primitives/card/ui.card.css', import.meta.url),
    test: new URL('../src/primitives/card/ui.card.test.ts', import.meta.url),
    homeUsage: new URL('../src/primitives/card/usage.home.html', import.meta.url),
  },
  badge: {
    typescript: new URL('../src/primitives/badge/ui.badge.ts', import.meta.url),
    html: new URL('../src/primitives/badge/ui.badge.html', import.meta.url),
    css: new URL('../src/primitives/badge/ui.badge.css', import.meta.url),
    test: new URL('../src/primitives/badge/ui.badge.test.ts', import.meta.url),
    homeUsage: new URL('../src/primitives/badge/usage.home.html', import.meta.url),
  },
  avatar: {
    typescript: new URL('../src/primitives/avatar/ui.avatar.ts', import.meta.url),
    html: new URL('../src/primitives/avatar/ui.avatar.html', import.meta.url),
    css: new URL('../src/primitives/avatar/ui.avatar.css', import.meta.url),
    test: new URL('../src/primitives/avatar/ui.avatar.test.ts', import.meta.url),
    homeUsage: new URL('../src/primitives/avatar/usage.home.html', import.meta.url),
  },
  alert: {
    typescript: new URL('../src/primitives/alert/ui.alert.ts', import.meta.url),
    html: new URL('../src/primitives/alert/ui.alert.html', import.meta.url),
    css: new URL('../src/primitives/alert/ui.alert.css', import.meta.url),
    test: new URL('../src/primitives/alert/ui.alert.test.ts', import.meta.url),
    homeUsage: new URL('../src/primitives/alert/usage.home.html', import.meta.url),
  },
  loader: {
    typescript: new URL('../src/primitives/loader/ui.loader.ts', import.meta.url),
    html: new URL('../src/primitives/loader/ui.loader.html', import.meta.url),
    css: new URL('../src/primitives/loader/ui.loader.css', import.meta.url),
    test: new URL('../src/primitives/loader/ui.loader.test.ts', import.meta.url),
    homeUsage: new URL('../src/primitives/loader/usage.home.html', import.meta.url),
  },
  skeleton: {
    typescript: new URL('../src/primitives/skeleton/ui.skeleton.ts', import.meta.url),
    html: new URL('../src/primitives/skeleton/ui.skeleton.html', import.meta.url),
    css: new URL('../src/primitives/skeleton/ui.skeleton.css', import.meta.url),
    test: new URL('../src/primitives/skeleton/ui.skeleton.test.ts', import.meta.url),
    homeUsage: new URL('../src/primitives/skeleton/usage.home.html', import.meta.url),
  },
  separator: {
    typescript: new URL('../src/primitives/separator/ui.separator.ts', import.meta.url),
    html: new URL('../src/primitives/separator/ui.separator.html', import.meta.url),
    css: new URL('../src/primitives/separator/ui.separator.css', import.meta.url),
    test: new URL('../src/primitives/separator/ui.separator.test.ts', import.meta.url),
    homeUsage: new URL('../src/primitives/separator/usage.home.html', import.meta.url),
  },
```

- [x] **Step 6: Export new names from `packages/ui/src/index.ts`**

Add these exports:

```ts
  uiPrimitiveOrder,
  uiPrimitiveVariant,
  type UiPrimitiveVariant,
  type UiPrimitiveVariantMap,
```

- [x] **Step 7: Run the metadata test**

Run:

```bash
pnpm --filter @vanrot/ui test -- tests/metadata.test.ts
```

Expected: FAIL only because file-backed assets for the new primitives do not exist yet.

## Task 3: Add Primitive Template Asset Red Tests

**Files:**

- Modify: `packages/ui/tests/assets.test.ts`

- [x] **Step 1: Import primitive metadata**

Add these imports:

```ts
import { uiPrimitive, uiPrimitiveOrder, uiPrimitiveVariant } from '../src/index.js';
```

- [x] **Step 2: Add a failing asset existence test**

Append:

```ts
it('ships source templates for every Phase 16B primitive', async () => {
  for (const primitive of uiPrimitiveOrder) {
    const metadata = uiPrimitive[primitive];
    const directory = join(packageRoot, 'src', 'primitives', primitive);

    await expect(readFile(join(directory, `ui.${primitive}.ts`), 'utf8')).resolves.toContain(
      `export class Ui${primitive[0].toUpperCase()}${primitive.slice(1)}`,
    );
    await expect(readFile(join(directory, `ui.${primitive}.html`), 'utf8')).resolves.toContain(
      metadata.selector,
    );
    await expect(readFile(join(directory, `ui.${primitive}.css`), 'utf8')).resolves.toContain(
      metadata.baseClass,
    );
    await expect(readFile(join(directory, `ui.${primitive}.test.ts`), 'utf8')).resolves.toContain(
      `Ui${primitive[0].toUpperCase()}${primitive.slice(1)}`,
    );
    await expect(readFile(join(directory, 'usage.home.html'), 'utf8')).resolves.toContain(
      metadata.selector,
    );
  }
});
```

- [x] **Step 3: Add a failing variant coverage test**

Append:

```ts
it('ships CSS classes for every Phase 16B non-default variant', async () => {
  for (const primitive of uiPrimitiveOrder) {
    const css = await readFile(
      join(packageRoot, 'src', 'primitives', primitive, `ui.${primitive}.css`),
      'utf8',
    );
    const [defaultVariant, ...secondaryVariants] = uiPrimitiveVariant[primitive];

    expect(defaultVariant).toBe(uiPrimitive[primitive].defaultVariant);
    expect(css).toContain(uiPrimitive[primitive].baseClass);

    for (const variant of secondaryVariants) {
      expect(css).toContain(`${uiPrimitive[primitive].baseClass}-${variant}`);
    }
  }
});
```

- [x] **Step 4: Run the assets test and confirm it fails**

Run:

```bash
pnpm --filter @vanrot/ui test -- tests/assets.test.ts
```

Expected: FAIL because the new primitive template directories do not exist.

## Task 4: Add Primitive Template Assets

**Files:**

- Create: `packages/ui/src/primitives/card/*`
- Create: `packages/ui/src/primitives/badge/*`
- Create: `packages/ui/src/primitives/avatar/*`
- Create: `packages/ui/src/primitives/alert/*`
- Create: `packages/ui/src/primitives/loader/*`
- Create: `packages/ui/src/primitives/skeleton/*`
- Create: `packages/ui/src/primitives/separator/*`
- Modify: `packages/ui/src/primitives/button/ui.button.css`
- Modify: `packages/ui/src/primitives/button/usage.home.html`

- [x] **Step 1: Update button CSS**

Replace `packages/ui/src/primitives/button/ui.button.css` with a scoped October button style that includes:

```css
.vr-button {
  align-items: center;
  background: var(--vr-color-text);
  border: 1px solid transparent;
  border-radius: var(--vr-radius-control);
  color: var(--vr-color-surface-ground);
  cursor: pointer;
  display: inline-flex;
  font: 600 0.875rem/1 var(--vr-font-sans);
  gap: 8px;
  justify-content: center;
  min-height: 36px;
  padding: 0 14px;
  transition:
    background var(--vr-motion-fast),
    border-color var(--vr-motion-fast),
    color var(--vr-motion-fast),
    transform var(--vr-motion-fast);
}

.vr-button-secondary {
  background: var(--vr-color-surface-raised);
  color: var(--vr-color-text);
}

.vr-button-outline {
  background: transparent;
  border-color: var(--vr-color-line);
  color: var(--vr-color-text);
}

.vr-button-ghost {
  background: transparent;
  color: var(--vr-color-text);
}

.vr-button-danger {
  background: var(--vr-color-danger);
  color: white;
}

.vr-button-link {
  background: transparent;
  border-color: transparent;
  color: var(--vr-color-text);
  min-height: auto;
  padding: 0;
  text-decoration: underline;
  text-underline-offset: 4px;
}

.vr-button:hover {
  transform: translateY(-1px);
}

.vr-button:active {
  transform: translateY(0);
}

.vr-button:focus-visible {
  outline: 2px solid var(--vr-color-accent-strong);
  outline-offset: 2px;
}

.vr-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
  transform: none;
}
```

- [x] **Step 2: Update button usage**

Replace `packages/ui/src/primitives/button/usage.home.html` with:

```html
  <vr-button type="button">
    {{ t('home.cta') }}
  </vr-button>
```

- [x] **Step 3: Create the card template files**

Create `packages/ui/src/primitives/card/ui.card.ts`:

```ts
import { signal } from '@vanrot/runtime';

const cardCopy = {
  title: 'Project Alpha',
  description: 'A source-owned October card primitive.',
} as const;

export class UiCard {
  title = signal(cardCopy.title);
  description = signal(cardCopy.description);
}
```

Create `packages/ui/src/primitives/card/ui.card.html`:

```html
<vr-card>
  <h2>{{ title() }}</h2>
  <p>{{ description() }}</p>
</vr-card>
```

Create `packages/ui/src/primitives/card/ui.card.css`:

```css
.vr-card {
  background: var(--vr-color-surface-card);
  border: 1px solid var(--vr-color-line);
  border-radius: var(--vr-radius-card);
  color: var(--vr-color-text);
  display: block;
  padding: 16px;
}

.vr-card-muted {
  background: var(--vr-color-surface-muted);
}

.vr-card-interactive {
  box-shadow: var(--vr-shadow-2);
  cursor: pointer;
  transition:
    border-color var(--vr-motion-fast),
    box-shadow var(--vr-motion-fast),
    transform var(--vr-motion-fast);
}

.vr-card-interactive:hover {
  border-color: var(--vr-color-line-strong);
  transform: translateY(-1px);
}
```

Create `packages/ui/src/primitives/card/ui.card.test.ts`:

```ts
// @vitest-environment jsdom

import { testComponent } from '@vanrot/testing';
import { UiCard } from './ui.card.ts';

testComponent(UiCard).can('render its title', function (screen) {
  screen.expect.text('Project Alpha');
});
```

Create `packages/ui/src/primitives/card/usage.home.html`:

```html
  <vr-card>
    <h2>{{ t('home.title') }}</h2>
    <p>{{ t('home.subtitle') }}</p>
  </vr-card>
```

- [x] **Step 4: Create the badge template files**

Create `packages/ui/src/primitives/badge/ui.badge.ts`:

```ts
import { signal } from '@vanrot/runtime';

const badgeCopy = {
  label: 'Live',
} as const;

export class UiBadge {
  label = signal(badgeCopy.label);
}
```

Create `packages/ui/src/primitives/badge/ui.badge.html`:

```html
<vr-badge>
  {{ label() }}
</vr-badge>
```

Create `packages/ui/src/primitives/badge/ui.badge.css`:

```css
.vr-badge {
  align-items: center;
  background: var(--vr-color-text);
  border: 1px solid transparent;
  border-radius: 999px;
  color: var(--vr-color-surface-ground);
  display: inline-flex;
  font: 600 0.75rem/1 var(--vr-font-sans);
  min-height: 24px;
  padding: 0 9px;
}

.vr-badge-secondary {
  background: var(--vr-color-surface-raised);
  color: var(--vr-color-text);
}

.vr-badge-success {
  background: color-mix(in srgb, var(--vr-color-success) 16%, transparent);
  border-color: color-mix(in srgb, var(--vr-color-success) 28%, transparent);
  color: var(--vr-color-success-strong);
}

.vr-badge-warning {
  background: color-mix(in srgb, var(--vr-color-warning) 16%, transparent);
  border-color: color-mix(in srgb, var(--vr-color-warning) 28%, transparent);
  color: var(--vr-color-warning-strong);
}

.vr-badge-danger {
  background: color-mix(in srgb, var(--vr-color-danger) 16%, transparent);
  border-color: color-mix(in srgb, var(--vr-color-danger) 28%, transparent);
  color: var(--vr-color-danger-strong);
}

.vr-badge-outline {
  background: transparent;
  border-color: var(--vr-color-line);
  color: var(--vr-color-text);
}
```

Create `packages/ui/src/primitives/badge/ui.badge.test.ts`:

```ts
// @vitest-environment jsdom

import { testComponent } from '@vanrot/testing';
import { UiBadge } from './ui.badge.ts';

testComponent(UiBadge).can('render its label', function (screen) {
  screen.expect.text('Live');
});
```

Create `packages/ui/src/primitives/badge/usage.home.html`:

```html
  <vr-badge variant="success">
    {{ t('home.status') }}
  </vr-badge>
```

- [x] **Step 5: Create avatar, alert, loader, skeleton, and separator templates**

Create these files:

```text
packages/ui/src/primitives/avatar/ui.avatar.ts
packages/ui/src/primitives/avatar/ui.avatar.html
packages/ui/src/primitives/avatar/ui.avatar.css
packages/ui/src/primitives/avatar/ui.avatar.test.ts
packages/ui/src/primitives/avatar/usage.home.html
packages/ui/src/primitives/alert/ui.alert.ts
packages/ui/src/primitives/alert/ui.alert.html
packages/ui/src/primitives/alert/ui.alert.css
packages/ui/src/primitives/alert/ui.alert.test.ts
packages/ui/src/primitives/alert/usage.home.html
packages/ui/src/primitives/loader/ui.loader.ts
packages/ui/src/primitives/loader/ui.loader.html
packages/ui/src/primitives/loader/ui.loader.css
packages/ui/src/primitives/loader/ui.loader.test.ts
packages/ui/src/primitives/loader/usage.home.html
packages/ui/src/primitives/skeleton/ui.skeleton.ts
packages/ui/src/primitives/skeleton/ui.skeleton.html
packages/ui/src/primitives/skeleton/ui.skeleton.css
packages/ui/src/primitives/skeleton/ui.skeleton.test.ts
packages/ui/src/primitives/skeleton/usage.home.html
packages/ui/src/primitives/separator/ui.separator.ts
packages/ui/src/primitives/separator/ui.separator.html
packages/ui/src/primitives/separator/ui.separator.css
packages/ui/src/primitives/separator/ui.separator.test.ts
packages/ui/src/primitives/separator/usage.home.html
```

The TypeScript files must export these classes:

```ts
export class UiAvatar {}
export class UiAlert {}
export class UiLoader {}
export class UiSkeleton {}
export class UiSeparator {}
```

Each class should follow the existing button/card asset style by exposing only demo copy through `signal()`. Each test file should import its matching class and assert one visible text value with `testComponent()`. Each CSS file must include its base class and every non-default variant class:

```text
avatar: .vr-avatar, .vr-avatar-soft, .vr-avatar-outline
alert: .vr-alert, .vr-alert-success, .vr-alert-warning, .vr-alert-danger
loader: .vr-loader, .vr-loader-dots, .vr-loader-bar
skeleton: .vr-skeleton, .vr-skeleton-avatar, .vr-skeleton-card, .vr-skeleton-block
separator: .vr-separator, .vr-separator-vertical
```

The HTML files must use these exact selectors:

```html
<vr-avatar>VR</vr-avatar>
<vr-alert variant="info">Heads up</vr-alert>
<vr-loader aria-label="Loading"></vr-loader>
<vr-skeleton></vr-skeleton>
<vr-separator></vr-separator>
```

The usage files must also contain the matching selector so `assets.test.ts` can verify them.

- [x] **Step 6: Run UI package tests**

Run:

```bash
pnpm --filter @vanrot/ui test -- tests/metadata.test.ts tests/assets.test.ts
```

Expected: PASS.

## Task 5: Add CLI Red Tests For Core Primitives

**Files:**

- Modify: `packages/cli/tests/add.test.ts`

- [x] **Step 1: Add a failing test for `vr add card`**

Append this test beside the current add UI tests:

```ts
it('adds a Phase 16B card primitive', async () => {
  const project = await createTestProject();

  const result = await runCli(project.cwd, ['add', 'card']);

  expect(result.exitCode).toBe(0);
  await expect(readFile(join(project.cwd, 'src/ui/card/ui.card.ts'), 'utf8')).resolves.toContain(
    'export class UiCard',
  );
  await expect(readFile(join(project.cwd, 'src/ui/card/ui.card.html'), 'utf8')).resolves.toContain(
    '<vr-card>',
  );
  await expect(readFile(join(project.cwd, 'src/ui/card/ui.card.css'), 'utf8')).resolves.toContain(
    '.vr-card',
  );
  await expect(readFile(join(project.cwd, 'src/styles/vanrot-ui.css'), 'utf8')).resolves.toContain(
    "@import '../ui/card/ui.card.css';",
  );
});
```

- [x] **Step 2: Add a failing table test for all supported primitives**

Append:

```ts
it.each([
  ['button', 'UiButton'],
  ['card', 'UiCard'],
  ['badge', 'UiBadge'],
  ['avatar', 'UiAvatar'],
  ['alert', 'UiAlert'],
  ['loader', 'UiLoader'],
  ['skeleton', 'UiSkeleton'],
  ['separator', 'UiSeparator'],
])('adds the %s primitive from the registry', async (primitive, className) => {
  const project = await createTestProject();

  const result = await runCli(project.cwd, ['add', primitive]);

  expect(result.exitCode).toBe(0);
  await expect(
    readFile(join(project.cwd, 'src/ui', primitive, `ui.${primitive}.ts`), 'utf8'),
  ).resolves.toContain(`export class ${className}`);
  await expect(
    readFile(join(project.cwd, 'src/ui', primitive, `ui.${primitive}.html`), 'utf8'),
  ).resolves.toContain(`<vr-${primitive}`);
});
```

- [x] **Step 3: Add a failing test for local prefix support**

Append:

```ts
it('adds a locally prefixed Phase 16B primitive', async () => {
  const project = await createTestProject();

  const result = await runCli(project.cwd, ['add', 'profile', 'avatar', '--test']);

  expect(result.exitCode).toBe(0);
  await expect(
    readFile(join(project.cwd, 'src/ui/avatar/profile.avatar.ts'), 'utf8'),
  ).resolves.toContain('export class ProfileAvatar');
  await expect(
    readFile(join(project.cwd, 'src/ui/avatar/profile.avatar.test.ts'), 'utf8'),
  ).resolves.toContain('./profile.avatar');
  await expect(readFile(join(project.cwd, 'src/styles/vanrot-ui.css'), 'utf8')).resolves.toContain(
    "@import '../ui/avatar/profile.avatar.css';",
  );
});
```

- [x] **Step 4: Update the unsupported primitive expectation**

Change the supported primitive message assertion so it expects:

```ts
Supported UI primitives: button, card, badge, avatar, alert, loader, skeleton, separator
```

- [x] **Step 5: Run the CLI add tests and confirm they fail**

Run:

```bash
pnpm --filter @vanrot/cli test -- tests/add.test.ts
```

Expected: FAIL because CLI add still only supports button.

## Task 6: Implement Registry-Driven CLI Add

**Files:**

- Modify: `packages/cli/src/add/ui-assets.ts`
- Modify: `packages/cli/src/add/add-ui.ts`

- [x] **Step 1: Replace button-only asset rendering with generic rendering**

In `packages/cli/src/add/ui-assets.ts`, replace `RenderButtonFilesOptions` and `renderButtonFiles()` with:

```ts
export interface RenderUiPrimitiveFilesOptions {
  includeTest?: boolean;
}

export async function renderUiPrimitiveFiles(
  primitive: UiPrimitiveType,
  prefix: string,
  options: RenderUiPrimitiveFilesOptions = {},
): Promise<RenderedUiFile[]> {
  const metadata = uiPrimitive[primitive];
  const asset = uiAssetUrl[primitive];
  const [typescript, html, css] = await Promise.all([
    readAsset(asset.typescript),
    readAsset(asset.html),
    readAsset(asset.css),
  ]);
  const className = `${toPascalCase(prefix)}${toPascalCase(primitive)}`;
  const files: RenderedUiFile[] = [
    {
      path: `${metadata.directory}/${prefix}.${primitive}.ts`,
      content: renamePrimitiveSymbol(typescript, primitive, className),
    },
    {
      path: `${metadata.directory}/${prefix}.${primitive}.html`,
      content: html,
    },
    {
      path: `${metadata.directory}/${prefix}.${primitive}.css`,
      content: css,
    },
  ];

  if (options.includeTest === true) {
    const test = await readAsset(asset.test);
    files.push({
      path: `${metadata.directory}/${prefix}.${primitive}.test.ts`,
      content: renamePrimitiveFilePrefix(
        renamePrimitiveSymbol(test, primitive, className),
        primitive,
        prefix,
      ),
    });
  }

  return files;
}
```

- [x] **Step 2: Add generic usage and style helpers**

Replace `readHomeButtonUsage()` and `buttonStyleImport()` with:

```ts
export async function readPrimitiveHomeUsage(primitive: UiPrimitiveType): Promise<string> {
  return readAsset(uiAssetUrl[primitive].homeUsage);
}

export function primitiveStyleImport(primitive: UiPrimitiveType, prefix: string): string {
  return `@import '../ui/${primitive}/${prefix}.${primitive}.css';`;
}
```

- [x] **Step 3: Add generic rename helpers**

Replace the button-specific rename functions with:

```ts
function renamePrimitiveSymbol(
  source: string,
  primitive: UiPrimitiveType,
  className: string,
): string {
  const defaultClassName = `${toPascalCase(defaultUiPrefix)}${toPascalCase(primitive)}`;

  if (className === defaultClassName) {
    return source;
  }

  return source.replaceAll(defaultClassName, className);
}

function renamePrimitiveFilePrefix(
  source: string,
  primitive: UiPrimitiveType,
  prefix: string,
): string {
  if (prefix === defaultUiPrefix) {
    return source;
  }

  return source.replaceAll(`./${defaultUiPrefix}.${primitive}`, `./${prefix}.${primitive}`);
}
```

- [x] **Step 4: Update imports in `add-ui.ts`**

Use:

```ts
import { defaultUiPrefix, uiPrimitiveOrder, uiPrimitiveType, type UiPrimitiveType } from '@vanrot/ui';
import {
  primitiveStyleImport,
  readPrimitiveHomeUsage,
  readTokenCss,
  readVanrotStylesCss,
  renderUiPrimitiveFiles,
} from './ui-assets.js';
```

- [x] **Step 5: Add the supported primitive guard**

Add:

```ts
function isSupportedUiPrimitive(primitive: string): primitive is UiPrimitiveType {
  return uiPrimitiveOrder.some((candidate) => candidate === primitive);
}

function supportedUiPrimitiveList(): string {
  return uiPrimitiveOrder.join(', ');
}
```

- [x] **Step 6: Replace the button-only unsupported branch**

Use:

```ts
if (!isSupportedUiPrimitive(request.primitive)) {
  context.reporter.error(
    `Unsupported UI primitive: ${request.primitive}`,
    `Supported UI primitives: ${supportedUiPrimitiveList()}`,
  );
  return fail();
}
```

- [x] **Step 7: Replace button-only rendering calls**

Replace `renderButtonFiles`, `readHomeButtonUsage`, and `buttonStyleImport` usage with:

```ts
const files = await renderUiPrimitiveFiles(request.primitive, request.prefix, {
  includeTest: request.includeTest,
});
const usage = await readPrimitiveHomeUsage(request.primitive);
...
await ensureLineInFile(
  context.cwd,
  uiAppFile.styleEntry,
  primitiveStyleImport(request.primitive, request.prefix),
);
```

- [x] **Step 8: Update CLI usage text**

Change usage errors to:

```ts
context.reporter.error(
  `Usage: vr add <primitive> [--test]`,
  `Or use: vr add <local-prefix> <primitive> [--test]`,
  `Supported UI primitives: ${supportedUiPrimitiveList()}`,
);
```

- [x] **Step 9: Run CLI add tests**

Run:

```bash
pnpm --filter @vanrot/cli test -- tests/add.test.ts
```

Expected: PASS.

## Task 7: Add Compiler Red Tests For Phase 16B Primitives

**Files:**

- Modify: `packages/compiler/tests/codegen/generate-component.test.ts`

- [x] **Step 1: Add a failing lowering table test**

Append:

```ts
it.each([
  ['vr-button', 'button', 'vr-button'],
  ['vr-card', 'article', 'vr-card'],
  ['vr-badge', 'span', 'vr-badge'],
  ['vr-avatar', 'span', 'vr-avatar'],
  ['vr-alert', 'section', 'vr-alert'],
  ['vr-loader', 'span', 'vr-loader'],
  ['vr-skeleton', 'span', 'vr-skeleton'],
  ['vr-separator', 'hr', 'vr-separator'],
])('lowers <%s> into <%s>', async (tagName, nativeTagName, baseClass) => {
  const result = await compileInlineTemplate(`<${tagName}>Content</${tagName}>`);

  expect(result.diagnostics).toEqual([]);
  expect(result.code).toContain(`document.createElement(${JSON.stringify(nativeTagName)})`);
  expect(result.code).toContain(JSON.stringify(baseClass));
});
```

- [x] **Step 2: Add a failing variant class test**

Append:

```ts
it('lowers UI primitive variants into classes without keeping the variant attribute', async () => {
  const result = await compileInlineTemplate(
    '<vr-badge variant="success" class="tracking-wide">Passed</vr-badge>',
  );

  expect(result.diagnostics).toEqual([]);
  expect(result.code).toContain('"vr-badge vr-badge-success tracking-wide"');
  expect(result.code).not.toContain('setAttribute("variant"');
});
```

- [x] **Step 3: Add a failing invalid variant diagnostic test**

Append:

```ts
it('diagnoses invalid UI primitive variants', async () => {
  const result = await compileInlineTemplate('<vr-button variant="loud">Save</vr-button>');

  expect(result.diagnostics).toEqual([
    expect.objectContaining({
      code: 'VR019',
      severity: 'error',
      message: 'Invalid variant "loud" for <vr-button>. Supported variants: default, secondary, outline, ghost, danger, link.',
    }),
  ]);
});
```

- [x] **Step 4: Add failing accessibility default tests**

Append:

```ts
it('hides decorative loaders and skeletons when no accessible label is provided', async () => {
  const result = await compileInlineTemplate('<vr-loader></vr-loader><vr-skeleton></vr-skeleton>');

  expect(result.diagnostics).toEqual([]);
  expect(result.code).toContain('.setAttribute("aria-hidden", "true")');
});

it('preserves labelled loaders as announced loading states', async () => {
  const result = await compileInlineTemplate('<vr-loader aria-label="Loading report"></vr-loader>');

  expect(result.diagnostics).toEqual([]);
  expect(result.code).toContain('.setAttribute("aria-label", "Loading report")');
  expect(result.code).not.toContain('.setAttribute("aria-hidden", "true")');
});

it('sets separator orientation from its variant', async () => {
  const result = await compileInlineTemplate('<vr-separator variant="vertical"></vr-separator>');

  expect(result.diagnostics).toEqual([]);
  expect(result.code).toContain('.setAttribute("role", "separator")');
  expect(result.code).toContain('.setAttribute("aria-orientation", "vertical")');
});
```

- [x] **Step 5: Run compiler tests and confirm they fail**

Run:

```bash
pnpm --filter @vanrot/compiler test -- tests/codegen/generate-component.test.ts
```

Expected: FAIL because compiler metadata, variant handling, and diagnostic `VR019` do not exist yet.

## Task 8: Implement Compiler Primitive Lowering

**Files:**

- Modify: `packages/compiler/src/api/types.ts`
- Modify: `packages/compiler/src/diagnostics/catalog.ts`
- Modify: `packages/compiler/src/codegen/ui-elements.ts`
- Modify: `packages/compiler/src/codegen/generate-component.ts`

- [x] **Step 1: Add compile feature names**

In `packages/compiler/src/api/types.ts`, add these union members near `ui-button`:

```ts
  | 'ui-card'
  | 'ui-badge'
  | 'ui-avatar'
  | 'ui-alert'
  | 'ui-loader'
  | 'ui-skeleton'
  | 'ui-separator'
```

- [x] **Step 2: Add diagnostic code `VR019`**

Add `'VR019'` to `DiagnosticCode`.

In `packages/compiler/src/diagnostics/catalog.ts`, add:

```ts
  VR019: {
    message: 'Invalid Vanrot UI primitive variant.',
    suggestion: 'Use a variant listed by the primitive metadata in @vanrot/ui.',
    docsPath: '/docs/ui/primitives',
  },
```

- [x] **Step 3: Expand `CompilerUiElement`**

Update `packages/compiler/src/codegen/ui-elements.ts`:

```ts
export interface CompilerUiElement {
  tagName: string;
  nativeTagName: string;
  baseClass: string;
  defaultVariant: string;
  variants: readonly string[];
  feature: CompileFeature;
}
```

- [x] **Step 4: Replace `compilerUiElement` with the Phase 16B map**

Use this map:

```ts
export const compilerUiElement = {
  button: {
    tagName: 'vr-button',
    nativeTagName: 'button',
    baseClass: 'vr-button',
    defaultVariant: 'default',
    variants: ['default', 'secondary', 'outline', 'ghost', 'danger', 'link'],
    feature: 'ui-button',
  },
  card: {
    tagName: 'vr-card',
    nativeTagName: 'article',
    baseClass: 'vr-card',
    defaultVariant: 'default',
    variants: ['default', 'muted', 'interactive'],
    feature: 'ui-card',
  },
  badge: {
    tagName: 'vr-badge',
    nativeTagName: 'span',
    baseClass: 'vr-badge',
    defaultVariant: 'default',
    variants: ['default', 'secondary', 'success', 'warning', 'danger', 'outline'],
    feature: 'ui-badge',
  },
  avatar: {
    tagName: 'vr-avatar',
    nativeTagName: 'span',
    baseClass: 'vr-avatar',
    defaultVariant: 'default',
    variants: ['default', 'soft', 'outline'],
    feature: 'ui-avatar',
  },
  alert: {
    tagName: 'vr-alert',
    nativeTagName: 'section',
    baseClass: 'vr-alert',
    defaultVariant: 'info',
    variants: ['info', 'success', 'warning', 'danger'],
    feature: 'ui-alert',
  },
  loader: {
    tagName: 'vr-loader',
    nativeTagName: 'span',
    baseClass: 'vr-loader',
    defaultVariant: 'spinner',
    variants: ['spinner', 'dots', 'bar'],
    feature: 'ui-loader',
  },
  skeleton: {
    tagName: 'vr-skeleton',
    nativeTagName: 'span',
    baseClass: 'vr-skeleton',
    defaultVariant: 'text',
    variants: ['text', 'avatar', 'card', 'block'],
    feature: 'ui-skeleton',
  },
  separator: {
    tagName: 'vr-separator',
    nativeTagName: 'hr',
    baseClass: 'vr-separator',
    defaultVariant: 'horizontal',
    variants: ['horizontal', 'vertical'],
    feature: 'ui-separator',
  },
} as const satisfies Record<string, CompilerUiElement>;
```

- [x] **Step 5: Add invalid variant message helper**

Add to `ui-elements.ts`:

```ts
export function createInvalidUiVariantMessage(
  tagName: string,
  variant: string,
  variants: readonly string[],
): string {
  return `Invalid variant "${variant}" for <${tagName}>. Supported variants: ${variants.join(', ')}.`;
}
```

- [x] **Step 6: Update `generate-component.ts` imports**

Import `createInvalidUiVariantMessage`.

- [x] **Step 7: Replace `generateUiElementClass` with variant-aware class handling**

Use this shape:

```ts
function generateUiElementClass(
  node: ElementNode,
  elementName: string,
  state: GenerateState,
  uiElement: CompilerUiElement,
): string {
  const classAttribute = node.attributes.find((attribute) => attribute.name === 'class');
  const variantAttribute = node.attributes.find((attribute) => attribute.name === 'variant');
  const variant = variantAttribute?.value.trim() ?? uiElement.defaultVariant;

  if (!uiElement.variants.includes(variant)) {
    state.diagnostics.push(
      createDiagnostic(
        'VR019',
        'error',
        createInvalidUiVariantMessage(uiElement.tagName, variant, uiElement.variants),
        state.templatePath,
      ),
    );
  }

  const variantClass = variant === uiElement.defaultVariant ? '' : `${uiElement.baseClass}-${variant}`;
  const classValue = mergeClassValue(
    [uiElement.baseClass, variantClass].filter((className) => className.length > 0).join(' '),
    classAttribute?.value ?? '',
  );

  state.lines.push(
    `  ${elementName}.setAttribute(${quoteString('class')}, ${quoteString(classValue)});`,
  );

  return variant;
}
```

- [x] **Step 8: Skip the framework-only `variant` attribute**

In the attribute loop inside `generateCompilerUiElement`, skip both `class` and `variant`:

```ts
if (attribute.name === 'class' || attribute.name === 'variant') {
  continue;
}
```

- [x] **Step 9: Add accessibility defaults**

After class generation and before the attribute loop, call:

```ts
generateUiAccessibilityDefaults(node, elementName, state, uiElement, variant);
```

Add:

```ts
function generateUiAccessibilityDefaults(
  node: ElementNode,
  elementName: string,
  state: GenerateState,
  uiElement: CompilerUiElement,
  variant: string,
): void {
  const hasAriaLabel = node.attributes.some((attribute) => attribute.name === 'aria-label');
  const hasRole = node.attributes.some((attribute) => attribute.name === 'role');
  const isDecorativeLoader = uiElement.tagName === 'vr-loader' && !hasAriaLabel && !hasRole;
  const isDecorativeSkeleton = uiElement.tagName === 'vr-skeleton' && !hasAriaLabel && !hasRole;

  if (isDecorativeLoader || isDecorativeSkeleton) {
    state.lines.push(`  ${elementName}.setAttribute(${quoteString('aria-hidden')}, 'true');`);
  }

  if (uiElement.tagName === 'vr-separator') {
    if (!hasRole) {
      state.lines.push(`  ${elementName}.setAttribute(${quoteString('role')}, 'separator');`);
    }

    state.lines.push(
      `  ${elementName}.setAttribute(${quoteString('aria-orientation')}, ${quoteString(variant)});`,
    );
  }
}
```

- [x] **Step 10: Update `generateCompilerUiElement` call site**

Change:

```ts
generateUiElementClass(node.attributes, elementName, state, uiElement.baseClass);
```

to:

```ts
const variant = generateUiElementClass(node, elementName, state, uiElement);
generateUiAccessibilityDefaults(node, elementName, state, uiElement, variant);
```

- [x] **Step 11: Run compiler tests**

Run:

```bash
pnpm --filter @vanrot/compiler test -- tests/codegen/generate-component.test.ts
```

Expected: PASS.

## Task 9: Update Docs And Inventory Red Checks

**Files:**

- Modify: `packages/ui/src/docs/package-inventory.md`
- Modify: `packages/ui/src/docs/guidelines.md`
- Modify: `docs/superpowers/final-tdd-inventory.md`

- [x] **Step 1: Update package inventory docs**

Add a Phase 16B section to `packages/ui/src/docs/package-inventory.md`:

```md
## Phase 16B Core Primitives

October ships these source-owned core primitives:

- `vr-button`
- `vr-card`
- `vr-badge`
- `vr-avatar`
- `vr-alert`
- `vr-loader`
- `vr-skeleton`
- `vr-separator`

Each primitive includes metadata, variants, compiler lowering, CLI add support, scoped CSS, a usage snippet, and a local test template.
```

- [x] **Step 2: Update guidelines docs**

Add:

```md
## Component Documentation Standard

Vanrot component documentation follows the shadcn/ui rhythm: title, preview first, install command, usage, examples, variants, accessibility notes, source ownership, and previous-next links.

The structure is the benchmark, not the branding or text. Vanrot examples use October tokens, `vr-*` semantic tags, `vanrotstyles`, and source-owned component files.
```

- [x] **Step 3: Update final TDD inventory**

Add rows under `@vanrot/ui`, compiler, and command sections for:

```md
| metadata | Phase 16B core primitive registry | Demo-Capable | Covers primitive order, selectors, native tags, docs paths, variants, and production phase metadata. | Phase 16B | Source-of-truth list prevents string drift across UI, CLI, compiler, and docs. |
| command | `vr add <Phase 16B primitive>` | Demo-Capable | Adds app-owned files for button, card, badge, avatar, alert, loader, skeleton, and separator. | Phase 16B | Respects local prefix, `--test`, overwrite policy, and `ui.styles`. |
| compiler | Phase 16B `vr-*` primitive lowering | Demo-Capable | Lowers each core primitive to native markup with base classes, variant classes, and accessibility defaults. | Phase 16B | Keeps runtime light while preserving semantic authoring. |
```

- [x] **Step 4: Run docs checks**

Run:

```bash
pnpm verify:phase-docs
```

Expected: PASS if feature maturity rows are not marked complete yet. If the hook expects plan rows for Phase 16B after implementation, leave Phase 16B incomplete until final verification.

## Task 10: Complete Phase 16B Docs State

**Files:**

- Modify: `docs/superpowers/plans/Phase-16B.md`
- Modify: `docs/superpowers/feature-maturity.md`
- Modify: `docs/superpowers/final-tdd-inventory.md`
- Modify: `docs/vanrot-presentation.html`

- [x] **Step 1: Mark all completed plan steps**

After implementation and verification, change every completed checkbox in this file from:

```md
- [x] **Step
```

to:

```md
- [x] **Step
```

- [x] **Step 2: Update feature maturity Phase 16 rows**

Update `docs/superpowers/feature-maturity.md` so Phase 16B core primitive rows are no longer vague planned work. At minimum:

```md
UI primitive catalog
UI component parameters and variants
Compiler-lowered <vr-button>
CLI vr add button
CLI vr add <local-prefix> button
Typed UI primitive file roles
```

must mention Phase 16B where relevant, with status no weaker than `Demo-Capable` after tests pass. Do not mark the entire Phase 16 UI October row `Production-Ready`; Phase 16C through 16E remain open.

- [x] **Step 3: Update presentation roadmap**

In `docs/vanrot-presentation.html`, update the roadmap so:

```text
Phase 16A = done
Phase 16B = done after implementation
Phase 16C = active or next
```

Keep Phase 17 through Phase 22 post-production/deferred as already decided.

- [x] **Step 4: Run the package-specific verification**

Run:

```bash
pnpm --filter @vanrot/ui test
pnpm --filter @vanrot/cli test -- tests/add.test.ts
pnpm --filter @vanrot/compiler test -- tests/codegen/generate-component.test.ts
```

Expected: all PASS.

- [x] **Step 5: Run full verification**

Run:

```bash
pnpm verify
```

Expected: PASS, including `verify:phase-docs` and runtime size budget.

- [x] **Step 6: Report Git status without staging**

Run:

```bash
git status --short --branch
```

Expected: Phase 16B files are unstaged. Do not run `git add`, `git commit`, or `git push` unless the user explicitly asks.

## Self-Review

- Spec coverage: Covered approved visual direction, shadcn-style docs rhythm, primitive list, variants, app-owned source files, compiler lowering, CLI add flow, accessibility, tests, and phase docs.
- Scope check: Phase 16B stays on core primitives only. Phase 16C, 16D, and 16E remain outside this plan.
- Placeholder scan: No placeholder markers or unowned future implementation notes.
- Type consistency: Primitive names use `UiPrimitiveType`; variants use `uiPrimitiveVariant`; CLI rendering uses `renderUiPrimitiveFiles`; compiler diagnostics use `VR019`.
