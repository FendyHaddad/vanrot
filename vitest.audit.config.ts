import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['audits/core/**/*.audit.ts'],
  },
});
