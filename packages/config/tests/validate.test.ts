import { describe, expect, it } from 'vitest';
import { configDiagnosticCode, validateVanrotConfig } from '../src/index.js';

describe('validateVanrotConfig', () => {
  it('reports invalid engines', () => {
    expect(validateVanrotConfig({ engine: 'webpack' as never })).toEqual([
      {
        code: configDiagnosticCode.invalidEngine,
        severity: 'error',
        message: 'Invalid engine: webpack',
        suggestion: 'Use forge or vite.',
      },
    ]);
  });

  it('reports invalid port ranges as semantic errors', () => {
    const diagnostics = validateVanrotConfig({
      schemaVersion: 1,
      devServer: { port: 80_000 },
    });

    expect(diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'VRCFG003',
          severity: 'error',
        }),
      ]),
    );
  });

  it('reports invalid UI flavor values', () => {
    const diagnostics = validateVanrotConfig({
      schemaVersion: 1,
      ui: { flavor: 'summer' },
    } as unknown as Parameters<typeof validateVanrotConfig>[0]);

    expect(diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: configDiagnosticCode.invalidUiFlavor,
          severity: 'error',
        }),
      ]),
    );
  });

  it('reports invalid UI style modes', () => {
    const diagnostics = validateVanrotConfig({
      schemaVersion: 1,
      ui: { styles: 'primeflex' },
    } as unknown as Parameters<typeof validateVanrotConfig>[0]);

    expect(diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: configDiagnosticCode.invalidUiStyleMode,
          severity: 'error',
        }),
      ]),
    );
  });

  it('reports invalid UI prefixes', () => {
    const diagnostics = validateVanrotConfig({
      schemaVersion: 1,
      ui: { prefix: 'Not Valid' },
    } as unknown as Parameters<typeof validateVanrotConfig>[0]);

    expect(diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: configDiagnosticCode.invalidUiPrefix,
          severity: 'error',
        }),
      ]),
    );
  });

  it('reports invalid router navigation polish booleans', () => {
    const diagnostics = validateVanrotConfig({
      router: {
        navigationPolish: {
          scroll: 'yes',
        },
      },
    } as unknown as Parameters<typeof validateVanrotConfig>[0]);

    expect(diagnostics).toEqual([
      {
        code: configDiagnosticCode.invalidRouterNavigationPolish,
        severity: 'error',
        message: 'Invalid router.navigationPolish.scroll: yes',
        suggestion: 'Use true or false.',
      },
    ]);
  });

  it('reports invalid router diagnostic levels', () => {
    const diagnostics = validateVanrotConfig({
      router: {
        diagnostics: {
          missingTitle: 'loud',
        },
      },
    } as unknown as Parameters<typeof validateVanrotConfig>[0]);

    expect(diagnostics).toEqual([
      {
        code: configDiagnosticCode.invalidRouterDiagnosticLevel,
        severity: 'error',
        message: 'Invalid router.diagnostics.missingTitle: loud',
        suggestion: 'Use off, warn, or error.',
      },
    ]);
  });

  it('accepts known behavior helper names', () => {
    const diagnostics = validateVanrotConfig({
      behavior: {
        enabled: [
          'form',
          'table',
          'overlay',
          'tabs',
          'tooltip',
          'toast',
          'command-menu',
          'positioned-layer',
          'collapsible',
          'selection',
          'menu',
          'toggle',
          'scroll-area',
          'portal',
          'focus',
          'calendar',
          'drag-drop',
          'table-resize',
        ],
      },
    });

    expect(diagnostics).toEqual([]);
  });

  it('reports invalid behavior helper names', () => {
    const diagnostics = validateVanrotConfig({
      behavior: {
        enabled: ['ghost-helper'],
      },
    } as unknown as Parameters<typeof validateVanrotConfig>[0]);

    expect(diagnostics).toEqual([
      {
        code: configDiagnosticCode.invalidBehavior,
        severity: 'error',
        message: 'Invalid behavior.enabled entry: ghost-helper',
        suggestion:
          'Use form, table, overlay, tabs, tooltip, toast, command-menu, positioned-layer, collapsible, selection, menu, toggle, scroll-area, portal, focus, calendar, drag-drop, or table-resize.',
      },
    ]);
  });

  it('reports non-array behavior helper config', () => {
    const diagnostics = validateVanrotConfig({
      behavior: {
        enabled: 'tooltip',
      },
    } as unknown as Parameters<typeof validateVanrotConfig>[0]);

    expect(diagnostics).toEqual([
      {
        code: configDiagnosticCode.invalidBehavior,
        severity: 'error',
        message: 'Invalid behavior.enabled: tooltip',
        suggestion: 'Use an array of behavior helper names.',
      },
    ]);
  });

  it('reports unknown top-level keys as schema errors', () => {
    const diagnostics = validateVanrotConfig({
      schemaVersion: 1,
      source: { root: 'src' },
      devServer: { port: 1964 },
      ghost: true,
    } as unknown as Parameters<typeof validateVanrotConfig>[0]);

    expect(diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'VRCFG002',
          severity: 'error',
        }),
      ]),
    );
  });

  it('reports empty formatting values', () => {
    const diagnostics = validateVanrotConfig({
      formatting: {
        locale: '',
        timezone: '',
        currency: '',
      },
    });

    expect(diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: configDiagnosticCode.formattingLocaleEmpty }),
        expect.objectContaining({ code: configDiagnosticCode.formattingTimezoneEmpty }),
        expect.objectContaining({ code: configDiagnosticCode.formattingCurrencyEmpty }),
      ]),
    );
  });

  it('warns when SEO is enabled before the production site URL is known', () => {
    const diagnostics = validateVanrotConfig({
      seo: {
        defaults: {
          title: 'Vanrot',
          description: 'Modern web framework',
        },
      },
    });

    expect(diagnostics).toEqual([
      expect.objectContaining({
        code: configDiagnosticCode.missingSeoSiteUrl,
        severity: 'warning',
      }),
    ]);
  });

  it('validates SEO syntax even when siteUrl is missing', () => {
    const diagnostics = validateVanrotConfig({
      seo: {
        defaults: {
          title: 42,
          description: '',
        },
        diagnostics: {
          mode: 'loud',
        },
        robots: {
          directives: ['crawl-everything'],
        },
        sitemap: {
          routes: [{ path: 'docs' }],
        },
      },
    } as unknown as Parameters<typeof validateVanrotConfig>[0]);

    expect(diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: configDiagnosticCode.invalidSeoDefaultTitle }),
        expect.objectContaining({ code: configDiagnosticCode.invalidSeoDiagnosticsMode }),
        expect.objectContaining({ code: configDiagnosticCode.invalidSeoRobotsDirective }),
        expect.objectContaining({ code: configDiagnosticCode.invalidSeoSitemapRoute }),
        expect.objectContaining({ code: configDiagnosticCode.missingSeoSiteUrl }),
      ]),
    );
  });

  it('reports invalid SEO site URLs as errors', () => {
    const diagnostics = validateVanrotConfig({
      seo: {
        siteUrl: 'vanrot.local',
      },
    });

    expect(diagnostics).toEqual([
      expect.objectContaining({
        code: configDiagnosticCode.invalidSeoSiteUrl,
        severity: 'error',
      }),
    ]);
  });
});
