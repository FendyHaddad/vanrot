import { describe, expect, it } from 'vitest';
import { createForm, field, fieldArray, required } from '../src/index.js';

describe('@vanrot/forms field arrays', () => {
  it('adds, removes, moves, and preserves named item refs', () => {
    const form = createForm({
      fields: {
        items: fieldArray(() => ({
          sku: field('', { validators: [required()] }),
          quantity: field(1),
        })),
      },
    });

    const first = form.fields.items.add({ sku: 'A-100', quantity: 2 });
    const second = form.fields.items.add({ sku: 'B-200', quantity: 4 });

    expect(first.fields.sku.value()).toBe('A-100');
    expect(second.fields.quantity.value()).toBe(4);
    expect(form.fields.items.items().map((item) => item.key)).toEqual([first.key, second.key]);

    form.fields.items.move(0, 1);
    expect(form.fields.items.items().map((item) => item.key)).toEqual([second.key, first.key]);

    form.fields.items.remove(0);
    expect(form.fields.items.items().map((item) => item.key)).toEqual([first.key]);
  });
});
