// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest';
import { defineRoutes } from '../../src/route/define-routes.js';
import {
  getCurrentMatch,
  navigate,
  provideRouter,
  resetRouterForTests,
  routeParams,
} from '../../src/route/router-state.js';
import { createTestPage } from '../../src/test/test-pages.js';

const routePath = {
  home: '/',
  user: '/users/:id',
} as const;

const routeLabel = {
  home: 'Home',
  user: 'User',
} as const;

const route = defineRoutes({
  home: {
    path: routePath.home,
    label: routeLabel.home,
    page: createTestPage('home'),
  },
  user: {
    path: routePath.user,
    label: routeLabel.user,
    page: createTestPage('user'),
  },
});

describe('router state', () => {
  beforeEach(() => {
    resetRouterForTests();
    window.history.replaceState(null, '', routePath.home);
  });

  it('provides the initial route from the browser path', () => {
    provideRouter(route);

    expect(getCurrentMatch()).toMatchObject({
      route: { key: 'home' },
      params: {},
    });
    expect(routeParams()).toEqual({});
  });

  it('navigates and updates params', () => {
    provideRouter(route);
    navigate('/users/42');

    expect(getCurrentMatch()).toMatchObject({
      route: { key: 'user' },
      params: { id: '42' },
    });
    expect(routeParams()).toEqual({ id: '42' });
  });

  it('throws when no route matches', () => {
    provideRouter(route);

    expect(() => navigate('/missing')).toThrow('No Vanrot route matches "/missing".');
  });

  it('throws when navigation happens before provideRouter()', () => {
    expect(() => navigate(routePath.home)).toThrow(
      'Call provideRouter() before using Vanrot router primitives.',
    );
  });
});
