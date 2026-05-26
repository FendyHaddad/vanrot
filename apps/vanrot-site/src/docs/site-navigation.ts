import {
  getSiteArticle,
  siteArticleKey,
  siteSectionKey,
  type SiteArticleKey,
  type SiteSectionKey,
} from './site-data.ts';
import { componentDocs, type ComponentDoc } from './component-docs.ts';

export interface SiteNavigationItem {
  key: string;
  href: string;
  label: string;
}

export interface SiteNavigationGroup {
  section: SiteSectionKey;
  label: string;
  items: readonly SiteNavigationItem[];
}

export const siteNavigationSectionLabel = {
  getStarted: 'Get Started',
  framework: 'Framework',
  ui: 'UI',
  components: 'Components',
  examples: 'Examples',
  reference: 'Reference',
} as const satisfies Record<SiteSectionKey, string>;

function navItem(key: SiteArticleKey): SiteNavigationItem {
  const article = getSiteArticle(key);

  return {
    key,
    href: article.path,
    label: article.label,
  };
}

function componentNavItem(doc: ComponentDoc): SiteNavigationItem {
  return {
    key: doc.primitive,
    href: doc.href,
    label: doc.title,
  };
}

export const siteNavigationGroups: readonly SiteNavigationGroup[] = [
  {
    section: siteSectionKey.getStarted,
    label: siteNavigationSectionLabel.getStarted,
    items: [
      navItem(siteArticleKey.introduction),
      navItem(siteArticleKey.installation),
      navItem(siteArticleKey.projectStructure),
    ],
  },
  {
    section: siteSectionKey.framework,
    label: siteNavigationSectionLabel.framework,
    items: [
      navItem(siteArticleKey.runtime),
      navItem(siteArticleKey.compiler),
      navItem(siteArticleKey.vitePlugin),
      navItem(siteArticleKey.cli),
      navItem(siteArticleKey.configuration),
      navItem(siteArticleKey.routing),
      navItem(siteArticleKey.testing),
      navItem(siteArticleKey.devtools),
      navItem(siteArticleKey.conventions),
    ],
  },
  {
    section: siteSectionKey.ui,
    label: siteNavigationSectionLabel.ui,
    items: [
      navItem(siteArticleKey.uiOctober),
      navItem(siteArticleKey.theming),
      navItem(siteArticleKey.vanrotstyles),
    ],
  },
  {
    section: siteSectionKey.components,
    label: siteNavigationSectionLabel.components,
    items: componentDocs.map(componentNavItem),
  },
  {
    section: siteSectionKey.examples,
    label: siteNavigationSectionLabel.examples,
    items: [
      navItem(siteArticleKey.examples),
      navItem(siteArticleKey.exampleMatrix),
      navItem(siteArticleKey.octoberShowcase),
    ],
  },
  {
    section: siteSectionKey.reference,
    label: siteNavigationSectionLabel.reference,
    items: [
      navItem(siteArticleKey.publicApi),
      navItem(siteArticleKey.diagnostics),
      navItem(siteArticleKey.generatedFiles),
      navItem(siteArticleKey.deployment),
      navItem(siteArticleKey.limitations),
      navItem(siteArticleKey.referenceStatus),
    ],
  },
];

export const siteNavigationBySection = {
  getStarted: itemsForSection(siteSectionKey.getStarted),
  framework: itemsForSection(siteSectionKey.framework),
  ui: itemsForSection(siteSectionKey.ui),
  components: itemsForSection(siteSectionKey.components),
  examples: itemsForSection(siteSectionKey.examples),
  reference: itemsForSection(siteSectionKey.reference),
} as const satisfies Record<SiteSectionKey, readonly SiteNavigationItem[]>;

function itemsForSection(section: SiteSectionKey): readonly SiteNavigationItem[] {
  const group = siteNavigationGroups.find((candidate) => candidate.section === section);

  if (group === undefined) {
    throw new Error(`Missing Vanrot site navigation group for ${section}.`);
  }

  return group.items;
}
