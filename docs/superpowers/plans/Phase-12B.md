# Vanrot Phase 12B Runtime Production Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `@vanrot/runtime` production-ready while preserving the current public API unless an additive helper is clearly required.

**Architecture:** Phase 12B hardens runtime ownership, reactivity, lifecycle, mounting, and internal event cleanup inside the existing runtime package. It burns down the 12A runtime audit, expands package tests around production edge cases, keeps compiler/Vite/TypeScript hardening in 12C-12E, and updates the maturity ledger only for runtime rows that pass verification.

**Tech Stack:** TypeScript, Vitest, jsdom, pnpm, size-limit, Markdown.

**Execution Rule:** Work in the current `main` workspace only. Do not run `git add`, `git commit`, `git push`, create a branch, or create a worktree unless the user explicitly asks.

---

## File Structure

```txt
packages/runtime/src/lifecycle/cleanup-scope.ts
  Owns cleanup scopes, active scope tracking, mount callback queues, and the new parent-child ownership behavior.

packages/runtime/src/reactive/graph.ts
  Owns active effect tracking, batching, pending effect flushing, and dependency cleanup.

packages/runtime/src/reactive/effect.ts
  Owns effect execution, cleanup lifecycle, synchronous error propagation, and scope disposal integration.

packages/runtime/src/reactive/computed.ts
  Owns lazy computed caching, dependency invalidation, and subscriber notification.

packages/runtime/src/events/listen.ts
  Owns internal event listener registration and cleanup-scope teardown.

packages/runtime/src/mounting/mount.ts
  Owns root runtime cleanup scope creation, constructor component mounting, compiled component mounting, mount callback flushing, and destroy behavior.

packages/runtime/tests/lifecycle/cleanup-scope.test.ts
  Adds red tests for nested ownership, child-before-parent cleanup, dispose idempotence, and registration during disposal.

packages/runtime/tests/lifecycle/on-mount.test.ts
  Adds lifecycle edge coverage for repeated mount flushes and returned cleanup ownership.

packages/runtime/tests/events/listen.test.ts
  Adds listener event delivery, options, manual disposal, scope disposal, and idempotence coverage.

packages/runtime/tests/reactive/signal.test.ts
  Adds equality and update edge coverage.

packages/runtime/tests/reactive/computed.test.ts
  Adds lazy caching, chained invalidation, throw/retry, and untracked-read coverage.

packages/runtime/tests/reactive/effect.test.ts
  Adds rerun error, cleanup, dependency replacement, and idempotent disposal coverage.

packages/runtime/tests/reactive/batch.test.ts
  Adds nested batch, thrown callback, and computed/effect flush coverage.

packages/runtime/tests/reactive/untrack.test.ts
  Adds untracked reads inside active effects and computeds.

packages/runtime/tests/mounting/mount.test.ts
  Adds production mounting and destroy behavior coverage for constructor and compiled component modules.

audits/core/runtime.audit.ts
  Keeps the Phase 12A runtime audit as proof that the runtime red case has been burned down.

docs/superpowers/feature-maturity.md
  Marks verified runtime rows as `Production-Ready` and keeps the overall Phase 12 track pending for 12C-12E.

docs/superpowers/final-tdd-inventory.md
  Updates runtime entries so Phase 26 knows the runtime package has production coverage and still needs final release confirmation.

docs/vanrot-presentation.html
  Shows Phase 12B as the runtime production-hardening slice.

docs/superpowers/plans/Phase-12B.md
  Tracks this plan and is checked off during execution.
```

## Task 1: Record The Runtime Baseline

**Files:**
- Read: `packages/runtime/src/lifecycle/cleanup-scope.ts`
- Read: `audits/core/runtime.audit.ts`
- Read: `packages/runtime/tests/lifecycle/cleanup-scope.test.ts`
- Read: `packages/runtime/tests/reactive/*.test.ts`
- Read: `packages/runtime/tests/mounting/mount.test.ts`
- Read: `packages/runtime/tests/events/listen.test.ts`

