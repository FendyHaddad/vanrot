import type { RouteDiagnosticCode } from './route-diagnostic-codes.js';

export type RouteDiagnosticSeverity = 'error' | 'warning';

export interface RouteDiagnosticInput {
  code: RouteDiagnosticCode;
  message: string;
  filePath?: string;
  line?: number;
  column?: number;
  suggestion: string;
  docsPath: string;
  severity?: RouteDiagnosticSeverity;
}

export interface RouteDiagnostic {
  code: RouteDiagnosticCode;
  severity: RouteDiagnosticSeverity;
  message: string;
  filePath?: string;
  line?: number;
  column?: number;
  suggestion: string;
  docsPath: string;
}

export function createRouteDiagnostic(input: RouteDiagnosticInput): RouteDiagnostic {
  const diagnostic: RouteDiagnostic = {
    code: input.code,
    severity: input.severity ?? 'error',
    message: input.message,
    suggestion: input.suggestion,
    docsPath: input.docsPath,
  };

  if (input.filePath !== undefined) {
    diagnostic.filePath = input.filePath;
  }

  if (input.line !== undefined) {
    diagnostic.line = input.line;
  }

  if (input.column !== undefined) {
    diagnostic.column = input.column;
  }

  return diagnostic;
}
