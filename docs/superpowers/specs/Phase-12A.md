# Vanrot Phase 12A Core Production Audit And Red Test Baseline Design

**Date:** 2026-05-22
**Phase:** Phase 12A - Core Production Audit And Red Test Baseline
**Packages:** runtime, compiler, vite-plugin, cli, testing, docs, local hooks
**Status:** Draft for review
**Related:**
- `AGENTS.md`
- `.git/hooks/pre-commit`
- `docs/superpowers/feature-maturity.md`
- `docs/superpowers/final-tdd-inventory.md`
- `docs/vanrot-presentation.html`
- `packages/runtime`
- `packages/compiler`
- `packages/vite-plugin`
- `packages/testing`

## 1. Goal

Phase 12A starts the production-readiness era for Vanrot's core framework.

The goal is not to harden runtime, compiler, Vite, or TypeScript behavior yet. The goal is to make the production gaps visible as executable red tests, then map each failing case to the later slice that owns the fix.

Normal development verification must stay green. Production audit tests should run through a separate command so the team can intentionally inspect red production gaps without making every local change look broken.

Phase 12A also creates a final TDD inventory ledger. That ledger is a living list of every package, feature, component, command, convention, helper, and example Vanrot has created. Every future phase in `docs/superpowers/feature-maturity.md` must add or update this ledger when it creates or changes framework surface area. In the final distribution phase, Vanrot comes back to this inventory and runs complete TDD coverage across the whole framework before public release.

## 2. Core Decisions

### Red Tests Start Now

Production work should not wait until the end to discover missing behavior. Phase 12A should add real failing tests for known production gaps.

These tests are allowed to fail only in the dedicated production audit lane. They should not be part of `pnpm verify` until their owning hardening slice makes them pass.

### Normal Verification Stays Green

`pnpm verify` remains the everyday quality gate for implemented behavior. It should continue to pass after Phase 12A.

A new audit command, such as `pnpm audit:core`, should run the Phase 12A red tests. The command is expected to report failures while the audit ledger still has unresolved production gaps.

### Every Red Test Has An Owner

Each audit test must map to exactly one later slice:

- `12B` runtime production hardening
- `12C` compiler diagnostics and source locations
- `12D` Vite dev/build/HMR hardening
- `12E` TypeScript contracts and maturity gates

This keeps Phase 12A from becoming a vague pile of failing tests. Every failure becomes a future implementation target.

### Final TDD Inventory Becomes The Release Memory

`docs/superpowers/final-tdd-inventory.md` becomes the durable checklist for final release testing.

The inventory should be pre-populated with everything Vanrot has already implemented across Phases 1 through 11, including packages, conventions, examples, CLI commands, router syntax, UI conventions, and testing helpers.

Every future production phase must update this file whenever it adds or changes any framework surface. The final distribution phase uses the full inventory to perform complete failing and passing TDD coverage before release.

## 3. Production Audit Lane

Phase 12A should introduce a separate audit test lane.

The exact command can be decided in the implementation plan, but the command should satisfy these rules:

- it is easy to run from the repo root;
- it does not run during `pnpm verify`;
- it runs only production-hardening audit tests;
- its output makes clear that failures are expected until 12B through 12E resolve them;
- each failing test name or surrounding metadata names its owner slice.

The audit lane should prefer small, focused test files over one giant production audit test. A future worker should be able to open the failing test for `12B`, understand the runtime gap, and fix it without reading compiler or Vite tests.

## 4. Initial Red Test Areas

Phase 12A should create the first failing tests for the core framework surface.

### 12B Runtime

The runtime audit should cover edge cases in:

- `signal()`
- `computed()`
- `effect()`
- `batch()`
- `untrack()`
- cleanup scopes
- `onMount()`
- `onDestroy()`
- `mount()`
- internal `listen()`

The first tests should focus on behavior that production apps rely on: cleanup ordering, idempotent disposal, nested ownership, nested batches, error behavior, and lifecycle interaction.

### 12C Compiler

The compiler audit should cover production gaps in:

