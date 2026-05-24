import { defineVanrotConfig } from '@vanrot/config';

export default defineVanrotConfig({
  schemaVersion: 1,
  project: { name: 'Vanrot Site' },
  source: { root: 'src' },
  devServer: { port: 1010 },
  ui: { flavor: 'october', styles: 'vanrotstyles', prefix: 'ui' },
  docs: { site: 'vanrot.vankode.com' },
});
