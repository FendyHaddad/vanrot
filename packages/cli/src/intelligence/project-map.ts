import { access, readdir } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { discoverRoleFiles, type RoleFile } from './role-files.js';

export interface ProjectMap {
  schemaVersion: 1;
  generatedAt: string;
  projectRoot: '.';
  sourceRoot: 'src';
  roles: ProjectMapRoles;
  i18n: ProjectMapI18n;
}

export interface ProjectMapRoles {
  components: RoleFile[];
  pages: RoleFile[];
  dialogs: RoleFile[];
  layouts: RoleFile[];
  widgets: RoleFile[];
  forms: RoleFile[];
}

export interface ProjectMapI18n {
  locales: string[];
  files: string[];
}

export interface BuildProjectMapOptions {
  now?: () => Date;
}

export async function buildProjectMap(
  cwd: string,
  options: BuildProjectMapOptions = {},
): Promise<ProjectMap> {
  await assertExists(join(cwd, 'package.json'), 'Missing package.json');
  await assertExists(join(cwd, 'src'), 'Missing src directory');

  const roles = await discoverRoleFiles(cwd);
  const i18n = await discoverI18n(cwd);
  const now = options.now ?? (() => new Date());

  return {
    schemaVersion: 1,
    generatedAt: now().toISOString(),
    projectRoot: '.',
    sourceRoot: 'src',
    roles: groupRoles(roles),
    i18n,
  };
}

function groupRoles(roles: RoleFile[]): ProjectMapRoles {
  return {
    components: roles.filter((role) => role.role === 'component'),
    pages: roles.filter((role) => role.role === 'page'),
    dialogs: roles.filter((role) => role.role === 'dialog'),
    layouts: roles.filter((role) => role.role === 'layout'),
    widgets: roles.filter((role) => role.role === 'widget'),
    forms: roles.filter((role) => role.role === 'form'),
  };
}

async function discoverI18n(cwd: string): Promise<ProjectMapI18n> {
  const i18nDir = join(cwd, 'src', 'i18n');

  if (!(await exists(i18nDir))) {
    return { locales: [], files: [] };
  }

  const entries = await readdir(i18nDir, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => toProjectPath(cwd, join(i18nDir, entry.name)))
    .sort((left, right) => left.localeCompare(right));
  const locales = files.map((file) => file.slice(file.lastIndexOf('/') + 1, -'.json'.length));

  return { locales, files };
}

async function assertExists(filePath: string, message: string): Promise<void> {
  if (await exists(filePath)) {
    return;
  }

  throw new Error(message);
}

async function exists(filePath: string): Promise<boolean> {
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
