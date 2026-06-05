import { describe, expect, it } from 'vitest';
import { parsePipeExpression } from '../../src/index.js';

describe('parsePipeExpression', () => {
  it('parses pipe chains with args and dotted variants', () => {
    expect(parsePipeExpression('name | fallback("Unknown") | uppercase')).toEqual({
      baseExpression: 'name',
      pipes: [
        {
          name: 'fallback',
          namespace: '',
          variant: '',
          args: ['"Unknown"'],
        },
        {
          name: 'uppercase',
          namespace: '',
          variant: '',
          args: [],
        },
      ],
    });

    expect(parsePipeExpression('createdAt | date.monthDayYear')).toEqual({
      baseExpression: 'createdAt',
      pipes: [
        {
          name: 'date.monthDayYear',
          namespace: 'date',
          variant: 'monthDayYear',
          args: [],
        },
      ],
    });
  });

  it('keeps pipes inside string literals out of the chain', () => {
    expect(parsePipeExpression('label("|") | uppercase')?.baseExpression).toBe('label("|")');
  });

  it('does not mistake logical OR for a valid pipe chain', () => {
    expect(parsePipeExpression('name || fallbackName')).toBeNull();
  });
});
