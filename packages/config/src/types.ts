export interface VanrotConfig {
  schemaVersion?: number;
  project?: { name?: string };
  source?: { root?: string };
  devServer?: { port?: number };
  router?: Record<string, unknown>;
  ui?: Record<string, unknown>;
  store?: Record<string, unknown>;
  testing?: Record<string, unknown>;
  build?: Record<string, unknown>;
  cache?: Record<string, unknown>;
  docs?: Record<string, unknown>;
  ai?: Record<string, unknown>;
  conventions?: Record<string, unknown>;
}

export interface NormalizedVanrotConfig
  extends Omit<VanrotConfig, 'schemaVersion' | 'source' | 'devServer'> {
  schemaVersion: number;
  source: { root: string };
  devServer: { port: number };
}
