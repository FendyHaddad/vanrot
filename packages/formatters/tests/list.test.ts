import { describe, expect, it } from 'vitest';
import { countPipe, joinPipe, pluralPipe } from '../src/index.js';

describe('list pipes', () => {
  it('formats arrays and counts', () => {
    expect(joinPipe(['alpha', 'beta'], ', ')).toBe('alpha, beta');
    expect(countPipe(['alpha', 'beta'])).toBe(2);
    expect(pluralPipe(1, 'item', 'items')).toBe('1 item');
    expect(pluralPipe(3, 'item', 'items')).toBe('3 items');
  });
});
