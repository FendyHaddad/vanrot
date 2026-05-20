# @vanrot/runtime Kernel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `@vanrot/runtime` — the reactive kernel that owns the dependency graph, cleanup ownership, component lifecycle, and top-level mounting.

**Architecture:** Fine-grained reactivity (SolidJS-style) with a shared internal graph module. All reactive APIs read/write the graph through exported functions, not shared mutable state. Cleanup scopes are opaque handles tracked by WeakMap, enabling composable ownership without leaking internals.

**Tech Stack:** TypeScript 5, Vitest 2, pnpm workspaces, size-limit 11

**Spec:** `docs/superpowers/specs/2026-05-20-vanrot-runtime-kernel-design.md`

---

## File Structure

```
packages/
  runtime/
    src/
      reactive/
        types.ts           — Signal, WritableSignal, Dispose shared types
        graph.ts           — internal reactive graph state and operations
        signal.ts          — signal()
        computed.ts        — computed()
        effect.ts          — effect()
        batch.ts           — batch()
        untrack.ts         — untrack()
      lifecycle/
        cleanup-scope.ts   — CleanupScope, create/run/dispose/flush primitives
        on-destroy.ts      — onDestroy()
        on-mount.ts        — onMount()
      mounting/
        mount.ts           — mount(), AppHandle
      events/
        listen.ts          — listen() (internal, compiler-facing)
      index.ts             — public re-exports (@vanrot/runtime)
      internal.ts          — internal re-exports (@vanrot/runtime/internal)
    tests/
      reactive/
        signal.test.ts
        computed.test.ts
        effect.test.ts
        batch.test.ts
        untrack.test.ts
      lifecycle/
        cleanup-scope.test.ts
        on-destroy.test.ts
        on-mount.test.ts
      mounting/
        mount.test.ts      — requires jsdom
      events/
        listen.test.ts     — requires jsdom
    package.json
    tsconfig.json
    vitest.config.ts
    .size-limit.json
tsconfig.base.json
package.json               — workspace root
pnpm-workspace.yaml
```

---

## Phase 1 — Monorepo Scaffolding

### Task 1: Init monorepo root and runtime package

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `tsconfig.base.json`
- Create: `packages/runtime/package.json`
- Create: `packages/runtime/tsconfig.json`
- Create: `packages/runtime/vitest.config.ts`

- [ ] **Step 1: Create workspace root files**

`package.json`:
```json
{
  "name": "vanrot",
  "private": true,
  "scripts": {
    "test": "pnpm --filter '@vanrot/*' test",
    "build": "pnpm --filter '@vanrot/*' build",
    "size": "pnpm --filter '@vanrot/runtime' size"
  }
}
```

`pnpm-workspace.yaml`:
```yaml
packages:
  - 'packages/*'
```

`tsconfig.base.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "lib": ["ES2022", "DOM"]
  }
}
```

- [ ] **Step 2: Create runtime package files**

`packages/runtime/package.json`:
```json
{
  "name": "@vanrot/runtime",
  "version": "0.0.1",
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./internal": {
      "import": "./dist/internal.js",
      "types": "./dist/internal.d.ts"
    }
  },
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "test:watch": "vitest",
    "size": "size-limit"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "vitest": "^2.0.0",
    "jsdom": "^24.0.0",
    "@size-limit/preset-small-lib": "^11.0.0",
    "size-limit": "^11.0.0"
  }
}
```

`packages/runtime/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src"]
}
```

`packages/runtime/vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    environmentMatchGlobs: [
      ['tests/mounting/**', 'jsdom'],
      ['tests/events/**', 'jsdom'],
    ],
  },
});
```

- [ ] **Step 3: Install dependencies**

```bash
cd packages/runtime && pnpm install
```

Expected: `node_modules/` created, no errors.

- [ ] **Step 4: Verify test runner works**

Create `packages/runtime/tests/smoke.test.ts`:
```ts
import { describe, it, expect } from 'vitest';

describe('smoke', () => {
  it('vitest runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

Run: `cd packages/runtime && pnpm test`
Expected: `1 passed`

- [ ] **Step 5: Commit**

```bash
git init
git add package.json pnpm-workspace.yaml tsconfig.base.json packages/runtime/
git commit -m "chore: init monorepo with @vanrot/runtime package scaffold"
```

---

## Phase 2 — Reactive Graph Foundation

### Task 2: Implement reactive graph internals

**Files:**
- Create: `packages/runtime/src/reactive/graph.ts`

The graph module owns all mutable reactive state. All other reactive modules import functions from here — they never manage `activeEffect` or `batchDepth` directly.

- [ ] **Step 1: Write the failing test**

Create `packages/runtime/tests/reactive/graph.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import {
  getActiveEffect,
  setActiveEffect,
  trackEffect,
  triggerEffects,
  beginBatch,
  endBatch,
  type ReactiveEffect,
} from '../../src/reactive/graph.js';

