import { describe, expect, it } from 'vitest';
import { configDiagnosticCode, validateVanrotConfig } from '../src/index.js';

describe('validateVanrotConfig', () => {
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

  it('reports unknown top-level keys as schema errors', () => {
    const diagnostics = validateVanrotConfig({
      schemaVersion: 1,
      source: { root: 'src' },
      devServer: { port: 1010 },
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
});
