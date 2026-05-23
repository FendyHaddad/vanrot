# Phase 15A Route Contract Production Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. This repository forbids subagent-driven Superpowers workflows and user-owned git means every task ends with a review checkpoint, not an automatic commit.

**Goal:** Make `@vanrot/router` production-ready for route definitions, typed params, query strings, route links, breadcrumbs, active state, diagnostics, and starter output without repeated route string literals in user pages, templates, or CSS.

**Architecture:** Keep `src/routes.ts` as the route source of truth and preserve object-form `defineRoutes(...)` compatibility while adding a builder-form route graph. Put route graph normalization, params, query handling, URL building, breadcrumbs, and route diagnostics inside `@vanrot/router`; keep compiler work limited to lowering `<vr ... />` and `<vr-breadcrumbs />` into router internal helpers. CLI starter templates should consume the public route object and keep route paths, labels, and route keys out of page HTML/CSS/TS.

**Tech Stack:** TypeScript, Vitest, jsdom, `@vanrot/router`, `@vanrot/compiler`, `@vanrot/cli`, `@vanrot/runtime` signals/effects.

---

## File Structure

- Create `packages/router/src/route/route-diagnostic-codes.ts`: named source of truth for route diagnostic codes.
- Create `packages/router/src/route/route-diagnostics.ts`: diagnostic shape and factory helpers shared by router runtime, compiler-facing helpers, and CLI/dev surfaces.
- Create `packages/router/src/route/create-routes.ts`: `createRoutes()` builder API, route ref branding, child page builders, child path normalization, and breadcrumb helpers.
- Create `packages/router/src/route/path-params.ts`: route path param extraction, validation, path matching, and encoded URL segment replacement.
- Create `packages/router/src/route/query-string.ts`: query metadata, defaults, arrays, parsing, and serialization.
- Create `packages/router/src/route/url-builder.ts`: public route URL builder used by links, navigation, breadcrumbs, and tests.
- Create `packages/router/src/route/breadcrumbs.ts`: breadcrumb definition resolution and current-match breadcrumb model.
- Create `packages/router/src/dom/route-breadcrumbs.ts`: DOM helper for `<vr-breadcrumbs />`.
- Modify `packages/router/src/route/route-types.ts`: extend route definitions with builder refs, query metadata, breadcrumb metadata, active metadata, and typed URL inputs.
- Modify `packages/router/src/route/define-routes.ts`: accept object form and builder callback form, normalize route records, validate graph diagnostics, and return a typed route table.
- Modify `packages/router/src/route/match-route.ts`: move matching onto `path-params.ts` helpers and return query values without letting query strings affect route matching.
- Modify `packages/router/src/route/router-state.ts`: expose current match, query values, URL navigation by route ref, and active state subscriptions.
- Modify `packages/router/src/dom/route-link.ts`: accept params/query/options, build URLs, set route-owned text, set exact/ancestor active attributes, and preserve normal browser navigation behavior.
- Modify `packages/router/src/index.ts` and `packages/router/src/internal.ts`: export the new public and compiler-facing helpers.
- Modify `packages/compiler/src/codegen/generate-component.ts`: lower `<vr route.name param.* query.* />` and `<vr-breadcrumbs />` to router internal helpers with source-rich diagnostics.
- Modify `packages/compiler/tests/codegen/generate-component.test.ts`: cover route link params/query and breadcrumb lowering.
- Modify `packages/cli/src/create/app-template.ts`: generate route-owned strings only in `src/routes.ts` and no route literals in page templates/CSS.
- Modify `packages/cli/tests/create.test.ts`: assert starter route ownership and new breadcrumb/link output.
- Modify `docs/superpowers/final-tdd-inventory.md`, `docs/superpowers/feature-maturity.md`, and `docs/vanrot-presentation.html` only in the final phase-completion task after implementation and verification pass.

## Task 1: Route Diagnostics Foundation

**Files:**
- Create: `packages/router/src/route/route-diagnostic-codes.ts`
- Create: `packages/router/src/route/route-diagnostics.ts`
- Modify: `packages/router/src/index.ts`
- Test: `packages/router/tests/route/route-diagnostics.test.ts`

- [ ] **Step 1: Write failing diagnostic tests**

