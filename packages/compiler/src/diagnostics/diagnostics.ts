import type {
  CompileDiagnostic,
  DiagnosticCode,
  DiagnosticSeverity,
} from '../api/types.js';

export function createDiagnostic(
  code: DiagnosticCode,
  severity: DiagnosticSeverity,
  message: string,
  filePath: string,
  line = 1,
  column = 1,
): CompileDiagnostic {
  return {
    code,
    severity,
    message,
    filePath,
    line,
    column,
  };
}
