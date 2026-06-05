import { describe, expect, it } from 'vitest';
import { createForm, createFormMessage, createFormResource, email, field, minLength, required } from '../src/index.js';

describe('@vanrot/forms validation', () => {
  it('normalizes built-in, custom, and explicit message sources', async () => {
    const form = createForm({
      fields: {
        email: field('', {
          validators: [
            required(),
            email(),
            minLength(8),
            () => createFormMessage('validation', 'Custom message.', 'custom'),
          ],
        }),
      },
    });

    await form.validate();

    expect(form.fields.email.messages()).toEqual([
      'This field is required.',
      'Must be at least 8 characters.',
      'Custom message.',
    ]);
    expect(form.fields.email.errors().map((message) => message.source)).toEqual([
      'validation',
      'validation',
      'validation',
    ]);
  });

  it('runs async validators through form resources and exposes resource messages', async () => {
    const availability = createFormResource<string, string | null>({
      load: async ({ value }) => (value === 'taken@example.com' ? 'Email is already taken.' : null),
    });
    const form = createForm({
      fields: {
        email: field('', { asyncValidators: [availability] }),
      },
    });

    form.fields.email.value.set('taken@example.com');
    const valid = await form.validate();

    expect(valid).toBe(false);
    expect(form.fields.email.messages()).toEqual(['Email is already taken.']);
    expect(form.fields.email.pending()).toBe(false);
    expect(availability.success()).toBe(true);
  });
});
