import type { SiteArticle } from './site-data.ts';

export interface ChangelogEntry {
  version: string;
  anchorId: string;
  date: string;
  changes: readonly string[];
}

export function createChangelogEntries(article: SiteArticle): readonly ChangelogEntry[] {
  return article.sections.map((section) => ({
    version: section.title,
    anchorId: section.id,
    date: section.date ?? '',
    changes: section.changes ?? [section.body],
  }));
}
