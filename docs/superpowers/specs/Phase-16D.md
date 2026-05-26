# Phase 16D Layout, Navigation, And Media

## Purpose

Phase 16D creates the first docs-site-first structural layer for Vanrot UI.

The phase introduces layout, navigation shell, and media primitives that let Vanrot pages use semantic `vr-*` elements instead of site-only shell markup. The `apps/vanrot-site` documentation shell is the first adoption target, and its current visual design is the source of truth.

Phase 16D changes ownership and semantics. It must not redesign the docs site.

## Approved Direction

Phase 16D uses the docs-site-first approach.

Build the primitives from the current `apps/vanrot-site` docs shell needs first, then generalize only where the reusable shape is obvious and lightweight. The current docs shell design must remain visually identical after adoption.

The phase keeps layout and navigation structure separate from interaction-heavy behavior. Anything requiring focus traps, disclosure state, keyboard roving behavior, escape handling, or overlay positioning belongs in a later interaction phase.

## Scope

Phase 16D includes these primitives:

- `<vr-layout>`
- `<vr-container>`
- `<vr-section>`
- `<vr-grid>`
- `<vr-header>`
- `<vr-footer>`
- `<vr-sidebar>`
- `<vr-nav>`
- `<vr-breadcrumb>`
- `<vr-img>`
- `<vr-src>`

Phase 16D also includes:

- docs-site shell adoption using the new primitives where possible;
- transfer of current docs shell styling into the new primitive/component ownership layer where that primitive owns the structure;
- dedicated component documentation pages for every new primitive;
- site navigation updates for the new component pages;
- compiler support for strict dotted token attributes used by Vanrot-owned finite tokens;
- diagnostics for duplicate or unknown dotted token attributes;
- tests for primitives, dotted token compilation, site routes, and docs page structure;
- browser inspection of the docs site after the local server restart.

## Out Of Scope

Phase 16D does not include:

- `<vr-tabs>`;
- collapsible sidebars;
- mobile drawer sidebars;
- dropdown menus;
- command menus;
- modal, dialog, popover, tooltip, or toast behavior;
- icon system work;
- broad dashboard/admin/mobile pattern systems;
- full generic app-shell configuration for every possible product layout.

`<vr-tabs>` moves to Phase 16F because tabs are interactive. Collapsible sidebar behavior also moves to Phase 16F and should be designed together with the icon strategy and drawer/disclosure behavior.

## Visual Contract

The current `apps/vanrot-site` docs shell design is the visual source of truth.

Phase 16D must preserve:

- spacing;
- sidebar width and spacing;
- borders;
- sticky/header behavior;
- typography;
- active navigation state;
- mobile behavior that already exists;
- shadcn-style documentation rhythm already approved for the site;
- the visual language carried over from `phase-16b-core-primitives.html`.

The implementation may move CSS ownership from site-only selectors into primitive styles when appropriate, but the rendered result must not visually drift.

## Dotted Token Attributes

Phase 16D adopts dotted token attributes for finite Vanrot-owned design choices.

Approved examples:

```html
<vr-container size.lg>
<vr-section spacing.md>
<vr-grid cols.3 gap.4>
<vr-button variant.danger>
<vr-badge tone.success>
```

Dotted token attributes are a compile-time authoring feature. The browser must not interpret them at runtime.

The compiler lowers valid dotted token attributes to ordinary static DOM, classes, CSS variables, or generated component inputs. Static layout tokens must not add runtime JavaScript.

Valid use cases:

- component variants;
- layout sizes;
- spacing tokens;
- grid column tokens;
- surface and tone tokens;
- other finite Vanrot-owned enums.

Invalid use cases:

- arbitrary values;
- URLs;
- user-facing copy;
- `alt` text;
- ARIA labels;
- dynamic runtime values;
- standard HTML attributes where the platform expects a normal value.

Those remain normal attributes or bindings:

```html
<vr-img src="/images/product.png" alt="Product image">
<vr-nav aria-label="Components">
```

## Dotted Token Diagnostics

The compiler must treat duplicate token groups as errors.

Invalid:

```html
<vr-grid cols.3 cols.4>
```

Expected diagnostic:

```text
VR_UI_DUPLICATE_TOKEN_ATTRIBUTE

<vr-grid> received multiple values for "cols": cols.3 and cols.4.

Use only one:
<vr-grid cols.3>
```

