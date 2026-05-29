import { getSiteArticle, siteArticleKey, type SiteArticle } from '../../docs/site-data.ts';
import { createChangelogEntries, type ChangelogEntry } from '../../docs/changelog-data.ts';

export class DocsChangelogPage {
  article(): SiteArticle {
    return getSiteArticle(siteArticleKey.changelog);
  }

  entries(): readonly ChangelogEntry[] {
    return createChangelogEntries(this.article());
  }
}
