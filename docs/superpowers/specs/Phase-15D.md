# Phase 15D Router Preloading And KeepAlive Integration

## Purpose

Phase 15D closes the router production slice by making routed navigation feel fast without turning the router into a data framework.

Phase 15A made route contracts, params, query strings, generated links, and breadcrumbs production-ready. Phase 15B made nested layouts and outlets production-ready. Phase 15C made guarded navigation and redirects production-ready. Phase 15D adds route-owned module preloading, lightweight same-day view reuse, and integration coverage across the complete Phase 15 router stack.

This phase focuses on:

- lazy route module preloading on user intent
- memory-only route view reuse through `keepAlive`
- strict boundaries between router view reuse and future API data caching
- diagnostics for unsafe or impossible route performance policy
- integration tests proving Phase 15A, 15B, 15C, and 15D behavior works together

It does not implement API data caching, store integration, async resource invalidation, SSR or hydration, scroll restoration, title/meta management, custom route labels, viewport preloading, render-time preloading, or route transition animation.

## Source Of Truth

`src/routes.ts` remains the owning source of truth for route paths, labels, hierarchy, layout ownership, breadcrumbs, navigation metadata, redirects, guards, preload policy, and keepAlive policy.

User pages, templates, CSS, and app code should not repeat route paths, route names, route labels, diagnostic codes, preload policy strings, keepAlive policy strings, or generated route hooks. Literal route strings remain acceptable only at the route source-of-truth boundary or when an external standard requires them.

## Design Boundary

Phase 15D keeps router performance narrow:

```txt
preload = warms route code before navigation
keepAlive = preserves route view instance and local component state
Phase 21 = future API and async data cache
```

The router may make route entry fast. It should not own product data caches, cart data caches, profile data caches, mutation invalidation, auth-sensitive data retention, background refresh, or stale-while-revalidate policy. Those belong to later store and async resource work.

## Route API

Route definitions may opt into preloading and keepAlive through small route-owned helpers.

```ts
const routes = createRoutes();

const product = routes.layout({
  path: '/shop/product',
  label: 'Products',
  layout: ProductLayout,
});

const productDetail = product.page({
  path: ':productId',
  label: 'Product detail',
  loadPage: () => import('./product-detail.page.ts'),
  preload: routes.preload.intent(),
  keepAlive: routes.keepAlive.sessionDay(),
});

export const route = defineRoutes({
  product,
  productDetail,
});
```

Phase 15D supports only these public policy helpers:

```ts
routes.preload.none()
routes.preload.intent()

routes.keepAlive.none()
routes.keepAlive.sessionDay()
```

Defaults:

- `preload` defaults to `routes.preload.none()`.
- `keepAlive` defaults to `routes.keepAlive.none()`.
- `preload` only has runtime effect on routes with `loadPage` or `loadLayout`.
- `keepAlive` may apply to static or lazy page/layout routes.
- redirect routes cannot declare `preload` or `keepAlive`.
- guarded routes may preload route code, but guards still run only during real navigation.

The policy names are stored as typed metadata, not reused string literals throughout the router.

## Preloading Behavior

`routes.preload.intent()` starts loading lazy route modules when a generated route link receives clear user intent:

- mouse hover
- keyboard focus
- touch start

The preloading pipeline is:

```txt
generated route link
  -> user hover/focus/touch intent
  -> build href from route ref plus params/query
  -> match target route chain
  -> preload lazy layouts/pages in that chain
  -> cache loaded modules through the existing lazy module cache
```

Preloading must not:

- commit navigation
- push or replace browser history
- change the current match
- run guards
- resolve redirect decisions
- mount pages or layouts
- create keepAlive entries

Clicking a preloaded link still runs the full Phase 15C navigation decision pipeline. Guards, redirects, params, query values, and history behavior remain authoritative at navigation time.

If preloading fails, the intent event should not throw into user interaction. The failure is recorded in router-owned diagnostics or preload state for tests and developer tooling, and the later real navigation may retry the lazy load normally.

## KeepAlive Behavior

`routes.keepAlive.sessionDay()` preserves a rendered route view in memory when the user navigates away, then reattaches it when the user returns to the same route identity during the same local day.

Route identity includes:

- route ref
- path params used by the matched route
- query values that affect the matched URL
- the owning route definition version for the running app session

The keepAlive flow is:

```txt
navigate away from active route
  -> route policy allows keepAlive
  -> detach rendered route view instead of destroying it
  -> store memory-only route view by route identity
  -> user navigates back to same identity on same local day
  -> guards run first
  -> restored route view reattaches after navigation is allowed
```

KeepAlive stores only route view instances and local component state, such as signals or form fields that live inside the component instance. It does not promise to retain API response data unless that data is already stored inside the component state by user code. Phase 15D docs and diagnostics must avoid presenting keepAlive as a data cache.

