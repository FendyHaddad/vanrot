import { readFile } from 'node:fs/promises';
import { dirname, join, normalize } from 'node:path';
import type { ForgeDiagnostic } from '../diagnostics/format.js';
import { forgeDiagnosticCode } from '../diagnostics/codes.js';
import type { ForgeSourceFile } from './source-files.js';

export interface ForgeRouteEntry {
  path: string;
  label?: string;
  pageSymbol: string;
  pageFilePath?: string;
  routeFilePath: string;
}

export interface ForgeRouteGraph {
  routeFiles: string[];
  pages: ForgeRouteEntry[];
}

interface DiscoverForgeRoutesOptions {
  root: string;
  files: readonly ForgeSourceFile[];
}

const routeFilePattern = /(?:^|\/)routes?\.ts$/;
const pageImportPattern = /import\s+\{\s*([A-Za-z0-9_$]+)\s*\}\s+from\s+['"](.+?\.page\.ts)['"];?/g;
const pageRoutePattern =
  /routes\.page\(\{[\s\S]*?path:\s*['"]([^'"]+)['"][\s\S]*?label:\s*['"]([^'"]+)['"][\s\S]*?page:\s*([A-Za-z0-9_$]+)/g;

export async function discoverForgeRoutes(
  options: DiscoverForgeRoutesOptions,
): Promise<{ routes: ForgeRouteGraph; diagnostics: ForgeDiagnostic[] }> {
  const routeFiles = options.files.filter((file) => routeFilePattern.test(file.path));
  const pages: ForgeRouteEntry[] = [];
  const diagnostics: ForgeDiagnostic[] = [];

  for (const routeFile of routeFiles) {
    const source = await readFile(routeFile.absolutePath, 'utf8');
    const imports = routePageImports(source, routeFile.path);
    let discoveredRouteCount = 0;

    for (const match of source.matchAll(pageRoutePattern)) {
      const routePath = match[1];
      const label = match[2];
      const pageSymbol = match[3];

      if (routePath === undefined || label === undefined || pageSymbol === undefined) {
        continue;
      }

      discoveredRouteCount += 1;
      const routeEntry: ForgeRouteEntry = {
        path: routePath,
        label,
        pageSymbol,
        routeFilePath: routeFile.path,
      };

      const pageFilePath = imports.get(pageSymbol);
      if (pageFilePath !== undefined) {
        routeEntry.pageFilePath = pageFilePath;
      }

      pages.push(routeEntry);
    }

    if (discoveredRouteCount === 0) {
      diagnostics.push({
        code: forgeDiagnosticCode.routeDiscoveryFailed,
        severity: 'warning',
        message: 'Route file did not expose routes.page entries Forge can understand.',
        filePath: routeFile.path,
        suggestion: 'Use createRoutes plus routes.page entries, or keep Vite until Forge supports this route shape.',
        docsPath: '/docs/forge/config',
      });
    }
  }

  return {
    routes: {
      routeFiles: routeFiles.map((file) => file.path),
      pages,
    },
    diagnostics,
  };
}

function routePageImports(source: string, routeFilePath: string): Map<string, string> {
  const imports = new Map<string, string>();

  for (const match of source.matchAll(pageImportPattern)) {
    const symbol = match[1];
    const importPath = match[2];

    if (symbol === undefined || importPath === undefined) {
      continue;
    }

    imports.set(symbol, toPosixPath(normalize(join(dirname(routeFilePath), importPath))));
  }

  return imports;
}

function toPosixPath(filePath: string): string {
  return filePath.replaceAll('\\', '/');
}
