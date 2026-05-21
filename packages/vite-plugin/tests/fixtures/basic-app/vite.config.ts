import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vanrot from '../../../src/index.ts';

const runtimeEntry = fileURLToPath(new URL('../../../../runtime/src/index.ts', import.meta.url));
const runtimeInternalEntry = fileURLToPath(
  new URL('../../../../runtime/src/internal.ts', import.meta.url),
);

export default defineConfig({
  plugins: [vanrot()],
  resolve: {
    alias: [
      { find: '@vanrot/runtime/internal', replacement: runtimeInternalEntry },
      { find: '@vanrot/runtime', replacement: runtimeEntry },
    ],
  },
});
