# Phase 16E Controlled Forms And Data Primitives Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task in the current session. Vanrot rules forbid subagents, parallel agents, worktrees, staging, committing, and pushing unless the user explicitly asks. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Phase 16E controlled form primitives, useful data primitives, rich UI registry, component CLI help, and docs pages.

**Architecture:** Keep `@vanrot/ui` as the source of truth for primitives, token groups, finite dotted token values, boolean attributes, open attributes, events, slots, docs paths, examples, and CLI help text. Keep `@vanrot/compiler` responsible for compile-time dotted token validation and semantic tag lowering. Keep `@vanrot/runtime` responsible only for small DOM helpers for form state and table behavior, with app code owning persistence and async saves.

**Tech Stack:** TypeScript, Vitest, Vanrot compiler codegen, `@vanrot/runtime` signals/listeners, `@vanrot/ui`, `@vanrot/cli`, `vanrotstyles.css`, October tokens, Vanrot site docs pages, local browser verification.

---

## Local Rules For This Plan

- Do not create a branch, worktree, commit, push, or stage files unless the user explicitly asks.
- Do not use subagents or parallel agents.
- Use `Phase-16E.md` naming because this is a numbered Vanrot phase slice.
- Keep UI markup in `.html`, state and behavior in `.ts`, and styling in scoped `.css` or `vanrotstyles.css`.
- Keep dotted token attributes for Vanrot-owned finite values, such as `size.md`, `tone.danger`, `density.compact`, and `type.email`.
- Keep open-ended values as normal attributes, such as `name="email"`, `placeholder="Email"`, `aria-label="Email"`, and `sort-key="amount"`.
- Make user classes win after dotted token classes by preserving class order as base class, dotted token classes, then user classes.
- Use registry-owned strings for component names, route paths, token group names, CLI labels, and docs copy that repeats.
- Use the approved shadcn-inspired docs rhythm for component docs: title only, overview preview, variant sections, code snippets below previews, accessibility in prose, dotted preview background, and mobile-ready CSS.
- Use the shadcn Table docs as inspiration for table usefulness and page rhythm: examples first, code under the example, practical data table states, and no bloated table engine.
- Run final verification before reporting completion.
- Restart `apps/vanrot-site` on port `3000` before the final response and inspect the relevant pages in the browser.

## Source Material

- Spec: `docs/superpowers/specs/Phase-16E.md`
- Existing pattern: `docs/superpowers/plans/Phase-16B.md`
- Existing pattern: `docs/superpowers/plans/Phase-16D.md`
- Current docs pattern: `apps/vanrot-site/src/pages/components/component-button.page.html`
- External visual/usefulness reference: `https://ui.shadcn.com/docs/components/table`

## File Structure

Create:

- `packages/ui/src/registry/token-scales.ts`: shared rich token scale values such as `2xs`, `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`, tone values, density values, input type values, and table state values.
- `packages/ui/src/registry/component-registry.ts`: rich source of truth for every UI primitive, including selector, native tag, category, phase, token groups, booleans, open attributes, events, slots, docs path, examples, and accessibility notes.
- `packages/runtime/src/forms/form-controller.ts`: lightweight controlled form state, built-in validation, custom validation hooks, submit orchestration, and DOM connection helpers.
- `packages/runtime/tests/forms/form-controller.test.ts`: form state, validation, reset, submit, custom validation, and accessibility state tests.
- `packages/runtime/src/ui/table-controller.ts`: lightweight DOM table sorting, filtering, pagination, selection, loading, and empty state helpers.
- `packages/runtime/tests/ui/table-controller.test.ts`: table sorting, filtering, pagination, selection, empty state, loading state, and teardown tests.
- `packages/cli/src/commands/ui.ts`: `vr ui list` and `vr ui <component> --help` command.
- `packages/cli/tests/ui-command.test.ts`: CLI registry help tests.
- `apps/vanrot-site/src/pages/components/component-form.page.ts`
- `apps/vanrot-site/src/pages/components/component-form.page.html`
- `apps/vanrot-site/src/pages/components/component-form.page.css`
- `apps/vanrot-site/src/pages/components/component-form-field.page.ts`
- `apps/vanrot-site/src/pages/components/component-form-field.page.html`
- `apps/vanrot-site/src/pages/components/component-form-field.page.css`
- `apps/vanrot-site/src/pages/components/component-label.page.ts`
- `apps/vanrot-site/src/pages/components/component-label.page.html`
- `apps/vanrot-site/src/pages/components/component-label.page.css`
- `apps/vanrot-site/src/pages/components/component-input.page.ts`
- `apps/vanrot-site/src/pages/components/component-input.page.html`
- `apps/vanrot-site/src/pages/components/component-input.page.css`
- `apps/vanrot-site/src/pages/components/component-textarea.page.ts`
- `apps/vanrot-site/src/pages/components/component-textarea.page.html`
- `apps/vanrot-site/src/pages/components/component-textarea.page.css`
- `apps/vanrot-site/src/pages/components/component-select.page.ts`
- `apps/vanrot-site/src/pages/components/component-select.page.html`
- `apps/vanrot-site/src/pages/components/component-select.page.css`
- `apps/vanrot-site/src/pages/components/component-checkbox.page.ts`
- `apps/vanrot-site/src/pages/components/component-checkbox.page.html`
- `apps/vanrot-site/src/pages/components/component-checkbox.page.css`
- `apps/vanrot-site/src/pages/components/component-radio-group.page.ts`
- `apps/vanrot-site/src/pages/components/component-radio-group.page.html`
- `apps/vanrot-site/src/pages/components/component-radio-group.page.css`
- `apps/vanrot-site/src/pages/components/component-radio.page.ts`
- `apps/vanrot-site/src/pages/components/component-radio.page.html`
- `apps/vanrot-site/src/pages/components/component-radio.page.css`
- `apps/vanrot-site/src/pages/components/component-switch.page.ts`
- `apps/vanrot-site/src/pages/components/component-switch.page.html`
- `apps/vanrot-site/src/pages/components/component-switch.page.css`
- `apps/vanrot-site/src/pages/components/component-slider.page.ts`
- `apps/vanrot-site/src/pages/components/component-slider.page.html`
- `apps/vanrot-site/src/pages/components/component-slider.page.css`
- `apps/vanrot-site/src/pages/components/component-table.page.ts`
- `apps/vanrot-site/src/pages/components/component-table.page.html`
- `apps/vanrot-site/src/pages/components/component-table.page.css`
- `apps/vanrot-site/src/pages/components/component-pagination.page.ts`
- `apps/vanrot-site/src/pages/components/component-pagination.page.html`
- `apps/vanrot-site/src/pages/components/component-pagination.page.css`
- `apps/vanrot-site/src/pages/components/component-list.page.ts`
- `apps/vanrot-site/src/pages/components/component-list.page.html`
- `apps/vanrot-site/src/pages/components/component-list.page.css`
- `apps/vanrot-site/src/pages/components/component-list-item.page.ts`
- `apps/vanrot-site/src/pages/components/component-list-item.page.html`
- `apps/vanrot-site/src/pages/components/component-list-item.page.css`
- `apps/vanrot-site/src/pages/components/component-stat.page.ts`
- `apps/vanrot-site/src/pages/components/component-stat.page.html`
- `apps/vanrot-site/src/pages/components/component-stat.page.css`
- `apps/vanrot-site/src/pages/components/component-empty-state.page.ts`
- `apps/vanrot-site/src/pages/components/component-empty-state.page.html`
- `apps/vanrot-site/src/pages/components/component-empty-state.page.css`

Modify:

- `packages/ui/src/metadata.ts`: add Phase 16E primitive names, order, compatibility exports, and asset URLs derived from the rich registry where possible.
- `packages/ui/src/index.ts`: export the registry and token scale modules.
- `packages/ui/src/styles/vanrotstyles.css`: add Phase 16E base styles, token classes, control states, table states, and responsive rules.
- `packages/ui/tests/metadata.test.ts`: assert Phase 16E registry, compatibility metadata, token values, open attributes, booleans, events, docs paths, and asset URLs.
- `packages/ui/tests/assets.test.ts`: assert Phase 16E primitive files exist and usage snippets use dotted tokens for finite values.
- `packages/compiler/src/api/types.ts`: add any missing Phase 16E compile feature names.
- `packages/compiler/src/codegen/ui-elements.ts`: consume rich registry metadata for Phase 16E primitives.
- `packages/compiler/src/codegen/ui-token-attributes.ts`: preserve strict dotted token diagnostics against rich token groups.
- `packages/compiler/src/codegen/generate-component.ts`: lower Phase 16E tags, wire form/table runtime helpers only when needed, and keep user class precedence.
- `packages/compiler/tests/codegen/ui-token-attributes.test.ts`: add Phase 16E dotted token tests and class precedence tests.
- `packages/compiler/tests/codegen/generate-component.test.ts`: add form, table, pagination, list, stat, and empty state lowering tests.
- `packages/runtime/src/internal.ts`: export compiler-facing form and table helpers.
- `packages/runtime/src/index.ts`: export public form controller types and factory.
- `packages/runtime/tests/exports/exports.test.ts`: assert public and internal exports.
- `packages/cli/src/cli.ts`: register the `ui` command and command help.
- `packages/cli/src/commands/metadata.ts`: add `ui` command metadata, root help grouping, and command invocation strings.
- `packages/cli/src/add/add-ui.ts`: ensure `vr add input`, `vr add table`, and every Phase 16E primitive are supported by registry data.
- `packages/cli/tests/cli.test.ts`: assert root help includes `ui` and command help dispatch works.
- `packages/cli/tests/add.test.ts`: assert `vr add input` and `vr add table` copy Phase 16E primitive files.
- `apps/vanrot-site/src/routes.ts`: add Phase 16E component routes.
- `apps/vanrot-site/src/docs/component-doc-paths.ts`: add Phase 16E docs paths.
- `apps/vanrot-site/src/docs/component-docs.ts`: read Phase 16E docs metadata from the registry.
- `apps/vanrot-site/src/docs/site-data.json`: add Phase 16E component copy only when the copy is not already generated from registry data.
- `apps/vanrot-site/src/docs/site-data.ts`: export any new typed docs helpers required by Phase 16E pages.
- `apps/vanrot-site/src/docs/site-navigation.ts`: add Phase 16E component sidebar links in alphabetical order.
- `apps/vanrot-site/tests/site-pages.test.ts`: assert Phase 16E routes, sidebar order, docs page content, dotted token snippets, and no string finite-token examples.
- `docs/superpowers/feature-maturity.md`: update Phase 16E wording/status only after implementation and verification.
- `docs/superpowers/final-tdd-inventory.md`: add Phase 16E packages, registry, compiler, runtime, CLI, docs, and generated file coverage after implementation.
- `docs/vanrot-presentation.html`: mark Phase 16E complete only after verification and make the next pending phase active.
- `docs/superpowers/plans/Phase-16E.md`: tick completed steps during execution.

## Phase 16E Primitive Set

Use this exact Phase 16E primitive order after the existing Phase 16D order:

```ts
export const phase16FormsDataPrimitiveOrder = [
  uiPrimitiveType.form,
  uiPrimitiveType.formField,
  uiPrimitiveType.label,
  uiPrimitiveType.input,
  uiPrimitiveType.textarea,
  uiPrimitiveType.select,
  uiPrimitiveType.checkbox,
  uiPrimitiveType.radioGroup,
  uiPrimitiveType.radio,
  uiPrimitiveType.switch,
  uiPrimitiveType.slider,
  uiPrimitiveType.table,
  uiPrimitiveType.tableHeader,
  uiPrimitiveType.tableBody,
  uiPrimitiveType.tableRow,
  uiPrimitiveType.tableHead,
  uiPrimitiveType.tableCell,
  uiPrimitiveType.tableFooter,
  uiPrimitiveType.tableCaption,
  uiPrimitiveType.pagination,
  uiPrimitiveType.list,
  uiPrimitiveType.listItem,
  uiPrimitiveType.stat,
  uiPrimitiveType.emptyState,
] as const;
```

