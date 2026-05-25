// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createRouterOutlet } from '../../src/dom/route-outlet.js';
import { createRoutes, defineRoutes } from '../../src/index.js';
import {
  resetNavigationPolishConfigForTests,
  setNavigationPolishConfigForTests,
} from '../../src/route/navigation-polish-config.js';
import { navigate, provideRouter, resetRouterForTests } from '../../src/route/router-state.js';

describe('route outlet navigation polish', () => {
  let disposeOutlet = (): void => {};

  beforeEach(() => {
    disposeOutlet();
    disposeOutlet = (): void => {};
    resetRouterForTests();
    resetNavigationPolishConfigForTests();
    setNavigationPolishConfigForTests({
      navigationPolish: { title: false, meta: false, scroll: false, focus: true },
      diagnostics: { missingTitle: 'off', missingMetaDescription: 'off' },
    });
    window.history.replaceState(null, '', '/');
  });

  afterEach(() => {
    disposeOutlet();
    disposeOutlet = (): void => {};
    resetRouterForTests();
    resetNavigationPolishConfigForTests();
  });

  it('focuses the first heading after navigation view mounts', async () => {
    const host = document.createElement('main');
    document.body.append(host);
    const routes = createRoutes();
    const home = routes.page({
      path: '/',
      label: 'Home',
      page: pageWithHeading('Home'),
    });
    const buttons = routes.page({
      path: '/buttons',
      label: 'Button',
      page: pageWithHeading('Button'),
    });
    const route = defineRoutes({ home, buttons });

    await provideRouter(route);
    disposeOutlet = createRouterOutlet(host, { kind: 'router' });
    await flushRouteOutlet();
    await navigate('/buttons');
    await flushRouteOutlet();

    expect(document.activeElement?.tagName).toBe('H1');
    expect(document.activeElement?.textContent).toBe('Button');
    host.remove();
  });

  it('does not focus an empty outlet before a lazy route resolves', async () => {
    let resolveLazyPage!: (page: ReturnType<typeof pageWithHeading>) => void;
    const host = document.createElement('main');
    document.body.append(host);
    const routes = createRoutes();
    const home = routes.page({
      path: '/',
      label: 'Home',
      page: pageWithHeading('Home'),
    });
    const lazy = routes.page({
      path: '/lazy',
      label: 'Lazy',
      loadPage: () =>
        new Promise<ReturnType<typeof pageWithHeading>>((resolve) => {
          resolveLazyPage = resolve;
        }),
    });
    const route = defineRoutes({ home, lazy });

    await provideRouter(route);
    disposeOutlet = createRouterOutlet(host, { kind: 'router' });
    await flushRouteOutlet();
    await navigate('/lazy');
    await flushRouteOutlet();

    expect(document.activeElement?.tagName).toBe('H1');
    expect(document.activeElement?.textContent).toBe('Home');

    resolveLazyPage(pageWithHeading('Lazy Button'));
    await flushRouteOutlet();

    expect(document.activeElement?.tagName).toBe('H1');
    expect(document.activeElement?.textContent).toBe('Lazy Button');
    host.remove();
  });
});

async function flushRouteOutlet(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

function pageWithHeading(text: string) {
  return {
    createComponent() {
      const section = document.createElement('section');
      const heading = document.createElement('h1');
      heading.textContent = text;
      section.append(heading);

      return { node: section, ctx: {} };
    },
  };
}
