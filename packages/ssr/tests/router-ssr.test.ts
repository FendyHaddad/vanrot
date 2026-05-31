import { describe, expect, it } from 'vitest';
import { type ComponentType } from '@vanrot/runtime';
import { createRoutes, defineRoutes } from '@vanrot/router';
import { renderRouteToString, resolveSsrRoute } from '../src/index.js';

const HomePage = {
  renderToHtml() {
    return { html: '<main>Home</main>', ctx: null };
  },
} as ComponentType;

const AccountPage = {
  renderToHtml(inputs) {
    return { html: `<main>Account ${inputs['accountId']}</main>`, ctx: null };
  },
} as ComponentType;

describe('router SSR integration', () => {
  it('matches route refs, params, query, guards, and lazy route boundaries', async () => {
    const routeBuilder = createRoutes();
    const home = routeBuilder.page({ path: '/', label: 'Home', page: HomePage });
    const account = routeBuilder.page({
      path: '/account/:accountId',
      label: 'Account',
      loadPage: async () => ({ default: AccountPage }),
      canEnter: () => true,
    });
    const routes = defineRoutes({ home, account });

    const result = await resolveSsrRoute(routes, '/account/42?tab=billing');

    expect(result).toMatchObject({
      status: 'matched',
      path: '/account/42?tab=billing',
      routeKeys: ['account'],
      params: { accountId: '42' },
      query: { tab: 'billing' },
      lazy: true,
    });
    expect(result.component).toBe(AccountPage);
  });

  it('returns deterministic redirect and blocked guard results', async () => {
    const routeBuilder = createRoutes();
    const login = routeBuilder.page({ path: '/login', label: 'Login', page: HomePage });
    const account = routeBuilder.page({
      path: '/account',
      label: 'Account',
      page: AccountPage,
      canEnter: () => login,
    });
    const blocked = routeBuilder.page({
      path: '/blocked',
      label: 'Blocked',
      page: AccountPage,
      canEnter: () => false,
    });
    const routes = defineRoutes({ login, account, blocked });

    await expect(resolveSsrRoute(routes, '/account')).resolves.toMatchObject({
      status: 'redirect',
      code: 'VRSSR_ROUTE_REDIRECT',
      location: '/login',
    });
    await expect(resolveSsrRoute(routes, '/blocked')).resolves.toMatchObject({
      status: 'blocked',
      code: 'VRSSR_ROUTE_GUARD_BLOCKED',
    });
  });

  it('renders the matched page with route params as component inputs', async () => {
    const routeBuilder = createRoutes();
    const account = routeBuilder.page({
      path: '/account/:accountId',
      label: 'Account',
      page: AccountPage,
    });
    const routes = defineRoutes({ account });

    await expect(renderRouteToString(routes, '/account/42')).resolves.toBe('<main>Account 42</main>');
  });
});
