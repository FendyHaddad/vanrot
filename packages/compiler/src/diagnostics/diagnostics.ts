import type {
  CompileDiagnostic,
  DiagnosticCode,
  DiagnosticSeverity,
} from '../api/types.js';
import {
  createCodeFrame,
  getSourceText,
  type SourceSpan,
} from '../source/location.js';
import { diagnosticCatalog } from './catalog.js';

export interface DiagnosticSourceContext {
  source: string;
  span: SourceSpan;
}

export function createDiagnostic(
  code: DiagnosticCode,
  severity: DiagnosticSeverity,
  message: string | undefined,
  filePath: string,
  line = 1,
  column = 1,
  sourceContext?: DiagnosticSourceContext,
): CompileDiagnostic {
  const catalogEntry = diagnosticCatalog[code];
  const diagnosticMessage = message !== undefined && message.length > 0 ? message : catalogEntry.message;

  if (sourceContext !== undefined) {
    return {
      code,
      severity,
      message: diagnosticMessage,
      filePath: sourceContext.span.filePath,
      line: sourceContext.span.line,
      column: sourceContext.span.column,
      endLine: sourceContext.span.endLine,
      endColumn: sourceContext.span.endColumn,
      sourceText: getSourceText(sourceContext.source, sourceContext.span),
      codeFrame: createCodeFrame(sourceContext.source, sourceContext.span),
      suggestion: catalogEntry.suggestion,
      docsPath: catalogEntry.docsPath,
    };
  }

  return {
    code,
    severity,
    message: diagnosticMessage,
    filePath,
    line,
    column,
    endLine: line,
    endColumn: column,
    sourceText: '',
    codeFrame: '',
    suggestion: catalogEntry.suggestion,
    docsPath: catalogEntry.docsPath,
  };
}
