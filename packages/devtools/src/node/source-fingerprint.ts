import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const includedExtensions = new Set(['.ts', '.html', '.css', '.json']);

export async function computeProjectSourceFingerprint(cwd: string): Promise<string> {
  const files = await walkProjectFiles(cwd, join(cwd, 'src'));
  const hash = createHash('sha256');

  for (const filePath of files) {
    const projectPath = relative(cwd, filePath).split(sep).join('/');
    hash.update(projectPath);
    hash.update('\0');
    hash.update(await readFile(filePath));
    hash.update('\0');
  }

  return `sha256:${hash.digest('hex')}`;
}

async function walkProjectFiles(cwd: string, dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkProjectFiles(cwd, path)));
      continue;
    }

    if (!entry.isFile() || !hasIncludedExtension(entry.name)) {
      continue;
    }

    files.push(path);
  }

  return files.sort((left, right) => left.localeCompare(right));
}

function hasIncludedExtension(fileName: string): boolean {
  for (const extension of includedExtensions) {
    if (fileName.endsWith(extension)) {
      return true;
    }
  }

  return false;
}
