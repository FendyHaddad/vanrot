import { describe, expect, it } from 'vitest';
import { createForm, field, required } from '../src/index.js';

describe('@vanrot/forms metadata', () => {
  it('exports serializable field, validator, and draft metadata', () => {
    const form = createForm({
      name: 'profile',
      fields: {
        email: field('', { validators: [required()] }),
      },
    });

    expect(form.metadata()).toMatchObject({
      name: 'profile',
      fields: [{ path: 'email', kind: 'field', validators: ['required'] }],
    });
  });
});