- [x] **Step 1: Confirm the runtime audit is red before fixing runtime**

Run:

```bash
pnpm audit:core
```

Expected: command exits non-zero. The output must include the runtime failure:

```txt
12B runtime production hardening: disposing a parent cleanup scope also disposes nested child scopes first
```

The expected runtime failure is:

```txt
expected [ 'parent cleanup' ] to deeply equal [ 'child cleanup', 'parent cleanup' ]
```

- [x] **Step 2: Confirm normal runtime tests are green before adding new tests**

Run:

```bash
pnpm --filter @vanrot/runtime test
```

Expected: the runtime package test suite passes before Phase 12B changes.

- [x] **Step 3: Confirm runtime size baseline**

Run:

```bash
pnpm verify:size
```

Expected: size-limit passes against the current runtime budget.

## Task 2: Add Cleanup Ownership Red Tests

**Files:**
- Modify: `packages/runtime/tests/lifecycle/cleanup-scope.test.ts`

- [x] **Step 1: Add nested cleanup ownership tests**

Append these tests inside the existing `describe('cleanup scope', () => { ... })` block in `packages/runtime/tests/lifecycle/cleanup-scope.test.ts`:

```ts
  it('disposes child scopes before parent cleanups', () => {
    const parentScope = createCleanupScope();
    const childScope = createCleanupScope();
    const log: string[] = [];

    runWithCleanupScope(parentScope, () => {
      registerCleanup(() => log.push('parent cleanup'));

      runWithCleanupScope(childScope, () => {
        registerCleanup(() => log.push('child cleanup'));
      });
    });

    disposeCleanupScope(parentScope);

    expect(log).toEqual(['child cleanup', 'parent cleanup']);
  });

  it('does not run child cleanups again when a disposed child is disposed directly', () => {
    const parentScope = createCleanupScope();
    const childScope = createCleanupScope();
    const childCleanup = vi.fn();

    runWithCleanupScope(parentScope, () => {
      runWithCleanupScope(childScope, () => registerCleanup(childCleanup));
    });

    disposeCleanupScope(parentScope);
    disposeCleanupScope(childScope);

    expect(childCleanup).toHaveBeenCalledOnce();
  });

  it('does not run cleanups registered while the same scope is disposing', () => {
    const scope = createCleanupScope();
    const lateCleanup = vi.fn();

    runWithCleanupScope(scope, () => {
      registerCleanup(() => {
        registerCleanup(lateCleanup);
      });
    });

    disposeCleanupScope(scope);

    expect(lateCleanup).not.toHaveBeenCalled();
  });

  it('keeps a child scope owned by its first active parent', () => {
    const firstParent = createCleanupScope();
    const secondParent = createCleanupScope();
    const childScope = createCleanupScope();
    const childCleanup = vi.fn();

    runWithCleanupScope(firstParent, () => {
      runWithCleanupScope(childScope, () => registerCleanup(childCleanup));
    });

    runWithCleanupScope(secondParent, () => {
      runWithCleanupScope(childScope, () => {});
    });

    disposeCleanupScope(secondParent);
    expect(childCleanup).not.toHaveBeenCalled();

    disposeCleanupScope(firstParent);
    expect(childCleanup).toHaveBeenCalledOnce();
  });
```

- [x] **Step 2: Run the focused cleanup tests and verify the known red case**

Run:

```bash
pnpm --filter @vanrot/runtime test -- packages/runtime/tests/lifecycle/cleanup-scope.test.ts
```

Expected: the new child-before-parent ownership test fails before implementation. Other failures in this file are acceptable only when they are caused by missing child ownership.

## Task 3: Implement Cleanup Scope Ownership

**Files:**
- Modify: `packages/runtime/src/lifecycle/cleanup-scope.ts`

- [x] **Step 1: Replace the cleanup scope internals**

Update `packages/runtime/src/lifecycle/cleanup-scope.ts` so its ownership model matches this implementation:

```ts
import type { Dispose } from '../reactive/types.js';

declare const cleanupScopeBrand: unique symbol;

export interface CleanupScope {
  readonly [cleanupScopeBrand]: true;
}

interface ScopeInternal {
  cleanups: Dispose[];
  mountCallbacks: Array<() => void | Dispose>;
  childScopes: Set<CleanupScope>;
  parentScope: CleanupScope | null;
}

const scopes = new WeakMap<CleanupScope, ScopeInternal>();

let activeScope: CleanupScope | null = null;

export function createCleanupScope(): CleanupScope {
  const scope = Object.create(null) as CleanupScope;
  scopes.set(scope, {
    cleanups: [],
    mountCallbacks: [],
    childScopes: new Set(),
    parentScope: null,
  });

  if (activeScope !== null) {
    linkChildScope(activeScope, scope);
  }

  return scope;
}

export function runWithCleanupScope<T>(scope: CleanupScope, fn: () => T): T {
  if (!scopes.has(scope)) {
    return fn();
  }

  const previousScope = activeScope;

  if (previousScope !== null && previousScope !== scope) {
    linkChildScope(previousScope, scope);
  }

  activeScope = scope;

  try {
    return fn();
  } finally {
    activeScope = previousScope;
  }
}

export function disposeCleanupScope(scope: CleanupScope): void {
  const internal = scopes.get(scope);

  if (internal === undefined) {
    return;
  }

  scopes.delete(scope);
  unlinkFromParent(scope, internal);

  const childScopes = [...internal.childScopes].reverse();
  internal.childScopes.clear();

  for (const childScope of childScopes) {
    disposeCleanupScope(childScope);
  }

  const cleanups = [...internal.cleanups].reverse();
  internal.cleanups.length = 0;
  internal.mountCallbacks.length = 0;

  for (const cleanup of cleanups) {
    cleanup();
  }
}

export function registerCleanup(fn: Dispose): void {
  const scope = activeScope;

  if (scope === null) {
    return;
  }

  scopes.get(scope)?.cleanups.push(fn);
}

export function registerMountCallback(fn: () => void | Dispose): void {
  const scope = activeScope;

  if (scope === null) {
    return;
  }

  scopes.get(scope)?.mountCallbacks.push(fn);
}

export function flushMountCallbacks(scope: CleanupScope): void {
  const internal = scopes.get(scope);

  if (internal === undefined) {
    return;
  }

  const callbacks = [...internal.mountCallbacks];
  internal.mountCallbacks.length = 0;

  runWithCleanupScope(scope, () => {
    for (const callback of callbacks) {
      const cleanup = callback();

      if (typeof cleanup !== 'function') {
        continue;
      }

      registerCleanup(cleanup);
    }
  });
}

function linkChildScope(parentScope: CleanupScope, childScope: CleanupScope): void {
  if (parentScope === childScope) {
    return;
  }

  const parentInternal = scopes.get(parentScope);
  const childInternal = scopes.get(childScope);

  if (parentInternal === undefined || childInternal === undefined) {
    return;
  }

  if (childInternal.parentScope !== null) {
    return;
  }

  childInternal.parentScope = parentScope;
  parentInternal.childScopes.add(childScope);
}

function unlinkFromParent(scope: CleanupScope, internal: ScopeInternal): void {
  const parentScope = internal.parentScope;

  if (parentScope === null) {
    return;
  }

  scopes.get(parentScope)?.childScopes.delete(scope);
  internal.parentScope = null;
}
```

- [x] **Step 2: Run focused cleanup tests**

Run:

```bash
pnpm --filter @vanrot/runtime test -- packages/runtime/tests/lifecycle/cleanup-scope.test.ts
```

Expected: all cleanup scope tests pass.

- [x] **Step 3: Run the Phase 12A runtime audit**

Run:

```bash
pnpm audit:core
```

Expected: command may still exit non-zero because of 12C, 12D, and 12E. The output must not include the runtime failure:

```txt
12B runtime production hardening: disposing a parent cleanup scope also disposes nested child scopes first
```