Use this exact selector-to-native-tag map:

```ts
const phase16FormsDataNativeTags = {
  form: 'form',
  formField: 'div',
  label: 'label',
  input: 'input',
  textarea: 'textarea',
  select: 'select',
  checkbox: 'input',
  radioGroup: 'div',
  radio: 'input',
  switch: 'button',
  slider: 'input',
  table: 'table',
  tableHeader: 'thead',
  tableBody: 'tbody',
  tableRow: 'tr',
  tableHead: 'th',
  tableCell: 'td',
  tableFooter: 'tfoot',
  tableCaption: 'caption',
  pagination: 'nav',
  list: 'ul',
  listItem: 'li',
  stat: 'section',
  emptyState: 'section',
} as const;
```

Use these selector names:

```ts
const phase16FormsDataSelectors = {
  form: 'vr-form',
  formField: 'vr-form-field',
  label: 'vr-label',
  input: 'vr-input',
  textarea: 'vr-textarea',
  select: 'vr-select',
  checkbox: 'vr-checkbox',
  radioGroup: 'vr-radio-group',
  radio: 'vr-radio',
  switch: 'vr-switch',
  slider: 'vr-slider',
  table: 'vr-table',
  tableHeader: 'vr-table-header',
  tableBody: 'vr-table-body',
  tableRow: 'vr-table-row',
  tableHead: 'vr-table-head',
  tableCell: 'vr-table-cell',
  tableFooter: 'vr-table-footer',
  tableCaption: 'vr-table-caption',
  pagination: 'vr-pagination',
  list: 'vr-list',
  listItem: 'vr-list-item',
  stat: 'vr-stat',
  emptyState: 'vr-empty-state',
} as const;
```

## Token Families And Values

Use these shared token values in `packages/ui/src/registry/token-scales.ts`:

```ts
export const uiSizeToken = ['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;
export const uiToneToken = [
  'default',
  'secondary',
  'muted',
  'info',
  'success',
  'warning',
  'danger',
  'outline',
] as const;
export const uiDensityToken = ['comfortable', 'compact', 'dense'] as const;
export const uiInputTypeToken = [
  'text',
  'email',
  'password',
  'number',
  'search',
  'tel',
  'url',
] as const;
export const uiControlShapeToken = ['default', 'pill', 'square'] as const;
export const uiListMarkerToken = ['none', 'disc', 'decimal', 'check'] as const;
export const uiStatAlignToken = ['left', 'center', 'right'] as const;
export const uiPaginationVariantToken = ['default', 'compact', 'numbers'] as const;
```

Component subsets:

```ts
const phase16TokenSubsets = {
  input: {
    size: ['xs', 'sm', 'md', 'lg', 'xl'],
    tone: ['default', 'success', 'warning', 'danger'],
    type: ['text', 'email', 'password', 'number', 'search', 'tel', 'url'],
  },
  textarea: {
    size: ['sm', 'md', 'lg', 'xl'],
    tone: ['default', 'success', 'warning', 'danger'],
  },
  select: {
    size: ['xs', 'sm', 'md', 'lg', 'xl'],
    tone: ['default', 'success', 'warning', 'danger'],
  },
  checkbox: {
    size: ['xs', 'sm', 'md', 'lg'],
    tone: ['default', 'success', 'warning', 'danger'],
  },
  radio: {
    size: ['xs', 'sm', 'md', 'lg'],
    tone: ['default', 'success', 'warning', 'danger'],
  },
  switch: {
    size: ['sm', 'md', 'lg'],
    tone: ['default', 'success', 'warning', 'danger'],
  },
  slider: {
    size: ['sm', 'md', 'lg'],
    tone: ['default', 'success', 'warning', 'danger'],
  },
  table: {
    density: ['comfortable', 'compact', 'dense'],
    tone: ['default', 'muted'],
  },
  pagination: {
    size: ['sm', 'md', 'lg'],
    variant: ['default', 'compact', 'numbers'],
  },
  list: {
    marker: ['none', 'disc', 'decimal', 'check'],
    density: ['comfortable', 'compact', 'dense'],
  },
  stat: {
    tone: ['default', 'success', 'warning', 'danger', 'muted'],
    align: ['left', 'center', 'right'],
  },
  emptyState: {
    tone: ['default', 'muted'],
    size: ['sm', 'md', 'lg'],
  },
} as const;
```

## Component Registry Attribute Matrix

Use this matrix when completing every `uiComponentRegistry` entry. Token groups are finite dotted-token groups. Boolean attributes are finite behavior or state attributes. Open attributes stay normal HTML attributes.

| Primitive key | Selector | Native tag | Docs path | Token groups | Booleans | Open attributes | Events | Slots |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `form` | `vr-form` | `form` | `/docs/components/forms` | none | `novalidate` | `id`, `name`, `action`, `method`, `aria-label`, `aria-describedby` | `submit`, `reset`, `invalid`, `valid` | `default` |
| `formField` | `vr-form-field` | `div` | `/docs/components/form-fields` | `tone: default, success, warning, danger` | none | `id`, `aria-label`, `aria-describedby` | none | `default` |
| `label` | `vr-label` | `label` | `/docs/components/labels` | `size: xs, sm, md, lg` | none | `id`, `for`, `aria-label` | none | `default` |
| `input` | `vr-input` | `input` | `/docs/components/inputs` | `size: xs, sm, md, lg, xl`; `tone: default, success, warning, danger`; `type: text, email, password, number, search, tel, url` | `required`, `disabled`, `readonly`, `autofocus` | `id`, `name`, `value`, `placeholder`, `autocomplete`, `aria-label`, `aria-describedby` | `input`, `change`, `blur` | none |
| `textarea` | `vr-textarea` | `textarea` | `/docs/components/textareas` | `size: sm, md, lg, xl`; `tone: default, success, warning, danger` | `required`, `disabled`, `readonly`, `autofocus` | `id`, `name`, `value`, `placeholder`, `rows`, `maxlength`, `aria-label`, `aria-describedby` | `input`, `change`, `blur` | none |
| `select` | `vr-select` | `select` | `/docs/components/selects` | `size: xs, sm, md, lg, xl`; `tone: default, success, warning, danger` | `required`, `disabled`, `autofocus`, `multiple` | `id`, `name`, `value`, `autocomplete`, `aria-label`, `aria-describedby` | `change`, `blur` | `default` |
| `checkbox` | `vr-checkbox` | `input` | `/docs/components/checkboxes` | `size: xs, sm, md, lg`; `tone: default, success, warning, danger` | `required`, `disabled`, `readonly`, `checked` | `id`, `name`, `value`, `aria-label`, `aria-describedby` | `change`, `blur` | none |
| `radioGroup` | `vr-radio-group` | `div` | `/docs/components/radio-groups` | `tone: default, success, warning, danger` | `required`, `disabled` | `id`, `name`, `value`, `aria-label`, `aria-describedby` | `change`, `invalid`, `valid` | `default` |
| `radio` | `vr-radio` | `input` | `/docs/components/radios` | `size: xs, sm, md, lg`; `tone: default, success, warning, danger` | `required`, `disabled`, `checked` | `id`, `name`, `value`, `aria-label`, `aria-describedby` | `change`, `blur` | none |
| `switch` | `vr-switch` | `button` | `/docs/components/switches` | `size: sm, md, lg`; `tone: default, success, warning, danger` | `disabled`, `checked` | `id`, `name`, `value`, `aria-label`, `aria-describedby` | `click`, `change`, `blur` | none |
| `slider` | `vr-slider` | `input` | `/docs/components/sliders` | `size: sm, md, lg`; `tone: default, success, warning, danger` | `disabled`, `readonly` | `id`, `name`, `value`, `min`, `max`, `step`, `aria-label`, `aria-describedby` | `input`, `change`, `blur` | none |
| `table` | `vr-table` | `table` | `/docs/components/tables` | `density: comfortable, compact, dense`; `tone: default, muted` | `sortable`, `filterable`, `paginated`, `selectable`, `loading` | `id`, `aria-label`, `aria-describedby`, `page-size`, `filter` | `sort`, `page`, `select` | `default` |
| `tableHeader` | `vr-table-header` | `thead` | `/docs/components/table-headers` | none | none | `id` | none | `default` |
| `tableBody` | `vr-table-body` | `tbody` | `/docs/components/table-bodies` | none | none | `id` | none | `default` |
| `tableRow` | `vr-table-row` | `tr` | `/docs/components/table-rows` | `tone: default, muted, success, warning, danger` | `selected` | `id`, `data-row-id` | `click`, `select` | `default` |
| `tableHead` | `vr-table-head` | `th` | `/docs/components/table-heads` | `align: left, center, right` | `sortable` | `id`, `scope`, `sort-key`, `aria-sort` | `click`, `sort` | `default` |
| `tableCell` | `vr-table-cell` | `td` | `/docs/components/table-cells` | `align: left, center, right` | none | `id`, `headers`, `colspan`, `rowspan` | none | `default` |
| `tableFooter` | `vr-table-footer` | `tfoot` | `/docs/components/table-footers` | none | none | `id` | none | `default` |
| `tableCaption` | `vr-table-caption` | `caption` | `/docs/components/table-captions` | none | none | `id` | none | `default` |
| `pagination` | `vr-pagination` | `nav` | `/docs/components/paginations` | `size: sm, md, lg`; `variant: default, compact, numbers` | none | `id`, `aria-label`, `page`, `page-count` | `page` | `default` |
| `list` | `vr-list` | `ul` | `/docs/components/lists` | `marker: none, disc, decimal, check`; `density: comfortable, compact, dense` | none | `id`, `aria-label` | none | `default` |
| `listItem` | `vr-list-item` | `li` | `/docs/components/list-items` | `tone: default, muted, success, warning, danger` | none | `id`, `value` | none | `default` |
| `stat` | `vr-stat` | `section` | `/docs/components/stats` | `tone: default, success, warning, danger, muted`; `align: left, center, right` | none | `id`, `aria-label`, `data-value` | none | `default` |
| `emptyState` | `vr-empty-state` | `section` | `/docs/components/empty-states` | `tone: default, muted`; `size: sm, md, lg` | none | `id`, `aria-label` | none | `default` |

## Task 1: Add Rich UI Registry Red Tests

**Files:**

- Modify: `packages/ui/tests/metadata.test.ts`
- Create: `packages/ui/src/registry/token-scales.ts`
- Create: `packages/ui/src/registry/component-registry.ts`
- Modify: `packages/ui/src/index.ts`

- [x] **Step 1: Add imports for new registry exports**

Update the import from `../src/index.js` in `packages/ui/tests/metadata.test.ts`:

```ts
import {
  defaultUiPrefix,
  uiAppFile,
  uiAssetUrl,
  uiComponentCatalog,
  uiComponentPhase,
  uiComponentRegistry,
  uiFlavor,
  uiInputTypeToken,
  uiPackageInventory,
  uiPrimitive,
  uiPrimitiveOrder,
  uiPrimitiveTokenGroup,
  uiPrimitiveType,
  uiPrimitiveVariant,
  uiSizeToken,
  uiStyleMode,
  uiToneToken,
} from '../src/index.js';
```

- [x] **Step 2: Add Phase 16E primitive order red test**

Append this test inside `describe('@vanrot/ui metadata', ...)`:

