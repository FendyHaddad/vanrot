// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createRoutes, defineRoutes } from '../../src/index.js';
import {
  resetNavigationPolishConfigForTests,
  setNavigationPolishConfigForTests,
} from '../../src/route/navigation-polish-config.js';
import {
  resetNavigationPolishForTests,
} from '../../src/route/navigation-polish.js';
import {
  navigate,
  provideRouter,
  resetRouterForTests,
} from '../../src/route/router-state.js';
import { createTestLayout, createTestPage } from '../../src/test/test-pages.js';

describe('router navigation polish document metadata', () => {
  beforeEach(() => {
    resetRouterForTests();
    resetNavigationPolishForTests();
    resetNavigationPolishConfigForTests();
    document.head.replaceChildren();
    document.title = 'Before';
    window.history.replaceState(null, '', '/');
  });

  afterEach(() => {
    resetRouterForTests();
    resetNavigationPolishForTests();
    resetNavigationPolishConfigForTests();
  });

  it('updates title and meta description after successful navigation', async () => {
    const routes = createRoutes();
    const home = routes.page({
      path: '/',
      label: 'Home',
      title: 'Home - Vanrot',
      meta: { description: 'Home docs.' },
      page: createTestPage('home'),
    });
    const buttons = routes.page({
      path: '/buttons',
      label: 'Button',
      title: 'Button - Vanrot',
      meta: { description: 'Button docs.' },
      page: createTestPage('buttons'),
    });

    const route = defineRoutes({ home, buttons });

    await provideRouter(route);
    await navigate('/buttons');

    expect(document.title).toBe('Button - Vanrot');
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
      'Button docs.',
    );
  });

  it('uses deepest child metadata over parent layout metadata', async () => {
    const routes = createRoutes();
    const docs = routes.layout({
      path: '/docs',
      label: 'Docs',
      title: 'Docs - Vanrot',
      meta: { description: 'Docs shell.' },
      layout: createTestLayout('docs'),
    });
    const buttons = docs.page({
      path: 'buttons',
      label: 'Button',
      title: 'Button - Vanrot',
      meta: { description: 'Button docs.' },
      page: createTestPage('buttons'),
    });

    const route = defineRoutes({ docs, buttons });

    window.history.replaceState(null, '', '/docs/buttons');
    await provideRouter(route);

    expect(document.title).toBe('Button - Vanrot');
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
      'Button docs.',
    );
  });

  it('does not update title or meta when a guard blocks navigation', async () => {
    const routes = createRoutes();
    const home = routes.page({
      path: '/',
      label: 'Home',
      title: 'Current Page',
      meta: { description: 'Current page.' },
      page: createTestPage('home'),
    });
    const blocked = routes.page({
      path: '/blocked',
      label: 'Blocked',
      title: 'Blocked Page',
      meta: { description: 'Blocked page.' },
      canEnter: () => false,
      page: createTestPage('blocked'),
    });

    const route = defineRoutes({ home, blocked });

    await provideRouter(route);
    await navigate('/blocked');

    expect(document.title).toBe('Current Page');
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
      'Current page.',
    );
  });

  it('respects disabled title and meta polish config', async () => {
    setNavigationPolishConfigForTests({
      navigationPolish: { title: false, meta: false, scroll: true, focus: true },
      diagnostics: { missingTitle: 'off', missingMetaDescription: 'off' },
    });

    const routes = createRoutes();
    const home = routes.page({
      path: '/',
      label: 'Home',
      title: 'Home - Vanrot',
      meta: { description: 'Home docs.' },
      page: createTestPage('home'),
    });

    const route = defineRoutes({ home });

    await provideRouter(route);

    expect(document.title).toBe('Before');
    expect(document.querySelector('meta[name="description"]')).toBeNull();
  });
});
