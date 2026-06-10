import { describe, expect, it } from 'vitest';
import {
  requiredForgeBenchmarkFields,
  runForgeBenchmark,
} from './benchmark-forge.mjs';

describe('Forge benchmark harness', () => {
  it('reports deterministic benchmark fields without timing thresholds', async () => {
    const result = await runForgeBenchmark();

    for (const field of requiredForgeBenchmarkFields) {
      expect(result.forge).toHaveProperty(field);
      expect(result.vite).toHaveProperty(field);
    }

    expect(result.generatedAt).toBe('1970-01-01T00:00:00.000Z');
    expect(result.forge.installSurface).toContain('@vanrot/forge');
    expect(result.vite.installSurface).toContain('@vanrot/vite-plugin');
    expect(result.vite.installSurface).toContain('vite');
    expect(result.forge.productionBuildOutputFiles).toEqual(
      expect.arrayContaining([
        'index.html',
        'assets/vanrot-app.js',
        'assets/vanrot-app.css',
        'vanrot-routes.json',
        'vanrot-assets.json',
      ]),
    );
    expect(result.comparison.publicClaimAllowed).toBe(false);
  });
});
