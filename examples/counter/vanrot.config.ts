import { defineVanrotConfig } from '@vanrot/config';

export default defineVanrotConfig({
  schemaVersion: 1,
  source: { root: 'src' },
  devServer: { port: 1010 },
});
