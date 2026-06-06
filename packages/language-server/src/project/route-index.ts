import { createSourceSpan, type SourceSpan } from '@vanrot/compiler';
import * as ts from 'typescript';

export interface RouteEntry {
  name: string;
  path?: string;
  page?: string;
  span: SourceSpan;
}

export function parseRouteIndex(filePath: string, source: string): RouteEntry[] {
  const sourceFile = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const call = findDefineRoutesCall(sourceFile);

  if (call === null) {
    return [];
  }

  const argument = call.arguments[0];

  if (argument === undefined || !ts.isObjectLiteralExpression(argument)) {
    return [];
  }

  const entries: RouteEntry[] = [];

  for (const property of argument.properties) {
    const name = property.name;

    if (name === undefined || !ts.isIdentifier(name)) {
      continue;
    }

    entries.push({
      name: name.text,
      ...readRouteMetadata(property),
      span: createSourceSpan(source, filePath, name.getStart(sourceFile), name.getEnd()),
    });
  }

  return entries;
}

function readRouteMetadata(property: ts.ObjectLiteralElementLike): Pick<RouteEntry, 'path' | 'page'> {
  if (!ts.isPropertyAssignment(property) || !ts.isObjectLiteralExpression(property.initializer)) {
    return {};
  }

  const path = readStringProperty(property.initializer, 'path');
  const page = readStringProperty(property.initializer, 'page');
  const metadata: Pick<RouteEntry, 'path' | 'page'> = {};

  if (path !== undefined) {
    metadata.path = path;
  }

  if (page !== undefined) {
    metadata.page = page;
  }

  return metadata;
}

function readStringProperty(object: ts.ObjectLiteralExpression, name: string): string | undefined {
  for (const property of object.properties) {
    if (!ts.isPropertyAssignment(property) || !ts.isIdentifier(property.name)) {
      continue;
    }

    if (property.name.text !== name || !ts.isStringLiteralLike(property.initializer)) {
      continue;
    }

    return property.initializer.text;
  }

  return undefined;
}

function findDefineRoutesCall(node: ts.Node): ts.CallExpression | null {
  let found: ts.CallExpression | null = null;

  const visit = (current: ts.Node): void => {
    if (found !== null) {
      return;
    }

    if (
      ts.isCallExpression(current) &&
      ts.isIdentifier(current.expression) &&
      current.expression.text === 'defineRoutes'
    ) {
      found = current;
      return;
    }

    ts.forEachChild(current, visit);
  };

  visit(node);
  return found;
}
