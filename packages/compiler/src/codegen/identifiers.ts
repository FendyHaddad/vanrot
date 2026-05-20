export class IdentifierAllocator {
  private readonly counts = new Map<string, number>();

  next(baseName: string): string {
    const normalized = normalizeIdentifierBase(baseName);
    const count = this.counts.get(normalized) ?? 0;

    this.counts.set(normalized, count + 1);

    return `${normalized}${count}`;
  }
}

function normalizeIdentifierBase(value: string): string {
  const parts = value
    .split(/[^a-zA-Z0-9]+/)
    .filter((part) => part.length > 0)
    .map((part, index) => {
      if (index === 0) {
        return part.toLowerCase();
      }

      return `${part[0]?.toUpperCase() ?? ''}${part.slice(1)}`;
    });

  const baseName = parts.join('');

  if (/^[a-zA-Z_$]/.test(baseName)) {
    return baseName;
  }

  return 'element';
}
