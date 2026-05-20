import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { resolveComponentFiles } from '../../src/conventions/component-files.js';

describe('component file conventions', () => {
  it('resolves component siblings and expected class names', async () => {
    const root = await createFixtureDirectory({
      'counter.component.ts': 'export class CounterComponent {}',
      'counter.component.html': '<p>Ready</p>',
      'counter.component.css': 'p { color: red; }',
      'user-card.component.ts': 'export class UserCardComponent {}',
      'user-card.component.html': '<p>Ready</p>',
      'user-card.component.css': 'p { color: red; }',
    });

    await expect(resolveComponentFiles(join(root, 'counter.component.ts'))).resolves.toMatchObject({
      fileSet: {
        componentBaseName: 'counter',
        expectedClassName: 'CounterComponent',
        templatePath: join(root, 'counter.component.html'),
        stylePath: join(root, 'counter.component.css'),
      },
      diagnostics: [],
    });
    await expect(resolveComponentFiles(join(root, 'user-card.component.ts'))).resolves.toMatchObject({
      fileSet: {
        componentBaseName: 'user-card',
        expectedClassName: 'UserCardComponent',
      },
      diagnostics: [],
    });
  });

  it('reports invalid component file suffixes', async () => {
    const root = await createFixtureDirectory({
      'counter.page.ts': '',
      'counter.ts': '',
    });

    await expect(resolveComponentFiles(join(root, 'counter.page.ts'))).resolves.toMatchObject({
      fileSet: null,
      diagnostics: [{ code: 'VR003' }],
    });
    await expect(resolveComponentFiles(join(root, 'counter.ts'))).resolves.toMatchObject({
      fileSet: null,
      diagnostics: [{ code: 'VR003' }],
    });
  });

  it('reports missing sibling files', async () => {
    const root = await createFixtureDirectory({
      'counter.component.ts': 'export class CounterComponent {}',
    });

    await expect(resolveComponentFiles(join(root, 'counter.component.ts'))).resolves.toMatchObject({
      fileSet: {
        componentBaseName: 'counter',
      },
      diagnostics: [{ code: 'VR001' }, { code: 'VR002' }],
    });
  });
});

async function createFixtureDirectory(files: Record<string, string>): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'vanrot-component-files-'));

  await mkdir(root, { recursive: true });

  await Promise.all(
    Object.entries(files).map(([fileName, content]) => writeFile(join(root, fileName), content)),
  );

  return root;
}
