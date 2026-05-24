# Phase 16D Layout, Navigation, Media, And Dotted Tokens Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task in the current session. Vanrot rules forbid subagents, parallel agents, worktrees, staging, committing, and pushing unless the user explicitly asks. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the Phase 16D docs-site-first layout, navigation shell, and media primitives while fixing Phase 16B source/docs examples that still use string attributes for Vanrot-owned finite tokens.

**Architecture:** Keep `@vanrot/ui` as the source of truth for primitive names, selectors, native tags, base classes, token groups, docs paths, and variants. Keep `@vanrot/compiler` responsible for compile-time dotted token attributes such as `variant.danger`, `tone.success`, `cols.3`, and `gap.4`. Keep `apps/vanrot-site` visually unchanged while replacing the current docs shell markup with Vanrot primitives where possible.

**Tech Stack:** TypeScript, Vitest, Vanrot compiler codegen, `@vanrot/ui`, `vanrotstyles.css`, October tokens, Vanrot site docs pages, local browser verification.

---

## Local Rules For This Plan

- Do not create a branch, worktree, commit, push, or stage files unless the user explicitly asks.
- Do not use subagents or parallel agents.
- Use `Phase-16D.md` naming because this is a numbered Vanrot phase slice.
- Keep UI markup in `.html`, application logic in `.ts`, and styling in scoped `.css`.
- Use source-of-truth modules for route paths, route labels, primitive names, token groups, diagnostic codes, and docs navigation copy.
- Do not redesign the current `apps/vanrot-site` docs shell. The current shell is the visual baseline.
- Use dotted token attributes for Vanrot-owned finite tokens. Keep normal string attributes only for content, URLs, ARIA labels, standard HTML values, and dynamic bindings.
- Run final verification before reporting completion.
- Restart `apps/vanrot-site` on port `3000` before the final response and inspect the relevant pages in the browser.

---

## File Structure

Create:

