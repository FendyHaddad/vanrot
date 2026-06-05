import { describe, expect, it } from 'vitest';
import { createForm, createWizard, field, required } from '../src/index.js';

describe('@vanrot/forms wizard state', () => {
  it('blocks steps with invalid fields and tracks completion', async () => {
    const form = createForm({
      fields: {
        email: field('', { validators: [required()] }),
        address: field('', { validators: [required()] }),
      },
    });
    const wizard = createWizard(form, [
      { name: 'account', fields: [form.fields.email] },
      { name: 'shipping', fields: [form.fields.address] },
    ]);

    expect(wizard.current().name).toBe('account');
    await expect(wizard.goTo('shipping')).resolves.toBe(false);
    expect(wizard.current().name).toBe('account');

    form.fields.email.value.set('user@example.com');
    await expect(wizard.goTo('shipping')).resolves.toBe(true);

    expect(wizard.current().name).toBe('shipping');
    expect(wizard.steps()[0]?.completed()).toBe(true);
  });
});
