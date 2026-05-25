import { describe, expect, it } from 'vitest';
import { UiEmptyState } from './ui.empty-state.ts';

describe('UiEmptyState', () => {
  it('exports the empty state primitive class', () => {
    expect(UiEmptyState).toBeTypeOf('function');
  });
});
