import { describe, expect, it } from 'vitest';
import { UiList } from './ui.list.ts';

describe('UiList', () => {
  it('exports the list primitive class', () => {
    expect(UiList).toBeTypeOf('function');
  });
});
