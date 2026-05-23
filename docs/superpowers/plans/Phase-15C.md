# Phase 15C Navigation Decisions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. This repository forbids subagent-driven Superpowers workflows and user-owned git means every task ends with a review checkpoint, not an automatic commit.

**Goal:** Make `@vanrot/router` production-ready for guarded navigation, redirect routes, async navigation cancellation, and strict route graph diagnostics without adding new template elements or repeated route string literals.

**Architecture:** Keep `src/routes.ts` as the single route source of truth. Extend the existing Phase 15A/15B route builder with `canEnter`, `redirect(...)`, and `redirectTo(...)`, then route every framework-owned navigation path through one internal decision pipeline before committing router state. Keep the public API small: existing primitives remain primary, and `navigate(...)`/`provideRouter(...)` may return a `Promise<boolean>` for guarded async completion while still being safe to ignore.

**Tech Stack:** TypeScript, Vitest, jsdom, `@vanrot/runtime` signals/effects, `@vanrot/router`, existing route diagnostics, existing compiler-generated `<vr route.name />` link lowering.

---

## Preconditions

Phase 15A and Phase 15B must be complete before executing this plan.

Required existing surface:

- `createRoutes()` creates route refs without parent-name string literals.
- `defineRoutes({ ... })` normalizes parent/child route refs in registry order.
- Route kinds currently include page and layout.
- `matchRouteChain(...)` returns a parent-to-leaf route chain.
- `navigate(...)`, `provideRouter(...)`, `popstate`, and `setupRouteLink(...)` already update the same router state.
- `buildRouteUrl(...)` already owns param/query URL generation.
- Route diagnostics already use stable `VR_*` code constants and docs hooks.

## File Structure

- `packages/router/src/route/route-types.ts`: add redirect route kind, guard types, guard context, redirect target types, redirect route definitions, and route decision result types.
- `packages/router/src/route/create-routes.ts`: add root and child `redirect(...)` builders plus `redirectTo(...)`.
- `packages/router/src/route/define-routes.ts`: normalize redirect refs, validate redirect shapes, duplicate full paths, missing redirect targets, redirect loops, invalid `canEnter`, and redirect params/query.
- `packages/router/src/route/route-diagnostic-codes.ts`: add Phase 15C diagnostic code constants.
- `packages/router/src/route/navigation-decisions.ts`: resolve redirect routes, run guards parent-to-child and left-to-right, normalize guard results, detect guard redirect loops, and ignore stale async decisions through a navigation id callback.
- `packages/router/src/route/router-state.ts`: use `navigation-decisions.ts` for initial load, `navigate(...)`, and `popstate`; commit only accepted navigation results; update browser history after decisions.
- `packages/router/src/dom/route-link.ts`: keep href generation as-is but let normal clicks call the guarded `navigate(...)` pipeline.
- `packages/router/src/index.ts` and `packages/router/src/internal.ts`: export only public route types/helpers needed by application code and compiler-generated code.
- `packages/router/tests/route/define-routes-redirect.test.ts`: route builder redirect and strict graph diagnostics.
- `packages/router/tests/route/navigation-decisions.test.ts`: focused decision-pipeline unit tests for redirects, guard ordering, async cancellation, invalid guard values, and loops.
- `packages/router/tests/route/router-state-navigation.test.ts`: integration tests for guarded `provideRouter(...)`, `navigate(...)`, and browser back/forward.
- `packages/router/tests/dom/route-link-navigation.test.ts`: guarded link click integration tests.
- `packages/router/tests/route-builder-types.ts`: compile-time builder API tests for `canEnter`, `redirect(...)`, and page/layout/redirect boundaries.
- `docs/superpowers/final-tdd-inventory.md`: update only in the completion task after implementation and verification pass.
- `docs/superpowers/feature-maturity.md`: update only in the completion task after implementation and verification pass.
- `docs/vanrot-presentation.html`: update only in the completion task after implementation and verification pass.

## Task 1: Guard And Redirect Builder Surface

**Files:**
- Modify: `packages/router/src/route/route-types.ts`
- Modify: `packages/router/src/route/create-routes.ts`
- Modify: `packages/router/src/index.ts`
- Modify: `packages/router/tests/route-builder-types.ts`
- Test: `packages/router/tests/route/define-routes-redirect.test.ts`

- [x] **Step 1: Add failing redirect builder tests**

Create `packages/router/tests/route/define-routes-redirect.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { createRoutes, defineRoutes } from '../../src/index.js';
import { createTestLayout, createTestPage } from '../../src/test/test-pages.js';

const routePath = {
  login: '/login',
  account: '/account',
  billing: 'billing',
  oldBilling: '/billing',
  shop: '/shop',
  products: 'products',
  shopIndex: '',
} as const;

const routeLabel = {
  login: 'Login',
  account: 'Account',
  billing: 'Billing',
  oldBilling: 'Old billing',
  shop: 'Shop',
  products: 'Products',
  shopIndex: 'Shop index',
} as const;

describe('defineRoutes redirect and guard route graph', () => {
  it('creates root and child redirect routes without render targets', () => {
    const routes = createRoutes();
    const login = routes.page({
      path: routePath.login,
      label: routeLabel.login,
      page: createTestPage('login'),
    });
    const account = routes.layout({
      path: routePath.account,
      label: routeLabel.account,
      layout: createTestLayout('account'),
      canEnter: () => login,
    });
    const billing = account.page({
      path: routePath.billing,
      label: routeLabel.billing,
      page: createTestPage('billing'),
    });
    const oldBilling = routes.redirect({
      path: routePath.oldBilling,
      label: routeLabel.oldBilling,
      to: billing,
    });
    const shop = routes.layout({
      path: routePath.shop,
      label: routeLabel.shop,
      layout: createTestLayout('shop'),
    });
    const products = shop.page({
      path: routePath.products,
      label: routeLabel.products,
      page: createTestPage('products'),
    });
    const shopIndex = shop.redirect({
      path: routePath.shopIndex,
      label: routeLabel.shopIndex,
      to: products,
    });

    const route = defineRoutes({ login, account, billing, oldBilling, shop, products, shopIndex });

    expect(route.oldBilling).toMatchObject({
      key: 'oldBilling',
      kind: 'redirect',
      path: routePath.oldBilling,
      fullPath: routePath.oldBilling,
      redirect: { to: route.billing },
    });
    expect(route.shopIndex).toMatchObject({
      key: 'shopIndex',
      kind: 'redirect',
      path: routePath.shopIndex,
      fullPath: routePath.shop,
      parent: route.shop,
      redirect: { to: route.products },
    });
    expect(route.oldBilling.page).toBeUndefined();
    expect(route.oldBilling.layout).toBeUndefined();
    expect(route.shop.children.map((child) => child.key)).toEqual(['products', 'shopIndex']);
  });

  it('creates structured redirect targets with params and query input', () => {
    const routes = createRoutes();
    const product = routes.page({
      path: '/products/:productId',
      label: 'Product',
      page: createTestPage('product'),
      query: { tab: {} },
    });

    const target = routes.redirectTo(product, {
      params: { productId: '42' },
      query: { tab: 'details' },
    });

    expect(target).toEqual({
      kind: 'route-target',
      route: product,
      input: {
        params: { productId: '42' },
        query: { tab: 'details' },
      },
    });
  });
});
```

