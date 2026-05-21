import { describe, expect, it } from 'vitest';
import { isComponentEntry, resolveComponentFiles } from '@/component-files.js';

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

  it('recognizes page entries', () => {
    expect(isComponentEntry('/repo/src/pages/home/home.page.ts')).toBe(true);
    expect(resolveComponentFiles('/repo/src/pages/home/home.page.ts')).toEqual({
      componentPath: '/repo/src/pages/home/home.page.ts',
      templatePath: '/repo/src/pages/home/home.page.html',
      stylePath: '/repo/src/pages/home/home.page.css',
    });
  });

  it('recognizes button primitive entries', () => {
    expect(isComponentEntry('/repo/src/ui/button/ui.button.ts')).toBe(true);
    expect(resolveComponentFiles('/repo/src/ui/button/ui.button.ts')).toEqual({
      componentPath: '/repo/src/ui/button/ui.button.ts',
      templatePath: '/repo/src/ui/button/ui.button.html',
      stylePath: '/repo/src/ui/button/ui.button.css',
    });
  });
});
