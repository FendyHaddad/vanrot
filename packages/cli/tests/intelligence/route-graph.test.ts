import { discoverRouteGraph } from '@/intelligence/route-graph.js';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('discoverRouteGraph', () => {
  it('extracts route refs, paths, and page imports from src/routes.ts', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'vanrot-route-graph-'));
    await mkdir(join(cwd, 'src', 'pages'), { recursive: true });
    await writeFile(
      join(cwd, 'src', 'routes.ts'),
      [
        "import { createRoutes } from '@vanrot/router';",
        "import { HomePage } from './pages/home.page';",
        'export const appRoutes = createRoutes([',
        "  { ref: 'home', path: '/', page: HomePage },",
        ']);',
      ].join('\n'),
    );

    const graph = await discoverRouteGraph(cwd);

    expect(graph.routes).toEqual([
      {
        id: 'route:home',
        ref: 'home',
        path: '/',
        parentId: null,
        layoutNodeId: null,
        pageNodeId: 'page:src/pages/home.page.ts',
        childIds: [],
        metadata: {},
      },
    ]);
    expect(graph.edges).toEqual([
      {
        id: 'route:home->page:src/pages/home.page.ts:route-to-page',
        from: 'route:home',
        to: 'page:src/pages/home.page.ts',
        kind: 'route-to-page',
      },
    ]);
  });
});
