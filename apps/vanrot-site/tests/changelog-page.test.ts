import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { createChangelogEntries } from '../src/docs/changelog-data.ts';
import { siteArticleKey, siteArticles } from '../src/docs/site-data.ts';

const appRoot = process.cwd();

describe('docs changelog page', () => {
  it('keeps changelog entries versioned, dated, and bullet-based', () => {
    const entries = createChangelogEntries(siteArticles[siteArticleKey.changelog]);

    expect(entries.map((entry) => entry.version)).toEqual(['0.1.1', '0.1.0', '0.0.0']);
    expect(entries[0]).toMatchObject({
      anchorId: 'version-0-1-1',
      date: 'May 30, 2026',
      changes: [
        {
          text: 'Added vr update to sync generated config, project-map, and AI doorway files without changing package versions.',
          docsHref: '/docs/cli/config-maintenance',
          docsLabel: 'Config maintenance docs',
        },
        {
          text: 'Added vr upgrade to bump installed @vanrot packages, install dependencies, and run the project sync step.',
          docsHref: '/docs/cli/commands',
          docsLabel: 'CLI command docs',
        },
        {
          text: 'Added upgrade diagnostics for missing package.json, invalid package.json, missing Vanrot packages, and package-manager install failures.',
          docsHref: '/docs/diagnostics',
          docsLabel: 'Diagnostics docs',
        },
        {
          text: 'Added release bump protection so already bumped package manifests are not bumped again before publish.',
          docsHref: '/docs/deployment',
          docsLabel: 'Deployment docs',
        },
      ],
    });
    expect(entries.every((entry) => entry.changes.length > 0)).toBe(true);
    expect(
      entries.every((entry) =>
        entry.changes.every((change) => change.docsHref.startsWith('/docs/') && change.docsLabel.length > 0),
      ),
    ).toBe(true);
  });

  it('renders every changelog change with a docs hyperlink', async () => {
    const html = await readFile(
      join(appRoot, 'src/pages/docs/docs-changelog.page.html'),
      'utf8',
    );

    expect(html).toContain('{{ change.text }}');
    expect(html).toContain('[href]="change.docsHref"');
    expect(html).toContain('{{ change.docsLabel }}');
    expect(html).not.toContain('<li>{{ change }}</li>');
  });
});