- [x] **Step 2: Run the failing redirect builder tests**

Run:

```bash
pnpm --filter @vanrot/router test -- tests/route/define-routes-redirect.test.ts
```

Expected: FAIL because `routes.redirect(...)`, `RouteKind: 'redirect'`, `canEnter`, and `routes.redirectTo(...)` do not exist.

- [x] **Step 3: Extend route types**

Modify `packages/router/src/route/route-types.ts` with these additions and replacements:

```ts
export type RouteKind = 'page' | 'layout' | 'redirect';

export interface RouteGuardContext {
  readonly to: RouteMatch;
  readonly from: RouteMatch | null;
}

export type RouteRedirectTarget =
  | RouteRef
  | {
      readonly kind: 'route-target';
      readonly route: RouteRef;
      readonly input: RouteUrlInput;
    };

export type RouteGuardResult =
  | boolean
  | RouteRedirectTarget
  | Promise<boolean | RouteRedirectTarget>;

export type RouteGuard = (context: RouteGuardContext) => RouteGuardResult;
export type RouteGuardInput = RouteGuard | readonly RouteGuard[];

export interface RouteDefinitionBase {
  path: string;
  label: string;
  nav?: RouteNavMetadata;
  query?: RouteQueryDefinitionMap;
  breadcrumb?: RouteBreadcrumbDefinition;
  canEnter?: RouteGuardInput;
}

export interface RedirectRouteDefinition extends RouteDefinitionBase {
  kind?: 'redirect';
  to: RouteRedirectTarget;
  params?: (params: RouteParams) => RouteParams;
  queryInput?: (query: Record<string, string | string[]>) => RouteQuery;
  page?: never;
  loadPage?: never;
  layout?: never;
  loadLayout?: never;
}

export type RouteDefinition =
  | (RouteDefinitionBase & {
      kind?: 'page' | 'layout';
      page?: RoutePageModule;
      loadPage?: RoutePageLoader;
      layout?: RouteLayoutModule;
      loadLayout?: RouteLayoutLoader;
    })
  | RedirectRouteDefinition;

export type RouteInput = Record<string, RouteDefinition | RouteRef>;

export interface RouteRef {
  readonly kind: RouteKind;
  readonly definition: RouteDefinition;
  readonly parent?: RouteRef;
  readonly children: RouteRef[];
  page(definition: PageRouteDefinition): RouteRef;
  layout(definition: LayoutRouteDefinition): RouteRef;
  redirect(definition: RedirectRouteDefinition): RouteRef;
}

export type DefinedRoute<Key extends string = string> = RouteDefinition & {
  key: Key;
  kind: RouteKind;
  ref?: RouteRef;
  fullPath: string;
  parent?: DefinedRoute;
  children: DefinedRoute[];
  breadcrumbParent?: DefinedRoute;
  redirect?: {
    to: DefinedRoute;
    input?: RouteUrlInput;
    params?: (params: RouteParams) => RouteParams;
    queryInput?: (query: Record<string, string | string[]>) => RouteQuery;
  };
  diagnostics: RouteDiagnostic[];
};
```

- [x] **Step 4: Extend `createRoutes()`**

Modify `packages/router/src/route/create-routes.ts` so `RouteBuilder` and child refs expose redirects:

```ts
import type {
  LayoutRouteDefinition,
  PageRouteDefinition,
  RedirectRouteDefinition,
  RouteBreadcrumbDefinition,
  RouteDefinition,
  RouteKind,
  RouteNavMetadata,
  RouteRef,
  RouteRedirectTarget,
  RouteUrlInput,
} from './route-types.js';

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
}
```

Add the root builder methods:

```ts
redirect(definition) {
  return createRouteRef('redirect', definition, parent);
},
redirectTo(route, input = {}) {
  return { kind: 'route-target', route, input };
},
```

Add the child ref method in `createRouteRef(...)`:

```ts
redirect(childDefinition: RedirectRouteDefinition) {
  return createRouteRef('redirect', childDefinition, routeRef);
},
```

- [x] **Step 5: Export new public types**

Modify `packages/router/src/index.ts` to export the new public types:

```ts
export type {
  RedirectRouteDefinition,
  RouteGuard,
  RouteGuardContext,
  RouteGuardInput,
  RouteGuardResult,
  RouteRedirectTarget,
} from './route/route-types.js';
```

- [x] **Step 6: Add compile-time builder boundary tests**

Append to `packages/router/tests/route-builder-types.ts`:

```ts
const login = routes.page({
  path: '/login',
  label: 'Login',
  page: TestPage,
});

routes.page({
  path: '/account',
  label: 'Account',
  page: TestPage,
  canEnter: () => login,
});

routes.layout({
  path: '/admin',
  label: 'Admin',
  layout: TestLayout,
  canEnter: [
    () => true,
    () => routes.redirectTo(login, { query: { returnTo: '/admin' } }),
  ],
});

routes.redirect({
  path: '/old-login',
  label: 'Old login',
  to: login,
});

// @ts-expect-error redirect routes must not render pages
routes.redirect({
  path: '/bad',
  label: 'Bad',
  to: login,
  page: TestPage,
});

// @ts-expect-error page routes do not accept redirect targets
routes.page({
  path: '/bad-page',
  label: 'Bad page',
  page: TestPage,
  to: login,
});
```

- [x] **Step 7: Verify Task 1 passes**

Run:

```bash
pnpm --filter @vanrot/router test -- tests/route/define-routes-redirect.test.ts
pnpm --filter @vanrot/router typecheck
```

Expected: both commands PASS.

- [x] **Step 8: Review checkpoint**

Run:

```bash
git status --short --branch
```

Expected: route type, builder, export, and test files are uncommitted in the working tree. Do not run `git add` or `git commit` unless the user asks.

## Task 2: Strict Redirect Graph Diagnostics

**Files:**
- Modify: `packages/router/src/route/route-diagnostic-codes.ts`
- Modify: `packages/router/src/route/define-routes.ts`
- Modify: `packages/router/tests/route/route-diagnostics.test.ts`
- Test: `packages/router/tests/route/define-routes-redirect.test.ts`

