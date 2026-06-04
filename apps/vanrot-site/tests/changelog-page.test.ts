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

    expect(entries.map((entry) => entry.version)).toEqual(['0.2.0', '0.1.1', '0.1.0', '0.0.0']);
    expect(entries[0]).toMatchObject({
      anchorId: 'version-0-2-0',
      date: 'June 4, 2026',
      changes: [
        {
          text: 'Added vr doctor --inspect to include read-only project intelligence in the health report.',
          docsHref: '/docs/cli/project-intelligence',
          docsLabel: 'Project intelligence docs',
          packagesLabel: '@vanrot/cli',
        },
        {
          text: 'Removed standalone vr inspect from the command surface and redirects that mental model to vr doctor --inspect.',
          docsHref: '/docs/cli/commands',
          docsLabel: 'CLI command docs',
        },
        {
          text: 'Added vr cache clean with --dry-run support for Vanrot-owned generated metadata.',
          docsHref: '/docs/cli/project-intelligence',
          docsLabel: 'Cache maintenance docs',
        },
        {
          text: 'Updated public CLI docs, project intelligence docs, command references, and AI-readable docs for the new maintenance workflow.',
          docsHref: '/docs/cli',
          docsLabel: 'CLI docs',
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
