import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildProjectMap } from '../intelligence/project-map.js';
import { ensureAiDirectory } from './paths.js';

export async function writeAiContext(cwd: string): Promise<string> {
  const paths = await ensureAiDirectory(cwd);
  const projectMap = await buildProjectMap(cwd, {
    now: () => new Date('2026-05-23T00:00:00.000Z'),
  });
  const packageJson = JSON.parse(await readFile(join(cwd, 'package.json'), 'utf8')) as unknown;
  const payload = {
    schemaVersion: 1,
    generatedAt: '2026-05-23T00:00:00.000Z',
    package: packageJson,
    projectMap,
  };

  await writeFile(paths.context, `${JSON.stringify(payload, null, 2)}\n`);
  return paths.context;
}
