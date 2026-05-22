import { describe, expect, it } from 'vitest';
import type { Plugin } from 'vite';
import vanrot from '@/index.js';
import { createVanrotPluginForTests } from '@/plugin.js';

type TransformHook = (this: unknown, code: string, id: string) => unknown;
type ResolveIdHook = (this: unknown, source: string, importer?: string) => unknown;
type LoadHook = (this: unknown, id: string) => unknown;

function getTransformHook(plugin: Plugin): TransformHook {
  const hook = plugin.transform;

  if (typeof hook === 'function') {
    return hook as TransformHook;
  }

  if (hook !== undefined && typeof hook === 'object' && 'handler' in hook) {
    return hook.handler as TransformHook;
  }

  throw new Error('Expected transform hook.');
}

function getResolveIdHook(plugin: Plugin): ResolveIdHook {
  const hook = plugin.resolveId;

  if (typeof hook === 'function') {
    return hook as ResolveIdHook;
  }

  if (hook !== undefined && typeof hook === 'object' && 'handler' in hook) {
    return hook.handler as ResolveIdHook;
  }

  throw new Error('Expected resolveId hook.');
}

function getLoadHook(plugin: Plugin): LoadHook {
  const hook = plugin.load;

  if (typeof hook === 'function') {
    return hook as LoadHook;
  }

  if (hook !== undefined && typeof hook === 'object' && 'handler' in hook) {
    return hook.handler as LoadHook;
  }

  throw new Error('Expected load hook.');
}

function createTestMap(file: string, sources: string[] = []) {
  return {
    version: 3 as const,
    file,
    sources,
    names: [],
    mappings: '',
  };
}

