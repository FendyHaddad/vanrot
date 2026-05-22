import type { VanrotConfig } from './types.js';

export function defineVanrotConfig<T extends VanrotConfig>(config: T): T {
  return config;
}
