import { createAiKnowledgeBundle, createVanrotMcpServer } from '../src/index.js';
import { vanrotMcpResourceDefinitions } from '../src/mcp/server.js';
import { describe, expect, it } from 'vitest';

describe('Vanrot MCP server', () => {
  it('creates bundle-backed resource handlers', () => {
    const bundle = createAiKnowledgeBundle(
      {
        root: process.cwd(),
        vanrotVersion: '0.0.0',
        sourceFingerprint: 'sha256-demo',
        sources: [],
        frameworkReference: {
          packages: [{ name: '@vanrot/runtime', summary: 'Runtime package.' }],
          publicExports: [],
          commands: [{ name: 'create', usage: 'vr create <name>', summary: 'Create app.' }],
          diagnostics: [{ code: 'VR001', summary: 'Compiler diagnostic.' }],
          generatedFiles: [],
          conventions: [{ id: 'signals-for-state', title: 'Signals', summary: 'Use signals for state.' }],
          examples: [],
          limitations: [],
          maturity: [],
          routeMetadata: [],
          deployment: {},
        },
        siteData: {
          articles: [],
          primitiveDocs: [],
          commands: [],
          packages: [],
          diagnostics: {},
        },
      },
      { now: () => new Date('2026-05-27T00:00:00.000Z') },
    );

    const server = createVanrotMcpServer(bundle);

    expect(server.name).toBe('vanrot');
    expect(server.version).toBe('0.0.0');

    const resourceKeys = vanrotMcpResourceDefinitions.map((resource) => resource.key);

    for (const indexKey of Object.keys(bundle.index)) {
      expect(resourceKeys).toContain(indexKey);
    }

    expect(resourceKeys).toEqual(expect.arrayContaining(['deployment', 'docs']));
  });
});
