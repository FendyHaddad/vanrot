// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest';
import { setupRouteLink } from '../../src/dom/route-link.js';
import { defineRoutes } from '../../src/route/define-routes.js';
import { provideRouter, resetRouterForTests } from '../../src/route/router-state.js';
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

describe('setupRouteLink', () => {
  beforeEach(() => {
    resetRouterForTests();
    window.history.replaceState(null, '', routePath.home);
    provideRouter(route);
  });

  it('renders an accessible anchor from route metadata', () => {
    const anchor = document.createElement('a');

    setupRouteLink(anchor, route.about);

    expect(anchor.textContent).toBe(routeLabel.about);
    expect(anchor.getAttribute('href')).toBe(routePath.about);
  });

  it('navigates on normal same-origin left click', () => {
    const anchor = document.createElement('a');
    setupRouteLink(anchor, route.about);

    anchor.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }));

    expect(window.location.pathname).toBe(routePath.about);
  });

  it('lets modified clicks use browser behavior', () => {
    const anchor = document.createElement('a');
    setupRouteLink(anchor, route.about);
    anchor.addEventListener('click', (event) => event.preventDefault());

    anchor.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, metaKey: true }),
    );

    expect(window.location.pathname).toBe(routePath.home);
  });

  it('throws for parameterized route links until typed param links are designed', () => {
    const anchor = document.createElement('a');

    expect(() => setupRouteLink(anchor, route.user)).toThrow(
      'Route "user" requires params. Typed param links are deferred from Phase 8.',
    );
  });

  it('throws for missing route references', () => {
    const anchor = document.createElement('a');

    expect(() => setupRouteLink(anchor, undefined)).toThrow('Unknown Vanrot route reference.');
  });
});