## Task 4: Add Lifecycle, Mounting, And Listener Production Tests

**Files:**
- Modify: `packages/runtime/tests/lifecycle/on-mount.test.ts`
- Modify: `packages/runtime/tests/mounting/mount.test.ts`
- Modify: `packages/runtime/tests/events/listen.test.ts`

- [x] **Step 1: Add repeated mount flush and cleanup ownership tests**

Append these tests inside the existing `describe('onMount', () => { ... })` block in `packages/runtime/tests/lifecycle/on-mount.test.ts`:

```ts
  it('does not run the same mount callback twice when flushed twice', () => {
    const scope = createCleanupScope();
    const spy = vi.fn();

    runWithCleanupScope(scope, () => onMount(spy));

    flushMountCallbacks(scope);
    flushMountCallbacks(scope);

    expect(spy).toHaveBeenCalledOnce();
  });

  it('runs mount cleanup before normal scope cleanup when registered later', () => {
    const scope = createCleanupScope();
    const log: string[] = [];

    runWithCleanupScope(scope, () => {
      onMount(() => () => log.push('mount cleanup'));
      onDestroy(() => log.push('destroy cleanup'));
    });

    flushMountCallbacks(scope);
    disposeCleanupScope(scope);

    expect(log).toEqual(['mount cleanup', 'destroy cleanup']);
  });
```

- [x] **Step 2: Add compiled mount ownership tests**

Append these tests inside the existing `describe('mount', () => { ... })` block in `packages/runtime/tests/mounting/mount.test.ts`:

```ts
  it('does not run mount callbacks after destroy is called twice', () => {
    const target = document.createElement('div');
    const cleanup = vi.fn();

    class TestComponent {
      constructor() {
        onMount(() => cleanup);
      }
    }

    const app = mount(TestComponent as ComponentType, target);

    app.destroy();
    app.destroy();

    expect(cleanup).toHaveBeenCalledOnce();
  });

  it('disposes compiled component listeners when the app is destroyed', () => {
    const target = document.createElement('div');
    const button = document.createElement('button');
    const spy = vi.fn();

    const app = mount(
      {
        createComponent() {
          button.addEventListener('click', spy);
          onDestroy(() => button.removeEventListener('click', spy));

          return { node: button, ctx: {} };
        },
      },
      target,
    );

    app.destroy();
    button.click();

    expect(spy).not.toHaveBeenCalled();
  });
```

- [x] **Step 3: Add listener teardown tests**

Append these tests inside the existing `describe('listen', () => { ... })` block in `packages/runtime/tests/events/listen.test.ts`:

```ts
  it('passes the event object to the handler', () => {
    const button = document.createElement('button');
    const spy = vi.fn();

    const dispose = listen(button, 'click', spy);
    button.click();
    dispose();

    expect(spy).toHaveBeenCalledOnce();
    expect(spy.mock.calls[0]?.[0]).toBeInstanceOf(MouseEvent);
  });

  it('honors listener options during manual disposal', () => {
    const button = document.createElement('button');
    const spy = vi.fn();
    const options = { capture: true };

    const dispose = listen(button, 'click', spy, options);

    dispose();
    button.click();

    expect(spy).not.toHaveBeenCalled();
  });

  it('is safe to dispose a listener manually and through scope disposal', () => {
    const scope = createCleanupScope();
    const button = document.createElement('button');
    const spy = vi.fn();
    let dispose = (): void => {};

    runWithCleanupScope(scope, () => {
      dispose = listen(button, 'click', spy);
    });

    dispose();
    disposeCleanupScope(scope);
    button.click();

    expect(spy).not.toHaveBeenCalled();
  });
```

- [x] **Step 4: Run focused lifecycle, mount, and event tests**

Run:

```bash
pnpm --filter @vanrot/runtime test -- packages/runtime/tests/lifecycle/on-mount.test.ts packages/runtime/tests/mounting/mount.test.ts packages/runtime/tests/events/listen.test.ts
```

Expected: all focused lifecycle, mount, and listener tests pass. If a test fails, fix only the runtime module responsible for that behavior.

