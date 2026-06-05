import { describe, expect, it } from 'vitest';
import { createForm, email, field, minLength, required } from '../src/index.js';

describe('@vanrot/forms form lifecycle', () => {
  it('uses named refs for fields and shows validation after touch, change, or submit', async () => {
    const form = createForm({
      fields: {
        email: field('', { validators: [required(), email()] }),
        password: field('', { validators: [required(), minLength(8)] }),
      },
    });

    expect(form.fields.email.value()).toBe('');
    expect(form.fields.email.messages()).toEqual([]);

    form.fields.email.value.set('not-an-email');
    expect(form.fields.email.dirty()).toBe(true);
    expect(form.fields.email.messages()).toEqual(['Email is invalid.']);

    form.fields.email.touch();
    expect(form.fields.email.messages()).toEqual(['Email is invalid.']);

    await form.submit(async () => ({ ok: true }));

    expect(form.submitCount()).toBe(1);
    expect(form.fields.password.messages()).toEqual(['This field is required.', 'Must be at least 8 characters.']);
    expect(form.valid()).toBe(false);
  });

  it('resets form and field state', () => {
    const form = createForm({
      fields: {
        email: field('user@example.com', { validators: [required(), email()] }),
      },
    });

    form.fields.email.value.set('bad');
    form.fields.email.touch();

    expect(form.fields.email.dirty()).toBe(true);
    expect(form.fields.email.touched()).toBe(true);

    form.reset();

    expect(form.fields.email.value()).toBe('user@example.com');
    expect(form.fields.email.dirty()).toBe(false);
    expect(form.fields.email.touched()).toBe(false);
    expect(form.fields.email.messages()).toEqual([]);
  });
});
