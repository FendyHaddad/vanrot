import { defineVanrotConfig } from '@vanrot/config';

export default defineVanrotConfig({
  schemaVersion: 1,
  project: {
    name: 'Build Deploy Example',
  },
  source: {
    root: 'src',
  },
  devServer: {
    port: 1010,
  },
});
