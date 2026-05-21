import { describe, expect, it } from 'vitest';
import { defineRoutes, provideRouter, routeParams } from '../src/index.js';

describe('@vanrot/router exports', () => {
  it('exports the public router API', () => {
    expect(defineRoutes).toEqual(expect.any(Function));
    expect(provideRouter).toEqual(expect.any(Function));
    expect(routeParams).toEqual(expect.any(Function));
  });
});
