import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vanrot from '../../../src/index.ts';

const runtimeEntry = fileURLToPath(new URL('../../../../runtime/src/index.ts', import.meta.url));
const runtimeInternalEntry = fileURLToPath(
  new URL('../../../../runtime/src/internal.ts', import.meta.url),
);
const routerEntry = fileURLToPath(new URL('../../../../router/src/index.ts', import.meta.url));
const routerInternalEntry = fileURLToPath(
  new URL('../../../../router/src/internal.ts', import.meta.url),
);

export default defineConfig({
  plugins: [vanrot()],
  resolve: {
    alias: [
      { find: '@vanrot/runtime/internal', replacement: runtimeInternalEntry },
      { find: '@vanrot/runtime', replacement: runtimeEntry },
      { find: '@vanrot/router/internal', replacement: routerInternalEntry },
      { find: '@vanrot/router', replacement: routerEntry },
    ],
  },
});
