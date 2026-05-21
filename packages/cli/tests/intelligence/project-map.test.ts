import { buildProjectMap } from '@/intelligence/project-map.js';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

async function tempProject(): Promise<string> {
  const cwd = await mkdtemp(join(tmpdir(), 'vanrot-project-map-'));
  await mkdir(join(cwd, 'src', 'counter'), { recursive: true });
  await mkdir(join(cwd, 'src', 'i18n'), { recursive: true });
  await writeFile(join(cwd, 'package.json'), JSON.stringify({ name: 'demo' }));
  return cwd;
}

describe('buildProjectMap', () => {
  it('builds a stable project map grouped by role', async () => {
    const cwd = await tempProject();
    await writeFile(join(cwd, 'src', 'counter', 'counter.component.ts'), 'export class CounterComponent {}\n');
    await writeFile(join(cwd, 'src', 'counter', 'counter.component.html'), '<button>{{ count() }}</button>\n');
    await writeFile(join(cwd, 'src', 'counter', 'counter.component.css'), '.counter { display: block; }\n');
    await writeFile(join(cwd, 'src', 'i18n', 'en.json'), '{}\n');

    const map = await buildProjectMap(cwd, {
      now: () => new Date('2026-05-22T00:00:00.000Z'),
    });

    expect(map).toEqual({
      schemaVersion: 1,
      generatedAt: '2026-05-22T00:00:00.000Z',
      projectRoot: '.',
      sourceRoot: 'src',
      roles: {
        components: [
          {
            name: 'counter',
            role: 'component',
            path: 'src/counter/counter.component.ts',
            templatePath: 'src/counter/counter.component.html',
            stylePath: 'src/counter/counter.component.css',
          },
        ],
        pages: [],
        dialogs: [],
        layouts: [],
        widgets: [],
        forms: [],
      },
      i18n: {
        locales: ['en'],
        files: ['src/i18n/en.json'],
      },
    });
  });

  it('returns empty i18n metadata when src/i18n is missing', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'vanrot-project-map-no-i18n-'));
    await mkdir(join(cwd, 'src'), { recursive: true });
    await writeFile(join(cwd, 'package.json'), JSON.stringify({ name: 'demo' }));

    const map = await buildProjectMap(cwd, {
      now: () => new Date('2026-05-22T00:00:00.000Z'),
    });

    expect(map.i18n).toEqual({ locales: [], files: [] });
  });

  it('fails when package.json is missing', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'vanrot-project-map-no-package-'));
    await mkdir(join(cwd, 'src'), { recursive: true });

    await expect(buildProjectMap(cwd)).rejects.toThrow('Missing package.json');
  });

  it('fails when src is missing', async () => {
    const cwd = await mkdtemp(join(tmpdir(), 'vanrot-project-map-no-src-'));
    await writeFile(join(cwd, 'package.json'), JSON.stringify({ name: 'demo' }));

    await expect(buildProjectMap(cwd)).rejects.toThrow('Missing src directory');
  });
});
