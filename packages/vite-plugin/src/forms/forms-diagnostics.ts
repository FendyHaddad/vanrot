import { readFile } from 'node:fs/promises';
import { discoverFormDefinitionFiles } from './forms-metadata.js';

export type ViteFormDiagnostic = {
  code: string;
  severity: 'warning' | 'error';
  message: string;
  filePath: string;
  line: number;
  column: number;
  fieldPath?: string;
};

export type FormsDiagnosticInput = {
  code: string;
  severity: 'warning' | 'error';
  message: string;
  formPath: string;
  fieldPath?: string;
  source?: {
    file: string;
    line?: number;
    column?: number;
  };
};

export function adaptFormDiagnosticForVite(diagnostic: FormsDiagnosticInput): ViteFormDiagnostic {
  return {
    code: diagnostic.code,
    severity: diagnostic.severity,
    message: diagnostic.message,
    filePath: diagnostic.source?.file ?? diagnostic.formPath,
    line: diagnostic.source?.line ?? 1,
    column: diagnostic.source?.column ?? 1,
    ...(diagnostic.fieldPath ? { fieldPath: diagnostic.fieldPath } : {}),
  };
}

export function formatViteFormDiagnostic(diagnostic: ViteFormDiagnostic): string {
  return `${diagnostic.filePath}:${diagnostic.line}:${diagnostic.column} ${diagnostic.code} ${diagnostic.message}`;
}

export async function collectFormDiagnosticsForVite(root: string): Promise<ViteFormDiagnostic[]> {
  const files = await discoverFormDefinitionFiles(root);
  const diagnostics: ViteFormDiagnostic[] = [];

  for (const file of files) {
    const source = await readFile(file.filePath, 'utf8');
    const lines = source.split(/\r?\n/);

    lines.forEach((line, index) => {
      const stringPathIndex = Math.max(line.indexOf('field("'), line.indexOf("field('"));

      if (stringPathIndex >= 0) {
        diagnostics.push({
          code: 'VR_FORM_REPEATED_STRING_PATH',
          severity: 'warning',
          message: 'Prefer named form refs such as form.fields.email over repeated string paths.',
          filePath: file.filePath,
          line: index + 1,
          column: stringPathIndex + 1,
        });
      }
    });
  }

  return diagnostics;
}
