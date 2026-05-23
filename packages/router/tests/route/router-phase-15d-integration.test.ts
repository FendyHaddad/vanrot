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
