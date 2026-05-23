# Phase 15C Navigation Decisions

## Purpose

Phase 15C makes Vanrot routing safe enough for real application navigation decisions.

Phase 15A made route definitions, params, queries, links, and breadcrumbs production-ready. Phase 15B made nested layouts and route outlets production-ready. Phase 15C adds the next layer: routes can decide whether navigation is allowed, redirected, blocked, or ignored when a newer navigation has already started.

This phase focuses on lightweight route guards, redirect routes, async guard cancellation, and strict route diagnostics needed to make navigation behavior predictable. It does not implement preloading, scroll restoration, route transition animation, title/meta management, route data loaders, SSR routing, route graph UI, or custom link labels.

## Source Of Truth

`src/routes.ts` remains the owning source of truth for route paths, labels, hierarchy, layout ownership, breadcrumbs, navigation metadata, redirects, and guard attachment.

User templates must not repeat route paths, route names, labels, diagnostic codes, redirect targets, or guard-owned navigation strings. Literal route paths remain acceptable only at the route source-of-truth boundary or when an external standard requires them.

## Design Direction

Phase 15C keeps guard APIs light.

Guards are plain functions assigned directly to route definitions through `canEnter`. There is no `routes.guard(...)` registry and no named guard object ceremony.

```ts
const routes = createRoutes();

const login = routes.page({
  path: '/login',
  label: 'Login',
  page: LoginPage,
});

const requireLogin = () => {
  if (session.isLoggedIn()) {
    return true;
  }

  return login;
};

const account = routes.layout({
  path: '/account',
  label: 'Account',
  layout: AccountLayout,
  canEnter: requireLogin,
});

const billing = account.page({
  path: 'billing',
  label: 'Billing',
  page: BillingPage,
});

export const route = defineRoutes({
  login,
  account,
  billing,
});
```

The route owns when the guard runs. The guard is only the decision function.

## Guard Results

`canEnter` supports a small result shape:

```ts
true
false
routeRef
routes.redirectTo(routeRef, input)
Promise<true | false | routeRef | redirectTarget>
```

The meanings are:

- `true` allows navigation to continue.
- `false` blocks navigation and keeps the current active route.
- a route ref redirects to that route.
- `routes.redirectTo(...)` redirects with structured params or query values.
- a promise supports async checks such as current-session loading.

```ts
const requireLogin = async () => {
  const user = await session.currentUser();

  if (user === null) {
    return login;
  }

  return true;
};
```

Guard functions should use guard clauses and return early. They should not mutate the route table or imperatively call `navigate(...)`.

Guards may receive a read-only navigation context when they need the target URL, current route, params, or query.

```ts
const requireLogin = ({ to }) => {
  if (session.isLoggedIn()) {
    return true;
  }

  return routes.redirectTo(login, {
    query: { returnTo: to.path },
  });
};
```

The context is for decision-making only. It should not expose mutable router internals.

## Guard Attachment

`canEnter` may be attached to pages or layouts.

```ts
const account = routes.layout({
  path: '/account',
  label: 'Account',
  layout: AccountLayout,
  canEnter: requireLogin,
});

const billing = account.page({
  path: 'billing',
  label: 'Billing',
  page: BillingPage,
  canEnter: requireBillingAccess,
});
```

Layout guards apply to descendants automatically. Guard execution follows the active route chain from parent to child:

```txt
account canEnter -> billing canEnter -> enter billing page
```

If a guard returns `false` or a route ref, later guards in the chain do not run.

For Phase 15C, a route may accept either one guard or an array of guards:

```ts
canEnter: requireLogin
```

```ts
canEnter: [requireLogin, requireBillingAccess]
```

An array runs left to right and stops at the first non-`true` result.

## Redirect Routes

Redirects are their own route kind. A redirect is not a page and not a layout.

```ts
const oldBilling = routes.redirect({
  path: '/billing',
  to: billing,
});

export const route = defineRoutes({
  account,
  billing,
  oldBilling,
});
```

Redirect routes can also be children:

```ts
const shop = routes.layout({
  path: '/shop',
  label: 'Shop',
  layout: ShopLayout,
});

const products = shop.page({
  path: 'products',
  label: 'Products',
  page: ProductsPage,
});

const shopIndex = shop.redirect({
  path: '',
  to: products,
});
```

Redirect routes never render components and never contain child routes. They participate in matching and navigation decisions, then resolve to their target route.

## Redirect Targets With Params And Query

The common redirect target is a route ref:

```ts
return login;
```

```ts
routes.redirect({
  path: '/store',
  to: shop,
});
```

When params or query values are needed, Phase 15C provides a small explicit helper instead of asking developers to build route strings:

```ts
return routes.redirectTo(login, {
  query: { returnTo: to.path },
});
```

```ts
const oldProduct = routes.redirect({
  path: '/product/:productId',
  to: productDetail,
  params: ({ productId }) => ({ productId }),
});
```

`routes.redirectTo(routeRef, input)` uses the same structured input as `buildRouteUrl(...)`:

```ts
routes.redirectTo(productDetail, {
  params: { productId: '42' },
  query: { tab: 'details' },
});
```

Redirects with params or query must use route refs and structured params/query objects, not manual URL strings.

## Navigation Behavior

All framework-owned navigation paths must run through the same decision pipeline:

- `navigate(...)`
- browser `popstate`
- `<vr route.name />` click handling
- initial router setup in `provideRouter(...)`
- redirect routes matched by the current URL

The pipeline is:

```txt
match URL
resolve redirect routes
collect route chain guards
run guards parent-to-child
commit active route chain
update params and query
push or replace browser history when appropriate
```

Redirects should replace history by default when they happen as part of a navigation decision. Direct user navigation should not leave useless intermediate redirect URLs in the back stack.

## Async Cancellation

Async guards must not allow stale navigation results to win.

Example:

```txt
1. User navigates to /account.
2. /account async guard starts.
3. User navigates to /shop before the guard finishes.
4. /account guard resolves later.
5. The late /account result is ignored.
```

The router should track an internal navigation id. Each new navigation increments it. Async guard results only commit if their id is still current.

This cancellation behavior is internal. Phase 15C does not need a public cancellation API.

## Public Router State

Phase 15C should avoid exposing a large navigation state API unless implementation proves it is necessary.

The router may track internal states such as:

```txt
idle
checking
redirecting
blocked
error
```

But the public API should remain centered on existing primitives:

- `provideRouter(...)`
- `navigate(...)`
- `getCurrentMatch()`
- `getCurrentRouteChain()`
- `routeParams`
- route links

If tests need visibility into navigation progress, the implementation plan may add the smallest stable public signal needed. It should not expose a broad router event system in Phase 15C.

## Diagnostics

Phase 15C adds strict diagnostics for unsafe navigation graphs and guard/redirect misuse.

Expected diagnostics include:

- duplicate full paths after parent normalization
- redirect route with page, layout, loadPage, loadLayout, or children
- redirect target missing from the route table
- redirect loop across one or more redirect routes
- guard redirect target missing from the route table
- guard returns an invalid value
- route has invalid `canEnter` shape
- redirect with missing required params
- redirect with unknown params or query keys
- redirect loop caused by a guard

Diagnostics should use stable codes, clear messages, suggestions, and docs hooks through the existing route diagnostic foundation.

Duplicate path diagnostics are part of 15C because redirect routes make path conflicts more dangerous. Broader project-map route graph UI remains later work.

## Compiler And Template Behavior

Phase 15C introduces no new HTML elements.

Existing template behavior remains:

- `<vr-router />` mounts the app-level router outlet.
- `<vr-outlet />` renders child route chains inside layouts.
- `<vr route.name />` creates a framework-owned link.

Route links automatically use the guarded navigation pipeline. Developers do not write special guarded-link syntax.

## CLI And Vite Behavior

Router diagnostics from Phase 15C should be structured so Vite and CLI can surface them consistently.

Phase 15C does not need to build a full route graph viewer. If CLI or Vite integration is touched, it should focus on making new diagnostics visible with the existing formatting style.

## Non-Goals

Phase 15C does not include:

- lazy route preloading
- preload strategies
- scroll restoration
- route transition animations
- browser title or meta updates
- data loaders
- forms dirty-state prompts
- SSR route execution
- route graph UI
- custom route-link labels
- auth package or session abstraction

These are separate features and should remain separate production slices.

## Acceptance Criteria

Phase 15C is production-ready when:

- route definitions support `canEnter` on pages and layouts
- layout guards apply to descendants
- multiple guards run in deterministic parent-to-child and left-to-right order
- sync guards can allow, block, or redirect
- async guards can allow, block, or redirect
- stale async navigation results are ignored
- redirect routes match and forward to route refs
- child redirect routes work
- params/query redirects do not require manual URL strings
- guarded `<vr route.name />` links use the same navigation pipeline as `navigate(...)`
- initial page load and browser back/forward use the same redirect/guard rules
- route diagnostics catch duplicate paths, redirect loops, missing targets, invalid redirect shapes, and invalid guard results
- focused router tests and the full `pnpm verify` pass before the phase is marked complete
- `docs/superpowers/feature-maturity.md`, `docs/superpowers/final-tdd-inventory.md`, `docs/vanrot-presentation.html`, and the matching Phase 15C plan are updated during implementation completion
