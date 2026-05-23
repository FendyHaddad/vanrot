import { describe, expect, it } from 'vitest';
import { createRoutes, defineRoutes } from '../../src/index.js';
import { resolveNavigationDecision } from '../../src/route/navigation-decisions.js';
import { createTestLayout, createTestPage } from '../../src/test/test-pages.js';

function createGuardedRouteTable() {
  const calls: string[] = [];
  const routes = createRoutes();
  const login = routes.page({
    path: '/login',
    label: 'Login',
    page: createTestPage('login'),
    query: { returnTo: {} },
  });
  const home = routes.page({ path: '/', label: 'Home', page: createTestPage('home') });
  const account = routes.layout({
    path: '/account',
    label: 'Account',
    layout: createTestLayout('account'),
    canEnter: ({ to }) => {
      calls.push(`account:${to.path}`);
      return true;
    },
  });
  const billing = account.page({
    path: 'billing',
    label: 'Billing',
    page: createTestPage('billing'),
    canEnter: [
      () => {
        calls.push('billing:first');
        return true;
      },
      () => {
        calls.push('billing:second');
        return routes.redirectTo(login, { query: { returnTo: '/account/billing' } });
      },
    ],
  });

  return {
    calls,
    route: defineRoutes({ home, login, account, billing }),
  };
}

describe('navigation decisions', () => {
  it('runs layout and page guards in parent-to-child and left-to-right order', async () => {
    const { calls, route } = createGuardedRouteTable();

    const decision = await resolveNavigationDecision({
      routes: route,
      path: '/account/billing',
      from: null,
      navigationId: 1,
      isCurrentNavigation: () => true,
    });

    expect(decision).toMatchObject({
      kind: 'redirect',
      path: '/login?returnTo=%2Faccount%2Fbilling',
      replace: true,
    });
    expect(calls).toEqual(['account:/account/billing', 'billing:first', 'billing:second']);
  });

  it('blocks navigation when a guard returns false', async () => {
    const routes = createRoutes();
    const home = routes.page({ path: '/', label: 'Home', page: createTestPage('home') });
    const account = routes.page({
      path: '/account',
      label: 'Account',
      page: createTestPage('account'),
      canEnter: () => false,
    });
    const route = defineRoutes({ home, account });

    const decision = await resolveNavigationDecision({
      routes: route,
      path: '/account',
      from: { route: route.home, params: {}, query: {}, path: '/' },
      navigationId: 1,
      isCurrentNavigation: () => true,
    });

    expect(decision).toEqual({ kind: 'blocked' });
  });

  it('ignores stale async guard results', async () => {
    let allowAccount!: (value: boolean) => void;
    const routes = createRoutes();
    const home = routes.page({ path: '/', label: 'Home', page: createTestPage('home') });
    const account = routes.page({
      path: '/account',
      label: 'Account',
      page: createTestPage('account'),
      canEnter: () =>
        new Promise<boolean>((resolve) => {
          allowAccount = resolve;
        }),
    });
    const route = defineRoutes({ home, account });

    const decisionPromise = resolveNavigationDecision({
      routes: route,
      path: '/account',
      from: { route: route.home, params: {}, query: {}, path: '/' },
      navigationId: 1,
      isCurrentNavigation: (navigationId) => navigationId === 2,
    });

    allowAccount(true);

    await expect(decisionPromise).resolves.toEqual({ kind: 'stale' });
  });

  it('resolves redirect routes to their final target', async () => {
    const routes = createRoutes();
    const billing = routes.page({
      path: '/account/billing',
      label: 'Billing',
      page: createTestPage('billing'),
    });
    const oldBilling = routes.redirect({ path: '/billing', label: 'Old billing', to: billing });
    const route = defineRoutes({ billing, oldBilling });

    const decision = await resolveNavigationDecision({
      routes: route,
      path: '/billing',
      from: null,
      navigationId: 1,
      isCurrentNavigation: () => true,
    });

    expect(decision).toMatchObject({
      kind: 'redirect',
      path: '/account/billing',
      replace: true,
    });
  });

  it('throws when a guard returns an invalid value', async () => {
    const routes = createRoutes();
    const account = routes.page({
      path: '/account',
      label: 'Account',
      page: createTestPage('account'),
      canEnter: () => 'not-a-guard-result' as never,
    });
    const route = defineRoutes({ account });

    await expect(
      resolveNavigationDecision({
        routes: route,
        path: '/account',
        from: null,
        navigationId: 1,
        isCurrentNavigation: () => true,
      }),
    ).rejects.toThrow('VR_ROUTE_INVALID_GUARD_RESULT: Guard returned an unsupported navigation result.');
  });
});
