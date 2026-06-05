import { describe, expect, it } from 'vitest';
import { compactPipe, currencyPipe, filesizePipe, numberPipe, percentPipe } from '../src/index.js';

const context = {
  locale: 'en-US',
  timezone: 'UTC',
  currency: 'USD',
};

describe('number pipes', () => {
  it('formats numbers, currency, percent, compact values, and file sizes', () => {
    expect(numberPipe(1234.5, context, 'thousands')).toBe('1,234.5');
    expect(numberPipe(1234.5, context, 'cents')).toBe('1,234.50');
    expect(numberPipe(1234.5, context, '0,0.00')).toBe('1,234.50');
    expect(currencyPipe(1234.5, context)).toBe('$1,234.50');
    expect(currencyPipe(1234.5, context, 'MYR')).toBe('MYR 1,234.50');
    expect(percentPipe(0.25, context)).toBe('25%');
    expect(compactPipe(12500, context)).toBe('12.5K');
    expect(filesizePipe(1536)).toBe('1.5 KB');
  });
});
