import { describe, expect, it } from 'vitest';
import { normalizeVanrotConfig } from '../src/index.js';

describe('normalizeVanrotConfig', () => {
  it('fills missing required domains with production defaults', () => {
    const normalized = normalizeVanrotConfig({});

    expect(normalized.schemaVersion).toBe(1);
    expect(normalized.source.root).toBe('src');
    expect(normalized.devServer.port).toBe(1010);
  });

  it('respects explicit user values', () => {
    const normalized = normalizeVanrotConfig({
      schemaVersion: 1,
      source: { root: 'app' },
      devServer: { port: 5174 },
      project: { name: 'demo' },
    });

    expect(normalized.source.root).toBe('app');
    expect(normalized.devServer.port).toBe(5174);
    expect(normalized.project?.name).toBe('demo');
  });
});
