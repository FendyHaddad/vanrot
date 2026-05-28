import { createSourceSpan, type SourceSpan } from '@vanrot/compiler';
import * as ts from 'typescript';

export interface RouteEntry {
  name: string;
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
      span: createSourceSpan(source, filePath, name.getStart(sourceFile), name.getEnd()),
    });
  }

  return entries;
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
