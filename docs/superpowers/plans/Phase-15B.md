# Phase 15B Nested Layout Routing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking. This repo forbids subagent-driven workflows in `AGENTS.md`.

**Goal:** Add production-ready nested layout routing so `@vanrot/router` can render route layout chains through one root `<vr-router />` and route-local `<vr-outlet />` slots.

**Architecture:** Phase 15B builds on the Phase 15A route builder contract. Route hierarchy comes from route object refs and builder receivers, `defineRoutes({ ... })` keeps canonical topological order, router state exposes the active matched chain, and DOM outlets mount the chain depth-by-depth while retaining shared layouts across sibling navigation.

**Tech Stack:** TypeScript, Vitest, jsdom, `@vanrot/runtime` signals/effects/mounting, `@vanrot/router`, `@vanrot/compiler`, `@vanrot/cli`.

---

## Preconditions

Phase 15A must already be complete before executing this plan.

Required Phase 15A surface:

- `createRoutes()` exists and creates route object refs.
- `defineRoutes({ ... })` accepts builder-created route refs and keeps object-form compatibility.
- Route diagnostics have stable code, message, source span when available, suggestion, and docs hook.
- Params and query values are available to route matching, links, breadcrumbs, and router state.
- `<vr route.name param.* query.* />` and `<vr-breadcrumbs />` are already handled.

## File Structure

- `packages/router/src/route/route-types.ts`: route kind, layout component types, nav metadata, parent/child refs, active route chain types.
- `packages/router/src/route/create-routes.ts`: root and child builders for `layout(...)` and `page(...)`.
- `packages/router/src/route/route-diagnostics.ts`: Phase 15B router diagnostic codes and helpers.
- `packages/router/src/route/define-routes.ts`: canonical registry ordering and route graph validation.
- `packages/router/src/route/match-route.ts`: keep leaf match compatibility and delegate to chain matching.
- `packages/router/src/route/match-route-chain.ts`: match nested route branches, index children, params, and query.
- `packages/router/src/route/router-state.ts`: expose active route chain while preserving `getCurrentMatch()` and `routeParams()`.
- `packages/router/src/dom/route-outlet-context.ts`: track outlet depth while mounting layout components.
- `packages/router/src/dom/route-outlet.ts`: mount one chain depth per outlet, retain shared layouts, destroy inactive branches.
- `packages/router/src/test/test-pages.ts`: test component helpers for page/layout lifecycle assertions.
- `packages/router/tests/route/define-routes-layout.test.ts`: builder and graph diagnostics.
- `packages/router/tests/route/match-route-chain.test.ts`: nested match behavior.
- `packages/router/tests/route/router-state-layout.test.ts`: state and compatibility behavior.
- `packages/router/tests/dom/route-outlet-layout.test.ts`: nested DOM mounting and cleanup behavior.
- `packages/compiler/src/codegen/generate-component.ts`: distinguish `<vr-router />` and `<vr-outlet />` lowering.
- `packages/compiler/src/codegen/state.ts`: track router root and layout outlet usage separately.
- `packages/compiler/src/router/router-template-diagnostics.ts`: compile-time diagnostics for router/outlet placement.
- `packages/compiler/src/api/types.ts`: add Phase 15B diagnostic codes and compile features.
- `packages/compiler/tests/codegen/generate-component.test.ts`: generated code for root router and child outlet.
- `packages/compiler/tests/router/router-template-diagnostics.test.ts`: root/outlet placement diagnostics.
- `packages/cli/src/create/app-template.ts`: generated starter with `app.layout.*`, route-owned hierarchy examples, and no route literals outside `src/routes.ts`.
- `packages/cli/tests/create.test.ts`: starter assertions for 15B conventions.
- `docs/superpowers/feature-maturity.md`: keep Phase 15 router slice notes accurate after implementation.
- `docs/superpowers/final-tdd-inventory.md`: record new final TDD obligations for nested routing.
- `docs/vanrot-presentation.html`: update roadmap copy only when the phase is completed.

## Task 1: Route Kinds And Builder Hierarchy

**Files:**
- Modify: `packages/router/src/route/route-types.ts`
- Modify: `packages/router/src/route/create-routes.ts`
- Modify: `packages/router/src/route/define-routes.ts`
- Modify: `packages/router/src/route/route-diagnostics.ts`
- Modify: `packages/router/src/index.ts`
- Modify: `packages/router/src/internal.ts`
- Test: `packages/router/tests/route/define-routes-layout.test.ts`

- [x] **Step 1: Add failing route builder tests**

Create `packages/router/tests/route/define-routes-layout.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { createRoutes, defineRoutes } from '../../src/index.js';
import { createTestLayout, createTestPage } from '../../src/test/test-pages.js';

const routePath = {
  home: '/',
  shop: '/shop',
  product: 'product',
  productIndex: '',
  productDetail: ':productId',
  cart: 'cart',
} as const;

const routeLabel = {
  home: 'Home',
  shop: 'Shop',
  product: 'Products',
  productIndex: 'All products',
  productDetail: 'Product detail',
  cart: 'Cart',
} as const;

describe('defineRoutes layout route graph', () => {
  it('creates root pages, root layouts, child layouts, and child pages without parent-name strings', () => {
    const routes = createRoutes();
    const home = routes.page({
      path: routePath.home,
      label: routeLabel.home,
      page: createTestPage('home'),
    });
    const shop = routes.layout({
      path: routePath.shop,
      label: routeLabel.shop,
      layout: createTestLayout('shop'),
    });
    const product = shop.layout({
      path: routePath.product,
      label: routeLabel.product,
      layout: createTestLayout('product'),
    });
    const productIndex = product.page({
      path: routePath.productIndex,
      label: routeLabel.productIndex,
      page: createTestPage('product-index'),
    });
    const productDetail = product.page({
      path: routePath.productDetail,
      label: routeLabel.productDetail,
      page: createTestPage('product-detail'),
      nav: routes.nav.hidden(),
    });
    const cart = shop.page({
      path: routePath.cart,
      label: routeLabel.cart,
      page: createTestPage('cart'),
      nav: routes.nav.primary(),
    });

    const route = defineRoutes({ home, shop, product, productIndex, productDetail, cart });

    expect(route.shop).toMatchObject({
      key: 'shop',
      kind: 'layout',
      path: '/shop',
      fullPath: '/shop',
      parent: undefined,
    });
    expect(route.product).toMatchObject({
      key: 'product',
      kind: 'layout',
      path: 'product',
      fullPath: '/shop/product',
      parent: route.shop,
    });
    expect(route.productIndex).toMatchObject({
      key: 'productIndex',
      kind: 'page',
      path: '',
      fullPath: '/shop/product',
      parent: route.product,
    });
    expect(route.productDetail).toMatchObject({
      key: 'productDetail',
      kind: 'page',
      fullPath: '/shop/product/:productId',
      parent: route.product,
      nav: { kind: 'hidden' },
    });
    expect(route.cart).toMatchObject({
      key: 'cart',
      kind: 'page',
      fullPath: '/shop/cart',
      parent: route.shop,
      nav: { kind: 'primary' },
    });
    expect(route.shop.children.map((child) => child.key)).toEqual(['product', 'cart']);
    expect(route.product.children.map((child) => child.key)).toEqual([
      'productIndex',
      'productDetail',
    ]);
  });

  it('fails when a child route appears before its parent in defineRoutes()', () => {
    const routes = createRoutes();
    const shop = routes.layout({
      path: routePath.shop,
      label: routeLabel.shop,
      layout: createTestLayout('shop'),
    });
    const cart = shop.page({
      path: routePath.cart,
      label: routeLabel.cart,
      page: createTestPage('cart'),
    });

    expect(() => defineRoutes({ cart, shop })).toThrow(
      'VR_CHILD_BEFORE_PARENT: Route "cart" must appear after parent route "shop" in defineRoutes().',
    );
  });

  it('fails when a page owns children', () => {
    const routes = createRoutes();
    const shop = routes.page({
      path: routePath.shop,
      label: routeLabel.shop,
      page: createTestPage('shop'),
    });
    shop.page({
      path: routePath.cart,
      label: routeLabel.cart,
      page: createTestPage('cart'),
    });

    expect(() => defineRoutes({ shop })).toThrow(
      'VR_PAGE_HAS_CHILDREN: Route "shop" is a page route and cannot own child routes.',
    );
  });

  it('fails when a layout has no child routes', () => {
    const routes = createRoutes();
    const shop = routes.layout({
      path: routePath.shop,
      label: routeLabel.shop,
      layout: createTestLayout('shop'),
    });

    expect(() => defineRoutes({ shop })).toThrow(
      'VR_LAYOUT_WITHOUT_CHILDREN: Layout route "shop" must own at least one child route.',
    );
  });

  it('fails when a layout branch has more than one index page', () => {
    const routes = createRoutes();
    const shop = routes.layout({
      path: routePath.shop,
      label: routeLabel.shop,
      layout: createTestLayout('shop'),
    });
    const shopIndex = shop.page({
      path: '',
      label: 'Shop index',
      page: createTestPage('shop-index'),
    });
    const shopOverview = shop.page({
      path: '',
      label: 'Shop overview',
      page: createTestPage('shop-overview'),
    });

    expect(() => defineRoutes({ shop, shopIndex, shopOverview })).toThrow(
      'VR_DUPLICATE_INDEX_ROUTE: Layout route "shop" can only own one index page.',
    );
  });

  it('fails when an index child is declared as a layout', () => {
    const routes = createRoutes();
    const shop = routes.layout({
      path: routePath.shop,
      label: routeLabel.shop,
      layout: createTestLayout('shop'),
    });
    const shopIndex = shop.layout({
      path: '',
      label: 'Shop index',
      layout: createTestLayout('shop-index'),
    });

    expect(() => defineRoutes({ shop, shopIndex })).toThrow(
      'VR_INVALID_INDEX_LAYOUT: Route "shopIndex" uses path "" and must be a page route.',
    );
  });
});
```

