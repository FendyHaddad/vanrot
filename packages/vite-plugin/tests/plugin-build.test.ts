import { mkdir, readFile, readdir, rm, symlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { build } from 'vite';
import { afterEach, describe, expect, it } from 'vitest';

const fixtureRoot = resolve(import.meta.dirname, 'fixtures/basic-app');
const outDir = resolve(fixtureRoot, 'dist');
const cleanFixtureRoot = resolve(import.meta.dirname, 'fixtures/clean-app');
const cleanOutDir = resolve(cleanFixtureRoot, 'dist');
const cleanNodeModulesDir = resolve(cleanFixtureRoot, 'node_modules');
const cleanVanrotModulesDir = resolve(cleanNodeModulesDir, '@vanrot');
const packageRoot = resolve(import.meta.dirname, '..');
const runtimePackageRoot = resolve(import.meta.dirname, '../../runtime');

describe('Vanrot Vite build integration', () => {
  afterEach(async () => {
    await Promise.all([
      rm(outDir, { recursive: true, force: true }),
      rm(cleanOutDir, { recursive: true, force: true }),
      rm(cleanNodeModulesDir, { recursive: true, force: true }),
    ]);
  });

  it('builds a Vanrot component app', async () => {
    await build({
      root: fixtureRoot,
      logLevel: 'silent',
      css: {
        devSourcemap: true,
      },
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

  it('builds a clean app-style fixture from package outputs with sourcemaps', async () => {
    await linkCleanFixtureWorkspacePackages();

    await build({
      root: cleanFixtureRoot,
      logLevel: 'silent',
      build: {
        outDir: cleanOutDir,
        emptyOutDir: true,
        cssMinify: false,
        sourcemap: true,
      },
    });

    const assets = await readdir(resolve(cleanOutDir, 'assets'));
    expect(assets).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/\.js$/),
        expect.stringMatching(/\.css$/),
        expect.stringMatching(/\.js\.map$/),
        expect.stringMatching(/\.css\.map$/),
      ]),
    );

    const cssAssets = assets.filter((asset) => asset.endsWith('.css'));
    const cssOutput = await Promise.all(
      cssAssets.map((asset) => readFile(resolve(cleanOutDir, 'assets', asset), 'utf8')),
    );
    expect(cssOutput.join('\n')).toContain('rebeccapurple');
  });
});

async function linkCleanFixtureWorkspacePackages(): Promise<void> {
  await rm(cleanNodeModulesDir, { recursive: true, force: true });
  await mkdir(cleanVanrotModulesDir, { recursive: true });
  await symlink(packageRoot, resolve(cleanVanrotModulesDir, 'vite-plugin'), 'dir');
  await symlink(runtimePackageRoot, resolve(cleanVanrotModulesDir, 'runtime'), 'dir');
}
