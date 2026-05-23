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
    ).toThrow(
      'VR_REDIRECT_HAS_RENDER_TARGET: Redirect route "badRedirect" must not define page, loadPage, layout, or loadLayout.',
    );
  });
});