```ts
const phase16FormsDataPrimitiveOrder = [
  uiPrimitiveType.form,
  uiPrimitiveType.formField,
  uiPrimitiveType.label,
  uiPrimitiveType.input,
  uiPrimitiveType.textarea,
  uiPrimitiveType.select,
  uiPrimitiveType.checkbox,
  uiPrimitiveType.radioGroup,
  uiPrimitiveType.radio,
  uiPrimitiveType.switch,
  uiPrimitiveType.slider,
  uiPrimitiveType.table,
  uiPrimitiveType.tableHeader,
  uiPrimitiveType.tableBody,
  uiPrimitiveType.tableRow,
  uiPrimitiveType.tableHead,
  uiPrimitiveType.tableCell,
  uiPrimitiveType.tableFooter,
  uiPrimitiveType.tableCaption,
  uiPrimitiveType.pagination,
  uiPrimitiveType.list,
  uiPrimitiveType.listItem,
  uiPrimitiveType.stat,
  uiPrimitiveType.emptyState,
] as const;

it('exports the Phase 16E forms and data primitive order', () => {
  const offset = phase16CorePrimitiveOrder.length + phase16LayoutNavigationMediaPrimitiveOrder.length;

  expect(uiPrimitiveOrder.slice(offset)).toEqual([...phase16FormsDataPrimitiveOrder]);
});
```

- [x] **Step 3: Add rich token scale red test**

Append this test:

```ts
it('exports rich shared token scales for UI discovery', () => {
  expect(uiSizeToken).toEqual(['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl']);
  expect(uiToneToken).toEqual([
    'default',
    'secondary',
    'muted',
    'info',
    'success',
    'warning',
    'danger',
    'outline',
  ]);
  expect(uiInputTypeToken).toEqual([
    'text',
    'email',
    'password',
    'number',
    'search',
    'tel',
    'url',
  ]);
});
```

- [x] **Step 4: Add rich registry red test for form components**

Append this test:

```ts
it('exports rich registry entries for controlled form primitives', () => {
  expect(uiComponentRegistry.input).toMatchObject({
    selector: 'vr-input',
    nativeTag: 'input',
    category: 'forms',
    phase: '16E',
    docsPath: '/docs/components/inputs',
  });
  expect(uiComponentRegistry.input.tokens.size.values.map((value) => value.value)).toEqual([
    'xs',
    'sm',
    'md',
    'lg',
    'xl',
  ]);
  expect(uiComponentRegistry.input.tokens.type.values.map((value) => value.value)).toEqual([
    'text',
    'email',
    'password',
    'number',
    'search',
    'tel',
    'url',
  ]);
  expect(uiComponentRegistry.input.booleans.map((item) => item.name)).toEqual([
    'required',
    'disabled',
    'readonly',
    'autofocus',
  ]);
  expect(uiComponentRegistry.input.openAttributes.map((item) => item.name)).toEqual([
    'id',
    'name',
    'value',
    'placeholder',
    'autocomplete',
    'aria-label',
    'aria-describedby',
  ]);
  expect(uiComponentRegistry.form.events.map((item) => item.name)).toEqual([
    'submit',
    'reset',
    'invalid',
    'valid',
  ]);
});
```

- [x] **Step 5: Add rich registry red test for data components**

Append this test:

```ts
it('exports rich registry entries for data primitives', () => {
  expect(uiComponentRegistry.table).toMatchObject({
    selector: 'vr-table',
    nativeTag: 'table',
    category: 'data',
    phase: '16E',
    docsPath: '/docs/components/tables',
  });
  expect(uiComponentRegistry.table.tokens.density.values.map((value) => value.value)).toEqual([
    'comfortable',
    'compact',
    'dense',
  ]);
  expect(uiComponentRegistry.table.booleans.map((item) => item.name)).toEqual([
    'sortable',
    'filterable',
    'paginated',
    'selectable',
    'loading',
  ]);
  expect(uiComponentRegistry.table.openAttributes.map((item) => item.name)).toContain('page-size');
  expect(uiComponentRegistry.pagination.tokens.variant.values.map((value) => value.value)).toEqual([
    'default',
    'compact',
    'numbers',
  ]);
});
```

- [x] **Step 6: Add compatibility metadata red test**

Append this test:

```ts
it('derives compatibility metadata for Phase 16E primitives', () => {
  expect(uiPrimitive.input).toMatchObject({
    type: uiPrimitiveType.input,
    directory: 'src/ui/input',
    selector: 'vr-input',
    nativeTag: 'input',
    baseClass: 'vr-input',
    productionPhase: '16E',
  });
  expect(uiPrimitiveTokenGroup.input.size.tokens).toEqual(['xs', 'sm', 'md', 'lg', 'xl']);
  expect(uiPrimitiveTokenGroup.input.type.classByToken.email).toBe('vr-input-type-email');
  expect(uiComponentCatalog.table).toMatchObject({
    selector: 'vr-table',
    nativeTag: 'table',
    productionPhase: '16E',
    status: 'compiler-lowered',
  });
});
```

- [x] **Step 7: Run UI metadata tests and confirm failure**

Run:

```bash
pnpm --filter @vanrot/ui test -- tests/metadata.test.ts
```

Expected: fails because `uiComponentRegistry`, Phase 16E primitive types, and rich token exports do not exist yet.

## Task 2: Implement Rich UI Registry

**Files:**

- Create: `packages/ui/src/registry/token-scales.ts`
- Create: `packages/ui/src/registry/component-registry.ts`
- Modify: `packages/ui/src/metadata.ts`
- Modify: `packages/ui/src/index.ts`
- Modify: `packages/ui/tests/metadata.test.ts`

- [x] **Step 1: Create token scale module**

Create `packages/ui/src/registry/token-scales.ts`:

```ts
export interface UiTokenValue {
  value: string;
  label: string;
  description: string;
}

export const uiSizeToken = ['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;

export const uiToneToken = [
  'default',
  'secondary',
  'muted',
  'info',
  'success',
  'warning',
  'danger',
  'outline',
] as const;

export const uiDensityToken = ['comfortable', 'compact', 'dense'] as const;
export const uiInputTypeToken = ['text', 'email', 'password', 'number', 'search', 'tel', 'url'] as const;
export const uiControlShapeToken = ['default', 'pill', 'square'] as const;
export const uiListMarkerToken = ['none', 'disc', 'decimal', 'check'] as const;
export const uiStatAlignToken = ['left', 'center', 'right'] as const;
export const uiPaginationVariantToken = ['default', 'compact', 'numbers'] as const;

export function describeTokenValues(values: readonly string[], labelPrefix: string): readonly UiTokenValue[] {
  return values.map((value) => ({
    value,
    label: `${labelPrefix} ${value}`,
    description: `${labelPrefix} token ${value}.`,
  }));
}
```

- [x] **Step 2: Create component registry types and helpers**

Create the top of `packages/ui/src/registry/component-registry.ts`:

```ts
import {
  describeTokenValues,
  uiDensityToken,
  uiInputTypeToken,
  uiListMarkerToken,
  uiPaginationVariantToken,
  uiSizeToken,
  uiStatAlignToken,
  uiToneToken,
} from './token-scales.js';

export interface UiTokenGroupRegistry {
  name: string;
  defaultValue: string;
  values: readonly {
    value: string;
    label: string;
    description: string;
    className: string;
  }[];
}

export interface UiAttributeRegistryItem {
  name: string;
  description: string;
}

export interface UiComponentRegistryItem {
  type: string;
  selector: string;
  nativeTag: string;
  baseClass: string;
  category: 'core' | 'layout' | 'forms' | 'data';
  phase: '16A' | '16B' | '16C' | '16D' | '16E' | '16F';
  docsPath: string;
  tokens: Readonly<Record<string, UiTokenGroupRegistry>>;
  booleans: readonly UiAttributeRegistryItem[];
  openAttributes: readonly UiAttributeRegistryItem[];
  events: readonly UiAttributeRegistryItem[];
  slots: readonly UiAttributeRegistryItem[];
  examples: readonly {
    label: string;
    code: string;
  }[];
  accessibility: readonly string[];
}

function tokenGroup(
  name: string,
  values: readonly string[],
  defaultValue: string,
  classNameForValue: (value: string) => string,
): UiTokenGroupRegistry {
  return {
    name,
    defaultValue,
    values: describeTokenValues(values, name).map((value) => ({
      ...value,
      className: value.value === defaultValue ? '' : classNameForValue(value.value),
    })),
  };
}
```

- [x] **Step 3: Add shared registry attribute constants**

Continue `packages/ui/src/registry/component-registry.ts`:

```ts
const formControlOpenAttributes = [
  { name: 'id', description: 'Native id used by labels and descriptions.' },
  { name: 'name', description: 'Form field name used by Vanrot form state.' },
  { name: 'value', description: 'Initial native value.' },
  { name: 'placeholder', description: 'Native placeholder text.' },
  { name: 'autocomplete', description: 'Native autocomplete hint.' },
  { name: 'aria-label', description: 'Accessible label when no visible label exists.' },
  { name: 'aria-describedby', description: 'Description or error element ids.' },
] as const;

const formControlBooleans = [
  { name: 'required', description: 'Marks the field required in native and Vanrot validation.' },
  { name: 'disabled', description: 'Prevents input and removes the control from submit state.' },
  { name: 'readonly', description: 'Prevents editing while preserving the value.' },
  { name: 'autofocus', description: 'Requests focus when the view mounts.' },
] as const;

const formEvents = [
  { name: 'submit', description: 'Emitted when Vanrot submit orchestration succeeds.' },
  { name: 'reset', description: 'Emitted when the form resets controlled values.' },
  { name: 'invalid', description: 'Emitted when validation blocks submission.' },
  { name: 'valid', description: 'Emitted when validation passes.' },
] as const;

const tableBooleans = [
  { name: 'sortable', description: 'Enables header-driven client sorting.' },
  { name: 'filterable', description: 'Enables client filtering through the table helper.' },
  { name: 'paginated', description: 'Enables page windowing.' },
  { name: 'selectable', description: 'Enables row selection state.' },
  { name: 'loading', description: 'Marks the table busy and shows loading state styles.' },
] as const;
```

- [x] **Step 4: Add Phase 16E registry entries**

Continue `packages/ui/src/registry/component-registry.ts` with entries for every Phase 16E primitive. Use this exact shape for `input` and `table`, then add the rest using the selector, native tag, docs path, token groups, booleans, open attributes, events, and slots from the Component Registry Attribute Matrix:

```ts
export const uiComponentRegistry = {
  input: {
    type: 'input',
    selector: 'vr-input',
    nativeTag: 'input',
    baseClass: 'vr-input',
    category: 'forms',
    phase: '16E',
    docsPath: '/docs/components/inputs',
    tokens: {
      size: tokenGroup('size', ['xs', 'sm', 'md', 'lg', 'xl'], 'md', (value) => `vr-input-size-${value}`),
      tone: tokenGroup(
        'tone',
        ['default', 'success', 'warning', 'danger'],
        'default',
        (value) => `vr-input-tone-${value}`,
      ),
      type: tokenGroup(
        'type',
        ['text', 'email', 'password', 'number', 'search', 'tel', 'url'],
        'text',
        (value) => `vr-input-type-${value}`,
      ),
    },
    booleans: formControlBooleans,
    openAttributes: formControlOpenAttributes,
    events: [
      { name: 'input', description: 'Native input event used by controlled form state.' },
      { name: 'change', description: 'Native change event used by validation state.' },
      { name: 'blur', description: 'Marks the field touched.' },
    ],
    slots: [],
    examples: [
      {
        label: 'Email input',
        code: '<vr-input type.email size.md name=\"email\" placeholder=\"Email\"></vr-input>',
      },
    ],
    accessibility: [
      'Use a visible <vr-label> or aria-label.',
      'Validation sets aria-invalid and aria-describedby when an error element is present.',
    ],
  },
  table: {
    type: 'table',
    selector: 'vr-table',
    nativeTag: 'table',
    baseClass: 'vr-table',
    category: 'data',
    phase: '16E',
    docsPath: '/docs/components/tables',
    tokens: {
      density: tokenGroup(
        'density',
        ['comfortable', 'compact', 'dense'],
        'comfortable',
        (value) => `vr-table-density-${value}`,
      ),
      tone: tokenGroup('tone', ['default', 'muted'], 'default', (value) => `vr-table-tone-${value}`),
    },
    booleans: tableBooleans,
    openAttributes: [
      { name: 'aria-label', description: 'Accessible table label.' },
      { name: 'page-size', description: 'Client page size when paginated is present.' },
      { name: 'filter', description: 'Client filter text when filterable is present.' },
    ],
    events: [
      { name: 'sort', description: 'Emitted when a sortable header changes order.' },
      { name: 'page', description: 'Emitted when pagination state changes.' },
      { name: 'select', description: 'Emitted when row selection changes.' },
    ],
    slots: [{ name: 'default', description: 'Native table children.' }],
    examples: [
      {
        label: 'Invoice table',
        code: '<vr-table density.compact sortable filterable paginated selectable aria-label=\"Invoices\"></vr-table>',
      },
    ],
    accessibility: [
      'Use <vr-table-caption> or aria-label.',
      'Sortable headers expose aria-sort.',
      'Loading tables expose aria-busy.',
    ],
  },
} as const satisfies Record<string, UiComponentRegistryItem>;

export type UiComponentRegistry = typeof uiComponentRegistry;
```

