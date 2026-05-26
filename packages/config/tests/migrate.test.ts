import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { migrateVanrotConfig } from '../src/index.js';

describe('migrateVanrotConfig', () => {
  it('writes canonical config for legacy projects missing vanrot.config.ts', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'vanrot-config-migrate-'));
    await writeFile(join(cwd, 'package.json'), '{"name":"legacy","private":true}');

    const result = await migrateVanrotConfig(cwd);

    expect(result.written).toBe(true);
    const next = await readFile(join(cwd, 'vanrot.config.ts'), 'utf8');
    expect(next).toContain('defineVanrotConfig');
    expect(next).toContain('port: 1990');
  });

  it('does not overwrite an existing config unless destructive mode is enabled', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'vanrot-config-migrate-'));
    const configPath = join(cwd, 'vanrot.config.ts');
    await writeFile(configPath, 'export default { schemaVersion: 1, devServer: { port: 3030 } };\n');

    const skipped = await migrateVanrotConfig(cwd);
    expect(skipped.written).toBe(false);
    await expect(readFile(configPath, 'utf8')).resolves.toContain('3030');

    const overwritten = await migrateVanrotConfig(cwd, { destructive: true });
    expect(overwritten.written).toBe(true);
    await expect(readFile(configPath, 'utf8')).resolves.toContain('port: 1990');
  });
});