- [x] **Step 1: Add failing diagnostic cases**

Append to `packages/router/tests/route/define-routes-redirect.test.ts`:

```ts
it('fails when two non-index routes normalize to the same full path', () => {
  const routes = createRoutes();
  const shop = routes.page({
    path: '/shop',
    label: 'Shop',
    page: createTestPage('shop'),
  });
  const duplicateShop = routes.page({
    path: '/shop',
    label: 'Duplicate shop',
    page: createTestPage('duplicate-shop'),
  });

  expect(() => defineRoutes({ shop, duplicateShop })).toThrow(
    'VR_ROUTE_DUPLICATE_PATH: Route path "/shop" is already used by "shop".',
  );
});

it('fails when a redirect target is not returned from defineRoutes()', () => {
  const routes = createRoutes();
  const login = routes.page({
    path: '/login',
    label: 'Login',
    page: createTestPage('login'),
  });
  const oldLogin = routes.redirect({
    path: '/old-login',
    label: 'Old login',
    to: login,
  });

  expect(() => defineRoutes({ oldLogin })).toThrow(
    'VR_REDIRECT_TARGET_MISSING: Redirect route "oldLogin" targets a route that is not defined.',
  );
});

it('fails when redirect routes form a loop', () => {
  const routes = createRoutes();
  const first = routes.redirect({
    path: '/first',
    label: 'First',
    to: routes.redirectTo({} as never),
  });
  const second = routes.redirect({
    path: '/second',
    label: 'Second',
    to: first,
  });
  (first.definition as { to: unknown }).to = second;

  expect(() => defineRoutes({ first, second })).toThrow(
    'VR_REDIRECT_LOOP: Redirect route "first" creates a redirect loop.',
  );
});

it('fails when canEnter is not a function or function array', () => {
  expect(() =>
    defineRoutes({
      account: {
        path: '/account',
        label: 'Account',
        page: createTestPage('account'),
        canEnter: true as never,
      },
    }),
  ).toThrow('VR_ROUTE_INVALID_GUARD: Route "account" canEnter must be a function or function array.');
});

it('fails when a redirect route declares a render target', () => {
  const routes = createRoutes();
  const login = routes.page({
    path: '/login',
    label: 'Login',
    page: createTestPage('login'),
  });

  expect(() =>
    defineRoutes({
      login,
      badRedirect: {
        kind: 'redirect',
        path: '/bad',
        label: 'Bad redirect',
        to: login,
        page: createTestPage('bad'),
      },
    }),
  ).toThrow('VR_REDIRECT_HAS_RENDER_TARGET: Redirect route "badRedirect" must not define page, loadPage, layout, or loadLayout.');
});
```

- [x] **Step 2: Add failing diagnostic code source test**

Append the new codes to the expected array in `packages/router/tests/route/route-diagnostics.test.ts`:

```ts
'VR_REDIRECT_HAS_RENDER_TARGET',
'VR_REDIRECT_HAS_CHILDREN',
'VR_REDIRECT_TARGET_MISSING',
'VR_REDIRECT_LOOP',
'VR_ROUTE_INVALID_GUARD',
'VR_ROUTE_INVALID_GUARD_RESULT',
'VR_GUARD_REDIRECT_TARGET_MISSING',
'VR_GUARD_REDIRECT_LOOP',
```

- [x] **Step 3: Run failing diagnostic tests**

Run:

```bash
pnpm --filter @vanrot/router test -- tests/route/define-routes-redirect.test.ts tests/route/route-diagnostics.test.ts
```

Expected: FAIL because Phase 15C diagnostic codes and validations do not exist.

- [x] **Step 4: Add Phase 15C diagnostic codes**

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
} as const;
```

- [x] **Step 5: Validate redirect graph shape in `defineRoutes(...)`**

Modify `packages/router/src/route/define-routes.ts` so `defineRoutes(...)` resolves redirect targets after all route refs have been normalized:

```ts
function normalizeRouteRef(
  key: string,
  ref: RouteRef,
  routeByRef: Map<RouteRef, DefinedRoute>,
  refToKey: Map<RouteRef, string>,
): DefinedRoute {
  const parent = resolveParentRoute(key, ref, routeByRef, refToKey);
  const diagnostics: RouteDiagnostic[] = [];
  const route: DefinedRoute = {
    ...ref.definition,
    key,
    kind: ref.kind,
    ref,
    path: ref.definition.path,
    fullPath: normalizeRoutePath(ref.definition.path, parent),
    children: [],
    diagnostics,
    ...(parent === undefined ? {} : { parent }),
  };

  validateRenderTarget(key, route, diagnostics);

  return route;
}

function linkRedirectTargets(
  routeRecords: Array<{ input: RouteInput[string]; route: DefinedRoute }>,
  routeByRef: Map<RouteRef, DefinedRoute>,
): void {
  for (const record of routeRecords) {
    const definition = isRouteRef(record.input) ? record.input.definition : record.input;

    if (record.route.kind !== 'redirect') {
      continue;
    }

    const target = normalizeRedirectTarget(record.route, definition.to, routeByRef);
    record.route.redirect = {
      to: target.route,
      input: target.input,
      params: definition.params,
      queryInput: definition.queryInput,
    };
  }
}

function normalizeRedirectTarget(
  route: DefinedRoute,
  target: RouteRedirectTarget,
  routeByRef: Map<RouteRef, DefinedRoute>,
): { route: DefinedRoute; input?: RouteUrlInput } {
  const targetRef = isStructuredRouteTarget(target) ? target.route : target;
  const definedTarget = routeByRef.get(targetRef);

  if (definedTarget !== undefined) {
    return {
      route: definedTarget,
      ...(isStructuredRouteTarget(target) ? { input: target.input } : {}),
    };
  }

  throwRouteDiagnostic(
    routeDiagnosticCodes.redirectTargetMissing,
    `Redirect route "${route.key}" targets a route that is not defined.`,
    'Return the redirect target from defineRoutes({ ... }).',
    'router/routes#redirect-targets',
  );
}
```

Add guard clauses to `validateRouteGraph(...)`:

```ts
validateDuplicateFullPaths(routeRecords.map((record) => record.route));
validateCanEnter(route);