- [x] **Step 2: Run the failing test**

Run:

```bash
pnpm --filter @vanrot/router test -- tests/route/define-routes-layout.test.ts
```

Expected: FAIL because `createRoutes().layout`, child builders, `fullPath`, `children`, and Phase 15B diagnostics do not exist yet.

- [x] **Step 3: Extend route types**

Update `packages/router/src/route/route-types.ts` so the public route model includes layout routes and active chains:

```ts
import type { ComponentType, Signal } from '@vanrot/runtime';

export type RouteParams = Record<string, string>;
export type RouteQueryValue = string | string[];
export type RouteQuery = Record<string, RouteQueryValue>;

export type RoutePageModule = ComponentType;
export type RouteLayoutModule = ComponentType;

export type RoutePageLoader = () => Promise<RoutePageModule | { default: RoutePageModule }>;
export type RouteLayoutLoader = () => Promise<RouteLayoutModule | { default: RouteLayoutModule }>;

export type RouteKind = 'page' | 'layout';

export interface RouteNavMetadata {
  kind: 'primary' | 'hidden';
}

export interface BaseRouteDefinition {
  path: string;
  label: string;
  nav?: RouteNavMetadata;
}

export interface RoutePageDefinition extends BaseRouteDefinition {
  kind?: 'page';
  page?: RoutePageModule;
  loadPage?: RoutePageLoader;
}

export interface RouteLayoutDefinition extends BaseRouteDefinition {
  kind: 'layout';
  layout?: RouteLayoutModule;
  loadLayout?: RouteLayoutLoader;
}

export type RouteDefinition = RoutePageDefinition | RouteLayoutDefinition;
export type RouteInput = Record<string, RouteDefinition | RouteBuilderRecord>;

export interface RouteBuilderRecord {
  readonly kind: RouteKind;
  readonly path: string;
  readonly label: string;
  readonly page?: RoutePageModule;
  readonly loadPage?: RoutePageLoader;
  readonly layout?: RouteLayoutModule;
  readonly loadLayout?: RouteLayoutLoader;
  readonly nav?: RouteNavMetadata;
  readonly parent?: RouteBuilderRecord;
  readonly children: RouteBuilderRecord[];
}

export type DefinedRoute<Key extends string = string> = RouteDefinition & {
  key: Key;
  kind: RouteKind;
  path: string;
  fullPath: string;
  parent?: DefinedRoute;
  children: DefinedRoute[];
  nav?: RouteNavMetadata;
};

export type DefinedRouteTable<Input extends RouteInput = RouteInput> = {
  readonly [Key in keyof Input & string]: DefinedRoute<Key> & Input[Key];
};

export interface RouteMatch {
  route: DefinedRoute;
  params: RouteParams;
  query: RouteQuery;
  path: string;
}

export interface RouteChainMatch {
  chain: RouteMatch[];
  params: RouteParams;
  query: RouteQuery;
  path: string;
}

export type RouteParamsSignal = Signal<RouteParams>;
```

- [x] **Step 4: Add Phase 15B diagnostics**

Update `packages/router/src/route/route-diagnostics.ts` with these codes and helper:

```ts
export type RouterDiagnosticCode =
  | 'VR_CHILD_BEFORE_PARENT'
  | 'VR_DUPLICATE_INDEX_ROUTE'
  | 'VR_INVALID_INDEX_LAYOUT'
  | 'VR_LAYOUT_MISSING_COMPONENT'
  | 'VR_LAYOUT_WITHOUT_CHILDREN'
  | 'VR_PAGE_HAS_CHILDREN';

export interface RouterDiagnostic {
  code: RouterDiagnosticCode;
  message: string;
  suggestion: string;
  docsPath: string;
}

const docsPathByCode: Record<RouterDiagnosticCode, string> = {
  VR_CHILD_BEFORE_PARENT: '/docs/router/route-order',
  VR_DUPLICATE_INDEX_ROUTE: '/docs/router/index-routes',
  VR_INVALID_INDEX_LAYOUT: '/docs/router/index-routes',
  VR_LAYOUT_MISSING_COMPONENT: '/docs/router/layout-routes',
  VR_LAYOUT_WITHOUT_CHILDREN: '/docs/router/layout-routes',
  VR_PAGE_HAS_CHILDREN: '/docs/router/page-routes',
};

export function createRouterDiagnostic(
  code: RouterDiagnosticCode,
  message: string,
  suggestion: string,
): RouterDiagnostic {
  return {
    code,
    message,
    suggestion,
    docsPath: docsPathByCode[code],
  };
}

export function throwRouterDiagnostic(diagnostic: RouterDiagnostic): never {
  throw new Error(`${diagnostic.code}: ${diagnostic.message}`);
}
```

- [x] **Step 5: Implement layout and page builders**

Update `packages/router/src/route/create-routes.ts`:

```ts
import type {
  RouteBuilderRecord,
  RouteLayoutDefinition,
  RouteNavMetadata,
  RoutePageDefinition,
} from './route-types.js';

export interface RouteBuilderHost {
  page(definition: Omit<RoutePageDefinition, 'kind'>): RouteBuilderRecord;
  layout(definition: Omit<RouteLayoutDefinition, 'kind'>): RouteBuilderRecord;
  nav: {
    primary(): RouteNavMetadata;
    hidden(): RouteNavMetadata;
  };
}

export function createRoutes(): RouteBuilderHost {
  return createRouteBuilderHost();
}

function createRouteBuilderHost(parent?: RouteBuilderRecord): RouteBuilderHost {
  return {
    page(definition) {
      return createBuilderRecord('page', definition, parent);
    },
    layout(definition) {
      return createBuilderRecord('layout', definition, parent);
    },
    nav: {
      primary() {
        return { kind: 'primary' };
      },
      hidden() {
        return { kind: 'hidden' };
      },
    },
  };
}

function createBuilderRecord(
  kind: 'page' | 'layout',
  definition: Omit<RoutePageDefinition, 'kind'> | Omit<RouteLayoutDefinition, 'kind'>,
  parent: RouteBuilderRecord | undefined,
): RouteBuilderRecord {
  const record = Object.assign(createRouteBuilderHost(undefined), {
    ...definition,
    kind,
    parent,
    children: [] as RouteBuilderRecord[],
  }) as RouteBuilderRecord;

  if (parent !== undefined) {
    parent.children.push(record);
  }

  return record;
}
```

- [x] **Step 6: Validate and normalize the route graph**

Update `packages/router/src/route/define-routes.ts`:

```ts
import { createRouterDiagnostic, throwRouterDiagnostic } from './route-diagnostics.js';
import type { DefinedRoute, DefinedRouteTable, RouteBuilderRecord, RouteInput } from './route-types.js';

export function defineRoutes<Input extends RouteInput>(routes: Input): DefinedRouteTable<Input> {
  const builderToKey = new Map<RouteBuilderRecord, string>();
  const builderToRoute = new Map<RouteBuilderRecord, DefinedRoute>();
  const entries = Object.entries(routes);

  for (const [key, route] of entries) {
    if (isBuilderRecord(route)) {
      builderToKey.set(route, key);
    }
  }

  const definedEntries = entries.map(([key, route]) => {
    const normalized = isBuilderRecord(route)
      ? normalizeBuilderRoute(key, route, builderToRoute)
      : normalizeObjectRoute(key, route);

    if (isBuilderRecord(route)) {
      builderToRoute.set(route, normalized);
    }

    return [key, normalized] as const;
  });

  const table = Object.fromEntries(definedEntries) as DefinedRouteTable<Input>;
  linkChildren(table, builderToRoute);
  validateRouteGraph(table, builderToKey);

  return table;
}

function normalizeBuilderRoute(
  key: string,
  route: RouteBuilderRecord,
  builderToRoute: Map<RouteBuilderRecord, DefinedRoute>,
): DefinedRoute {
  const parent = route.parent === undefined ? undefined : builderToRoute.get(route.parent);

  if (route.parent !== undefined && parent === undefined) {
    const parentKey = 'unregistered parent';
    throwRouterDiagnostic(
      createRouterDiagnostic(
        'VR_CHILD_BEFORE_PARENT',
        `Route "${key}" must appear after parent route "${parentKey}" in defineRoutes().`,
        `Move "${key}" below its parent route in defineRoutes({ ... }).`,
      ),
    );
  }

  return {
    ...route,
    key,
    kind: route.kind,
    fullPath: composeFullPath(parent?.fullPath, route.path),
    parent,
    children: [],
  };
}

function normalizeObjectRoute(key: string, route: InputRouteValue): DefinedRoute {
  const kind = route.kind ?? 'page';

  if (kind === 'page' && route.page === undefined && route.loadPage === undefined) {
    throw new Error(`Route "${key}" must define page or loadPage.`);
  }

  if (kind === 'layout' && route.layout === undefined && route.loadLayout === undefined) {
    throwRouterDiagnostic(
      createRouterDiagnostic(
        'VR_LAYOUT_MISSING_COMPONENT',
        `Layout route "${key}" must define layout or loadLayout.`,
        `Add layout: ${toPascalCase(key)}Layout or loadLayout: () => import(...).`,
      ),
    );
  }

  return {
    ...route,
    key,
    kind,
    fullPath: composeFullPath(undefined, route.path),
    children: [],
  } as DefinedRoute;
}

type InputRouteValue = RouteInput[string];

function linkChildren(table: DefinedRouteTable, builderToRoute: Map<RouteBuilderRecord, DefinedRoute>): void {
  for (const route of Object.values(table)) {
    if (route.parent === undefined) {
      continue;
    }

    route.parent.children.push(route);
  }

  for (const [builder, route] of builderToRoute) {
    route.children = builder.children
      .map((child) => builderToRoute.get(child))
      .filter((child): child is DefinedRoute => child !== undefined);
  }
}

function validateRouteGraph(table: DefinedRouteTable, builderToKey: Map<RouteBuilderRecord, string>): void {
  for (const route of Object.values(table)) {
    if (route.kind === 'page' && route.children.length > 0) {
      throwRouterDiagnostic(
        createRouterDiagnostic(
          'VR_PAGE_HAS_CHILDREN',
          `Route "${route.key}" is a page route and cannot own child routes.`,
          `Change "${route.key}" to routes.layout(...) or move its children to a layout route.`,
        ),
      );
    }

    if (route.kind === 'layout') {
      validateLayoutRoute(route);
    }

    if (route.parent !== undefined && !isParentBeforeChild(table, route.parent, route)) {
      throwRouterDiagnostic(
        createRouterDiagnostic(
          'VR_CHILD_BEFORE_PARENT',
          `Route "${route.key}" must appear after parent route "${route.parent.key}" in defineRoutes().`,
          `Move "${route.key}" below "${route.parent.key}" in defineRoutes({ ... }).`,
        ),
      );
    }

    if (isBuilderRecord(route) && route.parent !== undefined && !builderToKey.has(route.parent)) {
      throwRouterDiagnostic(
        createRouterDiagnostic(
          'VR_CHILD_BEFORE_PARENT',
          `Route "${route.key}" must appear after parent route "unregistered parent" in defineRoutes().`,
          `Return the parent route from defineRoutes({ ... }) before returning "${route.key}".`,
        ),
      );
    }
  }
}

function validateLayoutRoute(route: DefinedRoute): void {
  if (route.layout === undefined && route.loadLayout === undefined) {
    throwRouterDiagnostic(
      createRouterDiagnostic(
        'VR_LAYOUT_MISSING_COMPONENT',
        `Layout route "${route.key}" must define layout or loadLayout.`,
        `Add a layout component to route "${route.key}".`,
      ),
    );
  }

  if (route.children.length === 0) {
    throwRouterDiagnostic(
      createRouterDiagnostic(
        'VR_LAYOUT_WITHOUT_CHILDREN',
        `Layout route "${route.key}" must own at least one child route.`,
        `Add "${route.key}.page(...)" or change "${route.key}" to routes.page(...).`,
      ),
    );
  }

  const indexChildren = route.children.filter((child) => child.path === '');

  if (indexChildren.length > 1) {
    throwRouterDiagnostic(
      createRouterDiagnostic(
        'VR_DUPLICATE_INDEX_ROUTE',
        `Layout route "${route.key}" can only own one index page.`,
        `Keep one child route with path: "" under "${route.key}".`,
      ),
    );
  }

  const indexLayout = indexChildren.find((child) => child.kind === 'layout');

  if (indexLayout !== undefined) {
    throwRouterDiagnostic(
      createRouterDiagnostic(
        'VR_INVALID_INDEX_LAYOUT',
        `Route "${indexLayout.key}" uses path "" and must be a page route.`,
        `Change "${indexLayout.key}" from .layout(...) to .page(...).`,
      ),
    );
  }
}

function composeFullPath(parentPath: string | undefined, childPath: string): string {
  if (parentPath === undefined) {
    return normalizeRootPath(childPath);
  }

  if (childPath === '') {
    return parentPath;
  }

  return `${parentPath.replace(/\/+$/u, '')}/${childPath.replace(/^\/+/u, '')}`;
}

function normalizeRootPath(path: string): string {
  if (path === '') {
    return '/';
  }

  if (path.startsWith('/')) {
    return path;
  }

  return `/${path}`;
}

function isBuilderRecord(value: unknown): value is RouteBuilderRecord {
  return typeof value === 'object' && value !== null && 'children' in value && 'kind' in value;
}

function isParentBeforeChild(table: DefinedRouteTable, parent: DefinedRoute, child: DefinedRoute): boolean {
  const keys = Object.keys(table);
  return keys.indexOf(parent.key) < keys.indexOf(child.key);
}

function toPascalCase(value: string): string {
  return value.slice(0, 1).toUpperCase() + value.slice(1);
}
```

- [x] **Step 7: Export builder APIs**

Update `packages/router/src/index.ts` and `packages/router/src/internal.ts`:

```ts
export { createRoutes } from './route/create-routes.js';
export { defineRoutes } from './route/define-routes.js';
export type {
  DefinedRoute,
  DefinedRouteTable,
  RouteChainMatch,
  RouteDefinition,
  RouteInput,
  RouteKind,
  RouteLayoutLoader,
  RouteLayoutModule,
  RouteMatch,
  RouteNavMetadata,
  RoutePageLoader,
  RoutePageModule,
  RouteParams,
  RouteParamsSignal,
  RouteQuery,
  RouteQueryValue,
} from './route/route-types.js';
```

- [x] **Step 8: Run route graph tests**

Run:

```bash
pnpm --filter @vanrot/router test -- tests/route/define-routes-layout.test.ts
```

Expected: PASS.

- [x] **Step 9: Checkpoint**

Do not stage or commit. Record changed files in the task notes.

## Task 2: Match Nested Route Chains

**Files:**
- Create: `packages/router/src/route/match-route-chain.ts`
- Modify: `packages/router/src/route/match-route.ts`
- Modify: `packages/router/src/index.ts`
- Test: `packages/router/tests/route/match-route-chain.test.ts`
- Test: `packages/router/tests/route/match-route.test.ts`

- [x] **Step 1: Add failing chain matching tests**

Create `packages/router/tests/route/match-route-chain.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { createRoutes, defineRoutes, matchRouteChain } from '../../src/index.js';
import { createTestLayout, createTestPage } from '../../src/test/test-pages.js';

const path = {
  shop: '/shop',
  product: 'product',
  productIndex: '',
  productDetail: ':productId',
  cart: 'cart',
} as const;

const label = {
  shop: 'Shop',
  product: 'Products',
  productIndex: 'All products',
  productDetail: 'Product detail',
  cart: 'Cart',
} as const;

function createShopRoutes() {
  const routes = createRoutes();
  const shop = routes.layout({ path: path.shop, label: label.shop, layout: createTestLayout('shop') });
  const product = shop.layout({
    path: path.product,
    label: label.product,
    layout: createTestLayout('product'),
  });
  const productIndex = product.page({
    path: path.productIndex,
    label: label.productIndex,
    page: createTestPage('product-index'),
  });
  const productDetail = product.page({
    path: path.productDetail,
    label: label.productDetail,
    page: createTestPage('product-detail'),
  });
  const cart = shop.page({ path: path.cart, label: label.cart, page: createTestPage('cart') });

  return defineRoutes({ shop, product, productIndex, productDetail, cart });
}

describe('matchRouteChain', () => {
  it('matches a nested layout branch with a leaf page', () => {
    const match = matchRouteChain(createShopRoutes(), '/shop/product/42?tab=details&tag=desk&tag=lamp');

    expect(match).toMatchObject({
      path: '/shop/product/42',
      params: { productId: '42' },
      query: { tab: 'details', tag: ['desk', 'lamp'] },
    });
    expect(match?.chain.map((item) => item.route.key)).toEqual([
      'shop',
      'product',
      'productDetail',
    ]);
  });

  it('matches a layout index child when the URL equals the layout path', () => {
    const match = matchRouteChain(createShopRoutes(), '/shop/product');

    expect(match?.chain.map((item) => item.route.key)).toEqual([
      'shop',
      'product',
      'productIndex',
    ]);
  });

  it('matches a direct child page under a root layout', () => {
    const match = matchRouteChain(createShopRoutes(), '/shop/cart');

    expect(match?.chain.map((item) => item.route.key)).toEqual(['shop', 'cart']);
  });

  it('returns null for a layout URL with no index child', () => {
    const routes = createRoutes();
    const shop = routes.layout({ path: '/shop', label: 'Shop', layout: createTestLayout('shop') });
    const cart = shop.page({ path: 'cart', label: 'Cart', page: createTestPage('cart') });
    const route = defineRoutes({ shop, cart });

    expect(matchRouteChain(route, '/shop')).toBeNull();
  });
});
```

- [x] **Step 2: Run the failing chain test**

Run:

```bash
pnpm --filter @vanrot/router test -- tests/route/match-route-chain.test.ts
```

Expected: FAIL because `matchRouteChain` does not exist.

