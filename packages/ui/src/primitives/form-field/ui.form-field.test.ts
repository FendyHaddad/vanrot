import { describe, expect, it } from 'vitest';
import { UiFormField } from './ui.form-field.ts';

describe('UiFormField', () => {
  it('exports the form field primitive class', () => {
    expect(UiFormField).toBeTypeOf('function');
  });
});
