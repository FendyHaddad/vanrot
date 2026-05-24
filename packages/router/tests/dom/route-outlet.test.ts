// @vitest-environment jsdom

import { onDestroy } from '@vanrot/runtime';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRouterOutlet } from '../../src/dom/route-outlet.js';
import { createRoutes } from '../../src/route/create-routes.js';
import { defineRoutes } from '../../src/route/define-routes.js';
import {
  getCurrentMatch,
  navigate,
  provideRouter,
  resetRouterForTests,
} from '../../src/route/router-state.js';

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

    await provideRouter(route);
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

    await provideRouter(route);
    disposeOutlet = createRouterOutlet(host);
    await flushRouteOutlet();
    await navigate(routePath.about);
    await flushRouteOutlet();

    expect(destroyed).toHaveBeenCalledOnce();
    expect(host.textContent).toBe('About page');
  });

  it('uses router navigation and intent preload for internal anchors inside routed content', async () => {
    const loadAbout = vi.fn(async () => pageWithText('About page'));
    const host = document.createElement('main');
    const routes = createRoutes();
    const home = routes.page({
      path: routePath.home,
      label: routeLabel.home,
      page: pageWithLink(routePath.about, routeLabel.about),
    });
    const about = routes.page({
      path: routePath.about,
      label: routeLabel.about,
      loadPage: loadAbout,
      preload: routes.preload.intent(),
    });
    const route = defineRoutes({ home, about });

    await provideRouter(route);
    disposeOutlet = createRouterOutlet(host);
    await flushRouteOutlet();

    const anchor = host.querySelector('a');
    expect(anchor).not.toBeNull();

    anchor?.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    await flushRouteOutlet();

    expect(loadAbout).toHaveBeenCalledOnce();

    const click = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 });
    const didDispatch = anchor?.dispatchEvent(click);
    await flushRouteOutlet();

    expect(didDispatch).toBe(false);
    expect(click.defaultPrevented).toBe(true);
    expect(getCurrentMatch()?.route).toBe(route.about);
    expect(window.location.pathname).toBe(routePath.about);
    expect(host.textContent).toBe('About page');
  });

  it('keeps the current page visible until a lazy next page resolves', async () => {
    const destroyed = vi.fn();
    let resolveAbout!: (page: ReturnType<typeof pageWithText>) => void;
    const loadAbout = vi.fn(
      () =>
        new Promise<ReturnType<typeof pageWithText>>((resolve) => {
          resolveAbout = resolve;
        }),
    );
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
        loadPage: loadAbout,
      },
    });

    await provideRouter(route);
    disposeOutlet = createRouterOutlet(host);
    await flushRouteOutlet();
    await navigate(routePath.about);
    await flushRouteOutlet();

    expect(loadAbout).toHaveBeenCalledOnce();
    expect(destroyed).not.toHaveBeenCalled();
    expect(host.textContent).toBe('Home page');

    resolveAbout(pageWithText('About page'));
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

function pageWithLink(href: string, label: string) {
  return {
    createComponent() {
      const node = document.createElement('section');
      const anchor = document.createElement('a');
      anchor.href = href;
      anchor.textContent = label;
      node.append(anchor);

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