if (route.kind === 'redirect') {
  validateRedirectRoute(route);
  continue;
}
```

Add these focused validators in the same file:

```ts
function validateDuplicateFullPaths(routes: DefinedRoute[]): void {
  const usedPaths = new Map<string, DefinedRoute>();

  for (const route of routes) {
    const firstRoute = usedPaths.get(route.fullPath);

    if (firstRoute !== undefined && route.path !== '') {
      throwRouteDiagnostic(
        routeDiagnosticCodes.duplicatePath,
        `Route path "${route.fullPath}" is already used by "${firstRoute.key}".`,
        `Give "${route.key}" a different path.`,
        'router/routes#duplicate-paths',
      );
    }

    usedPaths.set(route.fullPath, route);
  }
}

function validateRedirectRoute(route: DefinedRoute): void {
  if (route.page !== undefined || route.loadPage !== undefined || route.layout !== undefined || route.loadLayout !== undefined) {
    throwRouteDiagnostic(
      routeDiagnosticCodes.redirectHasRenderTarget,
      `Redirect route "${route.key}" must not define page, loadPage, layout, or loadLayout.`,
      `Remove the render target from "${route.key}" or change it to routes.page(...) or routes.layout(...).`,
      'router/routes#redirect-routes',
    );
  }

  if (route.children.length > 0) {
    throwRouteDiagnostic(
      routeDiagnosticCodes.redirectHasChildren,
      `Redirect route "${route.key}" must not own child routes.`,
      `Move child routes under a layout route instead of "${route.key}".`,
      'router/routes#redirect-routes',
    );
  }
}

function validateCanEnter(route: DefinedRoute): void {
  if (route.canEnter === undefined) {
    return;
  }

  const guards = Array.isArray(route.canEnter) ? route.canEnter : [route.canEnter];

  if (guards.every((guard) => typeof guard === 'function')) {
    return;
  }

  throwRouteDiagnostic(
    routeDiagnosticCodes.invalidGuard,
    `Route "${route.key}" canEnter must be a function or function array.`,
    `Replace canEnter on "${route.key}" with a guard function or an array of guard functions.`,
    'router/routes#guards',
  );
}
```

- [x] **Step 6: Detect redirect loops**

Add loop validation after `linkRedirectTargets(...)`:

```ts
function validateRedirectLoops(routes: DefinedRoute[]): void {
  for (const route of routes) {
    if (route.kind !== 'redirect') {
      continue;
    }

    const visited = new Set<DefinedRoute>();
    let next: DefinedRoute | undefined = route;

    while (next?.kind === 'redirect') {
      if (visited.has(next)) {
        throwRouteDiagnostic(
          routeDiagnosticCodes.redirectLoop,
          `Redirect route "${route.key}" creates a redirect loop.`,
          'Point one redirect in the chain at a page or layout route.',
          'router/routes#redirect-loops',
        );
      }

      visited.add(next);
      next = next.redirect?.to;
    }
  }
}
```

- [x] **Step 7: Verify Task 2 passes**

Run:

```bash
pnpm --filter @vanrot/router test -- tests/route/define-routes-redirect.test.ts tests/route/route-diagnostics.test.ts
```

Expected: PASS.

- [x] **Step 8: Review checkpoint**

Run:

```bash
git status --short --branch
```

Expected: diagnostic code, define-routes, and tests are uncommitted in the working tree. Do not run `git add` or `git commit` unless the user asks.

## Task 3: Internal Navigation Decision Pipeline

**Files:**
- Create: `packages/router/src/route/navigation-decisions.ts`
- Modify: `packages/router/src/internal.ts`
- Test: `packages/router/tests/route/navigation-decisions.test.ts`

- [x] **Step 1: Add failing navigation decision tests**

Create `packages/router/tests/route/navigation-decisions.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { createRoutes, defineRoutes } from '../../src/index.js';
import { resolveNavigationDecision } from '../../src/route/navigation-decisions.js';
import { createTestLayout, createTestPage } from '../../src/test/test-pages.js';

function createGuardedRouteTable() {
  const calls: string[] = [];
  const routes = createRoutes();
  const login = routes.page({ path: '/login', label: 'Login', page: createTestPage('login') });
  const home = routes.page({ path: '/', label: 'Home', page: createTestPage('home') });
  const account = routes.layout({
    path: '/account',
    label: 'Account',
    layout: createTestLayout('account'),
    canEnter: ({ to }) => {
      calls.push(`account:${to.path}`);
      return true;
    },
  });
  const billing = account.page({
    path: 'billing',
    label: 'Billing',
    page: createTestPage('billing'),
    canEnter: [
      () => {
        calls.push('billing:first');
        return true;
      },
      () => {
        calls.push('billing:second');
        return routes.redirectTo(login, { query: { returnTo: '/account/billing' } });
      },
    ],
  });

  return {
    calls,
    route: defineRoutes({ home, login, account, billing }),
  };
}

describe('navigation decisions', () => {
  it('runs layout and page guards in parent-to-child and left-to-right order', async () => {
    const { calls, route } = createGuardedRouteTable();

    const decision = await resolveNavigationDecision({
      routes: route,
      path: '/account/billing',
      from: null,
      navigationId: 1,
      isCurrentNavigation: () => true,
    });

    expect(decision).toMatchObject({
      kind: 'redirect',
      path: '/login?returnTo=%2Faccount%2Fbilling',
      replace: true,
    });
    expect(calls).toEqual(['account:/account/billing', 'billing:first', 'billing:second']);
  });

  it('blocks navigation when a guard returns false', async () => {
    const routes = createRoutes();
    const home = routes.page({ path: '/', label: 'Home', page: createTestPage('home') });
    const account = routes.page({
      path: '/account',
      label: 'Account',
      page: createTestPage('account'),
      canEnter: () => false,
    });
    const route = defineRoutes({ home, account });

    const decision = await resolveNavigationDecision({
      routes: route,
      path: '/account',
      from: { route: route.home, params: {}, query: {}, path: '/' },
      navigationId: 1,
      isCurrentNavigation: () => true,
    });

    expect(decision).toEqual({ kind: 'blocked' });
  });

  it('ignores stale async guard results', async () => {
    let allowAccount!: (value: boolean) => void;
    const routes = createRoutes();
    const home = routes.page({ path: '/', label: 'Home', page: createTestPage('home') });
    const account = routes.page({
      path: '/account',
      label: 'Account',
      page: createTestPage('account'),
      canEnter: () => new Promise<boolean>((resolve) => {
        allowAccount = resolve;
      }),
    });
    const route = defineRoutes({ home, account });

    const decisionPromise = resolveNavigationDecision({
      routes: route,
      path: '/account',
      from: { route: route.home, params: {}, query: {}, path: '/' },
      navigationId: 1,
      isCurrentNavigation: (navigationId) => navigationId === 2,
    });

    allowAccount(true);

    await expect(decisionPromise).resolves.toEqual({ kind: 'stale' });
  });

  it('resolves redirect routes to their final target', async () => {
    const routes = createRoutes();
    const billing = routes.page({
      path: '/account/billing',
      label: 'Billing',
      page: createTestPage('billing'),
    });
    const oldBilling = routes.redirect({ path: '/billing', label: 'Old billing', to: billing });
    const route = defineRoutes({ billing, oldBilling });

    const decision = await resolveNavigationDecision({
      routes: route,
      path: '/billing',
      from: null,
      navigationId: 1,
      isCurrentNavigation: () => true,
    });

    expect(decision).toMatchObject({
      kind: 'redirect',
      path: '/account/billing',
      replace: true,
    });
  });

  it('throws when a guard returns an invalid value', async () => {
    const routes = createRoutes();
    const account = routes.page({
      path: '/account',
      label: 'Account',
      page: createTestPage('account'),
      canEnter: () => 'not-a-guard-result' as never,
    });
    const route = defineRoutes({ account });

    await expect(
      resolveNavigationDecision({
        routes: route,
        path: '/account',
        from: null,
        navigationId: 1,
        isCurrentNavigation: () => true,
      }),
    ).rejects.toThrow('VR_ROUTE_INVALID_GUARD_RESULT: Guard returned an unsupported navigation result.');
  });
});
```

- [x] **Step 2: Run the failing navigation decision tests**

Run:

```bash
pnpm --filter @vanrot/router test -- tests/route/navigation-decisions.test.ts
```

Expected: FAIL because `navigation-decisions.ts` does not exist.

- [x] **Step 3: Create decision pipeline types and entry point**

Create `packages/router/src/route/navigation-decisions.ts`:

```ts
import { isRouteRef } from './create-routes.js';
import { buildRouteUrl } from './url-builder.js';
import { matchRouteChain } from './match-route-chain.js';
import { routeDiagnosticCodes } from './route-diagnostic-codes.js';
import type {
  DefinedRoute,
  DefinedRouteTable,
  RouteChainMatch,
  RouteGuardContext,
  RouteGuardResult,
  RouteMatch,
  RouteRef,
  RouteRedirectTarget,
  RouteUrlInput,
} from './route-types.js';