Add entries for `form`, `formField`, `label`, `textarea`, `select`, `checkbox`, `radioGroup`, `radio`, `switch`, `slider`, `tableHeader`, `tableBody`, `tableRow`, `tableHead`, `tableCell`, `tableFooter`, `tableCaption`, `pagination`, `list`, `listItem`, `stat`, and `emptyState` in the same object before running tests.

- [x] **Step 5: Extend primitive metadata**

In `packages/ui/src/metadata.ts`, add the Phase 16E primitive types to `uiPrimitiveType`, append them to `uiPrimitiveOrder`, add `uiPrimitiveVariant` empty arrays where the rich registry token names replace the old `variants` concept, and add `uiPrimitive` entries with these docs path names:

```ts
docsPath: '/docs/components/inputs'
docsPath: '/docs/components/tables'
docsPath: '/docs/components/paginations'
```

Use plural route paths for docs pages and singular `src/ui/<primitive>` directories.

- [x] **Step 6: Derive compatibility token groups from registry**

Replace manual Phase 16E token group duplication with registry-derived `UiPrimitiveTokenGroup` entries. Keep existing Phase 16B and Phase 16D behavior unchanged.

```ts
function registryTokenGroupToPrimitiveTokenGroup(group: UiTokenGroupRegistry): UiPrimitiveTokenGroup {
  return {
    defaultToken: group.defaultValue,
    tokens: group.values.map((value) => value.value),
    classByToken: Object.fromEntries(group.values.map((value) => [value.value, value.className])),
  };
}
```

- [x] **Step 7: Export registry modules**

Update `packages/ui/src/index.ts`:

```ts
export * from './metadata.js';
export * from './registry/component-registry.js';
export * from './registry/token-scales.js';
```

- [x] **Step 8: Run UI metadata tests**

Run:

```bash
pnpm --filter @vanrot/ui test -- tests/metadata.test.ts
```

Expected: passes.

## Task 3: Add Runtime Form Controller

**Files:**

- Create: `packages/runtime/src/forms/form-controller.ts`
- Create: `packages/runtime/tests/forms/form-controller.test.ts`
- Modify: `packages/runtime/src/index.ts`
- Modify: `packages/runtime/src/internal.ts`
- Modify: `packages/runtime/tests/exports/exports.test.ts`

- [x] **Step 1: Write form controller red tests**

Create `packages/runtime/tests/forms/form-controller.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  connectFormController,
  createFormController,
  type FormValidator,
} from '../../src/forms/form-controller.js';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('form controller', () => {
  it('tracks named field values from input and change events', () => {
    document.body.innerHTML = '<form><input name="email" value="old@example.com"></form>';
    const form = document.querySelector('form');
    const input = document.querySelector('input');

    if (form === null || input === null) {
      throw new Error('Expected form and input.');
    }

    const controller = createFormController();
    const disconnect = connectFormController(form, controller);

    input.value = 'new@example.com';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    expect(controller.value()).toEqual({ email: 'new@example.com' });

    disconnect();
  });

  it('sets required errors and aria-invalid on submit', () => {
    document.body.innerHTML = '<form><input name="email" required></form>';
    const form = document.querySelector('form');
    const input = document.querySelector('input');

    if (form === null || input === null) {
      throw new Error('Expected form and input.');
    }

    const controller = createFormController();
    connectFormController(form, controller);

    form.dispatchEvent(new SubmitEvent('submit', { bubbles: true, cancelable: true }));

    expect(controller.errors()).toEqual({ email: 'This field is required.' });
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.dataset.vrInvalid).toBe('true');
  });

  it('supports custom validators and successful submit callbacks', () => {
    document.body.innerHTML = '<form><input name="amount" value="5"></form>';
    const form = document.querySelector('form');
    const input = document.querySelector('input');

    if (form === null || input === null) {
      throw new Error('Expected form and input.');
    }

    const validator: FormValidator = (value) => {
      return Number(value.amount) > 10 ? null : { amount: 'Amount must be more than 10.' };
    };
    const onSubmit = vi.fn();
    const controller = createFormController({ validators: [validator], onSubmit });
    connectFormController(form, controller);

    form.dispatchEvent(new SubmitEvent('submit', { bubbles: true, cancelable: true }));
    expect(controller.errors()).toEqual({ amount: 'Amount must be more than 10.' });
    expect(onSubmit).not.toHaveBeenCalled();

    input.value = '15';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    form.dispatchEvent(new SubmitEvent('submit', { bubbles: true, cancelable: true }));

    expect(controller.errors()).toEqual({});
    expect(onSubmit).toHaveBeenCalledWith({ amount: '15' }, expect.any(SubmitEvent));
  });

  it('resets values and clears validation state', () => {
    document.body.innerHTML = '<form><input name="email" value="start@example.com" required></form>';
    const form = document.querySelector('form');
    const input = document.querySelector('input');

    if (form === null || input === null) {
      throw new Error('Expected form and input.');
    }

    const controller = createFormController();
    connectFormController(form, controller);

    input.value = '';
    form.dispatchEvent(new SubmitEvent('submit', { bubbles: true, cancelable: true }));
    expect(input.getAttribute('aria-invalid')).toBe('true');

    form.dispatchEvent(new Event('reset', { bubbles: true, cancelable: true }));

    expect(controller.value()).toEqual({ email: 'start@example.com' });
    expect(controller.errors()).toEqual({});
    expect(input.hasAttribute('aria-invalid')).toBe(false);
  });
});
```

- [x] **Step 2: Run form controller tests and confirm failure**

Run:

```bash
pnpm --filter @vanrot/runtime test -- tests/forms/form-controller.test.ts
```

Expected: fails because the form controller module does not exist.

- [x] **Step 3: Implement form controller public API**

Create `packages/runtime/src/forms/form-controller.ts`:

```ts
import { listen } from '../events/listen.js';
import { signal, type WritableSignal } from '../reactive/signal.js';

export type FormValue = Record<string, string | boolean | string[]>;
export type FormErrors = Record<string, string>;
export type FormValidator = (value: FormValue, form: HTMLFormElement) => FormErrors | null;

export interface FormControllerOptions {
  validators?: readonly FormValidator[];
  onSubmit?: (value: FormValue, event: SubmitEvent) => void | Promise<void>;
}

export interface FormController {
  value: WritableSignal<FormValue>;
  errors: WritableSignal<FormErrors>;
  touched: WritableSignal<Record<string, boolean>>;
  validate(form: HTMLFormElement): boolean;
  submit(form: HTMLFormElement, event: SubmitEvent): boolean;
  reset(form: HTMLFormElement): void;
}

export function createFormController(options: FormControllerOptions = {}): FormController {
  const value = signal<FormValue>({});
  const errors = signal<FormErrors>({});
  const touched = signal<Record<string, boolean>>({});

  const controller: FormController = {
    value,
    errors,
    touched,
    validate(form) {
      const nextValue = readFormValue(form);
      const nextErrors = validateForm(form, nextValue, options.validators ?? []);
      value.set(nextValue);
      errors.set(nextErrors);
      applyValidationState(form, nextErrors);
      return Object.keys(nextErrors).length === 0;
    },
    submit(form, event) {
      const valid = controller.validate(form);
      if (!valid) {
        form.dispatchEvent(new CustomEvent('invalid', { bubbles: true }));
        return false;
      }

      form.dispatchEvent(new CustomEvent('valid', { bubbles: true }));
      void options.onSubmit?.(controller.value(), event);
      return true;
    },
    reset(form) {
      form.reset();
      value.set(readFormValue(form));
      errors.set({});
      touched.set({});
      clearValidationState(form);
    },
  };

  return controller;
}

export function connectFormController(form: HTMLFormElement, controller: FormController): () => void {
  controller.value.set(readFormValue(form));

  const removeInput = listen(form, 'input', (event) => {
    const target = event.target;
    if (!isNamedField(target)) {
      return;
    }
    controller.value.set(readFormValue(form));
  });

  const removeChange = listen(form, 'change', (event) => {
    const target = event.target;
    if (!isNamedField(target)) {
      return;
    }
    controller.value.set(readFormValue(form));
  });

  const removeBlur = listen(
    form,
    'blur',
    (event) => {
      const target = event.target;
      if (!isNamedField(target)) {
        return;
      }
      controller.touched.set({ ...controller.touched(), [target.name]: true });
    },
    true,
  );

  const removeSubmit = listen(form, 'submit', (event) => {
    event.preventDefault();
    const submitEvent = event as SubmitEvent;
    controller.submit(form, submitEvent);
  });

  const removeReset = listen(form, 'reset', () => {
    queueMicrotask(() => controller.reset(form));
  });

  return () => {
    removeInput();
    removeChange();
    removeBlur();
    removeSubmit();
    removeReset();
  };
}
```

Complete the same file with helpers named exactly:

```ts
function readFormValue(form: HTMLFormElement): FormValue
function validateForm(
  form: HTMLFormElement,
  value: FormValue,
  validators: readonly FormValidator[],
): FormErrors
function applyValidationState(form: HTMLFormElement, errors: FormErrors): void
function clearValidationState(form: HTMLFormElement): void
function isNamedField(target: EventTarget | null): target is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
```

These helpers must handle `required`, `type="email"`, `type="number"`, checkbox boolean values, radio group selected value, and custom validator errors.

- [x] **Step 4: Export form controller**

Update `packages/runtime/src/index.ts`:

```ts
export type {
  FormController,
  FormControllerOptions,
  FormErrors,
  FormValidator,
  FormValue,
} from './forms/form-controller.js';
export { connectFormController, createFormController } from './forms/form-controller.js';
```

Update `packages/runtime/src/internal.ts`:

```ts
export { connectFormController } from './forms/form-controller.js';
```

- [x] **Step 5: Add export tests**

Update `packages/runtime/tests/exports/exports.test.ts` to assert:

```ts
expect(await import('../../src/index.js')).toHaveProperty('createFormController');
expect(await import('../../src/internal.js')).toHaveProperty('connectFormController');
```

- [x] **Step 6: Run runtime form tests**

Run:

```bash
pnpm --filter @vanrot/runtime test -- tests/forms/form-controller.test.ts tests/exports/exports.test.ts
```

Expected: passes.

## Task 4: Add Runtime Table Controller

**Files:**

- Create: `packages/runtime/src/ui/table-controller.ts`
- Create: `packages/runtime/tests/ui/table-controller.test.ts`
- Modify: `packages/runtime/src/internal.ts`
- Modify: `packages/runtime/tests/exports/exports.test.ts`

- [x] **Step 1: Write table controller red tests**

Create `packages/runtime/tests/ui/table-controller.test.ts`:

