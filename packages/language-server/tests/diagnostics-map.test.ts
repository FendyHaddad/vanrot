import { describe, expect, it } from 'vitest';
import { DiagnosticSeverity } from 'vscode-languageserver';
import type { CompileDiagnostic } from '@vanrot/compiler';
import { toLspDiagnostics } from '../src/features/diagnostics.js';

const compileDiagnostic: CompileDiagnostic = {
  code: 'VR006',
  severity: 'error',
  message: 'Unsupported expression.',
  filePath: '/app/x.component.html',
  line: 2,
  column: 5,
  endLine: 2,
  endColumn: 12,
  sourceText: '',
  codeFrame: '',
  suggestion: '',
  docsPath: '',
};

describe('toLspDiagnostics', () => {
  it('maps a compiler diagnostic for the target file to a 0-based LSP diagnostic', () => {
    const [diagnostic] = toLspDiagnostics([compileDiagnostic], '/app/x.component.html');
    expect(diagnostic?.severity).toBe(DiagnosticSeverity.Error);
    expect(diagnostic?.code).toBe('VR006');
    expect(diagnostic?.source).toBe('vanrot');
    expect(diagnostic?.range).toEqual({
      start: { line: 1, character: 4 },
      end: { line: 1, character: 11 },
    });
  });

  it('filters out diagnostics for other files', () => {
    expect(toLspDiagnostics([compileDiagnostic], '/app/other.component.html')).toHaveLength(0);
  });

  it('maps warning severity', () => {
    const warning = { ...compileDiagnostic, severity: 'warning' as const };
    expect(toLspDiagnostics([warning], '/app/x.component.html')[0]?.severity).toBe(
      DiagnosticSeverity.Warning,
    );
  });
});