The cache is memory-only:

- no `localStorage`
- no `sessionStorage`
- no IndexedDB
- no serialized component state
- no persistence after reload

Entries expire when the local day changes, when the router is reset, or when the route definition version changes during the running app session.

## Safety Rules

Phase 15D should be conservative:

- Guard-blocked navigation must not restore or create keepAlive entries.
- Redirect routes must never create keepAlive entries.
- Redirect routes must not declare preload or keepAlive policy.
- Restoring a kept-alive route still requires navigation to pass current guards.
- A preloaded route must not imply access permission.
- Preload and keepAlive state must clear in `resetRouterForTests()`.
- Same-day keepAlive entries must be cleared at local day rollover.
- The router must not persist sensitive route state outside memory.

If route params or query values cannot build a stable route identity, keepAlive should not activate for that navigation and strict diagnostics should explain the smallest fix.

## Runtime Architecture

Phase 15D should fit into the existing router modules without adding broad new systems.

Expected module ownership:

- `route-types.ts` owns preload and keepAlive policy types.
- `create-routes.ts` exposes `routes.preload.*` and `routes.keepAlive.*` helpers.
- `define-routes.ts` normalizes policy metadata and reports invalid combinations.
- `page-loader.ts` keeps lazy page and layout module loading reusable for navigation and preload.
- a small preload helper owns intent-driven route-chain module warming.
- route outlet rendering owns detach, store, reattach, and destroy behavior for keepAlive views.
- router state owns day rollover checks, router reset cleanup, and guard-before-restore ordering.
- route link DOM wiring owns hover/focus/touch intent hooks for generated links.

The implementation should avoid a broad public cache API in Phase 15D. A small internal cache is enough for lazy module preload results and kept-alive route views.

## Diagnostics

Phase 15D adds stable router diagnostics for invalid or suspicious performance policy:

- redirect route declares `preload`
- redirect route declares `keepAlive`
- preload policy cannot resolve a lazy target
- keepAlive route identity cannot be built from params/query
- keepAlive restore is skipped because current guards block navigation
- preload failure is observable without breaking user intent
- strict diagnostics warn when `preload.intent()` is declared on a route without `loadPage` or `loadLayout`

Diagnostics should use named code constants, route keys from `defineRoutes({ ... })`, clear messages, suggestions, and docs hooks.

## Testing

Phase 15D should add focused failing tests before implementation for:

- `routes.preload.none()` and `routes.preload.intent()` builder metadata
- `routes.keepAlive.none()` and `routes.keepAlive.sessionDay()` builder metadata
- invalid redirect preload and keepAlive diagnostics
- generated link hover/focus/touch triggering preload for lazy page routes
- nested lazy layout plus lazy page preloading through a matched route chain
- preload not running guards, redirects, history updates, or mount behavior
- click after preload still running guards and redirects
- params and query values staying correct across preload and navigation
- preload failure being observable without breaking later navigation
- keepAlive preserving page signal or form state when navigating away and back
- keepAlive not restoring after local day rollover
- keepAlive not restoring when current guards block navigation
- redirect routes never creating kept-alive views
- breadcrumbs and current route state remaining correct after keepAlive restore
- shared parent layout retention from Phase 15B still working with kept-alive leaf views
- `resetRouterForTests()` clearing preload and keepAlive memory

The integration suite should include at least one realistic route graph with:

- root page
- nested layout
- index child page
- dynamic detail page with params
- query-aware route
- lazy layout
- lazy page
- guard redirect
- redirect route
- generated route links
- breadcrumb generation
- preloaded route
- kept-alive route

## Documentation And Examples

Generated and documented examples should keep route strings in `src/routes.ts`.

Good:

```ts
const cart = shop.page({
  path: 'cart',
  label: 'Cart',
  loadPage: () => import('./cart.page.ts'),
  preload: routes.preload.intent(),
  keepAlive: routes.keepAlive.sessionDay(),
});
```

Good:

```html
<vr route.cart />
```

Avoid:

```html
<a href="/shop/cart">Cart</a>
```

Avoid:

```ts
navigate('/shop/cart');
```

The docs should explain that `keepAlive` makes back/forward route views feel fast, but it is not an API data cache and should not be used as a security boundary.

## Production Readiness Outcome

After Phase 15D, `@vanrot/router` should support production-ready route entry performance for normal applications:

- route code can preload on user intent without repeated route string literals
- preloaded code cannot bypass guards or redirect decisions
- route views can be reused in memory for same-day back navigation
- keepAlive remains light, memory-only, and separate from API data caching
- diagnostics explain invalid route performance policy
- the full Phase 15 router stack is covered by integration tests

The final verification command remains:

```sh
pnpm verify
```
