# Phase 15B Nested Layout Routing

## Purpose

Phase 15B makes the Phase 15A route graph render nested application structure.

This phase focuses on route layouts, child pages, nested render cleanup, route registry ordering, and diagnostics. It does not implement componentless groups, guards, redirects, lazy-page preloading, or dynamic entity breadcrumb labels. Those remain later Phase 15 slices.

## Source Of Truth

`src/routes.ts` remains the owning source of truth for route paths, route labels, route hierarchy, layout ownership, and route-owned navigation metadata.

User pages, templates, and CSS must not repeat route paths, route names, route labels, diagnostic codes, nav labels, or framework-owned route hooks. Literal route strings are acceptable only at the route source-of-truth boundary.

## Route Kinds

Phase 15B has two route kinds:

- `route.page(...)` defines a final renderable screen.
- `route.layout(...)` defines a renderable shell that owns child routes.

There is no `route.group(...)` in Phase 15B.

A page is always a leaf. A layout may have child pages or child layouts. If a layout URL also needs its own screen, that screen is modeled as an index child page with `path: ''`.

```ts
const routes = createRoutes();

const home = routes.page({
  path: '/',
  label: 'Home',
  page: HomePage,
});

const shop = routes.layout({
  path: '/shop',
  label: 'Shop',
  layout: ShopLayout,
});

const shopIndex = shop.page({
  path: '',
  label: 'Shop',
  page: ShopPage,
});

const cart = shop.page({
  path: 'cart',
  label: 'Cart',
  page: CartPage,
});

export const route = defineRoutes({
  home,
  shop,
  shopIndex,
  cart,
});
```

The render result is:

```txt
/
  HomePage

/shop
  ShopLayout
    ShopPage

/shop/cart
  ShopLayout
    CartPage
```

## Route Definition Shape

Phase 15B uses the route builder shape established by Phase 15A, but allows child route creation through the parent route object.

```ts
const routes = createRoutes();

const shop = routes.layout({
  path: '/shop',
  label: 'Shop',
  layout: ShopLayout,
  breadcrumb: routes.breadcrumb.root(),
  nav: routes.nav.primary(),
});

const product = shop.layout({
  path: 'product',
  label: 'Products',
  layout: ProductLayout,
  breadcrumb: routes.breadcrumb.parent(shop),
  nav: routes.nav.primary(),
});

const productList = product.page({
  path: '',
  label: 'All products',
  page: ProductListPage,
  breadcrumb: routes.breadcrumb.parent(product),
});

const productDetail = product.page({
  path: ':productId',
  label: 'Product detail',
  page: ProductDetailPage,
  breadcrumb: routes.breadcrumb.parent(product),
  nav: routes.nav.hidden(),
});

const cart = shop.page({
  path: 'cart',
  label: 'Cart',
  page: CartPage,
  breadcrumb: routes.breadcrumb.parent(shop),
  nav: routes.nav.primary(),
});

export const route = defineRoutes({
  shop,
  product,
  productList,
  productDetail,
  cart,
});
```

Parent-child ownership comes from the builder receiver:

- `routes.page(...)` creates a root page.
- `routes.layout(...)` creates a root layout.
- `shop.page(...)` creates a child page of `shop`.
- `shop.layout(...)` creates a child layout of `shop`.
- `product.page(...)` creates a child page of `product`.

The route object refs remain available for breadcrumbs, generated links, active-state checks, diagnostics, and future router features. Route names are still taken from the `defineRoutes({ ... })` keys, not string literals passed into route builders.

The builder API keeps page and layout definitions separate at the TypeScript boundary:

- `.page(...)` accepts `page` or `loadPage`
- `.layout(...)` accepts `layout` or `loadLayout`

The object-form `defineRoutes({ home: { ... } })` compatibility path remains permissive enough to collect route diagnostics for older apps.

## Registry Order

`defineRoutes({ ... })` is the canonical route registry order.

That order is used for route-owned UI surfaces where order matters:

- generated menus
- generated sidebars
- diagnostics output
- route maps
- documentation examples
- parent `children` arrays used by matching and rendering

Navigation visibility is route metadata, not a separate menu array. Detail routes are still routable and breadcrumb-aware, but can be hidden from nav through route-owned metadata.

```ts
const productDetail = product.page({
  path: ':productId',
  label: 'Product detail',
  page: ProductDetailPage,
  nav: routes.nav.hidden(),
});
```

The registry order must be topological: a parent route must appear before every child and descendant route.

