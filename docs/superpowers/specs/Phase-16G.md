# Phase 16G Final October Showcase

## Purpose

Phase 16G closes the October UI production track.

Phase 16A established October tokens and styling policy. Phase 16B added core primitives. Phase 16C created the Vanrot learning site. Phase 16D added layout, navigation, and media primitives. Phase 16E added controlled forms and data primitives. Phase 16F added the first interaction foundation.

Phase 16G should turn those slices into a convincing product surface. It ships the remaining interaction primitives, dogfoods the docs shell, adds polished admin, dashboard, and mobile composition patterns, and records visual QA evidence before Phase 16 is called complete.

The goal is a broad October showcase without bloating the public primitive API.

## Approved Direction

Phase 16G uses the **Broad October Showcase** approach.

Approved decisions:

- Ship `<vr-popover>`, `<vr-tooltip>`, and `<vr-command-menu>`.
- Keep admin, dashboard, and mobile surfaces as polished composition patterns, not new primitives.
- Dogfood the docs shell with Vanrot primitives instead of keeping interaction primitives as isolated examples.
- Visibly polish the docs site toward the shadcn documentation feel: tighter spacing, clearer actions, practical search, restrained surfaces, and useful overlay behavior.
- Treat 16G as the final October visual QA and completion slice.
- Keep Phase 17 brutalist flavor work separate.

## Scope

Phase 16G includes these new primitives:

- `<vr-popover>`
- `<vr-tooltip>`
- `<vr-command-menu>`

Phase 16G also includes:

- source templates, usage examples, CSS, and tests for the three primitives;
- registry metadata for tokens, booleans, open attributes, events, slots, anatomy, examples, accessibility notes, and docs paths;
- compiler lowering for the new root tags and anatomy tags;
- dotted token diagnostics for new primitive token groups;
- `vr add` and `vr ui <component> --help` coverage for the three primitives;
- runtime helpers for positioned overlays, tooltip disclosure, and command menu keyboard behavior;
- dedicated component docs pages for popover, tooltip, and command menu;
- docs-shell dogfooding of shipped primitives where they fit the shell;
- admin, dashboard, and mobile pattern pages or sections built from the primitive catalog;
- an October showcase page or section that exercises the full primitive set in realistic layouts;
- desktop and mobile visual QA checks for the docs shell, pattern pages, component pages, and overlays;
- phase tracker, inventory, and presentation updates when implementation is complete.

## Out Of Scope

These stay outside Phase 16G:

- `<vr-admin-shell>`;
- `<vr-mobile-toolbar>`;
- dashboard-specific primitive tags;
- a full floating-ui style positioning engine;
- nested overlay stack management beyond what the current examples require;
- tooltip as a replacement for visible labels;
- async search infrastructure or remote command indexing;
- command menu virtualization;
- command menu plugin/provider architecture;
- charting;
- table virtualization;
- new brutalist tokens or flavor selection.

Admin, dashboard, and mobile work should prove composition quality. They should not add new framework tags unless a later phase explicitly promotes a repeated pattern into API.

## Primitive APIs

The new primitives should follow the readable compound style from Phase 16F.

### Popover

Popover is a non-modal positioned overlay for compact controls, filters, account menus, and page actions.

Approved shape:

```html
<vr-popover align.end side.bottom>
  <vr-popover-trigger>
    <vr-button variant.outline>Open</vr-button>
  </vr-popover-trigger>
  <vr-popover-content>
    <vr-popover-title>Dimensions</vr-popover-title>
    <vr-popover-description>Set the dimensions for the layer.</vr-popover-description>
  </vr-popover-content>
</vr-popover>
```

Popover supports:

- `align.start`, `align.center`, and `align.end`;
- `side.top`, `side.right`, `side.bottom`, and `side.left`;
- `size.sm`, `size.md`, and `size.lg`;
- `motion.instant` and `motion.subtle`;
- `open`;
- `aria-label`;
- `openchange`;
- `close`;
- trigger, content, title, description, and close anatomy.

Popover behavior:

- opens from the trigger;
- closes on Escape;
- closes on outside pointer input;
- restores focus to the trigger after close;
- keeps the content reachable by keyboard;
- respects reduced-motion preferences.

Popover should reuse the existing overlay controller where that stays small. If positioning needs shared code, it should be a narrow helper that resolves side and align classes or inline offsets, not a broad positioning system.

