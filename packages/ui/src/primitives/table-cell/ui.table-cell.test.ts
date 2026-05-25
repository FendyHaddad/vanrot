import { describe, expect, it } from 'vitest';
import { UiTableCell } from './ui.table-cell.ts';

describe('UiTableCell', () => {
  it('exports the table cell primitive class', () => {
    expect(UiTableCell).toBeTypeOf('function');
  });
});
