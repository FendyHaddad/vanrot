# Phase 16F October Interaction Foundation

## Purpose

Phase 16F adds the first production interaction layer for October UI.

Phase 16A established the October foundation. Phase 16B added core primitives. Phase 16C created the Vanrot learning site. Phase 16D added layout, navigation, media, and dotted token attributes. Phase 16E added forms, data primitives, richer registry metadata, and UI help.

Phase 16F should stay focused. It makes the most common overlay and stateful interaction primitives real enough for app screens without turning Vanrot into a heavy UI runtime.

The goal is a tight interaction foundation:

- readable source-owned primitives;
- small shared runtime controllers;
- real focus behavior for blocking surfaces;
- practical keyboard behavior for common widgets;
- docs examples that show how to use the primitives;
- registry, compiler, CLI, and docs support consistent with earlier Phase 16 slices.

## Approved Direction

Phase 16F uses the **Tight Interaction Foundation** approach.

Approved decisions:

- Split the previous final 16F scope into 16F and 16G.
- Phase 16F owns only `dialog`, `drawer`, `dropdown`, `tabs`, and `toast`.
- Phase 16G becomes the final October polish slice.
- Runtime behavior should use minimal shared controllers, not a large UI manager.
- Component documentation should show examples only; the docs shell should not dogfood these primitives yet.
- `dialog` and `drawer` must include real focus behavior in 16F.
- `dropdown` and `tabs` must include basic keyboard behavior in 16F.
- `toast` must include a simple accessible queue in 16F.

## Scope

Phase 16F includes these primitives:

- `<vr-dialog>`
- `<vr-drawer>`
- `<vr-dropdown>`
- `<vr-tabs>`
- `<vr-toast>`

Phase 16F also includes:

- editable source templates for the five primitives;
- registry metadata for supported attributes, dotted tokens, events, slots, anatomy, examples, and docs paths;
- package asset URLs for `vr add`;
- compiler semantic lowering support for the five primitives;
- compiler diagnostics for unknown or duplicate dotted token attributes;
- `vr add` coverage for the five primitives;
- `vr ui <component> --help` coverage for the five primitives;
- small runtime helpers for overlay, tabs, and toast behavior;
- dedicated component docs pages for the five primitives;
- docs data, site navigation, and docs drift checks;
- focused unit tests and final verification.

## Out Of Scope

These stay outside Phase 16F:

- `<vr-popover>`;
- `<vr-tooltip>`;
- `<vr-command-menu>`;
- modal as a separate primitive or separate system;
- full overlay portal engine;
- global overlay stack manager;
- full positioning engine;
- dropdown roving tabindex;
- dropdown typeahead;
- advanced menu semantics;
- action toasts;
- promise or loading toasts;
- admin shell patterns;
- dashboard patterns;
- mobile pattern system;
- docs-shell adoption of drawer, tabs, dropdown, or toast;
- final October visual QA completion tick.

Phase 16G should own `popover`, `tooltip`, `command menu`, admin shell, dashboard patterns, mobile patterns, richer keyboard behavior, docs-shell dogfooding if needed, full visual QA, and final Phase 16 completion.

## Runtime Architecture

Phase 16F should add small shared helpers only where shared behavior prevents obvious duplication.

The helpers should stay boring and explicit:

- `createOverlayController(...)`
- `createTabsController(...)`
- `createToastController(...)`

These helpers belong in `@vanrot/runtime` only if project-owned primitive source or compiler-generated code benefits from importing them. They should not become a large interaction framework.

### Overlay Controller

`createOverlayController(...)` should support:

- open and closed state;
- trigger registration;
- content registration;
- close on escape;
- close on outside click when enabled;
- focus the first useful element, or the content container, on open;
- restore focus to the trigger on close;
- controlled and uncontrolled usage where practical.

It should not implement a portal engine, a full overlay stack, complex positioning, or global scroll locking in Phase 16F.

### Tabs Controller

`createTabsController(...)` should support:

- selected tab value;
- selecting a tab by click;
- moving selection with arrow keys;
- registering tabs and panels;
- exposing selected state for ARIA wiring.

It should not implement lazy mounting, persistence, nested tab coordination, or advanced activation policies in Phase 16F.

### Toast Controller

`createToastController(...)` should support:

- enqueueing toast messages;
- dismissing toast messages;
- timeout-based dismissal;
- tones such as default, success, warning, and danger;
- exposing a list suitable for an accessible live region.

It should not implement action callbacks, promise lifecycle helpers, undo queues, or global notification persistence in Phase 16F.

## Primitive Anatomy

Primitive anatomy should remain readable in templates and documentation.

Dialog examples should use:

```html
<vr-dialog>
  <vr-dialog-trigger>
    <vr-button>Open</vr-button>
  </vr-dialog-trigger>
  <vr-dialog-content>
    <vr-dialog-header>
      <vr-dialog-title>Edit profile</vr-dialog-title>
      <vr-dialog-description>Update account details.</vr-dialog-description>
    </vr-dialog-header>
    <vr-dialog-footer>
      <vr-button variant.secondary>Cancel</vr-button>
      <vr-button>Save</vr-button>
    </vr-dialog-footer>
  </vr-dialog-content>
</vr-dialog>
```

Drawer examples should use:

```html
<vr-drawer side.right>
  <vr-drawer-trigger>
    <vr-button variant.outline>Open drawer</vr-button>
  </vr-drawer-trigger>
  <vr-drawer-content>
    <vr-drawer-header>
      <vr-drawer-title>Filters</vr-drawer-title>
    </vr-drawer-header>
  </vr-drawer-content>
</vr-drawer>
```

Tabs examples should use:

```html
<vr-tabs value.overview>
  <vr-tabs-list>
    <vr-tabs-trigger value.overview>Overview</vr-tabs-trigger>
    <vr-tabs-trigger value.activity>Activity</vr-tabs-trigger>
  </vr-tabs-list>
  <vr-tabs-panel value.overview>Overview content</vr-tabs-panel>
  <vr-tabs-panel value.activity>Activity content</vr-tabs-panel>
</vr-tabs>
```

Registry metadata should treat `dialog`, `drawer`, `dropdown`, `tabs`, and `toast` as root primitives. Child anatomy such as `dialog-trigger`, `dialog-content`, `tabs-list`, and `tabs-panel` should be documented in registry/docs metadata without forcing every child into top-level component navigation unless implementation proves that a full primitive entry is needed.

## Behavior And Accessibility

Phase 16F behavior must be real enough for examples to be honest.

### Dialog And Drawer

`dialog` and `drawer` must:

- open from trigger or controlled state;
- close on escape;
- close on outside click when enabled;
- restore focus to the trigger after close;
- focus the first meaningful element or content container on open;
- expose accessible title and description anatomy;
- wire `aria-labelledby` and `aria-describedby` where the anatomy is present;
- keep examples usable with keyboard and pointer input.

Deep focus trapping, background inertness, scroll locking, and nested overlay coordination can be hardened in Phase 16G if they prove necessary for final October readiness.

### Dropdown

`dropdown` must:

- open and close from a trigger;
- close on escape;
- close on outside click;
- expose expanded state on the trigger;
- connect trigger and content with IDs;
- document basic item anatomy.

Dropdown arrow roving, typeahead, submenu behavior, and advanced menu semantics stay outside Phase 16F.

### Tabs

`tabs` must:

- select a panel by clicking the matching trigger;
- move selection with arrow keys;
- expose selected state on triggers;
- connect triggers and panels with IDs;
- hide inactive panels accessibly.

Lazy mounting, persistence, and advanced activation policies stay outside Phase 16F.

### Toast

`toast` must:

- render queued toasts through an accessible live region;
- support default, success, warning, and danger tones;
- support manual dismiss;
- support timeout dismiss;
- keep toast examples simple and readable.

Action toasts and promise toasts stay outside Phase 16F.

## Compiler And Registry

