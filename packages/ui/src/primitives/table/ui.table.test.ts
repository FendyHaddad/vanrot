import { describe, expect, it } from 'vitest';
import { UiTable } from './ui.table.ts';

describe('UiTable', () => {
  it('exports the table primitive class', () => {
    expect(UiTable).toBeTypeOf('function');
  });
});
