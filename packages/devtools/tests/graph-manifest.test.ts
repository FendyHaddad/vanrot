import {
  normalizeGraphManifest,
  projectMapGraphSchemaVersion,
  type ProjectGraphManifest,
} from '@/index.js';
import { describe, expect, it } from 'vitest';

function baseManifest(overrides: Partial<ProjectGraphManifest> = {}): ProjectGraphManifest {
  return {
    schemaVersion: projectMapGraphSchemaVersion,
    generatedAt: '2026-05-27T00:00:00.000Z',
    projectRoot: '.',
    sourceRoot: 'src',
    sourceFingerprint: 'sha256:fixture',
    stale: { value: false, reasons: [] },
    roles: {
      components: [],
      pages: [],
      dialogs: [],
      layouts: [],
      widgets: [],
      forms: [],
    },
    i18n: { locales: [], files: [] },
    graph: { nodes: [], edges: [] },
    routes: [],
    compiler: { components: [], diagnostics: [], warnings: [] },
    ai: {
      rulesPath: '.vanrot/ai-rules.md',
      enabledSections: ['project-rules', 'commands'],
      customSections: [],
      configSource: null,
      warnings: [],
      generatedAt: '2026-05-27T00:00:00.000Z',
    },
    ...overrides,
  };
}

describe('normalizeGraphManifest', () => {
  it('accepts a supported graph manifest', () => {
    const normalized = normalizeGraphManifest(baseManifest());

    expect(normalized.status).toBe('ready');
    expect(normalized.manifest?.schemaVersion).toBe(projectMapGraphSchemaVersion);
    expect(normalized.warnings).toEqual([]);
  });

  it('keeps stale manifests renderable with warnings', () => {
    const normalized = normalizeGraphManifest(
      baseManifest({
        stale: { value: true, reasons: ['src/routes.ts changed since vr map'] },
      }),
    );

    expect(normalized.status).toBe('stale');
    expect(normalized.warnings).toEqual(['src/routes.ts changed since vr map']);
    expect(normalized.manifest?.graph.nodes).toEqual([]);
  });

  it('rejects unsupported schemas without throwing', () => {
    const normalized = normalizeGraphManifest({
      ...baseManifest(),
      schemaVersion: 999,
    });

    expect(normalized.status).toBe('unsupported-schema');
    expect(normalized.manifest).toBeNull();
    expect(normalized.warnings).toEqual(['Unsupported graph manifest schema: 999']);
  });
});
