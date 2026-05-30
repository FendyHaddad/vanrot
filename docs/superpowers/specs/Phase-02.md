# Vanrot Runtime Kernel Design

**Date:** 2026-05-20  
**Package:** `@vanrot/runtime`  
**Status:** Approved

---

## 1. Core Model

`@vanrot/runtime` is a kernel, not a framework.

The kernel owns the reactive graph, cleanup ownership, and DOM mounting. Nothing else.

This maps to the Svelte model at the principle level: compiler generates direct DOM code; runtime provides only what cannot be generated.

---

## 2. Boundary Evaluation Order

When deciding if a feature belongs in runtime, run these tests in order. Stop at first failure.

### Step 1 — Compile-Away Disqualifier

> Can the compiler generate this directly or remove the need for it?

If yes → not runtime.

### Step 2 — Userland Disqualifier

> Can this be built cleanly as an optional package using existing runtime primitives?

If yes → not runtime.

### Step 3 — Runtime Qualifier

> Must this execute in the browser after build?

If no → not runtime.

### Step 4 — Universal Qualifier

> Is this needed by almost every Vanrot component/app?

If no → not runtime.

Only features that pass all four tests belong in `@vanrot/runtime`.

---

## 3. Reactive Kernel Rule

> A reactive API belongs in `@vanrot/runtime` only if userland cannot implement it correctly without access to internal graph state.

This is a stricter formulation of the four-test gate, specific to the reactive layer.

---

## 4. Lifecycle Rule

> `@vanrot/runtime` may provide lifecycle primitives only for mounting and cleanup.  
> `@vanrot/runtime` must not provide lifecycle hooks for every render/update phase.

Lifecycle exists for **ownership**, not convenience.

---

## 5. DOM Helper Rule

> A DOM helper belongs in runtime only if it is smaller across real compiled apps than compiler-inlining it, OR if it requires cleanup-scope access.

Simple DOM operations (createElement, appendChild, etc.) are compiler-inlined. They do not appear in runtime exports.

---

## 6. Size Budget

Primary metric: **minified + gzip** (reflects actual network download).

| Metric | Target | Warning | Hard Fail |
|---|---|---|---|
| minified + gzip | ≤ 3 KB for the original kernel | > 3.5 KB for the original kernel | > 9.99 KB for the current full runtime surface |
| minified + brotli | ≤ 2.5 KB | > 3 KB | > 4 KB |
| raw minified | ≤ 8 KB | > 10 KB | > 14 KB |

**Public promise:** Vanrot runtime kernel targets 3 KB gzip. The current full runtime surface includes justified headless controllers and is capped at 9.99 KB gzip.

Budget applies to the full shipped footprint: `@vanrot/runtime` public exports **plus** `@vanrot/runtime/internal` exports used by compiler-generated code. Both ship to the browser. Both count.

Size budget is enforced in CI using a tool like `size-limit`. Warning threshold triggers a review. Hard fail blocks the build.

---

## 7. Public API — `@vanrot/runtime`

### 7.1 Reactive API

```ts
export type Signal<T> = () => T;

export type WritableSignal<T> = Signal<T> & {
  set(value: T): void;
  update(updater: (current: T) => T): void;
};

export type Dispose = () => void;

export function signal<T>(initialValue: T): WritableSignal<T>;
export function computed<T>(compute: () => T): Signal<T>;
export function effect(run: () => void | Dispose): Dispose;
export function batch<T>(run: () => T): T;
export function untrack<T>(read: () => T): T;
```

**`signal()`** — writable reactive state. Reads via call, writes via `.set()` or `.update()`.

**`computed()`** — derived reactive state. Needs dependency tracking, caching, and invalidation. Cannot be built in userland without graph access.

**`effect()`** — runs side effects when dependencies change. Returns a dispose function. The callback may return a cleanup function that runs before the next execution or on disposal.

> **Error behavior:** If an effect callback throws, the error propagates synchronously — in both development and production. Catching or logging errors hides bugs. Simple and predictable wins.

**`batch()`** — groups multiple signal writes into one notification cycle. Without `batch()`, each write may trigger dependent effects separately. Cannot be built in userland without the ability to pause and resume the reactive graph.

**`untrack()`** — reads reactive values without creating a subscription. Cannot be built in userland without access to dependency collection internals.

### 7.2 Lifecycle and Mounting API

```ts
export interface AppHandle {
  destroy(): void;
}

export function mount(Component: ComponentType, target: Element): AppHandle;
// ComponentType is a placeholder — exact shape defined in the component model spec.
export function onMount(fn: () => void | Dispose): void;
export function onDestroy(fn: Dispose): void;
```

**`mount(Component, target)`** — top-level bootstrapping. Does exactly:
1. Create root cleanup scope
2. Run component creation inside root cleanup scope
3. Create component instance
4. Create compiled DOM output
5. Insert DOM into target
6. Run `onMount` callbacks
7. Return destroy handle

