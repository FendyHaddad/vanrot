import { createDevtoolsMetadataResponse } from '@/devtools-metadata.js';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('createDevtoolsMetadataResponse', () => {
  it('returns missing status when project map does not exist', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'vanrot-vite-devtools-missing-'));
    await mkdir(join(cwd, 'src'), { recursive: true });

    const response = await createDevtoolsMetadataResponse(cwd);

    expect(response.status).toBe('missing');
    expect(response.manifest).toBeNull();
    expect(response.warnings).toEqual(['Missing .vanrot/project-map.json. Run vr map.']);
  });

  it('returns manifest status when project map exists', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'vanrot-vite-devtools-ready-'));
    await mkdir(join(cwd, 'src'), { recursive: true });
    await mkdir(join(cwd, '.vanrot'), { recursive: true });
    await writeFile(join(cwd, 'src', 'app.page.ts'), 'export class AppPage {}\n');
    await writeFile(
      join(cwd, '.vanrot', 'project-map.json'),
      JSON.stringify({
        schemaVersion: 2,
        generatedAt: '2026-05-27T00:00:00.000Z',
        projectRoot: '.',
        sourceRoot: 'src',
        sourceFingerprint: 'sha256:stale',
        stale: { value: false, reasons: [] },
        roles: { components: [], pages: [], dialogs: [], layouts: [], widgets: [], forms: [] },
        i18n: { locales: [], files: [] },
        graph: { nodes: [], edges: [] },
        routes: [],
        compiler: { components: [], diagnostics: [], warnings: [] },
        ai: {
          rulesPath: '.vanrot/ai-rules.md',
          enabledSections: [],
          customSections: [],
          configSource: null,
          warnings: [],
          generatedAt: '2026-05-27T00:00:00.000Z',
        },
      }),
    );

    const response = await createDevtoolsMetadataResponse(cwd);

    expect(response.status).toBe('stale');
    expect(response.manifest?.schemaVersion).toBe(2);
  });
});
