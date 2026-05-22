import { describe, expect, it } from 'vitest';
import { validateVanrotConfig } from '../src/index.js';

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
