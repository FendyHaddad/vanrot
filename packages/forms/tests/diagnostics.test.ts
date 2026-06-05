import { describe, expect, it } from 'vitest';
import { createForm, diagnoseForm, field } from '../src/index.js';

describe('@vanrot/forms diagnostics', () => {
  it('reports sensitive fields configured for persistence', () => {
    const form = createForm({
      fields: {
        password: field('', { persistence: 'allow' }),
      },
    });

    expect(diagnoseForm(form)).toEqual([
      expect.objectContaining({
        code: 'VR_FORM_SENSITIVE_DRAFT_FIELD',
        fieldPath: 'password',
        severity: 'warning',
      }),
    ]);
  });
});
