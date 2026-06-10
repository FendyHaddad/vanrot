import { describe, expect, it } from 'vitest';
import { forgeDiagnosticCode, formatForgeDiagnostic } from '../src/index.js';

describe('Forge diagnostics', () => {
  it('formats diagnostics with code, severity, file, role, suggestion, and docs path', () => {
    expect(
      formatForgeDiagnostic({
        code: forgeDiagnosticCode.unsupportedFileRole,
        severity: 'warning',
        message: 'Unsupported role file suffix.',
        filePath: 'src/bad.view.ts',
        role: 'view',
        suggestion: 'Use .component.ts, .page.ts, .layout.ts, .widget.ts, or .form.ts.',
        docsPath: '/docs/forge/config',
      }),
    ).toBe(
      'VRFORGE005 warning src/bad.view.ts role=view Unsupported role file suffix.\nSuggestion: Use .component.ts, .page.ts, .layout.ts, .widget.ts, or .form.ts.\nDocs: /docs/forge/config',
    );
  });
});
