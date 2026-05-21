import { access, readdir } from 'node:fs/promises';
import { basename, join, relative, sep } from 'node:path';

const roleNames = ['component', 'page', 'dialog', 'layout', 'widget', 'form'] as const;

export type ProjectRole = (typeof roleNames)[number];

export interface RoleFile {
  name: string;
  role: ProjectRole;
  path: string;
  templatePath: string | null;
  stylePath: string | null;
}

export interface DiscoverRoleFilesOptions {
  sourceRoot?: string;
  exists?: (filePath: string) => Promise<boolean>;
}

export async function discoverRoleFiles(
  cwd: string,
  options: DiscoverRoleFilesOptions = {},
): Promise<RoleFile[]> {
  const sourceRoot = options.sourceRoot ?? 'src';
  const srcDir = join(cwd, sourceRoot);
  const exists = options.exists ?? pathExists;
  const files = await walkFiles(srcDir);
  const roles: RoleFile[] = [];

  for (const file of files) {
    const role = readProjectRole(file);

    if (role === null) {
      continue;
    }

    const withoutExtension = file.slice(0, -'.ts'.length);
    const templateFile = `${withoutExtension}.html`;
    const styleFile = `${withoutExtension}.css`;

    roles.push({
      name: readRoleName(file, role),
      role,
      path: toProjectPath(cwd, file),
      templatePath: (await exists(templateFile)) ? toProjectPath(cwd, templateFile) : null,
      stylePath: (await exists(styleFile)) ? toProjectPath(cwd, styleFile) : null,
    });
  }

  return roles.sort((left, right) => left.path.localeCompare(right.path));
}

async function walkFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const path = join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await walkFiles(path)));
      continue;
    }

    if (entry.isFile()) {
      files.push(path);
    }
  }

  return files;
}

function readProjectRole(filePath: string): ProjectRole | null {
  const match = filePath.match(/\.([a-z]+)\.ts$/);
  const role = match?.[1];

  if (role === undefined) {
    return null;
  }

  if (!isProjectRole(role)) {
    return null;
  }

  return role;
}

function isProjectRole(role: string): role is ProjectRole {
  return roleNames.includes(role as ProjectRole);
}

function readRoleName(filePath: string, role: ProjectRole): string {
  const fileName = basename(filePath);
  const suffix = `.${role}.ts`;

  if (!fileName.endsWith(suffix)) {
    return fileName.slice(0, -'.ts'.length);
  }

  return fileName.slice(0, -suffix.length);
}

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function toProjectPath(cwd: string, filePath: string): string {
  return relative(cwd, filePath).split(sep).join('/');
}
