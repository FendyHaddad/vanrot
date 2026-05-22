import * as ts from 'typescript';
import type { ComponentFileSet } from '../conventions/component-files.js';
import { createDiagnostic } from '../diagnostics/diagnostics.js';
import type { CompileDiagnostic } from '../api/types.js';

const COMPONENT_CLASS_SUFFIXES = ['Component', 'Page', 'Button'] as const;

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
  const classDeclarations = sourceFile.statements.filter(ts.isClassDeclaration);
  const defaultClassDeclaration = classDeclarations.find((statement) => {
    return statement.name?.text === fileSet.expectedClassName && hasDefaultExportModifier(statement);
  });

  if (defaultClassDeclaration !== undefined) {
    return createMetadataFailure('VR014', fileSet.componentPath);
  }

  const plausibleExportedClasses = classDeclarations.filter((statement) => {
    if (!hasNamedExportModifier(statement)) {
      return false;
    }

    return isPlausibleComponentClassName(statement.name?.text);
  });

  if (plausibleExportedClasses.length > 1) {
    return createMetadataFailure('VR015', fileSet.componentPath);
  }

  const classDeclaration = classDeclarations.find((statement) => {
    return statement.name?.text === fileSet.expectedClassName && hasNamedExportModifier(statement);
  });

  if (classDeclaration === undefined) {
    return createMetadataFailure('VR004', fileSet.componentPath);
  }

  if (hasRequiredConstructorParameter(classDeclaration)) {
    return createMetadataFailure('VR016', fileSet.componentPath);
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

function createMetadataFailure(
  code: CompileDiagnostic['code'],
  filePath: string,
): ComponentMetadataResult {
  return {
    metadata: null,
    diagnostics: [createDiagnostic(code, 'error', undefined, filePath)],
  };
}

function hasNamedExportModifier(node: ts.ClassDeclaration): boolean {
  const modifiers = node.modifiers ?? [];
  const hasExport = modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);
  const hasDefault = modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword);

  return hasExport && !hasDefault;
}

function hasDefaultExportModifier(node: ts.ClassDeclaration): boolean {
  const modifiers = node.modifiers ?? [];
  const hasExport = modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);
  const hasDefault = modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword);

  return hasExport && hasDefault;
}

function isPlausibleComponentClassName(className: string | undefined): boolean {
  if (className === undefined) {
    return false;
  }

  return COMPONENT_CLASS_SUFFIXES.some((suffix) => className.endsWith(suffix));
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
