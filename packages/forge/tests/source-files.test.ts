import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  classifyForgeFileRole,
  findOwnerRoleFile,
  scanForgeSourceFiles,
} from '../src/index.js';

describe('Forge source files', () => {
  it('scans the configured source root with stable POSIX paths', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'vanrot-forge-source-'));
    await writeFileAt(cwd, 'src/pages/home/home.page.ts', 'export class HomePage {}\n');
    await writeFileAt(cwd, 'src/pages/home/home.page.html', '<main></main>\n');
    await writeFileAt(cwd, 'src/pages/home/home.page.css', ':host { display: block; }\n');
    await writeFileAt(cwd, 'src/node_modules/ignored.ts', 'export const ignored = true;\n');
    await writeFileAt(cwd, 'src/.vanrot/cache.ts', 'export const ignored = true;\n');
    await writeFileAt(cwd, 'src/.cache/generated.ts', 'export const ignored = true;\n');
    await writeFileAt(cwd, 'src/dist/generated.ts', 'export const ignored = true;\n');

    const files = await scanForgeSourceFiles({ root: cwd, sourceRoot: 'src' });

    expect(files.map((file) => file.path)).toEqual([
      'src/pages/home/home.page.css',
      'src/pages/home/home.page.html',
      'src/pages/home/home.page.ts',
    ]);
  });

  it('classifies Vanrot role files and maps sibling files to their owner', () => {
    expect(classifyForgeFileRole('src/pages/home/home.page.ts')).toMatchObject({
      role: 'page',
      kind: 'script',
    });
    expect(classifyForgeFileRole('src/app/app.component.html')).toMatchObject({
      role: 'component',
      kind: 'template',
    });
    expect(findOwnerRoleFile('src/app/app.component.css')).toBe('src/app/app.component.ts');
    expect(findOwnerRoleFile('src/app/README.md')).toBeUndefined();
  });
});

async function writeFileAt(cwd: string, path: string, content: string): Promise<void> {
  const filePath = join(cwd, path);
  await mkdir(join(filePath, '..'), { recursive: true });
  await writeFile(filePath, content);
}
