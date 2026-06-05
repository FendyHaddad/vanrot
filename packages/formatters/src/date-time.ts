import type { PipeContext } from './types.js';

const DATE_PRESETS = {
  monthDayYear: 'MM/dd/yyyy',
  dayMonthYear: 'dd/MM/yyyy',
  monthYear: 'MM/yyyy',
  short: 'MM/dd/yy',
  long: 'MMMM d, yyyy',
} as const;

export function datePipe(value: unknown, context: Readonly<PipeContext>, pattern = 'monthDayYear'): string {
  const date = toDate(value);

  if (date === null) {
    return '';
  }

  return formatDatePattern(date, DATE_PRESETS[pattern as keyof typeof DATE_PRESETS] ?? pattern, context);
}

export function timePipe(value: unknown, context: Readonly<PipeContext>, pattern = 'HH:mm'): string {
  const date = toDate(value);

  if (date === null) {
    return '';
  }

  return formatDatePattern(date, pattern, context);
}

export function datetimePipe(value: unknown, context: Readonly<PipeContext>, pattern = 'MM/dd/yyyy HH:mm'): string {
  const date = toDate(value);

  if (date === null) {
    return '';
  }

  return formatDatePattern(date, pattern, context);
}

export function relativeTimePipe(value: unknown, _context: Readonly<PipeContext>, now = Date.now()): string {
  const date = toDate(value);

  if (date === null) {
    return '';
  }

  const diffMs = now - date.getTime();
  const absMinutes = Math.max(1, Math.round(Math.abs(diffMs) / 60_000));
  const suffix = diffMs >= 0 ? 'ago' : 'from now';

  if (absMinutes < 60) {
    return `${absMinutes} minute${absMinutes === 1 ? '' : 's'} ${suffix}`;
  }

  const hours = Math.round(absMinutes / 60);
  return `${hours} hour${hours === 1 ? '' : 's'} ${suffix}`;
}

export function durationPipe(value: unknown): string {
  const totalMs = Number(value);

  if (!Number.isFinite(totalMs) || totalMs < 0) {
    return '';
  }

  const totalMinutes = Math.floor(totalMs / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}m`;
  }

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}

export function formatDatePattern(date: Date, pattern: string, context: Readonly<PipeContext>): string {
  const parts = createDateParts(date, context);

  return pattern
    .replaceAll('MMMM', parts.longMonth)
    .replaceAll('yyyy', parts.year)
    .replaceAll('yy', parts.shortYear)
    .replaceAll('MM', parts.month)
    .replaceAll('dd', parts.day)
    .replaceAll('d', parts.dayNumber)
    .replaceAll('HH', parts.hours)
    .replaceAll('mm', parts.minutes);
}

function createDateParts(date: Date, context: Readonly<PipeContext>): {
  day: string;
  dayNumber: string;
  hours: string;
  longMonth: string;
  minutes: string;
  month: string;
  shortYear: string;
  year: string;
} {
  const formatter = new Intl.DateTimeFormat(context.locale, {
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    month: '2-digit',
    timeZone: context.timezone,
    year: 'numeric',
  });
  const parts = Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));
  const year = parts.year ?? String(date.getUTCFullYear());
  const month = parts.month ?? pad(date.getUTCMonth() + 1);
  const day = parts.day ?? pad(date.getUTCDate());
  const hours = parts.hour === '24' ? '00' : parts.hour ?? pad(date.getUTCHours());
  const minutes = parts.minute ?? pad(date.getUTCMinutes());
  const longMonth = new Intl.DateTimeFormat(context.locale, { month: 'long', timeZone: context.timezone }).format(date);

  return {
    day,
    dayNumber: String(Number(day)),
    hours,
    longMonth,
    minutes,
    month,
    shortYear: year.slice(-2),
    year,
  };
}

function toDate(value: unknown): Date | null {
  const date = value instanceof Date || typeof value === 'number' ? new Date(value) : new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}
