import { describe, expect, it } from 'vitest';
import { applyServerErrors, createForm, field, fieldArray } from '../src/index.js';

describe('@vanrot/forms server errors', () => {
  it('applies field, nested array, and form-level server errors', () => {
    const form = createForm({
      fields: {
        email: field('user@example.com'),
        items: fieldArray(() => ({
          sku: field(''),
        })),
      },
    });

    form.fields.items.add({ sku: 'A-100' });
    form.fields.items.add({ sku: 'B-200' });

    applyServerErrors(form, {
      fields: {
        email: ['Email already exists.'],
        'items[1].sku': ['SKU is unavailable.'],
      },
      form: ['Payment failed.'],
    });

    expect(form.fields.email.messages()).toEqual(['Email already exists.']);
    expect(form.fields.items.items()[1]?.fields.sku.messages()).toEqual(['SKU is unavailable.']);
    expect(form.messages()).toEqual(['Payment failed.']);
  });
});
