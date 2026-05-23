export const vanrotUiFlavor = {
  october: 'october',
} as const;

export type VanrotUiFlavor = (typeof vanrotUiFlavor)[keyof typeof vanrotUiFlavor];

export const vanrotUiStyleMode = {
  vanrotstyles: 'vanrotstyles',
  tailwind: 'tailwind',
  none: 'none',
} as const;

export type VanrotUiStyleMode = (typeof vanrotUiStyleMode)[keyof typeof vanrotUiStyleMode];

export interface VanrotUiConfig {
  flavor?: VanrotUiFlavor;
  styles?: VanrotUiStyleMode;
  prefix?: string;
}

export interface NormalizedVanrotUiConfig {
  flavor: VanrotUiFlavor;
  styles: VanrotUiStyleMode;
  prefix: string;
}

export interface VanrotConfig {
  schemaVersion?: number;
  project?: { name?: string };
  source?: { root?: string };
  devServer?: { port?: number };
  router?: Record<string, unknown>;
  ui?: VanrotUiConfig;
  store?: Record<string, unknown>;
  testing?: Record<string, unknown>;
  build?: Record<string, unknown>;
  cache?: Record<string, unknown>;
  docs?: Record<string, unknown>;
  ai?: Record<string, unknown>;
  conventions?: Record<string, unknown>;
}

export interface NormalizedVanrotConfig
  extends Omit<VanrotConfig, 'schemaVersion' | 'source' | 'devServer' | 'ui'> {
  schemaVersion: number;
  source: { root: string };
  devServer: { port: number };
  ui: NormalizedVanrotUiConfig;
}
