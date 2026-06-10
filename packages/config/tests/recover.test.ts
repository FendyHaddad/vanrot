import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { recoverVanrotConfig } from '../src/index.js';

describe('recoverVanrotConfig', () => {
  it('reconstructs config from project structure without git history', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'vanrot-config-recover-'));
    await writeFile(join(cwd, 'package.json'), '{"name":"recover-app","private":true}');
    await writeFile(join(cwd, 'vite.config.ts'), 'export default {}');
    await mkdir(join(cwd, 'src'));

    const result = await recoverVanrotConfig(cwd, { force: true });

    expect(result.written).toBe(true);
    expect(result.diagnostics).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: 'VRCFG005' })]),
    );

    const source = await readFile(join(cwd, 'vanrot.config.ts'), 'utf8');
    expect(source).toContain("engine: 'forge'");
    expect(source).toContain("root: 'src'");
    expect(source).toContain('port: 1964');
  });

  it('infers router and ui domains from installed dependencies', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'vanrot-config-recover-'));
    await writeFile(
      join(cwd, 'package.json'),
      JSON.stringify(
        {
          name: 'recover-app',
          private: true,
          dependencies: {
            '@vanrot/router': '^0.1.0',
            '@vanrot/ui': '^0.1.0',
          },
        },
        null,
        2,
      ),
    );
    await mkdir(join(cwd, 'src'));

    const result = await recoverVanrotConfig(cwd, { force: true });

    expect(result.written).toBe(true);
    const source = await readFile(join(cwd, 'vanrot.config.ts'), 'utf8');
    expect(source).toContain('router: {');
    expect(source).toContain('ui: {');
  });
});
