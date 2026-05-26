import { defineVanrotConfig } from '@vanrot/config';

export default defineVanrotConfig({
  schemaVersion: 1,
  project: { name: 'Vanrot Site' },
  source: { root: 'src' },
  devServer: { port: 1990 },
  router: {
    navigationPolish: {
      title: true,
      meta: true,
      scroll: true,
      focus: true,
    },
    diagnostics: {
      missingTitle: 'warn',
      missingMetaDescription: 'warn',
    },
  },
  ui: { flavor: 'october', styles: 'vanrotstyles', prefix: 'ui' },
  docs: { site: 'vanrot.vankode.com' },
});
