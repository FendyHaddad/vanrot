import { describe, expect, it } from 'vitest';
import { UiTableBody } from './ui.table-body.ts';

describe('UiTableBody', () => {
  it('exports the table body primitive class', () => {
    expect(UiTableBody).toBeTypeOf('function');
  });
});
