import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadVanrotProjectConfig } from '../src/index.js';

async function tempRoot() {
  return mkdtemp(join(tmpdir(), 'vanrot-config-load-'));
}

describe('loadVanrotProjectConfig', () => {
  it('normalizes defaults when config file is missing', async () => {
    const cwd = await tempRoot();
    const result = await loadVanrotProjectConfig(cwd);

    expect(result.config.source.root).toBe('src');
    expect(result.config.devServer.port).toBe(1010);
    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'VRCFG004', severity: 'warning' }),
      ]),
    );
  });

  it('loads explicit values from vanrot.config.ts', async () => {
    const cwd = await tempRoot();
    await writeFile(
      join(cwd, 'vanrot.config.ts'),
      "export default { schemaVersion: 1, source: { root: 'client' }, devServer: { port: 2020 } };\n",
    );

    const result = await loadVanrotProjectConfig(cwd);
    expect(result.config.source.root).toBe('client');
    expect(result.config.devServer.port).toBe(2020);
  });

  it('loads canonical defineVanrotConfig module output', async () => {
    const cwd = await tempRoot();
    await writeFile(
      join(cwd, 'vanrot.config.ts'),
      [
        "import { defineVanrotConfig } from '@vanrot/config';",
        '',
        'export default defineVanrotConfig({',
        '  schemaVersion: 1,',
        "  source: { root: 'app' },",
        '  devServer: { port: 3030 },',
        '});',
        '',
      ].join('\n'),
    );

    const result = await loadVanrotProjectConfig(cwd);
    expect(result.config.source.root).toBe('app');
    expect(result.config.devServer.port).toBe(3030);
  });
});
