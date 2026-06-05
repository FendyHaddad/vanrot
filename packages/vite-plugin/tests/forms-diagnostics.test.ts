import { describe, expect, it } from 'vitest';
import {
  adaptFormDiagnosticForVite,
  formatViteFormDiagnostic,
} from '@/forms/forms-diagnostics.js';

describe('forms diagnostics adapter', () => {
  it('formats structured form diagnostics for terminal reporting', () => {
    const diagnostic = adaptFormDiagnosticForVite({
      code: 'VR_FORM_SENSITIVE_DRAFT_FIELD',
      severity: 'warning',
      message: 'Sensitive field "password" is configured for draft persistence.',
      formPath: 'profile',
      fieldPath: 'password',
      source: {
        file: '/repo/src/profile.form.ts',
        line: 12,
        column: 5,
      },
    });

    expect(formatViteFormDiagnostic(diagnostic)).toBe(
      '/repo/src/profile.form.ts:12:5 VR_FORM_SENSITIVE_DRAFT_FIELD Sensitive field "password" is configured for draft persistence.',
    );
  });
});
