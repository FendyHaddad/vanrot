# `@vanrot/behavior` Modular Behavior Package Design

## Status

Approved brainstorming design. This spec defines the target architecture for moving headless behavior helpers out of `@vanrot/runtime` into a modular `@vanrot/behavior` package.

This is a design spec only. Implementation requires a separate writing plan before code changes.

## Goal

Keep Vanrot's core runtime small while preserving the behavior helpers that make real apps ergonomic. Users should install and import only the behavior they need, instead of paying for every controller through `@vanrot/runtime`.

## Problem

`@vanrot/runtime` currently owns two different concepts:

- Core runtime: signals, computed values, effects, lifecycle, mounting, and compiler-facing internals.
- Headless behavior: forms, tables, overlays, tabs, tooltips, toasts, command menus, and positioned layers.

That mixed surface pushed the measured runtime size to `5.68 kB` gzip. The behavior helpers are useful and justified, but they should not be bundled into the package every Vanrot app needs.

## Design Principles

- Keep `@vanrot/runtime` for the core runtime only.
- Put reusable DOM behavior in `@vanrot/behavior`.
- Prefer per-behavior subpath imports so users can pick only what they use.
- Keep `@vanrot/ui` as the styled component and CSS package.
- Do not add a hard cap for the combined behavior package, because importing all behavior is an explicit user choice.
- Make create, remove, doctor, and docs all explain the same mental model.

## Package Model

The final package split is:

```txt
@vanrot/runtime   signals, lifecycle, mounting, compiler internals
@vanrot/behavior  optional headless behavior controllers
@vanrot/ui        optional styled primitives and CSS
```

`@vanrot/behavior` must support explicit subpath exports:

```ts
import { createTooltipController } from '@vanrot/behavior/tooltip';
import { createTableController } from '@vanrot/behavior/table';
import { positionLayer } from '@vanrot/behavior/positioned-layer';
```

The root export may exist for convenience:

```ts
import { createTooltipController } from '@vanrot/behavior';
```

Docs, examples, generated code, and AI guidance should prefer subpath imports. Root imports are allowed, but `vr doctor` should suggest subpath imports when they would make the app cleaner.

## Behavior Included In The First Migration

Move all current behavior helpers from `@vanrot/runtime` into `@vanrot/behavior`:

| Subpath | Exports |
|---|---|
| `@vanrot/behavior/form` | `createFormController`, `connectFormControl`, validators and form types |
| `@vanrot/behavior/table` | `createTableController`, `connectTableFilter`, table types |
| `@vanrot/behavior/overlay` | `createOverlayController`, overlay types |
| `@vanrot/behavior/tabs` | `createTabsController`, tabs types |
| `@vanrot/behavior/tooltip` | `createTooltipController`, tooltip types |
| `@vanrot/behavior/toast` | `createToastController`, toast types |
| `@vanrot/behavior/command-menu` | `createCommandMenuController`, command menu types |
| `@vanrot/behavior/positioned-layer` | `positionLayer`, positioning types |

No new behavior primitives should be added in the migration phase. New behavior belongs to post-production follow-up work.

## Runtime Boundary

Remove behavior exports from `@vanrot/runtime`.

After migration, `@vanrot/runtime` should keep:

- `signal`
- `computed`
- `effect`
- `batch`
- `untrack`
- `input`, if it remains part of runtime's core signal model
- `mount`
- `onMount`
- `onDestroy`
- compiler-facing internals required by generated output
- runtime graph hooks only if they do not pull avoidable package dependencies into runtime

There should be no compatibility re-exports from `@vanrot/runtime` to `@vanrot/behavior`. The boundary should be clean so users and size checks can trust the package split.

## CLI Create Flow

`vr create` should ask whether to include behavior helpers.

Recommended flow:

```txt
Add behavior helpers?
- No
- Yes
```

If yes:

```txt
Select behavior helpers:
[ ] Form
[ ] Table
[ ] Overlay
[ ] Tabs
[ ] Tooltip
[ ] Toast
[ ] Command menu
[ ] Positioned layer
```

Generated apps should:

