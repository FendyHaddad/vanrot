import { describe, expect, it } from 'vitest';
import { datePipe, datetimePipe, durationPipe, relativeTimePipe, timePipe } from '../src/index.js';

const context = {
  locale: 'en-US',
  timezone: 'UTC',
  currency: 'USD',
};

describe('date and time pipes', () => {
  it('supports named and custom date patterns', () => {
    const value = new Date('2026-06-05T10:30:00.000Z');

    expect(datePipe(value, context, 'monthDayYear')).toBe('06/05/2026');
    expect(datePipe(value, context, 'dayMonthYear')).toBe('05/06/2026');
    expect(datePipe(value, context, 'monthYear')).toBe('06/2026');
    expect(datePipe(value, context, 'MM/yy')).toBe('06/26');
  });

  it('formats time, datetime, relative time, and duration', () => {
    const value = new Date('2026-06-05T10:30:00.000Z');

    expect(timePipe(value, context, 'HH:mm')).toBe('10:30');
    expect(datetimePipe(value, context, 'dd/MM/yyyy HH:mm')).toBe('05/06/2026 10:30');
    expect(relativeTimePipe(Date.now() - 60_000, context)).toMatch(/minute/);
    expect(durationPipe(3_660_000)).toBe('1h 1m');
  });
});
