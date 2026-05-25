import { describe, expect, it } from 'vitest';
import { UiStat } from './ui.stat.ts';

describe('UiStat', () => {
  it('exports the stat primitive class', () => {
    expect(UiStat).toBeTypeOf('function');
  });
});