```ts
import { afterEach, describe, expect, it } from 'vitest';
import { connectTableController } from '../../src/ui/table-controller.js';

afterEach(() => {
  document.body.innerHTML = '';
});

function renderTable() {
  document.body.innerHTML = `
    <input data-vr-table-filter value="">
    <table sortable filterable paginated selectable page-size="2">
      <thead>
        <tr>
          <th sort-key="name">Name</th>
          <th sort-key="amount">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr data-row-id="a"><td>Aster</td><td>30</td></tr>
        <tr data-row-id="b"><td>Bloom</td><td>10</td></tr>
        <tr data-row-id="c"><td>Cedar</td><td>20</td></tr>
      </tbody>
    </table>
  `;

  const table = document.querySelector('table');
  const filter = document.querySelector<HTMLInputElement>('[data-vr-table-filter]');

  if (table === null || filter === null) {
    throw new Error('Expected table and filter input.');
  }

  return { table, filter };
}

describe('table controller', () => {
  it('sorts rows by sortable headers and updates aria-sort', () => {
    const { table } = renderTable();
    const disconnect = connectTableController(table);
    const amountHeader = table.querySelector('th[sort-key="amount"]');

    if (amountHeader === null) {
      throw new Error('Expected amount header.');
    }

    amountHeader.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect([...table.querySelectorAll('tbody tr')].map((row) => row.textContent?.trim())).toEqual([
      'Bloom10',
      'Cedar20',
      'Aster30',
    ]);
    expect(amountHeader.getAttribute('aria-sort')).toBe('ascending');

    disconnect();
  });

  it('filters rows using the paired filter input', () => {
    const { table, filter } = renderTable();
    connectTableController(table, { filter });

    filter.value = 'cedar';
    filter.dispatchEvent(new Event('input', { bubbles: true }));

    expect([...table.querySelectorAll('tbody tr')].map((row) => row.hidden)).toEqual([
      true,
      true,
      false,
    ]);
  });

  it('paginates visible rows by page size', () => {
    const { table } = renderTable();
    const controller = connectTableController(table);

    expect([...table.querySelectorAll('tbody tr')].map((row) => row.hidden)).toEqual([
      false,
      false,
      true,
    ]);

    controller.nextPage();

    expect([...table.querySelectorAll('tbody tr')].map((row) => row.hidden)).toEqual([
      true,
      true,
      false,
    ]);

    controller.disconnect();
  });

  it('tracks selected rows by row id', () => {
    const { table } = renderTable();
    const controller = connectTableController(table);
    const firstRow = table.querySelector('tbody tr');

    if (firstRow === null) {
      throw new Error('Expected first row.');
    }

    firstRow.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(controller.selected()).toEqual(['a']);
    expect(firstRow.getAttribute('aria-selected')).toBe('true');
  });
});
```

- [x] **Step 2: Run table controller tests and confirm failure**

Run:

```bash
pnpm --filter @vanrot/runtime test -- tests/ui/table-controller.test.ts
```

Expected: fails because the table controller module does not exist.

- [x] **Step 3: Implement table controller**

Create `packages/runtime/src/ui/table-controller.ts` with this public shape:

```ts
import { listen } from '../events/listen.js';
import { signal, type WritableSignal } from '../reactive/signal.js';

export interface TableControllerOptions {
  filter?: HTMLInputElement;
}

export interface ConnectedTableController {
  selected: WritableSignal<readonly string[]>;
  nextPage(): void;
  previousPage(): void;
  disconnect(): void;
}

export function connectTableController(
  table: HTMLTableElement,
  options: TableControllerOptions = {},
): ConnectedTableController {
  const selected = signal<readonly string[]>([]);
  const page = signal(0);
  const pageSize = readPageSize(table);
  const disconnectors: (() => void)[] = [];

  if (table.hasAttribute('sortable')) {
    connectSorting(table, disconnectors);
  }

  if (table.hasAttribute('filterable') && options.filter !== undefined) {
    disconnectors.push(listen(options.filter, 'input', () => applyRows(table, page(), pageSize, options.filter?.value ?? '')));
  }

  if (table.hasAttribute('selectable')) {
    connectSelection(table, selected, disconnectors);
  }

  applyRows(table, page(), pageSize, options.filter?.value ?? '');

  return {
    selected,
    nextPage() {
      page.set(page() + 1);
      applyRows(table, page(), pageSize, options.filter?.value ?? '');
    },
    previousPage() {
      page.set(Math.max(0, page() - 1));
      applyRows(table, page(), pageSize, options.filter?.value ?? '');
    },
    disconnect() {
      for (const disconnect of disconnectors) {
        disconnect();
      }
    },
  };
}
```

Complete the same file with helpers named exactly:

```ts
function readPageSize(table: HTMLTableElement): number
function connectSorting(table: HTMLTableElement, disconnectors: (() => void)[]): void
function connectSelection(
  table: HTMLTableElement,
  selected: WritableSignal<readonly string[]>,
  disconnectors: (() => void)[],
): void
function applyRows(table: HTMLTableElement, page: number, pageSize: number, filter: string): void
```

Sorting must read `sort-key` on `<th>`, use the header index, toggle `aria-sort` between `ascending` and `descending`, and sort `<tbody>` rows in place.

- [x] **Step 4: Export table controller internally**

Update `packages/runtime/src/internal.ts`:

```ts
export { connectTableController } from './ui/table-controller.js';
```

- [x] **Step 5: Add export test**

Update `packages/runtime/tests/exports/exports.test.ts`:

```ts
expect(await import('../../src/internal.js')).toHaveProperty('connectTableController');
```

- [x] **Step 6: Run table controller tests**

Run:

```bash
pnpm --filter @vanrot/runtime test -- tests/ui/table-controller.test.ts tests/exports/exports.test.ts
```

Expected: passes.

## Task 5: Add Phase 16E UI Primitive Assets And Styles

**Files:**

- Create: `packages/ui/src/primitives/form/ui.form.ts`
- Create: `packages/ui/src/primitives/form/ui.form.html`
- Create: `packages/ui/src/primitives/form/ui.form.css`
- Create: `packages/ui/src/primitives/form/ui.form.test.ts`
- Create: `packages/ui/src/primitives/form/usage.home.html`
- Create the same five-file set for `form-field`, `label`, `input`, `textarea`, `select`, `checkbox`, `radio-group`, `radio`, `switch`, `slider`, `table`, `table-header`, `table-body`, `table-row`, `table-head`, `table-cell`, `table-footer`, `table-caption`, `pagination`, `list`, `list-item`, `stat`, and `empty-state`.
- Modify: `packages/ui/src/styles/vanrotstyles.css`
- Modify: `packages/ui/tests/assets.test.ts`
- Modify: `packages/ui/src/metadata.ts`

- [x] **Step 1: Add asset tests for Phase 16E primitive files**

Update `packages/ui/tests/assets.test.ts` with an array named `phase16FormsDataPrimitiveFiles`:

```ts
const phase16FormsDataPrimitiveFiles = [
  'form',
  'form-field',
  'label',
  'input',
  'textarea',
  'select',
  'checkbox',
  'radio-group',
  'radio',
  'switch',
  'slider',
  'table',
  'table-header',
  'table-body',
  'table-row',
  'table-head',
  'table-cell',
  'table-footer',
  'table-caption',
  'pagination',
  'list',
  'list-item',
  'stat',
  'empty-state',
] as const;

it('ships Phase 16E primitive source assets', async () => {
  for (const primitive of phase16FormsDataPrimitiveFiles) {
    await expect(readAsset(`src/primitives/${primitive}/ui.${primitive}.ts`)).resolves.toContain(
      'export class',
    );
    await expect(readAsset(`src/primitives/${primitive}/ui.${primitive}.html`)).resolves.toContain(
      '<slot></slot>',
    );
    await expect(readAsset(`src/primitives/${primitive}/ui.${primitive}.css`)).resolves.toContain(
      `.vr-${primitive}`,
    );
    await expect(readAsset(`src/primitives/${primitive}/usage.home.html`)).resolves.toContain(
      `<vr-${primitive}`,
    );
  }
});
```

- [x] **Step 2: Add no string finite-token usage guard**

Update `packages/ui/tests/assets.test.ts`:

```ts
it('uses dotted attributes for Phase 16E finite tokens in usage snippets', async () => {
  const inputUsage = await readAsset('src/primitives/input/usage.home.html');
  const tableUsage = await readAsset('src/primitives/table/usage.home.html');

  expect(inputUsage).toContain('type.email');
  expect(inputUsage).toContain('size.md');
  expect(inputUsage).not.toContain('type="email"');
  expect(inputUsage).not.toContain('size="md"');
  expect(tableUsage).toContain('density.compact');
  expect(tableUsage).not.toContain('density="compact"');
});
```

- [x] **Step 3: Run UI asset tests and confirm failure**

Run:

```bash
pnpm --filter @vanrot/ui test -- tests/assets.test.ts
```

Expected: fails because Phase 16E primitive files do not exist.

- [x] **Step 4: Create primitive source files**

For each Phase 16E primitive, create a `.ts` file with this shape, replacing `UiInput` and `inputCopy` with the primitive class and source-owned copy:

```ts
import { signal } from '@vanrot/runtime';

const inputCopy = {
  label: 'Input',
} as const;

export class UiInput {
  label = signal(inputCopy.label);
}
```

For each Phase 16E primitive, create a `.html` file with only:

```html
<slot></slot>
```

For each Phase 16E primitive, create a `.css` file with a base class matching the primitive:

```css
.vr-input {
  display: block;
}
```

For each Phase 16E primitive, create a `usage.home.html` snippet. Use this exact `input` usage:

```html
<vr-form>
  <vr-form-field>
    <vr-label for="email">Email</vr-label>
    <vr-input id="email" name="email" type.email size.md placeholder="Email"></vr-input>
  </vr-form-field>
</vr-form>
```

Use this exact `table` usage:

```html
<vr-table density.compact sortable filterable paginated selectable aria-label="Invoices">
  <vr-table-header>
    <vr-table-row>
      <vr-table-head sort-key="invoice">Invoice</vr-table-head>
      <vr-table-head sort-key="amount">Amount</vr-table-head>
    </vr-table-row>
  </vr-table-header>
  <vr-table-body>
    <vr-table-row data-row-id="inv-001">
      <vr-table-cell>INV-001</vr-table-cell>
      <vr-table-cell>240.00</vr-table-cell>
    </vr-table-row>
  </vr-table-body>
</vr-table>
```

- [x] **Step 5: Add `vanrotstyles.css` form styles**

Append Phase 16E form styles to `packages/ui/src/styles/vanrotstyles.css`:

```css
.vr-form {
  display: grid;
  gap: var(--vr-space-4);
}

.vr-form-field {
  display: grid;
  gap: var(--vr-space-2);
}

.vr-label {
  color: var(--vr-color-text);
  font-size: var(--vr-font-size-sm);
  font-weight: 500;
}

.vr-input,
.vr-textarea,
.vr-select {
  width: 100%;
  border: 1px solid var(--vr-color-border);
  border-radius: var(--vr-radius-md);
  background: var(--vr-color-surface);
  color: var(--vr-color-text);
  font: inherit;
}

.vr-input-size-xs,
.vr-select-size-xs {
  min-height: 2rem;
  padding: 0 var(--vr-space-2);
}

.vr-input-size-sm,
.vr-select-size-sm,
.vr-textarea-size-sm {
  min-height: 2.25rem;
  padding: 0 var(--vr-space-3);
}

.vr-input-size-md,
.vr-select-size-md,
.vr-textarea-size-md {
  min-height: 2.5rem;
  padding: 0 var(--vr-space-3);
}

.vr-input-size-lg,
.vr-select-size-lg,
.vr-textarea-size-lg {
  min-height: 2.875rem;
  padding: 0 var(--vr-space-4);
}

.vr-input-size-xl,
.vr-select-size-xl,
.vr-textarea-size-xl {
  min-height: 3.25rem;
  padding: 0 var(--vr-space-5);
}

.vr-input-tone-danger,
.vr-textarea-tone-danger,
.vr-select-tone-danger {
  border-color: var(--vr-color-danger);
}

.vr-input[data-vr-invalid='true'],
.vr-textarea[data-vr-invalid='true'],
.vr-select[data-vr-invalid='true'] {
  border-color: var(--vr-color-danger);
}
```

- [x] **Step 6: Add `vanrotstyles.css` data styles**

Append:

```css
.vr-table {
  width: 100%;
  border-collapse: collapse;
  color: var(--vr-color-text);
  font-variant-numeric: tabular-nums lining-nums;
}

.vr-table th,
.vr-table td {
  border-bottom: 1px solid var(--vr-color-border);
  text-align: left;
}

.vr-table-density-comfortable th,
.vr-table-density-comfortable td {
  padding: var(--vr-space-3) var(--vr-space-4);
}

.vr-table-density-compact th,
.vr-table-density-compact td {
  padding: var(--vr-space-2) var(--vr-space-3);
}

.vr-table-density-dense th,
.vr-table-density-dense td {
  padding: var(--vr-space-1) var(--vr-space-2);
}

.vr-table[aria-busy='true'] {
  opacity: 0.72;
}

.vr-pagination {
  display: flex;
  align-items: center;
  gap: var(--vr-space-2);
}

.vr-list {
  display: grid;
  gap: var(--vr-space-2);
  margin: 0;
  padding: 0;
}

.vr-list-marker-disc {
  padding-left: var(--vr-space-5);
  list-style: disc;
}

.vr-list-marker-decimal {
  padding-left: var(--vr-space-5);
  list-style: decimal;
}

.vr-stat {
  display: grid;
  gap: var(--vr-space-1);
}

.vr-empty-state {
  display: grid;
  place-items: center;
  gap: var(--vr-space-3);
  min-height: 12rem;
  border: 1px dashed var(--vr-color-border);
  border-radius: var(--vr-radius-lg);
}
```

- [x] **Step 7: Run UI package tests**

Run:

```bash
pnpm --filter @vanrot/ui test
```

Expected: passes.

## Task 6: Lower Phase 16E Tags In The Compiler

**Files:**

- Modify: `packages/compiler/src/api/types.ts`
- Modify: `packages/compiler/src/codegen/ui-elements.ts`
- Modify: `packages/compiler/src/codegen/ui-token-attributes.ts`
- Modify: `packages/compiler/src/codegen/generate-component.ts`
- Modify: `packages/compiler/tests/codegen/ui-token-attributes.test.ts`
- Modify: `packages/compiler/tests/codegen/generate-component.test.ts`

- [x] **Step 1: Add compiler red tests for Phase 16E dotted tokens**

Append to `packages/compiler/tests/codegen/ui-token-attributes.test.ts`:

```ts
it('lowers Phase 16E form and data dotted tokens', () => {
  const result = compileTemplate(`
    <vr-input type.email size.md tone.danger name="email" class="flex"></vr-input>
    <vr-table density.compact sortable filterable paginated selectable></vr-table>
    <vr-pagination size.sm variant.numbers></vr-pagination>
  `);

  expect(result.diagnostics).toEqual([]);
  expect(result.js).toContain(
    "input0.setAttribute('class', 'vr-input vr-input-type-email vr-input-size-md vr-input-tone-danger flex');",
  );
  expect(result.js).toContain("input0.setAttribute('name', 'email');");
  expect(result.js).toContain(
    "table0.setAttribute('class', 'vr-table vr-table-density-compact');",
  );
  expect(result.js).toContain("table0.setAttribute('sortable', '');");
  expect(result.js).toContain("table0.setAttribute('filterable', '');");
  expect(result.js).toContain(
    "nav0.setAttribute('class', 'vr-pagination vr-pagination-size-sm vr-pagination-numbers');",
  );
  expect(result.js).not.toContain('type.email');
  expect(result.js).not.toContain('density.compact');
  expect(result.js).not.toContain('variant.numbers');
});
```

- [x] **Step 2: Add compiler red tests for invalid Phase 16E dotted tokens**

Append:

```ts
it('diagnoses invalid Phase 16E dotted token values', () => {
  const result = compileTemplate('<vr-input placeholder.email size.nano></vr-input>');

  expect(result.diagnostics).toEqual([
    expect.objectContaining({
      code: 'VR021',
      severity: 'error',
      message: expect.stringContaining('Unknown token "placeholder.email" for <vr-input>.'),
    }),
    expect.objectContaining({
      code: 'VR021',
      severity: 'error',
      message: expect.stringContaining('Unknown token "size.nano" for <vr-input>.'),
    }),
  ]);
});

it('keeps user utility classes after dotted token classes', () => {
  const result = compileTemplate('<vr-input size.md class="grid text-sm"></vr-input>');

  expect(result.diagnostics).toEqual([]);
  expect(result.js).toContain(
    "input0.setAttribute('class', 'vr-input vr-input-size-md grid text-sm');",
  );
});
```

- [x] **Step 3: Add compiler red tests for semantic lowering**

Append to `packages/compiler/tests/codegen/generate-component.test.ts`:

```ts
it('lowers Phase 16E form anatomy to native form controls', () => {
  const result = compileTemplate(`
    <vr-form>
      <vr-form-field>
        <vr-label for="email">Email</vr-label>
        <vr-input id="email" name="email" type.email required></vr-input>
      </vr-form-field>
    </vr-form>
  `);

  expect(result.diagnostics).toEqual([]);
  expect(result.js).toContain("document.createElement('form')");
  expect(result.js).toContain("document.createElement('label')");
  expect(result.js).toContain("document.createElement('input')");
  expect(result.js).toContain("input0.setAttribute('type', 'email');");
  expect(result.js).toContain("input0.setAttribute('required', '');");
  expect(result.js).toContain('connectFormController');
});

it('lowers Phase 16E table anatomy to native table elements', () => {
  const result = compileTemplate(`
    <vr-table density.compact sortable>
      <vr-table-header>
        <vr-table-row>
          <vr-table-head sort-key="name">Name</vr-table-head>
        </vr-table-row>
      </vr-table-header>
      <vr-table-body>
        <vr-table-row data-row-id="a">
          <vr-table-cell>Aster</vr-table-cell>
        </vr-table-row>
      </vr-table-body>
    </vr-table>
  `);

  expect(result.diagnostics).toEqual([]);
  expect(result.js).toContain("document.createElement('table')");
  expect(result.js).toContain("document.createElement('thead')");
  expect(result.js).toContain("document.createElement('tbody')");
  expect(result.js).toContain("document.createElement('th')");
  expect(result.js).toContain("document.createElement('td')");
  expect(result.js).toContain('connectTableController');
});
```

- [x] **Step 4: Run compiler red tests and confirm failure**

Run:

```bash
pnpm --filter @vanrot/compiler test -- tests/codegen/ui-token-attributes.test.ts tests/codegen/generate-component.test.ts
```

Expected: fails because Phase 16E compiler metadata and helper imports do not exist.

- [x] **Step 5: Extend compile feature names**

In `packages/compiler/src/api/types.ts`, add these `CompileFeature` values:

```ts
| 'ui-form'
| 'ui-form-field'
| 'ui-label'
| 'ui-input'
| 'ui-textarea'
| 'ui-select'
| 'ui-checkbox'
| 'ui-radio-group'
| 'ui-radio'
| 'ui-switch'
| 'ui-slider'
| 'ui-table'
| 'ui-table-header'
| 'ui-table-body'
| 'ui-table-row'
| 'ui-table-head'
| 'ui-table-cell'
| 'ui-table-footer'
| 'ui-table-caption'
| 'ui-pagination'
| 'ui-list'
| 'ui-list-item'
| 'ui-stat'
| 'ui-empty-state'
| 'form-controller'
| 'table-controller'
```

- [x] **Step 6: Extend compiler UI element mapping**

Update `packages/compiler/src/codegen/ui-elements.ts` by deriving from `uiComponentRegistry` where possible. The feature map must include every Phase 16E primitive:

```ts
const uiPrimitiveFeature = {
  ...existingPhase16FeatureNames,
  form: 'ui-form',
  formField: 'ui-form-field',
  label: 'ui-label',
  input: 'ui-input',
  textarea: 'ui-textarea',
  select: 'ui-select',
  checkbox: 'ui-checkbox',
  radioGroup: 'ui-radio-group',
  radio: 'ui-radio',
  switch: 'ui-switch',
  slider: 'ui-slider',
  table: 'ui-table',
  tableHeader: 'ui-table-header',
  tableBody: 'ui-table-body',
  tableRow: 'ui-table-row',
  tableHead: 'ui-table-head',
  tableCell: 'ui-table-cell',
  tableFooter: 'ui-table-footer',
  tableCaption: 'ui-table-caption',
  pagination: 'ui-pagination',
  list: 'ui-list',
  listItem: 'ui-list-item',
  stat: 'ui-stat',
  emptyState: 'ui-empty-state',
} as const satisfies Record<UiPrimitiveType, CompileFeature>;
```

- [x] **Step 7: Lower input type dotted token to native `type`**

Update `generateCompilerUiElement()` in `packages/compiler/src/codegen/generate-component.ts` so `<vr-input type.email>` writes `type="email"` and does not preserve `type.email`:

```ts
generateUiNativeTokenAttributes(elementName, state, uiElement, resolvedTokens.activeTokens);
```

Add helper:

```ts
function generateUiNativeTokenAttributes(
  elementName: string,
  state: GenerateState,
  uiElement: CompilerUiElement,
  activeTokens: Readonly<Record<string, string>>,
): void {
  if (uiElement.tagName === 'vr-input' && activeTokens.type !== undefined) {
    state.lines.push(
      `  ${elementName}.setAttribute(${quoteString('type')}, ${quoteString(activeTokens.type)});`,
    );
  }

  if (uiElement.tagName === 'vr-checkbox') {
    state.lines.push(`  ${elementName}.setAttribute(${quoteString('type')}, 'checkbox');`);
  }

  if (uiElement.tagName === 'vr-radio') {
    state.lines.push(`  ${elementName}.setAttribute(${quoteString('type')}, 'radio');`);
  }

  if (uiElement.tagName === 'vr-slider') {
    state.lines.push(`  ${elementName}.setAttribute(${quoteString('type')}, 'range');`);
  }
}
```

- [x] **Step 8: Wire form/table runtime helpers only when needed**

In `generateCompilerUiElement()`, track form and table elements:

```ts
if (uiElement.tagName === 'vr-form') {
  state.features.add('form-controller');
  state.usesFormController = true;
  state.lines.push(`  const ${elementName}Controller = createFormController();`);
}
```

After child generation and before parent append, connect helpers:

```ts
if (uiElement.tagName === 'vr-form') {
  state.lines.push(`  connectFormController(${elementName}, ${elementName}Controller);`);
}

if (uiElement.tagName === 'vr-table' && hasTableBehaviorAttribute(node)) {
  state.features.add('table-controller');
  state.usesTableController = true;
  state.lines.push(`  connectTableController(${elementName});`);
}
```

Add helper:

```ts
function hasTableBehaviorAttribute(node: ElementNode): boolean {
  return node.attributes.some((attribute) =>
    ['sortable', 'filterable', 'paginated', 'selectable', 'loading'].includes(attribute.name),
  );
}
```

- [x] **Step 9: Generate runtime imports**

Update `generateImports()` to import form/table helpers from `@vanrot/runtime/internal` when the state flags are set:

```ts
const runtimeInternalImports = [];

if (state.usesFormController) {
  runtimeInternalImports.push('connectFormController');
}

if (state.usesTableController) {
  runtimeInternalImports.push('connectTableController');
}
```

Keep `createFormController` imported from `@vanrot/runtime` because it is public:

```ts
if (state.usesFormController) {
  imports.push("import { createFormController } from '@vanrot/runtime';");
}
```

- [x] **Step 10: Run compiler tests**

Run:

```bash
pnpm --filter @vanrot/compiler test -- tests/codegen/ui-token-attributes.test.ts tests/codegen/generate-component.test.ts
```

Expected: passes.

## Task 7: Add CLI UI Discovery

**Files:**

- Create: `packages/cli/src/commands/ui.ts`
- Create: `packages/cli/tests/ui-command.test.ts`
- Modify: `packages/cli/src/cli.ts`
- Modify: `packages/cli/src/commands/metadata.ts`
- Modify: `packages/cli/tests/cli.test.ts`
- Modify: `packages/cli/tests/add.test.ts`

