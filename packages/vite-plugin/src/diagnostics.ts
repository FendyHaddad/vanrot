import type { CompileDiagnostic } from '@vanrot/compiler';

export function formatDiagnostic(diagnostic: CompileDiagnostic): string {
  return [
    `${diagnostic.filePath}:${diagnostic.line}:${diagnostic.column} ${diagnostic.code} ${diagnostic.message}`,
    diagnostic.codeFrame,
    diagnostic.suggestion === '' ? '' : `Suggestion: ${diagnostic.suggestion}`,
    diagnostic.docsPath === '' ? '' : `Docs: ${diagnostic.docsPath}`,
  ]
    .filter((line) => line !== '')
    .join('\n');
}