- Add `@vanrot/behavior` only when at least one behavior is selected.
- Add selected behavior to `vanrot.config.ts`.
- Generate only selected behavior imports and examples.
- Keep `@vanrot/ui` independent from behavior selection.

The create summary must show exactly what was added.

## Remove Behavior Command

Add a command for removing behavior selections:

```sh
vr remove behavior tooltip
vr remove behavior table
vr remove behavior --package
```

Behavior removal should:

- Remove the selected behavior entry from `vanrot.config.ts`.
- Remove generated helper files or examples owned by the selected behavior when they are still scaffold-owned.
- Avoid deleting user-authored code.
- Leave `@vanrot/behavior` installed by default, because other behavior may still use it.
- Suggest package removal when no behavior remains.

`--package` should remove the `@vanrot/behavior` dependency when no remaining source imports require it.

## Doctor Rules

`vr doctor` should detect behavior hygiene issues and report clear actions.

Required checks:

- `@vanrot/behavior` installed but no behavior imports exist.
- Behavior listed in `vanrot.config.ts` but unused in source.
- Source imports behavior that is not declared in `vanrot.config.ts`.
- Root `@vanrot/behavior` import used when subpath imports would be cleaner.
- `@vanrot/runtime` behavior imports still present after migration.

Example output:

```txt
Unused behavior: tooltip
Run: vr remove behavior tooltip
```

Doctor must report before deleting. Deletion stays with explicit remove commands.

## Documentation Requirements

The Vanrot docs site must explain the new package split:

- `@vanrot/runtime` package page: core runtime only.
- `@vanrot/behavior` package page: optional headless behavior helpers.
- One docs page per migrated behavior.
- `vr create` guide showing behavior prompts.
- `vr remove behavior` guide.
- `vr doctor` behavior hygiene guide.
- Migration guide from runtime behavior imports to `@vanrot/behavior/*`.
- Size guide explaining core runtime, behavior subpaths, and optional UI.

AI documentation bundles must include the same package split and import guidance.

## Size Budget Rules

After behavior moves out:

```txt
@vanrot/runtime
hard cap: strict and small
reason: every app pays for it

@vanrot/behavior/<feature>
report size per behavior
reason: users choose each feature

@vanrot/behavior root export
no hard cap
reason: explicit convenience opt-in

@vanrot/ui
separate CSS and component budget
reason: optional styled system
```

The current `9.99 KB` runtime cap is a temporary rule for the current mixed architecture. The migration should lower the runtime cap after behavior leaves runtime.

## Post-Production Backlog

Implementation must update `docs/superpowers/future-pipeline.md` with future behavior candidates:

- accordion, collapsible, disclosure
- select, listbox, combobox
- context menu, menubar, navigation menu
- toggle group, toolbar
- scroll area, portal, focus utilities, visually hidden helpers
- later: date picker, calendar, drag and drop, table column resizing, richer multi-selection

These are future behavior work. They are not part of the first migration.

## Testing Requirements

The implementation plan must include tests for:

- `@vanrot/behavior` package exports.
- Every migrated behavior subpath.
- `@vanrot/runtime` no longer exporting behavior helpers, with direct coverage for the clean package boundary.
- `@vanrot/runtime` no longer depending on behavior.
- `vr create` prompts and selected behavior dependency output.
- `vr remove behavior` updates to config and scaffold-owned files.
- `vr doctor` unused behavior, undeclared behavior, root import, and stale runtime import diagnostics.
- Docs and AI bundle references to the new package split.
- Runtime size cap after behavior removal.

## Acceptance Criteria

The migration is complete when:

- Existing behavior helpers live in `@vanrot/behavior`.
- Runtime behavior exports are removed.
- `vr create` can generate apps with no behavior, selected behavior, and UI independently.
- `vr remove behavior` can remove individual behavior selections safely.
- `vr doctor` detects unused or mismatched behavior.
- Docs and AI bundles teach `@vanrot/behavior/*` imports.
- Runtime size is remeasured and the cap is lowered to match the smaller core runtime.
- Future behavior candidates are recorded in post-production ideas.
