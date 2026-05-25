// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRoutes, defineRoutes } from '../../src/index.js';
import {
  resetNavigationPolishConfigForTests,
  setNavigationPolishConfigForTests,
} from '../../src/route/navigation-polish-config.js';
import {
  resetNavigationPolishForTests,
} from '../../src/route/navigation-polish.js';
import {
  navigate,
  provideRouter,
  resetRouterForTests,
} from '../../src/route/router-state.js';
import { createTestPage } from '../../src/test/test-pages.js';

function setScrollPosition(top: number, left = 0): void {
  Object.defineProperty(window, 'scrollY', { value: top, configurable: true });
  Object.defineProperty(window, 'scrollX', { value: left, configurable: true });
}

describe('router scroll restoration', () => {
  const scrollTo = vi.fn();

  beforeEach(() => {
    resetRouterForTests();
    resetNavigationPolishForTests();
    resetNavigationPolishConfigForTests();
    setNavigationPolishConfigForTests({
      navigationPolish: { title: false, meta: false, scroll: true, focus: false },
      diagnostics: { missingTitle: 'off', missingMetaDescription: 'off' },
    });
    Object.defineProperty(window, 'scrollTo', { value: scrollTo, configurable: true });
    setScrollPosition(0);
    scrollTo.mockClear();
    window.history.replaceState(null, '', '/');
  });

  afterEach(() => {
    resetRouterForTests();
    resetNavigationPolishForTests();
    resetNavigationPolishConfigForTests();
    scrollTo.mockReset();
  });

  it('scrolls to top on normal navigation', async () => {
    const route = createRouteTable();

    setScrollPosition(480);
    await provideRouter(route);
    await navigate('/next');

    expect(scrollTo).toHaveBeenLastCalledWith({ top: 0, left: 0, behavior: 'auto' });
  });

  it('restores stored scroll on browser back and forward navigation', async () => {
    const route = createRouteTable();

    setScrollPosition(480);
    await provideRouter(route);
    await navigate('/next');
    setScrollPosition(120);
    window.history.replaceState(null, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
    await Promise.resolve();
    await Promise.resolve();

    expect(scrollTo).toHaveBeenLastCalledWith({ top: 480, left: 0, behavior: 'auto' });
  });

  it('does not scroll to top for hash-only navigation', async () => {
    const route = createRouteTable();

    await provideRouter(route);
    scrollTo.mockClear();
    await navigate('/#section');

    expect(scrollTo).not.toHaveBeenCalled();
  });
});

function createRouteTable() {
  const routes = createRoutes();
  const home = routes.page({
    path: '/',
    label: 'Home',
    page: createTestPage('home'),
  });
  const next = routes.page({
    path: '/next',
    label: 'Next',
    page: createTestPage('next'),
  });

  return defineRoutes({ home, next });
}
