# Phase 16 UI October

## Purpose

Phase 16 makes `@vanrot/ui` production-ready as Vanrot's first serious UI ecosystem.

The UI flavor name is **October**. October is dark-first, light-capable, themeable, accessible, copyable, editable, and Vanrot-native.

This phase covers:

- compiler-lowered semantic `vr-*` UI elements
- a production component inventory
- component anatomy and naming conventions
- `vanrotstyles` utility CSS
- typography based on Geist text and JetBrains Mono numerics
- tokens, themes, surfaces, motion, and responsive strategy
- accessibility standards
- public framework learning and documentation site dogfooding through `apps/vanrot-site`
- package inventory and developer guidelines
- configuration hooks for Vanrot styles, Tailwind, or user-owned styles

Phase 16 must not become a black-box component library. The target developer experience is closer to shadcn/ui in spirit: users add readable source into their project, own the resulting files, and can customize them without fighting the framework.

## Core Decisions

### Semantic Elements Are Compiler-Lowered

Vanrot UI elements such as `<vr-button>`, `<vr-card>`, `<vr-dialog>`, and `<vr-table>` are compiler-known semantic elements. They are not browser custom elements.

The compiler lowers semantic tags to accessible native DOM or to project-owned Vanrot component source. This keeps templates readable while preserving browser behavior for forms, links, focus, keyboard interaction, ARIA, and progressive rendering.

Example authoring shape:

```html
<vr-card class="surface-card p-4 radius-md shadow-2">
  <vr-heading level="2">Revenue</vr-heading>
  <vr-number value={revenue} format="currency" />
</vr-card>
```

The generated or compiled output must preserve accessibility semantics. For example, buttons lower to native `button` behavior, links lower to native anchors where possible, and dialog primitives own focus management.

### `@vanrot/ui` Includes `vanrotstyles`

Installing `@vanrot/ui` makes the October component registry, tokens, component templates, guidelines, and `vanrotstyles` utility stylesheet available from the package.

The utility stylesheet file name is:

```txt
vanrotstyles.css
```

The utility system name is:

```txt
vanrotstyles
```

Utilities do not use a `vr-` prefix. Preferred examples:

```txt
.flex
.grid
.gap-2
.p-4
.mt-2
.radius-md
.shadow-2
.text-sm
.surface-card
```

Rejected examples:

```txt
.vr-flex
.vr-grid
```

New Vanrot apps may import the package-provided stylesheet by default. Existing apps should be able to opt in through the CLI or configuration without losing control of their own styles.

### `vanrot.config.ts` Controls Style Strategy

Vanrot should let teams choose the styling path that fits their project.

Recommended config shape:

```ts
export default {
  ui: {
    flavor: 'october',
    styles: 'vanrotstyles',
  },
};
```

Supported style modes:

- `vanrotstyles`: import and use the first-party utility CSS layer.
- `tailwind`: do not inject or require `vanrotstyles`; preserve the user's Tailwind path.
- `none`: install or use UI components and tokens without a utility CSS layer.

Tailwind interoperability is supported, but `vanrotstyles` is the first-party Vanrot path.

### October Is Dark-First And Themeable

October ships with a dark-first visual baseline and a supported light theme. Users can override color, radius, spacing, shadow, and typography tokens without rewriting every component.

Theme decisions should live in CSS custom properties and configuration metadata, not in scattered component literals.

## Architectural Inspiration From shadcn/ui

Phase 16 should learn from shadcn/ui without cloning its React or Tailwind implementation.

Relevant principles:

- Components are added into the user's app rather than consumed only as opaque package imports.
- Component files are readable and editable.
- Registry metadata describes files, dependencies, CSS variables, docs, and update surfaces.
- Component anatomy is compositional: root, trigger, content, header, title, description, footer, item, separator.
- Styling is token-driven and utility-friendly.
- Dark mode is token-based.
- Accessibility is not optional for interactive primitives.
- Variants stay small and understandable.

Vanrot's version of this model should be compiler-aware and template-native.

## Design Language

October should feel:

- technical
- calm
- precise
- dashboard-ready
- readable at high information density
- modern without being decorative
- professional in both light and dark themes

October should avoid:

- one-note color palettes
- oversized marketing-page defaults
- decorative gradients as the primary identity
- component APIs that require many stringly class combinations
- hidden runtime behavior that developers cannot inspect

