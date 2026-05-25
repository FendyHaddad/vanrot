import { describe, expect, it } from 'vitest';
import { UiTableHead } from './ui.table-head.ts';

describe('UiTableHead', () => {
  it('exports the table head primitive class', () => {
    expect(UiTableHead).toBeTypeOf('function');
  });
});
