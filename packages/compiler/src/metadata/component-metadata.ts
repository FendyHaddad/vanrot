import * as ts from 'typescript';
import type { ComponentFileSet } from '../conventions/component-files.js';
import { createDiagnostic } from '../diagnostics/diagnostics.js';
import type { CompileDiagnostic } from '../api/types.js';

export interface ComponentMetadata {
  componentName: string;
  exportName: string;
  importPath: string;
}

export interface ComponentMetadataResult {
  metadata: ComponentMetadata | null;
  diagnostics: CompileDiagnostic[];
}

export function readComponentMetadata(
  fileSet: ComponentFileSet,
  componentSource: string,
): ComponentMetadataResult {
  const sourceFile = ts.createSourceFile(
    fileSet.componentPath,
    componentSource,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const classDeclaration = sourceFile.statements.find((statement): statement is ts.ClassDeclaration => {
    if (!ts.isClassDeclaration(statement)) {
      return false;
    }

    if (statement.name?.text !== fileSet.expectedClassName) {
      return false;
    }

    return hasNamedExportModifier(statement);
  });

  if (classDeclaration === undefined || hasRequiredConstructorParameter(classDeclaration)) {
    return {
      metadata: null,
      diagnostics: [
        createDiagnostic(
          'VR004',
          'error',
          `Expected named export class ${fileSet.expectedClassName} with no required constructor arguments.`,
          fileSet.componentPath,
        ),
      ],
    };
  }

  return {
    metadata: {
      componentName: fileSet.expectedClassName,
      exportName: fileSet.expectedClassName,
      importPath: fileSet.componentPath.replace(/\.ts$/, '.js'),
    },
    diagnostics: [],
  };
}

function hasNamedExportModifier(node: ts.ClassDeclaration): boolean {
  const modifiers = node.modifiers ?? [];
  const hasExport = modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);
  const hasDefault = modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword);

  return hasExport && !hasDefault;
}

function hasRequiredConstructorParameter(node: ts.ClassDeclaration): boolean {
  const constructorDeclaration = node.members.find(ts.isConstructorDeclaration);

  if (constructorDeclaration === undefined) {
    return false;
  }

  return constructorDeclaration.parameters.some((parameter) => {
    if (parameter.questionToken !== undefined || parameter.initializer !== undefined) {
      return false;
    }

    return true;
  });
}
