import { describe, expect, it } from 'vitest';
import {
  docsPageSection,
  docsPageTree,
  flattenDocsPageTree,
} from '../src/docs/docs-page-tree.ts';
import { siteNavigationGroups } from '../src/docs/site-navigation.ts';
import { route } from '../src/routes.ts';

const requiredRealDocsPaths = [
  '/docs',
  '/docs/runtime',
  '/docs/runtime/signals',
  '/docs/editor-tooling',
  '/docs/editor-tooling/web-types',
  '/docs/editor-tooling/navigation',
  '/docs/editor-tooling/diagnostics',
  '/docs/editor-tooling/jetbrains',
  '/docs/compiler',
  '/docs/compiler/inputs',
  '/docs/cli',
  '/docs/cli/project-intelligence',
  '/docs/forms',
  '/docs/forms/arrays-wizards-server-errors',
  '/docs/formatters',
  '/docs/formatters/enum-pipes',
  '/docs/changelog',
] as const;

describe('docs page tree', () => {
  it('models docs as real parent and child pages', () => {
    const pages = flattenDocsPageTree(docsPageTree);
    const paths = pages.map((page) => page.path);

    expect(paths).toEqual(expect.arrayContaining([...requiredRealDocsPaths]));
    expect(new Set(paths).size).toBe(paths.length);

    const runtime = pages.find((page) => page.path === '/docs/runtime');
    const runtimeSignals = pages.find((page) => page.path === '/docs/runtime/signals');

    expect(runtime?.children.map((child) => child.path)).toContain('/docs/runtime/signals');
    expect(runtimeSignals?.children).toEqual([]);
    expect(runtime?.componentName).toBe('RuntimePage');
    expect(runtimeSignals?.componentName).toBe('SignalsPage');
  });

  it('keeps changelog as a real docs page component', () => {
    const pages = flattenDocsPageTree(docsPageTree);
    const changelog = pages.find((page) => page.path === '/docs/changelog');

    expect(changelog).toMatchObject({
      key: 'changelog',
      label: 'Changelog',
      path: '/docs/changelog',
      section: docsPageSection.reference,
    });
    expect(changelog?.componentName).toBe('ChangelogPage');
    expect(changelog?.sourceFiles.html).toBe(
      'src/pages/docs/changelog/changelog.page.html',
    );
  });

  it('derives framework navigation from the same page tree', () => {
    const frameworkPages = flattenDocsPageTree(docsPageTree)
      .filter((page) => page.section === docsPageSection.framework)
      .map((page) => page.path);
    const frameworkNavigation = siteNavigationGroups.find(
      (group) => group.section === docsPageSection.framework,
    );
    const navigationPaths = frameworkNavigation?.items.flatMap((item) => [
      item.href,
      ...item.children.map((child) => child.href),
    ]);

    expect(navigationPaths).toEqual(expect.arrayContaining(frameworkPages));
  });

  it('models editor tooling as real parent and child pages', () => {
    const pages = flattenDocsPageTree(docsPageTree);
    const parent = pages.find((page) => page.path === '/docs/editor-tooling');
    const childPaths = parent?.children.map((child) => child.path);

    expect(parent).toMatchObject({
      key: 'editorTooling',
      label: 'Editor Tooling',
      section: docsPageSection.framework,
    });
    expect(parent?.componentName).toBe('EditorToolingPage');
    expect(childPaths).toEqual([
      '/docs/editor-tooling/web-types',
      '/docs/editor-tooling/navigation',
      '/docs/editor-tooling/diagnostics',
      '/docs/editor-tooling/jetbrains',
    ]);

    for (const path of childPaths ?? []) {
      const page = pages.find((item) => item.path === path);
      expect(page?.sourceFiles.ts).toMatch(/editor-tooling/);
      expect(page?.sourceFiles.html).toMatch(/editor-tooling/);
      expect(page?.sourceFiles.css).toMatch(/editor-tooling/);
    }
  });

  it('registers each docs page path in routes', () => {
    for (const path of requiredRealDocsPaths) {
      const page = flattenDocsPageTree(docsPageTree).find((item) => item.path === path);
      const routeForPath = Object.values(route).find((routeRef) =>
        routeRef.fullPath === path && routeRef.page !== undefined,
      );

      expect(routeForPath?.fullPath).toBe(path);
      expect(routeForPath?.page).toBe(page?.component);
    }
  });
});