- `packages/compiler/tests/codegen/ui-token-attributes.test.ts`: red and green tests for dotted token parsing, lowering, duplicate diagnostics, unknown token diagnostics, and Phase 16B token cleanup behavior.
- `packages/compiler/src/codegen/ui-token-attributes.ts`: helper functions for dotted token collection, duplicate detection, unknown token detection, and class token resolution.
- `packages/ui/src/primitives/layout/ui.layout.ts`
- `packages/ui/src/primitives/layout/ui.layout.html`
- `packages/ui/src/primitives/layout/ui.layout.css`
- `packages/ui/src/primitives/layout/ui.layout.test.ts`
- `packages/ui/src/primitives/layout/usage.home.html`
- `packages/ui/src/primitives/container/ui.container.ts`
- `packages/ui/src/primitives/container/ui.container.html`
- `packages/ui/src/primitives/container/ui.container.css`
- `packages/ui/src/primitives/container/ui.container.test.ts`
- `packages/ui/src/primitives/container/usage.home.html`
- `packages/ui/src/primitives/section/ui.section.ts`
- `packages/ui/src/primitives/section/ui.section.html`
- `packages/ui/src/primitives/section/ui.section.css`
- `packages/ui/src/primitives/section/ui.section.test.ts`
- `packages/ui/src/primitives/section/usage.home.html`
- `packages/ui/src/primitives/grid/ui.grid.ts`
- `packages/ui/src/primitives/grid/ui.grid.html`
- `packages/ui/src/primitives/grid/ui.grid.css`
- `packages/ui/src/primitives/grid/ui.grid.test.ts`
- `packages/ui/src/primitives/grid/usage.home.html`
- `packages/ui/src/primitives/stack/ui.stack.ts`
- `packages/ui/src/primitives/stack/ui.stack.html`
- `packages/ui/src/primitives/stack/ui.stack.css`
- `packages/ui/src/primitives/stack/ui.stack.test.ts`
- `packages/ui/src/primitives/stack/usage.home.html`
- `packages/ui/src/primitives/header/ui.header.ts`
- `packages/ui/src/primitives/header/ui.header.html`
- `packages/ui/src/primitives/header/ui.header.css`
- `packages/ui/src/primitives/header/ui.header.test.ts`
- `packages/ui/src/primitives/header/usage.home.html`
- `packages/ui/src/primitives/footer/ui.footer.ts`
- `packages/ui/src/primitives/footer/ui.footer.html`
- `packages/ui/src/primitives/footer/ui.footer.css`
- `packages/ui/src/primitives/footer/ui.footer.test.ts`
- `packages/ui/src/primitives/footer/usage.home.html`
- `packages/ui/src/primitives/sidebar/ui.sidebar.ts`
- `packages/ui/src/primitives/sidebar/ui.sidebar.html`
- `packages/ui/src/primitives/sidebar/ui.sidebar.css`
- `packages/ui/src/primitives/sidebar/ui.sidebar.test.ts`
- `packages/ui/src/primitives/sidebar/usage.home.html`
- `packages/ui/src/primitives/nav/ui.nav.ts`
- `packages/ui/src/primitives/nav/ui.nav.html`
- `packages/ui/src/primitives/nav/ui.nav.css`
- `packages/ui/src/primitives/nav/ui.nav.test.ts`
- `packages/ui/src/primitives/nav/usage.home.html`
- `packages/ui/src/primitives/breadcrumb/ui.breadcrumb.ts`
- `packages/ui/src/primitives/breadcrumb/ui.breadcrumb.html`
- `packages/ui/src/primitives/breadcrumb/ui.breadcrumb.css`
- `packages/ui/src/primitives/breadcrumb/ui.breadcrumb.test.ts`
- `packages/ui/src/primitives/breadcrumb/usage.home.html`
- `packages/ui/src/primitives/img/ui.img.ts`
- `packages/ui/src/primitives/img/ui.img.html`
- `packages/ui/src/primitives/img/ui.img.css`
- `packages/ui/src/primitives/img/ui.img.test.ts`
- `packages/ui/src/primitives/img/usage.home.html`
- `packages/ui/src/primitives/src/ui.src.ts`
- `packages/ui/src/primitives/src/ui.src.html`
- `packages/ui/src/primitives/src/ui.src.css`
- `packages/ui/src/primitives/src/ui.src.test.ts`
- `packages/ui/src/primitives/src/usage.home.html`
- `apps/vanrot-site/src/pages/components/component-layout.page.ts`
- `apps/vanrot-site/src/pages/components/component-layout.page.html`
- `apps/vanrot-site/src/pages/components/component-layout.page.css`
- `apps/vanrot-site/src/pages/components/component-container.page.ts`
- `apps/vanrot-site/src/pages/components/component-container.page.html`
- `apps/vanrot-site/src/pages/components/component-container.page.css`
- `apps/vanrot-site/src/pages/components/component-section.page.ts`
- `apps/vanrot-site/src/pages/components/component-section.page.html`
- `apps/vanrot-site/src/pages/components/component-section.page.css`
- `apps/vanrot-site/src/pages/components/component-grid.page.ts`
- `apps/vanrot-site/src/pages/components/component-grid.page.html`
- `apps/vanrot-site/src/pages/components/component-grid.page.css`
- `apps/vanrot-site/src/pages/components/component-stack.page.ts`
- `apps/vanrot-site/src/pages/components/component-stack.page.html`
- `apps/vanrot-site/src/pages/components/component-stack.page.css`
- `apps/vanrot-site/src/pages/components/component-header.page.ts`
- `apps/vanrot-site/src/pages/components/component-header.page.html`
- `apps/vanrot-site/src/pages/components/component-header.page.css`
- `apps/vanrot-site/src/pages/components/component-footer.page.ts`
- `apps/vanrot-site/src/pages/components/component-footer.page.html`
- `apps/vanrot-site/src/pages/components/component-footer.page.css`
- `apps/vanrot-site/src/pages/components/component-sidebar.page.ts`
- `apps/vanrot-site/src/pages/components/component-sidebar.page.html`
- `apps/vanrot-site/src/pages/components/component-sidebar.page.css`
- `apps/vanrot-site/src/pages/components/component-nav.page.ts`
- `apps/vanrot-site/src/pages/components/component-nav.page.html`
- `apps/vanrot-site/src/pages/components/component-nav.page.css`
- `apps/vanrot-site/src/pages/components/component-breadcrumb.page.ts`
- `apps/vanrot-site/src/pages/components/component-breadcrumb.page.html`
- `apps/vanrot-site/src/pages/components/component-breadcrumb.page.css`
- `apps/vanrot-site/src/pages/components/component-img.page.ts`
- `apps/vanrot-site/src/pages/components/component-img.page.html`
- `apps/vanrot-site/src/pages/components/component-img.page.css`
- `apps/vanrot-site/src/pages/components/component-src.page.ts`
- `apps/vanrot-site/src/pages/components/component-src.page.html`
- `apps/vanrot-site/src/pages/components/component-src.page.css`

Modify:

- `packages/compiler/src/api/types.ts`: add dotted token diagnostic codes.
- `packages/compiler/src/diagnostics/catalog.ts`: add dotted token diagnostic messages, suggestions, and docs paths.
- `packages/compiler/src/codegen/ui-elements.ts`: add token-group metadata to compiler UI elements and messages for dotted token validation.
- `packages/compiler/src/codegen/generate-component.ts`: consume dotted token attributes, skip generated-only attributes, and preserve normal content attributes.
- `packages/ui/src/metadata.ts`: add Phase 16D primitive metadata and token group source-of-truth data.
- `packages/ui/src/index.ts`: export any new metadata helpers.
- `packages/ui/tests/metadata.test.ts`: assert Phase 16D primitive and token group metadata.
- `packages/ui/tests/assets.test.ts`: assert Phase 16D primitive files and guard against string token attributes in Vanrot-owned examples.
- `packages/ui/src/primitives/*/usage.home.html`: convert Phase 16B examples from string token attributes to dotted token attributes.
- `apps/vanrot-site/src/routes.ts`: add 16D component routes and imports.
- `apps/vanrot-site/src/docs/component-docs.ts`: add 16D component docs metadata.
- `apps/vanrot-site/src/docs/site-navigation.ts`: add 16D component sidebar links in alphabetical order.
- `apps/vanrot-site/src/pages/components/*.page.html`: convert Phase 16B code snippets from string token attributes to dotted token attributes and adopt shell primitives where safe.
- `apps/vanrot-site/src/pages/components/*.page.css`: preserve current shell/component docs visuals while transferring structural ownership where needed.
- `apps/vanrot-site/tests/site-pages.test.ts`: add Phase 16D pages, shell adoption assertions, dotted token snippet assertions, and no-string-token guards.
- `docs/superpowers/specs/Phase-16.md`: move `<vr-tabs>` out of 16D and into 16F if still listed in 16D.
- `docs/superpowers/specs/Phase-16D.md`: update if the plan settles token group names differently from the spec examples.
- `docs/superpowers/feature-maturity.md`: update Phase 16D status when implementation completes.
- `docs/superpowers/final-tdd-inventory.md`: add Phase 16D primitive, compiler, site, docs, and visual verification coverage.
- `docs/vanrot-presentation.html`: mark Phase 16D complete only after verification and make the next pending phase active.
- `docs/superpowers/plans/Phase-16D.md`: tick completed steps during execution.

