import { readdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { build } from 'vite';
import { afterEach, describe, expect, it } from 'vitest';

const appRoot = resolve(import.meta.dirname, '..');
const outDir = resolve(appRoot, 'dist');

describe('counter example build', () => {
  afterEach(async () => {
    await rm(outDir, { recursive: true, force: true });
  });

  it('builds JavaScript and scoped CSS assets through Vite', async () => {
    await build({
      root: appRoot,
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
  });
});