export interface NavigationDecisionInput {
  routes: DefinedRouteTable;
  path: string;
  from: RouteMatch | null;
  navigationId: number;
  isCurrentNavigation(navigationId: number): boolean;
}

export type NavigationDecision =
  | { kind: 'commit'; match: RouteChainMatch; path: string; replace: boolean }
  | { kind: 'redirect'; path: string; replace: boolean }
  | { kind: 'blocked' }
  | { kind: 'stale' };

export async function resolveNavigationDecision(
  input: NavigationDecisionInput,
): Promise<NavigationDecision> {
  const match = matchRouteChain(input.routes, input.path);

  if (match === null) {
    throw new Error(`No Vanrot route matches "${input.path}".`);
  }

  const redirectDecision = resolveRedirectRoute(match);

  if (redirectDecision !== null) {
    return redirectDecision;
  }

  const guardDecision = await runGuardChain(input, match);

  if (!input.isCurrentNavigation(input.navigationId)) {
    return { kind: 'stale' };
  }

  if (guardDecision !== null) {
    return guardDecision;
  }

  return { kind: 'commit', match, path: input.path, replace: false };
}
```

- [x] **Step 4: Resolve redirect routes**

Add redirect helpers to `navigation-decisions.ts`:

```ts
function resolveRedirectRoute(match: RouteChainMatch): NavigationDecision | null {
  const leaf = match.chain[match.chain.length - 1]?.route;

  if (leaf?.kind !== 'redirect') {
    return null;
  }

  const redirect = leaf.redirect;

  if (redirect === undefined) {
    throw new Error(`${routeDiagnosticCodes.redirectTargetMissing}: Redirect route "${leaf.key}" has no target.`);
  }

  const input = buildRedirectInput(redirect.input, redirect.params?.(match.params), redirect.queryInput?.(match.query));

  return {
    kind: 'redirect',
    path: buildRouteUrl(redirect.to, input),
    replace: true,
  };
}

function buildRedirectInput(
  baseInput: RouteUrlInput | undefined,
  params: RouteUrlInput['params'],
  query: RouteUrlInput['query'],
): RouteUrlInput {
  return {
    params: { ...(baseInput?.params ?? {}), ...(params ?? {}) },
    query: { ...(baseInput?.query ?? {}), ...(query ?? {}) },
  };
}
```

- [x] **Step 5: Run guard chains**

Add guard execution helpers to `navigation-decisions.ts`:

```ts
async function runGuardChain(
  input: NavigationDecisionInput,
  match: RouteChainMatch,
): Promise<NavigationDecision | null> {
  const context: RouteGuardContext = {
    to: match.chain[match.chain.length - 1]!,
    from: input.from,
  };

  for (const routeMatch of match.chain) {
    const guards = normalizeGuards(routeMatch.route);

    for (const guard of guards) {
      const result = await guard(context);

      if (!input.isCurrentNavigation(input.navigationId)) {
        return { kind: 'stale' };
      }

      const decision = normalizeGuardResult(result, input.routes);

      if (decision === null) {
        continue;
      }

      return decision;
    }
  }

  return null;
}

function normalizeGuards(route: DefinedRoute): Array<(context: RouteGuardContext) => RouteGuardResult> {
  if (route.canEnter === undefined) {
    return [];
  }

  return Array.isArray(route.canEnter) ? [...route.canEnter] : [route.canEnter];
}

function normalizeGuardResult(
  result: unknown,
  routes: DefinedRouteTable,
): NavigationDecision | null {
  if (result === true) {
    return null;
  }

  if (result === false) {
    return { kind: 'blocked' };
  }

  if (isStructuredRouteTarget(result)) {
    const route = resolveGuardTarget(result.route, routes);

    return {
      kind: 'redirect',
      path: buildRouteUrl(route, result.input),
      replace: true,
    };
  }

  if (isRouteRef(result)) {
    const route = resolveGuardTarget(result, routes);

    return {
      kind: 'redirect',
      path: buildRouteUrl(route, {}),
      replace: true,
    };
  }

  throw new Error(
    `${routeDiagnosticCodes.invalidGuardResult}: Guard returned an unsupported navigation result.`,
  );
}

function isStructuredRouteTarget(
  value: unknown,
): value is Extract<RouteRedirectTarget, { kind: 'route-target' }> {
  return typeof value === 'object' && value !== null && 'kind' in value && value.kind === 'route-target';
}

