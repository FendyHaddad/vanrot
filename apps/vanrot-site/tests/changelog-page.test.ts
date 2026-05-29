import { describe, expect, it } from 'vitest';
import { createChangelogEntries } from '../src/docs/changelog-data.ts';
import { siteArticleKey, siteArticles } from '../src/docs/site-data.ts';

describe('docs changelog page', () => {
  it('keeps changelog entries versioned, dated, and bullet-based', () => {
    const entries = createChangelogEntries(siteArticles[siteArticleKey.changelog]);

    expect(entries.map((entry) => entry.version)).toEqual(['0.1.1', '0.1.0', '0.0.0']);
    expect(entries[0]).toMatchObject({
      anchorId: 'version-0-1-1',
      date: 'May 30, 2026',
      changes: [
        'Added vr update to sync generated config, project-map, and AI doorway files without changing package versions.',
        'Added vr upgrade to bump installed @vanrot packages, install dependencies, and run the project sync step.',
        'Added upgrade diagnostics for missing package.json, invalid package.json, missing Vanrot packages, and package-manager install failures.',
        'Added release bump protection so already bumped package manifests are not bumped again before publish.',
      ],
    });
    expect(entries.every((entry) => entry.changes.length > 0)).toBe(true);
  });
});
