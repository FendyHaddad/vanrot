import { describe, expect, it } from 'vitest';
import { datePattern, maskPattern, numberPattern } from '../src/index.js';

describe('formatter presets', () => {
  it('creates namespace-aware preset metadata', () => {
    expect(datePattern('dd/MM/yyyy')).toEqual({
      kind: 'date-pattern',
      namespace: 'date',
      pattern: 'dd/MM/yyyy',
    });

    expect(numberPattern('(0,0.00)')).toEqual({
      kind: 'number-pattern',
      namespace: 'number',
      pattern: '(0,0.00)',
    });

    expect(maskPattern('###-#######')).toEqual({
      kind: 'mask-pattern',
      namespace: 'mask',
      pattern: '###-#######',
    });
  });
});