- [x] **Step 3: Implement chain matching**

Create `packages/router/src/route/match-route-chain.ts`:

```ts
import type {
  DefinedRoute,
  DefinedRouteTable,
  RouteChainMatch,
  RouteMatch,
  RouteParams,
  RouteQuery,
  RouteQueryValue,
} from './route-types.js';

export function matchRouteChain(routes: DefinedRouteTable, path: string): RouteChainMatch | null {
  const normalizedPath = normalizePath(path);
  const query = parseQuery(path);
  const segments = splitPath(normalizedPath);

  for (const route of Object.values(routes)) {
    if (route.parent !== undefined) {
      continue;
    }

    const match = matchRouteBranch(route, segments, normalizedPath, query, {}, []);

    if (match !== null) {
      return match;
    }
  }

  return null;
}

function matchRouteBranch(
  route: DefinedRoute,
  segments: string[],
  normalizedPath: string,
  query: RouteQuery,
  params: RouteParams,
  chain: RouteMatch[],
): RouteChainMatch | null {
  const ownSegments = splitPath(route.path);
  const ownParams = matchSegments(ownSegments, segments.slice(0, ownSegments.length));

  if (ownParams === null) {
    return null;
  }

  const nextParams = { ...params, ...ownParams };
  const remainingSegments = segments.slice(ownSegments.length);
  const nextChain = [
    ...chain,
    {
      route,
      params: nextParams,
      query,
      path: normalizedPath,
    },
  ];

  if (remainingSegments.length === 0) {
    const indexChild = route.children.find((child) => child.path === '');

    if (route.kind === 'layout' && indexChild !== undefined) {
      return matchRouteBranch(indexChild, remainingSegments, normalizedPath, query, nextParams, nextChain);
    }

    if (route.kind === 'page') {
      return {
        chain: nextChain,
        params: nextParams,
        query,
        path: normalizedPath,
      };
    }

    return null;
  }

  for (const child of route.children) {
    if (child.path === '') {
      continue;
    }

    const childMatch = matchRouteBranch(child, remainingSegments, normalizedPath, query, nextParams, nextChain);

    if (childMatch !== null) {
      return childMatch;
    }
  }

  return null;
}

function matchSegments(routeSegments: string[], pathSegments: string[]): RouteParams | null {
  if (routeSegments.length !== pathSegments.length) {
    return null;
  }

  const params: RouteParams = {};

  for (let index = 0; index < routeSegments.length; index += 1) {
    const routeSegment = routeSegments[index];
    const pathSegment = pathSegments[index];

    if (routeSegment.startsWith(':')) {
      params[routeSegment.slice(1)] = decodeURIComponent(pathSegment);
      continue;
    }

    if (routeSegment !== pathSegment) {
      return null;
    }
  }

  return params;
}

function parseQuery(path: string): RouteQuery {
  const queryIndex = path.indexOf('?');

  if (queryIndex === -1) {
    return {};
  }

  const params = new URLSearchParams(path.slice(queryIndex + 1));
  const query: RouteQuery = {};

  for (const [key, value] of params) {
    const existing = query[key];

    if (existing === undefined) {
      query[key] = value;
      continue;
    }

    query[key] = appendQueryValue(existing, value);
  }

  return query;
}

function appendQueryValue(existing: RouteQueryValue, value: string): string[] {
  if (Array.isArray(existing)) {
    return [...existing, value];
  }

  return [existing, value];
}

function normalizePath(path: string): string {
  const [pathname = '/'] = path.split('?');

  if (pathname.length === 0) {
    return '/';
  }

  if (pathname.startsWith('/')) {
    return pathname.replace(/\/+$/u, '') || '/';
  }

  return `/${pathname.replace(/\/+$/u, '')}`;
}

function splitPath(path: string): string[] {
  if (path === '' || path === '/') {
    return [];
  }

  return path.replace(/^\/+|\/+$/gu, '').split('/').filter(Boolean);
}
```

- [x] **Step 4: Preserve `matchRoute()` compatibility**

Update `packages/router/src/route/match-route.ts`:

```ts
import { matchRouteChain } from './match-route-chain.js';
import type { DefinedRouteTable, RouteMatch } from './route-types.js';

export function matchRoute(routes: DefinedRouteTable, path: string): RouteMatch | null {
  const chain = matchRouteChain(routes, path);

  if (chain === null) {
    return null;
  }

  return chain.chain[chain.chain.length - 1] ?? null;
}
```

Update `packages/router/src/index.ts`:

```ts
export { matchRoute } from './route/match-route.js';
export { matchRouteChain } from './route/match-route-chain.js';
```

- [x] **Step 5: Run matching tests**

Run:

```bash
pnpm --filter @vanrot/router test -- tests/route/match-route-chain.test.ts tests/route/match-route.test.ts
```

Expected: PASS.

- [x] **Step 6: Checkpoint**

Do not stage or commit. Record changed files in the task notes.

## Task 3: Router State For Active Chains

**Files:**
- Modify: `packages/router/src/route/router-state.ts`
- Modify: `packages/router/src/index.ts`
- Test: `packages/router/tests/route/router-state-layout.test.ts`
- Test: `packages/router/tests/route/router-state.test.ts`

- [x] **Step 1: Add failing router-state chain tests**

Create `packages/router/tests/route/router-state-layout.test.ts`:

```ts
// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest';
import { createRoutes, defineRoutes } from '../../src/index.js';
import {
  getCurrentRouteChain,
  navigate,
  provideRouter,
  resetRouterForTests,
  routeParams,
} from '../../src/route/router-state.js';
import { createTestLayout, createTestPage } from '../../src/test/test-pages.js';

function createRouteTable() {
  const routes = createRoutes();
  const shop = routes.layout({ path: '/shop', label: 'Shop', layout: createTestLayout('shop') });
  const product = shop.layout({
    path: 'product',
    label: 'Products',
    layout: createTestLayout('product'),
  });
  const productDetail = product.page({
    path: ':productId',
    label: 'Product detail',
    page: createTestPage('product-detail'),
  });
  const cart = shop.page({ path: 'cart', label: 'Cart', page: createTestPage('cart') });

  return defineRoutes({ shop, product, productDetail, cart });
}

describe('router state layout chains', () => {
  beforeEach(() => {
    resetRouterForTests();
    window.history.replaceState(null, '', '/shop/product/42?tab=details');
  });

  it('provides the active matched chain from the browser path', () => {
    provideRouter(createRouteTable());

    expect(getCurrentRouteChain()?.chain.map((match) => match.route.key)).toEqual([
      'shop',
      'product',
      'productDetail',
    ]);
    expect(routeParams()).toEqual({ productId: '42' });
  });

  it('updates the active chain when navigating between layout children', () => {
    provideRouter(createRouteTable());
    navigate('/shop/cart');

    expect(getCurrentRouteChain()?.chain.map((match) => match.route.key)).toEqual(['shop', 'cart']);
    expect(routeParams()).toEqual({});
  });
});
```

- [x] **Step 2: Run failing router-state chain tests**

Run:

```bash
pnpm --filter @vanrot/router test -- tests/route/router-state-layout.test.ts
```

Expected: FAIL because `getCurrentRouteChain()` does not exist.

- [x] **Step 3: Update router state**

Update `packages/router/src/route/router-state.ts`:

```ts
import { signal } from '@vanrot/runtime';
import { matchRouteChain } from './match-route-chain.js';
import type { DefinedRouteTable, RouteChainMatch, RouteMatch, RouteParams } from './route-types.js';

let routes: DefinedRouteTable | null = null;
const currentRouteChain = signal<RouteChainMatch | null>(null);
const params = signal<RouteParams>({});

export const routeParams = params.asReadonly();

export function provideRouter(routeTable: DefinedRouteTable): void {
  routes = routeTable;
  updateCurrentRoute(readBrowserPath());
  listenForPopState();
}

export function navigate(path: string): void {
  requireProvidedRoutes();
  const match = updateCurrentRoute(path);

  if (match === null) {
    throw new Error(`No Vanrot route matches "${path}".`);
  }

  if (globalThis.window !== undefined) {
    globalThis.window.history.pushState(null, '', path);
  }
}

export function getCurrentRouteChain(): RouteChainMatch | null {
  return currentRouteChain();
}

export function getCurrentMatch(): RouteMatch | null {
  const chain = currentRouteChain();

  if (chain === null) {
    return null;
  }

  return chain.chain[chain.chain.length - 1] ?? null;
}

export function resetRouterForTests(): void {
  routes = null;
  currentRouteChain.set(null);
  params.set({});

  if (globalThis.window !== undefined) {
    globalThis.window.removeEventListener('popstate', handlePopState);
  }
}

function updateCurrentRoute(path: string): RouteChainMatch | null {
  const routeTable = requireProvidedRoutes();
  const match = matchRouteChain(routeTable, path);

  currentRouteChain.set(match);
  params.set(match?.params ?? {});

  return match;
}

function requireProvidedRoutes(): DefinedRouteTable {
  if (routes === null) {
    throw new Error('Call provideRouter() before using Vanrot router primitives.');
  }

  return routes;
}

function listenForPopState(): void {
  if (globalThis.window === undefined) {
    return;
  }

  globalThis.window.removeEventListener('popstate', handlePopState);
  globalThis.window.addEventListener('popstate', handlePopState);
}

function handlePopState(): void {
  updateCurrentRoute(readBrowserPath());
}

function readBrowserPath(): string {
  if (globalThis.window === undefined) {
    return '/';
  }

  return `${globalThis.window.location.pathname}${globalThis.window.location.search}`;
}
```

