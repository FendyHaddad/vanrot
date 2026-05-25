import { describe, expect, it } from 'vitest';
import { UiForm } from './ui.form.ts';

describe('UiForm', () => {
  it('exports the form primitive class', () => {
    expect(UiForm).toBeTypeOf('function');
  });
});