Phase 16F should reuse the Phase 16E registry direction.

The shared registry must describe:

- primitive name;
- selector;
- role;
- file names;
- native output tag or generated component shape;
- production phase;
- allowed dotted token attributes;
- allowed token values;
- regular attributes;
- events;
- slots or anatomy;
- examples;
- docs path;
- asset URLs.

The compiler should consume registry metadata for:

- recognizing the five new `vr-*` tags;
- lowering simple semantic output;
- preserving user classes and attributes;
- applying strict dotted token attributes;
- rejecting unknown or duplicate dotted tokens with clear diagnostics.

Phase 16F should not add broad new compiler syntax. It should extend the existing Phase 16 UI lowering path.

## CLI

`vr add` must support the five Phase 16F primitives with the same source-owned model as earlier UI slices.

`vr ui <component> --help` must show:

- component summary;
- file names;
- selector;
- attributes;
- dotted tokens and allowed values;
- events;
- anatomy;
- examples;
- docs path.

CLI copy should stay conventional, guided, and concise.

## Documentation

`apps/vanrot-site` should add example-only component documentation pages for:

- Dialog;
- Drawer;
- Dropdown;
- Tabs;
- Toast.

Each page should follow the current Vanrot component docs pattern:

- title at the top;
- variants or examples overview where useful;
- dedicated example sections;
- dotted preview backgrounds;
- shadcn-style snippets;
- icon-only copy buttons;
- accessibility notes;
- API or registry metadata tables;
- mobile-ready CSS.

The docs site shell should not use drawer, tabs, dropdown, or toast as real navigation in 16F. Adoption can be reconsidered in Phase 16G.

## Testing

Phase 16F should add focused tests across the touched packages.

`@vanrot/ui` tests should cover:

- primitive metadata;
- registry entries;
- token metadata;
- asset/template existence;
- source template naming.

`@vanrot/runtime` tests should cover:

- overlay open and close;
- escape close;
- outside click close;
- initial focus;
- focus restore;
- tab selection;
- arrow-key tab movement;
- toast enqueue;
- toast dismiss;
- toast timeout behavior.

`@vanrot/compiler` tests should cover:

- semantic lowering for the five primitives;
- strict dotted token behavior;
- diagnostics for unknown or duplicate dotted tokens;
- metadata feature reporting.

`@vanrot/cli` tests should cover:

- `vr add` for the five primitives;
- `vr ui <component> --help` for the five primitives;
- registry-driven output for attributes, tokens, events, anatomy, and docs paths.

`@vanrot/vanrot-site` tests should cover:

- docs data for the five primitives;
- routes for the five docs pages;
- page structure;
- examples and accessibility copy;
- docs drift checks.

Final verification should include:

```sh
pnpm verify
git diff --check
```

If Phase 16F changes `apps/vanrot-site`, the local site dev server must be restarted and the relevant docs route must respond on `http://localhost:3000`.

## Completion Tracking

Phase 16F completion should update:

- `docs/superpowers/feature-maturity.md`;
- `docs/superpowers/plans/Phase-16F.md`;
- `docs/superpowers/final-tdd-inventory.md`;
- `docs/vanrot-presentation.html`;
- `docs/superpowers/specs/Phase-16F.md` if requirements change during implementation.

The top-level Phase 16 row must remain unchecked until Phase 16G completes.

The maturity ledger should describe Phase 16G as the remaining final October polish slice. Phase 16G should own popover, tooltip, command menu, richer keyboard behavior, admin/dashboard/mobile patterns, docs-shell dogfooding if needed, full visual QA, and the final Phase 16 completion tick.

## Open Decisions For The Implementation Plan

The implementation plan should decide:

- exact file names for the runtime helpers;
- whether child anatomy gets separate generated source files or root primitive templates only;
- exact dotted token names and values for each primitive;
- exact CLI help table layout for anatomy entries;
- exact docs routes for the five new component pages.

These decisions should be made in `docs/superpowers/plans/Phase-16F.md` without expanding the approved Phase 16F scope.
