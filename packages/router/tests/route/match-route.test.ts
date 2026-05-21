import { describe, expect, it } from 'vitest';
import { defineRoutes } from '../../src/route/define-routes.js';
import { matchRoute } from '../../src/route/match-route.js';
import { createTestPage } from '../../src/test/test-pages.js';

const routePath = {
  home: '/',
  about: '/about',
  user: '/users/:id',
} as const;

const routeLabel = {
  home: 'Home',
  about: 'About',
  user: 'User',
} as const;

const route = defineRoutes({
  home: {
    path: routePath.home,
    label: routeLabel.home,
    page: createTestPage('home'),
  },
  about: {
    path: routePath.about,
    label: routeLabel.about,
    page: createTestPage('about'),
  },
  user: {
    path: routePath.user,
    label: routeLabel.user,
    page: createTestPage('user'),
  },
});

describe('matchRoute', () => {
  it('matches the root route', () => {
    expect(matchRoute(route, routePath.home)).toMatchObject({
      route: { key: 'home' },
      params: {},
    });
  });

  it('matches static paths without query strings', () => {
    expect(matchRoute(route, '/about?tab=team')).toMatchObject({
      route: { key: 'about' },
      params: {},
    });
  });

  it('matches parameterized paths', () => {
    expect(matchRoute(route, '/users/42')).toMatchObject({
      route: { key: 'user' },
      params: { id: '42' },
    });
  });

  it('returns null for unknown paths', () => {
    expect(matchRoute(route, '/missing')).toBeNull();
  });
});
