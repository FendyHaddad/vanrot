import { getCurrentMatch } from '@vanrot/router';
import { getSiteArticle, siteArticleKey, type SiteArticle } from '../../docs/site-data.ts';
import {
  changelogAllPath,
  createChangelogEntries,
  createChangelogPackageFilters,
  createPackageChangelogEntries,
  packageNameFromChangelogSlug,
  type ChangelogEntry,
  type ChangelogPackageFilter,
} from '../../docs/changelog-data.ts';

export class DocsChangelogPage {
  article(): SiteArticle {
    return getSiteArticle(siteArticleKey.changelog);
  }

  changelogEntries(): readonly ChangelogEntry[] {
    return createPackageChangelogEntries(this.allChangelogEntries(), this.selectedPackageName());
  }

  allPath(): string {
    return changelogAllPath;
  }

  totalChangeCount(): number {
    return this.allChangelogEntries().reduce((total, entry) => total + entry.changes.length, 0);
  }

  packageFilters(): readonly ChangelogPackageFilter[] {
    return createChangelogPackageFilters(this.allChangelogEntries());
  }

  showPackageLabels(): boolean {
    return this.selectedPackageName() === undefined;
  }

  private allChangelogEntries(): readonly ChangelogEntry[] {
    return createChangelogEntries(this.article());
  }

  private selectedPackageName(): string | undefined {
    return packageNameFromChangelogSlug(getCurrentMatch()?.params.packageSlug);
  }
}
