// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest';
import { setupRouteLink } from '../../src/dom/route-link.js';
import { createRoutes, defineRoutes } from '../../src/index.js';
import { getCurrentMatch, provideRouter, resetRouterForTests } from '../../src/route/router-state.js';
import { createTestPage } from '../../src/test/test-pages.js';

describe('guarded route links', () => {
  beforeEach(() => {
    resetRouterForTests();
    window.history.replaceState(null, '', '/');
  });

  it('uses the guarded navigation pipeline for normal link clicks', async () => {
    const routes = createRoutes();
    const login = routes.page({ path: '/login', label: 'Login', page: createTestPage('login') });
    const home = routes.page({ path: '/', label: 'Home', page: createTestPage('home') });
    const account = routes.page({
      path: '/account',
      label: 'Account',
      page: createTestPage('account'),
      canEnter: () => login,
    });
    const route = defineRoutes({ home, login, account });
    const anchor = document.createElement('a');

    await provideRouter(route);
    setupRouteLink(anchor, route.account);
    anchor.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }));
    await flushNavigation();

    expect(getCurrentMatch()?.route).toBe(route.login);
    expect(window.location.pathname).toBe('/login');
  });

  it('keeps href route-owned while navigation can redirect elsewhere', async () => {
    const routes = createRoutes();
    const home = routes.page({ path: '/', label: 'Home', page: createTestPage('home') });
    const login = routes.page({ path: '/login', label: 'Login', page: createTestPage('login') });
    const account = routes.page({
      path: '/account',
      label: 'Account',
      page: createTestPage('account'),
      canEnter: () => login,
    });
    const route = defineRoutes({ home, login, account });
    const anchor = document.createElement('a');

    await provideRouter(route);
    setupRouteLink(anchor, route.account);

    expect(anchor.getAttribute('href')).toBe('/account');
    expect(anchor.textContent).toBe('Account');
  });
});

async function flushNavigation(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}