### Tooltip

Tooltip provides short supporting text for icon-only or compact controls. It must not carry essential form labels or page instructions.

Approved shape:

```html
<vr-tooltip side.top align.center>
  <vr-tooltip-trigger>
    <vr-button aria-label="Copy">
      <span aria-hidden="true">Copy</span>
    </vr-button>
  </vr-tooltip-trigger>
  <vr-tooltip-content>Copy page</vr-tooltip-content>
</vr-tooltip>
```

Tooltip supports:

- `side.top`, `side.right`, `side.bottom`, and `side.left`;
- `align.start`, `align.center`, and `align.end`;
- `delay.instant`, `delay.short`, and `delay.normal`;
- `tone.default` and `tone.muted`;
- trigger and content anatomy.

Tooltip behavior:

- opens on hover and focus;
- closes on pointer leave, blur, and Escape;
- does not steal focus;
- avoids pointer traps;
- respects reduced-motion preferences;
- keeps the trigger responsible for the accessible name.

### Command Menu

Command menu provides a keyboard-first palette for docs navigation and app actions.

Approved shape:

```html
<vr-command-menu>
  <vr-command-menu-input placeholder="Search docs..." />
  <vr-command-menu-list>
    <vr-command-menu-group heading="Components">
      <vr-command-menu-item value.dialog>Dialog</vr-command-menu-item>
      <vr-command-menu-item value.dropdown>Dropdown</vr-command-menu-item>
    </vr-command-menu-group>
  </vr-command-menu-list>
</vr-command-menu>
```

Command menu supports:

- `size.sm`, `size.md`, and `size.lg`;
- `density.compact` and `density.comfortable`;
- `tone.default` and `tone.muted`;
- input, list, group, item, empty, and shortcut anatomy;
- disabled items;
- selected item events.

Command menu behavior:

- ArrowDown and ArrowUp move active item;
- Home and End jump within the item list;
- Enter selects the active enabled item;
- Escape closes when used inside a popover or dialog shell;
- disabled items are skipped by keyboard navigation;
- active descendant state is exposed for assistive technology;
- cleanup removes listeners and stale active state.

Filtering can stay app-owned in 16G. The primitive should provide the keyboard and anatomy contract. The docs site can layer simple local filtering over it for the public command palette.

## Docs Shell Dogfooding

Full dogfooding means the docs site should use shipped Vanrot primitives for real shell behavior wherever they fit.

Required docs-shell adoption:

- Use `<vr-command-menu>` for docs navigation and search.
- Use `<vr-tooltip>` for icon-only actions such as copy code, previous page, next page, command palette trigger, sidebar controls, and compact page actions.
- Use `<vr-popover>` for compact topbar actions, page action menus, filter menus, or similar shell controls.
- Continue using existing layout and navigation primitives for the docs shell.
- Use dialog, drawer, dropdown, tabs, and toast in shell or showcase flows where doing so improves the real experience.

The docs shell should keep its recognizable structure, but the visual finish should move closer to shadcn:

- tighter preview and code panels;
- quiet bordered surfaces;
- clear focus states;
- compact icon actions with tooltips;
- practical command/search behavior;
- overlay layers that feel intentional on desktop and mobile.

Any remaining bespoke shell behavior should be documented in the plan as an explicit exception, not left as accidental drift.

## Pattern Pages

Admin, dashboard, and mobile patterns should be composition examples.

### Admin Pattern

The admin pattern should combine:

- sidebar navigation;
- topbar;
- breadcrumbs;
- command menu;
- account popover or dropdown;
- stats;
- table or list;
- filters;
- toast feedback.

It should look like a real operational screen, not a marketing page.

### Dashboard Pattern

The dashboard pattern should combine:

- stat grid;
- dense table or list;
- filter popover;
- empty and loading states;
- pagination where useful;
- compact actions;
- responsive density.

It should prove that October can build scanning-heavy app screens.

### Mobile Pattern

The mobile pattern should combine:

- compact topbar;
- drawer or sidebar behavior;
- command palette trigger;
- touch-friendly actions;
- mobile-safe overlay sizing;
- non-overlapping text and controls.

It should verify that the same primitive catalog works under narrow viewports.

## Runtime Architecture

Phase 16G can extend the Phase 16F interaction helpers, but it should not introduce a large UI manager.

Runtime additions may include:

