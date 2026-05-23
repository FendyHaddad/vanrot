// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest';
import { createRoutes, defineRoutes } from '../../src/index.js';
import {
  getCurrentMatch,
  navigate,
  provideRouter,
  resetRouterForTests,
} from '../../src/route/router-state.js';
import { createTestPage } from '../../src/test/test-pages.js';

describe('router state navigation decisions', () => {
  beforeEach(() => {
    resetRouterForTests();
    window.history.replaceState(null, '', '/');
  });

  it('blocks navigation and keeps the current active route', async () => {
    const routes = createRoutes();
    const home = routes.page({ path: '/', label: 'Home', page: createTestPage('home') });
    const account = routes.page({
      path: '/account',
      label: 'Account',
      page: createTestPage('account'),
      canEnter: () => false,
    });
    const route = defineRoutes({ home, account });

    await provideRouter(route);
    const didNavigate = await navigate('/account');

    expect(didNavigate).toBe(false);
    expect(getCurrentMatch()?.route).toBe(route.home);
    expect(window.location.pathname).toBe('/');
  });

  it('redirects guarded navigation and replaces history', async () => {
    const routes = createRoutes();
    const home = routes.page({ path: '/', label: 'Home', page: createTestPage('home') });
    const login = routes.page({
      path: '/login',
      label: 'Login',
      page: createTestPage('login'),
      query: { returnTo: {} },
    });
    const account = routes.page({
      path: '/account',
      label: 'Account',
      page: createTestPage('account'),
      canEnter: () => routes.redirectTo(login, { query: { returnTo: '/account' } }),
    });
    const route = defineRoutes({ home, login, account });

    await provideRouter(route);
    const didNavigate = await navigate('/account');

    expect(didNavigate).toBe(true);
    expect(getCurrentMatch()?.route).toBe(route.login);
    expect(window.location.pathname).toBe('/login');
    expect(window.location.search).toBe('?returnTo=%2Faccount');
  });

  it('uses redirect routes during initial setup', async () => {
    const routes = createRoutes();
    const billing = routes.page({
      path: '/account/billing',
      label: 'Billing',
      page: createTestPage('billing'),
    });
    const oldBilling = routes.redirect({ path: '/billing', label: 'Old billing', to: billing });
    const route = defineRoutes({ billing, oldBilling });

    window.history.replaceState(null, '', '/billing');
    await provideRouter(route);

    expect(getCurrentMatch()?.route).toBe(route.billing);
    expect(window.location.pathname).toBe('/account/billing');
  });

  it('ignores late async guard results when a newer navigation wins', async () => {
    let allowAccount!: (value: boolean) => void;
    const routes = createRoutes();
    const home = routes.page({ path: '/', label: 'Home', page: createTestPage('home') });
    const shop = routes.page({ path: '/shop', label: 'Shop', page: createTestPage('shop') });
    const account = routes.page({
      path: '/account',
      label: 'Account',
      page: createTestPage('account'),
      canEnter: () =>
        new Promise<boolean>((resolve) => {
          allowAccount = resolve;
        }),
    });
    const route = defineRoutes({ home, shop, account });

    await provideRouter(route);
    const accountNavigation = navigate('/account');
    const shopNavigation = navigate('/shop');
    allowAccount(true);

    await Promise.all([accountNavigation, shopNavigation]);

    expect(getCurrentMatch()?.route).toBe(route.shop);
    expect(window.location.pathname).toBe('/shop');
  });

  it('throws when guard redirects create a navigation loop', async () => {
    const routes = createRoutes();
    const home = routes.page({ path: '/', label: 'Home', page: createTestPage('home') });
    const login = routes.page({
      path: '/login',
      label: 'Login',
      page: createTestPage('login'),
      canEnter: () => account,
    });
    const account = routes.page({
      path: '/account',
      label: 'Account',
      page: createTestPage('account'),
      canEnter: () => login,
    });
    const route = defineRoutes({ home, login, account });

    await provideRouter(route);

    await expect(navigate('/account')).rejects.toThrow(
      'VR_GUARD_REDIRECT_LOOP: Guard redirects created a navigation loop at "/account".',
    );
  });

  it('runs the same decision pipeline for browser back and forward', async () => {
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

    await provideRouter(route);
    window.history.pushState(null, '', '/account');
    window.dispatchEvent(new PopStateEvent('popstate'));
    await flushNavigation();

    expect(getCurrentMatch()?.route).toBe(route.login);
    expect(window.location.pathname).toBe('/login');
  });
});

async function flushNavigation(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}
