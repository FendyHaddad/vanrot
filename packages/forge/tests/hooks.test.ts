import { describe, expect, it } from 'vitest';
import {
  createForgeHookRegistry,
  runForgeAiMetadataHooks,
  runForgeBuildMetadataHooks,
  runForgeDevtoolsMetadataHooks,
  runForgeRouteMetadataHooks,
  type ForgeHookContext,
} from '../src/index.js';

describe('Forge hooks', () => {
  it('runs first-party metadata hooks in registration order', async () => {
    const registry = createForgeHookRegistry([
      {
        name: 'router',
        routeMetadata: () => ({ routes: 1 }),
        buildMetadata: () => ({ assets: 2 }),
      },
      {
        name: 'ai',
        aiMetadata: () => ({ pages: 3 }),
        devtoolsMetadata: () => ({ graph: 4 }),
      },
    ]);
    const context = createHookContext();

    await expect(runForgeRouteMetadataHooks(registry, context)).resolves.toEqual([
      { hookName: 'router', metadata: { routes: 1 } },
    ]);
    await expect(runForgeBuildMetadataHooks(registry, context)).resolves.toEqual([
      { hookName: 'router', metadata: { assets: 2 } },
    ]);
    await expect(runForgeAiMetadataHooks(registry, context)).resolves.toEqual([
      { hookName: 'ai', metadata: { pages: 3 } },
    ]);
    await expect(runForgeDevtoolsMetadataHooks(registry, context)).resolves.toEqual([
      { hookName: 'ai', metadata: { graph: 4 } },
    ]);
  });

  it('rejects generic bundler hook names in the first-party API', () => {
    expect(() =>
      createForgeHookRegistry([
        {
          name: 'generic',
          transform() {
            return null;
          },
        } as never,
      ]),
    ).toThrow('Unsupported Forge hook property: transform');
  });
});

function createHookContext(): ForgeHookContext {
  return {
    root: '/app',
    sourceRoot: 'src',
    mode: 'build',
    graph: {
      root: '/app',
      sourceRoot: 'src',
      files: [],
      roleFiles: [],
      routes: { routeFiles: [], pages: [] },
      diagnostics: [],
    },
  };
}
