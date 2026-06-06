import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { defaultSourceRoot } from '@vanrot/config';
import { buildComponentIndex, type ComponentEntry } from './component-index.js';
import { resolveRoutesPath } from './project-root.js';
import { parseRouteIndex, type RouteEntry } from './route-index.js';

const componentFilePattern = /\.(component|page|layout|button)\.ts$/;
const appsDirectoryName = 'apps';

export interface WorkspaceIndex {
  routes: RouteEntry[];
  components: ComponentEntry[];
  routesPath: string | null;
  projectRoot: string | null;
}

export function loadWorkspaceIndex(projectRoot: string | null): WorkspaceIndex {
  if (projectRoot === null) {
    return { routes: [], components: [], routesPath: null, projectRoot: null };
  }

  const routesPath = resolveRoutesPath(projectRoot);
  const routes = existsSync(routesPath)
    ? parseRouteIndex(routesPath, readFileSync(routesPath, 'utf8'))
    : [];
  const components = buildComponentIndex(readWorkspaceComponentSources(projectRoot));

  return { routes, components, routesPath: existsSync(routesPath) ? routesPath : null, projectRoot };
}

function readWorkspaceComponentSources(projectRoot: string): Array<{ path: string; source: string }> {
  return collectSourceRoots(projectRoot).flatMap((sourceRoot) => readComponentSources(sourceRoot));
}

function collectSourceRoots(projectRoot: string): string[] {
  const sourceRoots = new Set([join(projectRoot, defaultSourceRoot)]);
  const appsRoot = join(projectRoot, appsDirectoryName);

  if (!existsSync(appsRoot)) {
    return [...sourceRoots];
  }

  for (const entry of readdirSync(appsRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }

    sourceRoots.add(join(appsRoot, entry.name, defaultSourceRoot));
  }

  return [...sourceRoots];
}

function readComponentSources(sourceRoot: string): Array<{ path: string; source: string }> {
  if (!existsSync(sourceRoot)) {
    return [];
  }

  const files: Array<{ path: string; source: string }> = [];
  const pending = [sourceRoot];

  while (pending.length > 0) {
    const directory = pending.pop();

    if (directory === undefined) {
      continue;
    }

    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);

      if (entry.isDirectory()) {
        pending.push(path);
        continue;
      }

      if (!entry.isFile() || !componentFilePattern.test(entry.name)) {
        continue;
      }

      files.push({ path, source: readFileSync(path, 'utf8') });
    }
  }

  return files;
}
