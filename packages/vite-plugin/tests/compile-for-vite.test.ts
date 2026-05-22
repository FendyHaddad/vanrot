import { describe, expect, it, vi } from 'vitest';
import { compileForVite } from '@/compile-for-vite.js';

describe('compileForVite', () => {
  it('wraps generated JS with CSS import plus default and named component exports', async () => {
    const compile = vi.fn(async () => ({
      js: 'export function createComponent() { return { node: document.createTextNode("ok"), ctx: {} }; }',
      css: 'p[data-vr-app]{color:red}',
      diagnostics: [],
      metadata: {
        componentName: 'AppComponent',
        scopeAttribute: 'data-vr-app',
        features: [],
        componentDependencies: [],
        mappings: [],
      },
    }));

    const result = await compileForVite('/repo/src/app.component.ts', compile);

    expect(compile).toHaveBeenCalledWith('/repo/src/app.component.ts', {
      componentImportSpecifier: 'virtual:vanrot-source:%2Frepo%2Fsrc%2Fapp.component.ts',
    });
    expect(result.code).toContain("import 'virtual:vanrot-css:%2Frepo%2Fsrc%2Fapp.component.ts';");
    expect(result.code).toContain('const component = { createComponent };');
    expect(result.code).toContain('export default component;');
    expect(result.code).toContain('export { component as AppComponent };');
    expect(result.css).toBe('p[data-vr-app]{color:red}');
  });

  it.each([
    {
      componentPath: '/repo/src/pages/home/home.page.ts',
      componentName: 'HomePage',
      expectedExport: 'export { component as HomePage };',
    },
    {
      componentPath: '/repo/src/ui/button/ui.button.ts',
      componentName: 'UiButton',
      expectedExport: 'export { component as UiButton };',
    },
  ])('emits the named compiled export for $componentName', async ({ componentPath, componentName, expectedExport }) => {
    const result = await compileForVite(componentPath, async () => ({
      js: 'export function createComponent() { return { node: document.createTextNode("ok"), ctx: {} }; }',
      css: '',
      diagnostics: [],
      metadata: {
        componentName,
        scopeAttribute: 'data-vr-role',
        features: [],
        componentDependencies: [],
        mappings: [],
      },
    }));

    expect(result.code).toContain(expectedExport);
    expect(result.code).toContain('export default component;');
  });

  it('returns JavaScript and CSS sourcemaps from compiler mappings', async () => {
    const result = await compileForVite('/repo/src/app.component.ts', async () => ({
      js: 'export function createComponent() { return { node: document.createTextNode("ok"), ctx: {} }; }',
      css: '.app[data-vr-a] { color: red; }',
      diagnostics: [],
      metadata: {
        componentName: 'AppComponent',
        scopeAttribute: 'data-vr-a',
        features: [],
        componentDependencies: [],
        mappings: [
          {
            generatedFile: 'js',
            generatedLine: 1,
            generatedColumn: 0,
            sourceFilePath: '/repo/src/app.component.html',
            sourceLine: 1,
            sourceColumn: 0,
          },
          {
            generatedFile: 'css',
            generatedLine: 1,
            generatedColumn: 0,
            sourceFilePath: '/repo/src/app.component.css',
            sourceLine: 1,
            sourceColumn: 0,
          },
        ],
      },
    }));

    expect(result.map).toMatchObject({
      version: 3,
      file: '/repo/src/app.component.ts',
      sources: ['/repo/src/app.component.html'],
    });
    expect(result.cssMap).toMatchObject({
      version: 3,
      file: '/repo/src/app.component.css',
      sources: ['/repo/src/app.component.css'],
    });
  });
});
