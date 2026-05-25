import { describe, expect, it } from 'vitest';
import { UiTableRow } from './ui.table-row.ts';

describe('UiTableRow', () => {
  it('exports the table row primitive class', () => {
    expect(UiTableRow).toBeTypeOf('function');
  });
});
