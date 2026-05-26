import type { ProjectGraphEdge, RouteGraphEntry } from '@vanrot/devtools';
import { access, readFile } from 'node:fs/promises';
import { dirname, join, normalize, relative, resolve, sep } from 'node:path';
import ts from 'typescript';

export interface DiscoveredRouteGraph {
  routes: RouteGraphEntry[];
  edges: ProjectGraphEdge[];
}

export async function discoverRouteGraph(cwd: string): Promise<DiscoveredRouteGraph> {
  const routeFile = join(cwd, 'src', 'routes.ts');
  if (!(await exists(routeFile))) {
    return { routes: [], edges: [] };
  }

  const source = await readFile(routeFile, 'utf8');
  const sourceFile = ts.createSourceFile(routeFile, source, ts.ScriptTarget.Latest, true);
  const imports = readImports(cwd, routeFile, sourceFile);
  const routes: RouteGraphEntry[] = [];
  const edges: ProjectGraphEdge[] = [];

  sourceFile.forEachChild((node) => {
    if (!ts.isVariableStatement(node)) {
      return;
    }

    for (const declaration of node.declarationList.declarations) {
      const initializer = declaration.initializer;
      if (!initializer || !ts.isCallExpression(initializer)) {
        continue;
      }

      const firstArg = initializer.arguments[0];
      if (!firstArg || !ts.isArrayLiteralExpression(firstArg)) {
        continue;
      }

      for (const element of firstArg.elements) {
        if (!ts.isObjectLiteralExpression(element)) {
          continue;
        }

        const route = readRouteEntry(element, imports);
        if (route === null) {
          continue;
        }

        routes.push(route);
        if (route.pageNodeId !== null) {
          edges.push({
            id: `${route.id}->${route.pageNodeId}:route-to-page`,
            from: route.id,
            to: route.pageNodeId,
            kind: 'route-to-page',
          });
        }
      }
    }
  });

  return {
    routes: routes.sort((left, right) => left.id.localeCompare(right.id)),
    edges: edges.sort((left, right) => left.id.localeCompare(right.id)),
  };
}

function readRouteEntry(
  object: ts.ObjectLiteralExpression,
  imports: Map<string, string>,
): RouteGraphEntry | null {
  const ref = readStringProperty(object, 'ref');
  const path = readStringProperty(object, 'path');
  const pageName = readIdentifierProperty(object, 'page');

  if (ref === null || path === null) {
    return null;
  }

  const pagePath = pageName === null ? null : imports.get(pageName) ?? null;

  return {
    id: `route:${ref}`,
    ref,
    path,
    parentId: null,
    layoutNodeId: null,
    pageNodeId: pagePath === null ? null : `page:${pagePath}`,
    childIds: [],
    metadata: {},
  };
}

function readStringProperty(object: ts.ObjectLiteralExpression, name: string): string | null {
  const property = object.properties.find(
    (item): item is ts.PropertyAssignment =>
      ts.isPropertyAssignment(item) && ts.isIdentifier(item.name) && item.name.text === name,
  );

  if (!property || !ts.isStringLiteral(property.initializer)) {
    return null;
  }

  return property.initializer.text;
}

function readIdentifierProperty(object: ts.ObjectLiteralExpression, name: string): string | null {
  const property = object.properties.find(
    (item): item is ts.PropertyAssignment =>
      ts.isPropertyAssignment(item) && ts.isIdentifier(item.name) && item.name.text === name,
  );

  if (!property || !ts.isIdentifier(property.initializer)) {
    return null;
  }

  return property.initializer.text;
}

function readImports(cwd: string, fromFile: string, sourceFile: ts.SourceFile): Map<string, string> {
  const imports = new Map<string, string>();

  sourceFile.forEachChild((node) => {
    if (!ts.isImportDeclaration(node) || !ts.isStringLiteral(node.moduleSpecifier)) {
      return;
    }

    const modulePath = node.moduleSpecifier.text;
    if (!modulePath.startsWith('.')) {
      return;
    }

    const resolved = toProjectPath(cwd, resolve(dirname(fromFile), `${modulePath}.ts`));
    const bindings = node.importClause?.namedBindings;
    if (!bindings || !ts.isNamedImports(bindings)) {
      return;
    }

    for (const element of bindings.elements) {
      imports.set(element.name.text, resolved);
    }
  });

  return imports;
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
  return relative(cwd, normalize(filePath)).split(sep).join('/');
}
