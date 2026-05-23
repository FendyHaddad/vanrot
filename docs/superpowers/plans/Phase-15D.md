# Phase 15D Router Preloading And KeepAlive Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking. This repository forbids subagent-driven Superpowers workflows and user-owned git means every task ends with a review checkpoint, not an automatic commit.

**Goal:** Make `@vanrot/router` production-ready for intent-based lazy route module preloading, memory-only same-day route view reuse through `keepAlive`, and full Phase 15 route integration coverage.

**Architecture:** Keep `src/routes.ts` as the single source of truth for paths, labels, hierarchy, breadcrumbs, guards, redirects, preload policy, and keepAlive policy. Add tiny typed policy helpers to the existing route builder, reuse the existing route matching and lazy page loader paths, and keep view reuse internal to router outlet rendering. Keep API/data caching out of the router; Phase 15D only warms code and preserves route view instances in memory.

**Tech Stack:** TypeScript, Vitest, jsdom, `@vanrot/runtime` signals/effects/mount lifecycle, `@vanrot/router`, existing route diagnostics, existing compiler-generated `<vr route.name />` link lowering.

---

## Preconditions

Phase 15A, Phase 15B, and Phase 15C must be complete before executing this plan.

Required existing surface:

- `createRoutes()` creates page, layout, and redirect route refs without parent-name string literals.
- `defineRoutes({ ... })` normalizes parent/child route refs in registry order.
- `matchRouteChain(...)` returns a parent-to-leaf route chain without running guards or redirects.
- `resolveNavigationDecision(...)` owns redirect and guard decisions.
- `provideRouter(...)`, `navigate(...)`, browser `popstate`, and generated route links already use the same navigation pipeline.
- `createRouterOutlet(...)` renders matched layout/page chains through one root router outlet and route-local outlets.
- `resolveRoutePage(...)` and `resolveRouteLayout(...)` are the lazy module boundary.
- Route diagnostics already use stable `VR_*` code constants and docs hooks.

## File Structure

- `packages/router/src/route/route-types.ts`: add typed preload and keepAlive policy contracts and attach optional policy fields to page/layout route inputs plus normalized policy fields to `DefinedRoute`.
- `packages/router/src/route/create-routes.ts`: expose `routes.preload.none()`, `routes.preload.intent()`, `routes.keepAlive.none()`, and `routes.keepAlive.sessionDay()`.
- `packages/router/src/route/define-routes.ts`: normalize default policies, reject redirect policies, and record warning diagnostics for suspicious policies.
- `packages/router/src/route/route-diagnostic-codes.ts`: add Phase 15D diagnostic code constants.
- `packages/router/src/route/page-loader.ts`: cache successful lazy page/layout module loads, share that cache with preloading, and clear it from tests.
- `packages/router/src/route/route-preload.ts`: new internal helper for route-chain module preloading and preload diagnostics.
- `packages/router/src/route/route-keep-alive.ts`: new internal helper for route view identity, same-day expiry, store/take/destroy behavior, and test clock control.
- `packages/router/src/route/router-state.ts`: expose internal `preloadRoute(...)`, route definition version, guard-blocked keepAlive diagnostics, and reset cleanup.
- `packages/router/src/dom/route-link.ts`: wire generated link hover/focus/touch intent to route preloading without changing click behavior.
- `packages/router/src/dom/route-outlet.ts`: detach, store, reattach, or destroy route views based on route keepAlive policy after navigation is already allowed.
- `packages/router/src/index.ts`: export public policy types only; keep internal preload/keepAlive helpers out of public semver.
- `packages/router/src/internal.ts`: export compiler-facing link/outlet primitives only; no new compiler syntax is required.
- `packages/router/tests/route/define-routes-performance-policy.test.ts`: builder metadata, normalization, redirect policy rejection, and warning diagnostics.
- `packages/router/tests/route/page-loader.test.ts`: lazy module cache success and retry-after-failure behavior.
- `packages/router/tests/route/route-preload.test.ts`: direct route-chain preloading behavior, no guard/redirect/history/mount side effects, and failure diagnostics.
- `packages/router/tests/dom/route-link-preload.test.ts`: generated route link intent event behavior.
- `packages/router/tests/route/route-keep-alive.test.ts`: identity, same-day expiry, and store cleanup behavior.
- `packages/router/tests/dom/route-outlet-keep-alive.test.ts`: route view detach/restore integration.
- `packages/router/tests/route/router-phase-15d-integration.test.ts`: realistic graph covering Phase 15A, 15B, 15C, and 15D together.
- `packages/router/tests/route-builder-types.ts`: compile-time boundaries for preload/keepAlive policy usage.
- `docs/superpowers/final-tdd-inventory.md`: update only in the completion task after implementation and verification pass.
- `docs/superpowers/feature-maturity.md`: update only in the completion task after implementation and verification pass.
- `docs/vanrot-presentation.html`: update only in the completion task after implementation and verification pass.

## Task 1: Route Performance Policy Builder Surface

**Files:**
- Modify: `packages/router/src/route/route-types.ts`
- Modify: `packages/router/src/route/create-routes.ts`
- Modify: `packages/router/src/index.ts`
- Modify: `packages/router/tests/route-builder-types.ts`
- Test: `packages/router/tests/route/define-routes-performance-policy.test.ts`

- [x] **Step 1: Add failing policy builder tests**

Create `packages/router/tests/route/define-routes-performance-policy.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { createRoutes, defineRoutes } from '../../src/index.js';
import { createTestLayout, createTestPage } from '../../src/test/test-pages.js';

const routePath = {
  shop: '/shop',
  product: 'product',
  detail: ':productId',
  cart: 'cart',
} as const;

const routeLabel = {
  shop: 'Shop',
  product: 'Products',
  detail: 'Product detail',
  cart: 'Cart',
} as const;

describe('defineRoutes performance policy metadata', () => {
  it('creates typed preload and keepAlive policy metadata from route helpers', () => {
    const routes = createRoutes();

    expect(routes.preload.none()).toEqual({ kind: 'none' });
    expect(routes.preload.intent()).toEqual({ kind: 'intent' });
    expect(routes.keepAlive.none()).toEqual({ kind: 'none' });
    expect(routes.keepAlive.sessionDay()).toEqual({ kind: 'sessionDay' });
  });

  it('normalizes defaults and preserves explicit policies on defined routes', () => {
    const routes = createRoutes();
    const shop = routes.layout({
      path: routePath.shop,
      label: routeLabel.shop,
      layout: createTestLayout('shop-layout'),
    });
    const product = shop.layout({
      path: routePath.product,
      label: routeLabel.product,
      loadLayout: async () => createTestLayout('product-layout'),
    });
    const detail = product.page({
      path: routePath.detail,
      label: routeLabel.detail,
      loadPage: async () => createTestPage('product-detail'),
      preload: routes.preload.intent(),
      keepAlive: routes.keepAlive.sessionDay(),
    });
    const cart = shop.page({
      path: routePath.cart,
      label: routeLabel.cart,
      page: createTestPage('cart'),
    });

    const route = defineRoutes({ shop, product, detail, cart });

    expect(route.detail.preload).toEqual({ kind: 'intent' });
    expect(route.detail.keepAlive).toEqual({ kind: 'sessionDay' });
    expect(route.cart.preload).toEqual({ kind: 'none' });
    expect(route.cart.keepAlive).toEqual({ kind: 'none' });
  });
});
```

- [x] **Step 2: Run the failing policy builder tests**

Run:

```bash
pnpm --filter @vanrot/router test -- tests/route/define-routes-performance-policy.test.ts
```

Expected: FAIL because `routes.preload`, `routes.keepAlive`, and normalized `DefinedRoute.preload` / `DefinedRoute.keepAlive` fields do not exist.

- [x] **Step 3: Add policy types**

Modify `packages/router/src/route/route-types.ts` with these type and constant additions near the existing route metadata types:

```ts
export const routePreloadPolicyKinds = {
  none: 'none',
  intent: 'intent',
} as const;

export type RoutePreloadPolicyKind =
  (typeof routePreloadPolicyKinds)[keyof typeof routePreloadPolicyKinds];

export interface RoutePreloadPolicy {
  readonly kind: RoutePreloadPolicyKind;
}

export const routeKeepAlivePolicyKinds = {
  none: 'none',
  sessionDay: 'sessionDay',
} as const;

export type RouteKeepAlivePolicyKind =
  (typeof routeKeepAlivePolicyKinds)[keyof typeof routeKeepAlivePolicyKinds];

export interface RouteKeepAlivePolicy {
  readonly kind: RouteKeepAlivePolicyKind;
}

export const defaultRoutePreloadPolicy: RoutePreloadPolicy = {
  kind: routePreloadPolicyKinds.none,
};

export const defaultRouteKeepAlivePolicy: RouteKeepAlivePolicy = {
  kind: routeKeepAlivePolicyKinds.none,
};
```

Extend `RouteDefinitionBase`:

```ts
export interface RouteDefinitionBase {
  path: string;
  label: string;
  nav?: RouteNavMetadata;
  query?: RouteQueryDefinitionMap;
  breadcrumb?: RouteBreadcrumbDefinition;
  canEnter?: RouteGuardInput;
  preload?: RoutePreloadPolicy;
  keepAlive?: RouteKeepAlivePolicy;
}
```

Extend `RedirectRouteDefinition` so redirect route inputs are rejected at typecheck time:

```ts
export interface RedirectRouteDefinition extends RouteDefinitionBase {
  kind?: 'redirect';
  to: RouteRedirectTarget;
  params?: (params: RouteParams) => RouteParams;
  queryInput?: (query: Record<string, string | string[]>) => RouteQuery;
  page?: never;
  loadPage?: never;
  layout?: never;
  loadLayout?: never;
  preload?: never;
  keepAlive?: never;
}
```