function resolveGuardTarget(target: RouteRef, routes: DefinedRouteTable): DefinedRoute {
  for (const route of Object.values(routes)) {
    if (route.ref === target) {
      return route;
    }
  }

  throw new Error(
    `${routeDiagnosticCodes.guardRedirectTargetMissing}: Guard returned a route that is not defined.`,
  );
}
```

- [x] **Step 6: Verify Task 3 passes**

Run:

```bash
pnpm --filter @vanrot/router test -- tests/route/navigation-decisions.test.ts
```

Expected: PASS.

- [x] **Step 7: Review checkpoint**

Run:

```bash
git status --short --branch
```

Expected: navigation decision implementation and tests are uncommitted in the working tree. Do not run `git add` or `git commit` unless the user asks.

## Task 4: Router State Integration And Async Cancellation

**Files:**
- Modify: `packages/router/src/route/router-state.ts`
- Test: `packages/router/tests/route/router-state-navigation.test.ts`
- Test: `packages/router/tests/route/router-state.test.ts`
- Test: `packages/router/tests/route/router-state-layout.test.ts`

- [x] **Step 1: Add failing router state navigation tests**

Create `packages/router/tests/route/router-state-navigation.test.ts`:

```ts
// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest';
import { createRoutes, defineRoutes } from '../../src/index.js';
import {
  getCurrentMatch,
  navigate,
  provideRouter,
  resetRouterForTests,
} from '../../src/route/router-state.js';
import { createTestPage } from '../../src/test/test-pages.js';

describe('router state navigation decisions', () => {
  beforeEach(() => {
    resetRouterForTests();
    window.history.replaceState(null, '', '/');
  });

  it('blocks navigation and keeps the current active route', async () => {
    const routes = createRoutes();
    const home = routes.page({ path: '/', label: 'Home', page: createTestPage('home') });
    const account = routes.page({
      path: '/account',
      label: 'Account',
      page: createTestPage('account'),
      canEnter: () => false,
    });
    const route = defineRoutes({ home, account });

    await provideRouter(route);
    const didNavigate = await navigate('/account');

    expect(didNavigate).toBe(false);
    expect(getCurrentMatch()?.route).toBe(route.home);
    expect(window.location.pathname).toBe('/');
  });

  it('redirects guarded navigation and replaces history', async () => {
    const routes = createRoutes();
    const login = routes.page({ path: '/login', label: 'Login', page: createTestPage('login') });
    const account = routes.page({
      path: '/account',
      label: 'Account',
      page: createTestPage('account'),
      canEnter: () => routes.redirectTo(login, { query: { returnTo: '/account' } }),
    });
    const route = defineRoutes({ login, account });

    await provideRouter(route);
    const didNavigate = await navigate('/account');

    expect(didNavigate).toBe(true);
    expect(getCurrentMatch()?.route).toBe(route.login);
    expect(window.location.pathname).toBe('/login');
    expect(window.location.search).toBe('?returnTo=%2Faccount');
  });

  it('uses redirect routes during initial setup', async () => {
    const routes = createRoutes();
    const billing = routes.page({
      path: '/account/billing',
      label: 'Billing',
      page: createTestPage('billing'),
    });
    const oldBilling = routes.redirect({ path: '/billing', label: 'Old billing', to: billing });
    const route = defineRoutes({ billing, oldBilling });

    window.history.replaceState(null, '', '/billing');
    await provideRouter(route);

    expect(getCurrentMatch()?.route).toBe(route.billing);
    expect(window.location.pathname).toBe('/account/billing');
  });

  it('ignores late async guard results when a newer navigation wins', async () => {
    let allowAccount!: (value: boolean) => void;
    const routes = createRoutes();
    const home = routes.page({ path: '/', label: 'Home', page: createTestPage('home') });
    const shop = routes.page({ path: '/shop', label: 'Shop', page: createTestPage('shop') });
    const account = routes.page({
      path: '/account',
      label: 'Account',
      page: createTestPage('account'),
      canEnter: () => new Promise<boolean>((resolve) => {
        allowAccount = resolve;
      }),
    });
    const route = defineRoutes({ home, shop, account });

    await provideRouter(route);
    const accountNavigation = navigate('/account');
    const shopNavigation = navigate('/shop');
    allowAccount(true);

    await Promise.all([accountNavigation, shopNavigation]);

    expect(getCurrentMatch()?.route).toBe(route.shop);
    expect(window.location.pathname).toBe('/shop');
  });

  it('throws when guard redirects create a navigation loop', async () => {
    const routes = createRoutes();
    const login = routes.page({
      path: '/login',
      label: 'Login',
      page: createTestPage('login'),
      canEnter: () => account,
    });
    const account = routes.page({
      path: '/account',
      label: 'Account',
      page: createTestPage('account'),
      canEnter: () => login,
    });
    const route = defineRoutes({ login, account });

    await provideRouter(route);

    await expect(navigate('/account')).rejects.toThrow(
      'VR_GUARD_REDIRECT_LOOP: Guard redirects created a navigation loop at "/account".',
    );
  });

  it('runs the same decision pipeline for browser back and forward', async () => {
    const routes = createRoutes();
    const login = routes.page({ path: '/login', label: 'Login', page: createTestPage('login') });
    const home = routes.page({ path: '/', label: 'Home', page: createTestPage('home') });
    const account = routes.page({
      path: '/account',
      label: 'Account',
      page: createTestPage('account'),
      canEnter: () => login,
    });
    const route = defineRoutes({ home, login, account });

    await provideRouter(route);
    window.history.pushState(null, '', '/account');
    window.dispatchEvent(new PopStateEvent('popstate'));
    await Promise.resolve();

    expect(getCurrentMatch()?.route).toBe(route.login);
    expect(window.location.pathname).toBe('/login');
  });
});
```

- [x] **Step 2: Update existing sync router tests to await navigation**

Modify `packages/router/tests/route/router-state.test.ts` and `packages/router/tests/route/router-state-layout.test.ts` so calls to `provideRouter(...)` and `navigate(...)` in assertions are awaited:

```ts
it('navigates and updates params', async () => {
  await provideRouter(route);
  await navigate('/users/42');

  expect(getCurrentMatch()).toMatchObject({
    route: { key: 'user' },
    params: { id: '42' },
  });
  expect(routeParams()).toEqual({ id: '42' });
});
```

- [x] **Step 3: Run the failing router state tests**

Run:

```bash
pnpm --filter @vanrot/router test -- tests/route/router-state-navigation.test.ts tests/route/router-state.test.ts tests/route/router-state-layout.test.ts
```

Expected: FAIL because router state still commits routes before guard and redirect decisions.

- [x] **Step 4: Integrate navigation decisions into router state**

Modify `packages/router/src/route/router-state.ts` with one navigation entry point:

```ts
import { routeDiagnosticCodes } from './route-diagnostic-codes.js';
import { resolveNavigationDecision } from './navigation-decisions.js';

