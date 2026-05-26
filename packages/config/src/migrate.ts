import { access, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { vanrotConfigFileName } from './constants.js';

export interface ConfigWriteResult {
  written: boolean;
  filePath: string;
}

export interface MigrateOptions {
  destructive: boolean;
}

export async function migrateVanrotConfig(
  cwd: string,
  options: MigrateOptions = { destructive: false },
): Promise<ConfigWriteResult> {
  const filePath = join(cwd, vanrotConfigFileName);
  const exists = await fileExists(filePath);

  if (exists && !options.destructive) {
    return { written: false, filePath };
  }

  await writeFile(filePath, renderCanonicalVanrotConfig());
  return { written: true, filePath };
}

export function renderCanonicalVanrotConfig(): string {
  return [
    "import { defineVanrotConfig } from '@vanrot/config';",
    '',
    'export default defineVanrotConfig({',
    '  schemaVersion: 1,',
    "  source: { root: 'src' },",
    '  devServer: { port: 1990 },',
    "  ui: { flavor: 'october', styles: 'vanrotstyles', prefix: 'ui' },",
    '});',
    '',
  ].join('\n');
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}