Extend `DefinedRoute` so every normalized route has concrete policies:

```ts
export type DefinedRoute<Key extends string = string> = RouteDefinition & {
  key: Key;
  kind: RouteKind;
  ref?: RouteRef;
  fullPath: string;
  parent?: DefinedRoute;
  children: DefinedRoute[];
  breadcrumbParent?: DefinedRoute;
  preload: RoutePreloadPolicy;
  keepAlive: RouteKeepAlivePolicy;
  redirect?: {
    to: DefinedRoute;
    input?: RouteUrlInput;
    params?: (params: RouteParams) => RouteParams;
    queryInput?: (query: Record<string, string | string[]>) => RouteQuery;
  };
  diagnostics: RouteDiagnostic[];
};
```

- [x] **Step 4: Add route builder helpers**

Modify `packages/router/src/route/create-routes.ts` imports:

```ts
import {
  routeKeepAlivePolicyKinds,
  routePreloadPolicyKinds,
  type LayoutRouteDefinition,
  type PageRouteDefinition,
  type RedirectRouteDefinition,
  type RouteBreadcrumbDefinition,
  type RouteDefinition,
  type RouteKeepAlivePolicy,
  type RouteKind,
  type RouteNavMetadata,
  type RoutePreloadPolicy,
  type RouteRef,
  type RouteRedirectTarget,
  type RouteUrlInput,
} from './route-types.js';
```

Extend `RouteBuilder`:

```ts
export interface RouteBuilder {
  page(definition: PageRouteDefinition): RouteRef;
  layout(definition: LayoutRouteDefinition): RouteRef;
  redirect(definition: RedirectRouteDefinition): RouteRef;
  redirectTo(route: RouteRef, input?: RouteUrlInput): RouteRedirectTarget;
  breadcrumb: {
    root(): RouteBreadcrumbDefinition;
    parent(parent: RouteRef): RouteBreadcrumbDefinition;
  };
  nav: {
    primary(): RouteNavMetadata;
    hidden(): RouteNavMetadata;
  };
  preload: {
    none(): RoutePreloadPolicy;
    intent(): RoutePreloadPolicy;
  };
  keepAlive: {
    none(): RouteKeepAlivePolicy;
    sessionDay(): RouteKeepAlivePolicy;
  };
}
```

Add the helpers to `createBuilder(...)` after `nav`:

```ts
    preload: {
      none() {
        return { kind: routePreloadPolicyKinds.none };
      },
      intent() {
        return { kind: routePreloadPolicyKinds.intent };
      },
    },
    keepAlive: {
      none() {
        return { kind: routeKeepAlivePolicyKinds.none };
      },
      sessionDay() {
        return { kind: routeKeepAlivePolicyKinds.sessionDay };
      },
    },
```

- [x] **Step 5: Export public policy types**

Modify `packages/router/src/index.ts` type exports:

```ts
export type {
  DefinedRoute,
  DefinedRouteTable,
  LayoutRouteDefinition,
  PageRouteDefinition,
  RedirectRouteDefinition,
  RouteChainMatch,
  RouteDefinition,
  RouteDefinitionBase,
  RouteGuard,
  RouteGuardContext,
  RouteGuardInput,
  RouteGuardResult,
  RouteInput,
  RouteKeepAlivePolicy,
  RouteKeepAlivePolicyKind,
  RouteKind,
  RouteLayoutLoader,
  RouteLayoutModule,
  RouteMatch,
  RouteNavMetadata,
  RoutePageLoader,
  RoutePageModule,
  RouteParams,
  RouteParamsSignal,
  RoutePreloadPolicy,
  RoutePreloadPolicyKind,
  RouteQuery,
  RouteQueryDefinition,
  RouteQueryDefinitionMap,
  RouteQueryValue,
  RouteRef,
  RouteRedirectTarget,
  RouteUrlInput,
} from './route/route-types.js';
```

Keep `routePreloadPolicyKinds`, `routeKeepAlivePolicyKinds`, and default policy objects internal unless application code needs them in a future documented API.

- [x] **Step 6: Add compile-time policy boundary checks**

Append to `packages/router/tests/route-builder-types.ts`:

```ts
const product = routes.page({
  path: '/product/:productId',
  label: 'Product',
  loadPage: async () => createTestPage('product'),
  preload: routes.preload.intent(),
  keepAlive: routes.keepAlive.sessionDay(),
});

routes.page({
  path: '/product-static',
  label: 'Static product',
  page: createTestPage('product-static'),
  preload: routes.preload.none(),
  keepAlive: routes.keepAlive.none(),
});

routes.redirect({
  path: '/old-product',
  label: 'Old product',
  to: product,
  // @ts-expect-error Redirect routes must not declare preload policy.
  preload: routes.preload.intent(),
});

routes.redirect({
  path: '/old-product-detail',
  label: 'Old product detail',
  to: product,
  // @ts-expect-error Redirect routes must not declare keepAlive policy.
  keepAlive: routes.keepAlive.sessionDay(),
});
```

- [x] **Step 7: Normalize default policies**

Modify `packages/router/src/route/define-routes.ts` imports:

```ts
import {
  defaultRouteKeepAlivePolicy,
  defaultRoutePreloadPolicy,
  type DefinedRoute,
  type DefinedRouteTable,
  type RouteDefinition,
  type RouteInput,
  type RouteRedirectTarget,
  type RouteRef,
  type RouteUrlInput,
} from './route-types.js';
```

Add default policies in both `normalizeRouteRef(...)` and `normalizeObjectRoute(...)` route object literals:

```ts
    preload: ref.definition.preload === undefined
      ? defaultRoutePreloadPolicy
      : ref.definition.preload,
    keepAlive: ref.definition.keepAlive === undefined
      ? defaultRouteKeepAlivePolicy
      : ref.definition.keepAlive,
```

```ts
    preload: definition.preload === undefined
      ? defaultRoutePreloadPolicy
      : definition.preload,
    keepAlive: definition.keepAlive === undefined
      ? defaultRouteKeepAlivePolicy
      : definition.keepAlive,
```

- [x] **Step 8: Run policy builder and typecheck verification**

Run:

```bash
pnpm --filter @vanrot/router test -- tests/route/define-routes-performance-policy.test.ts
pnpm --filter @vanrot/router typecheck
```

Expected: PASS for the new policy builder tests and PASS for typecheck with the new `@ts-expect-error` checks consumed.

- [x] **Step 9: Review checkpoint**

Run:

```bash
git status --short --branch
```

Expected: route type, builder, export, and tests are uncommitted in the working tree. Do not run `git add` or `git commit` unless the user asks.

## Task 2: Policy Diagnostics And Redirect Safety

**Files:**
- Modify: `packages/router/src/route/route-diagnostic-codes.ts`
- Modify: `packages/router/src/route/define-routes.ts`
- Test: `packages/router/tests/route/define-routes-performance-policy.test.ts`

- [x] **Step 1: Add failing diagnostic tests**

Append to `packages/router/tests/route/define-routes-performance-policy.test.ts` inside the existing `describe(...)`:

```ts
  it('fails when redirect routes declare preload policy', () => {
    const routes = createRoutes();
    const home = routes.page({
      path: '/',
      label: 'Home',
      page: createTestPage('home'),
    });

    expect(() =>
      defineRoutes({
        home,
        oldHome: {
          kind: 'redirect',
          path: '/old-home',
          label: 'Old home',
          to: home,
          preload: routes.preload.intent(),
        } as never,
      }),
    ).toThrow('VR_REDIRECT_HAS_PRELOAD_POLICY: Redirect route "oldHome" must not declare preload policy.');
  });

  it('fails when redirect routes declare keepAlive policy', () => {
    const routes = createRoutes();
    const home = routes.page({
      path: '/',
      label: 'Home',
      page: createTestPage('home'),
    });

    expect(() =>
      defineRoutes({
        home,
        oldHome: {
          kind: 'redirect',
          path: '/old-home',
          label: 'Old home',
          to: home,
          keepAlive: routes.keepAlive.sessionDay(),
        } as never,
      }),
    ).toThrow('VR_REDIRECT_HAS_KEEP_ALIVE_POLICY: Redirect route "oldHome" must not declare keepAlive policy.');
  });

  it('warns when intent preload is declared without a lazy page or lazy layout target', () => {
    const routes = createRoutes();
    const home = routes.page({
      path: '/',
      label: 'Home',
      page: createTestPage('home'),
      preload: routes.preload.intent(),
    });

    const route = defineRoutes({ home });

    expect(route.home.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'VR_PRELOAD_WITHOUT_LAZY_TARGET',
        severity: 'warning',
        message: 'Route "home" declares preload intent but has no lazy page or lazy layout.',
      }),
    );
  });
```

- [x] **Step 2: Run the failing diagnostic tests**

Run:

```bash
pnpm --filter @vanrot/router test -- tests/route/define-routes-performance-policy.test.ts
```

Expected: FAIL because Phase 15D diagnostic codes and validation branches do not exist.

- [x] **Step 3: Add diagnostic code constants**

Modify `packages/router/src/route/route-diagnostic-codes.ts`:

```ts
export const routeDiagnosticCodes = {
  duplicatePath: 'VR_ROUTE_DUPLICATE_PATH',
  invalidParentPath: 'VR_ROUTE_INVALID_PARENT_PATH',
  missingRenderTarget: 'VR_ROUTE_MISSING_RENDER_TARGET',
  invalidParamName: 'VR_ROUTE_INVALID_PARAM_NAME',
  missingParam: 'VR_ROUTE_MISSING_PARAM',
  unknownParam: 'VR_ROUTE_UNKNOWN_PARAM',
  unknownQuery: 'VR_ROUTE_UNKNOWN_QUERY',
  queryMetadataRequired: 'VR_ROUTE_QUERY_METADATA_REQUIRED',
  breadcrumbParentMissing: 'VR_ROUTE_BREADCRUMB_PARENT_MISSING',
  breadcrumbParamImpossible: 'VR_ROUTE_BREADCRUMB_PARAM_IMPOSSIBLE',
  invalidTemplateRef: 'VR_ROUTE_INVALID_TEMPLATE_REF',
  childBeforeParent: 'VR_CHILD_BEFORE_PARENT',
  duplicateIndexRoute: 'VR_DUPLICATE_INDEX_ROUTE',
  invalidIndexLayout: 'VR_INVALID_INDEX_LAYOUT',
  layoutMissingComponent: 'VR_LAYOUT_MISSING_COMPONENT',
  layoutWithoutChildren: 'VR_LAYOUT_WITHOUT_CHILDREN',
  pageHasChildren: 'VR_PAGE_HAS_CHILDREN',
  redirectHasRenderTarget: 'VR_REDIRECT_HAS_RENDER_TARGET',
  redirectHasChildren: 'VR_REDIRECT_HAS_CHILDREN',
  redirectTargetMissing: 'VR_REDIRECT_TARGET_MISSING',
  redirectLoop: 'VR_REDIRECT_LOOP',
  invalidGuard: 'VR_ROUTE_INVALID_GUARD',
  invalidGuardResult: 'VR_ROUTE_INVALID_GUARD_RESULT',
  guardRedirectTargetMissing: 'VR_GUARD_REDIRECT_TARGET_MISSING',
  guardRedirectLoop: 'VR_GUARD_REDIRECT_LOOP',
  redirectHasPreloadPolicy: 'VR_REDIRECT_HAS_PRELOAD_POLICY',
  redirectHasKeepAlivePolicy: 'VR_REDIRECT_HAS_KEEP_ALIVE_POLICY',
  preloadWithoutLazyTarget: 'VR_PRELOAD_WITHOUT_LAZY_TARGET',
  routePreloadFailed: 'VR_ROUTE_PRELOAD_FAILED',
  keepAliveIdentityMissing: 'VR_KEEP_ALIVE_IDENTITY_MISSING',
  keepAliveRestoreBlocked: 'VR_KEEP_ALIVE_RESTORE_BLOCKED',
} as const;
```

- [x] **Step 4: Validate redirect and suspicious preload policies**

Modify `packages/router/src/route/define-routes.ts` imports:

```ts
import {
  defaultRouteKeepAlivePolicy,
  defaultRoutePreloadPolicy,
  routeKeepAlivePolicyKinds,
  routePreloadPolicyKinds,
  type DefinedRoute,
  type DefinedRouteTable,
  type RouteDefinition,
  type RouteInput,
  type RouteRedirectTarget,
  type RouteRef,
  type RouteUrlInput,
} from './route-types.js';
```

Call a new validator inside `validateRouteGraph(...)` after `validateCanEnter(route)`:

```ts
    validatePerformancePolicy(route);
```

Add this helper below `validateCanEnter(...)`:

```ts
function validatePerformancePolicy(route: DefinedRoute): void {
  if (route.kind === 'redirect') {
    validateRedirectPerformancePolicy(route);
    return;
  }

  if (route.preload.kind !== routePreloadPolicyKinds.intent) {
    return;
  }

  if (route.loadPage !== undefined || route.loadLayout !== undefined) {
    return;
  }

  route.diagnostics.push(
    createRouteDiagnostic({
      code: routeDiagnosticCodes.preloadWithoutLazyTarget,
      severity: 'warning',
      message: `Route "${route.key}" declares preload intent but has no lazy page or lazy layout.`,
      suggestion: `Remove preload from "${route.key}" or switch the route to loadPage/loadLayout.`,
      docsPath: 'router/routes#preload-policy',
    }),
  );
}

function validateRedirectPerformancePolicy(route: DefinedRoute): void {
  if (route.preload.kind !== routePreloadPolicyKinds.none) {
    throwRouteDiagnostic(
      routeDiagnosticCodes.redirectHasPreloadPolicy,
      `Redirect route "${route.key}" must not declare preload policy.`,
      `Remove preload from redirect route "${route.key}".`,
      'router/routes#redirect-routes',
    );
  }

  if (route.keepAlive.kind === routeKeepAlivePolicyKinds.none) {
    return;
  }

  throwRouteDiagnostic(
    routeDiagnosticCodes.redirectHasKeepAlivePolicy,
    `Redirect route "${route.key}" must not declare keepAlive policy.`,
    `Remove keepAlive from redirect route "${route.key}".`,
    'router/routes#redirect-routes',
  );
}
```

- [x] **Step 5: Run diagnostic tests**

Run:

```bash
pnpm --filter @vanrot/router test -- tests/route/define-routes-performance-policy.test.ts
```

Expected: PASS with redirect policy errors and preload warning diagnostics.

- [x] **Step 6: Review checkpoint**

Run:

```bash
git status --short --branch
```

Expected: diagnostic code, define-routes, and policy test changes are uncommitted in the working tree. Do not run `git add` or `git commit` unless the user asks.

## Task 3: Lazy Module Cache And Route Preloading Primitive

**Files:**
- Modify: `packages/router/src/route/page-loader.ts`
- Create: `packages/router/src/route/route-preload.ts`
- Modify: `packages/router/src/route/router-state.ts`
- Test: `packages/router/tests/route/page-loader.test.ts`
- Test: `packages/router/tests/route/route-preload.test.ts`

- [x] **Step 1: Add failing page-loader cache tests**

Append to `packages/router/tests/route/page-loader.test.ts`:

```ts
import { beforeEach, vi } from 'vitest';
import {
  clearRouteModuleCacheForTests,
  resolveRouteLayout,
} from '../../src/route/page-loader.js';
import { createTestLayout } from '../../src/test/test-pages.js';

beforeEach(() => {
  clearRouteModuleCacheForTests();
});

describe('route lazy module cache', () => {
  it('caches successful lazy page loads by defined route', async () => {
    const page = createTestPage('cached-page');
    const loadPage = vi.fn(async () => ({ default: page }));
    const route = {
      key: 'cached',
      path: '/cached',
      label: 'Cached',
      loadPage,
    };

    await expect(resolveRoutePage(route)).resolves.toBe(page);
    await expect(resolveRoutePage(route)).resolves.toBe(page);

    expect(loadPage).toHaveBeenCalledOnce();
  });

  it('retries lazy page loads after rejection', async () => {
    const page = createTestPage('retry-page');
    const loadPage = vi
      .fn<() => Promise<{ default: typeof page }>>()
      .mockRejectedValueOnce(new Error('first load failed'))
      .mockResolvedValueOnce({ default: page });
    const route = {
      key: 'retry',
      path: '/retry',
      label: 'Retry',
      loadPage,
    };

    await expect(resolveRoutePage(route)).rejects.toThrow('first load failed');
    await expect(resolveRoutePage(route)).resolves.toBe(page);

    expect(loadPage).toHaveBeenCalledTimes(2);
  });

  it('caches successful lazy layout loads by defined route', async () => {
    const layout = createTestLayout('cached-layout');
    const loadLayout = vi.fn(async () => ({ default: layout }));
    const route = {
      key: 'cachedLayout',
      path: '/cached-layout',
      label: 'Cached layout',
      loadLayout,
    };

    await expect(resolveRouteLayout(route)).resolves.toBe(layout);
    await expect(resolveRouteLayout(route)).resolves.toBe(layout);

    expect(loadLayout).toHaveBeenCalledOnce();
  });
});
```

- [x] **Step 2: Run the failing page-loader cache tests**

Run:

```bash
pnpm --filter @vanrot/router test -- tests/route/page-loader.test.ts
```

Expected: FAIL because lazy module cache helpers do not exist and lazy loaders run more than once.

- [x] **Step 3: Implement shared lazy module cache**

Replace `packages/router/src/route/page-loader.ts` with:

```ts
import type { DefinedRoute, RouteLayoutModule, RoutePageModule } from './route-types.js';

type ModuleCacheValue<Module> = Module | Promise<Module>;

const pageModuleCache = new Map<DefinedRoute, ModuleCacheValue<RoutePageModule>>();
const layoutModuleCache = new Map<DefinedRoute, ModuleCacheValue<RouteLayoutModule>>();

export async function resolveRoutePage(route: DefinedRoute): Promise<RoutePageModule> {
  if (route.page !== undefined) {
    return route.page;
  }

  if (route.loadPage === undefined) {
    throw new Error(`Route "${route.key}" must define page or loadPage.`);
  }

  const cached = pageModuleCache.get(route);

  if (cached !== undefined) {
    return cached;
  }

  const pending = route.loadPage().then(normalizePageModule);
  pageModuleCache.set(route, pending);

  try {
    const resolved = await pending;
    pageModuleCache.set(route, resolved);
    return resolved;
  } catch (error) {
    pageModuleCache.delete(route);
    throw error;
  }
}

export async function resolveRouteLayout(route: DefinedRoute): Promise<RouteLayoutModule> {
  if (route.layout !== undefined) {
    return route.layout;
  }

  if (route.loadLayout === undefined) {
    throw new Error(`Route "${route.key}" must define layout or loadLayout.`);
  }

  const cached = layoutModuleCache.get(route);

  if (cached !== undefined) {
    return cached;
  }

  const pending = route.loadLayout().then(normalizeLayoutModule);
  layoutModuleCache.set(route, pending);

  try {
    const resolved = await pending;
    layoutModuleCache.set(route, resolved);
    return resolved;
  } catch (error) {
    layoutModuleCache.delete(route);
    throw error;
  }
}

export function clearRouteModuleCacheForTests(): void {
  pageModuleCache.clear();
  layoutModuleCache.clear();
}

function normalizePageModule(loaded: RoutePageModule | { default: RoutePageModule }): RoutePageModule {
  if ('default' in loaded) {
    return loaded.default;
  }

  return loaded;
}

function normalizeLayoutModule(
  loaded: RouteLayoutModule | { default: RouteLayoutModule },
): RouteLayoutModule {
  if ('default' in loaded) {
    return loaded.default;
  }

  return loaded;
}
```

