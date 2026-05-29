import * as ts from 'typescript';

export function collectInstanceMemberNames(componentSource: string, className: string): string[] {
  const sourceFile = ts.createSourceFile('component.ts', componentSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const classDeclaration = sourceFile.statements.find(
    (statement): statement is ts.ClassDeclaration =>
      ts.isClassDeclaration(statement) && statement.name?.text === className,
  );

  if (classDeclaration === undefined) {
    return [];
  }

  const names: string[] = [];

  for (const member of classDeclaration.members) {
    if (isPrivate(member) || isStatic(member)) {
      continue;
    }

    const name = member.name;

    if (name === undefined || !ts.isIdentifier(name)) {
      continue;
    }

    if (ts.isPropertyDeclaration(member) || ts.isMethodDeclaration(member) || ts.isGetAccessorDeclaration(member)) {
      names.push(name.text);
    }
  }

  return [...new Set(names)];
}

function isPrivate(member: ts.ClassElement): boolean {
  return hasModifier(member, ts.SyntaxKind.PrivateKeyword);
}

function isStatic(member: ts.ClassElement): boolean {
  return hasModifier(member, ts.SyntaxKind.StaticKeyword);
}

function hasModifier(member: ts.ClassElement, kind: ts.SyntaxKind): boolean {
  const modifiers = ts.canHaveModifiers(member) ? (ts.getModifiers(member) ?? []) : [];
  return modifiers.some((modifier) => modifier.kind === kind);
}
