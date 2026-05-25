import { describe, expect, it } from 'vitest';
import { UiListItem } from './ui.list-item.ts';

describe('UiListItem', () => {
  it('exports the list item primitive class', () => {
    expect(UiListItem).toBeTypeOf('function');
  });
});
