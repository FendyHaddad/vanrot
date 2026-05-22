import { configSchemaVersion, defaultDevServerPort, defaultSourceRoot } from './constants.js';
import type { NormalizedVanrotConfig, VanrotConfig } from './types.js';

export function normalizeVanrotConfig(config: VanrotConfig = {}): NormalizedVanrotConfig {
  return {
    ...config,
    schemaVersion: config.schemaVersion ?? configSchemaVersion,
    source: {
      root: config.source?.root ?? defaultSourceRoot,
    },
    devServer: {
      port: config.devServer?.port ?? defaultDevServerPort,
    },
  };
}