- [x] **Step 4: Add failing direct preload tests**

Create `packages/router/tests/route/route-preload.test.ts`:

```ts
// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createRoutes, defineRoutes } from '../../src/index.js';
import {
  clearRoutePreloadStateForTests,
  getRoutePreloadDiagnosticsForTests,
  preloadRoutePath,
} from '../../src/route/route-preload.js';
import {
  getCurrentMatch,
  provideRouter,
  resetRouterForTests,
} from '../../src/route/router-state.js';
import { createTestLayout, createTestPage } from '../../src/test/test-pages.js';

describe('preloadRoutePath', () => {
  beforeEach(() => {
    resetRouterForTests();
    clearRoutePreloadStateForTests();
    window.history.replaceState(null, '', '/');
  });

  it('preloads lazy layouts and lazy pages in a matched route chain', async () => {
    const loadProductLayout = vi.fn(async () => createTestLayout('product-layout'));
    const loadDetailPage = vi.fn(async () => createTestPage('detail-page'));
    const routes = createRoutes();
    const shop = routes.layout({
      path: '/shop',
      label: 'Shop',
      layout: createTestLayout('shop-layout'),
    });
    const product = shop.layout({
      path: 'product',
      label: 'Products',
      loadLayout: loadProductLayout,
    });
    const detail = product.page({
      path: ':productId',
      label: 'Product detail',
      loadPage: loadDetailPage,
      preload: routes.preload.intent(),
    });
    const route = defineRoutes({ shop, product, detail });

    await expect(preloadRoutePath(route, '/shop/product/42')).resolves.toBe(true);

    expect(loadProductLayout).toHaveBeenCalledOnce();
    expect(loadDetailPage).toHaveBeenCalledOnce();
  });

  it('does not run guards, redirects, history updates, or current route commits', async () => {
    const guard = vi.fn(() => false);
    const routes = createRoutes();
    const home = routes.page({
      path: '/',
      label: 'Home',
      page: createTestPage('home'),
    });
    const login = routes.page({
      path: '/login',
      label: 'Login',
      page: createTestPage('login'),
    });
    const account = routes.page({
      path: '/account',
      label: 'Account',
      loadPage: async () => createTestPage('account'),
      preload: routes.preload.intent(),
      canEnter: guard,
    });
    const oldAccount = routes.redirect({
      path: '/old-account',
      label: 'Old account',
      to: login,
    });
    const route = defineRoutes({ home, login, account, oldAccount });

    await provideRouter(route);
    await expect(preloadRoutePath(route, '/account')).resolves.toBe(true);

    expect(guard).not.toHaveBeenCalled();
    expect(getCurrentMatch()?.route).toBe(route.home);
    expect(window.location.pathname).toBe('/');
  });

  it('records preload failures and allows a real load to retry', async () => {
    const page = createTestPage('retry-page');
    const loadPage = vi
      .fn<() => Promise<typeof page>>()
      .mockRejectedValueOnce(new Error('chunk failed'))
      .mockResolvedValueOnce(page);
    const routes = createRoutes();
    const retry = routes.page({
      path: '/retry',
      label: 'Retry',
      loadPage,
      preload: routes.preload.intent(),
    });
    const route = defineRoutes({ retry });

    await expect(preloadRoutePath(route, '/retry')).resolves.toBe(false);

    expect(getRoutePreloadDiagnosticsForTests()).toContainEqual(
      expect.objectContaining({
        code: 'VR_ROUTE_PRELOAD_FAILED',
        message: 'Preload failed for route "retry".',
      }),
    );
    await expect(preloadRoutePath(route, '/retry')).resolves.toBe(true);
    expect(loadPage).toHaveBeenCalledTimes(2);
  });
});
```

- [x] **Step 5: Run the failing direct preload tests**

Run:

```bash
pnpm --filter @vanrot/router test -- tests/route/route-preload.test.ts
```

Expected: FAIL because `route-preload.ts` does not exist.

- [x] **Step 6: Implement route-chain preloading helper**

Create `packages/router/src/route/route-preload.ts`:

```ts
import { matchRouteChain } from './match-route-chain.js';
import { resolveRouteLayout, resolveRoutePage } from './page-loader.js';
import { routeDiagnosticCodes } from './route-diagnostic-codes.js';
import { createRouteDiagnostic } from './route-diagnostics.js';
import type { RouteDiagnostic } from './route-diagnostics.js';
import type { DefinedRoute, DefinedRouteTable, RouteChainMatch } from './route-types.js';

const preloadDiagnostics: RouteDiagnostic[] = [];

export async function preloadRoutePath(
  routes: DefinedRouteTable,
  path: string,
): Promise<boolean> {
  const match = matchRouteChain(routes, path);

  if (match === null) {
    return false;
  }

  return preloadRouteChain(match);
}

export function getRoutePreloadDiagnosticsForTests(): readonly RouteDiagnostic[] {
  return preloadDiagnostics;
}

export function clearRoutePreloadStateForTests(): void {
  preloadDiagnostics.length = 0;
}

async function preloadRouteChain(match: RouteChainMatch): Promise<boolean> {
  const loaders = match.chain
    .map((routeMatch) => preloadRouteModule(routeMatch.route))
    .filter((loader): loader is Promise<unknown> => loader !== null);

  try {
    await Promise.all(loaders);
    return true;
  } catch (error) {
    recordPreloadFailure(match, error);
    return false;
  }
}

function preloadRouteModule(route: DefinedRoute): Promise<unknown> | null {
  if (route.kind === 'layout' && route.loadLayout !== undefined) {
    return resolveRouteLayout(route);
  }

  if (route.kind === 'page' && route.loadPage !== undefined) {
    return resolveRoutePage(route);
  }

  return null;
}

function recordPreloadFailure(match: RouteChainMatch, error: unknown): void {
  const route = match.chain[match.chain.length - 1]?.route;

  if (route === undefined) {
    return;
  }

  preloadDiagnostics.push(
    createRouteDiagnostic({
      code: routeDiagnosticCodes.routePreloadFailed,
      severity: 'warning',
      message: `Preload failed for route "${route.key}".`,
      suggestion: errorMessage(error),
      docsPath: 'router/routes#preload-policy',
    }),
  );
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Retry navigation to load the route normally.';
}
```

- [x] **Step 7: Add router-state preload access and reset cleanup**

Modify `packages/router/src/route/router-state.ts` imports:

```ts
import { resolveNavigationDecision } from './navigation-decisions.js';
import { clearRouteModuleCacheForTests } from './page-loader.js';
import {
  clearRoutePreloadStateForTests,
  preloadRoutePath,
} from './route-preload.js';
```

Add this function near `navigate(...)`:

```ts
export async function preloadRoute(path: string): Promise<boolean> {
  return preloadRoutePath(requireProvidedRoutes(), path);
}
```

Extend `resetRouterForTests()`:

```ts
export function resetRouterForTests(): void {
  providedRoutes = null;
  removePopstateListener?.();
  removePopstateListener = null;
  navigationId = 0;
  currentRouteChain.set(null);
  currentParams.set(emptyParams);
  clearRouteModuleCacheForTests();
  clearRoutePreloadStateForTests();
}
```

Do not export `preloadRoute(...)` from `packages/router/src/index.ts`; it is an internal router-link helper.

- [x] **Step 8: Run preload primitive tests**

Run:

```bash
pnpm --filter @vanrot/router test -- tests/route/page-loader.test.ts tests/route/route-preload.test.ts
```

Expected: PASS with lazy module cache, retry after failure, and direct route-chain preload behavior.

- [x] **Step 9: Review checkpoint**

Run:

```bash
git status --short --branch
```

Expected: page-loader, route-preload, router-state, and related tests are uncommitted in the working tree. Do not run `git add` or `git commit` unless the user asks.

## Task 4: Generated Route Link Intent Preloading

**Files:**
- Modify: `packages/router/src/dom/route-link.ts`
- Test: `packages/router/tests/dom/route-link-preload.test.ts`

- [x] **Step 1: Add failing route link preload tests**

Create `packages/router/tests/dom/route-link-preload.test.ts`:

```ts
// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setupRouteLink } from '../../src/dom/route-link.js';
import { createRoutes, defineRoutes } from '../../src/index.js';
import { provideRouter, resetRouterForTests } from '../../src/route/router-state.js';
import { createTestPage } from '../../src/test/test-pages.js';

describe('setupRouteLink preload intent', () => {
  beforeEach(() => {
    resetRouterForTests();
    window.history.replaceState(null, '', '/');
  });

  it('preloads route modules on mouse intent', async () => {
    const loadAccount = vi.fn(async () => createTestPage('account'));
    const routes = createRoutes();
    const home = routes.page({
      path: '/',
      label: 'Home',
      page: createTestPage('home'),
    });
    const account = routes.page({
      path: '/account',
      label: 'Account',
      loadPage: loadAccount,
      preload: routes.preload.intent(),
    });
    const route = defineRoutes({ home, account });
    const anchor = document.createElement('a');

    await provideRouter(route);
    setupRouteLink(anchor, route.account);
    anchor.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await flushPreload();

    expect(loadAccount).toHaveBeenCalledOnce();
    expect(window.location.pathname).toBe('/');
  });

  it('preloads route modules on keyboard focus and touch intent only once', async () => {
    const loadAccount = vi.fn(async () => createTestPage('account'));
    const routes = createRoutes();
    const home = routes.page({
      path: '/',
      label: 'Home',
      page: createTestPage('home'),
    });
    const account = routes.page({
      path: '/account',
      label: 'Account',
      loadPage: loadAccount,
      preload: routes.preload.intent(),
    });
    const route = defineRoutes({ home, account });
    const anchor = document.createElement('a');

    await provideRouter(route);
    setupRouteLink(anchor, route.account);
    anchor.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
    anchor.dispatchEvent(new TouchEvent('touchstart', { bubbles: true }));
    await flushPreload();

    expect(loadAccount).toHaveBeenCalledOnce();
  });

  it('does not preload routes without intent policy', async () => {
    const loadAccount = vi.fn(async () => createTestPage('account'));
    const routes = createRoutes();
    const home = routes.page({
      path: '/',
      label: 'Home',
      page: createTestPage('home'),
    });
    const account = routes.page({
      path: '/account',
      label: 'Account',
      loadPage: loadAccount,
    });
    const route = defineRoutes({ home, account });
    const anchor = document.createElement('a');

    await provideRouter(route);
    setupRouteLink(anchor, route.account);
    anchor.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await flushPreload();

    expect(loadAccount).not.toHaveBeenCalled();
  });
});

async function flushPreload(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}
```

- [x] **Step 2: Run the failing link preload tests**

Run:

```bash
pnpm --filter @vanrot/router test -- tests/dom/route-link-preload.test.ts
```

Expected: FAIL because `setupRouteLink(...)` does not wire intent events to preloading.

- [x] **Step 3: Wire route link intent events**

Modify `packages/router/src/dom/route-link.ts` imports:

```ts
import { effect, onDestroy } from '@vanrot/runtime';
import { buildRouteUrl } from '../route/url-builder.js';
import {
  getCurrentMatch,
  navigate,
  preloadRoute,
} from '../route/router-state.js';
import { routePreloadPolicyKinds } from '../route/route-types.js';
import type { DefinedRoute, RouteUrlInput } from '../route/route-types.js';
```

Add this block after the click listener registration:

```ts
  const preloadListener = (): void => {
    if (route.preload.kind !== routePreloadPolicyKinds.intent) {
      return;
    }

    void preloadRoute(href);
  };

  anchor.addEventListener('mouseenter', preloadListener);
  anchor.addEventListener('focus', preloadListener);
  anchor.addEventListener('touchstart', preloadListener);
  onDestroy(() => {
    anchor.removeEventListener('mouseenter', preloadListener);
    anchor.removeEventListener('focus', preloadListener);
    anchor.removeEventListener('touchstart', preloadListener);
  });
```

Keep the click listener unchanged:

```ts
  const listener = (event: MouseEvent): void => {
    if (shouldUseBrowserNavigation(event, anchor)) {
      return;
    }

    event.preventDefault();
    void navigate(href);
  };
```

- [x] **Step 4: Run link preload tests and existing link navigation tests**

Run:

```bash
pnpm --filter @vanrot/router test -- tests/dom/route-link-preload.test.ts tests/dom/route-link.test.ts tests/dom/route-link-navigation.test.ts
```

Expected: PASS. Preload intent warms lazy modules, and normal link clicks still use the guarded navigation pipeline.

- [x] **Step 5: Review checkpoint**

Run:

```bash
git status --short --branch
```

Expected: route-link and link tests are uncommitted in the working tree. Do not run `git add` or `git commit` unless the user asks.

## Task 5: KeepAlive Identity And Store

**Files:**
- Create: `packages/router/src/route/route-keep-alive.ts`
- Modify: `packages/router/src/route/router-state.ts`
- Test: `packages/router/tests/route/route-keep-alive.test.ts`

- [x] **Step 1: Add failing keepAlive store tests**

Create `packages/router/tests/route/route-keep-alive.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRoutes, defineRoutes } from '../../src/index.js';
import {
  clearRouteKeepAliveStoreForTests,
  createKeepAliveRouteIdentity,
  getRouteKeepAliveDiagnosticsForTests,
  getRouteKeepAliveStoreSizeForTests,
  setRouteKeepAliveNowForTests,
  storeKeepAliveRouteView,
  takeKeepAliveRouteView,
} from '../../src/route/route-keep-alive.js';
import { matchRouteChain } from '../../src/route/match-route-chain.js';
import { createTestPage } from '../../src/test/test-pages.js';

describe('route keepAlive store', () => {
  beforeEach(() => {
    clearRouteKeepAliveStoreForTests();
    setRouteKeepAliveNowForTests(() => new Date('2026-05-24T08:00:00'));
  });

  afterEach(() => {
    clearRouteKeepAliveStoreForTests();
    setRouteKeepAliveNowForTests(() => new Date());
  });

  it('builds stable identities from route key, params, query, and route version', () => {
    const routes = createRoutes();
    const detail = routes.page({
      path: '/product/:productId',
      label: 'Product detail',
      page: createTestPage('detail'),
      query: { tab: {} },
      keepAlive: routes.keepAlive.sessionDay(),
    });
    const route = defineRoutes({ detail });
    const first = matchRouteChain(route, '/product/42?tab=overview');
    const second = matchRouteChain(route, '/product/42?tab=reviews');

    expect(first).not.toBeNull();
    expect(second).not.toBeNull();
    expect(createKeepAliveRouteIdentity(first!.chain[0]!, 1)).toBe(
      '1|detail|params:productId=42|query:tab=overview',
    );
    expect(createKeepAliveRouteIdentity(second!.chain[0]!, 1)).toBe(
      '1|detail|params:productId=42|query:tab=reviews',
    );
  });

  it('stores and restores a same-day route view by identity', () => {
    const handle = { destroy: vi.fn() };
    const node = document.createElement('section');
    const routes = createRoutes();
    const detail = routes.page({
      path: '/product/:productId',
      label: 'Product detail',
      page: createTestPage('detail'),
      keepAlive: routes.keepAlive.sessionDay(),
    });
    const route = defineRoutes({ detail });
    const match = matchRouteChain(route, '/product/42');

    expect(match).not.toBeNull();
    storeKeepAliveRouteView({
      identity: createKeepAliveRouteIdentity(match!.chain[0]!, 1)!,
      route: route.detail,
      handle,
      nodes: [node],
    });

    expect(getRouteKeepAliveStoreSizeForTests()).toBe(1);
    expect(takeKeepAliveRouteView(match!.chain[0]!, 1)?.handle).toBe(handle);
    expect(handle.destroy).not.toHaveBeenCalled();
  });

  it('expires stored route views when the local day changes', () => {
    const handle = { destroy: vi.fn() };
    const routes = createRoutes();
    const detail = routes.page({
      path: '/product/:productId',
      label: 'Product detail',
      page: createTestPage('detail'),
      keepAlive: routes.keepAlive.sessionDay(),
    });
    const route = defineRoutes({ detail });
    const match = matchRouteChain(route, '/product/42');

    expect(match).not.toBeNull();
    storeKeepAliveRouteView({
      identity: createKeepAliveRouteIdentity(match!.chain[0]!, 1)!,
      route: route.detail,
      handle,
      nodes: [],
    });
    setRouteKeepAliveNowForTests(() => new Date('2026-05-25T00:01:00'));

    expect(takeKeepAliveRouteView(match!.chain[0]!, 1)).toBeNull();
    expect(handle.destroy).toHaveBeenCalledOnce();
    expect(getRouteKeepAliveStoreSizeForTests()).toBe(0);
  });

  it('records diagnostics when identity cannot be built', () => {
    const routes = createRoutes();
    const detail = routes.page({
      path: '/product/:productId',
      label: 'Product detail',
      page: createTestPage('detail'),
      keepAlive: routes.keepAlive.sessionDay(),
    });
    const route = defineRoutes({ detail });
    const match = matchRouteChain(route, '/product/42');

    expect(match).not.toBeNull();
    const incompleteMatch = {
      ...match!.chain[0]!,
      params: {},
    };

    expect(createKeepAliveRouteIdentity(incompleteMatch, 1)).toBeNull();
    expect(getRouteKeepAliveDiagnosticsForTests()).toContainEqual(
      expect.objectContaining({
        code: 'VR_KEEP_ALIVE_IDENTITY_MISSING',
        message: 'KeepAlive identity cannot be built for route "detail".',
      }),
    );
  });
});
```

- [x] **Step 2: Run the failing keepAlive store tests**

Run:

```bash
pnpm --filter @vanrot/router test -- tests/route/route-keep-alive.test.ts
```

Expected: FAIL because `route-keep-alive.ts` does not exist.

- [x] **Step 3: Implement keepAlive identity and store**

Create `packages/router/src/route/route-keep-alive.ts`:

```ts
import type { AppHandle } from '@vanrot/runtime';
import { extractPathParamNames } from './path-params.js';
import { routeDiagnosticCodes } from './route-diagnostic-codes.js';
import { createRouteDiagnostic } from './route-diagnostics.js';
import type { RouteDiagnostic } from './route-diagnostics.js';
import type { DefinedRoute, RouteMatch } from './route-types.js';

export interface KeepAliveRouteView {
  identity: string;
  route: DefinedRoute;
  handle: AppHandle;
  nodes: Node[];
}

interface StoredKeepAliveRouteView extends KeepAliveRouteView {
  dayKey: string;
}

const keepAliveStore = new Map<string, StoredKeepAliveRouteView>();
const keepAliveDiagnostics: RouteDiagnostic[] = [];

let readNow = (): Date => new Date();

export function createKeepAliveRouteIdentity(
  match: RouteMatch,
  routeVersion: number,
): string | null {
  const paramPairs = collectParamPairs(match);

  if (paramPairs === null) {
    recordIdentityMissing(match.route);
    return null;
  }

  const queryPairs = Object.entries(match.query)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${Array.isArray(value) ? value.join(',') : value}`);

  return [
    String(routeVersion),
    match.route.key,
    `params:${paramPairs.join(',')}`,
    `query:${queryPairs.join(',')}`,
  ].join('|');
}

export function storeKeepAliveRouteView(view: KeepAliveRouteView): void {
  const existing = keepAliveStore.get(view.identity);

  if (existing !== undefined) {
    existing.handle.destroy();
  }

  keepAliveStore.set(view.identity, {
    ...view,
    dayKey: currentDayKey(),
  });
}

export function takeKeepAliveRouteView(
  match: RouteMatch,
  routeVersion: number,
): KeepAliveRouteView | null {
  clearExpiredKeepAliveViews();

  const identity = createKeepAliveRouteIdentity(match, routeVersion);

  if (identity === null) {
    return null;
  }

  const stored = keepAliveStore.get(identity);

  if (stored === undefined) {
    return null;
  }

  keepAliveStore.delete(identity);

  return {
    identity: stored.identity,
    route: stored.route,
    handle: stored.handle,
    nodes: stored.nodes,
  };
}

export function recordKeepAliveRestoreBlocked(route: DefinedRoute): void {
  keepAliveDiagnostics.push(
    createRouteDiagnostic({
      code: routeDiagnosticCodes.keepAliveRestoreBlocked,
      severity: 'warning',
      message: `KeepAlive restore skipped because current guards blocked route "${route.key}".`,
      suggestion: 'Allow navigation before expecting a kept-alive route view to reattach.',
      docsPath: 'router/routes#keep-alive',
    }),
  );
}

export function clearRouteKeepAliveStoreForTests(): void {
  for (const entry of keepAliveStore.values()) {
    entry.handle.destroy();
  }

  keepAliveStore.clear();
  keepAliveDiagnostics.length = 0;
}

export function getRouteKeepAliveStoreSizeForTests(): number {
  clearExpiredKeepAliveViews();
  return keepAliveStore.size;
}

export function getRouteKeepAliveDiagnosticsForTests(): readonly RouteDiagnostic[] {
  return keepAliveDiagnostics;
}

export function setRouteKeepAliveNowForTests(reader: () => Date): void {
  readNow = reader;
}

function clearExpiredKeepAliveViews(): void {
  const dayKey = currentDayKey();

  for (const [identity, entry] of keepAliveStore.entries()) {
    if (entry.dayKey === dayKey) {
      continue;
    }

    entry.handle.destroy();
    keepAliveStore.delete(identity);
  }
}

function collectParamPairs(match: RouteMatch): string[] | null {
  const pairs: string[] = [];

  for (const paramName of extractPathParamNames(match.route.fullPath)) {
    const value = match.params[paramName];

    if (value === undefined) {
      return null;
    }

    pairs.push(`${paramName}=${value}`);
  }

  return pairs.sort();
}

function recordIdentityMissing(route: DefinedRoute): void {
  keepAliveDiagnostics.push(
    createRouteDiagnostic({
      code: routeDiagnosticCodes.keepAliveIdentityMissing,
      severity: 'warning',
      message: `KeepAlive identity cannot be built for route "${route.key}".`,
      suggestion: 'Ensure all route params needed by the full path are present before enabling keepAlive.',
      docsPath: 'router/routes#keep-alive',
    }),
  );
}

function currentDayKey(): string {
  const now = readNow();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const date = String(now.getDate()).padStart(2, '0');

  return `${now.getFullYear()}-${month}-${date}`;
}
```

- [x] **Step 4: Add route definition version and reset cleanup**

Modify `packages/router/src/route/router-state.ts` imports:

```ts
import {
  clearRouteKeepAliveStoreForTests,
  recordKeepAliveRestoreBlocked,
} from './route-keep-alive.js';
import { matchRouteChain } from './match-route-chain.js';
import { routeKeepAlivePolicyKinds } from './route-types.js';
```

Add state near `navigationId`:

```ts
let routeDefinitionVersion = 0;
```

Increment it in `provideRouter(...)` before navigation starts:

```ts
export async function provideRouter(routes: DefinedRouteTable): Promise<boolean> {
  providedRoutes = routes;
  routeDefinitionVersion += 1;
  removePopstateListener?.();
  removePopstateListener = listenForPopstate();
  return startNavigation(readBrowserPath(), { history: 'replace' });
}
```

Add this internal getter:

```ts
export function getRouteDefinitionVersion(): number {
  return routeDefinitionVersion;
}
```

Add this helper:

```ts
function recordBlockedKeepAliveRestore(path: string): void {
  const routes = providedRoutes;

  if (routes === null) {
    return;
  }

  const match = matchRouteChain(routes, path);
  const leaf = match?.chain[match.chain.length - 1];

  if (leaf === undefined) {
    return;
  }

  if (leaf.route.keepAlive.kind !== routeKeepAlivePolicyKinds.sessionDay) {
    return;
  }

  recordKeepAliveRestoreBlocked(leaf.route);
}
```

Call it when navigation is blocked:

```ts
  if (decision.kind === 'blocked') {
    recordBlockedKeepAliveRestore(path);
    return false;
  }
```

Extend `resetRouterForTests()`:

```ts
export function resetRouterForTests(): void {
  providedRoutes = null;
  removePopstateListener?.();
  removePopstateListener = null;
  navigationId = 0;
  routeDefinitionVersion = 0;
  currentRouteChain.set(null);
  currentParams.set(emptyParams);
  clearRouteModuleCacheForTests();
  clearRoutePreloadStateForTests();
  clearRouteKeepAliveStoreForTests();
}
```

- [x] **Step 5: Run keepAlive store tests**

Run:

```bash
pnpm --filter @vanrot/router test -- tests/route/route-keep-alive.test.ts
```

Expected: PASS with stable identity, same-day restore, day rollover expiry, missing-identity diagnostics, and reset-safe store cleanup.

- [x] **Step 6: Review checkpoint**

Run:

```bash
git status --short --branch
```

Expected: route-keep-alive, router-state, and store tests are uncommitted in the working tree. Do not run `git add` or `git commit` unless the user asks.

## Task 6: Router Outlet KeepAlive Integration

**Files:**
- Modify: `packages/router/src/dom/route-outlet.ts`
- Test: `packages/router/tests/dom/route-outlet-keep-alive.test.ts`
- Test: `packages/router/tests/dom/route-outlet-layout.test.ts`

- [x] **Step 1: Add failing keepAlive outlet tests**

Create `packages/router/tests/dom/route-outlet-keep-alive.test.ts`:

```ts
// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRouterOutlet } from '../../src/dom/route-outlet.js';
import { createRoutes, defineRoutes, navigate, provideRouter } from '../../src/index.js';
import {
  getRouteKeepAliveDiagnosticsForTests,
  setRouteKeepAliveNowForTests,
} from '../../src/route/route-keep-alive.js';
import { resetRouterForTests } from '../../src/route/router-state.js';
import { createTestPage } from '../../src/test/test-pages.js';

describe('createRouterOutlet keepAlive', () => {
  let host: HTMLElement;
  let disposeOutlet: (() => void) | undefined;

  beforeEach(() => {
    resetRouterForTests();
    setRouteKeepAliveNowForTests(() => new Date('2026-05-24T08:00:00'));
    host = document.createElement('main');
    document.body.replaceChildren(host);
    window.history.replaceState(null, '', '/profile');
  });

  afterEach(() => {
    disposeOutlet?.();
    resetRouterForTests();
    setRouteKeepAliveNowForTests(() => new Date());
    document.body.replaceChildren();
  });

  it('preserves local route view state when navigating away and back on the same day', async () => {
    const destroyed = {
      profile: vi.fn(),
      home: vi.fn(),
    };
    const routes = createRoutes();
    const profile = routes.page({
      path: '/profile',
      label: 'Profile',
      page: formPage('profile-draft', destroyed.profile),
      keepAlive: routes.keepAlive.sessionDay(),
    });
    const home = routes.page({
      path: '/',
      label: 'Home',
      page: createTestPage('home', destroyed.home),
    });

    await provideRouter(defineRoutes({ home, profile }));
    disposeOutlet = createRouterOutlet(host);
    await flushRouteOutlet();
    const input = host.querySelector('input');
    expect(input).not.toBeNull();
    input!.value = 'changed draft';

    await navigate('/');
    await flushRouteOutlet();
    await navigate('/profile');
    await flushRouteOutlet();

    expect(host.querySelector('input')?.value).toBe('changed draft');
    expect(destroyed.profile).not.toHaveBeenCalled();
    expect(destroyed.home).toHaveBeenCalledOnce();
  });

  it('does not restore kept-alive views after local day rollover', async () => {
    const destroyed = vi.fn();
    const routes = createRoutes();
    const profile = routes.page({
      path: '/profile',
      label: 'Profile',
      page: formPage('profile-draft', destroyed),
      keepAlive: routes.keepAlive.sessionDay(),
    });
    const home = routes.page({
      path: '/',
      label: 'Home',
      page: createTestPage('home'),
    });

    await provideRouter(defineRoutes({ home, profile }));
    disposeOutlet = createRouterOutlet(host);
    await flushRouteOutlet();
    host.querySelector('input')!.value = 'changed draft';

    await navigate('/');
    await flushRouteOutlet();
    setRouteKeepAliveNowForTests(() => new Date('2026-05-25T00:01:00'));
    await navigate('/profile');
    await flushRouteOutlet();

    expect(host.querySelector('input')?.value).toBe('profile-draft');
    expect(destroyed).toHaveBeenCalledOnce();
  });

  it('does not restore a kept-alive view when current guards block navigation', async () => {
    let allowProfile = true;
    const routes = createRoutes();
    const home = routes.page({
      path: '/',
      label: 'Home',
      page: createTestPage('home'),
    });
    const profile = routes.page({
      path: '/profile',
      label: 'Profile',
      page: formPage('profile-draft'),
      canEnter: () => allowProfile,
      keepAlive: routes.keepAlive.sessionDay(),
    });

    await provideRouter(defineRoutes({ home, profile }));
    disposeOutlet = createRouterOutlet(host);
    await flushRouteOutlet();
    host.querySelector('input')!.value = 'changed draft';
    await navigate('/');
    await flushRouteOutlet();
    allowProfile = false;

    await expect(navigate('/profile')).resolves.toBe(false);
    await flushRouteOutlet();

    expect(host.textContent).toBe('home');
    expect(getRouteKeepAliveDiagnosticsForTests()).toContainEqual(
      expect.objectContaining({
        code: 'VR_KEEP_ALIVE_RESTORE_BLOCKED',
        message: 'KeepAlive restore skipped because current guards blocked route "profile".',
      }),
    );
  });
});