Steps 2–6 execute inside the root cleanup scope so that `onMount()`, `onDestroy()`, `effect()`, and compiler-generated `listen()` calls all register against the correct scope during construction.

`mount()` does not accept providers, modules, router config, or any framework-level configuration. Optional packages handle those concerns.

```ts
// correct
const app = mount(App, document.getElementById('app')!);
app.destroy();

// not Vanrot — too Angular-like
bootstrapApplication(App, { providers: [], router, forms });
```

**`onMount(fn)`** — registers a callback to run after the component is inserted into the DOM. Solves two kernel-level problems: browser-only execution and cleanup registration. The callback may return a cleanup function.

```ts
onMount(() => {
  const timer = setInterval(() => {
    this.time.set(new Date());
  }, 1000);

  return () => clearInterval(timer);
});
```

**`onDestroy(fn)`** — registers a cleanup function to run when the component is destroyed.

---

## 8. Internal API — `@vanrot/runtime/internal`

These APIs are for compiler-generated code and framework internals. App authors must not import them directly.

> **Stability:** `@vanrot/runtime/internal` is not a public API. It is not covered by semver. It may change or be removed between any releases. Use `onMount` and `onDestroy` instead.

```ts
// Opaque handle — implementation detail, not inspectable by consumers
export interface CleanupScope { readonly _brand: unique symbol; }

// Cleanup scope management
export function createCleanupScope(): CleanupScope;
export function runWithCleanupScope<T>(scope: CleanupScope, fn: () => T): T;
export function disposeCleanupScope(scope: CleanupScope): void;

// Event listener with automatic cleanup
export function listen(
  target: EventTarget,
  type: string,
  handler: EventListener,
  options?: AddEventListenerOptions | boolean
): () => void;
```

**`listen(target, type, handler)`** — attaches an event listener and registers its removal in the active cleanup scope via `onDestroy`. Belongs in runtime because it connects DOM events to cleanup scope ownership — not a convenience wrapper.

Compiler emits:
```ts
import { listen } from '@vanrot/runtime/internal';

listen(button, 'click', event => {
  ctx.increment(event);
});
```

App authors use `onMount` for manual event wiring instead:
```ts
onMount(() => {
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
});
```

---

## 9. Compiler-Inlined DOM Operations

These are never exported from runtime. The compiler emits them directly.

```txt
document.createElement(tag)
document.createTextNode(value)
parent.appendChild(child)
parent.insertBefore(child, ref)
node.remove()
textNode.data = value
element.property = value
element.setAttribute(name, value)
```

Inlining is preferred because these calls are simple enough that a shared import creates more overhead than it saves. If bundle measurement proves otherwise for a specific helper, it may be promoted to `@vanrot/runtime/internal`.

---

## 10. Not MVP — Deferred to Optional Packages

These must not appear in `@vanrot/runtime`.

| Feature | Future package |
|---|---|
| `store()` | `@vanrot/store` |
| `resource()` / `query()` | `@vanrot/async` |
| form state | `@vanrot/forms` |
| router state / `onRouteChange()` | `@vanrot/router` |
| `onBeforeRender()` / `onAfterRender()` | not planned |
| `onEveryUpdate()` | not planned |
| dependency injection | not planned for MVP |
| `setClass()` / `setStyle()` | compiler-inlined or deferred |
| `mountIf()` / `mountFor()` / `keyedEach()` | compiler-generated |

---

## 11. Full Inventory

| Symbol | Export path | Reason |
|---|---|---|
| `signal` | `@vanrot/runtime` | reactive graph primitive |
| `computed` | `@vanrot/runtime` | reactive graph primitive |
| `effect` | `@vanrot/runtime` | reactive graph primitive |
| `batch` | `@vanrot/runtime` | requires graph pause/resume |
| `untrack` | `@vanrot/runtime` | requires graph internals |
| `mount` | `@vanrot/runtime` | universal bootstrap, kernel-level |
| `onMount` | `@vanrot/runtime` | browser-only + cleanup ownership |
| `onDestroy` | `@vanrot/runtime` | cleanup ownership |
| `listen` | `@vanrot/runtime/internal` | cleanup ownership, compiler-facing |
| `createCleanupScope` | `@vanrot/runtime/internal` | cleanup graph primitive |
| `runWithCleanupScope` | `@vanrot/runtime/internal` | cleanup graph primitive |
| `disposeCleanupScope` | `@vanrot/runtime/internal` | cleanup graph primitive |

---

## 12. Clean Principle

> Public runtime API is for app authors.  
> Internal runtime API is for compiler-generated code.  
> Compiler-inlined DOM is for keeping runtime small.

The goal: `@vanrot/runtime` ships universal reactive primitives, ownership primitives, and one mounting function. Everything else is either generated by the compiler or delivered as an optional package.