```ts
export const route = defineRoutes({
  product,
  shop,
});
```

This produces a diagnostic because `product` is registered before its parent `shop`.

## Router And Outlet

`<vr-router />` is the app-level router mount. It should be used once in the app layout.

```html
<!-- app.layout.html -->
<app-header />
<vr-router />
<app-footer />
```

`<vr-outlet />` is the child-route render slot. It belongs in route layout templates.

```html
<!-- shop.layout.html -->
<shop-sidebar />
<vr-outlet />
```

```html
<!-- product.layout.html -->
<product-tabs />
<vr-outlet />
```

Pages do not contain `<vr-router />` or `<vr-outlet />`.

```html
<!-- cart.page.html -->
<cart-summary />
```

For `/shop/product/123`, the render tree is:

```txt
app.layout
  <vr-router />
    shop.layout
      <vr-outlet />
        product.layout
          <vr-outlet />
            product-detail.page
```

## Rendering Behavior

The root router resolves the current URL into a matched route chain. Each layout in that chain renders its layout component and provides the next matched child to the layout outlet.

When the matched route changes:

- layouts shared by the previous and next route remain mounted
- layouts no longer in the active branch are destroyed
- pages no longer active are destroyed
- the new leaf page is mounted under the deepest active layout outlet
- params and query values from Phase 15A stay available to the active chain

Index child pages use `path: ''`. A layout with an index page renders that page when the current URL matches the layout path exactly.

## Diagnostics

Phase 15B adds diagnostics for nested layout mistakes:

- `VR_ROUTER_MULTIPLE_ROOTS`: more than one root `<vr-router />` exists in the app layout boundary.
- `VR_ROUTER_OUTSIDE_APP_LAYOUT`: `<vr-router />` is used outside the app layout boundary.
- `VR_LAYOUT_MISSING_OUTLET`: a route layout template has no reachable `<vr-outlet />`.
- `VR_LAYOUT_MULTIPLE_OUTLETS`: a route layout template has more than one reachable `<vr-outlet />`.
- `VR_OUTLET_OUTSIDE_LAYOUT`: `<vr-outlet />` is used outside a route layout template.
- `VR_PAGE_HAS_OUTLET`: a `route.page(...)` template contains `<vr-outlet />`.
- `VR_PAGE_HAS_CHILDREN`: a `route.page(...)` record owns child routes.
- `VR_LAYOUT_MISSING_COMPONENT`: a `route.layout(...)` record does not provide a layout component.
- `VR_LAYOUT_WITHOUT_CHILDREN`: a `route.layout(...)` record has no child routes.
- `VR_CHILD_BEFORE_PARENT`: a child route appears before its parent or ancestor in `defineRoutes({ ... })`.
- `VR_DUPLICATE_INDEX_ROUTE`: a layout has more than one index child page.
- `VR_INVALID_INDEX_LAYOUT`: an index child is declared as a layout instead of a page.

Diagnostics should name the route key from `defineRoutes({ ... })`, explain the invalid relationship, and point to the smallest fix.

## Testing

Phase 15B needs focused tests for:

- root pages with no layouts
- a root layout with child pages
- nested layouts with nested pages
- layout index child pages with `path: ''`
- route params through nested layout chains
- query values through nested layout chains
- shared-layout retention during sibling navigation
- cleanup when leaving a nested branch
- lazy `loadPage` under nested layouts without preloading
- registry order used for generated route-owned nav ordering
- nav visibility metadata hiding detail pages
- child-before-parent registry diagnostics
- page-with-children diagnostics
- layout-without-outlet diagnostics
- page-with-outlet diagnostics
- multiple-root-router diagnostics
- starter app examples with no repeated route string literals in user pages, templates, or CSS

Verification target remains `pnpm verify`.

## Deferred To Later Phase 15 Slices

Phase 15B does not include:

- componentless route groups
- route guards
- async guard cancellation
- redirects
- redirect loop detection
- lazy-page preloading
- route-level error boundaries beyond existing lazy loading behavior
- dynamic entity breadcrumb labels that depend on page data loading

## Production Readiness Outcome

After Phase 15B, `@vanrot/router` supports nested layout rendering without repeated route string literals in user templates.

The production-ready outcome is:

- route hierarchy is declared through route object refs
- route registry order is canonical and diagnostic-backed
- root routing uses one `<vr-router />`
- route layouts use `<vr-outlet />`
- pages remain leaf screens
- layout URLs with their own screens use index child pages
- no componentless groups are required
- nested route mistakes fail with clear diagnostics