---

## Primitive Token Groups

Use this first minimal token set unless implementation evidence shows a smaller set is enough.

Phase 16B cleanup token groups:

- `<vr-button>`: `variant.default`, `variant.secondary`, `variant.outline`, `variant.ghost`, `variant.danger`, `variant.link`
- `<vr-card>`: `variant.default`, `variant.muted`, `variant.interactive`
- `<vr-badge>`: `tone.default`, `tone.secondary`, `tone.success`, `tone.warning`, `tone.danger`, `tone.outline`
- `<vr-avatar>`: `variant.default`, `variant.soft`, `variant.outline`
- `<vr-alert>`: `tone.info`, `tone.success`, `tone.warning`, `tone.danger`
- `<vr-loader>`: `variant.spinner`, `variant.dots`, `variant.bar`
- `<vr-skeleton>`: `variant.text`, `variant.avatar`, `variant.card`, `variant.block`
- `<vr-separator>`: `orientation.horizontal`, `orientation.vertical`

Phase 16D token groups:

- `<vr-container>`: `size.sm`, `size.md`, `size.lg`, `size.xl`
- `<vr-section>`: `spacing.sm`, `spacing.md`, `spacing.lg`
- `<vr-grid>`: `cols.1`, `cols.2`, `cols.3`, `cols.4`, `cols.6`, `cols.12`, plus `gap.0`, `gap.1`, `gap.2`, `gap.3`, `gap.4`, `gap.5`, `gap.6`, `gap.8`
- `<vr-stack>`: `gap.0`, `gap.1`, `gap.2`, `gap.3`, `gap.4`, `gap.5`, `gap.6`, `gap.8`
- `<vr-sidebar>`: `placement.left`, `placement.right`

No first-pass token groups:

- `<vr-layout>`
- `<vr-header>`
- `<vr-footer>`
- `<vr-nav>`
- `<vr-breadcrumb>`
- `<vr-img>`
- `<vr-src>`

Normal string attributes remain valid for content and platform values:

```html
<vr-img src="/images/product.png" alt="Product image">
<vr-nav aria-label="Components">
<vr-button type="button">
```

---

## Task 1: Write Dotted Token Red Tests

**Files:**

- Create: `packages/compiler/tests/codegen/ui-token-attributes.test.ts`
- Modify: `packages/ui/tests/assets.test.ts`
- Modify: `apps/vanrot-site/tests/site-pages.test.ts`

- [ ] **Step 1: Add compiler red tests for Phase 16B dotted token lowering**

Create `packages/compiler/tests/codegen/ui-token-attributes.test.ts` with tests that compile inline components through the existing compiler API.

The tests must assert:

```html
<vr-button variant.danger type="button">Delete</vr-button>
```

lowers to a native button with:

- `class` containing `vr-button`;
- `class` containing `vr-button-danger`;
- `type="button"` preserved;
- no emitted `variant.danger` attribute.

Add the equivalent assertions for:

```html
<vr-badge tone.success>Live</vr-badge>
<vr-alert tone.warning>Careful</vr-alert>
<vr-separator orientation.vertical></vr-separator>
```

Expected first run: FAIL because dotted token attributes are not yet recognized by the compiler.

- [ ] **Step 2: Add compiler red tests for Phase 16D dotted token lowering**

In the same test file, add tests for:

```html
<vr-container size.lg>
  <vr-section spacing.md>
    <vr-grid cols.3 gap.4>
      <vr-stack gap.3>Content</vr-stack>
    </vr-grid>
  </vr-section>
</vr-container>
```

Assert generated output contains:

- `vr-container`;
- `vr-container-lg`;
- `vr-section`;
- `vr-section-md`;
- `vr-grid`;
- `vr-grid-cols-3`;
- `gap-4` or `vr-grid-gap-4`, whichever class name is chosen in Task 3;
- `vr-stack`;
- `gap-3` or `vr-stack-gap-3`, whichever class name is chosen in Task 3.

Expected first run: FAIL because 16D primitives and token groups do not exist yet.

- [ ] **Step 3: Add compiler red tests for duplicate token diagnostics**

Add tests that compile:

```html
<vr-grid cols.3 cols.4></vr-grid>
<vr-button variant.danger variant.success></vr-button>
```

Assert diagnostics include:

- `VR_UI_DUPLICATE_TOKEN_ATTRIBUTE`;
- the affected tag name;
- the token group name;
- both conflicting token attributes.

Expected first run: FAIL because the diagnostic code does not exist yet.

- [ ] **Step 4: Add compiler red tests for unknown token diagnostics**

Add tests that compile:

```html
<vr-badge tone.happy>Live</vr-badge>
<vr-grid gap.big></vr-grid>
<vr-nav tone.success></vr-nav>
```

