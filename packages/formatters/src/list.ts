export function joinPipe(value: unknown, separator = ', '): string {
  if (!Array.isArray(value)) {
    return '';
  }

  return value.map((item) => String(item)).join(separator);
}

export function countPipe(value: unknown): number {
  if (Array.isArray(value) || typeof value === 'string') {
    return value.length;
  }

  if (value instanceof Set || value instanceof Map) {
    return value.size;
  }

  return 0;
}

export function pluralPipe(value: unknown, singular: string, plural = `${singular}s`): string {
  const count = Number(value);

  if (!Number.isFinite(count)) {
    return `0 ${plural}`;
  }

  return `${count} ${count === 1 ? singular : plural}`;
}