Update `packages/router/src/index.ts`:

```ts
export {
  getCurrentMatch,
  getCurrentRouteChain,
  navigate,
  provideRouter,
  routeParams,
} from './route/router-state.js';
```

- [x] **Step 4: Run state tests**

Run:

```bash
pnpm --filter @vanrot/router test -- tests/route/router-state-layout.test.ts tests/route/router-state.test.ts
```

Expected: PASS.

- [x] **Step 5: Checkpoint**

Do not stage or commit. Record changed files in the task notes.

## Task 4: Nested DOM Outlet Rendering

**Files:**
- Create: `packages/router/src/dom/route-outlet-context.ts`
- Modify: `packages/router/src/dom/route-outlet.ts`
- Modify: `packages/router/src/route/page-loader.ts`
- Modify: `packages/router/src/internal.ts`
- Modify: `packages/router/src/test/test-pages.ts`
- Test: `packages/router/tests/dom/route-outlet-layout.test.ts`
- Test: `packages/router/tests/dom/route-outlet.test.ts`

- [x] **Step 1: Add failing nested outlet rendering tests**

Create `packages/router/tests/dom/route-outlet-layout.test.ts`:

```ts
// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRouterOutlet } from '../../src/dom/route-outlet.js';
import { createRoutes, defineRoutes, navigate, provideRouter } from '../../src/index.js';
import { resetRouterForTests } from '../../src/route/router-state.js';
import { createTestLayout, createTestPage } from '../../src/test/test-pages.js';

async function flushRouteOutlet(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

describe('createRouterOutlet nested layouts', () => {
  let host: HTMLElement;
  let disposeOutlet: (() => void) | undefined;

  beforeEach(() => {
    resetRouterForTests();
    host = document.createElement('main');
    document.body.replaceChildren(host);
    window.history.replaceState(null, '', '/shop/product/42');
  });

  afterEach(() => {
    disposeOutlet?.();
    resetRouterForTests();
    document.body.replaceChildren();
  });

  it('renders root layout, nested layout, and leaf page through nested outlets', async () => {
    const routes = createRoutes();
    const shop = routes.layout({
      path: '/shop',
      label: 'Shop',
      layout: createTestLayout('shop-layout'),
    });
    const product = shop.layout({
      path: 'product',
      label: 'Products',
      layout: createTestLayout('product-layout'),
    });
    const productDetail = product.page({
      path: ':productId',
      label: 'Product detail',
      page: createTestPage('product-detail-page'),
    });

    provideRouter(defineRoutes({ shop, product, productDetail }));
    disposeOutlet = createRouterOutlet(host, { kind: 'router' });
    await flushRouteOutlet();

    expect(host.textContent).toBe('shop-layoutproduct-layoutproduct-detail-page');
    expect(host.querySelectorAll('[data-test-layout]').length).toBe(2);
    expect(host.querySelectorAll('[data-test-page]').length).toBe(1);
  });

  it('keeps shared parent layouts mounted during sibling navigation', async () => {
    const destroyed = {
      shop: vi.fn(),
      cart: vi.fn(),
      product: vi.fn(),
      productDetail: vi.fn(),
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
    });
    const cart = shop.page({
      path: 'cart',
      label: 'Cart',
      page: createTestPage('cart-page', destroyed.cart),
    });

    provideRouter(defineRoutes({ shop, product, productDetail, cart }));
    disposeOutlet = createRouterOutlet(host, { kind: 'router' });
    await flushRouteOutlet();

    navigate('/shop/cart');
    await flushRouteOutlet();

    expect(destroyed.shop).not.toHaveBeenCalled();
    expect(destroyed.product).toHaveBeenCalledOnce();
    expect(destroyed.productDetail).toHaveBeenCalledOnce();
    expect(destroyed.cart).not.toHaveBeenCalled();
    expect(host.textContent).toBe('shop-layoutcart-page');
  });

  it('destroys the active branch when leaving it', async () => {
    const destroyed = {
      shop: vi.fn(),
      cart: vi.fn(),
      home: vi.fn(),
    };
    const routes = createRoutes();
    const home = routes.page({
      path: '/',
      label: 'Home',
      page: createTestPage('home-page', destroyed.home),
    });
    const shop = routes.layout({
      path: '/shop',
      label: 'Shop',
      layout: createTestLayout('shop-layout', destroyed.shop),
    });
    const cart = shop.page({
      path: 'cart',
      label: 'Cart',
      page: createTestPage('cart-page', destroyed.cart),
    });

    window.history.replaceState(null, '', '/shop/cart');
    provideRouter(defineRoutes({ home, shop, cart }));
    disposeOutlet = createRouterOutlet(host, { kind: 'router' });
    await flushRouteOutlet();

    navigate('/');
    await flushRouteOutlet();

    expect(destroyed.cart).toHaveBeenCalledOnce();
    expect(destroyed.shop).toHaveBeenCalledOnce();
    expect(destroyed.home).not.toHaveBeenCalled();
    expect(host.textContent).toBe('home-page');
  });

  it('loads lazy pages under layouts without preloading inactive children', async () => {
    const loadProductDetail = vi.fn(async () => createTestPage('product-detail-page'));
    const loadCart = vi.fn(async () => createTestPage('cart-page'));
    const routes = createRoutes();
    const shop = routes.layout({
      path: '/shop',
      label: 'Shop',
      layout: createTestLayout('shop-layout'),
    });
    const product = shop.layout({
      path: 'product',
      label: 'Products',
      layout: createTestLayout('product-layout'),
    });
    const productDetail = product.page({
      path: ':productId',
      label: 'Product detail',
      loadPage: loadProductDetail,
    });
    const cart = shop.page({
      path: 'cart',
      label: 'Cart',
      loadPage: loadCart,
    });

    provideRouter(defineRoutes({ shop, product, productDetail, cart }));
    disposeOutlet = createRouterOutlet(host, { kind: 'router' });
    await flushRouteOutlet();

    expect(loadProductDetail).toHaveBeenCalledOnce();
    expect(loadCart).not.toHaveBeenCalled();
    expect(host.textContent).toBe('shop-layoutproduct-layoutproduct-detail-page');
  });
});
```

- [x] **Step 2: Run failing DOM tests**

Run:

```bash
pnpm --filter @vanrot/router test -- tests/dom/route-outlet-layout.test.ts
```

Expected: FAIL because nested outlet context and layout rendering do not exist.

- [x] **Step 3: Add outlet depth context**

Create `packages/router/src/dom/route-outlet-context.ts`:

```ts
const outletDepthStack: number[] = [];

export function readCurrentOutletDepth(): number {
  return outletDepthStack[outletDepthStack.length - 1] ?? -1;
}

export function runWithOutletDepth<T>(depth: number, callback: () => T): T {
  outletDepthStack.push(depth);

  try {
    return callback();
  } finally {
    outletDepthStack.pop();
  }
}
```

- [x] **Step 4: Support layout loaders**

Update `packages/router/src/route/page-loader.ts`:

```ts
import type { DefinedRoute, RouteLayoutModule, RoutePageModule } from './route-types.js';

export async function resolveRoutePage(route: DefinedRoute): Promise<RoutePageModule> {
  if (route.page !== undefined) {
    return route.page;
  }

  if (route.loadPage === undefined) {
    throw new Error(`Route "${route.key}" does not define page or loadPage.`);
  }

  const loaded = await route.loadPage();
  return 'default' in loaded ? loaded.default : loaded;
}

export async function resolveRouteLayout(route: DefinedRoute): Promise<RouteLayoutModule> {
  if (route.layout !== undefined) {
    return route.layout;
  }

  if (route.loadLayout === undefined) {
    throw new Error(`Route "${route.key}" does not define layout or loadLayout.`);
  }

  const loaded = await route.loadLayout();
  return 'default' in loaded ? loaded.default : loaded;
}
```

- [x] **Step 5: Render one chain depth per outlet**

Update `packages/router/src/dom/route-outlet.ts`:

```ts
import { effect, mount, onDestroy, type AppHandle, type ComponentType, type Dispose } from '@vanrot/runtime';
import { readCurrentOutletDepth, runWithOutletDepth } from './route-outlet-context.js';
import { resolveRouteLayout, resolveRoutePage } from '../route/page-loader.js';
import { getCurrentRouteChain } from '../route/router-state.js';
import type { DefinedRoute } from '../route/route-types.js';

export interface RouterOutletOptions {
  kind?: 'router' | 'outlet';
}

export function createRouterOutlet(host: Element, options: RouterOutletOptions = {}): Dispose {
  const depth = options.kind === 'router' ? 0 : readCurrentOutletDepth() + 1;
  let mountedRoute: DefinedRoute | null = null;
  let mountedComponent: AppHandle | null = null;
  let version = 0;

  const dispose = effect(() => {
    const chain = getCurrentRouteChain();
    const currentVersion = ++version;
    const match = chain?.chain[depth];

    if (match === undefined) {
      disposeMountedComponent();
      host.replaceChildren(createRouterMessage('No route matched.'));
      return;
    }

    if (mountedRoute === match.route) {
      return;
    }

    disposeMountedComponent();
    host.replaceChildren();

    void resolveRouteComponent(match.route)
      .then((component) => {
        if (currentVersion !== version) {
          return;
        }

        runWithOutletDepth(depth, () => {
          mountedComponent = mount(component, host);
          mountedRoute = match.route;
        });
      })
      .catch((error: unknown) => {
        if (currentVersion !== version) {
          return;
        }

        host.replaceChildren(createRouterMessage(errorMessage(error)));
      });
  });

  onDestroy(() => {
    dispose();
    disposeMountedComponent();
  });

  return () => {
    dispose();
    disposeMountedComponent();
  };

  function disposeMountedComponent(): void {
    mountedComponent?.destroy();
    mountedComponent = null;
    mountedRoute = null;
  }
}

async function resolveRouteComponent(route: DefinedRoute): Promise<ComponentType> {
  if (route.kind === 'layout') {
    return resolveRouteLayout(route);
  }

  return resolveRoutePage(route);
}

function createRouterMessage(message: string): Text {
  return document.createTextNode(message);
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Could not load route page.';
}
```

