import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

export async function assertFilesMissing(root: string, relativePaths: readonly string[]): Promise<void> {
  for (const relativePath of relativePaths) {
    if (await fileExists(root, relativePath)) {
      throw new Error(`File already exists: ${relativePath}`);
    }
  }
}

export async function writeNewFile(root: string, relativePath: string, content: string): Promise<void> {
  if (await fileExists(root, relativePath)) {
    throw new Error(`File already exists: ${relativePath}`);
  }

  const absolutePath = join(root, relativePath);
  await mkdir(dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, content);
}

export async function writeFileIfMissing(
  root: string,
  relativePath: string,
  content: string,
): Promise<boolean> {
  if (await fileExists(root, relativePath)) {
    return false;
  }

  const absolutePath = join(root, relativePath);
  await mkdir(dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, content);
  return true;
}

export async function ensureLineInFile(
  root: string,
  relativePath: string,
  line: string,
): Promise<boolean> {
  const absolutePath = join(root, relativePath);
  const existing = await readTextIfExists(absolutePath);

  if (existing.includes(line)) {
    return false;
  }

  const nextContent = existing.length === 0 ? `${line}\n` : `${existing.trimEnd()}\n${line}\n`;
  await mkdir(dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, nextContent);
  return true;
}

export async function ensureMainImport(root: string, importLine: string): Promise<boolean> {
  const relativePath = join('src', 'main.ts');
  const absolutePath = join(root, relativePath);
  const existing = await readTextIfExists(absolutePath);

  if (existing.includes(importLine)) {
    return false;
  }

  if (existing.length === 0) {
    await mkdir(dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, `${importLine}\n`);
    return true;
  }

  const lines = existing.split('\n');
  const insertAt = firstNonImportIndex(lines);
  const nextLines = [...lines.slice(0, insertAt), importLine, ...lines.slice(insertAt)];
  await writeFile(absolutePath, nextLines.join('\n'));
  return true;
}

async function fileExists(root: string, relativePath: string): Promise<boolean> {
  try {
    await access(join(root, relativePath));
    return true;
  } catch {
    return false;
  }
}

async function readTextIfExists(absolutePath: string): Promise<string> {
  try {
    return await readFile(absolutePath, 'utf8');
  } catch (error) {
    if (isMissingFileError(error)) {
      return '';
    }

    throw error;
  }
}

function firstNonImportIndex(lines: readonly string[]): number {
  const index = lines.findIndex((line) => line.length > 0 && !line.startsWith('import '));

  if (index === -1) {
    return lines.length;
  }

  return index;
}

function isMissingFileError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 'ENOENT'
  );
}
