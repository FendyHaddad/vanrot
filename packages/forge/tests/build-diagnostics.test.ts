import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { runForgeBuild } from '../src/index.js';

describe('Forge build diagnostics', () => {
  it('emits a diagnostics summary when warnings exist', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'vanrot-forge-build-diagnostics-'));
    await writeFile(join(cwd, 'package.json'), '{"name":"build-warnings","private":true}');
    await writeFile(
      join(cwd, 'vanrot.config.ts'),
      "export default { engine: 'forge', source: { root: 'src' } };\n",
    );
    await writeFileAt(cwd, 'src/routes.ts', 'export const route = [];\n');

    const result = await runForgeBuild({ cwd });
    const summary = await readFile(join(cwd, 'dist', 'vanrot-diagnostics.txt'), 'utf8');

    expect(result.exitCode).toBe(0);
    expect(summary).toContain('VRFORGE006 warning');
  });
});

async function writeFileAt(cwd: string, path: string, content: string): Promise<void> {
  const filePath = join(cwd, path);
  await mkdir(join(filePath, '..'), { recursive: true });
  await writeFile(filePath, content);
}
