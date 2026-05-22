export const vanrotConfigFileName = 'vanrot.config.ts';
export const configSchemaVersion = 1;
export const defaultSourceRoot = 'src';
export const defaultDevServerPort = 1010;

export const configDomain = {
  project: 'project',
  source: 'source',
  devServer: 'devServer',
  router: 'router',
  ui: 'ui',
  store: 'store',
  testing: 'testing',
  build: 'build',
  cache: 'cache',
  docs: 'docs',
  ai: 'ai',
  conventions: 'conventions',
} as const;
