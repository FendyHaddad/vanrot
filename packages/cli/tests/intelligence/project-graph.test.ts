import { buildProjectGraph } from '@/intelligence/project-graph.js';
import type { ProjectMapRoles } from '@vanrot/devtools';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('buildProjectGraph', () => {
  it('combines role, route, and import graph relationships', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'vanrot-project-graph-'));
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
    await writeFile(join(cwd, 'src', 'pages', 'home.page.ts'), "import { helper } from '../helper';\nhelper();\n");
    await writeFile(join(cwd, 'src', 'helper.ts'), 'export function helper() {}\n');

    const roles: ProjectMapRoles = {
      components: [],
      pages: [
        {
          name: 'home',
          role: 'page',
          path: 'src/pages/home.page.ts',
          templatePath: null,
          stylePath: null,
        },
      ],
      dialogs: [],
      layouts: [],
      widgets: [],
      forms: [],
    };

    const graph = await buildProjectGraph(cwd, roles);

    expect(graph.routes).toHaveLength(1);
    expect(graph.graph.nodes.map((node) => node.id)).toContain('route:home');
    expect(graph.graph.edges.map((edge) => edge.id)).toEqual([
      'component:src/pages/home.page.ts->import:src/helper.ts:file-imports-file',
      'route:home->page:src/pages/home.page.ts:route-to-page',
    ]);
  });
});