Assert diagnostics include:

- `VR_UI_UNKNOWN_TOKEN_ATTRIBUTE`;
- the affected tag name;
- the invalid token attribute;
- valid options where practical.

Expected first run: FAIL because the diagnostic code does not exist yet.

- [ ] **Step 5: Add UI asset guard for 16B string token attributes**

In `packages/ui/tests/assets.test.ts`, add a guard that scans `packages/ui/src/primitives/*/usage.home.html` and `packages/ui/src/primitives/*/ui.*.html` for Vanrot-owned finite token string attributes:

```text
variant="
tone="
orientation="
size="
spacing="
cols="
gap="
placement="
```

The guard must allow standard attributes such as `type="button"`, `aria-label="..."`, `src="..."`, and `alt="..."`.

Expected first run: FAIL because current Phase 16B usage files still include examples such as `variant="default"`.

- [ ] **Step 6: Add site docs guard for string token examples**

In `apps/vanrot-site/tests/site-pages.test.ts`, add a guard that scans component docs HTML code snippets and fails when a `vr-*` example uses finite Vanrot token string attributes such as:

```html
<vr-button variant="danger">
<vr-badge tone="success">
<vr-grid cols="3">
```

Expected first run: FAIL until docs snippets are converted to dotted token syntax.

- [ ] **Step 7: Run the focused red tests**

Run:

```bash
pnpm --filter @vanrot/compiler test -- tests/codegen/ui-token-attributes.test.ts
pnpm --filter @vanrot/ui test -- tests/assets.test.ts
pnpm --filter @vanrot/vanrot-site test -- tests/site-pages.test.ts
```

Expected: FAIL for the new red tests only. If unrelated tests fail, record them before changing implementation.

---

## Task 2: Implement Compiler Dotted Token Infrastructure

**Files:**

- Modify: `packages/compiler/src/api/types.ts`
- Modify: `packages/compiler/src/diagnostics/catalog.ts`
- Create: `packages/compiler/src/codegen/ui-token-attributes.ts`
- Modify: `packages/compiler/src/codegen/ui-elements.ts`
- Modify: `packages/compiler/src/codegen/generate-component.ts`

- [ ] **Step 1: Add diagnostic codes**

In `packages/compiler/src/api/types.ts`, add:

```ts
| 'VR_UI_DUPLICATE_TOKEN_ATTRIBUTE'
| 'VR_UI_UNKNOWN_TOKEN_ATTRIBUTE'
```

In `packages/compiler/src/diagnostics/catalog.ts`, add catalog entries:

- `VR_UI_DUPLICATE_TOKEN_ATTRIBUTE`
  - message: `Duplicate Vanrot UI token attribute.`
  - suggestion: `Use only one dotted token per token group.`
  - docsPath: `/docs/ui/dotted-token-attributes`
- `VR_UI_UNKNOWN_TOKEN_ATTRIBUTE`
  - message: `Unknown Vanrot UI token attribute.`
  - suggestion: `Use a dotted token supported by the primitive metadata in @vanrot/ui.`
  - docsPath: `/docs/ui/dotted-token-attributes`

- [ ] **Step 2: Add token attribute helper types**

Create `packages/compiler/src/codegen/ui-token-attributes.ts`.

Define:

```ts
export interface UiTokenGroup {
  group: string;
  values: readonly string[];
  defaultValue: string;
  classPrefix: string;
  omitDefaultClass: boolean;
}

export interface UiResolvedToken {
  group: string;
  value: string;
  attributeName: string;
  className: string | null;
}
```

Add helpers:

- `isDottedTokenAttribute(name: string): boolean`
- `parseDottedTokenAttribute(name: string): { group: string; value: string } | null`
- `collectUiTokenAttributes(node, state, uiElement): UiResolvedToken[]`
- `isGeneratedUiTokenAttribute(attributeName: string, uiElement): boolean`

The helper must:

- recognize only names matching `group.value`;
- reject duplicate groups;
- reject unknown groups;
- reject unknown values;
- return diagnostics instead of throwing;
- preserve source spans from the original attribute.

- [ ] **Step 3: Extend compiler UI metadata**

In `packages/compiler/src/codegen/ui-elements.ts`, extend `CompilerUiElement` with:

```ts
tokenGroups: readonly UiTokenGroup[];
```

Build `tokenGroups` from `@vanrot/ui` metadata rather than hard-coded compiler-only lists.

Keep `defaultVariant` and `variants` temporarily if other code still depends on them, but route variant class resolution through token groups.

- [ ] **Step 4: Update UI element generation**

In `packages/compiler/src/codegen/generate-component.ts`:

- call `collectUiTokenAttributes()` inside `generateCompilerUiElement`;
- merge token classes into the generated class string;
- skip `class`, old string token attributes, and generated dotted token attributes when forwarding attributes;
- keep standard attributes such as `type`, `aria-label`, `src`, and `alt`;
- keep `class` merging behavior exactly as it works today.

Important: dotted tokens are compile-time only. Do not generate browser-side parsing logic.

- [ ] **Step 5: Keep legacy string variant handling only as temporary input, not as source style**

If the existing compiler still accepts `variant="danger"` during this task, it must be treated as a compatibility path only.

The repo source, docs, examples, and tests must move to dotted token syntax in later tasks. Do not write new Vanrot examples with finite token string attributes.

