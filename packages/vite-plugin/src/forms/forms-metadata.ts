import { readdir } from 'node:fs/promises';
import { relative, resolve, sep } from 'node:path';

const FORM_FILE_SUFFIX = '.form.ts';
const SKIPPED_DIRECTORIES = new Set(['.git', 'dist', 'node_modules']);

export type FormDefinitionFile = {
  filePath: string;
  relativePath: string;
};

export type FormsMetadata = {
  kind: 'vanrot-forms-metadata';
  files: Array<{
    relativePath: string;
  }>;
};

type DirectoryEntry = {
  name: string;
  isDirectory(): boolean;
  isFile(): boolean;
};

export async function discoverFormDefinitionFiles(root: string): Promise<FormDefinitionFile[]> {
  const sourceRoot = resolve(root, 'src');
  const files = await discoverFiles(sourceRoot, root);

  return files.sort((left, right) => left.relativePath.localeCompare(right.relativePath));
}

export function createFormsMetadata(files: FormDefinitionFile[]): FormsMetadata {
  return {
    kind: 'vanrot-forms-metadata',
    files: files.map((file) => ({ relativePath: file.relativePath })),
  };
}

async function discoverFiles(directory: string, root: string): Promise<FormDefinitionFile[]> {
  let entries: DirectoryEntry[];

  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch {
    return [];
  }

  const files: FormDefinitionFile[] = [];

  for (const entry of entries) {
    const entryPath = resolve(directory, entry.name);

    if (entry.isDirectory()) {
      if (!SKIPPED_DIRECTORIES.has(entry.name)) {
        files.push(...(await discoverFiles(entryPath, root)));
      }

      continue;
    }

    if (entry.isFile() && entry.name.endsWith(FORM_FILE_SUFFIX)) {
      files.push({
        filePath: entryPath,
        relativePath: relative(root, entryPath).split(sep).join('/'),
      });
    }
  }

  return files;
}
