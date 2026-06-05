import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createServer } from 'vite';
import { afterEach, describe, expect, it } from 'vitest';
import { findOwnerComponentPath, handleVanrotHotUpdate } from '@/hot-update.js';
import {
  toPublicCssModuleId,
  toPublicSourceModuleId,
  toResolvedVirtualModuleId,
} from '@/virtual-modules.js';

const fixtureRoot = resolve(import.meta.dirname, 'fixtures/basic-app');
const componentPath = resolve(fixtureRoot, 'src/app/app.layout.ts');
const templatePath = resolve(fixtureRoot, 'src/app/app.layout.html');
const stylePath = resolve(fixtureRoot, 'src/app/app.layout.css');

let restoreTemplate = '';
let restoreStyle = '';

describe('Vanrot dev reload', () => {
  afterEach(async () => {
    if (restoreTemplate !== '') {
      await writeFile(templatePath, restoreTemplate);
      restoreTemplate = '';
    }

    if (restoreStyle !== '') {
      await writeFile(stylePath, restoreStyle);
      restoreStyle = '';
    }
  });

  it('finds owner component path for template and style files', () => {
    expect(findOwnerComponentPath('/repo/src/app.component.html')).toBe('/repo/src/app.component.ts');
    expect(findOwnerComponentPath('/repo/src/app.component.css')).toBe('/repo/src/app.component.ts');
    expect(findOwnerComponentPath('/repo/src/home.page.html')).toBe('/repo/src/home.page.ts');
    expect(findOwnerComponentPath('/repo/src/home.page.css')).toBe('/repo/src/home.page.ts');
    expect(findOwnerComponentPath('/repo/src/app.layout.html')).toBe('/repo/src/app.layout.ts');
    expect(findOwnerComponentPath('/repo/src/app.layout.css')).toBe('/repo/src/app.layout.ts');
    expect(findOwnerComponentPath('/repo/src/ui.button.html')).toBe('/repo/src/ui.button.ts');
    expect(findOwnerComponentPath('/repo/src/ui.button.css')).toBe('/repo/src/ui.button.ts');
    expect(findOwnerComponentPath('/repo/src/main.ts')).toBeUndefined();
  });

  it('returns and invalidates the owner and virtual CSS modules when component CSS changes', async () => {
    const sent: unknown[] = [];
    const invalidated: string[] = [];
    const ownerModule = { id: '/repo/src/app.component.ts' };
    const cssModuleId = toResolvedVirtualModuleId(toPublicCssModuleId(ownerModule.id));

    if (cssModuleId === undefined) {
      throw new Error('Expected CSS module id to resolve.');
    }

    const cssModule = { id: cssModuleId };

    const result = await handleVanrotHotUpdate({
      file: '/repo/src/app.component.css',
      timestamp: Date.now(),
      modules: [],
      server: {
        config: {
          root: '/repo',
        },
        moduleGraph: {
          getModuleById(id: string) {
            if (id === ownerModule.id) {
              return ownerModule;
            }

            if (id === cssModule.id) {
              return cssModule;
            }

            return undefined;
          },
          async getModuleByUrl(url: string) {
            return url === '/src/app.component.ts' ? ownerModule : undefined;
          },
          invalidateModule(module: { id: string }) {
            invalidated.push(module.id);
          },
        },
        ws: {
          send(message: unknown) {
            sent.push(message);
          },
        },
      },
    } as never);

    expect(result).toEqual([ownerModule, cssModule]);
    expect(invalidated).toEqual(['/repo/src/app.component.ts', cssModule.id]);
    expect(sent).not.toContainEqual({ type: 'full-reload' });
  });

  it('falls back to full reload when no owner module can be resolved', async () => {
    const sent: unknown[] = [];
    const invalidated: string[] = [];

    const result = await handleVanrotHotUpdate({
      file: '/repo/src/app.component.css',
      timestamp: Date.now(),
      modules: [],
      server: {
        config: {
          root: '/repo',
        },
        moduleGraph: {
          getModuleById() {
            return undefined;
          },
          async getModuleByUrl() {
            return undefined;
          },
          invalidateModule(module: { id: string }) {
            invalidated.push(module.id);
          },
        },
        ws: {
          send(message: unknown) {
            sent.push(message);
          },
        },
      },
    } as never);

    expect(result).toEqual([]);
    expect(invalidated).toEqual([]);
    expect(sent).toContainEqual({ type: 'full-reload' });
  });

  it('rebuilds when component HTML changes', async () => {
    restoreTemplate = await readFile(templatePath, 'utf8');
    const server = await createServer({
      root: fixtureRoot,
      logLevel: 'silent',
      server: { middlewareMode: true },
    });

    try {
      const before = await server.transformRequest('/src/app/app.layout.ts');
      expect(before?.code).toContain('route.home');

      await writeFile(templatePath, restoreTemplate.replace('route.home', 'route.about'));
      await handleVanrotHotUpdate({
        file: templatePath,
        timestamp: Date.now(),
        modules: [],
        server,
        read: () => readFile(templatePath, 'utf8'),
      });

      const after = await server.transformRequest('/src/app/app.layout.ts');
      expect(after?.code).toContain('route.about');
    } finally {
      await server.close();
    }
  });

  it('transpiles virtual source modules before serving them in dev', async () => {
    const server = await createServer({
      root: fixtureRoot,
      logLevel: 'silent',
      server: { middlewareMode: true },
    });

    try {
      const source = await server.transformRequest(toPublicSourceModuleId(componentPath));

      expect(source?.code).toContain('route = appRoute;');
      expect(source?.code).toContain('/src/routes.ts');
    } finally {
      await server.close();
    }
  });

  it('rebuilds virtual CSS when component CSS changes', async () => {
    restoreStyle = await readFile(stylePath, 'utf8');
    const server = await createServer({
      root: fixtureRoot,
      logLevel: 'silent',
      server: { middlewareMode: true },
    });

    try {
      await server.transformRequest('/src/app/app.layout.ts');
      await writeFile(stylePath, `${restoreStyle}\n.app { background: black; }\n`);
      await handleVanrotHotUpdate({
        file: stylePath,
        timestamp: Date.now(),
        modules: [],
        server,
        read: () => readFile(stylePath, 'utf8'),
      });

      await server.transformRequest('/src/app/app.layout.ts');
      const cssModuleId = toResolvedVirtualModuleId(toPublicCssModuleId(componentPath));

      if (cssModuleId === undefined) {
        throw new Error('Expected CSS module id to resolve.');
      }

      const css = await server.pluginContainer.load(cssModuleId);
      const cssCode = typeof css === 'object' && css !== null && 'code' in css ? css.code : String(css ?? '');

      expect(cssCode).toContain('background');
      expect(cssCode).toContain('black');
    } finally {
      await server.close();
    }
  });
});
