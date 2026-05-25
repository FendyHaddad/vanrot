import { afterEach, describe, expect, it } from 'vitest';
import { createRoutes, defineRoutes, routeDiagnosticCodes } from '../../src/index.js';
import {
  resetNavigationPolishConfigForTests,
  setNavigationPolishConfigForTests,
} from '../../src/route/navigation-polish-config.js';
import { createTestPage } from '../../src/test/test-pages.js';

describe('route document metadata', () => {
  afterEach(() => {
    resetNavigationPolishConfigForTests();
  });

  it('keeps optional title and meta description on defined routes', () => {
    const routes = createRoutes();
    const home = routes.page({
      path: '/',
      label: 'Home',
      title: 'Home - Vanrot',
      meta: { description: 'Home page.' },
      page: createTestPage('home'),
    });

    const route = defineRoutes({ home });

    expect(route.home.title).toBe('Home - Vanrot');
    expect(route.home.meta).toEqual({ description: 'Home page.' });
  });

  it('warns for missing titles when configured', () => {
    setNavigationPolishConfigForTests({
      navigationPolish: { title: true, meta: true, scroll: true, focus: true },
      diagnostics: { missingTitle: 'warn', missingMetaDescription: 'off' },
    });

    const routes = createRoutes();
    const home = routes.page({ path: '/', label: 'Home', page: createTestPage('home') });
    const route = defineRoutes({ home });

    expect(route.home.diagnostics).toContainEqual(
      expect.objectContaining({
        code: routeDiagnosticCodes.missingTitle,
        severity: 'warning',
      }),
    );
  });

  it('throws for missing titles when configured as error', () => {
    setNavigationPolishConfigForTests({
      navigationPolish: { title: true, meta: true, scroll: true, focus: true },
      diagnostics: { missingTitle: 'error', missingMetaDescription: 'off' },
    });

    const routes = createRoutes();
    const home = routes.page({ path: '/', label: 'Home', page: createTestPage('home') });

    expect(() => defineRoutes({ home })).toThrow(
      'VR_ROUTE_MISSING_TITLE: Route "home" is missing title metadata.',
    );
  });
});