async function flushRouteOutlet(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

function formPage(value: string, destroyed: () => void = () => {}) {
  return {
    createComponent() {
      const input = document.createElement('input');
      input.value = value;

      return {
        node: input,
        ctx: { destroyed },
      };
    },
  };
}
```

- [x] **Step 2: Run the failing keepAlive outlet tests**

Run:

```bash
pnpm --filter @vanrot/router test -- tests/dom/route-outlet-keep-alive.test.ts
```

Expected: FAIL because `createRouterOutlet(...)` always destroys the outgoing route view.

- [x] **Step 3: Implement outlet detach and reattach**

Modify `packages/router/src/dom/route-outlet.ts` imports:

```ts
import { effect, mount, onDestroy, type AppHandle, type ComponentType, type Dispose } from '@vanrot/runtime';
import { readCurrentOutletDepth, runWithOutletDepth } from './route-outlet-context.js';
import {
  createKeepAliveRouteIdentity,
  storeKeepAliveRouteView,
  takeKeepAliveRouteView,
  type KeepAliveRouteView,
} from '../route/route-keep-alive.js';
import { resolveRouteLayout, resolveRoutePage } from '../route/page-loader.js';
import {
  getCurrentRouteChain,
  getRouteDefinitionVersion,
} from '../route/router-state.js';
import { routeKeepAlivePolicyKinds } from '../route/route-types.js';
import type { DefinedRoute, RouteMatch } from '../route/route-types.js';
```

Add this local interface near `RouterOutletOptions`, then replace the `mountedRoute` / `mountedComponent` state:

```ts
interface MountedRouteView {
  identity: string | null;
  route: DefinedRoute;
  handle: AppHandle;
  nodes: Node[];
}
```

```ts
  let mountedView: MountedRouteView | null = null;
```

Replace the route equality check with identity-aware reuse:

```ts
    const identity = createKeepAliveRouteIdentity(match, getRouteDefinitionVersion());

    if (mountedView?.route === match.route && mountedView.identity === identity) {
      return;
    }

    detachOrDestroyMountedView();
    host.replaceChildren();

    const restoredView = restoreMountedView(match);

    if (restoredView !== null) {
      mountedView = restoredView;
      host.replaceChildren(...restoredView.nodes);
      return;
    }
```

Replace `disposeMountedComponent()` with these helpers:

```ts
  function detachOrDestroyMountedView(): void {
    if (mountedView === null) {
      return;
    }

    if (
      mountedView.route.keepAlive.kind !== routeKeepAlivePolicyKinds.sessionDay ||
      mountedView.identity === null
    ) {
      mountedView.handle.destroy();
      mountedView = null;
      return;
    }

    const fragment = document.createDocumentFragment();

    for (const node of mountedView.nodes) {
      fragment.append(node);
    }

    storeKeepAliveRouteView({
      identity: mountedView.identity,
      route: mountedView.route,
      handle: mountedView.handle,
      nodes: mountedView.nodes,
    });
    mountedView = null;
  }

  function restoreMountedView(match: RouteMatch): KeepAliveRouteView | null {
    if (match.route.keepAlive.kind !== routeKeepAlivePolicyKinds.sessionDay) {
      return null;
    }

    return takeKeepAliveRouteView(match, getRouteDefinitionVersion());
  }
```

Replace `disposeMountedComponent();` calls with `detachOrDestroyMountedView();`.

Replace `mountResolvedComponent(...)` with this identity-aware version:

```ts
  function mountResolvedComponent(
    component: ComponentType,
    match: RouteMatch,
    currentVersion: number,
  ): void {
    if (currentVersion !== version) {
      return;
    }

    runWithOutletDepth(depth, () => {
      const handle = mount(component, host);
      const identity = createKeepAliveRouteIdentity(match, getRouteDefinitionVersion());

      mountedView = {
        identity,
        route: match.route,
        handle,
        nodes: Array.from(host.childNodes),
      };
    });
  }
```

Update callers from `mountResolvedComponent(resolvedComponent, match.route, currentVersion)` to:

```ts
mountResolvedComponent(resolvedComponent, match, currentVersion);
```

- [x] **Step 4: Run keepAlive outlet tests**

Run:

```bash
pnpm --filter @vanrot/router test -- tests/dom/route-outlet-keep-alive.test.ts
```

Expected: PASS with same-day view restore, day rollover destroy, and guard-blocked restore diagnostics.

- [x] **Step 5: Add shared layout compatibility coverage**

Append to `packages/router/tests/dom/route-outlet-layout.test.ts` inside the existing nested layout `describe(...)`:

```ts
  it('keeps shared parent layouts mounted while restoring kept-alive leaf views', async () => {
    const destroyed = {
      shop: vi.fn(),
      product: vi.fn(),
      productDetail: vi.fn(),
      cart: vi.fn(),
    };
    const routes = createRoutes();
    const shop = routes.layout({
      path: '/shop',
      label: 'Shop',
      layout: createTestLayout('shop-layout', destroyed.shop),
    });
    const product = shop.layout({
      path: 'product',
      label: 'Products',
      layout: createTestLayout('product-layout', destroyed.product),
    });
    const productDetail = product.page({
      path: ':productId',
      label: 'Product detail',
      page: createTestPage('product-detail-page', destroyed.productDetail),
      keepAlive: routes.keepAlive.sessionDay(),
    });
    const cart = shop.page({
      path: 'cart',
      label: 'Cart',
      page: createTestPage('cart-page', destroyed.cart),
    });

    provideRouter(defineRoutes({ shop, product, productDetail, cart }));
    disposeOutlet = createRouterOutlet(host, { kind: 'router' });
    await flushRouteOutlet();
    await navigate('/shop/cart');
    await flushRouteOutlet();
    await navigate('/shop/product/42');
    await flushRouteOutlet();

    expect(destroyed.shop).not.toHaveBeenCalled();
    expect(destroyed.product).toHaveBeenCalledOnce();
    expect(destroyed.productDetail).not.toHaveBeenCalled();
    expect(host.textContent).toBe('shop-layoutproduct-layoutproduct-detail-page');
  });
```

- [x] **Step 6: Run outlet regression tests**

Run:

```bash
pnpm --filter @vanrot/router test -- tests/dom/route-outlet.test.ts tests/dom/route-outlet-layout.test.ts tests/dom/route-outlet-keep-alive.test.ts
```

Expected: PASS. Existing destroy behavior remains for routes without keepAlive, shared parent layouts still stay mounted during sibling navigation, and kept-alive leaf views restore without destroying local state.

- [x] **Step 7: Review checkpoint**

Run:

```bash
git status --short --branch
```

Expected: route-outlet and keepAlive outlet tests are uncommitted in the working tree. Do not run `git add` or `git commit` unless the user asks.

## Task 7: Full Phase 15D Router Integration Coverage

**Files:**
- Test: `packages/router/tests/route/router-phase-15d-integration.test.ts`
- Modify: `packages/router/src/route/router-state.ts`
- Modify: `packages/router/src/route/route-preload.ts`
- Modify: `packages/router/src/route/route-keep-alive.ts`

- [x] **Step 1: Add failing full-router integration test**

Create `packages/router/tests/route/router-phase-15d-integration.test.ts`:

```ts
// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupRouteLink } from '../../src/dom/route-link.js';
import { createRouterOutlet } from '../../src/dom/route-outlet.js';
import {
  buildRouteBreadcrumbs,
  createRoutes,
  defineRoutes,
  getCurrentMatch,
  navigate,
  provideRouter,
} from '../../src/index.js';
import { getRoutePreloadDiagnosticsForTests } from '../../src/route/route-preload.js';
import { resetRouterForTests } from '../../src/route/router-state.js';
import { createTestLayout, createTestPage } from '../../src/test/test-pages.js';

describe('Phase 15D router integration', () => {
  let host: HTMLElement;
  let disposeOutlet: (() => void) | undefined;

  beforeEach(() => {
    resetRouterForTests();
    host = document.createElement('main');
    document.body.replaceChildren(host);
    window.history.replaceState(null, '', '/shop/product/42?tab=overview');
  });

  afterEach(() => {
    disposeOutlet?.();
    resetRouterForTests();
    document.body.replaceChildren();
  });

  it('combines route-owned links, nested layouts, params, query, guards, redirects, preloading, keepAlive, and breadcrumbs', async () => {
    const loadProductLayout = vi.fn(async () => createTestLayout('product-layout'));
    const loadDetail = vi.fn(async () => draftPage('detail-draft'));
    const loadCart = vi.fn(async () => createTestPage('cart-page'));
    let allowAccount = false;
    const routes = createRoutes();
    const home = routes.page({
      path: '/',
      label: 'Home',
      page: createTestPage('home-page'),
      breadcrumb: routes.breadcrumb.root(),
    });
    const login = routes.page({
      path: '/login',
      label: 'Login',
      page: createTestPage('login-page'),
      query: { returnTo: {} },
    });
    const account = routes.page({
      path: '/account',
      label: 'Account',
      page: createTestPage('account-page'),
      canEnter: () => allowAccount || routes.redirectTo(login, { query: { returnTo: '/account' } }),
    });
    const shop = routes.layout({
      path: '/shop',
      label: 'Shop',
      layout: createTestLayout('shop-layout'),
      breadcrumb: routes.breadcrumb.root(),
    });
    const product = shop.layout({
      path: 'product',
      label: 'Products',
      loadLayout: loadProductLayout,
      breadcrumb: routes.breadcrumb.parent(shop),
    });
    const productIndex = product.page({
      path: '',
      label: 'All products',
      page: createTestPage('product-index'),
    });
    const productDetail = product.page({
      path: ':productId',
      label: 'Product detail',
      loadPage: loadDetail,
      query: { tab: {} },
      preload: routes.preload.intent(),
      keepAlive: routes.keepAlive.sessionDay(),
    });
    const cart = shop.page({
      path: 'cart',
      label: 'Cart',
      loadPage: loadCart,
      preload: routes.preload.intent(),
    });
    const oldCart = routes.redirect({
      path: '/bag',
      label: 'Bag',
      to: cart,
    });
    const route = defineRoutes({
      home,
      login,
      account,
      shop,
      product,
      productIndex,
      productDetail,
      cart,
      oldCart,
    });
    const cartLink = document.createElement('a');

    await provideRouter(route);
    disposeOutlet = createRouterOutlet(host, { kind: 'router' });
    await flushRouter();
    setupRouteLink(cartLink, route.cart);
    cartLink.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await flushRouter();

    expect(loadCart).toHaveBeenCalledOnce();
    expect(getCurrentMatch()?.route).toBe(route.productDetail);
    expect(host.querySelector('input')?.value).toBe('detail-draft');
    host.querySelector('input')!.value = 'changed detail';

    await navigate('/shop/cart');
    await flushRouter();
    await navigate('/shop/product/42?tab=overview');
    await flushRouter();

    expect(host.querySelector('input')?.value).toBe('changed detail');
    expect(buildRouteBreadcrumbs().map((crumb) => crumb.label)).toEqual([
      'Shop',
      'Products',
      'Product detail',
    ]);

    await navigate('/account');
    await flushRouter();

    expect(getCurrentMatch()?.route).toBe(route.login);
    expect(window.location.pathname).toBe('/login');
    expect(window.location.search).toBe('?returnTo=%2Faccount');

    allowAccount = true;
    await navigate('/bag');
    await flushRouter();

    expect(getCurrentMatch()?.route).toBe(route.cart);
    expect(window.location.pathname).toBe('/shop/cart');
    expect(getRoutePreloadDiagnosticsForTests()).toEqual([]);
  });
});

async function flushRouter(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

function draftPage(initialValue: string) {
  return {
    createComponent() {
      const input = document.createElement('input');
      input.value = initialValue;

      return {
        node: input,
        ctx: {},
      };
    },
  };
}
```

- [x] **Step 2: Run the integration test**

Run:

```bash
pnpm --filter @vanrot/router test -- tests/route/router-phase-15d-integration.test.ts
```

Expected: PASS after Tasks 1 through 6. If this fails, fix the smallest implementation mismatch in the touched router module and rerun this exact test before broadening verification.

- [x] **Step 3: Run all router tests**

Run:

```bash
pnpm --filter @vanrot/router test
```

Expected: PASS for all router unit, DOM, and integration tests.

- [x] **Step 4: Run router typecheck**

Run:

```bash
pnpm --filter @vanrot/router typecheck
```

Expected: PASS with route policy types and `route-builder-types.ts` compile-time checks.

- [x] **Step 5: Review checkpoint**

Run:

```bash
git status --short --branch
```

Expected: integration test and any final router fixes are uncommitted in the working tree. Do not run `git add` or `git commit` unless the user asks.

## Task 8: Phase Completion Docs And Verification

**Files:**
- Modify: `docs/superpowers/plans/Phase-15D.md`
- Modify: `docs/superpowers/feature-maturity.md`
- Modify: `docs/superpowers/final-tdd-inventory.md`
- Modify: `docs/vanrot-presentation.html`

- [x] **Step 1: Mark completed plan tasks**

After Tasks 1 through 7 pass, change every completed checkbox in `docs/superpowers/plans/Phase-15D.md` from `- [x]` to `- [x]`. Leave any skipped step unchecked with a short reason directly under that step.

- [x] **Step 2: Update feature maturity ledger**

Modify `docs/superpowers/feature-maturity.md`:

```md
| [x]  | Phase 15 | Router production                           | 15A route contract production, 15B nested layout routing, 15C navigation decisions, and 15D preloading/keepAlive integration are complete | `@vanrot/router` supports normal application routing needs without repeated route string literals in user templates.                                    |
```

Update the `Router preloading` row from `Deferred` to `Production-Ready` with notes that Phase 15D added `routes.preload.intent()`, hover/focus/touch generated link preloading, lazy layout/page chain warming, failure diagnostics, and guard/redirect safety.

Add or update a router keepAlive row if the ledger does not already have one:

```md
| Router keepAlive route views | router | Phase 15D | Route views can be preserved in memory for same-day back navigation | Memory-only same-day route view reuse, guard-before-restore behavior, reset cleanup, diagnostics, and integration tests verified | Production-Ready | Phase 15D added `routes.keepAlive.sessionDay()` for local component state preservation without API data caching. |
```

- [x] **Step 3: Update final TDD inventory**

Add a Phase 15D entry to `docs/superpowers/final-tdd-inventory.md` with these exact coverage bullets:

```md
### Phase 15D Router Preloading And KeepAlive Integration

- Package: `@vanrot/router`
- Public route policy helpers: `routes.preload.none()`, `routes.preload.intent()`, `routes.keepAlive.none()`, `routes.keepAlive.sessionDay()`
- Internal helpers: lazy module cache in `page-loader.ts`, route-chain preloading in `route-preload.ts`, route view identity/store in `route-keep-alive.ts`
- Generated link behavior: hover, focus, and touch intent preload lazy route chains without committing navigation
- Outlet behavior: `keepAlive.sessionDay()` detaches and restores same-day route views after guards allow navigation
- Diagnostics: redirect preload policy, redirect keepAlive policy, preload without lazy target, preload failure, keepAlive identity missing, keepAlive restore blocked
- Verification: focused route tests, jsdom link/outlet tests, full Phase 15D router integration test, router typecheck, and full `pnpm verify`
```

- [x] **Step 4: Update presentation roadmap**

Modify `docs/vanrot-presentation.html` so the roadmap/status slide marks Phase 15 as complete and Phase 16 as the next active production phase. Preserve the existing presentation style and only change the roadmap/status copy needed for the phase status.

- [x] **Step 5: Run phase-doc verification**

Run:

```bash
pnpm verify:phase-docs
```

Expected: PASS. Completed Phase 15 has no unchecked tasks in `docs/superpowers/plans/Phase-15D.md`, the maturity ledger no longer leaves Phase 15 as pending, and the presentation roadmap agrees.

- [x] **Step 6: Run full verification**

Run:

```bash
pnpm verify
```

Expected: PASS for typecheck, all tests, build, size budget, and phase docs.

- [x] **Step 7: Final review checkpoint**

Run:

```bash
git status --short --branch
```

Expected: Phase 15D implementation, tests, and completion docs are uncommitted in the working tree. Do not run `git add` or `git commit` unless the user asks.

## Self-Review

- Spec coverage: Tasks 1 and 2 cover route-owned policy helpers, defaults, redirect safety, source-of-truth boundaries, and diagnostics. Tasks 3 and 4 cover lazy route module preloading on intent without guards, redirects, history, route commits, mounts, or keepAlive entries. Tasks 5 and 6 cover memory-only same-day keepAlive identity, expiry, reset cleanup, guard-before-restore ordering, and route outlet integration. Task 7 covers the required realistic Phase 15 route graph. Task 8 covers completion docs and verification protocol.
- Placeholder scan: The plan uses exact file paths, exact commands, expected command outcomes, concrete test bodies, and concrete implementation snippets. No placeholder sections remain.
- Type consistency: Policy names are `RoutePreloadPolicy`, `RouteKeepAlivePolicy`, `routes.preload.intent()`, and `routes.keepAlive.sessionDay()` throughout. Diagnostics use `routeDiagnosticCodes.*` names and stable `VR_*` values. Internal helpers are consistently named `preloadRoutePath(...)`, `clearRoutePreloadStateForTests()`, `createKeepAliveRouteIdentity(...)`, `storeKeepAliveRouteView(...)`, and `takeKeepAliveRouteView(...)`.
