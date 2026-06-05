import { describe, expect, it } from 'vitest';
import { createForm, field, required } from '../src/index.js';

describe('@vanrot/forms fields', () => {
  it('tracks field state and preserves named refs', () => {
    const form = createForm({
      fields: {
        profile: {
          email: field('', { validators: [required()] }),
        },
      },
    });

    expect(form.fields.profile.email.path).toBe('profile.email');
    expect(form.fields.profile.email.dirty()).toBe(false);
    expect(form.fields.profile.email.touched()).toBe(false);
    expect(form.fields.profile.email.disabled()).toBe(false);
    expect(form.fields.profile.email.pending()).toBe(false);
    expect(form.fields.profile.email.valid()).toBe(false);

    form.fields.profile.email.value.set('');
    form.fields.profile.email.touch();

    expect(form.fields.profile.email.touched()).toBe(true);
    expect(form.fields.profile.email.messages()).toEqual(['This field is required.']);

    form.fields.profile.email.disabled.set(true);

    expect(form.fields.profile.email.disabled()).toBe(true);

    form.fields.profile.email.reset();

    expect(form.fields.profile.email.touched()).toBe(false);
    expect(form.fields.profile.email.disabled()).toBe(false);
    expect(form.fields.profile.email.messages()).toEqual([]);
  });
});