The identity should come from typography, spacing rhythm, clear surface layers, crisp borders, restrained accent color, polished focus states, and strong table/form ergonomics.

## Component Inventory

The inventory below is the long-term October catalog. Phase 16 implementation can be sliced, but the naming model should be designed against the full ecosystem from the beginning.

### Layout

- `<vr-layout>`
- `<vr-container>`
- `<vr-section>`
- `<vr-grid>`
- `<vr-stack>`
- `<vr-cluster>`
- `<vr-split>`
- `<vr-panel>`
- `<vr-card>`
- `<vr-divider>`
- `<vr-scroll-area>`
- `<vr-resizable>`
- `<vr-aspect-ratio>`
- `<vr-safe-area>`

### App Shell

- `<vr-app>`
- `<vr-shell>`
- `<vr-header>`
- `<vr-footer>`
- `<vr-main>`
- `<vr-sidebar>`
- `<vr-toolbar>`
- `<vr-command-bar>`
- `<vr-status-bar>`
- `<vr-page-header>`
- `<vr-admin-shell>`

### Navigation

- `<vr-nav>`
- `<vr-link>`
- `<vr-breadcrumb>`
- `<vr-pagination>`
- `<vr-tabs>`
- `<vr-tab>`
- `<vr-steps>`
- `<vr-menu>`
- `<vr-menubar>`
- `<vr-command-menu>`
- `<vr-bottom-nav>`

### Forms

- `<vr-form>`
- `<vr-field>`
- `<vr-fieldset>`
- `<vr-label>`
- `<vr-help>`
- `<vr-error>`
- `<vr-input>`
- `<vr-textarea>`
- `<vr-input-group>`
- `<vr-select>`
- `<vr-combobox>`
- `<vr-checkbox>`
- `<vr-radio>`
- `<vr-radio-group>`
- `<vr-switch>`
- `<vr-slider>`
- `<vr-calendar>`
- `<vr-date-picker>`
- `<vr-time-picker>`
- `<vr-file-upload>`

### Feedback

- `<vr-alert>`
- `<vr-toast>`
- `<vr-progress>`
- `<vr-loader>`
- `<vr-spinner>`
- `<vr-skeleton>`
- `<vr-empty>`
- `<vr-callout>`
- `<vr-banner>`
- `<vr-inline-status>`

### Overlays

- `<vr-dialog>`
- `<vr-modal>`
- `<vr-drawer>`
- `<vr-sheet>`
- `<vr-popover>`
- `<vr-tooltip>`
- `<vr-dropdown>`
- `<vr-context-menu>`
- `<vr-hover-card>`
- `<vr-action-sheet>`

### Typography

- `<vr-heading>`
- `<vr-text>`
- `<vr-muted>`
- `<vr-prose>`
- `<vr-code>`
- `<vr-kbd>`
- `<vr-quote>`
- `<vr-number>`
- `<vr-stat>`

### Data Display

- `<vr-table>`
- `<vr-data-table>`
- `<vr-list>`
- `<vr-item>`
- `<vr-description-list>`
- `<vr-badge>`
- `<vr-tag>`
- `<vr-avatar>`
- `<vr-timeline>`
- `<vr-tree>`
- `<vr-chart-shell>`
- `<vr-audit-log>`
- `<vr-metric-card>`

### Media

- `<vr-img>`
- `<vr-picture>`
- `<vr-src>`
- `<vr-video>`
- `<vr-audio>`
- `<vr-icon>`
- `<vr-logo>`
- `<vr-thumbnail>`

### Interaction And Mobile Patterns

- `<vr-button>`
- `<vr-button-group>`
- `<vr-toggle>`
- `<vr-toggle-group>`
- `<vr-copy-button>`
- `<vr-swipe-actions>`
- `<vr-pull-refresh>`
- `<vr-mobile-toolbar>`
- `<vr-fab>`

## Component Anatomy

Simple components use one semantic tag.

```html
<vr-button variant="primary" size="md">Save</vr-button>
```

Compound components use readable child tags. The child tag names should remain HTML-like and compiler-known.