- [x] **Step 1: Add CLI UI command red tests**

Create `packages/cli/tests/ui-command.test.ts`:

```ts
import { runCli } from '@/index.js';
import { createMemoryReporter } from '@/reporter/reporter.js';
import { describe, expect, it } from 'vitest';

describe('vr ui', () => {
  it('lists UI components grouped by category', async () => {
    const reporter = createMemoryReporter();
    const result = await runCli(['ui', 'list'], {
      cwd: process.cwd(),
      reporter,
    });

    const out = reporter.output();

    expect(result.exitCode).toBe(0);
    expect(out).toContain('FORMS');
    expect(out).toContain('input');
    expect(out).toContain('textarea');
    expect(out).toContain('DATA');
    expect(out).toContain('table');
    expect(out).toContain('pagination');
  });

  it('prints rich component help with dotted tokens and open attributes', async () => {
    const reporter = createMemoryReporter();
    const result = await runCli(['ui', 'input', '--help'], {
      cwd: process.cwd(),
      reporter,
    });

    const out = reporter.output();

    expect(result.exitCode).toBe(0);
    expect(out).toContain('vr-input');
    expect(out).toContain('Usage   <vr-input type.email size.md name="email">');
    expect(out).toContain('Dotted tokens');
    expect(out).toContain('size: xs, sm, md, lg, xl');
    expect(out).toContain('tone: default, success, warning, danger');
    expect(out).toContain('type: text, email, password, number, search, tel, url');
    expect(out).toContain('Booleans');
    expect(out).toContain('required');
    expect(out).toContain('Open attributes');
    expect(out).toContain('placeholder');
    expect(out).toContain('/docs/components/inputs');
  });

  it('reports unknown UI components with supported names', async () => {
    const reporter = createMemoryReporter();
    const result = await runCli(['ui', 'calendar', '--help'], {
      cwd: process.cwd(),
      reporter,
    });

    expect(result.exitCode).toBe(1);
    expect(reporter.output()).toContain('Unknown UI component: calendar');
    expect(reporter.output()).toContain('Supported UI components:');
  });
});
```

- [x] **Step 2: Add root help red test**

Update `packages/cli/tests/cli.test.ts`:

```ts
expect(out).toContain('ui <component>             Inspect UI component attributes and examples');
expect(out).toContain('vr ui input --help');
```

- [x] **Step 3: Add `vr add` red tests for Phase 16E**

Update `packages/cli/tests/add.test.ts` with cases that call:

```ts
await runCli(['add', 'input'], { cwd, reporter });
await runCli(['add', 'table'], { cwd, reporter });
```

Assert these files exist after the command:

```ts
src/ui/input/ui.input.ts
src/ui/input/ui.input.html
src/ui/input/ui.input.css
src/ui/table/ui.table.ts
src/ui/table/ui.table.html
src/ui/table/ui.table.css
```

- [x] **Step 4: Run CLI red tests and confirm failure**

Run:

```bash
pnpm --filter @vanrot/cli test -- tests/ui-command.test.ts tests/cli.test.ts tests/add.test.ts
```

Expected: fails because the `ui` command and Phase 16E add assets are not wired.

- [x] **Step 5: Implement `ui` command**

Create `packages/cli/src/commands/ui.ts`:

```ts
import { uiComponentRegistry } from '@vanrot/ui';
import type { CommandContext, CommandResult } from '../result.js';
import { fail, ok } from '../result.js';

export async function uiCommand(args: string[], context: CommandContext): Promise<CommandResult> {
  const [target, flag] = args;

  if (target === undefined || target === 'list') {
    printUiList(context);
    return ok();
  }

  const component = uiComponentRegistry[target as keyof typeof uiComponentRegistry];

  if (component === undefined) {
    context.reporter.error(
      `Unknown UI component: ${target}`,
      `Supported UI components: ${Object.keys(uiComponentRegistry).sort().join(', ')}`,
    );
    return fail();
  }

  if (flag !== undefined && flag !== '--help' && flag !== '-h') {
    context.reporter.error(`Unknown ui option: ${flag}`, `Use: vr ui ${target} --help`);
    return fail();
  }

  printComponentHelp(context, component);
  return ok();
}
```

Complete the file with helpers named exactly:

```ts
function printUiList(context: CommandContext): void
function printComponentHelp(context: CommandContext, component: UiComponentRegistryItem): void
function formatTokenGroup(group: UiTokenGroupRegistry): string
function formatAttributeList(items: readonly UiAttributeRegistryItem[]): string
```

The output must include `Usage`, `Dotted tokens`, `Booleans`, `Open attributes`, `Events`, `Slots`, `Examples`, and `Docs`.

- [x] **Step 6: Register CLI command metadata**

Update `packages/cli/src/commands/metadata.ts` with:

```ts
ui: 'ui',
```

Add command metadata:

```ts
{
  name: commandName.ui,
  rootUsage: 'ui <component>',
  description: 'Inspect UI component attributes and examples',
  help: [
    'vr ui <component> --help',
    '',
    'Examples',
    '  vr ui input --help',
    '  vr ui table --help',
    '  vr ui list',
  ].join('\n'),
}
```

Add `ui` to the scaffold/help group after `add`.

- [x] **Step 7: Register CLI handler**

Update `packages/cli/src/cli.ts`:

```ts
import { uiCommand } from './commands/ui.js';
```

Add to `commandHandlers`:

```ts
[commandName.ui, uiCommand],
```

- [x] **Step 8: Run CLI tests**

Run:

```bash
pnpm --filter @vanrot/cli test -- tests/ui-command.test.ts tests/cli.test.ts tests/add.test.ts
```

Expected: passes.

## Task 8: Add Phase 16E Site Docs Pages

**Files:**

- Create: every `apps/vanrot-site/src/pages/components/component-*.page.ts/html/css` file listed in the file structure for Phase 16E.
- Modify: `apps/vanrot-site/src/routes.ts`
- Modify: `apps/vanrot-site/src/docs/component-doc-paths.ts`
- Modify: `apps/vanrot-site/src/docs/component-docs.ts`
- Modify: `apps/vanrot-site/src/docs/site-data.json`
- Modify: `apps/vanrot-site/src/docs/site-data.ts`
- Modify: `apps/vanrot-site/src/docs/site-navigation.ts`
- Modify: `apps/vanrot-site/tests/site-pages.test.ts`

- [x] **Step 1: Add docs path red tests**

Update `apps/vanrot-site/tests/site-pages.test.ts`:

```ts
const phase16FormsDataDocPages = [
  { primitive: 'form', title: 'Form', path: '/docs/components/forms', fileBase: 'component-form', routeKey: 'componentForms' },
  { primitive: 'form-field', title: 'Form Field', path: '/docs/components/form-fields', fileBase: 'component-form-field', routeKey: 'componentFormFields' },
  { primitive: 'label', title: 'Label', path: '/docs/components/labels', fileBase: 'component-label', routeKey: 'componentLabels' },
  { primitive: 'input', title: 'Input', path: '/docs/components/inputs', fileBase: 'component-input', routeKey: 'componentInputs' },
  { primitive: 'textarea', title: 'Textarea', path: '/docs/components/textareas', fileBase: 'component-textarea', routeKey: 'componentTextareas' },
  { primitive: 'select', title: 'Select', path: '/docs/components/selects', fileBase: 'component-select', routeKey: 'componentSelects' },
  { primitive: 'checkbox', title: 'Checkbox', path: '/docs/components/checkboxes', fileBase: 'component-checkbox', routeKey: 'componentCheckboxes' },
  { primitive: 'radio-group', title: 'Radio Group', path: '/docs/components/radio-groups', fileBase: 'component-radio-group', routeKey: 'componentRadioGroups' },
  { primitive: 'radio', title: 'Radio', path: '/docs/components/radios', fileBase: 'component-radio', routeKey: 'componentRadios' },
  { primitive: 'switch', title: 'Switch', path: '/docs/components/switches', fileBase: 'component-switch', routeKey: 'componentSwitches' },
  { primitive: 'slider', title: 'Slider', path: '/docs/components/sliders', fileBase: 'component-slider', routeKey: 'componentSliders' },
  { primitive: 'table', title: 'Table', path: '/docs/components/tables', fileBase: 'component-table', routeKey: 'componentTables' },
  { primitive: 'pagination', title: 'Pagination', path: '/docs/components/paginations', fileBase: 'component-pagination', routeKey: 'componentPaginations' },
  { primitive: 'list', title: 'List', path: '/docs/components/lists', fileBase: 'component-list', routeKey: 'componentLists' },
  { primitive: 'list-item', title: 'List Item', path: '/docs/components/list-items', fileBase: 'component-list-item', routeKey: 'componentListItems' },
  { primitive: 'stat', title: 'Stat', path: '/docs/components/stats', fileBase: 'component-stat', routeKey: 'componentStats' },
  { primitive: 'empty-state', title: 'Empty State', path: '/docs/components/empty-states', fileBase: 'component-empty-state', routeKey: 'componentEmptyStates' },
] as const;
```

- [x] **Step 2: Add sidebar and route red test**

Append:

```ts
it('routes Phase 16E component navigation to dedicated docs pages', async () => {
  const gallery = await readSiteFile('src/pages/components/component-gallery.page.html');
  const inputPage = await readSiteFile('src/pages/components/component-input.page.html');
  const tablePage = await readSiteFile('src/pages/components/component-table.page.html');
  const siteRoute = route as Record<string, { fullPath: string; kind: string; parent?: unknown }>;

  for (const page of phase16FormsDataDocPages) {
    expect(gallery).toContain(`<a class="nav-link" href="${page.path}">${page.title}</a>`);
    expect(inputPage).toContain(`<a class="nav-link" href="${page.path}">${page.title}</a>`);
    expect(tablePage).toContain(`<a class="nav-link" href="${page.path}">${page.title}</a>`);

    const routeEntry = siteRoute[page.routeKey];

    if (routeEntry === undefined) {
      throw new Error(`Expected ${page.routeKey} route to be defined.`);
    }

    expect(routeEntry).toMatchObject({
      fullPath: page.path,
      kind: 'page',
    });
  }
});
```

- [x] **Step 3: Add docs content red test**

Append:

```ts
it('documents Phase 16E dotted tokens and registry values', async () => {
  const inputPage = await readSiteFile('src/pages/components/component-input.page.html');
  const tablePage = await readSiteFile('src/pages/components/component-table.page.html');

  expect(inputPage).toContain('<h1>Input</h1>');
  expect(inputPage).toContain('type.email');
  expect(inputPage).toContain('size.md');
  expect(inputPage).toContain('name="email"');
  expect(inputPage).not.toContain('type="email"');
  expect(inputPage).not.toContain('size="md"');

  expect(tablePage).toContain('<h1>Table</h1>');
  expect(tablePage).toContain('density.compact');
  expect(tablePage).toContain('sortable');
  expect(tablePage).toContain('filterable');
  expect(tablePage).toContain('paginated');
  expect(tablePage).toContain('selectable');
  expect(tablePage).not.toContain('density="compact"');
});
```

- [x] **Step 4: Run site docs red tests and confirm failure**

Run:

```bash
pnpm --filter @vanrot/vanrot-site test -- tests/site-pages.test.ts
```

Expected: fails because Phase 16E docs pages and routes do not exist.

- [x] **Step 5: Add docs paths**

Update `apps/vanrot-site/src/docs/component-doc-paths.ts` with Phase 16E paths:

```ts
form: '/docs/components/forms',
formField: '/docs/components/form-fields',
label: '/docs/components/labels',
input: '/docs/components/inputs',
textarea: '/docs/components/textareas',
select: '/docs/components/selects',
checkbox: '/docs/components/checkboxes',
radioGroup: '/docs/components/radio-groups',
radio: '/docs/components/radios',
switch: '/docs/components/switches',
slider: '/docs/components/sliders',
table: '/docs/components/tables',
pagination: '/docs/components/paginations',
list: '/docs/components/lists',
listItem: '/docs/components/list-items',
stat: '/docs/components/stats',
emptyState: '/docs/components/empty-states',
```