- [x] **Step 6: Update router test helpers**

Update `packages/router/src/test/test-pages.ts`:

```ts
import { onDestroy, type CompiledComponentModule } from '@vanrot/runtime';
import { createRouterOutlet } from '../dom/route-outlet.js';

export function createTestPage(name: string, destroy?: () => void): CompiledComponentModule {
  return {
    createComponent() {
      const node = document.createElement('section');
      node.dataset.testPage = name;
      node.textContent = name;

      if (destroy !== undefined) {
        onDestroy(destroy);
      }

      return {
        node,
        ctx: {},
      };
    },
  };
}

export function createTestLayout(name: string, destroy?: () => void): CompiledComponentModule {
  return {
    createComponent() {
      const node = document.createElement('section');
      node.dataset.testLayout = name;
      const label = document.createElement('span');
      label.textContent = name;
      const outlet = document.createElement('div');
      createRouterOutlet(outlet, { kind: 'outlet' });
      node.append(label, outlet);

      if (destroy !== undefined) {
        onDestroy(destroy);
      }

      return {
        node,
        ctx: {},
      };
    },
  };
}
```

- [x] **Step 7: Export internal outlet options**

Update `packages/router/src/internal.ts`:

```ts
export { setupRouteLink } from './dom/route-link.js';
export { createRouterOutlet, type RouterOutletOptions } from './dom/route-outlet.js';
```

- [x] **Step 8: Run DOM tests**

Run:

```bash
pnpm --filter @vanrot/router test -- tests/dom/route-outlet-layout.test.ts tests/dom/route-outlet.test.ts
```

Expected: PASS.

- [x] **Step 9: Checkpoint**

Do not stage or commit. Record changed files in the task notes.

## Task 5: Compiler Router And Outlet Lowering

**Files:**
- Modify: `packages/compiler/src/api/types.ts`
- Modify: `packages/compiler/src/codegen/state.ts`
- Modify: `packages/compiler/src/codegen/generate-component.ts`
- Create: `packages/compiler/src/router/router-template-diagnostics.ts`
- Modify: `packages/compiler/src/api/compile-component.ts`
- Modify: `packages/compiler/src/index.ts`
- Test: `packages/compiler/tests/codegen/generate-component.test.ts`
- Test: `packages/compiler/tests/router/router-template-diagnostics.test.ts`

- [x] **Step 1: Add failing codegen tests for router and outlet**

Append to `packages/compiler/tests/codegen/generate-component.test.ts`:

```ts
it('generates root router with router outlet mode', () => {
  const templateSource = '<main><vr-router></vr-router></main>';

  const result = generateComponent({
    metadata,
    nodes: parseNodes(templateSource, 'app.layout.html'),
    scopeAttribute: 'data-vr-a1b2c3',
    templatePath: 'app.layout.html',
    templateSource,
  });

  expect(result.js).toContain("import { createRouterOutlet } from '@vanrot/router/internal';");
  expect(result.js).toContain("createRouterOutlet(vr_router1, { kind: 'router' });");
  expect(result.features).toContain('router-root');
});

it('generates route layout outlet with child outlet mode', () => {
  const templateSource = '<section><vr-outlet></vr-outlet></section>';

  const result = generateComponent({
    metadata,
    nodes: parseNodes(templateSource, 'shop.layout.html'),
    scopeAttribute: 'data-vr-a1b2c3',
    templatePath: 'shop.layout.html',
    templateSource,
  });

  expect(result.js).toContain("import { createRouterOutlet } from '@vanrot/router/internal';");
  expect(result.js).toContain("createRouterOutlet(vr_outlet1, { kind: 'outlet' });");
  expect(result.features).toContain('router-outlet');
});
```

- [x] **Step 2: Add failing compiler diagnostic tests**

Create `packages/compiler/tests/router/router-template-diagnostics.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { diagnoseRouterTemplateUsage } from '../../src/router/router-template-diagnostics.js';
import { parseTemplate } from '../../src/template/parse-template.js';

function diagnosticsFor(templateSource: string, templatePath: string) {
  return diagnoseRouterTemplateUsage(parseTemplate(templateSource, templatePath).nodes, templatePath);
}

describe('router template diagnostics', () => {
  it('reports multiple root routers in app layout', () => {
    const diagnostics = diagnosticsFor('<vr-router></vr-router><vr-router></vr-router>', 'app.layout.html');

    expect(diagnostics.map((diagnostic) => diagnostic.code)).toEqual(['VR_ROUTER_MULTIPLE_ROOTS']);
    expect(diagnostics[0]?.message).toBe('App layout templates can contain only one <vr-router />.');
  });

  it('reports root router outside app layout', () => {
    const diagnostics = diagnosticsFor('<vr-router></vr-router>', 'shop.layout.html');

    expect(diagnostics.map((diagnostic) => diagnostic.code)).toEqual(['VR_ROUTER_OUTSIDE_APP_LAYOUT']);
  });

  it('reports outlet outside route layout', () => {
    const diagnostics = diagnosticsFor('<vr-outlet></vr-outlet>', 'home.page.html');

    expect(diagnostics.map((diagnostic) => diagnostic.code)).toEqual(['VR_OUTLET_OUTSIDE_LAYOUT']);
  });

  it('reports page templates that contain outlets', () => {
    const diagnostics = diagnosticsFor('<article><vr-outlet></vr-outlet></article>', 'product.page.html');

    expect(diagnostics.map((diagnostic) => diagnostic.code)).toContain('VR_PAGE_HAS_OUTLET');
  });

  it('reports route layouts without outlets', () => {
    const diagnostics = diagnosticsFor('<section>Shop</section>', 'shop.layout.html');

    expect(diagnostics.map((diagnostic) => diagnostic.code)).toEqual(['VR_LAYOUT_MISSING_OUTLET']);
  });

  it('reports route layouts with multiple outlets', () => {
    const diagnostics = diagnosticsFor(
      '<section><vr-outlet></vr-outlet><vr-outlet></vr-outlet></section>',
      'shop.layout.html',
    );

    expect(diagnostics.map((diagnostic) => diagnostic.code)).toEqual(['VR_LAYOUT_MULTIPLE_OUTLETS']);
  });
});
```

- [x] **Step 3: Run failing compiler tests**

Run:

```bash
pnpm --filter @vanrot/compiler test -- tests/codegen/generate-component.test.ts tests/router/router-template-diagnostics.test.ts
```

Expected: FAIL because `<vr-outlet />`, new features, and router template diagnostics do not exist.

- [x] **Step 4: Add compiler codes and features**

Update `packages/compiler/src/api/types.ts`:

```ts
export type DiagnosticCode =
  | 'VR001'
  | 'VR002'
  | 'VR003'
  | 'VR004'
  | 'VR005'
  | 'VR006'
  | 'VR007'
  | 'VR008'
  | 'VR009'
  | 'VR010'
  | 'VR011'
  | 'VR012'
  | 'VR013'
  | 'VR014'
  | 'VR015'
  | 'VR016'
  | 'VR017'
  | 'VR018'
  | 'VR_ROUTER_MULTIPLE_ROOTS'
  | 'VR_ROUTER_OUTSIDE_APP_LAYOUT'
  | 'VR_LAYOUT_MISSING_OUTLET'
  | 'VR_LAYOUT_MULTIPLE_OUTLETS'
  | 'VR_OUTLET_OUTSIDE_LAYOUT'
  | 'VR_PAGE_HAS_OUTLET';

export type CompileFeature =
  | 'file-convention'
  | 'component-class'
  | 'text-interpolation'
  | 'event-binding'
  | 'property-binding'
  | 'child-component'
  | 'scoped-css'
  | 'readable-output'
  | 'expression-rewriting'
  | 'control-flow-if'
  | 'control-flow-for'
  | 'router-root'
  | 'router-outlet'
  | 'router-link'
  | 'ui-button';
```

- [x] **Step 5: Track root router and child outlet separately**

Update `packages/compiler/src/codegen/state.ts`:

```ts
export interface GenerateState {
  ids: IdentifierAllocator;
  lines: string[];
  diagnostics: CompileDiagnostic[];
  features: Set<CompileFeature>;
  componentDependencies: ComponentDependency[];
  mappings: SourceMapping[];
  usesEffect: boolean;
  usesSignal: boolean;
  usesCleanupScopes: boolean;
  usesRegisterCleanup: boolean;
  usesListen: boolean;
  usesRouterRoot: boolean;
  usesRouterOutlet: boolean;
  usesRouteLink: boolean;
  usesSlots: boolean;
  templatePath: string;
  templateSource: string;
  localIdentifiers: string[];
  localSignalIdentifiers: string[];
}

export function createGenerateState(input: CreateGenerateStateInput): GenerateState {
  return {
    ids: new IdentifierAllocator(),
    lines: [],
    diagnostics: [],
    features: new Set<CompileFeature>(['readable-output']),
    componentDependencies: [],
    mappings: [],
    usesEffect: false,
    usesSignal: false,
    usesCleanupScopes: false,
    usesRegisterCleanup: false,
    usesListen: false,
    usesRouterRoot: false,
    usesRouterOutlet: false,
    usesRouteLink: false,
    usesSlots: false,
    templatePath: input.templatePath,
    templateSource: input.templateSource,
    localIdentifiers: [],
    localSignalIdentifiers: [],
  };
}
```

- [x] **Step 6: Lower `<vr-router />` and `<vr-outlet />`**

Update the router generation branch in `packages/compiler/src/codegen/generate-component.ts`:

```ts
function generateElement(
  node: ElementNode,
  parentName: string,
  scopeAttribute: string,
  state: GenerateState,
): void {
  if (node.tagName === 'vr-router') {
    generateRouterOutletElement(node, parentName, scopeAttribute, state, 'router');
    return;
  }

  if (node.tagName === 'vr-outlet') {
    generateRouterOutletElement(node, parentName, scopeAttribute, state, 'outlet');
    return;
  }

  if (node.tagName === 'vr') {
    generateRouterLink(node, parentName, scopeAttribute, state);
    return;
  }

  generateNormalElement(node, parentName, scopeAttribute, state);
}

function generateRouterOutletElement(
  node: ElementNode,
  parentName: string,
  scopeAttribute: string,
  state: GenerateState,
  kind: 'router' | 'outlet',
): void {
  const outletName = state.ids.next(node.tagName.replace('-', '_'));

  if (kind === 'router') {
    state.usesRouterRoot = true;
    state.features.add('router-root');
  }

  if (kind === 'outlet') {
    state.usesRouterOutlet = true;
    state.features.add('router-outlet');
  }

  state.lines.push(`  const ${outletName} = document.createElement('div');`);
  state.lines.push(`  ${outletName}.setAttribute(${quoteString(scopeAttribute)}, '');`);
  state.lines.push(`  createRouterOutlet(${outletName}, { kind: ${quoteString(kind)} });`);
  state.lines.push(`  ${parentName}.append(${outletName});`);
}
```

Update import collection in the same file:

```ts
const routerImports: string[] = [];

if (state.usesRouterRoot || state.usesRouterOutlet) {
  routerImports.push('createRouterOutlet');
}

if (state.usesRouteLink) {
  routerImports.push('setupRouteLink');
}

if (routerImports.length > 0) {
  imports.push(`import { ${routerImports.join(', ')} } from '@vanrot/router/internal';`);
}
```

- [x] **Step 7: Add router template diagnostics**

Create `packages/compiler/src/router/router-template-diagnostics.ts`:

```ts
import type { CompileDiagnostic, DiagnosticCode } from '../api/types.js';
import { createDiagnostic } from '../diagnostics/diagnostics.js';
import type { ElementNode, TemplateNode } from '../template/ast.js';

export function diagnoseRouterTemplateUsage(
  nodes: TemplateNode[],
  templatePath: string,
): CompileDiagnostic[] {
  const routerNodes = collectElements(nodes, 'vr-router');
  const outletNodes = collectElements(nodes, 'vr-outlet');
  const diagnostics: CompileDiagnostic[] = [];
  const isAppLayout = templatePath.endsWith('app.layout.html');
  const isRouteLayout = templatePath.endsWith('.layout.html') && !isAppLayout;
  const isPage = templatePath.endsWith('.page.html');

  if (routerNodes.length > 1) {
    diagnostics.push(
      diagnostic(
        'VR_ROUTER_MULTIPLE_ROOTS',
        'App layout templates can contain only one <vr-router />.',
        templatePath,
        routerNodes[1],
        'Keep one root <vr-router /> in app.layout.html.',
      ),
    );
  }

  if (routerNodes.length > 0 && !isAppLayout) {
    diagnostics.push(
      diagnostic(
        'VR_ROUTER_OUTSIDE_APP_LAYOUT',
        '<vr-router /> can only be used in app.layout.html.',
        templatePath,
        routerNodes[0],
        'Move <vr-router /> to app.layout.html and use <vr-outlet /> inside route layouts.',
      ),
    );
  }

  if (outletNodes.length > 0 && !isRouteLayout) {
    diagnostics.push(
      diagnostic(
        'VR_OUTLET_OUTSIDE_LAYOUT',
        '<vr-outlet /> can only be used in route layout templates.',
        templatePath,
        outletNodes[0],
        'Move <vr-outlet /> to a route .layout.html file.',
      ),
    );
  }

  if (isPage && outletNodes.length > 0) {
    diagnostics.push(
      diagnostic(
        'VR_PAGE_HAS_OUTLET',
        'Page templates cannot contain <vr-outlet />.',
        templatePath,
        outletNodes[0],
        'Change the route to a layout route or remove <vr-outlet /> from the page template.',
      ),
    );
  }

  if (isRouteLayout && outletNodes.length === 0) {
    diagnostics.push(
      diagnostic(
        'VR_LAYOUT_MISSING_OUTLET',
        'Route layout templates must contain one <vr-outlet />.',
        templatePath,
        undefined,
        'Add <vr-outlet /> to the route layout template.',
      ),
    );
  }

  if (isRouteLayout && outletNodes.length > 1) {
    diagnostics.push(
      diagnostic(
        'VR_LAYOUT_MULTIPLE_OUTLETS',
        'Route layout templates can contain only one <vr-outlet />.',
        templatePath,
        outletNodes[1],
        'Keep one <vr-outlet /> in the route layout template.',
      ),
    );
  }

  return diagnostics;
}

function collectElements(nodes: TemplateNode[], tagName: string): ElementNode[] {
  const matches: ElementNode[] = [];

  for (const node of nodes) {
    if (node.kind !== 'element') {
      continue;
    }

    if (node.tagName === tagName) {
      matches.push(node);
    }

    matches.push(...collectElements(node.children, tagName));
  }

  return matches;
}

function diagnostic(
  code: DiagnosticCode,
  message: string,
  templatePath: string,
  node: ElementNode | undefined,
  suggestion: string,
): CompileDiagnostic {
  return createDiagnostic(
    code,
    'error',
    message,
    templatePath,
    node?.span.line ?? 1,
    node?.span.column ?? 1,
    suggestion,
    `/docs/router/${code.toLowerCase().replaceAll('_', '-')}`,
  );
}
```

- [x] **Step 8: Wire diagnostics into compile**

Update `packages/compiler/src/api/compile-component.ts` after `parseTemplate(...)`:

```ts
const routerDiagnostics = diagnoseRouterTemplateUsage(parsedTemplate.nodes, source.templatePath);

diagnostics.push(
  ...parsedTemplate.diagnostics,
  ...routerDiagnostics,
  ...templateBindings.diagnostics,
  ...scopedCss.diagnostics,
  ...generated.diagnostics,
);
```

Add import:

```ts
import { diagnoseRouterTemplateUsage } from '../router/router-template-diagnostics.js';
```

Update `packages/compiler/src/index.ts`:

```ts
export { diagnoseRouterTemplateUsage } from './router/router-template-diagnostics.js';
```

- [x] **Step 9: Run compiler tests**

Run:

```bash
pnpm --filter @vanrot/compiler test -- tests/codegen/generate-component.test.ts tests/router/router-template-diagnostics.test.ts
```

Expected: PASS.

- [x] **Step 10: Checkpoint**

Do not stage or commit. Record changed files in the task notes.

## Task 6: Starter Template And Route-Owned Navigation

**Files:**
- Modify: `packages/cli/src/create/app-template.ts`
- Modify: `packages/cli/tests/create.test.ts`

- [x] **Step 1: Add failing starter assertions**

Append to `packages/cli/tests/create.test.ts`:

```ts
it('creates Phase 15B route layouts without route literals outside src/routes.ts', async () => {
  const cwd = await tempRoot();
  const reporter = createMemoryReporter();

  const result = await runCli(['create', 'nested-router-app'], { cwd, reporter });
  const appRoot = join(cwd, 'nested-router-app');
  const routesSource = await readFile(join(appRoot, 'src', 'routes.ts'), 'utf8');
  const appLayout = await readFile(join(appRoot, 'src', 'app', 'app.layout.html'), 'utf8');
  const shopLayout = await readFile(
    join(appRoot, 'src', 'layouts', 'shop', 'shop.layout.html'),
    'utf8',
  );
  const homePage = await readFile(join(appRoot, 'src', 'pages', 'home', 'home.page.html'), 'utf8');
  const cartPage = await readFile(join(appRoot, 'src', 'pages', 'cart', 'cart.page.html'), 'utf8');

  expect(result.exitCode).toBe(0);
  expect(routesSource).toContain('const routes = createRoutes();');
  expect(routesSource).toContain('const shop = routes.layout({');
  expect(routesSource).toContain('const shopIndex = shop.page({');
  expect(routesSource).toContain('const cart = shop.page({');
  expect(routesSource).toContain('nav: routes.nav.primary(),');
  expect(routesSource).toContain('nav: routes.nav.hidden(),');
  expect(appLayout).toContain('<vr-router></vr-router>');
  expect(shopLayout).toContain('<vr-outlet></vr-outlet>');
  expect(homePage).not.toContain('/shop');
  expect(homePage).not.toContain('Shop');
  expect(cartPage).not.toContain('/shop');
  expect(cartPage).not.toContain('Cart');
});
```

