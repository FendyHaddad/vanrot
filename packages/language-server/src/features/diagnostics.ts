import { readFileSync } from 'node:fs';
import { compileComponent, createComponentFileSet, type CompileDiagnostic } from '@vanrot/compiler';
import { type Diagnostic, DiagnosticSeverity } from 'vscode-languageserver';

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