describe('vanrot plugin transform', () => {
  it('ignores non-component TypeScript files', async () => {
    const plugin = vanrot();
    const result = await getTransformHook(plugin).call(
      {} as never,
      'export const value = 1;',
      '/repo/src/main.ts',
    );

    expect(result).toBeUndefined();
  });

  it('transforms component entries and registers sibling files', async () => {
    const watched: string[] = [];
    const plugin = createVanrotPluginForTests({
      compile: async () => ({
        code: 'export function createComponent() { return { node: document.createTextNode("ok"), ctx: {} }; }\nconst component = { createComponent };\nexport { component as AppComponent };\nexport default component;',
        css: 'p{color:red}',
        map: createTestMap('/repo/src/app.component.ts'),
        cssMap: createTestMap('/repo/src/app.component.css'),
        diagnostics: [],
      }),
    });

    const result = await getTransformHook(plugin).call(
      {
        addWatchFile(filePath: string) {
          watched.push(filePath);
        },
        error(error: string) {
          throw new Error(error);
        },
        warn() {},
      } as never,
      'export class AppComponent {}',
      '/repo/src/app.component.ts',
    );

    expect(watched).toEqual(['/repo/src/app.component.html', '/repo/src/app.component.css']);
    expect(result).toEqual({
      code: expect.stringContaining('export { component as AppComponent };'),
      map: createTestMap('/repo/src/app.component.ts'),
    });
  });

  it('transforms page entries and registers sibling files', async () => {
    const watched: string[] = [];
    const plugin = createVanrotPluginForTests({
      compile: async () => ({
        code: 'export function createComponent() { return { node: document.createTextNode("page"), ctx: {} }; }\nconst component = { createComponent };\nexport { component as HomePage };\nexport default component;',
        css: 'main{display:block}',
        map: createTestMap('/repo/src/pages/home/home.page.ts'),
        cssMap: createTestMap('/repo/src/pages/home/home.page.css'),
        diagnostics: [],
      }),
    });

    const result = await getTransformHook(plugin).call(
      {
        addWatchFile(filePath: string) {
          watched.push(filePath);
        },
        error(error: string) {
          throw new Error(error);
        },
        warn() {},
      } as never,
      'export class HomePage {}',
      '/repo/src/pages/home/home.page.ts',
    );

    expect(watched).toEqual([
      '/repo/src/pages/home/home.page.html',
      '/repo/src/pages/home/home.page.css',
    ]);
    expect(result).toEqual({
      code: expect.stringContaining('export { component as HomePage };'),
      map: createTestMap('/repo/src/pages/home/home.page.ts'),
    });
  });

  it('transforms button primitive entries and registers sibling files', async () => {
    const watched: string[] = [];
    const plugin = createVanrotPluginForTests({
      compile: async () => ({
        code: 'export function createComponent() { return { node: document.createTextNode("button"), ctx: {} }; }\nconst component = { createComponent };\nexport { component as UiButton };\nexport default component;',
        css: '.vr-button{display:inline-flex}',
        map: createTestMap('/repo/src/ui/button/ui.button.ts'),
        cssMap: createTestMap('/repo/src/ui/button/ui.button.css'),
        diagnostics: [],
      }),
    });

    const result = await getTransformHook(plugin).call(
      {
        addWatchFile(filePath: string) {
          watched.push(filePath);
        },
        error(error: string) {
          throw new Error(error);
        },
        warn() {},
      } as never,
      'export class UiButton {}',
      '/repo/src/ui/button/ui.button.ts',
    );

    expect(watched).toEqual([
      '/repo/src/ui/button/ui.button.html',
      '/repo/src/ui/button/ui.button.css',
    ]);
    expect(result).toEqual({
      code: expect.stringContaining('export { component as UiButton };'),
      map: createTestMap('/repo/src/ui/button/ui.button.ts'),
    });
  });

  it('turns compiler errors into Vite errors', async () => {
    const plugin = createVanrotPluginForTests({
      compile: async () => ({
        code: '',
        css: '',
        map: createTestMap('/repo/src/app.component.ts'),
        cssMap: createTestMap('/repo/src/app.component.css'),
        diagnostics: [
          {
            severity: 'error',
            code: 'VR005',
            message: 'Unsupported template syntax',
            filePath: '/repo/src/app.component.html',
            line: 3,
            column: 12,
            endLine: 3,
            endColumn: 12,
            sourceText: '',
            codeFrame: '',
            suggestion: 'Use supported syntax.',
            docsPath: '/docs/compiler/template-syntax',
          },
        ],
      }),
    });

    await expect(
      getTransformHook(plugin).call(
        {
          addWatchFile() {},
          error(error: string) {
            throw new Error(error);
          },
          warn() {},
        } as never,
        'export class AppComponent {}',
        '/repo/src/app.component.ts',
      ),
    ).rejects.toThrow('/repo/src/app.component.html:3:12 VR005 Unsupported template syntax');
  });

  it('turns compiler warnings into Vite warnings', async () => {
    const warnings: string[] = [];
    const plugin = createVanrotPluginForTests({
      compile: async () => ({
        code: 'export function createComponent() { return { node: document.createTextNode("ok"), ctx: {} }; }\nconst component = { createComponent };\nexport default component;',
        css: '',
        map: createTestMap('/repo/src/app.component.ts'),
        cssMap: createTestMap('/repo/src/app.component.css'),
        diagnostics: [
          {
            severity: 'warning',
            code: 'VR008',
            message: 'CSS selector cannot be scoped',
            filePath: '/repo/src/app.component.css',
            line: 1,
            column: 1,
            endLine: 1,
            endColumn: 1,
            sourceText: '',
            codeFrame: '',
            suggestion: 'Use scoped CSS.',
            docsPath: '/docs/compiler/scoped-css',
          },
        ],
      }),
    });

    await getTransformHook(plugin).call(
      {
        addWatchFile() {},
        error(error: string) {
          throw new Error(error);
        },
        warn(warning: string) {
          warnings.push(warning);
        },
      } as never,
      'export class AppComponent {}',
      '/repo/src/app.component.ts',
    );

    expect(warnings).toEqual([
      [
        '/repo/src/app.component.css:1:1 VR008 CSS selector cannot be scoped',
        'Suggestion: Use scoped CSS.',
        'Docs: /docs/compiler/scoped-css',
      ].join('\n'),
    ]);
  });

  it('resolves Vanrot virtual module IDs', async () => {
    const plugin = vanrot();

    await expect(
      getResolveIdHook(plugin).call(
        {} as never,
        'virtual:vanrot-css:%2Frepo%2Fsrc%2Fapp.component.ts',
      ),
    ).resolves.toBe('\0vanrot:css:%2Frepo%2Fsrc%2Fapp.component.ts.css');
  });

  it('resolves relative imports from virtual source modules', async () => {
    const plugin = vanrot();

    await expect(
      getResolveIdHook(plugin).call(
        {} as never,
        '../routes.ts',
        '\0vanrot:source:%2Frepo%2Fsrc%2Fapp%2Fapp.component.ts',
      ),
    ).resolves.toBe('/repo/src/routes.ts');
  });

  it('loads cached virtual CSS', async () => {
    const plugin = createVanrotPluginForTests({
      initialCss: new Map([['/repo/src/app.component.ts', 'p{color:red}']]),
    });

    const css = await getLoadHook(plugin).call(
      {} as never,
      '\0vanrot:css:%2Frepo%2Fsrc%2Fapp.component.ts.css',
    );

    expect(css).toEqual({
      code: 'p{color:red}',
      map: null,
    });
  });

  it('returns component and virtual CSS sourcemaps', async () => {
    const plugin = createVanrotPluginForTests({
      compile: async () => ({
        code: 'export function createComponent() { return { node: document.createTextNode("ok"), ctx: {} }; }\nconst component = { createComponent };\nexport default component;',
        css: '.app{color:red}',
        map: {
          version: 3,
          file: '/repo/src/app.component.ts',
          sources: ['/repo/src/app.component.html'],
          names: [],
          mappings: 'AAAA',
        },
        cssMap: {
          version: 3,
          file: '/repo/src/app.component.css',
          sources: ['/repo/src/app.component.css'],
          names: [],
          mappings: 'AAAA',
        },
        diagnostics: [],
      }),
    });

    const transformResult = await getTransformHook(plugin).call(
      {
        addWatchFile() {},
        error(error: string) {
          throw new Error(error);
        },
        warn() {},
      } as never,
      'export class AppComponent {}',
      '/repo/src/app.component.ts',
    );

    expect(transformResult).toEqual(
      expect.objectContaining({
        code: expect.stringContaining('export default component;'),
        map: expect.objectContaining({
          sources: ['/repo/src/app.component.html'],
        }),
      }),
    );

    const css = await getLoadHook(plugin).call(
      {} as never,
      '\0vanrot:css:%2Frepo%2Fsrc%2Fapp.component.ts.css',
    );

    expect(css).toEqual({
      code: '.app{color:red}',
      map: expect.objectContaining({
        sources: ['/repo/src/app.component.css'],
      }),
    });
  });

  it('loads original component source from a virtual source module', async () => {
    const plugin = createVanrotPluginForTests({
      readSource: async (filePath) => `// ${filePath}\nexport class AppComponent {}`,
    });

    const source = await getLoadHook(plugin).call(
      {} as never,
      '\0vanrot:source:%2Frepo%2Fsrc%2Fapp.component.ts',
    );

    expect(source).toBe('// /repo/src/app.component.ts\nexport class AppComponent {}');
  });
});
