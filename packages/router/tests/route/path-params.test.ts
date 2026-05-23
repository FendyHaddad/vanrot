import { describe, expect, it } from 'vitest';
import { extractPathParamNames, matchRoutePath } from '../../src/route/path-params.js';

describe('path params', () => {
  it('extracts named params from route paths', () => {
    expect(extractPathParamNames('/shop/product/:productId/review/:reviewId')).toEqual([
      'productId',
      'reviewId',
    ]);
  });

  it('matches encoded params and decodes values', () => {
    expect(matchRoutePath('/shop/product/:productId', '/shop/product/red%20shirt')).toEqual({
      productId: 'red shirt',
    });
  });

  it('rejects invalid param names', () => {
    expect(() => extractPathParamNames('/shop/:product-id')).toThrow(
      'Invalid route param "product-id" in "/shop/:product-id".',
    );
  });
});