- [ ] **Step 6: Run focused compiler tests**

Run:

```bash
pnpm --filter @vanrot/compiler test -- tests/codegen/ui-token-attributes.test.ts
pnpm --filter @vanrot/compiler test
```

Expected: compiler dotted-token tests pass. If full compiler tests fail, fix only related regressions.

---

## Task 3: Add UI Metadata For 16D Primitives And Token Groups

**Files:**

- Modify: `packages/ui/src/metadata.ts`
- Modify: `packages/ui/src/index.ts`
- Modify: `packages/ui/tests/metadata.test.ts`
- Modify: `docs/superpowers/specs/Phase-16.md`
- Modify: `docs/superpowers/specs/Phase-16D.md` if needed

- [ ] **Step 1: Write metadata red tests**

In `packages/ui/tests/metadata.test.ts`, assert:

- `uiPrimitiveType` includes `layout`, `container`, `section`, `grid`, `stack`, `header`, `footer`, `sidebar`, `nav`, `breadcrumb`, `img`, and `src`;
- `uiPrimitiveOrder` includes the new primitives after the Phase 16B primitives;
- every 16D primitive has `productionPhase: uiComponentPhase.layoutNavigationMedia`;
- `<vr-tabs>` is not in the 16D primitive set;
- each primitive has a selector, native tag, base class, docs path, default files, and token groups where applicable.

Expected first run: FAIL until metadata is added.

- [ ] **Step 2: Add `uiPrimitiveTokenGroup` source of truth**

In `packages/ui/src/metadata.ts`, add this source-of-truth object, adjusting only if TypeScript requires readonly helper typing:

```ts
export const uiPrimitiveTokenGroup = {
  button: {
    variant: ['default', 'secondary', 'outline', 'ghost', 'danger', 'link'],
  },
  badge: {
    tone: ['default', 'secondary', 'success', 'warning', 'danger', 'outline'],
  },
  alert: {
    tone: ['info', 'success', 'warning', 'danger'],
  },
  separator: {
    orientation: ['horizontal', 'vertical'],
  },
  container: {
    size: ['sm', 'md', 'lg', 'xl'],
  },
  section: {
    spacing: ['sm', 'md', 'lg'],
  },
  grid: {
    cols: ['1', '2', '3', '4', '6', '12'],
    gap: ['0', '1', '2', '3', '4', '5', '6', '8'],
  },
  stack: {
    gap: ['0', '1', '2', '3', '4', '5', '6', '8'],
  },
  sidebar: {
    placement: ['left', 'right'],
  },
} as const;
```

Include groups for every Phase 16B primitive, even if the group is still named `variant`.

- [ ] **Step 3: Add class naming metadata**

Add a source-of-truth map for class output so compiler and tests do not invent names independently.

Use these class patterns unless implementation evidence shows a local conflict:

- base: `vr-grid`
- token class: `vr-grid-cols-3`
- token class: `vr-grid-gap-4`
- base: `vr-container`
- token class: `vr-container-lg`
- base: `vr-badge`
- token class: `vr-badge-success`

Default token values should omit the non-default class when that matches Phase 16B behavior.

- [ ] **Step 4: Add 16D primitive metadata**

Add metadata entries:

- `layout`: selector `vr-layout`, native tag `div`, base class `vr-layout`
- `container`: selector `vr-container`, native tag `div`, base class `vr-container`
- `section`: selector `vr-section`, native tag `section`, base class `vr-section`
- `grid`: selector `vr-grid`, native tag `div`, base class `vr-grid`
- `stack`: selector `vr-stack`, native tag `div`, base class `vr-stack`
- `header`: selector `vr-header`, native tag `header`, base class `vr-header`
- `footer`: selector `vr-footer`, native tag `footer`, base class `vr-footer`
- `sidebar`: selector `vr-sidebar`, native tag `aside`, base class `vr-sidebar`
- `nav`: selector `vr-nav`, native tag `nav`, base class `vr-nav`
- `breadcrumb`: selector `vr-breadcrumb`, native tag `nav`, base class `vr-breadcrumb`
- `img`: selector `vr-img`, native tag `img`, base class `vr-img`
- `src`: selector `vr-src`, native tag `source`, base class `vr-src`

Use docs paths under `/docs/components/<plural-or-readable-name>` to match the current site convention.

- [ ] **Step 5: Realign Phase 16 roadmap docs**

In `docs/superpowers/specs/Phase-16.md`, remove `tabs` from Phase 16D if still present and move it to Phase 16F.

In `docs/superpowers/specs/Phase-16D.md`, keep the dotted token examples aligned with the token groups in this plan: `variant`, `tone`, `orientation`, `size`, `spacing`, `cols`, `gap`, and `placement`.

- [ ] **Step 6: Run UI metadata tests**

Run:

```bash
pnpm --filter @vanrot/ui test -- tests/metadata.test.ts
pnpm --filter @vanrot/compiler test -- tests/codegen/ui-token-attributes.test.ts
```

Expected: metadata and compiler token tests pass together.

---

## Task 4: Create Phase 16D Primitive Source Files

**Files:**