Create `packages/router/tests/route/route-diagnostics.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { routeDiagnosticCodes } from '../../src/route/route-diagnostic-codes.js';
import { createRouteDiagnostic } from '../../src/route/route-diagnostics.js';

describe('route diagnostics', () => {
  it('creates diagnostics with code, message, source span, suggestion, and docs hook', () => {
    const diagnostic = createRouteDiagnostic({
      code: routeDiagnosticCodes.duplicatePath,
      message: 'Route path "/shop" is already used by "shop".',
      filePath: 'src/routes.ts',
      line: 8,
      column: 5,
      suggestion: 'Give one route a different path.',
      docsPath: 'router/routes#duplicate-paths',
    });

    expect(diagnostic).toEqual({
      code: 'VR_ROUTE_DUPLICATE_PATH',
      severity: 'error',
      message: 'Route path "/shop" is already used by "shop".',
      filePath: 'src/routes.ts',
      line: 8,
      column: 5,
      suggestion: 'Give one route a different path.',
      docsPath: 'router/routes#duplicate-paths',
    });
  });

  it('keeps diagnostic codes in one named source of truth', () => {
    expect(Object.values(routeDiagnosticCodes)).toEqual([
      'VR_ROUTE_DUPLICATE_PATH',
      'VR_ROUTE_INVALID_PARENT_PATH',
      'VR_ROUTE_MISSING_RENDER_TARGET',
      'VR_ROUTE_INVALID_PARAM_NAME',
      'VR_ROUTE_MISSING_PARAM',
      'VR_ROUTE_UNKNOWN_PARAM',
      'VR_ROUTE_UNKNOWN_QUERY',
      'VR_ROUTE_QUERY_METADATA_REQUIRED',
      'VR_ROUTE_BREADCRUMB_PARENT_MISSING',
      'VR_ROUTE_BREADCRUMB_PARAM_IMPOSSIBLE',
      'VR_ROUTE_INVALID_TEMPLATE_REF',
    ]);
  });
});
```

- [ ] **Step 2: Run the failing diagnostic tests**

Run:

```bash
pnpm --filter @vanrot/router test -- tests/route/route-diagnostics.test.ts
```

Expected: FAIL because `route-diagnostic-codes.ts` and `route-diagnostics.ts` do not exist.

- [ ] **Step 3: Add diagnostic code and factory modules**

Create `packages/router/src/route/route-diagnostic-codes.ts`:

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
} as const;

export type RouteDiagnosticCode = (typeof routeDiagnosticCodes)[keyof typeof routeDiagnosticCodes];
```

Create `packages/router/src/route/route-diagnostics.ts`:

```ts
import type { RouteDiagnosticCode } from './route-diagnostic-codes.js';

export type RouteDiagnosticSeverity = 'error' | 'warning';

export interface RouteDiagnosticInput {
  code: RouteDiagnosticCode;
  message: string;
  filePath?: string;
  line?: number;
  column?: number;
  suggestion: string;
  docsPath: string;
  severity?: RouteDiagnosticSeverity;
}

export interface RouteDiagnostic {
  code: RouteDiagnosticCode;
  severity: RouteDiagnosticSeverity;
  message: string;
  filePath?: string;
  line?: number;
  column?: number;
  suggestion: string;
  docsPath: string;
}

export function createRouteDiagnostic(input: RouteDiagnosticInput): RouteDiagnostic {
  return {
    code: input.code,
    severity: input.severity ?? 'error',
    message: input.message,
    filePath: input.filePath,
    line: input.line,
    column: input.column,
    suggestion: input.suggestion,
    docsPath: input.docsPath,
  };
}
```

Modify `packages/router/src/index.ts`:

```ts
export type { RouteDiagnosticCode } from './route/route-diagnostic-codes.js';
export { routeDiagnosticCodes } from './route/route-diagnostic-codes.js';
export type {
  RouteDiagnostic,
  RouteDiagnosticInput,
  RouteDiagnosticSeverity,
} from './route/route-diagnostics.js';
export { createRouteDiagnostic } from './route/route-diagnostics.js';
```

- [ ] **Step 4: Verify diagnostic tests pass**

Run:

```bash
pnpm --filter @vanrot/router test -- tests/route/route-diagnostics.test.ts
```

Expected: PASS.

- [ ] **Step 5: Review checkpoint**

Run:

```bash
git status --short --branch
```

Expected: diagnostic files are uncommitted in the working tree. Do not run `git add` or `git commit` unless the user asks.

## Task 2: Builder Routes And Normalization

**Files:**
- Create: `packages/router/src/route/create-routes.ts`
- Modify: `packages/router/src/route/route-types.ts`
- Modify: `packages/router/src/route/define-routes.ts`
- Modify: `packages/router/src/index.ts`
- Test: `packages/router/tests/route/define-routes.test.ts`

- [ ] **Step 1: Add failing builder-form tests**

Append to `packages/router/tests/route/define-routes.test.ts`:

```ts
import { createRoutes } from '../../src/route/create-routes.js';

