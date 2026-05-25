import { describe, expect, it } from 'vitest';
import { UiInput } from './ui.input.ts';

describe('UiInput', () => {
  it('exports the input primitive class', () => {
    expect(UiInput).toBeTypeOf('function');
  });
});
