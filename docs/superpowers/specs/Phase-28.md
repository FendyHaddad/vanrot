# Phase 28 Behavior Expansion Design

## Status

Drafted for implementation.

## Goal

Ship the Behavior Expansion future-pipeline suite as production-ready `@vanrot/behavior` helpers without adding browser
runtime weight. The suite fills the current gap between the moved Phase 16H behavior package and the richer headless
interaction primitives Vanrot apps need for serious UI work.

## Non-Goals

- Do not move helpers back into `@vanrot/runtime`.
- Do not ship visual components, templates, CSS themes, or generated UI markup.
- Do not add a full date math, virtual scrolling, or drag physics dependency.
- Do not replace the existing form, table, overlay, tabs, tooltip, toast, command menu, or positioned-layer helpers.
- Do not implement Phase 20 store hardening or Phase 21 forms/resources in this phase.

## Design Principles

- Headless first: helpers own state, keyboard behavior, ARIA attributes, and event wiring, while apps own markup.
- Signal first: controllers expose Vanrot signals for reactive reads and use explicit methods for writes.
- Literal owned: behavior names, config suggestions, subpath names, and export names stay in named source-of-truth files.
- DOM-light: DOM connectors are small and disposable; pure controller state remains testable without a browser.
- Opt-in: every helper remains inside `@vanrot/behavior` and config/CLI opt-in surfaces.

## Suite Scope

Phase 28 adds these behavior families:

- `collapsible`: accordion, collapsible, and disclosure state helpers.
- `selection`: listbox, select, combobox, and multi-selection helpers.
- `menu`: context menu, menubar, and navigation menu helpers.
- `toggle`: toggle group and toolbar helpers.
- `scroll-area`: scroll area state and scroll shadow/orientation helpers.
- `portal`: portal mount, cleanup, and SSR-safe no-document handling helpers.
- `focus`: focus trap, roving focus, focus return, and visually hidden prop helpers.
- `calendar`: calendar grid and date-picker state helpers.
- `drag-drop`: draggable/droppable state and reorder helpers.
- `table-resize`: table column resize state helpers.

## Public API

Each family gets a root export, a source subpath, and package export metadata:

- `@vanrot/behavior/collapsible`
- `@vanrot/behavior/selection`
- `@vanrot/behavior/menu`
- `@vanrot/behavior/toggle`
- `@vanrot/behavior/scroll-area`
- `@vanrot/behavior/portal`
- `@vanrot/behavior/focus`
- `@vanrot/behavior/calendar`
- `@vanrot/behavior/drag-drop`
- `@vanrot/behavior/table-resize`

`@vanrot/behavior/all` and the package root re-export the new helpers. Existing subpaths remain unchanged.

## Controller Contracts

Collapsible helpers manage open values, single vs multiple accordion mode, disabled items, and disclosure ARIA state.
Selection helpers manage active option, selected value, typeahead, single-select, multi-select, and combobox query/open
state. Menu helpers manage open menu value, active item movement, menubar orientation, context menu coordinates, and
navigation menu state. Toggle helpers manage pressed values and roving toolbar focus. Scroll-area helpers track viewport
metrics and expose start/end shadow state. Portal helpers mount nodes into a target and return a cleanup function. Focus
helpers trap focus, restore focus, and provide visually-hidden attributes. Calendar helpers create month grids, select
dates, clamp navigation ranges, and expose date-picker open state. Drag-drop helpers track active drag/drop ids and
produce reordered lists. Table-resize helpers track column widths, min/max constraints, and resize handles.

## Config And CLI

`VanrotBehaviorName` and `vr create --behavior` must accept every new family name. Invalid config diagnostics should list
the full valid set. `vr remove behavior` should work through the existing catalog once the catalog knows the new names.

## Docs And Truth Surfaces

The Vanrot site docs, AI-readable docs, feature maturity ledger, final TDD inventory, and future pipeline must all teach
the expanded behavior suite. Future-pipeline rows for Behavior Expansion are checked only after tests and verification
pass.

## Acceptance Criteria

- Focused tests cover every new controller family and export subpath.
- `@vanrot/behavior` builds, typechecks, and tests with the expanded API.
- Config validation and CLI behavior catalog know every new behavior name.
- Docs and AI bundle mention the expanded suite with import examples and usage guidance.
- Phase truth surfaces mark Phase 28 and Behavior Expansion accurately.
- Broad verification includes behavior, config, CLI, site-doc, AI-doc, phase-doc, and final-TDD-inventory checks.
