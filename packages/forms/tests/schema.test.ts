import { describe, expect, it } from 'vitest';
import { createForm, field, useSchemaAdapter } from '../src/index.js';

describe('@vanrot/forms schema adapters', () => {
  it('consumes schema adapters without generating backend contracts', async () => {
    const form = createForm({
      fields: {
        email: field('bad'),
      },
      schemas: [
        useSchemaAdapter({
          name: 'account',
          fields: ['email'],
          validate: (values) => ({
            ok: false,
            errors: { email: ['Schema email error.'] },
            values,
          }),
        }),
      ],
    });

    await form.validate();

    expect(form.fields.email.messages()).toEqual(['Schema email error.']);
    expect(form.metadata().backendContractGenerated).toBe(false);
  });
});
