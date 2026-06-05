import { describe, expect, it } from 'vitest';
import { createForm, field, formField, required } from '../src/index.js';

describe('@vanrot/forms UI helpers', () => {
  it('derives accessible input and message attributes from field state', () => {
    const form = createForm({
      fields: {
        email: field('', { validators: [required()] }),
      },
    });
    const helper = formField(form.fields.email, {
      label: 'Email',
      description: 'Used for account recovery.',
    });

    form.fields.email.touch();

    expect(helper.inputAttributes()).toMatchObject({
      'aria-invalid': 'true',
      'aria-describedby': expect.stringContaining('email'),
    });
    expect(helper.messages()).toEqual(['This field is required.']);
  });
});
