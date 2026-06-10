import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { createForgeAppGraph, forgeDiagnosticCode } from '../src/index.js';

describe('Forge app graph', () => {
  it('builds a deterministic Vanrot graph from the configured source root', async () => {
    const cwd = await createGraphFixture();

    const graph = await createForgeAppGraph(cwd);

    expect(graph.sourceRoot).toBe('src');
    expect(graph.roleFiles.map((file) => file.path)).toEqual([
      'src/app/app.layout.ts',
      'src/pages/home/home.page.ts',
    ]);
    expect(graph.routes.pages).toEqual([
      expect.objectContaining({
        path: '/',
        label: 'Home',
        pageSymbol: 'HomePage',
        pageFilePath: 'src/pages/home/home.page.ts',
      }),
    ]);
    expect(graph.diagnostics).toEqual([]);
  });

  it('reports missing source roots instead of guessing', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'vanrot-forge-missing-src-'));
    await writeFile(join(cwd, 'package.json'), '{"name":"missing-src","private":true}');
    await writeFile(
      join(cwd, 'vanrot.config.ts'),
      "export default { engine: 'forge', source: { root: 'missing' } };\n",
    );

    const graph = await createForgeAppGraph(cwd);

    expect(graph.files).toEqual([]);
    expect(graph.roleFiles).toEqual([]);
    expect(graph.routes.pages).toEqual([]);
    expect(graph.diagnostics).toEqual([
      expect.objectContaining({
        code: forgeDiagnosticCode.missingSourceRoot,
        severity: 'error',
        filePath: 'missing',
      }),
    ]);
  });
});

async function createGraphFixture(): Promise<string> {
  const cwd = await mkdtemp(join(tmpdir(), 'vanrot-forge-graph-'));
  await writeFile(join(cwd, 'package.json'), '{"name":"graph-app","private":true}');
  await writeFile(
    join(cwd, 'vanrot.config.ts'),
    "export default { engine: 'forge', source: { root: 'src' } };\n",
  );
  await writeFileAt(cwd, 'src/app/app.layout.ts', 'export class AppLayout {}\n');
  await writeFileAt(cwd, 'src/app/app.layout.html', '<slot></slot>\n');
  await writeFileAt(cwd, 'src/app/app.layout.css', ':host { display: block; }\n');
  await writeFileAt(cwd, 'src/pages/home/home.page.ts', 'export class HomePage {}\n');
  await writeFileAt(cwd, 'src/pages/home/home.page.html', '<main>Home</main>\n');
  await writeFileAt(cwd, 'src/pages/home/home.page.css', ':host { display: block; }\n');
  await writeFileAt(
    cwd,
    'src/routes.ts',
    `import { createRoutes, defineRoutes } from '@vanrot/router';
import { HomePage } from './pages/home/home.page.ts';

const routes = createRoutes();

const home = routes.page({
  path: '/',
  label: 'Home',
  page: HomePage,
});

export const route = defineRoutes(routes, [home]);
`,
  );
  return cwd;
}

async function writeFileAt(cwd: string, path: string, content: string): Promise<void> {
  const filePath = join(cwd, path);
  await mkdir(join(filePath, '..'), { recursive: true });
  await writeFile(filePath, content);
}