let navigationId = 0;

export async function provideRouter(routes: DefinedRouteTable): Promise<boolean> {
  providedRoutes = routes;
  removePopstateListener?.();
  removePopstateListener = listenForPopstate();
  return startNavigation(readBrowserPath(), { history: 'replace' });
}

export async function navigate(path: string): Promise<boolean> {
  return startNavigation(path, { history: 'push' });
}

async function startNavigation(
  path: string,
  options: { history: 'push' | 'replace' | 'none' },
  visitedPaths: Set<string> = new Set(),
): Promise<boolean> {
  if (visitedPaths.has(path)) {
    throw new Error(
      `${routeDiagnosticCodes.guardRedirectLoop}: Guard redirects created a navigation loop at "${path}".`,
    );
  }

  visitedPaths.add(path);

  const routes = requireProvidedRoutes();
  const nextNavigationId = navigationId + 1;
  navigationId = nextNavigationId;

  const decision = await resolveNavigationDecision({
    routes,
    path,
    from: getCurrentMatch(),
    navigationId: nextNavigationId,
    isCurrentNavigation: (candidateId) => candidateId === navigationId,
  });

  if (decision.kind === 'stale') {
    return false;
  }

  if (decision.kind === 'blocked') {
    return false;
  }

  if (decision.kind === 'redirect') {
    return startNavigation(
      decision.path,
      { history: decision.replace ? 'replace' : options.history },
      visitedPaths,
    );
  }

  commitRouteChain(decision.match);
  writeHistory(decision.path, options.history);

  return true;
}
```

Move the existing state writes into focused helpers:

```ts
function commitRouteChain(match: RouteChainMatch): void {
  currentRouteChain.set(match);
  currentParams.set(match.params);
}

function writeHistory(path: string, mode: 'push' | 'replace' | 'none'): void {
  if (mode === 'none' || globalThis.window === undefined) {
    return;
  }

  if (mode === 'replace') {
    globalThis.window.history.replaceState(null, '', path);
    return;
  }

  globalThis.window.history.pushState(null, '', path);
}
```

Update popstate:

```ts
const listener = (): void => {
  void startNavigation(readBrowserPath(), { history: 'replace' });
};
```

Reset navigation id in `resetRouterForTests()`:

```ts
navigationId = 0;
```

- [x] **Step 5: Verify Task 4 passes**

Run:

```bash
pnpm --filter @vanrot/router test -- tests/route/router-state-navigation.test.ts tests/route/router-state.test.ts tests/route/router-state-layout.test.ts
```

Expected: PASS.

- [x] **Step 6: Review checkpoint**

Run:

```bash
git status --short --branch
```

Expected: router-state implementation and tests are uncommitted in the working tree. Do not run `git add` or `git commit` unless the user asks.

## Task 5: Guarded Route Links And Public Export Hygiene

**Files:**
- Modify: `packages/router/src/dom/route-link.ts`
- Modify: `packages/router/src/index.ts`
- Modify: `packages/router/src/internal.ts`
- Test: `packages/router/tests/dom/route-link-navigation.test.ts`
- Test: `packages/router/tests/dom/route-link.test.ts`

- [x] **Step 1: Add failing guarded route-link tests**

Create `packages/router/tests/dom/route-link-navigation.test.ts`:

```ts
// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest';
import { setupRouteLink } from '../../src/dom/route-link.js';
import { createRoutes, defineRoutes } from '../../src/index.js';
import { getCurrentMatch, provideRouter, resetRouterForTests } from '../../src/route/router-state.js';
import { createTestPage } from '../../src/test/test-pages.js';

describe('guarded route links', () => {
  beforeEach(() => {
    resetRouterForTests();
    window.history.replaceState(null, '', '/');
  });

  it('uses the guarded navigation pipeline for normal link clicks', async () => {
    const routes = createRoutes();
    const login = routes.page({ path: '/login', label: 'Login', page: createTestPage('login') });
    const home = routes.page({ path: '/', label: 'Home', page: createTestPage('home') });
    const account = routes.page({
      path: '/account',
      label: 'Account',
      page: createTestPage('account'),
      canEnter: () => login,
    });
    const route = defineRoutes({ home, login, account });
    const anchor = document.createElement('a');

    await provideRouter(route);
    setupRouteLink(anchor, route.account);
    anchor.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }));
    await Promise.resolve();

    expect(getCurrentMatch()?.route).toBe(route.login);
    expect(window.location.pathname).toBe('/login');
  });

  it('keeps href route-owned while navigation can redirect elsewhere', async () => {
    const routes = createRoutes();
    const login = routes.page({ path: '/login', label: 'Login', page: createTestPage('login') });
    const account = routes.page({
      path: '/account',
      label: 'Account',
      page: createTestPage('account'),
      canEnter: () => login,
    });
    const route = defineRoutes({ login, account });
    const anchor = document.createElement('a');

    await provideRouter(route);
    setupRouteLink(anchor, route.account);

    expect(anchor.getAttribute('href')).toBe('/account');
    expect(anchor.textContent).toBe('Account');
  });
});
```

- [x] **Step 2: Update existing route-link tests to await async navigation effects**

Modify `packages/router/tests/dom/route-link.test.ts` so setup awaits router setup and click assertions wait one microtask:

```ts
beforeEach(async () => {
  resetRouterForTests();
  window.history.replaceState(null, '', routePath.home);
  await provideRouter(route);
});
```

For click tests:

```ts
anchor.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }));
await Promise.resolve();