- component file convention resolution across role suffixes;
- component class detection;
- expression rewriting;
- interpolation;
- property binding;
- event binding;
- scoped CSS;
- source locations;
- production diagnostics.

The first tests should prove that diagnostics need code frames, suggestions, source locations, and reliable ownership of unsupported syntax.

### 12D Vite Plugin

The Vite audit should cover production gaps in:

- dev transform behavior;
- build transform behavior;
- virtual source modules;
- virtual CSS modules;
- file watching;
- diagnostics bridge;
- true state-preserving HMR.

The first tests should show that Phase 4's full reload fallback is not enough for production HMR.

### 12E TypeScript Contracts

The TypeScript audit should cover the transformed component import boundary.

Vanrot should not require app authors or generated starters to use `@ts-expect-error` for `.component.ts`, `.page.ts`, or UI role modules that are compiled by the Vite plugin. Phase 12A should add red tests that prove the current gap and hand ownership to 12E.

## 5. Final TDD Inventory

Phase 12A should create:

```txt
docs/superpowers/final-tdd-inventory.md
```

The file should be structured for growth, not prose. It should include package/module sections and checklist rows that can be expanded each phase.

The initial inventory should include at least:

- `@vanrot/runtime`
- `@vanrot/compiler`
- `@vanrot/vite-plugin`
- `@vanrot/cli`
- `@vanrot/router`
- `@vanrot/ui`
- `@vanrot/testing`
- `examples/counter`
- phase documentation verification
- generated app conventions
- generated component/page conventions
- generated UI/button conventions
- route config and named route link conventions
- `<vr-router>` outlet convention
- `<vr-button>` lowering convention
- readable testing helper syntax

Each row should capture:

- package or area;
- feature or convention name;
- current maturity;
- final release test expectation;
- owning phase or future slice;
- notes for known production gaps.

## 6. Agent And Hook Rules

Phase 12A should update durable project rules so the final TDD inventory keeps growing.

`AGENTS.md` should say:

- every phase that adds or changes a package, feature, component, command, convention, example, or test helper must update `docs/superpowers/final-tdd-inventory.md`;
- the inventory is the source of truth for final release TDD coverage;
- the final distribution phase must use this inventory to run complete failing and passing tests before public release.

The local pre-commit hook should require `docs/superpowers/final-tdd-inventory.md` when a phase-completion commit is detected. This keeps the ledger from falling behind.

The phase documentation verifier should eventually check inventory coverage for completed phases. Phase 12A may add the initial verifier rule if it can be kept narrow and reliable; otherwise it must record that verifier hardening as a follow-up.

## 7. Non-Goals

Phase 12A must not:

- fix runtime edge cases;
- implement compiler production diagnostics;
- implement source maps;
- implement true HMR;
- solve transformed component TypeScript declarations;
- mark Phase 12 core features `Production-Ready`;
- add broad docs website content;
- change package publishing strategy;
- run audit tests inside normal `pnpm verify`.

## 8. Acceptance Criteria

Phase 12A is complete when:

- the Phase 12A spec exists and defines the red-test audit lane;
- the Phase 12A plan exists and tracks every implementation task;
- a separate production audit command exists for the first red tests;
- normal `pnpm verify` still passes;
- audit tests fail for known production gaps and name their owning slices;
- `docs/superpowers/final-tdd-inventory.md` exists and is pre-populated with current framework surface area;
- `AGENTS.md` documents the inventory update rule;
- `.git/hooks/pre-commit` requires the inventory when phase completion is detected;
- `docs/superpowers/feature-maturity.md` keeps Phase 12 sliced into 12A through 12E;
- `docs/vanrot-presentation.html` reflects Phase 12A as the active production audit slice;
- no Phase 12 rows are marked `Production-Ready` from audit work alone.

## 9. Self-Review Notes

- The design keeps Phase 12A focused on evidence and tracking, not hardening implementation.
- The design honors the user's requirement that production TDD starts now with real failing tests.
- The design preserves a green normal verification path by isolating red tests in a dedicated audit command.
- The final TDD inventory gives the last distribution phase a durable checklist that grows with every phase.
- The design does not require git staging, committing, pushing, branching, or worktrees.
