import type { PipeContext } from './types.js';

export function numberPipe(value: unknown, context: Readonly<PipeContext>, pattern = ''): string {
  const numberValue = toNumber(value);

  if (numberValue === null) {
    return '';
  }

  if (pattern === 'cents' || pattern.includes('.00')) {
    return formatNumber(numberValue, context, 2, 2);
  }

  return formatNumber(numberValue, context, 0, 20);
}

export function currencyPipe(value: unknown, context: Readonly<PipeContext>, currency = context.currency): string {
  const numberValue = toNumber(value);

  if (numberValue === null) {
    return '';
  }

  return new Intl.NumberFormat(context.locale, {
    currency,
    currencyDisplay: 'symbol',
    style: 'currency',
  })
    .format(numberValue)
    .replace(/\u00a0/g, ' ');
}

export function percentPipe(value: unknown, context: Readonly<PipeContext>): string {
  const numberValue = toNumber(value);

  if (numberValue === null) {
    return '';
  }

  return new Intl.NumberFormat(context.locale, {
    maximumFractionDigits: 2,
    style: 'percent',
  }).format(numberValue);
}

export function compactPipe(value: unknown, context: Readonly<PipeContext>): string {
  const numberValue = toNumber(value);

  if (numberValue === null) {
    return '';
  }

  return new Intl.NumberFormat(context.locale, {
    maximumFractionDigits: 1,
    notation: 'compact',
  }).format(numberValue);
}

export function filesizePipe(value: unknown): string {
  const bytes = toNumber(value);

  if (bytes === null || bytes < 0) {
    return '';
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  const formatted = Number.isInteger(size) ? String(size) : size.toFixed(1).replace(/\.0$/, '');
  return `${formatted} ${units[unitIndex]}`;
}

function formatNumber(value: number, context: Readonly<PipeContext>, minimumFractionDigits: number, maximumFractionDigits: number): string {
  return new Intl.NumberFormat(context.locale, {
    maximumFractionDigits,
    minimumFractionDigits,
    useGrouping: true,
  }).format(value);
}

function toNumber(value: unknown): number | null {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return null;
  }

  return numberValue;
}
