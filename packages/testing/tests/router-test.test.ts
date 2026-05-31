// @vitest-environment jsdom

import { createRoutes, defineRoutes } from '@vanrot/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setupRouterTest } from '../src/router.js';

describe('setupRouterTest', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
  });

  it('navigates with route refs, params, and query values', async () => {
    const routes = createRoutes();
    const home = routes.page({ path: '/', label: 'Home', page: createTestPage('Home') });
    const profile = routes.page({
      path: '/users/:id',
      label: 'Profile',
      page: createTestPage('Profile'),
      query: { tab: {} },
    });
    const route = defineRoutes({ home, profile });
    const router = await setupRouterTest(route, {
      initialRoute: route.profile,
      params: { id: '42' },
      query: { tab: 'details' },
    });

    router.expect.currentRoute(route.profile);
    router.expect.currentPath('/users/42?tab=details');
    router.expect.params({ id: '42' });
    router.expect.query({ tab: 'details' });

    await router.navigate(route.home);

    router.expect.currentRoute(route.home);

    await router.cleanup();
  });

  it('covers redirects, guards, lazy pages, and teardown', async () => {
    const loadPage = vi.fn(async () => createTestPage('Lazy'));
    const routes = createRoutes();
    const home = routes.page({ path: '/', label: 'Home', page: createTestPage('Home') });
    const login = routes.page({
      path: '/login',
      label: 'Login',
      page: createTestPage('Login'),
      query: { returnTo: {} },
    });
    const account = routes.page({
      path: '/account',
      label: 'Account',
      page: createTestPage('Account'),
      canEnter: () => routes.redirectTo(login, { query: { returnTo: '/account' } }),
    });
    const lazy = routes.page({ path: '/lazy', label: 'Lazy', loadPage });
    const route = defineRoutes({ home, login, account, lazy });
    const router = await setupRouterTest(route, { initialRoute: route.home });

    await router.navigate(route.account);

    router.expect.currentRoute(route.login);
    router.expect.query({ returnTo: '/account' });

    await router.navigate(route.lazy);

    router.expect.currentRoute(route.lazy);
    expect(loadPage).toHaveBeenCalledTimes(1);

    await router.cleanup();

    expect(() => router.expect.currentRoute(route.lazy)).toThrow(
      'Router test has already been cleaned up.',
    );
  });
});

function createTestPage(text: string) {
  return {
    createComponent() {
      const node = document.createElement('main');
      node.textContent = text;

      return {
        node,
        ctx: {},
      };
    },
  };
}
