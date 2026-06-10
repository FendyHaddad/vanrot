import { defineVanrotConfig } from '@vanrot/config';

export default defineVanrotConfig({
  engine: 'vite',
  schemaVersion: 1,
  source: { root: 'src' },
  devServer: { port: 1010 },
});