```html
<vr-dialog>
  <vr-dialog-trigger>
    <vr-button>Open</vr-button>
  </vr-dialog-trigger>
  <vr-dialog-content>
    <vr-dialog-header>
      <vr-dialog-title>Edit profile</vr-dialog-title>
      <vr-dialog-description>Update the account details.</vr-dialog-description>
    </vr-dialog-header>
    <vr-dialog-footer>
      <vr-button variant="secondary">Cancel</vr-button>
      <vr-button variant="primary">Save</vr-button>
    </vr-dialog-footer>
  </vr-dialog-content>
</vr-dialog>
```

This model keeps relationships visible in templates without inventing string keys for child slots.

## Component API Strategy

Component inputs should be semantic and boring:

- `variant`
- `size`
- `tone`
- `shape`
- `placement`
- `align`
- `open`
- `disabled`
- `loading`
- `invalid`
- `required`
- `selected`
- `expanded`
- `pressed`

Preferred variants:

- `primary`
- `secondary`
- `outline`
- `ghost`
- `danger`
- `link`

Preferred sizes:

- `xs`
- `sm`
- `md`
- `lg`
- `xl`

Preferred tones:

- `neutral`
- `brand`
- `success`
- `warning`
- `danger`
- `info`

Rules:

- Component APIs should be readable to non-expert developers.
- Variants should be finite and documented.
- Class passthrough remains allowed.
- User classes should not be required for basic accessible component behavior.
- Component internals should prefer tokens and local CSS over hard-coded values.
- Shared names, variants, roles, and registry keys should live in named metadata.

## `vanrotstyles` Utility Taxonomy

`vanrotstyles` should be broad enough for real app work and small enough to stay understandable.

### Display And Layout

- `.block`
- `.inline`
- `.inline-block`
- `.flex`
- `.inline-flex`
- `.grid`
- `.hidden`
- `.contents`

### Positioning

- `.relative`
- `.absolute`
- `.fixed`
- `.sticky`
- `.static`
- `.inset-0`
- `.top-0`
- `.right-0`
- `.bottom-0`
- `.left-0`

### Flexbox

- `.flex-row`
- `.flex-col`
- `.flex-wrap`
- `.items-start`
- `.items-center`
- `.items-end`
- `.items-stretch`
- `.justify-start`
- `.justify-center`
- `.justify-between`
- `.justify-end`
- `.grow`
- `.shrink-0`

### Grid

- `.grid-cols-1`
- `.grid-cols-2`
- `.grid-cols-3`
- `.grid-cols-4`
- `.grid-cols-12`
- `.col-span-2`
- `.col-span-3`
- `.auto-rows-min`
- `.place-items-center`

### Spacing

- `.p-0` through `.p-12`
- `.px-*`
- `.py-*`
- `.pt-*`
- `.pr-*`
- `.pb-*`
- `.pl-*`
- `.m-*`
- `.mx-*`
- `.my-*`
- `.mt-*`
- `.mr-*`
- `.mb-*`
- `.ml-*`
- `.gap-*`
- `.gap-x-*`
- `.gap-y-*`

### Sizing

- `.w-full`
- `.h-full`
- `.min-w-0`
- `.min-h-0`
- `.max-w-sm`
- `.max-w-md`
- `.max-w-lg`
- `.max-w-xl`
- `.max-w-screen`
- `.size-*`

### Typography

- `.font-sans`
- `.font-mono`
- `.text-xs`
- `.text-sm`
- `.text-md`
- `.text-lg`
- `.text-xl`
- `.text-2xl`
- `.text-muted`
- `.text-balance`
- `.text-pretty`
- `.leading-none`
- `.leading-tight`
- `.leading-normal`
- `.font-normal`
- `.font-medium`
- `.font-semibold`
- `.font-bold`
- `.tabular-nums`
- `.lining-nums`

### Colors And Surfaces

- `.text-default`
- `.text-muted`
- `.text-brand`
- `.text-success`
- `.text-warning`
- `.text-danger`
- `.text-info`
- `.surface-canvas`
- `.surface-page`
- `.surface-card`
- `.surface-raised`
- `.surface-popover`
- `.surface-muted`

### Borders, Radius, Shadow, And Elevation

- `.border`
- `.border-0`
- `.border-t`
- `.border-r`
- `.border-b`
- `.border-l`
- `.border-line`
- `.radius-none`
- `.radius-sm`
- `.radius-md`
- `.radius-lg`
- `.radius-xl`
- `.radius-full`
- `.shadow-0`
- `.shadow-1`
- `.shadow-2`
- `.shadow-3`
- `.elevation-0`
- `.elevation-1`
- `.elevation-2`
- `.elevation-3`

