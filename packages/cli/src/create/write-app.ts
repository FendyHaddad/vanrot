import { mkdir, readdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { createAppTemplate } from './app-template.js';

export interface WriteAppOptions {
  cwd: string;
  appName: string;
  workspace: boolean;
  force: boolean;
}

export interface WriteAppResult {
  targetDir: string;
  files: string[];
}

export async function writeApp(options: WriteAppOptions): Promise<WriteAppResult> {
  const targetDir = join(options.cwd, options.appName);
  const existingFiles = await readExistingFiles(targetDir);

  if (!options.force && existingFiles.length > 0) {
    throw new Error('Target directory is not empty.');
  }

  const template = createAppTemplate({
    appName: options.appName,
    workspace: options.workspace,
  });

  for (const file of template) {
    const filePath = join(targetDir, file.path);
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, file.content);
  }

  return {
    targetDir,
    files: template.map((file) => file.path),
  };
}

async function readExistingFiles(targetDir: string): Promise<string[]> {
  try {
    return await readdir(targetDir);
  } catch (error) {
    if (isMissingFileError(error)) {
      return [];
    }

    throw error;
  }
}

function isMissingFileError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 'ENOENT'
  );
}
