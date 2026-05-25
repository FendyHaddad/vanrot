import { describe, expect, it } from 'vitest';
import { UiRadioGroup } from './ui.radio-group.ts';

describe('UiRadioGroup', () => {
  it('exports the radio group primitive class', () => {
    expect(UiRadioGroup).toBeTypeOf('function');
  });
});
