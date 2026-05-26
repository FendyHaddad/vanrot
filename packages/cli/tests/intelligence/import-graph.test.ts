import { discoverImportGraph } from '@/intelligence/import-graph.js';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('discoverImportGraph', () => {
  it('extracts local TypeScript import edges', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'vanrot-import-graph-'));
    await mkdir(join(cwd, 'src'), { recursive: true });
    await writeFile(join(cwd, 'src', 'home.page.ts'), "import { helper } from './helper';\nhelper();\n");
    await writeFile(join(cwd, 'src', 'helper.ts'), 'export function helper() {}\n');

    const graph = await discoverImportGraph(cwd, ['src/home.page.ts']);

    expect(graph).toEqual([
      {
        id: 'component:src/home.page.ts->import:src/helper.ts:file-imports-file',
        from: 'component:src/home.page.ts',
        to: 'import:src/helper.ts',
        kind: 'file-imports-file',
      },
    ]);
  });
});
