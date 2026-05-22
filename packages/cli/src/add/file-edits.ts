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

export async function ensurePackageJsonDevDependency(
  root: string,
  dependencyName: string,
  fallbackVersion: string,
  versionSourceNames: readonly string[],
): Promise<boolean> {
  const absolutePath = join(root, 'package.json');
  const existing = await readTextIfExists(absolutePath);

  if (existing.length === 0) {
    return false;
  }

  const packageJson = parsePackageJson(existing);

  if (hasDependency(packageJson, 'dependencies', dependencyName)) {
    return false;
  }

  if (hasDependency(packageJson, 'devDependencies', dependencyName)) {
    return false;
  }

  const version = findDependencyVersion(packageJson, versionSourceNames) ?? fallbackVersion;
  const devDependencies = getOrCreateDependencyRecord(packageJson, 'devDependencies');
  devDependencies[dependencyName] = version;

  await writeFile(absolutePath, `${JSON.stringify(packageJson, null, 2)}\n`);
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

function parsePackageJson(source: string): Record<string, unknown> {
  const parsed = JSON.parse(source) as unknown;

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('package.json must contain a JSON object.');
  }

  return parsed as Record<string, unknown>;
}

function hasDependency(
  packageJson: Record<string, unknown>,
  fieldName: 'dependencies' | 'devDependencies',
  dependencyName: string,
): boolean {
  const dependencies = packageJson[fieldName];

  if (typeof dependencies !== 'object' || dependencies === null || Array.isArray(dependencies)) {
    return false;
  }

  return dependencyName in dependencies;
}

function findDependencyVersion(
  packageJson: Record<string, unknown>,
  dependencyNames: readonly string[],
): string | null {
  for (const fieldName of ['dependencies', 'devDependencies'] as const) {
    const dependencies = packageJson[fieldName];

    if (typeof dependencies !== 'object' || dependencies === null || Array.isArray(dependencies)) {
      continue;
    }

    for (const dependencyName of dependencyNames) {
      const version = (dependencies as Record<string, unknown>)[dependencyName];

      if (typeof version === 'string') {
        return version;
      }
    }
  }

  return null;
}

function getOrCreateDependencyRecord(
  packageJson: Record<string, unknown>,
  fieldName: 'dependencies' | 'devDependencies',
): Record<string, string> {
  const dependencies = packageJson[fieldName];

  if (dependencies === undefined) {
    packageJson[fieldName] = {};
    return packageJson[fieldName] as Record<string, string>;
  }

  if (typeof dependencies !== 'object' || dependencies === null || Array.isArray(dependencies)) {
    throw new Error(`package.json ${fieldName} must be an object.`);
  }

  return dependencies as Record<string, string>;
}

function isMissingFileError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 'ENOENT'
  );
}
