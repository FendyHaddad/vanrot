import { readFile, readdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { build } from 'vite';
import { afterEach, describe, expect, it } from 'vitest';

const fixtureRoot = resolve(import.meta.dirname, 'fixtures/basic-app');
const outDir = resolve(fixtureRoot, 'dist');

describe('Vanrot Vite build integration', () => {
  afterEach(async () => {
    await rm(outDir, { recursive: true, force: true });
  });

  it('builds a Vanrot component app', async () => {
    await build({
      root: fixtureRoot,
      logLevel: 'silent',
      build: {
        outDir,
        emptyOutDir: true,
      },
    });

    const assets = await readdir(resolve(outDir, 'assets'));
    expect(assets).toEqual(
      expect.arrayContaining([expect.stringMatching(/\.js$/), expect.stringMatching(/\.css$/)]),
    );

    const cssAssets = assets.filter((asset) => asset.endsWith('.css'));
    const cssOutput = await Promise.all(
      cssAssets.map((asset) => readFile(resolve(outDir, 'assets', asset), 'utf8')),
    );
    expect(cssOutput.join('\n')).toContain('.vr-button');
    expect(cssOutput.join('\n')).toContain('.vr-button-primary');
  });
});
