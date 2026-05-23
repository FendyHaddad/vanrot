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

  it('provides the active matched chain from the browser path', async () => {
    await provideRouter(createRouteTable());

    expect(getCurrentRouteChain()?.chain.map((match) => match.route.key)).toEqual([
      'shop',
      'product',
      'productDetail',
    ]);
    expect(routeParams()).toEqual({ productId: '42' });
  });

  it('updates the active chain when navigating between layout children', async () => {
    await provideRouter(createRouteTable());
    await navigate('/shop/cart');

    expect(getCurrentRouteChain()?.chain.map((match) => match.route.key)).toEqual(['shop', 'cart']);
    expect(routeParams()).toEqual({});
  });
});
