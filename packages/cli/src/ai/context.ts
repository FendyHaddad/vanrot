import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildProjectMap } from '../intelligence/project-map.js';
import { ensureAiDirectory } from './paths.js';

export async function writeAiContext(cwd: string): Promise<string> {
  const paths = await ensureAiDirectory(cwd);
  const now = new Date();
  const projectMap = await buildProjectMap(cwd, {
    now: () => now,
  });
  const packageJson = JSON.parse(await readFile(join(cwd, 'package.json'), 'utf8')) as unknown;
  const payload = {
    schemaVersion: 1,
    generatedAt: now.toISOString(),
    package: packageJson,
    projectMap,
  };

  await writeFile(paths.context, `${JSON.stringify(payload, null, 2)}\n`);
  return paths.context;
}