describe('graph', () => {
  it('getActiveEffect returns null by default', () => {
    expect(getActiveEffect()).toBeNull();
  });

  it('setActiveEffect sets and returns previous', () => {
    const effect: ReactiveEffect = { deps: new Set(), run: () => {} };
    const prev = setActiveEffect(effect);
    expect(prev).toBeNull();
    expect(getActiveEffect()).toBe(effect);
    setActiveEffect(null); // restore
  });

  it('trackEffect adds activeEffect to subscribers', () => {
    const effect: ReactiveEffect = { deps: new Set(), run: () => {} };
    const subscribers = new Set<ReactiveEffect>();
    setActiveEffect(effect);
    trackEffect(subscribers);
    setActiveEffect(null);
    expect(subscribers.has(effect)).toBe(true);
    expect(effect.deps.has(subscribers)).toBe(true);
  });

  it('trackEffect is no-op when no active effect', () => {
    const subscribers = new Set<ReactiveEffect>();
    trackEffect(subscribers);
    expect(subscribers.size).toBe(0);
  });

  it('triggerEffects calls run on each subscriber', () => {
    const runs: number[] = [];
    const e1: ReactiveEffect = { deps: new Set(), run: () => runs.push(1) };
    const e2: ReactiveEffect = { deps: new Set(), run: () => runs.push(2) };
    const subscribers = new Set<ReactiveEffect>([e1, e2]);
    triggerEffects(subscribers);
    expect(runs).toContain(1);
    expect(runs).toContain(2);
  });

  it('beginBatch/endBatch defers triggerEffects', () => {
    const runs: number[] = [];
    const e: ReactiveEffect = { deps: new Set(), run: () => runs.push(1) };
    const subscribers = new Set<ReactiveEffect>([e]);
    beginBatch();
    triggerEffects(subscribers);
    expect(runs).toHaveLength(0); // deferred
    endBatch();
    expect(runs).toHaveLength(1); // flushed
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd packages/runtime && pnpm test tests/reactive/graph.test.ts
```

Expected: FAIL — `Cannot find module '../../src/reactive/graph.js'`

- [ ] **Step 3: Implement graph.ts**

Create `packages/runtime/src/reactive/graph.ts`:
```ts
export interface ReactiveEffect {
  run(): void;
  deps: Set<Set<ReactiveEffect>>;
}

let _activeEffect: ReactiveEffect | null = null;
let _batchDepth = 0;
const _pendingQueue = new Set<ReactiveEffect>();

export function getActiveEffect(): ReactiveEffect | null {
  return _activeEffect;
}

export function setActiveEffect(effect: ReactiveEffect | null): ReactiveEffect | null {
  const prev = _activeEffect;
  _activeEffect = effect;
  return prev;
}

export function trackEffect(subscribers: Set<ReactiveEffect>): void {
  if (_activeEffect !== null) {
    subscribers.add(_activeEffect);
    _activeEffect.deps.add(subscribers);
  }
}

export function triggerEffects(subscribers: ReadonlySet<ReactiveEffect>): void {
  for (const effect of [...subscribers]) {
    if (_batchDepth > 0) {
      _pendingQueue.add(effect);
    } else {
      effect.run();
    }
  }
}

export function beginBatch(): void {
  _batchDepth++;
}

export function endBatch(): void {
  _batchDepth--;
  if (_batchDepth === 0) {
    const queue = [..._pendingQueue];
    _pendingQueue.clear();
    for (const effect of queue) {
      effect.run();
    }
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd packages/runtime && pnpm test tests/reactive/graph.test.ts
```

Expected: `6 passed`

- [ ] **Step 5: Commit**

```bash
git add packages/runtime/src/reactive/graph.ts packages/runtime/tests/reactive/graph.test.ts
git commit -m "feat(@vanrot/runtime): add reactive graph core"
```

---

### Task 3: Shared types

**Files:**
- Create: `packages/runtime/src/reactive/types.ts`

No tests needed — pure type declarations.

- [ ] **Step 1: Create types.ts**

```ts
export type Signal<T> = () => T;

export type WritableSignal<T> = Signal<T> & {
  set(value: T): void;
  update(updater: (current: T) => T): void;
};

export type Dispose = () => void;
```

- [ ] **Step 2: Commit**

```bash
git add packages/runtime/src/reactive/types.ts
git commit -m "feat(@vanrot/runtime): add shared reactive types"
```

---

## Phase 3 — Reactive API

### Task 4: Implement signal()

**Files:**
- Create: `packages/runtime/src/reactive/signal.ts`
- Create: `packages/runtime/tests/reactive/signal.test.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/runtime/tests/reactive/signal.test.ts`:
```ts
import { describe, it, expect, vi, afterEach } from 'vitest';
import { signal } from '../../src/reactive/signal.js';
import { effect } from '../../src/reactive/effect.js';

describe('signal', () => {
  it('reads initial value', () => {
    const count = signal(0);
    expect(count()).toBe(0);
  });

  it('updates with set()', () => {
    const count = signal(0);
    count.set(5);
    expect(count()).toBe(5);
  });

  it('updates with update()', () => {
    const count = signal(3);
    count.update(v => v + 1);
    expect(count()).toBe(4);
  });

  it('skips notification when value is identical', () => {
    const count = signal(0);
    const spy = vi.fn();
    const dispose = effect(() => { count(); spy(); });
    spy.mockClear();
    count.set(0);
    expect(spy).not.toHaveBeenCalled();
    dispose();
  });

  it('notifies effect on value change', () => {
    const count = signal(0);
    const values: number[] = [];
    const dispose = effect(() => values.push(count()));
    count.set(1);
    count.set(2);
    expect(values).toEqual([0, 1, 2]);
    dispose();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd packages/runtime && pnpm test tests/reactive/signal.test.ts
```

Expected: FAIL — `Cannot find module '../../src/reactive/signal.js'`

- [ ] **Step 3: Implement signal.ts**

Create `packages/runtime/src/reactive/signal.ts`:
```ts
import { type ReactiveEffect, trackEffect, triggerEffects } from './graph.js';
import type { WritableSignal } from './types.js';

export type { Signal, WritableSignal } from './types.js';

export function signal<T>(initialValue: T): WritableSignal<T> {
  let _value = initialValue;
  const _subscribers = new Set<ReactiveEffect>();

  const read = (): T => {
    trackEffect(_subscribers);
    return _value;
  };

  read.set = (newValue: T): void => {
    if (Object.is(_value, newValue)) return;
    _value = newValue;
    triggerEffects(new Set(_subscribers));
  };

  read.update = (updater: (current: T) => T): void => {
    read.set(updater(_value));
  };

  return read as WritableSignal<T>;
}
```

Note: `effect` is imported by the test but not yet implemented — implement Task 5 before running this test suite to completion. Signal tests share the effect import.

- [ ] **Step 4: Commit signal (tests will pass after effect is done)**

```bash
git add packages/runtime/src/reactive/signal.ts packages/runtime/tests/reactive/signal.test.ts
git commit -m "feat(@vanrot/runtime): add signal()"
```

---

### Task 5: Implement effect()

**Files:**
- Create: `packages/runtime/src/reactive/effect.ts`
- Create: `packages/runtime/tests/reactive/effect.test.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/runtime/tests/reactive/effect.test.ts`:
```ts
import { describe, it, expect, vi } from 'vitest';
import { signal } from '../../src/reactive/signal.js';
import { effect } from '../../src/reactive/effect.js';

describe('effect', () => {
  it('runs immediately on creation', () => {
    const spy = vi.fn();
    const dispose = effect(spy);
    expect(spy).toHaveBeenCalledOnce();
    dispose();
  });

  it('re-runs when tracked signal changes', () => {
    const count = signal(0);
    const spy = vi.fn();
    const dispose = effect(() => { count(); spy(); });
    spy.mockClear();
    count.set(1);
    expect(spy).toHaveBeenCalledOnce();
    dispose();
  });

  it('dispose() stops re-runs', () => {
    const count = signal(0);
    const spy = vi.fn();
    const dispose = effect(() => { count(); spy(); });
    spy.mockClear();
    dispose();
    count.set(1);
    expect(spy).not.toHaveBeenCalled();
  });

  it('runs cleanup function before re-execution', () => {
    const count = signal(0);
    const log: string[] = [];
    const dispose = effect(() => {
      count();
      log.push('run');
      return () => log.push('cleanup');
    });
    count.set(1);
    expect(log).toEqual(['run', 'cleanup', 'run']);
    dispose();
  });

  it('runs cleanup on dispose', () => {
    const cleanup = vi.fn();
    const dispose = effect(() => cleanup);
    dispose();
    expect(cleanup).toHaveBeenCalledOnce();
  });

  it('does not re-run after dispose even when cleanup is called', () => {
    const count = signal(0);
    const spy = vi.fn();
    const dispose = effect(() => { count(); spy(); });
    dispose();
    spy.mockClear();
    count.set(1);
    expect(spy).not.toHaveBeenCalled();
  });

  it('propagates errors synchronously from initial run', () => {
    expect(() => {
      effect(() => { throw new Error('boom'); });
    }).toThrow('boom');
  });

  it('propagates errors synchronously from re-run', () => {
    const count = signal(0);
    effect(() => {
      if (count() > 0) throw new Error('boom');
    });
    expect(() => count.set(1)).toThrow('boom');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd packages/runtime && pnpm test tests/reactive/effect.test.ts
```

Expected: FAIL — `Cannot find module '../../src/reactive/effect.js'`

- [ ] **Step 3: Implement effect.ts**

Create `packages/runtime/src/reactive/effect.ts`:
```ts
import { type ReactiveEffect, setActiveEffect } from './graph.js';
import type { Dispose } from './types.js';

export type { Dispose } from './types.js';

export function effect(run: () => void | Dispose): Dispose {
  let _cleanup: Dispose | void;
  let _disposed = false;

  const self: ReactiveEffect = {
    deps: new Set(),
    run(): void {
      if (_disposed) return;

      // unsubscribe from all previous sources
      for (const dep of self.deps) dep.delete(self);
      self.deps.clear();

      // run previous cleanup
      if (_cleanup) {
        const c = _cleanup;
        _cleanup = undefined;
        c();
      }

      // re-execute with tracking
      const prev = setActiveEffect(self);
      try {
        _cleanup = run() ?? undefined;
      } finally {
        setActiveEffect(prev);
      }
    },
  };

  self.run();

  return (): void => {
    if (_disposed) return;
    _disposed = true;
    for (const dep of self.deps) dep.delete(self);
    self.deps.clear();
    if (_cleanup) _cleanup();
  };
}
```

- [ ] **Step 4: Run effect tests**

```bash
cd packages/runtime && pnpm test tests/reactive/effect.test.ts
```

Expected: `8 passed`

- [ ] **Step 5: Run signal tests (now effect is available)**

```bash
cd packages/runtime && pnpm test tests/reactive/signal.test.ts
```

Expected: `5 passed`

- [ ] **Step 6: Commit**

```bash
git add packages/runtime/src/reactive/effect.ts packages/runtime/tests/reactive/effect.test.ts
git commit -m "feat(@vanrot/runtime): add effect()"
```

---

### Task 6: Implement untrack()

**Files:**
- Create: `packages/runtime/src/reactive/untrack.ts`
- Create: `packages/runtime/tests/reactive/untrack.test.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/runtime/tests/reactive/untrack.test.ts`:
```ts
import { describe, it, expect, vi } from 'vitest';
import { signal } from '../../src/reactive/signal.js';
import { effect } from '../../src/reactive/effect.js';
import { untrack } from '../../src/reactive/untrack.js';

describe('untrack', () => {
  it('reads signal without subscribing', () => {
    const a = signal(0);
    const b = signal(0);
    const spy = vi.fn();

    const dispose = effect(() => {
      a();                    // tracked
      untrack(() => b());     // not tracked
      spy();
    });

    spy.mockClear();
    b.set(1);                 // should NOT re-run effect
    expect(spy).not.toHaveBeenCalled();

    a.set(1);                 // SHOULD re-run effect
    expect(spy).toHaveBeenCalledOnce();
    dispose();
  });

  it('returns the read value', () => {
    const count = signal(42);
    expect(untrack(() => count())).toBe(42);
  });

  it('works outside an effect', () => {
    const count = signal(7);
    expect(() => untrack(() => count())).not.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd packages/runtime && pnpm test tests/reactive/untrack.test.ts
```

Expected: FAIL — `Cannot find module '../../src/reactive/untrack.js'`

- [ ] **Step 3: Implement untrack.ts**

Create `packages/runtime/src/reactive/untrack.ts`:
```ts
import { setActiveEffect } from './graph.js';

export function untrack<T>(read: () => T): T {
  const prev = setActiveEffect(null);
  try {
    return read();
  } finally {
    setActiveEffect(prev);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd packages/runtime && pnpm test tests/reactive/untrack.test.ts
```

Expected: `3 passed`

- [ ] **Step 5: Commit**

```bash
git add packages/runtime/src/reactive/untrack.ts packages/runtime/tests/reactive/untrack.test.ts
git commit -m "feat(@vanrot/runtime): add untrack()"
```

---

### Task 7: Implement computed()

**Files:**
- Create: `packages/runtime/src/reactive/computed.ts`
- Create: `packages/runtime/tests/reactive/computed.test.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/runtime/tests/reactive/computed.test.ts`:
```ts
import { describe, it, expect, vi } from 'vitest';
import { signal } from '../../src/reactive/signal.js';
import { computed } from '../../src/reactive/computed.js';
import { effect } from '../../src/reactive/effect.js';

describe('computed', () => {
  it('returns computed value', () => {
    const a = signal(2);
    const b = signal(3);
    const sum = computed(() => a() + b());
    expect(sum()).toBe(5);
  });

  it('updates when source signal changes', () => {
    const a = signal(1);
    const double = computed(() => a() * 2);
    a.set(5);
    expect(double()).toBe(10);
  });

  it('is lazy — does not recompute until read', () => {
    const a = signal(0);
    const spy = vi.fn(() => a() * 2);
    const doubled = computed(spy);
    spy.mockClear();
    a.set(1);
    expect(spy).not.toHaveBeenCalled(); // not read yet
    doubled();                           // trigger read
    expect(spy).toHaveBeenCalledOnce();
  });

  it('does not recompute when read twice without source change', () => {
    const a = signal(0);
    const spy = vi.fn(() => a() * 2);
    const doubled = computed(spy);
    doubled(); // first read
    spy.mockClear();
    doubled(); // second read — should use cached value
    expect(spy).not.toHaveBeenCalled();
  });

  it('notifies dependent effects when source changes', () => {
    const a = signal(0);
    const doubled = computed(() => a() * 2);
    const values: number[] = [];
    const dispose = effect(() => values.push(doubled()));
    a.set(3);
    expect(values).toEqual([0, 6]);
    dispose();
  });

  it('chains: computed depending on computed', () => {
    const base = signal(1);
    const doubled = computed(() => base() * 2);
    const quadrupled = computed(() => doubled() * 2);
    base.set(3);
    expect(quadrupled()).toBe(12);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd packages/runtime && pnpm test tests/reactive/computed.test.ts
```

Expected: FAIL — `Cannot find module '../../src/reactive/computed.js'`

- [ ] **Step 3: Implement computed.ts**

Create `packages/runtime/src/reactive/computed.ts`:
```ts
import { type ReactiveEffect, setActiveEffect, trackEffect, triggerEffects } from './graph.js';
import type { Signal } from './types.js';

export type { Signal } from './types.js';

export function computed<T>(compute: () => T): Signal<T> {
  let _value: T;
  let _dirty = true;
  const _subscribers = new Set<ReactiveEffect>();

  const self: ReactiveEffect = {
    deps: new Set(),
    run(): void {
      // unsubscribe from previous sources before re-tracking
      for (const dep of self.deps) dep.delete(self);
      self.deps.clear();
      _dirty = true;
      // notify all effects/computeds that depend on this computed
      triggerEffects(new Set(_subscribers));
    },
  };

  return (): T => {
    trackEffect(_subscribers);

    if (_dirty) {
      // unsubscribe from previous sources before re-tracking
      for (const dep of self.deps) dep.delete(self);
      self.deps.clear();

      const prev = setActiveEffect(self);
      try {
        _value = compute();
        _dirty = false;
      } finally {
        setActiveEffect(prev);
      }
    }

    return _value!;
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd packages/runtime && pnpm test tests/reactive/computed.test.ts
```

Expected: `6 passed`

- [ ] **Step 5: Commit**

```bash
git add packages/runtime/src/reactive/computed.ts packages/runtime/tests/reactive/computed.test.ts
git commit -m "feat(@vanrot/runtime): add computed()"
```

---

### Task 8: Implement batch()

**Files:**
- Create: `packages/runtime/src/reactive/batch.ts`
- Create: `packages/runtime/tests/reactive/batch.test.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/runtime/tests/reactive/batch.test.ts`:
```ts
import { describe, it, expect, vi } from 'vitest';
import { signal } from '../../src/reactive/signal.js';
import { effect } from '../../src/reactive/effect.js';
import { batch } from '../../src/reactive/batch.js';

describe('batch', () => {
  it('groups multiple signal writes into one effect execution', () => {
    const a = signal(0);
    const b = signal(0);
    const spy = vi.fn();
    const dispose = effect(() => { a(); b(); spy(); });
    spy.mockClear();

    batch(() => {
      a.set(1);
      b.set(2);
    });

    expect(spy).toHaveBeenCalledOnce();
    dispose();
  });

  it('returns the callback return value', () => {
    const result = batch(() => 42);
    expect(result).toBe(42);
  });

  it('flushes even when callback throws', () => {
    const a = signal(0);
    const values: number[] = [];
    const dispose = effect(() => values.push(a()));
    values.length = 0;

    expect(() => {
      batch(() => {
        a.set(1);
        throw new Error('mid-batch error');
      });
    }).toThrow('mid-batch error');

    // effect should have flushed despite the error
    expect(values).toEqual([1]);
    dispose();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd packages/runtime && pnpm test tests/reactive/batch.test.ts
```

Expected: FAIL — `Cannot find module '../../src/reactive/batch.js'`

- [ ] **Step 3: Implement batch.ts**

Create `packages/runtime/src/reactive/batch.ts`:
```ts
import { beginBatch, endBatch } from './graph.js';

export function batch<T>(run: () => T): T {
  beginBatch();
  try {
    return run();
  } finally {
    endBatch();
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd packages/runtime && pnpm test tests/reactive/batch.test.ts
```

Expected: `3 passed`

- [ ] **Step 5: Run full reactive test suite**

```bash
cd packages/runtime && pnpm test tests/reactive/
```

Expected: all reactive tests pass.

- [ ] **Step 6: Commit**

```bash
git add packages/runtime/src/reactive/batch.ts packages/runtime/tests/reactive/batch.test.ts
git commit -m "feat(@vanrot/runtime): add batch()"
```

---

## Phase 4 — Cleanup Scopes

### Task 9: Implement cleanup scope primitives

**Files:**
- Create: `packages/runtime/src/lifecycle/cleanup-scope.ts`
- Create: `packages/runtime/tests/lifecycle/cleanup-scope.test.ts`

The cleanup scope is the ownership backbone. Everything in lifecycle (onMount, onDestroy) and events (listen) registers against the active scope.

- [ ] **Step 1: Write the failing test**

Create `packages/runtime/tests/lifecycle/cleanup-scope.test.ts`:
```ts
import { describe, it, expect, vi } from 'vitest';
import {
  createCleanupScope,
  runWithCleanupScope,
  disposeCleanupScope,
  registerCleanup,
  registerMountCallback,
  flushMountCallbacks,
} from '../../src/lifecycle/cleanup-scope.js';

describe('cleanup scope', () => {
  it('runs registered cleanups on dispose', () => {
    const scope = createCleanupScope();
    const spy = vi.fn();
    runWithCleanupScope(scope, () => registerCleanup(spy));
    disposeCleanupScope(scope);
    expect(spy).toHaveBeenCalledOnce();
  });

  it('runs cleanups in reverse registration order', () => {
    const scope = createCleanupScope();
    const log: number[] = [];
    runWithCleanupScope(scope, () => {
      registerCleanup(() => log.push(1));
      registerCleanup(() => log.push(2));
      registerCleanup(() => log.push(3));
    });
    disposeCleanupScope(scope);
    expect(log).toEqual([3, 2, 1]);
  });

  it('registerCleanup outside scope is a no-op', () => {
    expect(() => registerCleanup(() => {})).not.toThrow();
  });

  it('restores previous scope after run', () => {
    const outer = createCleanupScope();
    const inner = createCleanupScope();
    const outerSpy = vi.fn();
    const innerSpy = vi.fn();

    runWithCleanupScope(outer, () => {
      runWithCleanupScope(inner, () => registerCleanup(innerSpy));
      registerCleanup(outerSpy); // goes to outer
    });

    disposeCleanupScope(outer);
    expect(outerSpy).toHaveBeenCalledOnce();
    expect(innerSpy).not.toHaveBeenCalled();

    disposeCleanupScope(inner);
    expect(innerSpy).toHaveBeenCalledOnce();
  });

  it('disposeCleanupScope is safe to call twice', () => {
    const scope = createCleanupScope();
    const spy = vi.fn();
    runWithCleanupScope(scope, () => registerCleanup(spy));
    disposeCleanupScope(scope);
    expect(() => disposeCleanupScope(scope)).not.toThrow();
    expect(spy).toHaveBeenCalledOnce(); // not called again
  });

  it('flushMountCallbacks runs queued callbacks', () => {
    const scope = createCleanupScope();
    const spy = vi.fn();
    runWithCleanupScope(scope, () => registerMountCallback(spy));
    expect(spy).not.toHaveBeenCalled();
    flushMountCallbacks(scope);
    expect(spy).toHaveBeenCalledOnce();
  });

  it('flushMountCallbacks registers returned cleanup on dispose', () => {
    const scope = createCleanupScope();
    const cleanup = vi.fn();
    runWithCleanupScope(scope, () => registerMountCallback(() => cleanup));
    flushMountCallbacks(scope);
    disposeCleanupScope(scope);
    expect(cleanup).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd packages/runtime && pnpm test tests/lifecycle/cleanup-scope.test.ts
```

Expected: FAIL — `Cannot find module '../../src/lifecycle/cleanup-scope.js'`

- [ ] **Step 3: Implement cleanup-scope.ts**

Create `packages/runtime/src/lifecycle/cleanup-scope.ts`:
```ts
import type { Dispose } from '../reactive/types.js';

// Opaque handle — never inspect internals
export type CleanupScope = { readonly _vanrotScope: true };

interface ScopeInternal {
  cleanups: Dispose[];
  mountCallbacks: Array<() => void | Dispose>;
}

const _scopes = new WeakMap<CleanupScope, ScopeInternal>();
let _activeScope: CleanupScope | null = null;

export function createCleanupScope(): CleanupScope {
  const scope = Object.create(null) as CleanupScope;
  _scopes.set(scope, { cleanups: [], mountCallbacks: [] });
  return scope;
}

export function runWithCleanupScope<T>(scope: CleanupScope, fn: () => T): T {
  const prev = _activeScope;
  _activeScope = scope;
  try {
    return fn();
  } finally {
    _activeScope = prev;
  }
}

export function disposeCleanupScope(scope: CleanupScope): void {
  const internal = _scopes.get(scope);
  if (!internal) return;
  const cleanups = internal.cleanups.reverse();
  internal.cleanups = [];
  _scopes.delete(scope);
  for (const fn of cleanups) fn();
}

export function registerCleanup(fn: Dispose): void {
  if (_activeScope === null) return;
  _scopes.get(_activeScope)?.cleanups.push(fn);
}

export function registerMountCallback(fn: () => void | Dispose): void {
  if (_activeScope === null) return;
  _scopes.get(_activeScope)?.mountCallbacks.push(fn);
}

export function flushMountCallbacks(scope: CleanupScope): void {
  const internal = _scopes.get(scope);
  if (!internal) return;
  const callbacks = internal.mountCallbacks;
  internal.mountCallbacks = [];
  for (const fn of callbacks) {
    const cleanup = fn();
    if (cleanup) internal.cleanups.push(cleanup);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd packages/runtime && pnpm test tests/lifecycle/cleanup-scope.test.ts
```

Expected: `7 passed`

- [ ] **Step 5: Commit**

```bash
git add packages/runtime/src/lifecycle/cleanup-scope.ts packages/runtime/tests/lifecycle/cleanup-scope.test.ts
git commit -m "feat(@vanrot/runtime): add cleanup scope primitives"
```

---

## Phase 5 — Lifecycle

### Task 10: Implement onDestroy()

**Files:**
- Create: `packages/runtime/src/lifecycle/on-destroy.ts`
- Create: `packages/runtime/tests/lifecycle/on-destroy.test.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/runtime/tests/lifecycle/on-destroy.test.ts`:
```ts
import { describe, it, expect, vi } from 'vitest';
import { onDestroy } from '../../src/lifecycle/on-destroy.js';
import {
  createCleanupScope,
  runWithCleanupScope,
  disposeCleanupScope,
} from '../../src/lifecycle/cleanup-scope.js';

describe('onDestroy', () => {
  it('registers cleanup with active scope', () => {
    const scope = createCleanupScope();
    const spy = vi.fn();
    runWithCleanupScope(scope, () => onDestroy(spy));
    disposeCleanupScope(scope);
    expect(spy).toHaveBeenCalledOnce();
  });

  it('is a no-op when there is no active scope', () => {
    expect(() => onDestroy(() => {})).not.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd packages/runtime && pnpm test tests/lifecycle/on-destroy.test.ts
```

Expected: FAIL — `Cannot find module '../../src/lifecycle/on-destroy.js'`

- [ ] **Step 3: Implement on-destroy.ts**

Create `packages/runtime/src/lifecycle/on-destroy.ts`:
```ts
import type { Dispose } from '../reactive/types.js';
import { registerCleanup } from './cleanup-scope.js';

export function onDestroy(fn: Dispose): void {
  registerCleanup(fn);
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd packages/runtime && pnpm test tests/lifecycle/on-destroy.test.ts
```

Expected: `2 passed`

- [ ] **Step 5: Commit**

```bash
git add packages/runtime/src/lifecycle/on-destroy.ts packages/runtime/tests/lifecycle/on-destroy.test.ts
git commit -m "feat(@vanrot/runtime): add onDestroy()"
```

---

### Task 11: Implement onMount()

**Files:**
- Create: `packages/runtime/src/lifecycle/on-mount.ts`
- Create: `packages/runtime/tests/lifecycle/on-mount.test.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/runtime/tests/lifecycle/on-mount.test.ts`:
```ts
import { describe, it, expect, vi } from 'vitest';
import { onMount } from '../../src/lifecycle/on-mount.js';
import {
  createCleanupScope,
  runWithCleanupScope,
  disposeCleanupScope,
  flushMountCallbacks,
} from '../../src/lifecycle/cleanup-scope.js';

describe('onMount', () => {
  it('defers callback — does not run until flushMountCallbacks', () => {
    const scope = createCleanupScope();
    const spy = vi.fn();
    runWithCleanupScope(scope, () => onMount(spy));
    expect(spy).not.toHaveBeenCalled();
    flushMountCallbacks(scope);
    expect(spy).toHaveBeenCalledOnce();
  });

  it('registers returned cleanup on dispose', () => {
    const scope = createCleanupScope();
    const cleanup = vi.fn();
    runWithCleanupScope(scope, () => onMount(() => cleanup));
    flushMountCallbacks(scope);
    disposeCleanupScope(scope);
    expect(cleanup).toHaveBeenCalledOnce();
  });

  it('cleanup is not called if onMount callback returns void', () => {
    const scope = createCleanupScope();
    const spy = vi.fn();
    runWithCleanupScope(scope, () => onMount(() => {}));
    flushMountCallbacks(scope);
    disposeCleanupScope(scope);
    // just verify no throw — spy never registered
    expect(spy).not.toHaveBeenCalled();
  });

  it('is a no-op when there is no active scope', () => {
    expect(() => onMount(() => {})).not.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd packages/runtime && pnpm test tests/lifecycle/on-mount.test.ts
```

Expected: FAIL — `Cannot find module '../../src/lifecycle/on-mount.js'`

- [ ] **Step 3: Implement on-mount.ts**

Create `packages/runtime/src/lifecycle/on-mount.ts`:
```ts
import type { Dispose } from '../reactive/types.js';
import { registerMountCallback } from './cleanup-scope.js';

export function onMount(fn: () => void | Dispose): void {
  registerMountCallback(fn);
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd packages/runtime && pnpm test tests/lifecycle/on-mount.test.ts
```

Expected: `4 passed`

- [ ] **Step 5: Commit**

```bash
git add packages/runtime/src/lifecycle/on-mount.ts packages/runtime/tests/lifecycle/on-mount.test.ts
git commit -m "feat(@vanrot/runtime): add onMount()"
```

---

## Phase 6 — Mounting

### Task 12: Implement mount()

**Files:**
- Create: `packages/runtime/src/mounting/mount.ts`
- Create: `packages/runtime/tests/mounting/mount.test.ts`

Note: `ComponentType` is a placeholder. The real component contract is defined when `@vanrot/compiler` is built. For now, a component is any class whose constructor runs in a cleanup scope context.

- [ ] **Step 1: Write the failing test**

Create `packages/runtime/tests/mounting/mount.test.ts`:
```ts
// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '../../src/mounting/mount.js';
import { onMount } from '../../src/lifecycle/on-mount.js';
import { onDestroy } from '../../src/lifecycle/on-destroy.js';

describe('mount', () => {
  let target: HTMLElement;

  beforeEach(() => {
    target = document.createElement('div');
    document.body.appendChild(target);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('runs onMount callbacks after construction', () => {
    const spy = vi.fn();
    class TestComponent {
      constructor() { onMount(spy); }
    }
    mount(TestComponent as any, target);
    expect(spy).toHaveBeenCalledOnce();
  });

  it('destroy() runs onDestroy callbacks', () => {
    const spy = vi.fn();
    class TestComponent {
      constructor() { onDestroy(spy); }
    }
    const app = mount(TestComponent as any, target);
    app.destroy();
    expect(spy).toHaveBeenCalledOnce();
  });

  it('destroy() runs onMount cleanup', () => {
    const cleanup = vi.fn();
    class TestComponent {
      constructor() { onMount(() => cleanup); }
    }
    const app = mount(TestComponent as any, target);
    app.destroy();
    expect(cleanup).toHaveBeenCalledOnce();
  });

  it('destroy() is safe to call twice', () => {
    const spy = vi.fn();
    class TestComponent {
      constructor() { onDestroy(spy); }
    }
    const app = mount(TestComponent as any, target);
    app.destroy();
    expect(() => app.destroy()).not.toThrow();
    expect(spy).toHaveBeenCalledOnce();
  });

  it('onMount callbacks run after component constructor completes', () => {
    const log: string[] = [];
    class TestComponent {
      constructor() {
        log.push('constructor');
        onMount(() => log.push('onMount'));
      }
    }
    mount(TestComponent as any, target);
    expect(log).toEqual(['constructor', 'onMount']);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd packages/runtime && pnpm test tests/mounting/mount.test.ts
```

Expected: FAIL — `Cannot find module '../../src/mounting/mount.js'`

- [ ] **Step 3: Implement mount.ts**

Create `packages/runtime/src/mounting/mount.ts`:
```ts
import {
  createCleanupScope,
  runWithCleanupScope,
  disposeCleanupScope,
  flushMountCallbacks,
} from '../lifecycle/cleanup-scope.js';

// Placeholder — ComponentType will be defined when @vanrot/compiler is built
export type ComponentType = new (...args: never[]) => unknown;

export interface AppHandle {
  destroy(): void;
}

export function mount(Component: ComponentType, _target: Element): AppHandle {
  const rootScope = createCleanupScope();
  let _destroyed = false;

  // Steps 2–5: all run inside the root cleanup scope so that
  // onMount(), onDestroy(), effect(), and listen() register correctly.
  runWithCleanupScope(rootScope, () => {
    new Component();
    // Step 5: DOM insertion happens inside the component constructor for now.
    // When @vanrot/compiler is built, generated render code runs here.
  });

  // Step 6: flush onMount callbacks after construction
  flushMountCallbacks(rootScope);

  return {
    destroy(): void {
      if (_destroyed) return;
      _destroyed = true;
      disposeCleanupScope(rootScope);
    },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd packages/runtime && pnpm test tests/mounting/mount.test.ts
```

Expected: `5 passed`

- [ ] **Step 5: Commit**

```bash
git add packages/runtime/src/mounting/mount.ts packages/runtime/tests/mounting/mount.test.ts
git commit -m "feat(@vanrot/runtime): add mount()"
```

---

## Phase 7 — Events

### Task 13: Implement listen()

**Files:**
- Create: `packages/runtime/src/events/listen.ts`
- Create: `packages/runtime/tests/events/listen.test.ts`

`listen()` is internal and compiler-facing. It wires DOM event listeners to the active cleanup scope so removal is automatic on component destroy.

- [ ] **Step 1: Write the failing test**

Create `packages/runtime/tests/events/listen.test.ts`:
```ts
// @vitest-environment jsdom

import { describe, it, expect, vi } from 'vitest';
import { listen } from '../../src/events/listen.js';
import {
  createCleanupScope,
  runWithCleanupScope,
  disposeCleanupScope,
} from '../../src/lifecycle/cleanup-scope.js';

describe('listen', () => {
  it('calls handler when event fires', () => {
    const scope = createCleanupScope();
    const button = document.createElement('button');
    const spy = vi.fn();

    runWithCleanupScope(scope, () => listen(button, 'click', spy));
    button.click();
    expect(spy).toHaveBeenCalledOnce();
    disposeCleanupScope(scope);
  });

  it('removes listener after scope is disposed', () => {
    const scope = createCleanupScope();
    const button = document.createElement('button');
    const spy = vi.fn();

    runWithCleanupScope(scope, () => listen(button, 'click', spy));
    disposeCleanupScope(scope);
    button.click();
    expect(spy).not.toHaveBeenCalled();
  });

  it('returns a manual dispose function', () => {
    const scope = createCleanupScope();
    const button = document.createElement('button');
    const spy = vi.fn();

    let manualDispose!: () => void;
    runWithCleanupScope(scope, () => {
      manualDispose = listen(button, 'click', spy);
    });

    manualDispose(); // remove listener manually
    button.click();
    expect(spy).not.toHaveBeenCalled();
    disposeCleanupScope(scope); // safe even though listener already removed
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd packages/runtime && pnpm test tests/events/listen.test.ts
```

Expected: FAIL — `Cannot find module '../../src/events/listen.js'`

- [ ] **Step 3: Implement listen.ts**

Create `packages/runtime/src/events/listen.ts`:
```ts
import { registerCleanup } from '../lifecycle/cleanup-scope.js';

export function listen(
  target: EventTarget,
  type: string,
  handler: EventListener,
  options?: AddEventListenerOptions | boolean,
): () => void {
  target.addEventListener(type, handler, options);

  const dispose = (): void => {
    target.removeEventListener(type, handler, options);
  };

  registerCleanup(dispose);

  return dispose;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd packages/runtime && pnpm test tests/events/listen.test.ts
```

Expected: `3 passed`

- [ ] **Step 5: Commit**

```bash
git add packages/runtime/src/events/listen.ts packages/runtime/tests/events/listen.test.ts
git commit -m "feat(@vanrot/runtime): add listen() internal event helper"
```

---

## Phase 8 — Public Exports & Package Config

### Task 14: Wire public and internal export entrypoints

**Files:**
- Create: `packages/runtime/src/index.ts`
- Create: `packages/runtime/src/internal.ts`

No new tests — tests in earlier tasks already test individual modules.

- [ ] **Step 1: Create src/index.ts (public API)**

Create `packages/runtime/src/index.ts`:
```ts
// Reactive API
export type { Signal, WritableSignal, Dispose } from './reactive/types.js';
export { signal } from './reactive/signal.js';
export { computed } from './reactive/computed.js';
export { effect } from './reactive/effect.js';
export { batch } from './reactive/batch.js';
export { untrack } from './reactive/untrack.js';

// Lifecycle
export { onMount } from './lifecycle/on-mount.js';
export { onDestroy } from './lifecycle/on-destroy.js';

// Mounting
export type { AppHandle, ComponentType } from './mounting/mount.js';
export { mount } from './mounting/mount.js';
```

- [ ] **Step 2: Create src/internal.ts (compiler-facing API)**

Create `packages/runtime/src/internal.ts`:
```ts
// Internal APIs — not stable, not semver-covered, not for app authors.
// Only for @vanrot/compiler-generated code and framework internals.

export type { CleanupScope } from './lifecycle/cleanup-scope.js';
export {
  createCleanupScope,
  runWithCleanupScope,
  disposeCleanupScope,
  registerCleanup,
  registerMountCallback,
  flushMountCallbacks,
} from './lifecycle/cleanup-scope.js';

export { listen } from './events/listen.js';
```

- [ ] **Step 3: Verify exports compile**

```bash
cd packages/runtime && pnpm exec tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Run all tests one final time**

```bash
cd packages/runtime && pnpm test
```

Expected: all tests pass.

- [ ] **Step 5: Build the package**

```bash
cd packages/runtime && pnpm build
```

Expected: `dist/` created with `index.js`, `index.d.ts`, `internal.js`, `internal.d.ts`.

- [ ] **Step 6: Commit**

```bash
git add packages/runtime/src/index.ts packages/runtime/src/internal.ts
git commit -m "feat(@vanrot/runtime): wire public and internal export entrypoints"
```

---

## Phase 9 — Size Budget Enforcement

### Task 15: Add size-limit CI enforcement

**Files:**
- Create: `packages/runtime/.size-limit.json`

The hard fail limit is 5 KB gzip (public spec promise). Both public and internal entrypoints ship to the browser via compiler-generated imports — both count toward the budget.

- [ ] **Step 1: Create .size-limit.json**

Create `packages/runtime/.size-limit.json`:
```json
[
  {
    "name": "@vanrot/runtime (public + internal)",
    "path": ["dist/index.js", "dist/internal.js"],
    "limit": "5 KB",
    "gzip": true
  }
]
```

- [ ] **Step 2: Add size script to package.json**

Edit `packages/runtime/package.json` — add to `"scripts"`:
```json
"size": "size-limit"
```

(It should already be there from Task 1. Verify it is present.)

- [ ] **Step 3: Run size check**

```bash
cd packages/runtime && pnpm build && pnpm size
```

Expected: size reported, well under 5 KB. Current implementation should be approximately 1–2 KB gzip.

- [ ] **Step 4: Verify warning threshold manually**

The 3 KB warning threshold is not enforced by size-limit automatically. Note the actual size from the output. If it exceeds 3 KB, open a tracking issue before merging.

- [ ] **Step 5: Commit**

```bash
git add packages/runtime/.size-limit.json
git commit -m "chore(@vanrot/runtime): add size-limit budget enforcement (5 KB hard fail)"
```

---

## Self-Review Checklist

**Spec coverage:**

| Spec section | Covered by task |
|---|---|
| Boundary evaluation order | Governs all decisions; no code required |
| Reactive Kernel Rule | Governs reactive API scope |
| Lifecycle Rule | Governs lifecycle API scope |
| DOM Helper Rule | No runtime DOM helpers in MVP; compiler inlines |
| Size budget (≤5 KB gzip) | Task 15 |
| `signal()` | Task 4 |
| `computed()` | Task 7 |
| `effect()` | Task 5 |
| `batch()` | Task 8 |
| `untrack()` | Task 6 |
| `effect()` error propagation (sync) | Task 5 test: "propagates errors synchronously" |
| `mount()` + 7 bootstrap steps | Task 12 |
| `onMount()` | Task 11 |
| `onDestroy()` | Task 10 |
| `createCleanupScope` / `runWithCleanupScope` / `disposeCleanupScope` | Task 9 |
| `listen()` internal | Task 13 |
| `@vanrot/runtime` public exports | Task 14 |
| `@vanrot/runtime/internal` exports | Task 14 |
| `/internal` stability warning | Noted in `internal.ts` header |
| `ComponentType` as placeholder | Noted in `mount.ts` |

**No placeholders found** — every task has complete code.

**Type consistency check:**

- `Dispose = () => void` — defined in `types.ts`, imported everywhere via `./reactive/types.js`
- `CleanupScope` — opaque type in `cleanup-scope.ts`, exported through `internal.ts`
- `ReactiveEffect` — defined in `graph.ts`, used only internally across reactive modules
- `AppHandle` — defined in `mount.ts`, exported via `index.ts`
- `Signal<T>` / `WritableSignal<T>` — defined in `types.ts`, re-exported from `signal.ts` and `computed.ts`

All consistent.

**Open item carried from spec:** `ComponentType` is `new (...args: never[]) => unknown` as placeholder. Shape will be updated when `@vanrot/compiler` is built.
