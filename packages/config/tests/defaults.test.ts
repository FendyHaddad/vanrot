import { describe, expect, it } from 'vitest';
import { normalizeVanrotConfig, vanrotUiFlavor, vanrotUiStyleMode } from '../src/index.js';

describe('normalizeVanrotConfig', () => {
  it('fills missing required domains with production defaults', () => {
    const normalized = normalizeVanrotConfig({});

    expect(normalized.schemaVersion).toBe(1);
    expect(normalized.source.root).toBe('src');
    expect(normalized.devServer.port).toBe(1964);
  });

  it('fills UI October defaults', () => {
    const normalized = normalizeVanrotConfig({});

    expect(normalized.ui.flavor).toBe(vanrotUiFlavor.october);
    expect(normalized.ui.styles).toBe(vanrotUiStyleMode.vanrotstyles);
    expect(normalized.ui.prefix).toBe('ui');
  });

  it('normalizes router navigation polish defaults', () => {
    const normalized = normalizeVanrotConfig({});

    expect(normalized.router).toEqual({
      navigationPolish: {
        title: true,
        meta: true,
        scroll: true,
        focus: true,
      },
      diagnostics: {
        missingTitle: 'warn',
        missingMetaDescription: 'off',
      },
    });
  });

  it('defaults behavior helpers to an empty opt-in list', () => {
    const normalized = normalizeVanrotConfig({});

    expect(normalized.behavior.enabled).toEqual([]);
  });

  it('normalizes formatting defaults', () => {
    const normalized = normalizeVanrotConfig({
      formatting: {
        locale: 'ms-MY',
        timezone: 'Asia/Kuala_Lumpur',
        currency: 'MYR',
      },
    });

    expect(normalized.formatting).toEqual({
      locale: 'ms-MY',
      timezone: 'Asia/Kuala_Lumpur',
      currency: 'MYR',
    });
  });

  it('respects explicit behavior helper selections', () => {
    const normalized = normalizeVanrotConfig({
      behavior: {
        enabled: ['tooltip', 'toast'],
      },
    });

    expect(normalized.behavior.enabled).toEqual(['tooltip', 'toast']);
  });

  it('respects explicit user values', () => {
    const normalized = normalizeVanrotConfig({
      schemaVersion: 1,
      source: { root: 'app' },
      devServer: { port: 5174 },
      project: { name: 'demo' },
    });

    expect(normalized.source.root).toBe('app');
    expect(normalized.devServer.port).toBe(5174);
    expect(normalized.project?.name).toBe('demo');
  });

  it('respects explicit UI style choices', () => {
    const normalized = normalizeVanrotConfig({
      ui: {
        flavor: vanrotUiFlavor.october,
        styles: vanrotUiStyleMode.tailwind,
        prefix: 'marketing',
      },
    });

    expect(normalized.ui.flavor).toBe(vanrotUiFlavor.october);
    expect(normalized.ui.styles).toBe(vanrotUiStyleMode.tailwind);
    expect(normalized.ui.prefix).toBe('marketing');
  });

  it('respects explicit router navigation polish config', () => {
    const normalized = normalizeVanrotConfig({
      router: {
        navigationPolish: {
          title: false,
          meta: false,
          scroll: false,
          focus: false,
        },
        diagnostics: {
          missingTitle: 'off',
          missingMetaDescription: 'error',
        },
      },
    });

    expect(normalized.router.navigationPolish.title).toBe(false);
    expect(normalized.router.navigationPolish.meta).toBe(false);
    expect(normalized.router.navigationPolish.scroll).toBe(false);
    expect(normalized.router.navigationPolish.focus).toBe(false);
    expect(normalized.router.diagnostics.missingTitle).toBe('off');
    expect(normalized.router.diagnostics.missingMetaDescription).toBe('error');
  });

  it('does not leave SEO residue when the app did not opt in', () => {
    expect(normalizeVanrotConfig({}).seo).toBeUndefined();
  });

  it('normalizes SEO settings only when configured', () => {
    const normalized = normalizeVanrotConfig({
      seo: {
        defaults: {
          title: 'Vanrot',
        },
      },
    });

    expect(normalized.seo).toEqual({
      defaults: {
        title: 'Vanrot',
      },
      social: {},
      robots: {
        directives: [],
      },
      sitemap: {
        enabled: true,
        routes: [],
      },
      structuredData: {},
      diagnostics: {
        mode: 'warn',
      },
    });
  });
});
