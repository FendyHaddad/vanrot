import { describe, expect, it } from 'vitest';
import { createRoutes } from '../../src/route/create-routes.js';
import { defineRoutes } from '../../src/route/define-routes.js';
import { createTestPage } from '../../src/test/test-pages.js';

const routePath = {
  home: '/',
  user: '/users/:id',
} as const;

const routeLabel = {
  home: 'Home',
  user: 'User',
} as const;

class HomePage {}

describe('defineRoutes', () => {
  it('preserves named route keys on route records', () => {
    const route = defineRoutes({
      home: {
        path: routePath.home,
        label: routeLabel.home,
        page: createTestPage('home'),
      },
      user: {
        path: routePath.user,
        label: routeLabel.user,
        loadPage: async () => createTestPage('user'),
      },
    });

    expect(route.home.key).toBe('home');
    expect(route.home.path).toBe(routePath.home);
    expect(route.home.label).toBe(routeLabel.home);
    expect(route.user.key).toBe('user');
    expect(route.user.path).toBe(routePath.user);
    expect(route.user.label).toBe(routeLabel.user);
  });

  it('accepts source-visible page classes for eager routes', () => {
    const route = defineRoutes({
      home: {
        path: routePath.home,
        label: routeLabel.home,
        page: HomePage,
      },
    });

    expect(route.home.page).toBe(HomePage);
  });

  it('adds a diagnostic when a route is missing both page and loadPage', () => {
    const route = defineRoutes({
      broken: {
        path: '/broken',
        label: 'Broken',
      },
    });

    expect(route.broken.diagnostics).toMatchObject([
      {
        code: 'VR_ROUTE_MISSING_RENDER_TARGET',
        message: 'Route "broken" must define page or loadPage.',
      },
    ]);
  });

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
});
