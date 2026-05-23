import { configSchemaVersion, defaultDevServerPort, defaultSourceRoot } from './constants.js';
import {
  vanrotUiFlavor,
  vanrotUiStyleMode,
  type NormalizedVanrotConfig,
  type VanrotConfig,
} from './types.js';

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
    ui: {
      flavor: config.ui?.flavor ?? vanrotUiFlavor.october,
      styles: config.ui?.styles ?? vanrotUiStyleMode.vanrotstyles,
      prefix: config.ui?.prefix ?? 'ui',
    },
  };
}
