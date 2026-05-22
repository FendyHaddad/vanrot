import { describe, expect, it } from 'vitest';
import { normalizeOptions } from '@/options.js';

describe('normalizeOptions', () => {
  it('uses the component file default include pattern', () => {
    const options = normalizeOptions({}, '/repo/app');

    expect(options.root).toBe('/repo/app');
    expect(options.include.some((pattern) => pattern.test('/repo/app/src/app.component.ts'))).toBe(
      true,
    );
    expect(options.include.some((pattern) => pattern.test('/repo/app/src/pages/home/home.page.ts'))).toBe(
      true,
    );
    expect(options.include.some((pattern) => pattern.test('/repo/app/src/ui/button/ui.button.ts'))).toBe(
      true,
    );
    expect(options.include.some((pattern) => pattern.test('/repo/app/src/app.ts'))).toBe(false);
  });

  it('uses sourceRoot to scope default include patterns', () => {
    const options = normalizeOptions({ sourceRoot: 'client' }, '/repo/app');

    expect(options.include.some((pattern) => pattern.test('/repo/app/client/home.page.ts'))).toBe(
      true,
    );
    expect(options.include.some((pattern) => pattern.test('/repo/app/src/home.page.ts'))).toBe(
      false,
    );
  });
});
