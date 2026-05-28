import { describe, expect, it } from 'vitest';
import { resolveRoutesPath } from '../src/project/project-root.js';

describe('resolveRoutesPath', () => {
  it('joins the project root with src/routes.ts', () => {
    expect(resolveRoutesPath('/work/app')).toBe('/work/app/src/routes.ts');
  });

  it('normalizes a trailing slash', () => {
    expect(resolveRoutesPath('/work/app/')).toBe('/work/app/src/routes.ts');
  });
});