- [x] **Step 6: Add route imports and route entries**

Update `apps/vanrot-site/src/routes.ts` with imports for every Phase 16E docs page. Add route path keys matching the red tests:

```ts
componentForms: componentDocPath.form,
componentFormFields: componentDocPath.formField,
componentLabels: componentDocPath.label,
componentInputs: componentDocPath.input,
componentTextareas: componentDocPath.textarea,
componentSelects: componentDocPath.select,
componentCheckboxes: componentDocPath.checkbox,
componentRadioGroups: componentDocPath.radioGroup,
componentRadios: componentDocPath.radio,
componentSwitches: componentDocPath.switch,
componentSliders: componentDocPath.slider,
componentTables: componentDocPath.table,
componentPaginations: componentDocPath.pagination,
componentLists: componentDocPath.list,
componentListItems: componentDocPath.listItem,
componentStats: componentDocPath.stat,
componentEmptyStates: componentDocPath.emptyState,
```

Add page routes with `routes.page({ path, label, ...componentDocument(label), page, ...componentRoutePerformance(), nav: routes.nav.hidden(), breadcrumb: routes.breadcrumb.root() })`.

- [x] **Step 7: Add docs navigation in alphabetical order**

Update `apps/vanrot-site/src/docs/site-navigation.ts` so the Components section sorts by visible label. The final order must include:

```ts
[
  'Alert',
  'Avatar',
  'Badge',
  'Breadcrumb',
  'Button',
  'Card',
  'Checkbox',
  'Container',
  'Empty State',
  'Footer',
  'Form',
  'Form Field',
  'Grid',
  'Header',
  'Image',
  'Input',
  'Label',
  'Layout',
  'List',
  'List Item',
  'Loader',
  'Navigation',
  'Pagination',
  'Radio',
  'Radio Group',
  'Section',
  'Select',
  'Separator',
  'Sidebar',
  'Skeleton',
  'Slider',
  'Source',
  'Stack',
  'Stat',
  'Switch',
  'Table',
  'Textarea',
]
```

- [x] **Step 8: Create component docs pages**

For every Phase 16E docs page, use the approved Button docs structure:

```html
<div class="app component-gallery-app component-input-app">
  <vr-sidebar class="sidebar" placement.left aria-label="Components">
    <vr-nav class="nav-list" aria-label="Components">
      <!-- full alphabetical component nav -->
    </vr-nav>
  </vr-sidebar>

  <main class="content">
    <h1>Input</h1>

    <section class="primitive" id="input">
      <div class="preview">
        <div class="preview-head"><span>Variants</span><span>5</span></div>
        <div class="preview-body variant-grid">
          <div class="variant-tile"><span class="variant-name">type.email</span><vr-input class="input" type.email size.md name="email" placeholder="Email"></vr-input></div>
        </div>
      </div>
    </section>

    <section class="variant-doc" id="input-email">
      <div class="section-head">
        <div>
          <h2>Email</h2>
          <p>Email inputs use native email validation and Vanrot form state. Pair them with a visible label or aria-label.</p>
        </div>
        <span class="code-chip">type.email</span>
      </div>
      <div class="variant-example">
        <div class="variant-preview"><vr-input class="input" type.email size.md name="email" placeholder="Email"></vr-input></div>
        <div class="code-snippet">
          <button class="copy-icon-button" type="button" aria-label="Copy email input code">Copy</button>
          <pre class="code-block"><code>&lt;vr-input type.email size.md name="email" placeholder="Email"&gt;&lt;/vr-input&gt;</code></pre>
        </div>
      </div>
    </section>
  </main>
</div>
```

Use icon-only copy buttons with the same SVG as the Button docs page, not the visible word `Copy`.

- [x] **Step 9: Add page TypeScript classes**

Each new page `.ts` file must use role suffix `.page.ts` and export a class with no UI markup:

```ts
export class ComponentInputPage {}
```

- [x] **Step 10: Add page CSS**

Each new page CSS file must preserve the current component docs design language. Use `component-button.page.css` as the visual baseline and adjust only component-specific preview selectors such as `.input`, `.table-demo`, `.stat-demo`, and `.empty-state-demo`.

- [x] **Step 11: Run site tests**

Run:

```bash
pnpm --filter @vanrot/vanrot-site test -- tests/site-pages.test.ts
pnpm --filter @vanrot/vanrot-site typecheck
```

Expected: passes.

## Task 9: Add Docs Registry Tables And CLI Cross-Links

**Files:**

- Modify: `apps/vanrot-site/src/docs/component-docs.ts`
- Modify: `apps/vanrot-site/src/docs/site-reference.ts`
- Modify: `apps/vanrot-site/src/pages/reference/reference.page.html`
- Modify: `apps/vanrot-site/tests/site-data.test.ts`
- Modify: `apps/vanrot-site/tests/site-pages.test.ts`

- [x] **Step 1: Add site data red tests for registry-backed docs**

Update `apps/vanrot-site/tests/site-data.test.ts`:

```ts
it('exposes registry-backed Phase 16E component API data', () => {
  const inputDoc = componentDocs.find((doc) => doc.primitive === uiPrimitiveType.input);
  const tableDoc = componentDocs.find((doc) => doc.primitive === uiPrimitiveType.table);

  expect(inputDoc).toMatchObject({
    href: '/docs/components/inputs',
    title: 'Input',
  });
  expect(inputDoc?.api).toContain('type.email');
  expect(inputDoc?.api).toContain('placeholder');

  expect(tableDoc).toMatchObject({
    href: '/docs/components/tables',
    title: 'Table',
  });
  expect(tableDoc?.api).toContain('density.compact');
  expect(tableDoc?.api).toContain('sortable');
});
```

- [x] **Step 2: Update `component-docs.ts` to consume registry metadata**

In `apps/vanrot-site/src/docs/component-docs.ts`, derive API summaries from `uiComponentRegistry`:

```ts
function describeComponentApi(primitive: UiPrimitiveType): string {
  const registry = uiComponentRegistry[primitive];

  if (registry === undefined) {
    return getPrimitiveCopy(primitive).api;
  }

  const tokens = Object.values(registry.tokens).flatMap((group) =>
    group.values.map((value) => `${group.name}.${value.value}`),
  );
  const booleans = registry.booleans.map((item) => item.name);
  const openAttributes = registry.openAttributes.map((item) => item.name);

  return [
    tokens.length > 0 ? `Dotted tokens: ${tokens.join(', ')}` : '',
    booleans.length > 0 ? `Booleans: ${booleans.join(', ')}` : '',
    openAttributes.length > 0 ? `Open attributes: ${openAttributes.join(', ')}` : '',
  ]
    .filter((line) => line.length > 0)
    .join('\\n');
}
```

- [x] **Step 3: Add reference page CLI docs**

Update `apps/vanrot-site/src/docs/site-reference.ts` so the command list includes:

```ts
{
  name: 'vr ui <component> --help',
  status: 'Phase 16E',
  description: 'Inspect a Vanrot UI component API, dotted token values, booleans, open attributes, events, slots, examples, and docs path.',
}
```

- [x] **Step 4: Run site data tests**

Run:

```bash
pnpm --filter @vanrot/vanrot-site test -- tests/site-data.test.ts tests/site-pages.test.ts
```

Expected: passes.

## Task 10: Completion Docs, Verification, And Site Restart

**Files:**

- Modify: `docs/superpowers/feature-maturity.md`
- Modify: `docs/superpowers/final-tdd-inventory.md`
- Modify: `docs/vanrot-presentation.html`
- Modify: `docs/superpowers/plans/Phase-16E.md`

- [x] **Step 1: Update feature maturity when implementation passes package tests**

Update the Phase 16 row in `docs/superpowers/feature-maturity.md` so Phase 16E is listed as complete in the notes and Phase 16F remains the next UI production slice.

Use wording that includes:

```md
16E forms/data: controlled form primitives, useful data primitives, rich UI registry, compiler diagnostics, CLI `vr ui <component> --help`, and dedicated docs pages.
```

- [x] **Step 2: Update final TDD inventory**

Add a Phase 16E section to `docs/superpowers/final-tdd-inventory.md` with these coverage bullets:

```md
### Phase 16E Forms/Data Registry And Docs

- `@vanrot/ui`: rich registry, token scales, forms/data primitive metadata, primitive files, `vanrotstyles.css` form/data styles.
- `@vanrot/runtime`: controlled form controller, validation, submit orchestration, table sorting/filtering/pagination/selection helpers.
- `@vanrot/compiler`: Phase 16E semantic tag lowering, dotted token diagnostics, native input type lowering, form/table helper wiring, user class precedence.
- `@vanrot/cli`: `vr ui list`, `vr ui <component> --help`, `vr add input`, `vr add table`.
- `apps/vanrot-site`: Phase 16E component routes, alphabetical sidebar, component docs pages, registry-backed API summaries, reference command docs.
```

- [x] **Step 3: Update presentation**

Update `docs/vanrot-presentation.html` so the roadmap slide marks Phase 16E complete and sets Phase 16F overlays/stateful interaction as active.

- [x] **Step 4: Tick completed plan tasks**

In `docs/superpowers/plans/Phase-16E.md`, tick every task and step completed during execution. Leave no unchecked tasks if Phase 16E is marked complete in `feature-maturity.md`.

- [x] **Step 5: Run full verification**

Run:

```bash
pnpm verify
```

Expected: passes typecheck, tests, build, runtime size budget, site docs verification, and phase docs verification.

- [x] **Step 6: Restart the Vanrot site server**

Run:

```bash
pkill -f "vite/bin/vite.js.*--port 3000" || true
pnpm --filter @vanrot/vanrot-site dev -- --host 127.0.0.1 --port 3000
```

Expected: dev server listens on `http://localhost:3000`.

- [x] **Step 7: Verify the site route responds**

Run:

```bash
curl -I http://localhost:3000/docs/components/inputs
curl -I http://localhost:3000/docs/components/tables
```

Expected: both responses include `HTTP/1.1 200 OK`.

- [x] **Step 8: Browser inspect final docs pages**

Use the browser skill to inspect:

```txt
http://localhost:3000/docs/components/inputs
http://localhost:3000/docs/components/tables
```

Expected:

- sidebar remains visible and alphabetical;
- route navigation does not replace the shell;
- pages use the current component docs design language;
- code snippets use dotted token attributes for finite Vanrot values;
- normal open attributes remain string attributes;
- mobile viewport has no overlapping text or broken previews.

## Verification Commands

Run these focused commands during execution:

```bash
pnpm --filter @vanrot/ui test -- tests/metadata.test.ts tests/assets.test.ts
pnpm --filter @vanrot/runtime test -- tests/forms/form-controller.test.ts tests/ui/table-controller.test.ts tests/exports/exports.test.ts
pnpm --filter @vanrot/compiler test -- tests/codegen/ui-token-attributes.test.ts tests/codegen/generate-component.test.ts
pnpm --filter @vanrot/cli test -- tests/ui-command.test.ts tests/cli.test.ts tests/add.test.ts
pnpm --filter @vanrot/vanrot-site test -- tests/site-data.test.ts tests/site-pages.test.ts
pnpm --filter @vanrot/vanrot-site typecheck
```

Run this final command before completion:

```bash
pnpm verify
```

## Risks And Guardrails

- Form state must stay light. Do not introduce a schema dependency or async query/cache abstraction in Phase 16E.
- Table behavior must stay DOM-level and small. Do not introduce virtualization, server data sources, pinned columns, column resizing, or grouped rows in Phase 16E.
- Dotted tokens must stay compile-time only. Do not add a runtime dotted-token parser.
- Registry data must remain finite for diagnostics and future IDE tooling.
- User classes must remain last in class output so `vanrotstyles` or Tailwind utility classes can override dotted token styling.
- Docs pages must preserve the approved current design language. Do not redesign the docs shell while adding Phase 16E pages.
- Existing dirty worktree changes must be preserved. Do not revert unrelated files.
