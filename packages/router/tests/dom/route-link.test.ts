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
  beforeEach(async () => {
    resetRouterForTests();
    window.history.replaceState(null, '', routePath.home);
    await provideRouter(route);
  });

  it('renders an accessible anchor from route metadata', () => {
    const anchor = document.createElement('a');

    setupRouteLink(anchor, route.about);

    expect(anchor.textContent).toBe(routeLabel.about);
    expect(anchor.getAttribute('href')).toBe(routePath.about);
  });

  it('navigates on normal same-origin left click', async () => {
    const anchor = document.createElement('a');
    setupRouteLink(anchor, route.about);

    anchor.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }));
    await flushNavigation();

    expect(window.location.pathname).toBe(routePath.about);
  });

  it('builds parameterized route hrefs from route objects and params', () => {
    const anchor = document.createElement('a');

    setupRouteLink(anchor, route.user, { params: { id: '42' } });

    expect(anchor.textContent).toBe(routeLabel.user);
    expect(anchor.getAttribute('href')).toBe('/users/42');
  });

  it('marks the exact active route link with aria-current', async () => {
    const anchor = document.createElement('a');
    setupRouteLink(anchor, route.about);

    expect(anchor.hasAttribute('aria-current')).toBe(false);

    anchor.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }));
    await flushNavigation();

    expect(anchor.getAttribute('aria-current')).toBe('page');
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

  it('throws for parameterized route links without params', () => {
    const anchor = document.createElement('a');

    expect(() => setupRouteLink(anchor, route.user)).toThrow(
      'Route "user" is missing required param "id".',
    );
  });

  it('throws for missing route references', () => {
    const anchor = document.createElement('a');

    expect(() => setupRouteLink(anchor, undefined)).toThrow('Unknown Vanrot route reference.');
  });
});

async function flushNavigation(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}
