// @vitest-environment jsdom

import { onDestroy } from '@vanrot/runtime';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRouterOutlet } from '../../src/dom/route-outlet.js';
import { defineRoutes } from '../../src/route/define-routes.js';
import { navigate, provideRouter, resetRouterForTests } from '../../src/route/router-state.js';

const routePath = {
  home: '/',
  about: '/about',
} as const;

const routeLabel = {
  home: 'Home',
  about: 'About',
} as const;

describe('createRouterOutlet', () => {
  let disposeOutlet = (): void => {};

  beforeEach(() => {
    disposeOutlet();
    disposeOutlet = (): void => {};
    resetRouterForTests();
    window.history.replaceState(null, '', routePath.home);
  });

  afterEach(() => {
    disposeOutlet();
    disposeOutlet = (): void => {};
  });

  it('mounts the current route page', async () => {
    const host = document.createElement('main');
    const route = defineRoutes({
      home: {
        path: routePath.home,
        label: routeLabel.home,
        page: pageWithText('Home page'),
      },
    });

    provideRouter(route);
    disposeOutlet = createRouterOutlet(host);
    await flushRouteOutlet();

    expect(host.textContent).toBe('Home page');
  });

  it('destroys the previous page before mounting the next one', async () => {
    const destroyed = vi.fn();
    const host = document.createElement('main');
    const route = defineRoutes({
      home: {
        path: routePath.home,
        label: routeLabel.home,
        page: pageWithDestroy('Home page', destroyed),
      },
      about: {
        path: routePath.about,
        label: routeLabel.about,
        loadPage: async () => pageWithText('About page'),
      },
    });

    provideRouter(route);
    disposeOutlet = createRouterOutlet(host);
    await flushRouteOutlet();
    navigate(routePath.about);
    await flushRouteOutlet();

    expect(destroyed).toHaveBeenCalledOnce();
    expect(host.textContent).toBe('About page');
  });
});

async function flushRouteOutlet(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

function pageWithText(text: string) {
  return {
    createComponent() {
      const node = document.createElement('section');
      node.textContent = text;

      return { node, ctx: {} };
    },
  };
}

function pageWithDestroy(text: string, destroyed: () => void) {
  return {
    createComponent() {
      onDestroy(destroyed);
      const node = document.createElement('section');
      node.textContent = text;

      return { node, ctx: {} };
    },
  };
}