- [x] **Step 2: Run failing CLI test**

Run:

```bash
pnpm --filter @vanrot/cli test -- tests/create.test.ts
```

Expected: FAIL because the starter still uses `app.component.html` as the router root and does not generate a route layout example.

- [x] **Step 3: Update generated starter routes**

In `packages/cli/src/create/app-template.ts`, update the generated `src/routes.ts` content:

```ts
content: `import { createRoutes, defineRoutes } from '@vanrot/router';\nimport { HomePage } from './pages/home/home.page.ts';\nimport { ShopLayout } from './layouts/shop/shop.layout.ts';\nimport { ShopPage } from './pages/shop/shop.page.ts';\nimport { CartPage } from './pages/cart/cart.page.ts';\n\nconst routes = createRoutes();\n\nconst home = routes.page({\n  path: '/',\n  label: 'Home',\n  page: HomePage,\n  nav: routes.nav.primary(),\n});\n\nconst shop = routes.layout({\n  path: '/shop',\n  label: 'Shop',\n  layout: ShopLayout,\n  nav: routes.nav.primary(),\n});\n\nconst shopIndex = shop.page({\n  path: '',\n  label: 'Shop',\n  page: ShopPage,\n  nav: routes.nav.hidden(),\n});\n\nconst cart = shop.page({\n  path: 'cart',\n  label: 'Cart',\n  page: CartPage,\n  nav: routes.nav.primary(),\n});\n\nexport const route = defineRoutes({\n  home,\n  shop,\n  shopIndex,\n  cart,\n});\n`,
```

- [x] **Step 4: Add app layout and shop layout files**

In `packages/cli/src/create/app-template.ts`, add generated files:

```ts
{
  path: 'src/app/app.layout.ts',
  content: `import { route as appRoute } from '../routes.ts';\n\nexport class AppLayout {\n  route = appRoute;\n}\n`,
},
{
  path: 'src/app/app.layout.html',
  content: `<app-header></app-header>\n<vr-router></vr-router>\n`,
},
{
  path: 'src/layouts/shop/shop.layout.ts',
  content: `import { route as appRoute } from '../../routes.ts';\n\nexport class ShopLayout {\n  route = appRoute;\n}\n`,
},
{
  path: 'src/layouts/shop/shop.layout.html',
  content: `<shop-sidebar></shop-sidebar>\n<vr-outlet></vr-outlet>\n`,
},
{
  path: 'src/layouts/shop/shop.layout.css',
  content: `:host {\n  display: block;\n}\n`,
},
```

- [x] **Step 5: Keep page templates free from route literals**

In `packages/cli/src/create/app-template.ts`, update generated page templates so route paths and labels stay in `src/routes.ts`:

```ts
{
  path: 'src/pages/home/home.page.html',
  content: `<section>\n  <h1>{{ copy('home.title') }}</h1>\n  <p>{{ copy('home.summary') }}</p>\n</section>\n`,
},
{
  path: 'src/pages/shop/shop.page.html',
  content: `<section>\n  <h1>{{ copy('shop.title') }}</h1>\n  <p>{{ copy('shop.summary') }}</p>\n</section>\n`,
},
{
  path: 'src/pages/cart/cart.page.html',
  content: `<section>\n  <h1>{{ copy('cart.title') }}</h1>\n  <p>{{ copy('cart.summary') }}</p>\n</section>\n`,
},
```

- [x] **Step 6: Update main mount import**

In `packages/cli/src/create/app-template.ts`, update `src/main.ts` content to mount `AppLayout`:

```ts
content: `import { mount } from '@vanrot/runtime';\nimport { provideRouter } from '@vanrot/router';\nimport { AppLayout } from './app/app.layout.ts';\nimport { route as appRoute } from './routes.ts';\n${uiAppFile.tokenImport}\n\nconst target = document.getElementById('app');\n\nif (target === null) {\n  throw new Error('Missing #app mount target.');\n}\n\nprovideRouter(appRoute);\nmount(AppLayout, target);\n`,
```

- [x] **Step 7: Run CLI tests**

Run:

```bash
pnpm --filter @vanrot/cli test -- tests/create.test.ts
```

Expected: PASS.

- [x] **Step 8: Checkpoint**

Do not stage or commit. Record changed files in the task notes.

## Task 7: Production Verification And Docs

**Files:**
- Modify: `docs/superpowers/feature-maturity.md`
- Modify: `docs/superpowers/final-tdd-inventory.md`
- Modify: `docs/vanrot-presentation.html`
- Modify: `docs/superpowers/plans/Phase-15B.md`

- [x] **Step 1: Update final TDD inventory**

Add rows to the `@vanrot/router` section of `docs/superpowers/final-tdd-inventory.md`:

```md
| router | nested layout routes | Production-Ready | Root layouts, child layouts, index child pages, params, query values, shared-layout retention, cleanup, lazy child page loading, and diagnostics are covered. | Phase 15B | Depends on Phase 15A route contract. |
| router | route registry order | Production-Ready | `defineRoutes({ ... })` order is canonical for rendering, generated navigation, diagnostics, and docs examples. Child-before-parent route order fails with a stable diagnostic. | Phase 15B | No route-name string parent references. |
| compiler | router and outlet placement | Production-Ready | `<vr-router />` is allowed only once in `app.layout.html`; `<vr-outlet />` is required exactly once in route layout templates and rejected in page templates. | Phase 15B | Compiler diagnostics expose source positions. |
| cli | nested router starter | Production-Ready | Generated starter uses `app.layout.*`, route layout examples, route-owned nav metadata, and no repeated route path or label literals outside `src/routes.ts`. | Phase 15B | Keeps the framework rule visible in new apps. |
```

- [x] **Step 2: Update feature maturity ledger**

In `docs/superpowers/feature-maturity.md`, update the Phase 15 router rows that mention nested routes/layouts so Phase 15B is named as the owner. Use this exact note text where the nested-layout row exists:

```md
Phase 15B adds nested layout rendering through one app-level `<vr-router />`, route-local `<vr-outlet />`, index child pages, route-owned nav metadata, shared-layout retention, and diagnostics for invalid parent/child relationships.
```

- [x] **Step 3: Update presentation roadmap after completion only**

When all Phase 15B tests and `pnpm verify` pass, update `docs/vanrot-presentation.html` so the roadmap still shows Phase 15 active unless the whole Phase 15 router production scope is complete. Use this visible copy for the Phase 15 detail:

```html
<li>15B nested layout routing: root router, route outlets, index pages, shared layout retention, and diagnostics.</li>
```

- [x] **Step 4: Run focused verification**

Run:

```bash
pnpm --filter @vanrot/router test -- tests/route/define-routes-layout.test.ts tests/route/match-route-chain.test.ts tests/route/router-state-layout.test.ts tests/dom/route-outlet-layout.test.ts
pnpm --filter @vanrot/compiler test -- tests/codegen/generate-component.test.ts tests/router/router-template-diagnostics.test.ts
pnpm --filter @vanrot/cli test -- tests/create.test.ts
```

Expected: PASS for all three commands.

- [x] **Step 5: Run full verification**

Run:

```bash
pnpm verify
```

Expected: PASS.

- [x] **Step 6: Update this plan checklist**

After all tests pass, mark every completed checkbox in `docs/superpowers/plans/Phase-15B.md`. Leave unchecked only if work was deliberately moved into a named future phase.

- [x] **Step 7: Final status**

Report changed files, verification commands, `git status --short --branch`, and unrelated local changes left untouched. Do not stage or commit unless the user explicitly asks.

## Self-Review

Spec coverage:

- Route hierarchy by route object refs: Task 1.
- Canonical registry order and child-before-parent diagnostics: Task 1.
- Only `layout(...)` and `page(...)`, no group route: Task 1.
- Root `<vr-router />` once in app layout: Task 5 and Task 6.
- Route-local `<vr-outlet />`: Task 4 and Task 5.
- Pages remain leaf screens: Task 1 and Task 5.
- Index child pages with `path: ''`: Task 1 and Task 2.
- Params and query values through nested chains: Task 2 and Task 3.
- Shared layout retention and cleanup: Task 4.
- Lazy child loading without inactive preloading: Task 4.
- Route-owned nav metadata and starter no repeated route strings: Task 1 and Task 6.
- Diagnostics from the spec: Task 1 and Task 5.
- Final docs and verification: Task 7.

Placeholder scan:

- No blocked-marker text, vague validation step, vague test step, or out-of-order type name remains in this plan.

Type consistency:

- `RouteChainMatch`, `RouteMatch`, `DefinedRoute`, `RouteNavMetadata`, `createRoutes()`, `defineRoutes()`, `matchRouteChain()`, `getCurrentRouteChain()`, and `createRouterOutlet(host, { kind })` are used consistently across tasks.
