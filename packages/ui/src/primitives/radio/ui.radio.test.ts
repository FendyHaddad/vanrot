import { describe, expect, it } from 'vitest';
import { UiRadio } from './ui.radio.ts';

describe('UiRadio', () => {
  it('exports the radio primitive class', () => {
    expect(UiRadio).toBeTypeOf('function');
  });
});
