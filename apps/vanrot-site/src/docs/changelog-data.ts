import type { SiteArticle } from './site-data.ts';

export interface ChangelogPackageFilter {
  packageName: string;
  href: string;
  changeCount: number;
}

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
  packages: readonly string[];
  packagesLabel: string;
}

type ChangelogChangeDocs = Omit<ChangelogChange, 'text' | 'packagesLabel'>;

const fallbackDocsLink = {
  docsHref: '/docs/introduction',
  docsLabel: 'Framework docs',
  packages: [],
} as const;

export const changelogAllPath = '/changelog';

export const changelogPackageNames = [
  '@vanrot/runtime',
  '@vanrot/behavior',
  '@vanrot/compiler',
  '@vanrot/config',
  '@vanrot/language-server',
  '@vanrot/router',
  '@vanrot/ssr',
  '@vanrot/vite-plugin',
  '@vanrot/cli',
  '@vanrot/ui',
  '@vanrot/testing',
  '@vanrot/devtools',
  '@vanrot/ai',
  '@vanrot/seo',
] as const;

const changelogDocsByVersion: Record<string, readonly ChangelogChangeDocs[]> = {
  '0.2.2': [
    {
      docsHref: '/docs/behavior',
      docsLabel: 'Behavior docs',
      packages: ['@vanrot/behavior'],
    },
    {
      docsHref: '/docs/behavior',
      docsLabel: 'Behavior import docs',
      packages: ['@vanrot/behavior'],
    },
    {
      docsHref: '/docs/cli/project-creation',
      docsLabel: 'Project creation docs',
      packages: ['@vanrot/cli', '@vanrot/config', '@vanrot/behavior'],
    },
    {
      docsHref: '/docs/behavior',
      docsLabel: 'Behavior docs',
      packages: ['@vanrot/behavior'],
    },
  ],
  '0.2.0': [
    {
      docsHref: '/docs/cli/project-intelligence',
      docsLabel: 'Project intelligence docs',
      packages: ['@vanrot/cli'],
    },
    {
      docsHref: '/docs/cli/commands',
      docsLabel: 'CLI command docs',
      packages: ['@vanrot/cli'],
    },
    {
      docsHref: '/docs/cli/project-intelligence',
      docsLabel: 'Cache maintenance docs',
      packages: ['@vanrot/cli'],
    },
    {
      docsHref: '/docs/cli',
      docsLabel: 'CLI docs',
      packages: ['@vanrot/cli', '@vanrot/ai'],
    },
  ],
  '0.1.1': [
    {
      docsHref: '/docs/cli/config-maintenance',
      docsLabel: 'Config maintenance docs',
      packages: ['@vanrot/cli', '@vanrot/config', '@vanrot/ai'],
    },
    {
      docsHref: '/docs/cli/commands',
      docsLabel: 'CLI command docs',
      packages: ['@vanrot/cli'],
    },
    {
      docsHref: '/docs/diagnostics',
      docsLabel: 'Diagnostics docs',
      packages: ['@vanrot/cli', '@vanrot/config'],
    },
    {
      docsHref: '/docs/deployment',
      docsLabel: 'Deployment docs',
      packages: changelogPackageNames,
    },
  ],
  '0.1.0': [
    {
      docsHref: '/docs/installation',
      docsLabel: 'Installation docs',
      packages: changelogPackageNames,
    },
    {
      docsHref: '/docs/cli/project-creation',
      docsLabel: 'Project creation docs',
      packages: ['@vanrot/cli'],
    },
    {
      docsHref: '/docs/routing',
      docsLabel: 'Routing docs',
      packages: ['@vanrot/ui', '@vanrot/router', '@vanrot/language-server'],
    },
    {
      docsHref: '/docs/deployment',
      docsLabel: 'Deployment docs',
      packages: changelogPackageNames,
    },
  ],
  '0.0.0': [
    {
      docsHref: '/docs/limitations',
      docsLabel: 'Limitations docs',
      packages: changelogPackageNames,
    },
    {
      docsHref: '/docs/cli/project-creation',
      docsLabel: 'Project creation docs',
      packages: ['@vanrot/cli'],
    },
    {
      docsHref: '/docs/installation',
      docsLabel: 'Installation docs',
      packages: changelogPackageNames,
    },
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
    packagesLabel: (docsLinks[index] ?? fallbackDocsLink).packages.join(', '),
  }));
}

export function createChangelogPackageFilters(
  entries: readonly ChangelogEntry[],
): readonly ChangelogPackageFilter[] {
  return changelogPackageNames.map((packageName) => ({
    packageName,
    href: packageChangelogPath(packageName),
    changeCount: countPackageChanges(entries, packageName),
  }));
}

export function createPackageChangelogEntries(
  entries: readonly ChangelogEntry[],
  packageName: string | undefined,
): readonly ChangelogEntry[] {
  if (packageName === undefined) {
    return entries;
  }

  return entries
    .map((entry) => ({
      ...entry,
      changes: entry.changes.filter((change) => change.packages.includes(packageName)),
    }))
    .filter((entry) => entry.changes.length > 0);
}

export function packageNameFromChangelogSlug(slug: string | undefined): string | undefined {
  return changelogPackageNames.find((packageName) => packageChangelogSlug(packageName) === slug);
}

export function packageChangelogPath(packageName: string): string {
  return `${changelogAllPath}/${packageChangelogSlug(packageName)}`;
}

function countPackageChanges(entries: readonly ChangelogEntry[], packageName: string): number {
  return entries.reduce(
    (total, entry) =>
      total + entry.changes.filter((change) => change.packages.includes(packageName)).length,
    0,
  );
}

function packageChangelogSlug(packageName: string): string {
  return packageName.replace('@vanrot/', '');
}
