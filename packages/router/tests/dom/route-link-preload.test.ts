// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setupRouteLink } from '../../src/dom/route-link.js';
import { createRoutes, defineRoutes } from '../../src/index.js';
import { provideRouter, resetRouterForTests } from '../../src/route/router-state.js';
import { createTestPage } from '../../src/test/test-pages.js';

describe('setupRouteLink preload intent', () => {
  beforeEach(() => {
    resetRouterForTests();
    window.history.replaceState(null, '', '/');
  });

  it('preloads route modules on mouse intent', async () => {
    const loadAccount = vi.fn(async () => createTestPage('account'));
    const routes = createRoutes();
    const home = routes.page({
      path: '/',
      label: 'Home',
      page: createTestPage('home'),
    });
    const account = routes.page({
      path: '/account',
      label: 'Account',
      loadPage: loadAccount,
      preload: routes.preload.intent(),
    });
    const route = defineRoutes({ home, account });
    const anchor = document.createElement('a');

    await provideRouter(route);
    setupRouteLink(anchor, route.account);
    anchor.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await flushPreload();

    expect(loadAccount).toHaveBeenCalledOnce();
    expect(window.location.pathname).toBe('/');
  });

  it('preloads route modules on keyboard focus and touch intent only once', async () => {
    const loadAccount = vi.fn(async () => createTestPage('account'));
    const routes = createRoutes();
    const home = routes.page({
      path: '/',
      label: 'Home',
      page: createTestPage('home'),
    });
    const account = routes.page({
      path: '/account',
      label: 'Account',
      loadPage: loadAccount,
      preload: routes.preload.intent(),
    });
    const route = defineRoutes({ home, account });
    const anchor = document.createElement('a');

    await provideRouter(route);
    setupRouteLink(anchor, route.account);
    anchor.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
    anchor.dispatchEvent(new Event('touchstart', { bubbles: true }));
    await flushPreload();

    expect(loadAccount).toHaveBeenCalledOnce();
  });

  it('does not preload routes without intent policy', async () => {
    const loadAccount = vi.fn(async () => createTestPage('account'));
    const routes = createRoutes();
    const home = routes.page({
      path: '/',
      label: 'Home',
      page: createTestPage('home'),
    });
    const account = routes.page({
      path: '/account',
      label: 'Account',
      loadPage: loadAccount,
    });
    const route = defineRoutes({ home, account });
    const anchor = document.createElement('a');

    await provideRouter(route);
    setupRouteLink(anchor, route.account);
    anchor.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await flushPreload();

    expect(loadAccount).not.toHaveBeenCalled();
  });
});

async function flushPreload(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}
