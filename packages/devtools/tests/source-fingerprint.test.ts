import {
  computeProjectSourceFingerprint,
  readProjectGraphManifest,
} from '@/node/index.js';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

async function tempProject(): Promise<string> {
  const cwd = await mkdtemp(join(tmpdir(), 'vanrot-devtools-fingerprint-'));
  await mkdir(join(cwd, 'src'), { recursive: true });
  await mkdir(join(cwd, '.vanrot'), { recursive: true });
  await writeFile(join(cwd, 'package.json'), JSON.stringify({ name: 'demo' }));
  return cwd;
}

describe('computeProjectSourceFingerprint', () => {
  it('changes when relevant source files change', async () => {
    const cwd = await tempProject();
    await writeFile(join(cwd, 'src', 'app.page.ts'), 'export class AppPage {}\n');

    const first = await computeProjectSourceFingerprint(cwd);
    await writeFile(join(cwd, 'src', 'app.page.ts'), 'export class AppPage { title = "Home"; }\n');
    const second = await computeProjectSourceFingerprint(cwd);

    expect(first).toMatch(/^sha256:/);
    expect(second).toMatch(/^sha256:/);
    expect(first).not.toBe(second);
  });
});

describe('readProjectGraphManifest', () => {
  it('reports a missing manifest without throwing', async () => {
    const cwd = await tempProject();

    const result = await readProjectGraphManifest(cwd);

    expect(result.status).toBe('missing');
    expect(result.manifest).toBeNull();
    expect(result.warnings).toEqual(['Missing .vanrot/project-map.json. Run vr map.']);
  });
});