### Motion And Interaction

- `.transition`
- `.transition-colors`
- `.transition-transform`
- `.duration-fast`
- `.duration-normal`
- `.duration-slow`
- `.ease-standard`
- `.animate-spin`
- `.animate-pulse`
- `.cursor-pointer`
- `.cursor-not-allowed`
- `.select-none`
- `.pointer-events-none`
- `.pointer-events-auto`

### Overflow, Scroll, And Z Index

- `.overflow-hidden`
- `.overflow-auto`
- `.overflow-x-auto`
- `.overflow-y-auto`
- `.scroll-smooth`
- `.scroll-mt-*`
- `.z-base`
- `.z-dropdown`
- `.z-sticky`
- `.z-overlay`
- `.z-modal`
- `.z-toast`
- `.z-tooltip`

### Accessibility

- `.sr-only`
- `.not-sr-only`
- `.focus-ring`
- `.focus-ring-inset`
- `.reduced-motion-safe`
- `.touch-target`

### Responsive Strategy

Responsive utilities should use a small breakpoint set:

- `sm`
- `md`
- `lg`
- `xl`
- `2xl`

The syntax should be familiar and readable, such as:

```txt
md:grid-cols-2
lg:grid-cols-4
sm:p-4
```

The exact selector escaping strategy belongs in the implementation plan.

## Typography Architecture

October typography uses:

- Geist for alphabetic UI text.
- JetBrains Mono for numeric characters and data-heavy numeric surfaces.

The goal is a modern technical aesthetic with readable dashboards, data tables, stats, financial values, IDs, and developer-oriented UI.

Recommended CSS concepts:

- `font-variant-numeric: tabular-nums lining-nums`
- `font-feature-settings: "tnum" 1, "lnum" 1`
- a dedicated numeric token such as `--vr-font-number`
- numeric utilities such as `.tabular-nums` and `.lining-nums`
- numeric elements such as `<vr-number>` and `<vr-stat>`

Mixed font rendering can be achieved through one or both of these strategies:

1. A numeric font face using `unicode-range` for digits.
2. Explicit numeric components and utilities that opt into JetBrains Mono.

Phase 16 should prefer explicit numeric components for important data surfaces, and may use `unicode-range` once visual QA confirms the result is stable across browsers.

## Token Structure

Tokens should be layered:

1. Primitive tokens
2. Semantic tokens
3. Component tokens
4. Utility aliases

### Primitive Tokens

- colors
- spacing
- sizing
- radius
- shadows
- z-index
- typography
- motion
- breakpoints

### Semantic Tokens

- `canvas`
- `page`
- `surface`
- `surface-card`
- `surface-raised`
- `surface-popover`
- `surface-muted`
- `text`
- `text-muted`
- `line`
- `focus`
- `brand`
- `success`
- `warning`
- `danger`
- `info`

### Component Tokens

Examples:

- `button-background`
- `button-border`
- `button-radius`
- `input-background`
- `input-border`
- `dialog-background`
- `table-row-hover`
- `focus-ring`

Component tokens should map to semantic tokens by default. Users can override either layer depending on how broad their customization needs to be.

## Color And Surface Strategy

October should use a neutral foundation plus restrained semantic accents.

Surface layering:

1. canvas
2. page
3. card
4. raised
5. popover
6. overlay

Each layer needs light and dark values. Components should reference semantic surfaces instead of hard-coded colors.

Semantic colors:

- brand
- success
- warning
- danger
- info
- neutral

Every semantic color needs foreground, background, border, and subtle variants.

## Radius, Shadow, Z Index, And Motion

Radius scale:

- `none`
- `xs`
- `sm`
- `md`
- `lg`
- `xl`
- `full`

Shadow scale:

- `0`
- `1`
- `2`
- `3`
- `overlay`

Z-index layers:

- base
- raised
- sticky
- dropdown
- overlay
- modal
- toast
- tooltip

Motion scale:

- instant
- fast
- normal
- slow

Motion rules:

- Focus and state transitions should be quick.
- Layout motion should be limited.
- Reduced-motion preferences must be respected.
- Critical UI feedback must not depend on animation alone.

## Accessibility Standards

October components must be accessible by default.

Baseline requirements:

