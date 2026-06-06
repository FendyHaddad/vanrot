import { describe, expect, it } from 'vitest';
import { buildEditorIntelligence } from '../src/project/editor-intelligence.js';
import type { WorkspaceIndex } from '../src/project/workspace.js';

describe('buildEditorIntelligence', () => {
  it('builds the stable schema version 1 payload', () => {
    const workspace: WorkspaceIndex = {
      projectRoot: '/repo',
      routesPath: '/repo/src/routes.ts',
      routes: [
        {
          name: 'home',
          path: '/',
          page: './pages/home.page',
          span: {
            filePath: '/repo/src/routes.ts',
            line: 1,
            column: 14,
            endLine: 1,
            endColumn: 18,
            startOffset: 13,
            endOffset: 17,
          },
        },
      ],
      components: [
        {
          tagName: 'home-page',
          className: 'HomePage',
          path: '/repo/src/pages/home.page.ts',
        },
      ],
      webTypes: {
        sources: [{ path: 'web-types.json', name: 'root' }],
        tags: [{ name: 'vr', description: 'Route shorthand', sourcePath: 'web-types.json' }],
        attributes: [{ name: 'route.home', description: 'Home route', sourcePath: 'web-types.json' }],
      },
      templates: {
        templates: [
          {
            path: '/repo/src/pages/home.page.html',
            tags: [],
            routeRefs: [],
            bracketBindings: [],
            dottedAttributes: [],
          },
        ],
      },
    };

    expect(buildEditorIntelligence(workspace)).toMatchObject({
      schemaVersion: 1,
      projectRoot: '/repo',
      routes: [{ key: 'home', path: '/', page: './pages/home.page' }],
      components: [{ tagName: 'home-page', className: 'HomePage' }],
      templates: [{ path: '/repo/src/pages/home.page.html' }],
      webTypes: { sources: [{ path: 'web-types.json', name: 'root' }] },
      diagnostics: [],
      generatedMetadata: [],
    });
  });
});