## Task 5: Add Reactive Kernel Production Tests

**Files:**
- Modify: `packages/runtime/tests/reactive/signal.test.ts`
- Modify: `packages/runtime/tests/reactive/computed.test.ts`
- Modify: `packages/runtime/tests/reactive/effect.test.ts`
- Modify: `packages/runtime/tests/reactive/batch.test.ts`
- Modify: `packages/runtime/tests/reactive/untrack.test.ts`

- [x] **Step 1: Add signal equality and updater tests**

Append these tests inside the existing `describe('signal', () => { ... })` block in `packages/runtime/tests/reactive/signal.test.ts`:

```ts
  it('does not notify effects when set receives the same value', () => {
    const count = signal(0);
    const spy = vi.fn();
    const dispose = effect(() => {
      count();
      spy();
    });
    spy.mockClear();

    count.set(0);

    expect(spy).not.toHaveBeenCalled();
    dispose();
  });

  it('updates from the current value', () => {
    const count = signal(1);

    count.update((current) => current + 4);

    expect(count()).toBe(5);
  });
```

- [x] **Step 2: Add computed lazy cache and retry tests**

Append these tests inside the existing `describe('computed', () => { ... })` block in `packages/runtime/tests/reactive/computed.test.ts`:

```ts
  it('does not compute until read', () => {
    const compute = vi.fn(() => 10);
    const value = computed(compute);

    expect(compute).not.toHaveBeenCalled();
    expect(value()).toBe(10);
    expect(compute).toHaveBeenCalledOnce();
  });

  it('retries after a thrown computation', () => {
    const count = signal(0);
    const value = computed(() => {
      if (count() === 0) {
        throw new Error('not ready');
      }

      return count();
    });

    expect(() => value()).toThrow('not ready');

    count.set(2);

    expect(value()).toBe(2);
  });

  it('does not track values read through untrack inside a computed', () => {
    const tracked = signal(1);
    const untracked = signal(10);
    const value = computed(() => tracked() + untrack(() => untracked()));

    expect(value()).toBe(11);
    untracked.set(20);

    expect(value()).toBe(11);

    tracked.set(2);
    expect(value()).toBe(22);
  });
```

If `untrack` is not imported in this file, add:

```ts
import { untrack } from '../../src/reactive/untrack.js';
```

- [x] **Step 3: Add effect rerun error and idempotent cleanup tests**

Append these tests inside the existing `describe('effect', () => { ... })` block in `packages/runtime/tests/reactive/effect.test.ts`:

```ts
  it('keeps the newest dependency set after a rerun throws', () => {
    const enabled = signal(true);
    const first = signal(0);
    const second = signal(0);
    const spy = vi.fn();
    const dispose = effect(() => {
      if (enabled()) {
        first();
        return;
      }

      second();
      spy();
      throw new Error('second failed');
    });

    expect(() => enabled.set(false)).toThrow('second failed');
    spy.mockClear();

    first.set(1);
    expect(spy).not.toHaveBeenCalled();

    expect(() => second.set(1)).toThrow('second failed');
    expect(spy).toHaveBeenCalledOnce();

    dispose();
  });

  it('is safe to dispose twice after cleanup has run', () => {
    const cleanup = vi.fn();
    const dispose = effect(() => cleanup);

    dispose();
    dispose();

    expect(cleanup).toHaveBeenCalledOnce();
  });
```

- [x] **Step 4: Add nested batch tests**

Append these tests inside the existing `describe('batch', () => { ... })` block in `packages/runtime/tests/reactive/batch.test.ts`:

```ts
  it('flushes once after nested batches finish', () => {
    const count = signal(0);
    const values: number[] = [];
    const dispose = effect(() => values.push(count()));
    values.length = 0;

    batch(() => {
      count.set(1);
      batch(() => {
        count.set(2);
      });
      count.set(3);
    });

    expect(values).toEqual([3]);
    dispose();
  });

  it('restores batch depth when a nested batch throws', () => {
    const count = signal(0);
    const values: number[] = [];
    const dispose = effect(() => values.push(count()));
    values.length = 0;

    expect(() => {
      batch(() => {
        count.set(1);
        batch(() => {
          count.set(2);
          throw new Error('nested batch failed');
        });
      });
    }).toThrow('nested batch failed');

    expect(values).toEqual([2]);

    batch(() => {
      count.set(3);
    });

    expect(values).toEqual([2, 3]);
    dispose();
  });
```

- [x] **Step 5: Add untrack tests**

Append this test inside the existing `describe('untrack', () => { ... })` block in `packages/runtime/tests/reactive/untrack.test.ts`:

```ts
  it('restores the previous tracking context after reading', () => {
    const tracked = signal(0);
    const ignored = signal(0);
    const values: number[] = [];
    const dispose = effect(() => {
      values.push(tracked());
      untrack(() => ignored());
      tracked();
    });
    values.length = 0;

    ignored.set(1);
    expect(values).toEqual([]);

    tracked.set(1);
    expect(values).toEqual([1]);

    dispose();
  });
```

- [x] **Step 6: Run focused reactive tests**

Run:

```bash
pnpm --filter @vanrot/runtime test -- packages/runtime/tests/reactive/signal.test.ts packages/runtime/tests/reactive/computed.test.ts packages/runtime/tests/reactive/effect.test.ts packages/runtime/tests/reactive/batch.test.ts packages/runtime/tests/reactive/untrack.test.ts
```

Expected: all focused reactive tests pass. If a test fails, fix only the runtime module responsible for that behavior.

## Task 6: Run Runtime Package Verification

**Files:**
- No file changes expected unless a previous task exposed a runtime bug.

- [x] **Step 1: Run the full runtime test suite**

Run:

```bash
pnpm --filter @vanrot/runtime test
```

Expected: all runtime tests pass.

- [x] **Step 2: Run runtime typecheck**

Run:

```bash
pnpm --filter @vanrot/runtime typecheck
```

Expected: TypeScript reports no errors.

- [x] **Step 3: Run runtime build**

Run:

```bash
pnpm --filter @vanrot/runtime build
```

Expected: `@vanrot/runtime` builds successfully into `packages/runtime/dist`.

- [x] **Step 4: Run runtime size verification**

Run:

```bash
pnpm verify:size
```

Expected: size-limit passes. If it fails, reduce Phase 12B implementation size without changing the public runtime API.

## Task 7: Burn Down The Runtime Audit Slice

**Files:**
- Read: `audits/core/runtime.audit.ts`

- [x] **Step 1: Run the core audit command**

Run:

```bash
pnpm audit:core
```

Expected: the command may still exit non-zero because of 12C, 12D, and 12E. The output must not show a failing test under:

```txt
12B runtime production hardening
```

- [x] **Step 2: Leave the runtime audit test in place if it now passes**

Do not delete `audits/core/runtime.audit.ts` when it passes. It remains useful evidence that 12B burned down its original red audit.

If `pnpm audit:core` output still marks the runtime audit as failed, return to Task 3 and fix the runtime ownership implementation before proceeding.

## Task 8: Update Runtime Maturity Documentation

**Files:**
- Modify: `docs/superpowers/feature-maturity.md`
- Modify: `docs/superpowers/final-tdd-inventory.md`
- Modify: `docs/vanrot-presentation.html`
- Modify: `docs/superpowers/plans/Phase-12B.md`

- [x] **Step 1: Mark runtime feature rows production-ready**

In `docs/superpowers/feature-maturity.md`, update only the verified runtime rows under:

```md
## `@vanrot/runtime`
```

Set these runtime rows to `Production-Ready`:

```txt
Runtime `signal()`
Runtime `computed()`
Runtime `effect()`
Runtime `batch()`
Runtime `untrack()`
Runtime cleanup scopes
Runtime `onMount()`
Runtime `onDestroy()`
Runtime `mount()`
Runtime compiled component mount bridge
Runtime internal `listen()`
```

