import { cp, mkdtemp, readFile, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { runForgeBuild } from '../src/index.js';

const fixtureRoot = join(import.meta.dirname, 'fixtures', 'build-basic-app');

describe('Forge build', () => {
  it('emits static browser output without faking SSR', async () => {
    const cwd = await copyBuildFixture('build-output');

    const result = await runForgeBuild({ cwd });

    expect(result.exitCode).toBe(0);
    await expect(stat(join(cwd, 'dist', 'index.html'))).resolves.toBeDefined();
    await expect(stat(join(cwd, 'dist', 'assets', 'vanrot-app.js'))).resolves.toBeDefined();
    await expect(stat(join(cwd, 'dist', 'assets', 'vanrot-app.css'))).resolves.toBeDefined();
    const html = await readFile(join(cwd, 'dist', 'index.html'), 'utf8');
    expect(html).toContain('/assets/vanrot-app.js');
    expect(html).not.toContain('ssr');
  });
});

async function copyBuildFixture(name: string): Promise<string> {
  const cwd = join(await mkdtemp(join(tmpdir(), 'vanrot-forge-')), name);
  await cp(fixtureRoot, cwd, { recursive: true });
  return cwd;
}
