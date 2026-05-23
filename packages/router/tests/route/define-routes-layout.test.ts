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
    });
    expect(route.shop.parent).toBeUndefined();
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