Do not mark compiler, Vite plugin, TypeScript contracts, router, UI, store, or the overall Phase 12 roadmap row complete.

- [x] **Step 2: Add a Phase 12B note to the production audit infrastructure row**

In `docs/superpowers/feature-maturity.md`, update the `Core production audit lane` notes so they state that Phase 12B burns down the runtime audit while 12C-12E remain audit-owned.

Use wording equivalent to:

```txt
Phase 12A created the red lane. Phase 12B burns down the runtime audit; compiler, Vite, and TypeScript contract audit failures remain owned by 12C-12E.
```

- [x] **Step 3: Update final TDD inventory runtime maturity**

In `docs/superpowers/final-tdd-inventory.md`, update the `@vanrot/runtime` rows from `Demo-Capable` to `Production-Ready` for the runtime items verified in this phase:

```txt
signal()
computed()
effect()
batch()
untrack()
cleanup scopes
onMount()
onDestroy()
mount() constructor contract
compiled component mount bridge
internal listen()
runtime size budget
```

Keep their final release expectations in place so Phase 26 still has a release-confirmation checklist.

- [x] **Step 4: Update the production roadmap presentation**

In `docs/vanrot-presentation.html`, update the production roadmap slide so Phase 12 shows Phase 12B runtime hardening as the current completed slice, while Phase 12 overall remains pending for 12C-12E.

Use copy equivalent to:

```html
<div class="phase-status" style="color:var(--cyan);">12B runtime hardening complete; 12C next</div>
```

and:

```html
<span style="color:var(--cyan);">Active: Phase 12B runtime production hardening</span>
<span style="color:var(--muted);">Remaining: compiler, Vite, and TypeScript hardening</span>
```

- [x] **Step 5: Check off this plan as implementation tasks complete**

As each task finishes during execution, update its checkbox in `docs/superpowers/plans/Phase-12B.md` from:

```md
- [ ] **Step N: Step title**
```

to:

```md
- [x] **Step N: Step title**
```

Only check a step after its command or edit has actually completed.

## Task 9: Final Verification

**Files:**
- Read: `package.json`
- Read: `docs/superpowers/feature-maturity.md`
- Read: `docs/superpowers/final-tdd-inventory.md`
- Read: `docs/vanrot-presentation.html`
- Read: `docs/superpowers/plans/Phase-12B.md`

- [x] **Step 1: Run the phase documentation verifier**

Run:

```bash
pnpm verify:phase-docs
```

Expected:

```txt
Phase documentation verification passed.
```

- [x] **Step 2: Run the full runtime verification stack**

Run:

```bash
pnpm --filter @vanrot/runtime test
pnpm --filter @vanrot/runtime typecheck
pnpm --filter @vanrot/runtime build
pnpm verify:size
```

Expected: all commands pass.

- [x] **Step 3: Run the core audit and confirm runtime is clean**

Run:

```bash
pnpm audit:core
```

Expected: command may exit non-zero only for 12C, 12D, or 12E. The output must not include a failed runtime audit case.

- [x] **Step 4: Run root verification**

Run:

```bash
pnpm verify
```

Expected: root verification passes.

- [x] **Step 5: Capture final git status**

Run:

```bash
git status --short --branch
```

Expected: working tree shows Phase 12B code and documentation changes only, plus any unrelated pre-existing user changes. Do not stage, commit, or push.

## Self-Review Notes

- Spec coverage: tasks cover cleanup ownership, reactivity, lifecycle, mounting, listener teardown, audit burn-down, runtime verification, size budget, maturity ledger, final TDD inventory, and presentation updates.
- Scope check: compiler diagnostics, source maps, Vite HMR, and TypeScript component import contracts remain outside this plan and stay owned by 12C-12E.
- API check: the plan preserves existing public runtime functions and changes internals only.
- TDD check: known missing behavior starts with a red cleanup ownership test before implementation; existing behavior receives production characterization coverage.
- Git check: the plan intentionally omits commit steps because the user owns staging, commits, and pushes.
