import { readFileSync } from 'node:fs';
import { compileComponent, createComponentFileSet, type CompileDiagnostic } from '@vanrot/compiler';
import { type Diagnostic, DiagnosticSeverity } from 'vscode-languageserver';
import { spanToRange } from '../lsp/position.js';
import { emptyTemplateIndex } from '../project/template-index.js';
import { emptyVanrotWebTypes } from '../project/web-types.js';
import type { WorkspaceIndex } from '../project/workspace.js';

export function toLspDiagnostics(
  compileDiagnostics: readonly CompileDiagnostic[],
  templatePath: string,
): Diagnostic[] {
  const result: Diagnostic[] = [];

  for (const diagnostic of compileDiagnostics) {
    if (diagnostic.filePath !== templatePath) continue;

    result.push({
      severity: diagnostic.severity === 'error' ? DiagnosticSeverity.Error : DiagnosticSeverity.Warning,
      code: diagnostic.code,
      source: 'vanrot',
      message: diagnostic.message,
      range: {
        start: { line: diagnostic.line - 1, character: diagnostic.column - 1 },
        end: { line: diagnostic.endLine - 1, character: diagnostic.endColumn - 1 },
      },
    });
  }

  return result;
}

export function editorTemplateDiagnostics(templatePath: string, index: WorkspaceIndex): Diagnostic[] {
  const templates = index.templates ?? emptyTemplateIndex();
  const template = templates.templates.find((entry) => entry.path === templatePath);

  if (template === undefined) {
    return [];
  }

  const diagnostics: Diagnostic[] = [];
  const webTypes = index.webTypes ?? emptyVanrotWebTypes();
  const routeNames = new Set(index.routes.map((route) => route.name));
  const tagNames = new Set([
    ...index.components.map((component) => component.tagName),
    ...webTypes.tags.map((tag) => tag.name),
    'vr',
    'vr-outlet',
    'vr-router',
  ]);

  for (const route of template.routeRefs) {
    if (routeNames.has(route.name)) {
      continue;
    }

    diagnostics.push({
      severity: DiagnosticSeverity.Warning,
      code: 'VREDITOR001',
      source: 'vanrot',
      message: `Unknown route ref route.${route.name}.`,
      range: spanToRange(route.span),
    });
  }

  for (const tag of template.tags) {
    if (isNativeHtmlTag(tag.name) || tagNames.has(tag.name)) {
      continue;
    }

    diagnostics.push({
      severity: DiagnosticSeverity.Warning,
      code: 'VREDITOR003',
      source: 'vanrot',
      message: `Missing Web Types metadata for ${tag.name}.`,
      range: spanToRange(tag.span),
    });
  }

  return diagnostics;
}

export async function compileTemplateDiagnostics(
  templatePath: string,
  templateText: string,
): Promise<Diagnostic[]> {
  const componentPath = templatePath.replace(/\.html$/, '.ts');
  const fileSet = createComponentFileSet(componentPath);

  if (fileSet === null) {
    return [];
  }

  const componentSource = readOptional(fileSet.componentPath);
  const styleSource = readOptional(fileSet.stylePath);

  if (componentSource === null) {
    return [];
  }

  const result = compileComponent({
    componentPath: fileSet.componentPath,
    componentSource,
    templatePath: fileSet.templatePath,
    templateSource: templateText,
    stylePath: fileSet.stylePath,
    styleSource: styleSource ?? '',
  });

  return toLspDiagnostics(result.diagnostics, fileSet.templatePath);
}

function readOptional(path: string): string | null {
  try {
    return readFileSync(path, 'utf8');
  } catch {
    return null;
  }
}

function isNativeHtmlTag(tagName: string): boolean {
  return [
    'a',
    'article',
    'button',
    'code',
    'div',
    'form',
    'h1',
    'h2',
    'h3',
    'input',
    'label',
    'li',
    'main',
    'nav',
    'p',
    'pre',
    'section',
    'span',
    'strong',
    'ul',
  ].includes(tagName);
}