- Create all `packages/ui/src/primitives/<name>/ui.<name>.ts`
- Create all `packages/ui/src/primitives/<name>/ui.<name>.html`
- Create all `packages/ui/src/primitives/<name>/ui.<name>.css`
- Create all `packages/ui/src/primitives/<name>/ui.<name>.test.ts`
- Create all `packages/ui/src/primitives/<name>/usage.home.html`
- Modify: `packages/ui/tests/assets.test.ts`

- [ ] **Step 1: Write asset red tests for 16D primitive files**

Extend `packages/ui/tests/assets.test.ts` to assert every primitive in `uiPrimitiveOrder` has:

- `ui.<name>.ts`;
- `ui.<name>.html`;
- `ui.<name>.css`;
- `ui.<name>.test.ts`;
- `usage.home.html`;
- selector text in the `.html`;
- base class text in the `.css`;
- class export text in the `.ts`;
- selector text in the `.test.ts`.

Expected first run: FAIL for every missing 16D primitive file.

- [ ] **Step 2: Create layout primitive files**

Create the files for:

- `layout`
- `container`
- `section`
- `grid`
- `stack`

Each `.ts` exports the matching class:

- `UiLayout`
- `UiContainer`
- `UiSection`
- `UiGrid`
- `UiStack`

Each `.html` contains the selector with slot content.

Each `.css` contains only scoped primitive styles and token classes. Keep defaults simple and CSS-backed.

Each `usage.home.html` uses dotted token attributes:

```html
<vr-container size.lg>
  <vr-section spacing.md>
    <vr-grid cols.3 gap.4>
      <vr-stack gap.3>
        Content
      </vr-stack>
    </vr-grid>
  </vr-section>
</vr-container>
```

- [ ] **Step 3: Create navigation shell primitive files**

Create the files for:

- `header`
- `footer`
- `sidebar`
- `nav`
- `breadcrumb`

Each `.ts` exports:

- `UiHeader`
- `UiFooter`
- `UiSidebar`
- `UiNav`
- `UiBreadcrumb`

`vr-sidebar` is static only in this phase. Do not add collapse state, buttons, icons, drawer logic, escape handling, or mobile overlay behavior.

`vr-nav` must preserve normal `aria-label`.

`vr-breadcrumb` must support source markup that can lower to ordered navigation semantics during compilation or through native child structure. Do not invent interactive behavior.

- [ ] **Step 4: Create media primitive files**

Create the files for:

- `img`
- `src`

Each `.ts` exports:

- `UiImg`
- `UiSrc`

`vr-img` must preserve standard image attributes such as `src`, `alt`, `width`, `height`, `loading`, and `decoding`.

`vr-src` must preserve standard source attributes such as `srcset`, `type`, `media`, `width`, and `height`.

- [ ] **Step 5: Run UI asset tests**

Run:

```bash
pnpm --filter @vanrot/ui test -- tests/assets.test.ts
pnpm --filter @vanrot/ui test
```

Expected: UI asset tests pass, including the no-string-token guard.

---

## Task 5: Convert Phase 16B Source And Docs Examples To Dotted Tokens

**Files:**

- Modify: `packages/ui/src/primitives/button/usage.home.html`
- Modify: `packages/ui/src/primitives/card/usage.home.html`
- Modify: `packages/ui/src/primitives/badge/usage.home.html`
- Modify: `packages/ui/src/primitives/avatar/usage.home.html`
- Modify: `packages/ui/src/primitives/alert/usage.home.html`
- Modify: `packages/ui/src/primitives/loader/usage.home.html`
- Modify: `packages/ui/src/primitives/skeleton/usage.home.html`
- Modify: `packages/ui/src/primitives/separator/usage.home.html`
- Modify: `apps/vanrot-site/src/pages/components/component-button.page.html`
- Modify: `apps/vanrot-site/src/pages/components/component-card.page.html`
- Modify: `apps/vanrot-site/src/pages/components/component-badge.page.html`
- Modify: `apps/vanrot-site/src/pages/components/component-avatar.page.html`
- Modify: `apps/vanrot-site/src/pages/components/component-alert.page.html`
- Modify: `apps/vanrot-site/src/pages/components/component-loader.page.html`
- Modify: `apps/vanrot-site/src/pages/components/component-skeleton.page.html`
- Modify: `apps/vanrot-site/src/pages/components/component-separator.page.html`
- Modify: `apps/vanrot-site/tests/site-pages.test.ts`
- Modify: `packages/ui/tests/assets.test.ts`

- [ ] **Step 1: Convert package usage examples**

Replace Vanrot-owned token string attributes with dotted syntax.

Examples:

```html
<vr-button variant="danger" type="button">
```

becomes:

```html
<vr-button variant.danger type="button">
```

```html
<vr-badge variant="success">
```

becomes:

```html
<vr-badge tone.success>
```

```html
<vr-alert variant="warning">
```

becomes:

```html
<vr-alert tone.warning>
```

```html
<vr-separator variant="vertical">
```

becomes:

```html
<vr-separator orientation.vertical>
```

Keep valid standard attributes unchanged:

```html
type="button"
aria-label="Close"
src="/..."
alt="..."
```

- [ ] **Step 2: Convert site component code snippets**

Update the displayed code examples inside the Phase 16B component docs pages to use dotted tokens.

Do not change the approved visual layout of these pages.

Do not remove the current shadcn-style preview/code cards, dotted preview backgrounds, mobile rules, or icon-only copy buttons.

- [ ] **Step 3: Update tests that still expect string token examples**

Update expectations in:

- `packages/ui/tests/assets.test.ts`
- `apps/vanrot-site/tests/site-pages.test.ts`

The tests should now expect dotted tokens and fail when finite token strings return.

- [ ] **Step 4: Run focused cleanup tests**

Run:

```bash
pnpm --filter @vanrot/ui test -- tests/assets.test.ts
pnpm --filter @vanrot/vanrot-site test -- tests/site-pages.test.ts
pnpm --filter @vanrot/compiler test -- tests/codegen/ui-token-attributes.test.ts
```

Expected: no string-token guards fail.

---

## Task 6: Adopt 16D Primitives In The Docs Site Shell Without Visual Drift

**Files:**

- Modify: `apps/vanrot-site/src/layouts/docs/docs.layout.html`
- Modify: `apps/vanrot-site/src/layouts/docs/docs.layout.css`
- Modify: `apps/vanrot-site/src/pages/components/*.page.html`
- Modify: `apps/vanrot-site/src/pages/components/*.page.css`
- Modify: `apps/vanrot-site/tests/site-pages.test.ts`

- [ ] **Step 1: Capture the current visual baseline**

Before changing shell markup, inspect these pages in the browser:

- `http://localhost:3000/docs/components/badges`
- `http://localhost:3000/docs/components/buttons`
- `http://localhost:3000/docs/components/cards`

Record the baseline details in the work log:

- sidebar visible;
- same menu count;
- active nav item visible;
- title spacing;
- preview card width;
- code card styling;
- mobile behavior if inspected.

Do not use the baseline to redesign. Use it to avoid drift.

- [ ] **Step 2: Add source tests for shell primitive adoption**

In `apps/vanrot-site/tests/site-pages.test.ts`, add assertions that the docs layout or component pages use:

```html
<vr-layout>
<vr-header>
<vr-sidebar>
<vr-nav>
<vr-container>
<vr-section>
```

The exact assertions should match the chosen adoption path:

- if the shared docs layout owns the shell, assert the shared layout has the shell primitives;
- if component pages still contain local shell markup, assert each component page uses the shell primitives.

Expected first run: FAIL until the markup is adopted.

- [ ] **Step 3: Replace shell wrapper tags with primitives**

Replace only structural shell wrappers.

Preserve current classes where needed so CSS keeps rendering the same result.

Example target shape:

```html
<vr-layout class="app component-gallery-app">
  <vr-sidebar class="sidebar">
    ...
  </vr-sidebar>
  <main class="content">
    <vr-container class="page-shell">
      <vr-section class="page-section">
        ...
      </vr-section>
    </vr-container>
  </main>
</vr-layout>
```

Do not change the sidebar menu contents, order, labels, active state, or spacing.

- [ ] **Step 4: Transfer CSS ownership only where safe**

Move structural styles into 16D primitive CSS only when the primitive truly owns that structure.

Keep site-specific styles in page CSS when they are docs-page composition styles, such as:

- component demo cards;
- code snippet cards;
- component sidebar grouping;
- page-specific responsive arrangements.

No visual drift is allowed.

- [ ] **Step 5: Run site tests**

Run:

```bash
pnpm --filter @vanrot/vanrot-site test -- tests/site-pages.test.ts
```

Expected: route rendering, sidebar navigation, component docs structure, dotted token snippets, and shell primitive adoption tests pass.

---

## Task 7: Add Dedicated Docs Pages For 16D Components

**Files:**

- Create all `apps/vanrot-site/src/pages/components/component-*.page.ts/html/css` files listed in the File Structure section for 16D.
- Modify: `apps/vanrot-site/src/routes.ts`
- Modify: `apps/vanrot-site/src/docs/component-docs.ts`
- Modify: `apps/vanrot-site/src/docs/site-navigation.ts`
- Modify: `apps/vanrot-site/tests/site-pages.test.ts`

- [ ] **Step 1: Use the Vanrot component docs pattern**

When creating each docs page, follow the local `vanrot-doc-component` skill pattern:

- title only at the top;
- variants overview card where variants exist;
- one dedicated section per variant or usage shape;
- dotted preview backgrounds;
- shadcn-style code snippets below previews;
- icon-only copy buttons;
- accessibility notes in prose;
- mobile-ready CSS;
- same primary component sidebar.

- [ ] **Step 2: Add layout component docs pages**

Create pages for:

- `layout`
- `container`
- `section`
- `grid`
- `stack`

Examples must use dotted tokens where finite tokens are shown:

```html
<vr-container size.lg>
<vr-section spacing.md>
<vr-grid cols.3 gap.4>
<vr-stack gap.3>
```

- [ ] **Step 3: Add navigation shell component docs pages**

Create pages for:

- `header`
- `footer`
- `sidebar`
- `nav`
- `breadcrumb`

Docs must clearly state:

- `vr-sidebar` is static in Phase 16D;
- collapsible/mobile drawer behavior belongs to Phase 16F;
- `vr-nav` keeps normal `aria-label`;
- `vr-breadcrumb` owns navigation/current-page semantics, not app routing logic.

- [ ] **Step 4: Add media component docs pages**

Create pages for:

- `img`
- `src`

Docs must show normal platform attributes:

```html
<vr-img src="/images/product.png" alt="Product image">
<vr-src srcset="/images/product.webp" type="image/webp">
```

Do not invent dotted syntax for URLs or alt text.

