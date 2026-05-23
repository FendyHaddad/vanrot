import { describe, expect, it } from 'vitest';
import { defineRoutes } from '../../src/route/define-routes.js';
import { buildRouteUrl } from '../../src/route/url-builder.js';
import { createTestPage } from '../../src/test/test-pages.js';

const route = defineRoutes({
  productDetail: {
    path: '/shop/product/:productId',
    label: 'Product detail',
    page: createTestPage('product-detail'),
    query: {
      tab: { default: 'overview' },
      filter: { array: true },
    },
  },
});

describe('buildRouteUrl', () => {
  it('encodes required params', () => {
    expect(buildRouteUrl(route.productDetail, { params: { productId: 'red shirt' } })).toBe(
      '/shop/product/red%20shirt',
    );
  });

  it('serializes known query values and arrays', () => {
    expect(
      buildRouteUrl(route.productDetail, {
        params: { productId: '42' },
        query: { tab: 'details', filter: ['new', 'sale'] },
      }),
    ).toBe('/shop/product/42?tab=details&filter=new&filter=sale');
  });

  it('omits query defaults', () => {
    expect(
      buildRouteUrl(route.productDetail, {
        params: { productId: '42' },
        query: { tab: 'overview' },
      }),
    ).toBe('/shop/product/42');
  });

  it('throws for missing params', () => {
    expect(() => buildRouteUrl(route.productDetail)).toThrow(
      'Route "productDetail" is missing required param "productId".',
    );
  });

  it('throws for unknown params', () => {
    expect(() =>
      buildRouteUrl(route.productDetail, {
        params: { productId: '42', reviewId: '99' },
      }),
    ).toThrow('Route "productDetail" does not define param "reviewId".');
  });

  it('throws for unknown query keys', () => {
    expect(() =>
      buildRouteUrl(route.productDetail, {
        params: { productId: '42' },
        query: { sort: 'price' },
      }),
    ).toThrow('Route "productDetail" does not define query "sort".');
  });
});
