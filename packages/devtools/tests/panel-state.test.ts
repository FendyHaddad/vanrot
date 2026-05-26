import { projectMapGraphSchemaVersion, type ProjectGraphManifest } from '@/index.js';
import { createPanelState } from '@/panel/state.js';
import { describe, expect, it } from 'vitest';

function manifest(): ProjectGraphManifest {
  return {
    schemaVersion: projectMapGraphSchemaVersion,
    generatedAt: '2026-05-27T00:00:00.000Z',
    projectRoot: '.',
    sourceRoot: 'src',
    sourceFingerprint: 'sha256:fixture',
    stale: { value: false, reasons: [] },
    roles: { components: [], pages: [], dialogs: [], layouts: [], widgets: [], forms: [] },
    i18n: { locales: [], files: [] },
    graph: {
      nodes: [
        { id: 'route:home', kind: 'route', label: 'home', path: null, metadata: { path: '/' } },
        { id: 'page:src/pages/home.page.ts', kind: 'page', label: 'home', path: 'src/pages/home.page.ts', role: 'page', metadata: {} },
      ],
      edges: [
        { id: 'route:home->page:src/pages/home.page.ts:route-to-page', from: 'route:home', to: 'page:src/pages/home.page.ts', kind: 'route-to-page' },
      ],
    },
    routes: [
      { id: 'route:home', ref: 'home', path: '/', parentId: null, layoutNodeId: null, pageNodeId: 'page:src/pages/home.page.ts', childIds: [], metadata: {} },
    ],
    compiler: { components: [], diagnostics: [], warnings: [] },
    ai: { rulesPath: '.vanrot/ai-rules.md', enabledSections: [], customSections: [], configSource: null, warnings: [], generatedAt: '2026-05-27T00:00:00.000Z' },
  };
}

describe('createPanelState', () => {
  it('summarizes app graph metadata for rendering', () => {
    const state = createPanelState({ status: 'ready', manifest: manifest(), warnings: [] });

    expect(state.summary).toEqual({
      statusLabel: 'Ready',
      nodeCount: 2,
      edgeCount: 1,
      routeCount: 1,
      generatedAt: '2026-05-27T00:00:00.000Z',
    });
    expect(state.routes).toEqual([{ ref: 'home', path: '/', page: 'page:src/pages/home.page.ts' }]);
  });

  it('keeps missing manifest actionable', () => {
    const state = createPanelState({
      status: 'missing',
      manifest: null,
      warnings: ['Missing .vanrot/project-map.json. Run vr map.'],
    });

    expect(state.summary.statusLabel).toBe('Missing manifest');
    expect(state.emptyState).toBe('Missing .vanrot/project-map.json. Run vr map.');
  });
});
