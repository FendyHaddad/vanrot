import { describe, expect, it } from 'vitest';
import { UiTableHeader } from './ui.table-header.ts';

describe('UiTableHeader', () => {
  it('exports the table header primitive class', () => {
    expect(UiTableHeader).toBeTypeOf('function');
  });
});
