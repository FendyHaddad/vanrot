import { type NormalizedVanrotAiConfig, vanrotAiRuleSection } from '@vanrot/config';
import { computeProjectSourceFingerprint } from '@vanrot/devtools/node';
import {
  projectMapGraphSchemaVersion,
  type ProjectGraphManifest,
} from '@vanrot/devtools';
import { access, readdir } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { buildProjectGraph } from './project-graph.js';
import { discoverRoleFiles, type RoleFile } from './role-files.js';

export type ProjectMap = ProjectGraphManifest;

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
  ai?: NormalizedVanrotAiConfig;
  configSource?: string | null;
}

export async function buildProjectMap(
  cwd: string,
  options: BuildProjectMapOptions = {},
): Promise<ProjectMap> {
  await assertExists(join(cwd, 'package.json'), 'Missing package.json');
  await assertExists(join(cwd, 'src'), 'Missing src directory');

  const roles = await discoverRoleFiles(cwd);
  const groupedRoles = groupRoles(roles);
  const graph = await buildProjectGraph(cwd, groupedRoles);
  const i18n = await discoverI18n(cwd);
  const now = options.now ?? (() => new Date());
  const generatedAt = now().toISOString();
  const ai = options.ai ?? {
    enabled: true,
    rules: {
      enabledSections: [
        vanrotAiRuleSection.projectRules,
        vanrotAiRuleSection.commands,
        vanrotAiRuleSection.fileConventions,
      ],
      customSections: [],
    },
  };

  return {
    schemaVersion: projectMapGraphSchemaVersion,
    generatedAt,
    projectRoot: '.',
    sourceRoot: 'src',
    sourceFingerprint: await computeProjectSourceFingerprint(cwd),
    stale: { value: false, reasons: [] },
    roles: groupedRoles,
    i18n,
    graph: graph.graph,
    routes: graph.routes,
    compiler: compilerMetadataFor(groupedRoles),
    ai: {
      rulesPath: '.vanrot/ai-rules.md',
      enabledSections: ai.rules.enabledSections,
      customSections: ai.rules.customSections.map((section) => section.id),
      configSource: options.configSource ?? null,
      warnings: [],
      generatedAt,
    },
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

function compilerMetadataFor(roles: ProjectMapRoles): ProjectMap['compiler'] {
  return {
    components: [
      ...roles.components,
      ...roles.pages,
      ...roles.dialogs,
      ...roles.layouts,
      ...roles.widgets,
      ...roles.forms,
    ].map((role) => ({
      path: role.path,
      templatePath: role.templatePath,
      stylePath: role.stylePath,
      bindings: [],
      diagnostics: [],
    })),
    diagnostics: [],
    warnings: [],
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
