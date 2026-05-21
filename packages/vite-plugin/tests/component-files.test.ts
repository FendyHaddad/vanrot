import { describe, expect, it } from 'vitest';
import { isComponentEntry, resolveComponentFiles } from '../src/component-files.js';

describe('component files', () => {
  it('detects only Vanrot component TypeScript entries', () => {
    expect(isComponentEntry('/repo/src/app.component.ts')).toBe(true);
    expect(isComponentEntry('/repo/src/app.ts')).toBe(false);
    expect(isComponentEntry('/repo/src/app.component.html')).toBe(false);
    expect(isComponentEntry('virtual:vanrot-source:%2Frepo%2Fsrc%2Fapp.component.ts')).toBe(false);
    expect(isComponentEntry('\0vanrot:source:%2Frepo%2Fsrc%2Fapp.component.ts')).toBe(false);
  });

  it('resolves sibling template and style files', () => {
    expect(resolveComponentFiles('/repo/src/app.component.ts')).toEqual({
      componentPath: '/repo/src/app.component.ts',
      templatePath: '/repo/src/app.component.html',
      stylePath: '/repo/src/app.component.css',
    });
  });
});
