import { describe, expect, it } from 'vitest';
import { formatDiagnostic } from '@/diagnostics.js';

describe('formatDiagnostic', () => {
  it('includes location, code, message, code frame, suggestion, and docs path', () => {
    expect(
      formatDiagnostic({
        severity: 'error',
        code: 'VR005',
        message: 'Unsupported template syntax',
        filePath: '/repo/src/app.component.html',
        line: 3,
        column: 12,
        endLine: 3,
        endColumn: 18,
        sourceText: '@bad',
        codeFrame: '3 | <button @bad></button>\n  |            ^^^^^^',
        suggestion: 'Use supported Vanrot template syntax.',
        docsPath: '/docs/compiler/template-syntax',
      }),
    ).toBe(
      [
        '/repo/src/app.component.html:3:12 VR005 Unsupported template syntax',
        '3 | <button @bad></button>',
        '  |            ^^^^^^',
        'Suggestion: Use supported Vanrot template syntax.',
        'Docs: /docs/compiler/template-syntax',
      ].join('\n'),
    );
  });

  it('omits optional detail lines when fields are empty', () => {
    expect(
      formatDiagnostic({
        severity: 'warning',
        code: 'VR008',
        message: 'CSS selector cannot be scoped',
        filePath: '/repo/src/app.component.css',
        line: 1,
        column: 1,
        endLine: 1,
        endColumn: 7,
        sourceText: '',
        codeFrame: '',
        suggestion: '',
        docsPath: '',
      }),
    ).toBe('/repo/src/app.component.css:1:1 VR008 CSS selector cannot be scoped');
  });
});
