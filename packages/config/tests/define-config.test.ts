import { describe, expect, it } from 'vitest';
import { defineVanrotConfig } from '../src/index.js';

describe('defineVanrotConfig', () => {
  it('preserves the provided object shape with type-safe return', () => {
    const config = defineVanrotConfig({
      schemaVersion: 1,
      source: { root: 'client' },
      devServer: { port: 2222 },
    });

    expect(config.source?.root).toBe('client');
    expect(config.devServer?.port).toBe(2222);
  });
});
