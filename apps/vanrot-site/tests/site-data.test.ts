import { uiPrimitiveOrder } from '@vanrot/ui';
import { describe, expect, it } from 'vitest';
import { componentDocs } from '../src/docs/component-docs.ts';
import { siteNavigationGroups } from '../src/docs/site-navigation.ts';
import {
  cliCommandDocs,
  packageReferenceDocs,
  primitiveDocCopy,
  siteArticleKeys,
  siteArticles,
} from '../src/docs/site-data.ts';

describe('vanrot site docs data', () => {
  it('documents the required framework learning pages', () => {
    expect(siteArticleKeys).toEqual([
      'introduction',
      'installation',
      'projectStructure',
      'runtime',
      'compiler',
      'vitePlugin',
      'cli',
      'configuration',
      'routing',
      'uiOctober',
      'theming',
      'vanrotstyles',
      'testing',
      'devtools',
      'examples',
      'exampleMatrix',
      'deployment',
      'publicApi',
      'diagnostics',
      'generatedFiles',
      'octoberShowcase',
      'conventions',
      'limitations',
      'referenceStatus',
    ]);

    for (const key of siteArticleKeys) {
      const article = siteArticles[key];

      expect(article.title.length).toBeGreaterThan(0);
      expect(article.summary.length).toBeGreaterThan(0);
      expect(article.sections.length).toBeGreaterThan(0);
    }
  });

  it('documents every current primitive from @vanrot/ui metadata', () => {
    expect(componentDocs.map((doc) => doc.primitive).sort()).toEqual([...uiPrimitiveOrder].sort());
    expect(componentDocs.map((doc) => doc.title)).toEqual(
      [...componentDocs.map((doc) => doc.title)].sort((left, right) => left.localeCompare(right)),
    );

    for (const doc of componentDocs) {
      expect(doc.title.length).toBeGreaterThan(0);
      expect(doc.usage.length).toBeGreaterThan(0);
      expect(doc.accessibility.length).toBeGreaterThan(0);
      expect(doc.api.length).toBeGreaterThan(0);
    }
  });

  it('keeps raw site primitive docs aligned with @vanrot/ui metadata', () => {
    expect(primitiveDocCopy.map((doc) => doc.primitive).sort()).toEqual(
      [...uiPrimitiveOrder].sort(),
    );
  });

  it('documents current commands and implemented packages', () => {
    expect(cliCommandDocs.map((command) => command.name)).toEqual([
      'create',
      'generate',
      'add',
      'ui',
      'config',
      'doctor',
      'map',
      'init-ai',
      'ai',
      'dev',
      'build',
      'test',
    ]);
    expect(packageReferenceDocs.map((item) => item.name)).toEqual([
      '@vanrot/runtime',
      '@vanrot/compiler',
      '@vanrot/config',
      '@vanrot/language-server',
      '@vanrot/router',
      '@vanrot/vite-plugin',
      '@vanrot/cli',
      '@vanrot/ui',
      '@vanrot/testing',
      '@vanrot/devtools',
      '@vanrot/ai',
    ]);
    expect(packageReferenceDocs.every((item) => item.docsPath.startsWith('/docs'))).toBe(true);
    expect(cliCommandDocs.every((command) => command.docsPath.startsWith('/docs'))).toBe(true);
  });

  it('builds navigation for the whole framework, not only UI', () => {
    expect(siteNavigationGroups.map((group) => group.label)).toEqual([
      'Get Started',
      'Framework',
      'UI',
      'Components',
      'Examples',
      'Reference',
    ]);

    const componentGroup = siteNavigationGroups.find((group) => group.label === 'Components');
    expect(componentGroup?.items.map((item) => item.href)).toEqual(
      componentDocs.map((doc) => doc.href),
    );
  });
});
