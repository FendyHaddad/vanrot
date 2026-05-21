import { describe, expect, it } from 'vitest';
import { normalizeOptions } from '@/options.js';

describe('normalizeOptions', () => {
  it('uses the component file default include pattern', () => {
    const options = normalizeOptions({}, '/repo/app');

    expect(options.root).toBe('/repo/app');
    expect(options.include.some((pattern) => pattern.test('/repo/app/src/app.component.ts'))).toBe(
      true,
    );
    expect(options.include.some((pattern) => pattern.test('/repo/app/src/app.ts'))).toBe(false);
  });
});
