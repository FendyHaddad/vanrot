import { describe, expect, it } from 'vitest';
import { defineRoutes } from '../../src/route/define-routes.js';
import { createTestPage } from '../../src/test/test-pages.js';

const routePath = {
  home: '/',
  user: '/users/:id',
} as const;

const routeLabel = {
  home: 'Home',
  user: 'User',
} as const;

describe('defineRoutes', () => {
  it('preserves named route keys on route records', () => {
    const route = defineRoutes({
      home: {
        path: routePath.home,
        label: routeLabel.home,
        page: createTestPage('home'),
      },
      user: {
        path: routePath.user,
        label: routeLabel.user,
        loadPage: async () => createTestPage('user'),
      },
    });

    expect(route.home.key).toBe('home');
    expect(route.home.path).toBe(routePath.home);
    expect(route.home.label).toBe(routeLabel.home);
    expect(route.user.key).toBe('user');
    expect(route.user.path).toBe(routePath.user);
    expect(route.user.label).toBe(routeLabel.user);
  });

  it('throws when a route is missing both page and loadPage', () => {
    expect(() =>
      defineRoutes({
        broken: {
          path: '/broken',
          label: 'Broken',
        },
      }),
    ).toThrow('Route "broken" must define page or loadPage.');
  });
});
