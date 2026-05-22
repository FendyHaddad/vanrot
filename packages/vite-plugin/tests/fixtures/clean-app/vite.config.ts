import { defineConfig } from 'vite';
import vanrot from '@vanrot/vite-plugin';

export default defineConfig({
  plugins: [vanrot()],
  css: {
    devSourcemap: true,
  },
  build: {
    cssMinify: false,
    sourcemap: true,
  },
});
