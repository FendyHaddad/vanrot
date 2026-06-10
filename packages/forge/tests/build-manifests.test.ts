import { cp, mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { runForgeBuild } from '../src/index.js';

const fixtureRoot = join(import.meta.dirname, 'fixtures', 'build-basic-app');

describe('Forge build manifests', () => {
  it('emits route and asset manifests from the app graph', async () => {
    const cwd = await copyBuildFixture('build-manifests');

    const result = await runForgeBuild({ cwd });
    const routes = JSON.parse(await readFile(join(cwd, 'dist', 'vanrot-routes.json'), 'utf8')) as {
      pages: Array<{ path: string; pageFilePath: string }>;
    };
    const assets = JSON.parse(await readFile(join(cwd, 'dist', 'vanrot-assets.json'), 'utf8')) as {
      assets: Array<{ path: string; kind: string }>;
    };

    expect(result.exitCode).toBe(0);
    expect(routes.pages).toEqual([
      expect.objectContaining({
        path: '/',
        pageFilePath: 'src/pages/home/home.page.ts',
      }),
    ]);
    expect(assets.assets).toEqual([
      { path: 'index.html', kind: 'html' },
      { path: 'assets/vanrot-app.js', kind: 'js' },
      { path: 'assets/vanrot-app.css', kind: 'css' },
      { path: 'vanrot-routes.json', kind: 'manifest' },
    ]);
  });
});

async function copyBuildFixture(name: string): Promise<string> {
  const cwd = join(await mkdtemp(join(tmpdir(), 'vanrot-forge-')), name);
  await cp(fixtureRoot, cwd, { recursive: true });
  return cwd;
}