- Native elements whenever possible.
- Correct roles only when native semantics are not enough.
- Keyboard navigation for every interactive primitive.
- Focus visible states for all interactive controls.
- Roving tabindex for menus, tabs, command menus, and composite widgets.
- Escape behavior for dismissible overlays.
- Focus trap and restore for modal dialogs.
- Background inertness or equivalent behavior for blocking overlays.
- Label, help, and error associations for form controls.
- `aria-current` for navigation where appropriate.
- `aria-expanded`, `aria-controls`, and `aria-selected` where appropriate.
- Color contrast checks in light and dark themes.
- Touch target guidance for mobile controls.
- Reduced motion support.
- Screen-reader-only utility support.

Accessibility behavior should be tested at the primitive level and documented in package guidelines.

## Folder Structure

Recommended package structure:

```txt
packages/ui/src/
  index.ts
  metadata.ts
  registry/
    components.ts
    files.ts
    flavors.ts
    guidelines.ts
  tokens/
    october.css
    october.dark.css
    october.light.css
  styles/
    vanrotstyles.css
    utilities/
  primitives/
    button/
    card/
    input/
    dialog/
  anatomy/
  a11y/
  docs/
```

Recommended installed app structure:

```txt
src/styles/
  vanrot-tokens.css
  vanrotstyles.css
  vanrot-ui.css

src/ui/
  button/
    ui.button.ts
    ui.button.html
    ui.button.css
  dialog/
    ui.dialog.ts
    ui.dialog.html
    ui.dialog.css
```

`src/styles/vanrotstyles.css` should either be copied from `@vanrot/ui`, generated from the package asset, or imported through the package depending on the final CLI/config design.

## Naming Conventions

Public semantic tags use `vr-*`.

Examples:

- `<vr-button>`
- `<vr-card>`
- `<vr-dialog>`
- `<vr-dialog-trigger>`
- `<vr-dialog-content>`

Generated source files keep the established role suffix convention:

- `.button.ts`
- `.button.html`
- `.button.css`
- `.dialog.ts`
- `.dialog.html`
- `.dialog.css`

Default generated source can continue using the local prefix:

```txt
src/ui/button/ui.button.ts
src/ui/button/ui.button.html
src/ui/button/ui.button.css
```

Package-level style assets use:

```txt
vanrotstyles.css
```

No new Phase 16 docs should use another name for the October utility layer.

## Package Inventory And Guidelines

`@vanrot/ui` must include a human-readable package inventory.

The inventory should explain:

- what CSS files are included
- what token files are included
- what components are available
- what components are planned
- which semantic tags are compiler-lowered
- which files are copied into user apps
- how `vanrot.config.ts` controls style mode
- how to disable `vanrotstyles`
- how to use Tailwind instead
- how typography is expected to work
- how themes and color overrides work
- what accessibility guarantees components provide
- what developers are allowed to edit
- what update or registry metadata Vanrot tracks

The guidelines should be available from package docs and CLI output where useful.

## Extensibility Strategy

Developers should be able to:

- edit copied component source
- override tokens
- disable `vanrotstyles`
- use Tailwind instead
- keep local component prefixes
- add project-specific variants in local files
- keep generated files in configured UI destinations
- inspect registry metadata
- receive diagnostics when a component is unsupported or misused

Vanrot should avoid:

- hidden global runtime state for styling
- hard dependency on Tailwind
- hard dependency on `vanrotstyles`
- uneditable black-box components
- component APIs that only work with one flavor

## Dark And Light Strategy

October is dark-first. Dark should be the default preview and documentation baseline.

Light mode must still be supported through tokens:

```txt
[data-theme="dark"]
[data-theme="light"]
```

Users should be able to choose any color direction by overriding semantic tokens. Component source should not assume one brand color beyond token defaults.

## Phase 16 Alpha Roadmap

Phase 16 should be sliced to protect readability and maintainability.

### Phase 16A: October Foundation

- replace older planning language with October in Phase 16 docs
- finalize registry metadata shape
- define component taxonomy
- define token architecture
- ship October dark and light tokens
- ship `vanrotstyles.css`
- add `vanrot.config.ts` UI style mode design
- document package inventory and guidelines
- verify CSS budget and docs expectations

### Phase 16B: Core Elements

- button
- card
- badge
- alert
- input
- label
- field
- textarea
- select shell
- skeleton
- loader

### Phase 16C: Vanrot Site Base