it('normalizes builder routes with object parent references', () => {
  const routes = createRoutes();
  const shop = routes.page({
    path: '/shop',
    label: 'Shop',
    page: createTestPage('shop'),
  });
  const product = shop.page({
    path: 'product',
    label: 'Products',
    page: createTestPage('products'),
  });
  const productDetail = product.page({
    path: ':productId',
    label: 'Product detail',
    page: createTestPage('product-detail'),
  });

  const route = defineRoutes({ shop, product, productDetail });

  expect(route.shop.path).toBe('/shop');
  expect(route.product.path).toBe('/shop/product');
  expect(route.productDetail.path).toBe('/shop/product/:productId');
  expect(route.product.parent).toBe(route.shop);
  expect(route.productDetail.parent).toBe(route.product);
});

it('keeps object-form defineRoutes compatibility', () => {
  const route = defineRoutes({
    home: {
      path: '/',
      label: 'Home',
      page: createTestPage('home'),
    },
  });

  expect(route.home).toMatchObject({
    key: 'home',
    path: '/',
    label: 'Home',
  });
});
```

- [ ] **Step 2: Run the failing builder tests**

Run:

```bash
pnpm --filter @vanrot/router test -- tests/route/define-routes.test.ts
```

Expected: FAIL because `createRoutes()` does not exist and `defineRoutes()` does not resolve builder parent refs.

- [ ] **Step 3: Extend route types**

Replace `packages/router/src/route/route-types.ts` with:

```ts
import type { ComponentType, Signal } from '@vanrot/runtime';
import type { RouteDiagnostic } from './route-diagnostics.js';

export type RouteParams = Record<string, string>;
export type RouteQueryValue = string | number | boolean | readonly string[] | null | undefined;
export type RouteQuery = Record<string, RouteQueryValue>;

export type RoutePageModule = ComponentType;
export type RoutePageLoader = () => Promise<RoutePageModule | { default: RoutePageModule }>;

export interface RouteQueryDefinition {
  default?: RouteQueryValue;
  array?: boolean;
}

export type RouteQueryDefinitionMap = Record<string, RouteQueryDefinition>;

export interface RouteBreadcrumbDefinition {
  kind: 'root' | 'parent';
  parent?: RouteRef;
}

export interface RouteDefinition {
  path: string;
  label: string;
  page?: RoutePageModule;
  loadPage?: RoutePageLoader;
  query?: RouteQueryDefinitionMap;
  breadcrumb?: RouteBreadcrumbDefinition;
}

export type RouteInput = Record<string, RouteDefinition | RouteRef>;

export interface RouteRef {
  readonly kind: 'page';
  readonly definition: RouteDefinition;
  readonly parent?: RouteRef;
  page(definition: RouteDefinition): RouteRef;
}

export type DefinedRoute<Key extends string = string> = Omit<RouteDefinition, 'parent'> & {
  key: Key;
  parent?: DefinedRoute;
  diagnostics: RouteDiagnostic[];
};

export type DefinedRouteTable<Input extends RouteInput = RouteInput> = {
  readonly [Key in keyof Input & string]: DefinedRoute<Key>;
};

export interface RouteMatch {
  route: DefinedRoute;
  params: RouteParams;
  query: Record<string, string | string[]>;
  path: string;
}

export interface RouteUrlInput {
  params?: RouteParams;
  query?: RouteQuery;
}

export type RouteParamsSignal = Signal<RouteParams>;
```

- [ ] **Step 4: Add the builder API**

Create `packages/router/src/route/create-routes.ts`:

```ts
import type { RouteBreadcrumbDefinition, RouteDefinition, RouteRef } from './route-types.js';

export interface RouteBuilder {
  page(definition: RouteDefinition): RouteRef;
  breadcrumb: {
    root(): RouteBreadcrumbDefinition;
    parent(parent: RouteRef): RouteBreadcrumbDefinition;
  };
}

