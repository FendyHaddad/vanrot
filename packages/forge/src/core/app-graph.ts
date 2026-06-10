import { access } from 'node:fs/promises';
import { join } from 'node:path';
import { loadVanrotProjectConfig } from '@vanrot/config';
import type { ForgeDiagnostic } from '../diagnostics/format.js';
import { forgeDiagnosticCode } from '../diagnostics/codes.js';
import {
  classifyForgeFileRole,
  type ForgeRoleFileClassification,
} from './file-roles.js';
import { discoverForgeRoutes, type ForgeRouteGraph } from './routes.js';
import { scanForgeSourceFiles, type ForgeSourceFile } from './source-files.js';

export interface ForgeRoleFile {
  path: string;
  role: ForgeRoleFileClassification['role'];
  ownerPath: string;
}

export interface ForgeAppGraph {
  root: string;
  sourceRoot: string;
  files: ForgeSourceFile[];
  roleFiles: ForgeRoleFile[];
  routes: ForgeRouteGraph;
  diagnostics: ForgeDiagnostic[];
}

const emptyRouteGraph: ForgeRouteGraph = {
  routeFiles: [],
  pages: [],
};

export async function createForgeAppGraph(root: string): Promise<ForgeAppGraph> {
  const loaded = await loadVanrotProjectConfig(root);
  const sourceRoot = loaded.config.source.root;
  const diagnostics: ForgeDiagnostic[] = [];

  for (const diagnostic of loaded.diagnostics) {
    const forgeDiagnostic: ForgeDiagnostic = {
      code: forgeDiagnosticCode.routeDiscoveryFailed,
      severity: diagnostic.severity,
      message: diagnostic.message,
      suggestion: diagnostic.suggestion,
      docsPath: '/docs/forge/config',
    };

    if (diagnostic.filePath !== undefined) {
      forgeDiagnostic.filePath = diagnostic.filePath;
    }

    diagnostics.push(forgeDiagnostic);
  }

  if (!(await exists(join(root, sourceRoot)))) {
    diagnostics.push({
      code: forgeDiagnosticCode.missingSourceRoot,
      severity: 'error',
      message: `Missing source root: ${sourceRoot}`,
      filePath: sourceRoot,
      suggestion: 'Create the configured source root or update source.root in vanrot.config.ts.',
      docsPath: '/docs/forge/config',
    });

    return {
      root,
      sourceRoot,
      files: [],
      roleFiles: [],
      routes: emptyRouteGraph,
      diagnostics,
    };
  }

  const files = await scanForgeSourceFiles({ root, sourceRoot });
  const roleFiles = createForgeRoleFiles(files);
  const routeResult = await discoverForgeRoutes({ root, files });

  return {
    root,
    sourceRoot,
    files,
    roleFiles,
    routes: routeResult.routes,
    diagnostics: [...diagnostics, ...routeResult.diagnostics],
  };
}

function createForgeRoleFiles(files: readonly ForgeSourceFile[]): ForgeRoleFile[] {
  return files
    .map((file) => classifyForgeFileRole(file.path))
    .filter((classification): classification is ForgeRoleFileClassification => {
      return classification !== undefined && classification.kind === 'script';
    })
    .map((classification) => ({
      path: classification.path,
      role: classification.role,
      ownerPath: classification.ownerPath,
    }))
    .sort((left, right) => left.path.localeCompare(right.path));
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}