- create `apps/vanrot-site`
- target `vanrot.vankode.com` as the public documentation subdomain
- make the site the main learning home for Vanrot, not only the UI catalog
- use Phase 16B primitives in the site
- use temporary site-local CSS only where Vanrot primitives do not exist yet
- follow the shadcn/ui documentation layout quality bar without copying its text or implementation
- add landing, install, framework guide, reference, and component page foundations
- expose a preview-first core primitive gallery that carries the `phase-16b-core-primitives.html` design language into the real site
- document the implemented framework surface from Phase 1 through Phase 15 plus Phase 16A and Phase 16B
- expose current commands, packages, diagnostics, conventions, route APIs, config keys, primitive metadata, and maturity status
- add docs drift verification so implemented primitives cannot miss site documentation
- keep Phase 24 as the final documentation and public web presence audit

### Phase 16D: Layout, Navigation, And Media

- layout
- container
- section
- grid
- stack
- header
- footer
- nav
- sidebar
- breadcrumb
- image and source primitives
- update `apps/vanrot-site` to replace temporary shell CSS with real primitives where possible

### Phase 16E: Forms And Data

- form
- input
- label
- field
- textarea
- select shell
- pagination
- table
- data table shell
- stat
- number
- update `apps/vanrot-site` with matching docs, previews, API notes, and examples

### Phase 16F: Overlays, Interaction, And Visual QA

- dialog
- modal
- drawer
- dropdown
- tabs
- popover
- tooltip
- toast
- command menu
- admin shell
- dashboard patterns
- mobile patterns
- examples
- visual QA
- accessibility docs
- CLI package inventory output
- update `apps/vanrot-site` with matching docs, previews, API notes, and examples

## Risks And Architectural Concerns

### Utility Class Collisions

Unprefixed utilities can collide with Tailwind, PrimeFlex, or app CSS. The mitigation is explicit `vanrot.config.ts` style mode, CSS layer ordering, and documentation that says teams should choose one primary utility engine.

### Semantic Tag Scope Creep

The full inventory is large. Phase 16 must be sliced and tested by category. The compiler should reject or diagnose unsupported `vr-*` UI tags instead of silently producing broken output.

### Accessibility Cost

Overlay and composite widgets are expensive to build correctly. Dialog, dropdown, select, tooltip, tabs, and command menu need dedicated keyboard and focus tests before they are called production-ready.

### Typography Complexity

Mixed Geist and JetBrains Mono rendering can look uneven if applied globally. Numeric components and numeric utilities should come first. Browser-wide `unicode-range` behavior should be visually verified before it becomes the default.

### Theme Drift

If component CSS uses hard-coded colors, October will stop being themeable. Component CSS must use tokens except where standard browser behavior requires literal values.

### Registry Drift

If component metadata, generated files, docs, and compiler tag support drift apart, developers will lose trust. Registry metadata should become the source of truth for supported primitives, file names, tags, styles, docs, and CLI behavior.

## Questions To Answer Before Implementation

1. Should `vanrotstyles.css` be copied into `src/styles/` or imported from `@vanrot/ui` by default in new apps?
2. What exact `vanrot.config.ts` schema should control `flavor`, `styles`, UI output folders, and Tailwind interop?
3. Which Phase 16A CSS utilities are mandatory for alpha, and which can wait until later slices?
4. Should Geist and JetBrains Mono be package-recommended fonts only, or should `@vanrot/ui` provide `@font-face` setup guidance and generated CSS hooks?
5. Which compound component anatomy tags are compiler-reserved in Phase 16A?
6. What is the diagnostic policy for unsupported `vr-*` UI tags?
7. What visual QA pages must exist before October can be called production-ready?

## Production Readiness Outcome

After Phase 16, Vanrot should have a production-ready October UI foundation where:

- developers author semantic `vr-*` UI elements
- components lower to accessible native or project-owned Vanrot source
- `@vanrot/ui` includes tokens, registry metadata, component templates, package inventory, guidelines, and `vanrotstyles`
- `vanrotstyles.css` provides a practical first-party utility layer without `vr-` utility prefixes
- `vanrot.config.ts` lets users choose Vanrot styles, Tailwind, or no utility layer
- October supports dark and light themes
- users can override colors and tokens without rewriting components
- typography supports Geist text and JetBrains Mono numeric surfaces
- component APIs remain readable, low ceremony, and developer owned
- accessibility behavior is tested and documented