export function createRoutes(): RouteBuilder {
  return createBuilder();
}

export function isRouteRef(value: RouteDefinition | RouteRef): value is RouteRef {
  return 'kind' in value && value.kind === 'page';
}

function createBuilder(parent?: RouteRef): RouteBuilder {
  return {
    page(definition) {
      return createRouteRef(definition, parent);
    },
    breadcrumb: {
      root() {
        return { kind: 'root' };
      },
      parent(parentRoute) {
        return { kind: 'parent', parent: parentRoute };
      },
    },
  };
}

function createRouteRef(definition: RouteDefinition, parent?: RouteRef): RouteRef {
  const ref = {
    ...createBuilder(undefined),
    kind: 'page' as const,
    definition,
    parent,
  };

  return ref;
}
```

- [ ] **Step 5: Normalize routes in `defineRoutes()`**

Replace `packages/router/src/route/define-routes.ts` with:

```ts
import { isRouteRef } from './create-routes.js';
import { routeDiagnosticCodes } from './route-diagnostic-codes.js';
import { createRouteDiagnostic } from './route-diagnostics.js';
import type { DefinedRoute, DefinedRouteTable, RouteDefinition, RouteInput } from './route-types.js';

export function defineRoutes<Input extends RouteInput>(routes: Input): DefinedRouteTable<Input> {
  const routeByRef = new Map<object, DefinedRoute>();
  const entries: Array<[string, DefinedRoute]> = [];

  for (const [key, input] of Object.entries(routes)) {
    const definition = isRouteRef(input) ? input.definition : input;
    const parentRef = isRouteRef(input) ? input.parent : undefined;
    const parent = parentRef === undefined ? undefined : routeByRef.get(parentRef);
    const path = normalizeRoutePath(definition.path, parent);
    const route: DefinedRoute = {
      ...definition,
      key,
      path,
      parent,
      diagnostics: [],
    };

    if (route.page === undefined && route.loadPage === undefined) {
      route.diagnostics.push(
        createRouteDiagnostic({
          code: routeDiagnosticCodes.missingRenderTarget,
          message: `Route "${key}" must define page or loadPage.`,
          suggestion: 'Add page or loadPage to the route definition.',
          docsPath: 'router/routes#render-targets',
        }),
      );
    }

    entries.push([key, route]);

    if (isRouteRef(input)) {
      routeByRef.set(input, route);
    }
  }

  return Object.fromEntries(entries) as DefinedRouteTable<Input>;
}

function normalizeRoutePath(path: string, parent: DefinedRoute | undefined): string {
  if (parent === undefined) {
    return normalizeRootPath(path);
  }

  if (path.length === 0) {
    return parent.path;
  }

  return `${parent.path.replace(/\/+$/u, '')}/${path.replace(/^\/+/u, '')}`;
}

function normalizeRootPath(path: string): string {
  if (path.length === 0 || path === '/') {
    return '/';
  }

  if (path.startsWith('/')) {
    return path.replace(/\/+$/u, '') || '/';
  }

  return `/${path.replace(/\/+$/u, '')}`;
}
```

- [ ] **Step 6: Export the builder**

Modify `packages/router/src/index.ts`:

```ts
export type { RouteBuilder } from './route/create-routes.js';
export { createRoutes } from './route/create-routes.js';
```

- [ ] **Step 7: Verify builder tests pass**

Run:

```bash
pnpm --filter @vanrot/router test -- tests/route/define-routes.test.ts
```

Expected: PASS.

- [ ] **Step 8: Review checkpoint**

Run:

```bash
git diff -- packages/router/src/route packages/router/tests/route/define-routes.test.ts packages/router/src/index.ts
```

Expected: diff shows builder-form route refs, object-form compatibility, and no automatic git staging.

## Task 3: Params, Query Strings, And URL Building

**Files:**
- Create: `packages/router/src/route/path-params.ts`
- Create: `packages/router/src/route/query-string.ts`
- Create: `packages/router/src/route/url-builder.ts`
- Modify: `packages/router/src/route/match-route.ts`
- Modify: `packages/router/src/index.ts`
- Test: `packages/router/tests/route/path-params.test.ts`
- Test: `packages/router/tests/route/url-builder.test.ts`
- Test: `packages/router/tests/route/match-route.test.ts`

- [ ] **Step 1: Write failing params and URL tests**

Create `packages/router/tests/route/path-params.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { extractPathParamNames, matchRoutePath } from '../../src/route/path-params.js';

