import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  changelogAllPath,
  changelogPackageNames,
  createChangelogEntries,
  createChangelogPackageFilters,
  createPackageChangelogEntries,
  packageChangelogPath,
  packageNameFromChangelogSlug,
} from '../src/docs/changelog-data.ts';
import { siteArticleKey, siteArticles } from '../src/docs/site-data.ts';

const appRoot = process.cwd();

describe('docs changelog page', () => {
  it('keeps changelog entries versioned, dated, and bullet-based', () => {
    const entries = createChangelogEntries(siteArticles[siteArticleKey.changelog]);

    expect(entries.map((entry) => entry.version)).toEqual(['0.2.2', '0.2.0', '0.1.1', '0.1.0', '0.0.0']);
    expect(entries[0]).toMatchObject({
      anchorId: 'version-0-2-2',
      date: 'June 5, 2026',
      changes: [
        {
          text: 'Added collapsible, accordion, disclosure, selection, listbox, select, combobox, multi-selection, menu, context-menu, menubar, navigation-menu, toggle-group, toolbar, scroll-area, portal, focus, calendar, date-picker, drag-drop, and table-resize controllers.',
          docsHref: '/docs/behavior',
          docsLabel: 'Behavior docs',
          packagesLabel: '@vanrot/behavior',
        },
        {
          text: 'Added subpath exports so apps can import only the behavior family they need.',
          docsHref: '/docs/behavior',
          docsLabel: 'Behavior import docs',
          packagesLabel: '@vanrot/behavior',
        },
        {
          text: 'Updated behavior config validation and vr create behavior scaffolding for the expanded family names.',
          docsHref: '/docs/cli/project-creation',
          docsLabel: 'Project creation docs',
          packagesLabel: '@vanrot/cli, @vanrot/config, @vanrot/behavior',
        },
        {
          text: 'Updated behavior docs, framework reference metadata, AI-readable docs, the future pipeline checklist, and the final TDD inventory for Phase 28.',
          docsHref: '/docs/behavior',
          docsLabel: 'Behavior docs',
          packagesLabel: '@vanrot/behavior',
        },
      ],
    });
    expect(entries.every((entry) => entry.changes.length > 0)).toBe(true);
    expect(
      entries.every((entry) =>
        entry.changes.every((change) => change.docsHref.startsWith('/docs/') && change.docsLabel.length > 0),
      ),
    ).toBe(true);
    expect(
      entries.every((entry) =>
        entry.changes.every((change) => Array.isArray(change.packages) && change.packages.length > 0),
      ),
    ).toBe(true);
  });

  it('builds an all-first package sidebar from every package name', () => {
    const entries = createChangelogEntries(siteArticles[siteArticleKey.changelog]);
    const filters = createChangelogPackageFilters(entries);
    const cliFilter = filters.find((filter) => filter.packageName === '@vanrot/cli');
    const cliEntries = createPackageChangelogEntries(entries, '@vanrot/cli');

    expect(changelogAllPath).toBe('/changelog');
    expect(filters.map((filter) => filter.packageName)).toEqual(changelogPackageNames);
    expect(filters.map((filter) => filter.href)).toContain('/changelog/cli');
    expect(cliFilter?.changeCount).toBeGreaterThan(0);
    expect(cliEntries.every((entry) => entry.changes.every((change) => change.packages.includes('@vanrot/cli')))).toBe(true);
    expect(packageChangelogPath('@vanrot/seo')).toBe('/changelog/seo');
    expect(packageNameFromChangelogSlug('seo')).toBe('@vanrot/seo');
  });

  it('renders every changelog change with a docs hyperlink', async () => {
    const html = await readFile(
      join(appRoot, 'src/pages/docs/docs-changelog.page.html'),
      'utf8',
    );

    expect(html).toContain('{{ change.text }}');
    expect(html).toContain('[href]="change.docsHref"');
    expect(html).toContain('{{ change.docsLabel }}');
    expect(html).toContain('Changelog packages');
    expect(html).toContain('All');
    expect(html).toContain('[href]="allPath()"');
    expect(html).toContain('[href]="filter.href"');
    expect(html).toContain('@for (filter of packageFilters()');
    expect(html).toContain('{{ change.packagesLabel }}');
    expect(html).toContain('@if (showPackageLabels())');
    expect(html).not.toContain('packageChangeRows');
    expect(html).not.toContain('<li>{{ change }}</li>');
  });
});