Unknown token groups or values must also fail compilation.

Invalid:

```html
<vr-badge tone.happy>
<vr-grid gap.big>
```

Expected behavior:

- identify the element;
- identify the invalid token group or value;
- list the nearest valid options where practical;
- do not silently ignore the mistake;
- do not use last-one-wins behavior.

## Primitive Architecture

Each new primitive should follow the Phase 16B package shape:

```text
packages/ui/src/primitives/<name>/
  ui.<name>.ts
  ui.<name>.html
  ui.<name>.css
  ui.<name>.test.ts
  usage.home.html
```

The first 16D APIs should remain minimal.

The spec names the elements and their intent. The writing plan will finalize the first minimal attribute set, using dotted token attributes for finite Vanrot choices. The implementation should avoid broad configuration surfaces until the docs site proves a need.

## Docs Site Adoption

`apps/vanrot-site` should adopt the new primitives in the docs shell where they fit cleanly.

Expected adoption areas:

- root docs layout;
- top header;
- left sidebar;
- navigation groups;
- content container;
- content sections;
- grids and stacks inside documentation pages where appropriate;
- image/source usage where docs content needs media.

Site-local CSS may remain for docs-specific content composition, page-specific examples, and temporary surfaces that are not owned by 16D primitives.

## Component Documentation

Every 16D primitive needs a dedicated component documentation page using the approved Vanrot component docs pattern:

- title only at the top;
- variants overview card where variants exist;
- one dedicated section per variant or usage shape;
- dotted preview backgrounds;
- shadcn-style code snippets below previews;
- icon-only copy buttons;
- accessibility notes in prose, not as noisy top-level tabs;
- mobile-ready CSS;
- sidebar route using the same primary component sidebar.

The docs pages should use Vanrot syntax in examples, including dotted token attributes for finite tokens.

## Accessibility Standards

16D primitives must preserve platform semantics.

Expected accessibility behavior:

- `<vr-header>` lowers to header semantics where appropriate;
- `<vr-footer>` lowers to footer semantics where appropriate;
- `<vr-nav>` lowers to navigation semantics and supports normal `aria-label`;
- `<vr-sidebar>` remains structural in 16D and must not pretend to be an interactive drawer;
- `<vr-breadcrumb>` uses ordered navigation semantics and current-page indication;
- `<vr-img>` and `<vr-src>` preserve image/source semantics and require safe treatment of alt text;
- layout primitives must not remove document flow, heading order, or keyboard access.

## Testing And Verification

Phase 16D verification should include:

- primitive unit tests for each new element;
- compiler tests for dotted token parsing and lowering;
- compiler tests for duplicate token diagnostics;
- compiler tests for unknown token diagnostics;
- docs-site tests for route rendering and sidebar navigation;
- component docs structure tests for the new pages;
- typecheck;
- `pnpm verify`;
- local `apps/vanrot-site` server restart on port `3000`;
- browser inspection of at least one current docs component page and one new 16D docs page.

Visual verification must compare against the current docs shell design. Passing tests are not enough if the shell visibly drifts.

## Risks

The main risk is visual drift while moving CSS ownership from site-only classes into primitives. The mitigation is to treat the current docs shell as a visual contract and verify it in the browser after adoption.

The second risk is over-designing layout APIs. The mitigation is to keep 16D docs-site-first and let the writing plan define only the smallest useful attribute set.

The third risk is tooling warnings around dotted token attributes. The mitigation is to keep the syntax strict, compile-time only, and covered by diagnostics now. IntelliJ or language-service support can come later with the post-production tooling work.

## Questions For The Writing Plan

The writing plan must answer these before implementation:

- What is the minimal attribute set for each 16D primitive?
- Which dotted token groups and values are valid for each primitive?
- Where should current docs shell CSS move into primitive CSS, and where should it stay site-local?
- Which docs shell files are the safest first adoption point?
- How should `vr-breadcrumb` represent current-page state without string-literal-heavy templates?
- How should `vr-img` and `vr-src` balance clean Vanrot syntax with standard `src`, `alt`, and responsive image behavior?
- Which tests should be written red first for the dotted token compiler rules?
- Which browser pages are the visual verification baseline?
