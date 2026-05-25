import { describe, expect, it } from 'vitest';
import {
  createFormController,
  emailValidator,
  minLengthValidator,
} from '../../src/forms/form-controller.js';

describe('createFormController', () => {
  it('tracks field values, dirty state, and reset', () => {
    const form = createFormController({ email: 'ada@example.com' });
    const email = form.registerField({ name: 'email', required: true });

    email.setValue('grace@example.com');

    expect(form.value()).toEqual({ email: 'grace@example.com' });
    expect(form.dirty()).toBe(true);

    form.reset();

    expect(form.value()).toEqual({ email: 'ada@example.com' });
    expect(form.dirty()).toBe(false);
  });

  it('validates required, email, and custom validators before submit', async () => {
    const form = createFormController();
    const email = form.registerField({
      name: 'email',
      required: true,
      validators: [emailValidator, minLengthValidator(6)],
    });
    const calls: unknown[] = [];

    const submitted = await form.submit((values) => {
      calls.push(values);
    });

    expect(submitted).toBe(false);
    expect(form.invalid()).toBe(true);
    expect(form.submitted()).toBe(true);
    expect(email.touched()).toBe(true);
    expect(form.errors().email).toContain('This field is required.');

    email.setValue('ada@example.com');

    expect(await form.submit((values) => calls.push(values))).toBe(true);
    expect(calls).toEqual([{ email: 'ada@example.com' }]);
    expect(form.pending()).toBe(false);
  });
});
