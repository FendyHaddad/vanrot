// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRouterOutlet } from '../../src/dom/route-outlet.js';
import { createRoutes, defineRoutes, navigate, provideRouter } from '../../src/index.js';
import { resetRouterForTests } from '../../src/route/router-state.js';
import { createTestLayout, createTestPage } from '../../src/test/test-pages.js';

async function flushRouteOutlet(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

describe('createRouterOutlet nested layouts', () => {
  let host: HTMLElement;
  let disposeOutlet: (() => void) | undefined;

  beforeEach(() => {
    resetRouterForTests();
    host = document.createElement('main');
    document.body.replaceChildren(host);
    window.history.replaceState(null, '', '/shop/product/42');
  });

  afterEach(() => {
    disposeOutlet?.();
    resetRouterForTests();
    document.body.replaceChildren();
  });

  it('renders root layout, nested layout, and leaf page through nested outlets', async () => {
    const routes = createRoutes();
    const shop = routes.layout({
      path: '/shop',
      label: 'Shop',
      layout: createTestLayout('shop-layout'),
    });
    const product = shop.layout({
      path: 'product',
      label: 'Products',
      layout: createTestLayout('product-layout'),
    });
    const productDetail = product.page({
      path: ':productId',
      label: 'Product detail',
      page: createTestPage('product-detail-page'),
    });

    provideRouter(defineRoutes({ shop, product, productDetail }));
    disposeOutlet = createRouterOutlet(host, { kind: 'router' });
    await flushRouteOutlet();

    expect(host.textContent).toBe('shop-layoutproduct-layoutproduct-detail-page');
    expect(host.querySelectorAll('[data-test-layout]').length).toBe(2);
    expect(host.querySelectorAll('[data-test-page]').length).toBe(1);
  });

  it('keeps shared parent layouts mounted during sibling navigation', async () => {
    const destroyed = {
      shop: vi.fn(),
      cart: vi.fn(),
      product: vi.fn(),
      productDetail: vi.fn(),
    };
    const routes = createRoutes();
    const shop = routes.layout({
      path: '/shop',
      label: 'Shop',
      layout: createTestLayout('shop-layout', destroyed.shop),
    });
    const product = shop.layout({
      path: 'product',
      label: 'Products',
      layout: createTestLayout('product-layout', destroyed.product),
    });
    const productDetail = product.page({
      path: ':productId',
      label: 'Product detail',
      page: createTestPage('product-detail-page', destroyed.productDetail),
    });
    const cart = shop.page({
      path: 'cart',
      label: 'Cart',
      page: createTestPage('cart-page', destroyed.cart),
    });

    provideRouter(defineRoutes({ shop, product, productDetail, cart }));
    disposeOutlet = createRouterOutlet(host, { kind: 'router' });
    await flushRouteOutlet();

    navigate('/shop/cart');
    await flushRouteOutlet();

    expect(destroyed.shop).not.toHaveBeenCalled();
    expect(destroyed.product).toHaveBeenCalledOnce();
    expect(destroyed.productDetail).toHaveBeenCalledOnce();
    expect(destroyed.cart).not.toHaveBeenCalled();
    expect(host.textContent).toBe('shop-layoutcart-page');
  });

  it('destroys the active branch when leaving it', async () => {
    const destroyed = {
      shop: vi.fn(),
      cart: vi.fn(),
      home: vi.fn(),
    };
    const routes = createRoutes();
    const home = routes.page({
      path: '/',
      label: 'Home',
      page: createTestPage('home-page', destroyed.home),
    });
    const shop = routes.layout({
      path: '/shop',
      label: 'Shop',
      layout: createTestLayout('shop-layout', destroyed.shop),
    });
    const cart = shop.page({
      path: 'cart',
      label: 'Cart',
      page: createTestPage('cart-page', destroyed.cart),
    });

    window.history.replaceState(null, '', '/shop/cart');
    provideRouter(defineRoutes({ home, shop, cart }));
    disposeOutlet = createRouterOutlet(host, { kind: 'router' });
    await flushRouteOutlet();

    navigate('/');
    await flushRouteOutlet();

    expect(destroyed.cart).toHaveBeenCalledOnce();
    expect(destroyed.shop).toHaveBeenCalledOnce();
    expect(destroyed.home).not.toHaveBeenCalled();
    expect(host.textContent).toBe('home-page');
  });

  it('loads lazy pages under layouts without preloading inactive children', async () => {
    const loadProductDetail = vi.fn(async () => createTestPage('product-detail-page'));
    const loadCart = vi.fn(async () => createTestPage('cart-page'));
    const routes = createRoutes();
    const shop = routes.layout({
      path: '/shop',
      label: 'Shop',
      layout: createTestLayout('shop-layout'),
    });
    const product = shop.layout({
      path: 'product',
      label: 'Products',
      layout: createTestLayout('product-layout'),
    });
    const productDetail = product.page({
      path: ':productId',
      label: 'Product detail',
      loadPage: loadProductDetail,
    });
    const cart = shop.page({
      path: 'cart',
      label: 'Cart',
      loadPage: loadCart,
    });

    provideRouter(defineRoutes({ shop, product, productDetail, cart }));
    disposeOutlet = createRouterOutlet(host, { kind: 'router' });
    await flushRouteOutlet();

    expect(loadProductDetail).toHaveBeenCalledOnce();
    expect(loadCart).not.toHaveBeenCalled();
    expect(host.textContent).toBe('shop-layoutproduct-layoutproduct-detail-page');
  });

  it('keeps shared parent layouts mounted while restoring kept-alive leaf views', async () => {
    const destroyed = {
      shop: vi.fn(),
      product: vi.fn(),
      productDetail: vi.fn(),
      cart: vi.fn(),
    };
    const routes = createRoutes();
    const shop = routes.layout({
      path: '/shop',
      label: 'Shop',
      layout: createTestLayout('shop-layout', destroyed.shop),
    });
    const product = shop.layout({
      path: 'product',
      label: 'Products',
      layout: createTestLayout('product-layout', destroyed.product),
    });
    const productDetail = product.page({
      path: ':productId',
      label: 'Product detail',
      page: createTestPage('product-detail-page', destroyed.productDetail),
      keepAlive: routes.keepAlive.sessionDay(),
    });
    const cart = shop.page({
      path: 'cart',
      label: 'Cart',
      page: createTestPage('cart-page', destroyed.cart),
    });

    provideRouter(defineRoutes({ shop, product, productDetail, cart }));
    disposeOutlet = createRouterOutlet(host, { kind: 'router' });
    await flushRouteOutlet();
    await navigate('/shop/cart');
    await flushRouteOutlet();
    await navigate('/shop/product/42');
    await flushRouteOutlet();

    expect(destroyed.shop).not.toHaveBeenCalled();
    expect(destroyed.product).toHaveBeenCalledOnce();
    expect(destroyed.productDetail).not.toHaveBeenCalled();
    expect(host.textContent).toBe('shop-layoutproduct-layoutproduct-detail-page');
  });
});
