import siteDataJson from './site-data.json';
import {
  commandReferenceDocs as frameworkCommandReferenceDocs,
  diagnosticReferenceDocs as frameworkDiagnosticReferenceDocs,
  packageReferenceDocs as frameworkPackageReferenceDocs,
  type FrameworkCommandReference,
  type FrameworkDiagnosticReference,
  type FrameworkPackageReference,
} from './framework-reference.ts';

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
  productionReadyThroughPhase23: 'production-ready-through-phase-23',
  demoCapableThroughPhase14: 'demo-capable-through-phase-14',
  demoCapableThroughPhase16B: 'demo-capable-through-phase-16b',
  inProgressThroughPhase16B: 'in-progress-through-phase-16b',
  phase24Active: 'phase-24-active',
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
  devtools: 'devtools',
  examples: 'examples',
  exampleMatrix: 'exampleMatrix',
  deployment: 'deployment',
  publicApi: 'publicApi',
  diagnostics: 'diagnostics',
  generatedFiles: 'generatedFiles',
  changelog: 'changelog',
  octoberShowcase: 'octoberShowcase',
  conventions: 'conventions',
  limitations: 'limitations',
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

export type CommandDoc = FrameworkCommandReference;
export type PackageReferenceDoc = FrameworkPackageReference;
export type DiagnosticReferenceDocs = readonly FrameworkDiagnosticReference[];

export function getSiteArticle(key: SiteArticleKey): SiteArticle {
  return siteArticles[key];
}

export const primitiveDocCopy = siteDataJson.primitiveDocs as PrimitiveDocCopy[];
export const cliCommandDocs = frameworkCommandReferenceDocs;
export const packageReferenceDocs = frameworkPackageReferenceDocs;
export const diagnosticReferenceDocs = frameworkDiagnosticReferenceDocs;
