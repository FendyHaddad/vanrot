import { describe, expect, it } from 'vitest';
import { isVanrotTemplateFile } from '../src/template-files.js';

describe('isVanrotTemplateFile', () => {
  it('accepts component/page/layout templates', () => {
    expect(isVanrotTemplateFile('home.component.html')).toBe(true);
    expect(isVanrotTemplateFile('src/pages/about.page.html')).toBe(true);
    expect(isVanrotTemplateFile('shell.layout.html')).toBe(true);
  });

  it('rejects non-html files', () => {
    expect(isVanrotTemplateFile('home.component.ts')).toBe(false);
  });

  it('rejects entry and doc html by exact name', () => {
    expect(isVanrotTemplateFile('index.html')).toBe(false);
    expect(isVanrotTemplateFile('panel.html')).toBe(false);
    expect(isVanrotTemplateFile('devtools.html')).toBe(false);
    expect(isVanrotTemplateFile('landing-page-design.html')).toBe(false);
  });

  it('rejects presentation html by suffix', () => {
    expect(isVanrotTemplateFile('vanrot-presentation.html')).toBe(false);
    expect(isVanrotTemplateFile('docs/x-presentation.html')).toBe(false);
  });

  it('normalizes windows separators', () => {
    expect(isVanrotTemplateFile('src\\pages\\about.page.html')).toBe(true);
  });
});
