import { describe, expect, it } from 'vitest';
import { UiTableFooter } from './ui.table-footer.ts';

describe('UiTableFooter', () => {
  it('exports the table footer primitive class', () => {
    expect(UiTableFooter).toBeTypeOf('function');
  });
});
