import { describe, expect, it } from 'vitest';
import { UiPagination } from './ui.pagination.ts';

describe('UiPagination', () => {
  it('exports the pagination primitive class', () => {
    expect(UiPagination).toBeTypeOf('function');
  });
});
