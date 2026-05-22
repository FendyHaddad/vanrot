# Vanrot Phase 12B Runtime Production Hardening Design

**Date:** 2026-05-22
**Phase:** Phase 12B - Runtime Production Hardening
**Packages:** runtime, tests, docs
**Status:** Draft for review
**Related:**
- `AGENTS.md`
- `audits/core/runtime.audit.ts`
- `docs/superpowers/feature-maturity.md`
- `docs/superpowers/final-tdd-inventory.md`
- `docs/vanrot-presentation.html`
- `packages/runtime`

## 1. Goal

Phase 12B makes `@vanrot/runtime` production-ready.

Phases 2 and 4 made the runtime demo-capable. Phase 12A then added a red audit that exposes a production ownership gap: disposing a parent cleanup scope does not dispose nested child scopes first. Phase 12B owns that gap and the rest of the runtime production contract.

The work should preserve the current public runtime API unless an additive helper is clearly required. Production hardening should improve behavior, tests, internals, and documentation state without pulling compiler, router, UI, or store work into this slice.

## 2. Scope

Phase 12B covers the current `@vanrot/runtime` surface:

- `signal()`
- `computed()`
- `effect()`
- `batch()`
- `untrack()`
- cleanup scopes
- `onMount()`
- `onDestroy()`
- `mount()`
- the compiled component mount bridge
- internal compiler helper `listen()`
- runtime package exports, typing, build, and size budget

The runtime rows in `docs/superpowers/feature-maturity.md` may be marked `Production-Ready` only after this slice has implementation, edge-case coverage, runtime package verification, and size-budget evidence.

## 3. Runtime Behavior Contract

### Cleanup Ownership

Cleanup scopes should behave like ownership scopes.

If a child cleanup scope is created or first entered while a parent scope is active, the parent owns the child. Disposing the parent must dispose child scopes before parent cleanups. Disposal must remain idempotent.

Cleanup registration without an active scope remains a no-op. This keeps generated and runtime-adjacent code tolerant of optional ownership.

### Reactive Kernel

The reactive kernel should keep its current public behavior while hardening edge cases:

- `signal()` tracks reads, triggers writes, avoids stale subscribers, and behaves predictably when values are set repeatedly.
- `computed()` stays lazy, caches while valid, invalidates dependents when sources change, and handles chained computeds.
- `effect()` runs immediately, tracks the latest dependency set, runs previous cleanup before rerun, runs cleanup on dispose, propagates initial and rerun errors synchronously, and remains safe when disposed repeatedly.
- `batch()` coalesces updates until the outermost batch exits, unwinds correctly when callbacks throw, and flushes pending effects exactly once at the correct boundary.
- `untrack()` reads reactive values without subscribing the active effect or computed.

### Lifecycle

`onMount()` queues callbacks until mount flush. If a mount callback returns a cleanup, that cleanup is registered in the same owner scope. Repeated flush and repeated dispose must not duplicate callbacks.

`onDestroy()` remains cleanup registration. Multiple callbacks, nested ownership, and repeated disposal should be covered by tests.

### Mounting

`mount()` keeps its two supported component shapes:

- constructor components;
- compiled component modules with `createComponent()`.

Mounting must create a root cleanup scope, run component creation inside that scope, flush mount callbacks after creation, remove mounted nodes on destroy, dispose the root scope on destroy, and tolerate repeated destroy calls.

Compiled component effects and event listeners must be owned by the mount scope so generated runtime work disappears after destroy.

### Internal Events Helper

`listen()` remains an internal compiler helper, not a public app-author API. It should still be production-tested because generated event bindings depend on it.

The helper must pass event objects through, honor listener options, remove listeners through manual disposal, remove listeners through scope disposal, and treat repeated disposal as a no-op.

## 4. Testing Model

Phase 12B should be test-driven.

The implementation plan should add failing runtime tests first, then adjust internals until they pass. The Phase 12A runtime audit should be burned down by moving the behavior into normal runtime tests and ensuring the audit lane no longer reports a `12B runtime production hardening` failure.

The test suite should favor focused files that match runtime modules instead of one large production test. Runtime tests should cover:

- nested cleanup ownership and child-before-parent disposal;
- repeated disposal;
- cleanup registration during cleanup;
- mount callback cleanup ownership;
- effect cleanup, dependency replacement, rerun errors, and disposal idempotence;
- nested batch flushing and thrown batch callbacks;
- computed chaining and invalidation;
- untracked reads inside effects and computeds;
- constructor and compiled component mounting;
- listener options, event delivery, and teardown paths.

`pnpm audit:core` may continue to fail after Phase 12B because 12C, 12D, and 12E still own red audit tests. It must not continue to fail because of the runtime slice.

## 5. Verification Gates

The Phase 12B implementation is not complete until these commands have been run and their results recorded in the final response:

```bash
pnpm --filter @vanrot/runtime test
pnpm --filter @vanrot/runtime typecheck
pnpm --filter @vanrot/runtime build
pnpm verify:size
pnpm audit:core
pnpm verify
```

If `pnpm audit:core` still exits non-zero because of 12C through 12E, that is acceptable only when the output proves there are no remaining 12B runtime failures.

## 6. Documentation And Tracker Updates

Phase 12B completion must update:

- `docs/superpowers/plans/Phase-12B.md` with all tasks checked;
- `docs/superpowers/feature-maturity.md` so runtime rows reflect the verified production status;
- `docs/superpowers/final-tdd-inventory.md` so Phase 26 knows which runtime areas are now production-covered and which release confirmations remain;
- `docs/vanrot-presentation.html` so the production roadmap shows Phase 12B correctly.

The production roadmap should not mark all of Phase 12 complete from runtime work alone. Phase 12C through 12E still own compiler, Vite, and TypeScript contract hardening.

## 7. Non-Goals

Phase 12B must not:

- add compiler `@if`, `@for`, child components, or slots;
- implement compiler diagnostics or source maps;
- implement Vite true HMR;
- solve transformed component TypeScript declarations;
- change router, UI, testing, store, forms, SSR, docs website, AI, or distribution behavior;
- rename or remove public runtime APIs;
- add broad compiler integration fixtures that belong in Phase 12C.

## 8. Acceptance Criteria

Phase 12B is complete when:

- the Phase 12B spec exists and defines the runtime production contract;
- the Phase 12B plan exists and tracks every implementation task;
- all new runtime behavior is covered by failing tests before fixes;
- the 12A runtime audit no longer reports a runtime failure;
- runtime package tests pass;
- runtime package typecheck passes;
- runtime package build passes;
- runtime size verification passes;
- root `pnpm verify` passes;
- `docs/superpowers/feature-maturity.md` marks only the verified runtime rows `Production-Ready`;
- `docs/superpowers/final-tdd-inventory.md` records the new runtime production coverage;
- `docs/vanrot-presentation.html` reflects the Phase 12B production slice;
- no compiler, Vite, or TypeScript production rows are marked complete by this runtime work.

## 9. Self-Review Notes

- The design keeps Phase 12B focused on `@vanrot/runtime`.
- The design preserves current public APIs unless the later implementation plan proves an additive helper is necessary.
- The design burns down the Phase 12A runtime audit without pretending all Phase 12 audit work is complete.
- The design leaves compiler, Vite, TypeScript contracts, router, UI, and store work in their owner phases.
- The verification model distinguishes `pnpm verify` passing from `pnpm audit:core` still showing non-runtime red tests.
- The design does not require git staging, committing, pushing, branching, or worktrees.