expect(window.location.pathname).toBe(routePath.about);
```

- [x] **Step 3: Run the failing route-link tests**

Run:

```bash
pnpm --filter @vanrot/router test -- tests/dom/route-link-navigation.test.ts tests/dom/route-link.test.ts
```

Expected: FAIL until `setupRouteLink(...)` handles the `Promise<boolean>` navigation result cleanly.

- [x] **Step 4: Keep link clicks small and guarded**

Modify the click handler in `packages/router/src/dom/route-link.ts`:

```ts
const listener = (event: MouseEvent): void => {
  if (shouldUseBrowserNavigation(event, anchor)) {
    return;
  }

  event.preventDefault();
  void navigate(href);
};
```

No template syntax changes are needed. `<vr route.name />` keeps compiling to the existing `setupRouteLink(...)` call.

- [x] **Step 5: Export only stable public helpers**

Verify `packages/router/src/index.ts` exports these Phase 15C public types and no internal decision engine:

```ts
export type {
  RedirectRouteDefinition,
  RouteGuard,
  RouteGuardContext,
  RouteGuardInput,
  RouteGuardResult,
  RouteRedirectTarget,
} from './route/route-types.js';
```

Verify `packages/router/src/internal.ts` exports `setupRouteLink(...)` as before and does not export `resolveNavigationDecision(...)` unless compiler tests require it.

- [x] **Step 6: Verify Task 5 passes**

Run:

```bash
pnpm --filter @vanrot/router test -- tests/dom/route-link-navigation.test.ts tests/dom/route-link.test.ts
pnpm --filter @vanrot/router typecheck
```

Expected: PASS.

- [x] **Step 7: Review checkpoint**

Run:

```bash
git status --short --branch
```

Expected: route-link, exports, and tests are uncommitted in the working tree. Do not run `git add` or `git commit` unless the user asks.

## Task 6: Phase 15C Completion Docs And Full Verification

**Files:**
- Modify: `docs/superpowers/plans/Phase-15C.md`
- Modify: `docs/superpowers/feature-maturity.md`
- Modify: `docs/superpowers/final-tdd-inventory.md`
- Modify: `docs/vanrot-presentation.html`

- [x] **Step 1: Run the focused router suite**

Run:

```bash
pnpm --filter @vanrot/router test
```

Expected: PASS for all router tests, including Phase 15A, Phase 15B, and Phase 15C coverage.

- [x] **Step 2: Run full verification before marking docs complete**

Run:

```bash
pnpm verify
```

Expected: PASS for typecheck, tests, builds, runtime size, and `verify:phase-docs`.

- [x] **Step 3: Mark Phase 15C plan tasks complete**

After implementation and `pnpm verify` pass, change each checkbox in `docs/superpowers/plans/Phase-15C.md` from:

```md
- [x] **Step
```

to:

```md
- [x] **Step
```

- [x] **Step 4: Update feature maturity ledger**

Modify `docs/superpowers/feature-maturity.md`:

```md
| [ ]  | Phase 15 | Router production                           | 15A route contract production, 15B nested layout routing, and 15C navigation decisions are complete; remaining 15D slice covers preloading and route integration tests | `@vanrot/router` supports normal application routing needs without repeated route string literals in user templates.                                    |
```

Update the split row near the bottom:

```md
|    15 | Yes          | 15A route contract production; 15B nested layout routing; 15C redirects, guards, and route graph diagnostics; 15D preloading and route integration tests.                                                | 15A, 15B, and 15C are complete; preserve the no-reused-string-literals rule for remaining router preloading and integration work. |
```

Update router-specific rows:

```md
| Router guards                                    | router                   |     Phase 15C | Routes can block, redirect, or allow navigation through explicit guard APIs                   | Async guards, cancellation, auth examples, diagnostics, testing helpers, and docs verified      | Production-Ready | Phase 15C added `canEnter`, parent-to-child guard execution, guard redirects, blocking, and stale async navigation protection. |
| Router strict route diagnostics                  | router, compiler, cli    |     Phase 15C | Invalid route refs, duplicate paths, unreachable routes, and CLI route graph issues can be reported | Code frames, docs links, strict mode, CI behavior, and route graph integration verified         | Production-Ready for navigation decisions | Phase 15C covers duplicate full paths, redirect misuse, missing targets, redirect loops, invalid guards, and invalid guard results. |
```

- [x] **Step 5: Update final TDD inventory**

Modify `docs/superpowers/final-tdd-inventory.md` in the `@vanrot/router` section:

```md
| router | navigation decisions | Production-Ready | Runs redirect routes and `canEnter` guards through one decision pipeline for initial load, programmatic navigation, browser back/forward, and route-link clicks. | Phase 15C | Guards run parent-to-child and left-to-right; async stale results are ignored. |
| router | redirect routes | Production-Ready | Supports root and child redirect routes, structured params/query redirect targets, redirect route diagnostics, and redirect loop detection. | Phase 15C | Redirects use route refs and `routes.redirectTo(...)`, not manual URL strings. |
| diagnostics | navigation route diagnostics | Production-Ready | Reports duplicate full paths, invalid redirect shapes, missing redirect targets, redirect loops, invalid guards, invalid guard results, and guard redirect loops with stable codes. | Phase 15C | Built on the Phase 15A diagnostic foundation. |
```

Update the final phase matrix row:

```md
| Router production remaining | router, compiler | 15A, 15B, and 15C complete; 15D deferred | Red/green tests for preloading and route integration workflows. | Phase 15D |
```

- [x] **Step 6: Update presentation roadmap**

Modify `docs/vanrot-presentation.html` so the Phase 15 card and roadmap summary read:

```html
<div class="phase-status" style="color:var(--cyan);">15A Done · 15B Done · 15C Done · 15D Active</div>
```

```html
<span style="color:var(--green);">Done: production phases 11-14 plus Phase 15A, 15B, and 15C</span>
<span style="color:var(--cyan);">Active: Phase 15D preloading and route integration tests</span>
<span style="color:var(--muted);">Remaining: later testing, docs, SSR, devtools, UI, and store production slices</span>
```

Add the Phase 15C bullet:

```html
<li>15C navigation decisions: redirect routes, `canEnter` guards, async cancellation, guarded links, and strict route graph diagnostics.</li>
```

- [x] **Step 7: Re-run phase docs verification**

Run:

```bash
pnpm verify:phase-docs
```

Expected: PASS.

- [x] **Step 8: Run final verification**

Run:

```bash
pnpm verify
```

Expected: PASS.

- [x] **Step 9: Final review checkpoint**

Run:

```bash
git status --short --branch
```

Expected: Phase 15C implementation and completion docs are uncommitted in the working tree. Do not run `git add` or `git commit` unless the user asks.

## Self-Review

- Spec coverage: Tasks 1-2 cover guard/redirect route definition, source-of-truth ownership, structured redirect targets, and strict graph diagnostics. Task 3 covers the shared navigation decision pipeline, guard ordering, redirect routes, invalid guard values, and stale async decisions. Tasks 4-5 cover `provideRouter(...)`, `navigate(...)`, popstate, and `<vr route.name />` links. Task 6 covers phase completion docs and verification.
- Scope control: The plan does not add preloading, scroll restoration, route animation, title/meta, data loaders, SSR routing, route graph UI, custom link labels, auth packages, or form dirty-state prompts.
- Type consistency: The plan consistently uses `RouteGuard`, `RouteGuardContext`, `RouteGuardResult`, `RouteRedirectTarget`, `RedirectRouteDefinition`, `resolveNavigationDecision(...)`, `canEnter`, `routes.redirect(...)`, and `routes.redirectTo(...)`.
- Red-flag scan: No implementation step relies on unspecified future work; each code-changing step names concrete files, concrete test cases, and concrete helper/function shapes.
