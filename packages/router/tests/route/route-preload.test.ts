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
