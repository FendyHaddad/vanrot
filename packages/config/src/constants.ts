export const vanrotConfigFileName = 'vanrot.config.ts';
export const configSchemaVersion = 1;
export const defaultVanrotEngine = 'forge';
export const defaultSourceRoot = 'src';
export const defaultDevServerPort = 1964;

export const configDomain = {
  engine: 'engine',
  project: 'project',
  source: 'source',
  devServer: 'devServer',
  router: 'router',
  ui: 'ui',
  behavior: 'behavior',
  store: 'store',
  testing: 'testing',
  build: 'build',
  cache: 'cache',
  docs: 'docs',
  ai: 'ai',
  seo: 'seo',
  formatting: 'formatting',
  conventions: 'conventions',
} as const;
