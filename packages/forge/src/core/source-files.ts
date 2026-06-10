import { readdir, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';

export interface ForgeSourceFile {
  absolutePath: string;
  path: string;
  extension: string;
}

export interface ScanForgeSourceFilesOptions {
  root: string;
  sourceRoot: string;
}

const ignoredDirectoryNames = new Set([
  '.git',
  '.vanrot',
  '.cache',
  '.turbo',
  'dist',
  'node_modules',
]);

export async function scanForgeSourceFiles(
  options: ScanForgeSourceFilesOptions,
): Promise<ForgeSourceFile[]> {
  const sourceRootPath = join(options.root, options.sourceRoot);
  const files = await walkSourceFiles(sourceRootPath, options.root);

  return files.sort((left, right) => left.path.localeCompare(right.path));
}

async function walkSourceFiles(directory: string, root: string): Promise<ForgeSourceFile[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: ForgeSourceFile[] = [];

  for (const entry of entries) {
    const entryPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      if (shouldIgnoreDirectory(entry.name)) {
        continue;
      }

      files.push(...(await walkSourceFiles(entryPath, root)));
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const entryStats = await stat(entryPath);
    if (!entryStats.isFile()) {
      continue;
    }

    files.push({
      absolutePath: entryPath,
      path: toPosixPath(relative(root, entryPath)),
      extension: extensionOf(entry.name),
    });
  }

  return files;
}

function shouldIgnoreDirectory(name: string): boolean {
  return ignoredDirectoryNames.has(name) || (name.startsWith('.') && name.includes('cache'));
}

function extensionOf(fileName: string): string {
  const index = fileName.lastIndexOf('.');
  return index === -1 ? '' : fileName.slice(index + 1);
}

function toPosixPath(filePath: string): string {
  return filePath.replaceAll('\\', '/');
}
