import { describe, expect, it } from 'vitest';
import { UiCheckbox } from './ui.checkbox.ts';

describe('UiCheckbox', () => {
  it('exports the checkbox primitive class', () => {
    expect(UiCheckbox).toBeTypeOf('function');
  });
});
