import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createServer } from 'vite';
import { afterEach, describe, expect, it } from 'vitest';
import { findOwnerComponentPath, handleVanrotHotUpdate } from '@/hot-update.js';
import { toPublicCssModuleId, toPublicSourceModuleId } from '@/virtual-modules.js';

const fixtureRoot = resolve(import.meta.dirname, 'fixtures/basic-app');
const componentPath = resolve(fixtureRoot, 'src/app.component.ts');
const templatePath = resolve(fixtureRoot, 'src/app.component.html');
const stylePath = resolve(fixtureRoot, 'src/app.component.css');

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
    expect(findOwnerComponentPath('/repo/src/main.ts')).toBeUndefined();
  });

  it('requests a full reload when a component template changes', async () => {
    const sent: unknown[] = [];
    const invalidated: string[] = [];

    await handleVanrotHotUpdate({
      file: '/repo/src/app.component.html',
      timestamp: Date.now(),
      modules: [],
      server: {
        moduleGraph: {
          getModuleById(id: string) {
            return { id };
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

    expect(invalidated).toContain('/repo/src/app.component.ts');
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
      const before = await server.transformRequest('/src/app.component.ts');
      expect(before?.code).toContain('Increase');

      await writeFile(templatePath, restoreTemplate.replace('Increase', 'Add one'));
      await handleVanrotHotUpdate({
        file: templatePath,
        timestamp: Date.now(),
        modules: [],
        server,
        read: () => readFile(templatePath, 'utf8'),
      });

      const after = await server.transformRequest('/src/app.component.ts');
      expect(after?.code).toContain('Add one');
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

      expect(source?.code).toContain('increment() {');
      expect(source?.code).not.toContain('increment(): void');
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
      await server.transformRequest('/src/app.component.ts');
      await writeFile(stylePath, `${restoreStyle}\n.counter { background: black; }\n`);
      await handleVanrotHotUpdate({
        file: stylePath,
        timestamp: Date.now(),
        modules: [],
        server,
        read: () => readFile(stylePath, 'utf8'),
      });

      await server.transformRequest('/src/app.component.ts');
      const css = await server.transformRequest(toPublicCssModuleId(componentPath));
      expect(css?.code).toContain('background');
      expect(css?.code).toContain('black');
    } finally {
      await server.close();
    }
  });
});
