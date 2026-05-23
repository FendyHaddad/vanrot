// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRoutes, defineRoutes } from '../../src/index.js';
import { matchRouteChain } from '../../src/route/match-route-chain.js';
import {
  clearRouteKeepAliveStoreForTests,
  createKeepAliveRouteIdentity,
  getRouteKeepAliveDiagnosticsForTests,
  getRouteKeepAliveStoreSizeForTests,
  setRouteKeepAliveNowForTests,
  storeKeepAliveRouteView,
  takeKeepAliveRouteView,
} from '../../src/route/route-keep-alive.js';
import { createTestPage } from '../../src/test/test-pages.js';

describe('route keepAlive store', () => {
  beforeEach(() => {
    clearRouteKeepAliveStoreForTests();
    setRouteKeepAliveNowForTests(() => new Date('2026-05-24T08:00:00'));
  });

  afterEach(() => {
    clearRouteKeepAliveStoreForTests();
    setRouteKeepAliveNowForTests(() => new Date());
  });

  it('builds stable identities from route key, params, query, and route version', () => {
    const routes = createRoutes();
    const detail = routes.page({
      path: '/product/:productId',
      label: 'Product detail',
      page: createTestPage('detail'),
      query: { tab: {} },
      keepAlive: routes.keepAlive.sessionDay(),
    });
    const route = defineRoutes({ detail });
    const first = matchRouteChain(route, '/product/42?tab=overview');
    const second = matchRouteChain(route, '/product/42?tab=reviews');

    expect(first).not.toBeNull();
    expect(second).not.toBeNull();
    expect(createKeepAliveRouteIdentity(first!.chain[0]!, 1)).toBe(
      '1|detail|params:productId=42|query:tab=overview',
    );
    expect(createKeepAliveRouteIdentity(second!.chain[0]!, 1)).toBe(
      '1|detail|params:productId=42|query:tab=reviews',
    );
  });

  it('stores and restores a same-day route view by identity', () => {
    const handle = { destroy: vi.fn() };
    const node = document.createElement('section');
    const routes = createRoutes();
    const detail = routes.page({
      path: '/product/:productId',
      label: 'Product detail',
      page: createTestPage('detail'),
      keepAlive: routes.keepAlive.sessionDay(),
    });
    const route = defineRoutes({ detail });
    const match = matchRouteChain(route, '/product/42');

    expect(match).not.toBeNull();
    storeKeepAliveRouteView({
      identity: createKeepAliveRouteIdentity(match!.chain[0]!, 1)!,
      route: route.detail,
      handle,
      nodes: [node],
    });

    expect(getRouteKeepAliveStoreSizeForTests()).toBe(1);
    expect(takeKeepAliveRouteView(match!.chain[0]!, 1)?.handle).toBe(handle);
    expect(handle.destroy).not.toHaveBeenCalled();
  });

  it('expires stored route views when the local day changes', () => {
    const handle = { destroy: vi.fn() };
    const routes = createRoutes();
    const detail = routes.page({
      path: '/product/:productId',
      label: 'Product detail',
      page: createTestPage('detail'),
      keepAlive: routes.keepAlive.sessionDay(),
    });
    const route = defineRoutes({ detail });
    const match = matchRouteChain(route, '/product/42');

    expect(match).not.toBeNull();
    storeKeepAliveRouteView({
      identity: createKeepAliveRouteIdentity(match!.chain[0]!, 1)!,
      route: route.detail,
      handle,
      nodes: [],
    });
    setRouteKeepAliveNowForTests(() => new Date('2026-05-25T00:01:00'));

    expect(takeKeepAliveRouteView(match!.chain[0]!, 1)).toBeNull();
    expect(handle.destroy).toHaveBeenCalledOnce();
    expect(getRouteKeepAliveStoreSizeForTests()).toBe(0);
  });

  it('records diagnostics when identity cannot be built', () => {
    const routes = createRoutes();
    const detail = routes.page({
      path: '/product/:productId',
      label: 'Product detail',
      page: createTestPage('detail'),
      keepAlive: routes.keepAlive.sessionDay(),
    });
    const route = defineRoutes({ detail });
    const match = matchRouteChain(route, '/product/42');

    expect(match).not.toBeNull();
    const incompleteMatch = {
      ...match!.chain[0]!,
      params: {},
    };

    expect(createKeepAliveRouteIdentity(incompleteMatch, 1)).toBeNull();
    expect(getRouteKeepAliveDiagnosticsForTests()).toContainEqual(
      expect.objectContaining({
        code: 'VR_KEEP_ALIVE_IDENTITY_MISSING',
        message: 'KeepAlive identity cannot be built for route "detail".',
      }),
    );
  });
});
