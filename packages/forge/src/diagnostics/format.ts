import type { ForgeDiagnosticCode } from './codes.js';

export type ForgeDiagnosticSeverity = 'error' | 'warning';

export interface ForgeDiagnostic {
  code: ForgeDiagnosticCode;
  severity: ForgeDiagnosticSeverity;
  message: string;
  filePath?: string;
  role?: string;
  routePath?: string;
  suggestion: string;
  docsPath: string;
}

export function formatForgeDiagnostic(diagnostic: ForgeDiagnostic): string {
  const location = diagnostic.filePath === undefined ? '' : ` ${diagnostic.filePath}`;
  const role = diagnostic.role === undefined ? '' : ` role=${diagnostic.role}`;
  const route = diagnostic.routePath === undefined ? '' : ` route=${diagnostic.routePath}`;

  return [
    `${diagnostic.code} ${diagnostic.severity}${location}${role}${route} ${diagnostic.message}`,
    `Suggestion: ${diagnostic.suggestion}`,
    `Docs: ${diagnostic.docsPath}`,
  ].join('\n');
}
