import { describe, expect, it } from 'vitest';
import { maskPipe } from '../src/index.js';

describe('maskPipe', () => {
  it('applies # placeholders and leaves literal pattern characters intact', () => {
    expect(maskPipe('0123456789', '###-#######')).toBe('012-3456789');
    expect(maskPipe('1234', '**** ####')).toBe('**** 1234');
  });
});
