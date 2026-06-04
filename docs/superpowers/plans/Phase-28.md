# Phase 28 Behavior Expansion Implementation Plan

> **For agentic workers:** Implement this plan inline in the current workspace. Do not use subagents, worktrees, `git add`,
> `git commit`, or `git push` unless the user explicitly asks.

**Goal:** Complete the Behavior Expansion future-pipeline suite as production-ready `@vanrot/behavior` helpers.

**Architecture:** `@vanrot/behavior` owns all headless interaction helpers. `@vanrot/config` owns serializable behavior
names. `@vanrot/cli` exposes helper selection through the existing behavior catalog. Docs and AI surfaces explain the
public contracts. `@vanrot/runtime` stays untouched except as a signal dependency.

**Source Spec:** `docs/superpowers/specs/Phase-28.md`

## File Structure

Create:

- `packages/behavior/src/collapsible.ts`
- `packages/behavior/src/selection.ts`
- `packages/behavior/src/menu.ts`
- `packages/behavior/src/toggle.ts`
- `packages/behavior/src/scroll-area.ts`
- `packages/behavior/src/portal.ts`
- `packages/behavior/src/focus.ts`
- `packages/behavior/src/calendar.ts`
- `packages/behavior/src/drag-drop.ts`
- `packages/behavior/src/table-resize.ts`
- `packages/behavior/src/ui/*-controller.ts` files for the new families.
- `packages/behavior/tests/ui/*-controller.test.ts` files for the new families.

Modify:

- `packages/behavior/src/index.ts`
- `packages/behavior/src/all.ts`
- `packages/behavior/package.json`
- `packages/behavior/tests/exports/exports.test.ts`
- `packages/config/src/types.ts`
- `packages/config/src/validate.ts`
- `packages/config/tests/validate.test.ts`
- `packages/cli/src/behavior/catalog.ts`
- `packages/cli/tests/cli.test.ts`
- `apps/vanrot-site/src/docs/site-data.json`
- `apps/vanrot-site/src/docs/framework-reference.json`
- `docs/ai/**`
- `docs/superpowers/feature-maturity.md`
- `docs/superpowers/final-tdd-inventory.md`
- `docs/superpowers/future-pipeline.md`

## Plan Rules

- Keep helpers headless and signal-first.
- Keep package subpaths stable and explicit.
- Preserve every existing behavior helper and test.
- Add tests before implementation for each behavior family.
- Keep repeated helper names in config/catalog/package exports rather than scattered docs copy where possible.
- Leave unrelated dirty files untouched.

## Tasks

- [x] Task 1: Write failing package export and config tests for the expanded behavior names.
- [x] Task 2: Add collapsible, accordion, and disclosure controller tests; implement the controllers.
- [x] Task 3: Add selection, listbox, select, combobox, and multi-selection tests; implement the controllers.
- [x] Task 4: Add menu, context menu, menubar, and navigation menu tests; implement the controllers.
- [x] Task 5: Add toggle group and toolbar tests; implement the controllers.
- [x] Task 6: Add scroll-area, portal, focus, and visually-hidden tests; implement the helpers.
- [x] Task 7: Add calendar and date-picker tests; implement date navigation and grid helpers.
- [x] Task 8: Add drag-drop, table-resize, and multi-selection integration tests; implement the helpers.
- [x] Task 9: Wire root exports, subpath exports, package exports, config names, CLI catalog, and remove/create behavior flows.
- [x] Task 10: Update Vanrot site docs, framework reference, AI docs, feature maturity, final TDD inventory, and future pipeline.
- [x] Task 11: Run focused package tests and broad docs/release guardrails.

## Verification

- `pnpm --filter @vanrot/behavior test`
- `pnpm --filter @vanrot/behavior typecheck`
- `pnpm --filter @vanrot/config test`
- `pnpm --filter @vanrot/cli test`
- `pnpm --filter @vanrot/vanrot-site test`
- `pnpm verify:site-docs`
- `pnpm verify:ai-docs`
- `pnpm verify:phase-docs`
- `pnpm verify:final-tdd-inventory`
- `pnpm verify`
