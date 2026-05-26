import siteDataJson from './site-data.json';

export const siteSectionKey = {
  getStarted: 'getStarted',
  framework: 'framework',
  ui: 'ui',
  components: 'components',
  examples: 'examples',
  reference: 'reference',
} as const;

export type SiteSectionKey = (typeof siteSectionKey)[keyof typeof siteSectionKey];

export const siteStatus = {
  availableNow: 'available-now',
  demoCapable: 'demo-capable',
  productionReadyThroughPhase12: 'production-ready-through-phase-12',
  productionReadyThroughPhase13: 'production-ready-through-phase-13',
  productionReadyThroughPhase15: 'production-ready-through-phase-15',
  demoCapableThroughPhase14: 'demo-capable-through-phase-14',
  demoCapableThroughPhase16B: 'demo-capable-through-phase-16b',
  inProgressThroughPhase16B: 'in-progress-through-phase-16b',
} as const;

export type SiteStatus = (typeof siteStatus)[keyof typeof siteStatus];

export interface SiteArticleSection {
  id: string;
  title: string;
  body: string;
}

export interface SiteArticle {
  key: SiteArticleKey;
  section: SiteSectionKey;
  path: string;
  label: string;
  title: string;
  summary: string;
  status: SiteStatus | string;
  sections: readonly SiteArticleSection[];
}

export const siteArticleKey = {
  introduction: 'introduction',
  installation: 'installation',
  projectStructure: 'projectStructure',
  runtime: 'runtime',
  compiler: 'compiler',
  vitePlugin: 'vitePlugin',
  cli: 'cli',
  configuration: 'configuration',
  routing: 'routing',
  uiOctober: 'uiOctober',
  theming: 'theming',
  vanrotstyles: 'vanrotstyles',
  testing: 'testing',
  examples: 'examples',
  octoberShowcase: 'octoberShowcase',
  conventions: 'conventions',
  referenceStatus: 'referenceStatus',
} as const;

export type SiteArticleKey = (typeof siteArticleKey)[keyof typeof siteArticleKey];

export const siteArticleKeys = Object.values(siteArticleKey);

const rawArticles = siteDataJson.articles as SiteArticle[];

export const siteArticles = Object.fromEntries(
  rawArticles.map((article) => [article.key, article]),
) as Record<SiteArticleKey, SiteArticle>;

export interface PrimitiveDocCopy {
  primitive: string;
  title: string;
  summary: string;
  usage: string;
  accessibility: string;
}

export interface CommandDoc {
  name: string;
  usage: string;
  status: string;
}

export interface PackageReferenceDoc {
  name: string;
  area: string;
  status: string;
}

export interface DiagnosticReferenceDocs {
  compiler: readonly string[];
  config: readonly string[];
  router: readonly string[];
}

export function getSiteArticle(key: SiteArticleKey): SiteArticle {
  return siteArticles[key];
}

export const primitiveDocCopy = siteDataJson.primitiveDocs as PrimitiveDocCopy[];
export const cliCommandDocs = siteDataJson.commands as CommandDoc[];
export const packageReferenceDocs = siteDataJson.packages as PackageReferenceDoc[];
export const diagnosticReferenceDocs = siteDataJson.diagnostics as DiagnosticReferenceDocs;
