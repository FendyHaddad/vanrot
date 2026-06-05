export function uppercasePipe(value: unknown): string {
  return toDisplayString(value).toUpperCase();
}

export function lowercasePipe(value: unknown): string {
  return toDisplayString(value).toLowerCase();
}

export function titlecasePipe(value: unknown): string {
  return toDisplayString(value).replace(/\S+/g, (word) => `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`);
}

export function sentencecasePipe(value: unknown): string {
  const text = toDisplayString(value).toLowerCase();

  if (text.length === 0) {
    return '';
  }

  return `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
}

export function truncatePipe(value: unknown, length: number): string {
  const text = toDisplayString(value);

  if (!Number.isFinite(length) || length < 0) {
    return text;
  }

  if (text.length <= length) {
    return text;
  }

  if (length <= 3) {
    return text.slice(0, length);
  }

  return `${text.slice(0, length)}...`;
}

export function fallbackPipe(value: unknown, fallback: string): string {
  const text = toDisplayString(value);

  if (text.trim().length === 0) {
    return fallback;
  }

  return text;
}

export function initialsPipe(value: unknown): string {
  return toDisplayString(value)
    .split(/\s+/)
    .filter((word) => word.length > 0)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}

export function toDisplayString(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value);
}
