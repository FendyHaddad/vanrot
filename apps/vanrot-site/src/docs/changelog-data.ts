import type { SiteArticle } from './site-data.ts';

export interface ChangelogEntry {
  version: string;
  anchorId: string;
  date: string;
  changes: readonly ChangelogChange[];
}

export interface ChangelogChange {
  text: string;
  docsHref: string;
  docsLabel: string;
}

type ChangelogChangeDocs = Omit<ChangelogChange, 'text'>;

const fallbackDocsLink = {
  docsHref: '/docs/introduction',
  docsLabel: 'Framework docs',
} as const;

const changelogDocsByVersion: Record<string, readonly ChangelogChangeDocs[]> = {
  '0.1.1': [
    { docsHref: '/docs/cli/config-maintenance', docsLabel: 'Config maintenance docs' },
    { docsHref: '/docs/cli/commands', docsLabel: 'CLI command docs' },
    { docsHref: '/docs/diagnostics', docsLabel: 'Diagnostics docs' },
    { docsHref: '/docs/deployment', docsLabel: 'Deployment docs' },
  ],
  '0.1.0': [
    { docsHref: '/docs/installation', docsLabel: 'Installation docs' },
    { docsHref: '/docs/cli/project-creation', docsLabel: 'Project creation docs' },
    { docsHref: '/docs/routing', docsLabel: 'Routing docs' },
    { docsHref: '/docs/deployment', docsLabel: 'Deployment docs' },
  ],
  '0.0.0': [
    { docsHref: '/docs/limitations', docsLabel: 'Limitations docs' },
    { docsHref: '/docs/cli/project-creation', docsLabel: 'Project creation docs' },
    { docsHref: '/docs/installation', docsLabel: 'Installation docs' },
  ],
};

export function createChangelogEntries(article: SiteArticle): readonly ChangelogEntry[] {
  return article.sections.map((section) => ({
    version: section.title,
    anchorId: section.id,
    date: section.date ?? '',
    changes: createChangelogChanges(section.title, section.changes ?? [section.body]),
  }));
}

function createChangelogChanges(
  version: string,
  changes: readonly string[],
): readonly ChangelogChange[] {
  const docsLinks = changelogDocsByVersion[version] ?? [];

  return changes.map((change, index) => ({
    text: change,
    ...(docsLinks[index] ?? fallbackDocsLink),
  }));
}
