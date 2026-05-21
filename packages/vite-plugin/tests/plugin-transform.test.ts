import { describe, expect, it } from 'vitest';
import vanrot from '../src/index.js';
import { createVanrotPluginForTests } from '../src/plugin.js';

describe('vanrot plugin transform', () => {
  it('ignores non-component TypeScript files', async () => {
    const plugin = vanrot();
    const result = await plugin.transform?.call({} as never, 'export const value = 1;', '/repo/src/main.ts');

    expect(result).toBeUndefined();
  });

  it('transforms component entries and registers sibling files', async () => {
    const watched: string[] = [];
    const plugin = createVanrotPluginForTests({
      compile: async () => ({
        code: 'export function createComponent() { return { node: document.createTextNode("ok"), ctx: {} }; }\nconst component = { createComponent };\nexport default component;',
        css: 'p{color:red}',
        diagnostics: [],
      }),
    });

    const result = await plugin.transform?.call(
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
      code: expect.stringContaining('export default component;'),
      map: null,
    });
  });

  it('turns compiler errors into Vite errors', async () => {
    const plugin = createVanrotPluginForTests({
      compile: async () => ({
        code: '',
        css: '',
        diagnostics: [
          {
            severity: 'error',
            code: 'VR005',
            message: 'Unsupported template syntax',
            filePath: '/repo/src/app.component.html',
            line: 3,
            column: 12,
          },
        ],
      }),
    });

    await expect(
      plugin.transform?.call(
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
        diagnostics: [
          {
            severity: 'warning',
            code: 'VR008',
            message: 'CSS selector cannot be scoped',
            filePath: '/repo/src/app.component.css',
            line: 1,
            column: 1,
          },
        ],
      }),
    });

    await plugin.transform?.call(
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

    expect(warnings).toEqual(['/repo/src/app.component.css:1:1 VR008 CSS selector cannot be scoped']);
  });

  it('resolves Vanrot virtual module IDs', async () => {
    const plugin = vanrot();

    await expect(
      plugin.resolveId?.call({} as never, 'virtual:vanrot-css:%2Frepo%2Fsrc%2Fapp.component.ts'),
    ).resolves.toBe('\0vanrot:css:%2Frepo%2Fsrc%2Fapp.component.ts.css');
  });

  it('loads cached virtual CSS', async () => {
    const plugin = createVanrotPluginForTests({
      initialCss: new Map([['/repo/src/app.component.ts', 'p{color:red}']]),
    });

    const css = await plugin.load?.call(
      {} as never,
      '\0vanrot:css:%2Frepo%2Fsrc%2Fapp.component.ts.css',
    );

    expect(css).toBe('p{color:red}');
  });

  it('loads original component source from a virtual source module', async () => {
    const plugin = createVanrotPluginForTests({
      readSource: async (filePath) => `// ${filePath}\nexport class AppComponent {}`,
    });

    const source = await plugin.load?.call(
      {} as never,
      '\0vanrot:source:%2Frepo%2Fsrc%2Fapp.component.ts',
    );

    expect(source).toBe('// /repo/src/app.component.ts\nexport class AppComponent {}');
  });
});
