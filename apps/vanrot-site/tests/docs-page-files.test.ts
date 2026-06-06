import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { docsPageTree, flattenDocsPageTree } from '../src/docs/docs-page-tree.ts';

const appRoot = process.cwd();

const sharedDocsClasses = [
  'docs-article-layout',
  'docs-article',
  'docs-summary',
  'docs-section-grid',
  'docs-section',
  'code-snippet',
  'docs-code-title',
  'code-block',
  'code-line',
  'code-line-number',
  'code-line-content',
  'docs-note',
  'docs-article-bookmarks',
] as const;

function readSiteFile(path: string): string {
  return readFileSync(join(appRoot, path), 'utf8');
}

describe('docs page component files', () => {
  it('gives every docs page a page ts, html, and css file', () => {
    for (const page of flattenDocsPageTree(docsPageTree)) {
      expect(existsSync(join(appRoot, page.sourceFiles.ts))).toBe(true);
      expect(existsSync(join(appRoot, page.sourceFiles.html))).toBe(true);
      expect(existsSync(join(appRoot, page.sourceFiles.css))).toBe(true);
    }
  });

  it('keeps UI markup out of docs page TypeScript files', () => {
    for (const page of flattenDocsPageTree(docsPageTree)) {
      const source = readSiteFile(page.sourceFiles.ts);

      expect(source).not.toContain('template:');
      expect(source).not.toMatch(/<docs-(article-shell|section|code-block|note|points-list)/);
      expect(source).not.toMatch(/\.\s*innerHTML\s*=/);
    }
  });

  it('owns common docs classes in the shared docs stylesheet', () => {
    const sharedCss = readSiteFile('src/pages/docs/shared/docs.css');

    for (const className of sharedDocsClasses) {
      expect(sharedCss).toContain(`.${className}`);
    }
  });

  it('keeps common docs classes out of page-specific css files', () => {
    const commonClassSelectors = sharedDocsClasses.map((className) => `.${className}`);

    for (const page of flattenDocsPageTree(docsPageTree)) {
      const css = readSiteFile(page.sourceFiles.css);

      for (const selector of commonClassSelectors) {
        expect(css).not.toContain(selector);
      }
    }
  });
});