describe('path params', () => {
  it('extracts named params from route paths', () => {
    expect(extractPathParamNames('/shop/product/:productId/review/:reviewId')).toEqual([
      'productId',
      'reviewId',
    ]);
  });

  it('matches encoded params and decodes values', () => {
    expect(matchRoutePath('/shop/product/:productId', '/shop/product/red%20shirt')).toEqual({
      productId: 'red shirt',
    });
  });

  it('rejects invalid param names', () => {
    expect(() => extractPathParamNames('/shop/:product-id')).toThrow(
      'Invalid route param "product-id" in "/shop/:product-id".',
    );
  });
});
```

Create `packages/router/tests/route/url-builder.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { defineRoutes } from '../../src/route/define-routes.js';
import { buildRouteUrl } from '../../src/route/url-builder.js';
import { createTestPage } from '../../src/test/test-pages.js';

const route = defineRoutes({
  productDetail: {
    path: '/shop/product/:productId',
    label: 'Product detail',
    page: createTestPage('product-detail'),
    query: {
      tab: { default: 'overview' },
      filter: { array: true },
    },
  },
});

describe('buildRouteUrl', () => {
  it('encodes required params', () => {
    expect(buildRouteUrl(route.productDetail, { params: { productId: 'red shirt' } })).toBe(
      '/shop/product/red%20shirt',
    );
  });

  it('serializes known query values and arrays', () => {
    expect(
      buildRouteUrl(route.productDetail, {
        params: { productId: '42' },
        query: { tab: 'details', filter: ['new', 'sale'] },
      }),
    ).toBe('/shop/product/42?tab=details&filter=new&filter=sale');
  });

  it('throws for missing params', () => {
    expect(() => buildRouteUrl(route.productDetail)).toThrow(
      'Route "productDetail" is missing required param "productId".',
    );
  });

  it('throws for unknown query keys', () => {
    expect(() =>
      buildRouteUrl(route.productDetail, {
        params: { productId: '42' },
        query: { sort: 'price' },
      }),
    ).toThrow('Route "productDetail" does not define query "sort".');
  });
});
```

- [ ] **Step 2: Run failing params and URL tests**

Run:

```bash
pnpm --filter @vanrot/router test -- tests/route/path-params.test.ts tests/route/url-builder.test.ts
```

Expected: FAIL because the helpers do not exist.

- [ ] **Step 3: Implement path params**

Create `packages/router/src/route/path-params.ts`:

```ts
import type { RouteParams } from './route-types.js';

const paramNamePattern = /^[A-Za-z_$][\w$]*$/u;

export function extractPathParamNames(path: string): string[] {
  return routeSegments(path)
    .filter((segment) => segment.startsWith(':'))
    .map((segment) => {
      const name = segment.slice(1);

      if (!paramNamePattern.test(name)) {
        throw new Error(`Invalid route param "${name}" in "${path}".`);
      }

      return name;
    });
}

export function matchRoutePath(routePath: string, currentPath: string): RouteParams | null {
  const routeParts = routeSegments(routePath);
  const currentParts = routeSegments(currentPath);

  if (routeParts.length !== currentParts.length) {
    return null;
  }

  const params: RouteParams = {};

  for (let index = 0; index < routeParts.length; index += 1) {
    const routePart = routeParts[index] ?? '';
    const currentPart = currentParts[index] ?? '';

    if (routePart.startsWith(':')) {
      params[routePart.slice(1)] = decodeURIComponent(currentPart);
      continue;
    }

    if (routePart !== currentPart) {
      return null;
    }
  }

  return params;
}

export function fillRoutePath(path: string, params: RouteParams = {}): string {
  return routeSegments(path).reduce((currentPath, segment) => {
    if (!segment.startsWith(':')) {
      return currentPath;
    }

    const name = segment.slice(1);
    const value = params[name];

    if (value === undefined) {
      throw new Error(`Missing required route param "${name}".`);
    }

    return currentPath.replace(`:${name}`, encodeURIComponent(value));
  }, path);
}

function routeSegments(path: string): string[] {
  if (path === '/') {
    return [];
  }
