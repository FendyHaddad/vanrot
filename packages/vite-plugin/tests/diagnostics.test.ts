import { describe, expect, it } from 'vitest';
import { formatDiagnostic } from '@/diagnostics.js';

describe('formatDiagnostic', () => {
  it('includes code, message, file, line, and column', () => {
    expect(
      formatDiagnostic({
        severity: 'error',
        code: 'VR005',
        message: 'Unsupported template syntax',
        filePath: '/repo/src/app.component.html',
        line: 3,
        column: 12,
      }),
    ).toBe('/repo/src/app.component.html:3:12 VR005 Unsupported template syntax');
  });
});
