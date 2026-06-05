export function maskPipe(value: unknown, pattern: string): string {
  const digits = String(value ?? '').replace(/\D/g, '');
  let digitIndex = 0;
  let output = '';

  for (const char of pattern) {
    if (char !== '#') {
      output += char;
      continue;
    }

    const digit = digits[digitIndex];

    if (digit === undefined) {
      break;
    }

    output += digit;
    digitIndex += 1;
  }

  return output;
}
