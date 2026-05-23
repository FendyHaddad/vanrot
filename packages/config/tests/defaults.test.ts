import { describe, expect, it } from 'vitest';
import { normalizeVanrotConfig, vanrotUiFlavor, vanrotUiStyleMode } from '../src/index.js';

describe('normalizeVanrotConfig', () => {
  it('fills missing required domains with production defaults', () => {
    const normalized = normalizeVanrotConfig({});

    expect(normalized.schemaVersion).toBe(1);
    expect(normalized.source.root).toBe('src');
    expect(normalized.devServer.port).toBe(1010);
  });

  it('fills UI October defaults', () => {
    const normalized = normalizeVanrotConfig({});

    expect(normalized.ui.flavor).toBe(vanrotUiFlavor.october);
    expect(normalized.ui.styles).toBe(vanrotUiStyleMode.vanrotstyles);
    expect(normalized.ui.prefix).toBe('ui');
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

  it('respects explicit UI style choices', () => {
    const normalized = normalizeVanrotConfig({
      ui: {
        flavor: vanrotUiFlavor.october,
        styles: vanrotUiStyleMode.tailwind,
        prefix: 'marketing',
      },
    });

    expect(normalized.ui.flavor).toBe(vanrotUiFlavor.october);
    expect(normalized.ui.styles).toBe(vanrotUiStyleMode.tailwind);
    expect(normalized.ui.prefix).toBe('marketing');
  });
});
