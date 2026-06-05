import { describe, expect, it } from 'vitest';
import { createForm, createFormTest, email, field } from '../src/index.js';

describe('@vanrot/forms testing helpers', () => {
  it('sets values, touches fields, submits forms, and inspects messages', async () => {
    const form = createForm({
      fields: {
        email: field('', { validators: [email()] }),
      },
    });
    const testForm = createFormTest(form);

    testForm.set('email', 'bad-email');
    testForm.touch('email');

    expect(testForm.field('email').messages()).toEqual(['Email is invalid.']);

    await testForm.submit();

    expect(form.submitCount()).toBe(1);
  });
});