- [ ] **Step 5: Add routes and sidebar navigation**

In `apps/vanrot-site/src/routes.ts`, add route path constants, imports, and route declarations for all 16D pages.

In site navigation data, add links alphabetically with the existing component sidebar menu.

Expected route paths:

- `/docs/components/layout`
- `/docs/components/container`
- `/docs/components/section`
- `/docs/components/grid`
- `/docs/components/stack`
- `/docs/components/header`
- `/docs/components/footer`
- `/docs/components/sidebar`
- `/docs/components/nav`
- `/docs/components/breadcrumb`
- `/docs/components/img`
- `/docs/components/src`

If user-facing pluralization would read better for any route, update this plan before implementation and keep tests aligned.

- [ ] **Step 6: Add docs page tests**

In `apps/vanrot-site/tests/site-pages.test.ts`, add a `phase16dComponentDocPages` table with:

- title;
- route path;
- active sidebar label;
- expected variant or usage section ids;
- expected code snippet count.

Assert:

- every route exists;
- every page has the approved title-only top;
- every page uses the primary component sidebar;
- every page has dotted preview backgrounds;
- every code snippet preserves indentation and spaces between attributes;
- no page reintroduces top preview/code/accessibility tabs.

- [ ] **Step 7: Run site docs tests**

Run:

```bash
pnpm --filter @vanrot/vanrot-site test -- tests/site-pages.test.ts
```

Expected: all component docs pages pass.

---

## Task 8: Update Phase Docs, Inventory, And Presentation

**Files:**

- Modify: `docs/superpowers/feature-maturity.md`
- Modify: `docs/superpowers/final-tdd-inventory.md`
- Modify: `docs/vanrot-presentation.html`
- Modify: `docs/superpowers/plans/Phase-16D.md`

- [ ] **Step 1: Update final TDD inventory**

Add Phase 16D coverage for:

- dotted token compiler support;
- duplicate token diagnostics;
- unknown token diagnostics;
- Phase 16B string-token cleanup;
- 16D layout primitives;
- 16D navigation shell primitives;
- 16D media primitives;
- docs-site shell adoption;
- 16D component docs pages;
- browser visual baseline verification.

- [ ] **Step 2: Update feature maturity**

When implementation and verification pass, mark Phase 16D rows as production-ready only for the completed 16D slice:

- layout/navigation/media primitives;
- dotted token syntax and diagnostics;
- docs-site shell adoption;
- 16B string-token cleanup.

Do not mark 16E or 16F complete.

- [ ] **Step 3: Update presentation**

Update `docs/vanrot-presentation.html` so the roadmap slide shows:

- Phase 16D complete after verification;
- Phase 16E active or next, depending on current tracker convention.

- [ ] **Step 4: Tick this plan**

Tick every completed checkbox in `docs/superpowers/plans/Phase-16D.md` during execution.

Do not tick completion before tests and browser verification pass.

---

## Task 9: Final Verification

**Files:**

- No new files unless verification reveals a related defect.

- [ ] **Step 1: Run focused package checks**

Run:

```bash
pnpm --filter @vanrot/compiler test
pnpm --filter @vanrot/ui test
pnpm --filter @vanrot/vanrot-site test
pnpm --filter @vanrot/vanrot-site typecheck
```

Expected: all pass.

- [ ] **Step 2: Run full verification**

Run:

```bash
pnpm verify
```

Expected: all pass, including `verify:phase-docs`, `verify:site-docs`, build, typecheck, tests, and size budget.

- [ ] **Step 3: Check whitespace and working tree**

Run:

```bash
git diff --check
git status --short --branch
```

Expected: no whitespace errors. Report all modified and untracked files.

- [ ] **Step 4: Restart the Vanrot site dev server**

Run:

```bash
pkill -f "vite/bin/vite.js.*--port 3000" || true
pnpm --filter @vanrot/vanrot-site dev -- --host 127.0.0.1 --port 3000
```

Then verify representative routes respond:

- `http://localhost:3000/docs/components/badges`
- `http://localhost:3000/docs/components/grid`
- `http://localhost:3000/docs/components/sidebar`
- `http://localhost:3000/docs/components/img`

- [ ] **Step 5: Browser visual inspection**

Inspect in the in-app browser:

- `/docs/components/badges`
- `/docs/components/buttons`
- `/docs/components/cards`
- `/docs/components/grid`
- `/docs/components/sidebar`

Confirm:

- docs shell still matches the approved current design;
- sidebar menu count/order/spacing did not drift;
- active component navigation works;
- code snippets still look like the approved shadcn-style card;
- 16D docs pages use dotted tokens correctly;
- no visible redesign slipped in.

- [ ] **Step 6: Queue memory observations**

Use the local memory API with `contentSessionId`:

```text
codex-2026-05-25-phase-16d-brainstorm
```

Record:

- files changed;
- test commands and results;
- browser routes inspected;
- any known follow-up for 16E or 16F.

---

## Execution Notes

- The 16B string-token cleanup is part of 16D because dotted token attributes become the first-class Vanrot authoring syntax in this phase.
- Do not add runtime JavaScript for static dotted tokens.
- Do not make `vr-sidebar` collapsible in 16D.
- Do not implement `vr-tabs` in 16D.
- Do not create an icon strategy in 16D.
- Do not change the current docs site visual design.
- If a visual change seems necessary, stop and get user approval before continuing.
