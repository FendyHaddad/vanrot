import { describe, expect, it, vi } from 'vitest';
import { compileForVite } from '../src/compile-for-vite.js';

describe('compileForVite', () => {
  it('wraps generated JS with CSS import and default component export', async () => {
    const compile = vi.fn(async () => ({
      js: 'export function createComponent() { return { node: document.createTextNode("ok"), ctx: {} }; }',
      css: 'p[data-vr-app]{color:red}',
      diagnostics: [],
      metadata: {
        componentName: 'AppComponent',
        scopeAttribute: 'data-vr-app',
        features: [],
      },
    }));

    const result = await compileForVite('/repo/src/app.component.ts', compile);

    expect(compile).toHaveBeenCalledWith('/repo/src/app.component.ts', {
      componentImportSpecifier: 'virtual:vanrot-source:%2Frepo%2Fsrc%2Fapp.component.ts',
    });
    expect(result.code).toContain("import 'virtual:vanrot-css:%2Frepo%2Fsrc%2Fapp.component.ts';");
    expect(result.code).toContain('const component = { createComponent };');
    expect(result.code).toContain('export default component;');
    expect(result.css).toBe('p[data-vr-app]{color:red}');
  });
});
