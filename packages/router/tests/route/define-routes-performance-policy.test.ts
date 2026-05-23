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
});