- a narrow positioned overlay helper for side and align behavior;
- tooltip disclosure helpers for hover, focus, delay, Escape, and cleanup;
- command menu helpers for active item state, disabled-item skipping, selection, and keyboard handling.

Shared helpers should be used only where they reduce duplication across generated templates, package source, or docs previews. CSS classes and native browser behavior should carry the rest.

## Compiler, Registry, And CLI

The registry remains the source of truth for component support.

Implementation should update:

- `uiPrimitiveType`;
- primitive order;
- component registry;
- token scales if new token groups need named constants;
- docs paths;
- package asset checks;
- compiler root tag and anatomy lowering;
- dotted token diagnostics;
- CLI `vr add`;
- CLI `vr ui <component> --help`;
- site component docs and navigation.

Compiler lowering should keep semantic DOM output readable. Unsupported Vanrot-owned `vr-*` tags and unsupported anatomy tags should continue producing clear diagnostics instead of compiling as unknown custom elements.

## Accessibility

Phase 16G must preserve October's accessibility bar.

Popover requirements:

- trigger exposes expanded state;
- content can be reached by keyboard;
- Escape and outside pointer close;
- focus restores after close.

Tooltip requirements:

- opens on focus as well as hover;
- closes on Escape;
- avoids focus capture;
- does not replace required visible labels.

Command menu requirements:

- input has an accessible label or placeholder plus shell label;
- active item state is exposed;
- disabled items are skipped;
- Enter selection is keyboard reachable;
- Escape is predictable when hosted in an overlay.

Pattern and docs-shell requirements:

- icon-only controls have labels and tooltips;
- focus-visible states are obvious;
- overlay layering does not hide active controls;
- mobile controls meet touch target expectations;
- text does not overlap or clip.

## Testing And Verification

Runtime tests should cover:

- popover open and close;
- outside pointer close;
- Escape close;
- focus restore;
- tooltip hover and focus disclosure;
- tooltip delay behavior;
- tooltip cleanup;
- command menu keyboard navigation;
- command menu disabled items;
- command menu active descendant state;
- command menu selection events;
- controller cleanup.

Compiler tests should cover:

- root tag lowering for popover, tooltip, and command menu;
- anatomy tag lowering;
- role and attribute defaults where applicable;
- dotted token lowering;
- duplicate token diagnostics;
- unknown token diagnostics;
- unsupported anatomy diagnostics.

UI package tests should cover:

- source assets exist;
- usage examples exist;
- metadata stays in sync;
- docs paths exist;
- CLI help consumes registry metadata;
- package asset inventory includes the three primitives.

Site tests should cover:

- component docs routes;
- sidebar and gallery navigation;
- docs-shell command menu markers;
- tooltip-wrapped icon actions;
- popover-backed shell controls;
- admin pattern route or section;
- dashboard pattern route or section;
- mobile pattern route or section;
- October showcase route or section.

Visual verification should include:

- desktop component pages for the new primitives;
- mobile component pages for the new primitives;
- command menu open state;
- tooltip visible state;
- popover open state;
- admin pattern desktop view;
- dashboard pattern desktop view;
- mobile pattern narrow view;
- docs shell topbar and sidebar;
- non-overlap, focus visibility, and overlay layering checks.

Final verification should include:

```sh
pnpm verify
pkill -f "vite/bin/vite.js.*--port 1964" || true
pnpm --filter @vanrot/vanrot-site dev -- --host 127.0.0.1 --port 1964
```

The relevant routes should respond on `http://localhost:1964` and be inspected in the browser before completion is claimed.

## Tracker Updates

During implementation completion, update:

- `docs/superpowers/feature-maturity.md`;
- `docs/superpowers/final-tdd-inventory.md`;
- `docs/vanrot-presentation.html`;
- the matching Phase 16G plan checklist;
- any changed Phase 16 requirement docs.

Phase 16 should be marked complete only after Phase 16G passes verification and visual QA.

## Production Readiness Outcome

After Phase 16G:

- October has the final interaction primitives needed by the current Phase 16 backlog.
- The docs shell uses Vanrot primitives in real site behavior.
- The public component docs remain copyable and editable.
- Admin, dashboard, and mobile composition patterns demonstrate production app surfaces.
- Visual QA evidence exists for desktop, mobile, overlays, and shell dogfooding.
- Phase 17 can start brutalist flavor work on top of stable October contracts.
