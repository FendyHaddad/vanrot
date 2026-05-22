import { describe, expect, it } from 'vitest';
import {
  configSchemaVersion,
  defineVanrotConfig,
  normalizeVanrotConfig,
  vanrotConfigFileName,
} from '../src/index.js';

describe('@vanrot/config exports', () => {
  it('exposes constants and helper functions', () => {
    expect(vanrotConfigFileName).toBe('vanrot.config.ts');
    expect(configSchemaVersion).toBe(1);

    const config = defineVanrotConfig({});
    const normalized = normalizeVanrotConfig(config);

    expect(normalized.schemaVersion).toBe(1);
    expect(normalized.source.root).toBe('src');
    expect(normalized.devServer.port).toBe(1010);
  });
});
