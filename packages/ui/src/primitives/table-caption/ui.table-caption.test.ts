import { describe, expect, it } from 'vitest';
import { UiTableCaption } from './ui.table-caption.ts';

describe('UiTableCaption', () => {
  it('exports the table caption primitive class', () => {
    expect(UiTableCaption).toBeTypeOf('function');
  });
});
