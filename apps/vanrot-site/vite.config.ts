import { defineConfig } from 'vite';
import vanrot from '@vanrot/vite-plugin';

const docsChildComponentImportMap = {
  'docs-article-shell': '/src/pages/docs/shared/docs-article-shell.component.ts',
  'docs-section': '/src/pages/docs/shared/docs-section.component.ts',
  'docs-code-block': '/src/pages/docs/shared/docs-code-block.component.ts',
  'docs-note': '/src/pages/docs/shared/docs-note.component.ts',
  'docs-points-list': '/src/pages/docs/shared/docs-points-list.component.ts',
} as const;

export default defineConfig({
  plugins: [
    vanrot({
      childComponentImportMap: docsChildComponentImportMap,
    }),
  ],
});
