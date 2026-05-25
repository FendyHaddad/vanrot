import { describe, expect, it } from 'vitest';
import { UiSelect } from './ui.select.ts';

describe('UiSelect', () => {
  it('exports the select primitive class', () => {
    expect(UiSelect).toBeTypeOf('function');
  });
});
