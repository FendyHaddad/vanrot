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
