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
  points?: readonly string[];
  code?: {
    title: string;
    code: string;
  };
  note?: string;
  date?: string;
  changes?: readonly string[];
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
  runtimeSignals: 'runtimeSignals',
  runtimeInputs: 'runtimeInputs',
  runtimeForms: 'runtimeForms',
  runtimeControllers: 'runtimeControllers',
  runtimeDevtoolsGraph: 'runtimeDevtoolsGraph',
  runtimeLifecycle: 'runtimeLifecycle',
  runtimeMounting: 'runtimeMounting',
  behavior: 'behavior',
  behaviorForm: 'behaviorForm',
  behaviorOverlay: 'behaviorOverlay',
  behaviorTooltip: 'behaviorTooltip',
  behaviorTabs: 'behaviorTabs',
  behaviorTable: 'behaviorTable',
  behaviorToast: 'behaviorToast',
  behaviorCommandMenu: 'behaviorCommandMenu',
  behaviorPositionedLayer: 'behaviorPositionedLayer',
  seo: 'seo',
  seoPackageBoundary: 'seoPackageBoundary',
  seoMetadataLadder: 'seoMetadataLadder',
  seoConfigControlPlane: 'seoConfigControlPlane',
  seoCreateAndAddFlows: 'seoCreateAndAddFlows',
  seoDoctorAndBuildOutput: 'seoDoctorAndBuildOutput',
  seoSocialImages: 'seoSocialImages',
  compiler: 'compiler',
  compilerFileConventions: 'compilerFileConventions',
  compilerComponentClass: 'compilerComponentClass',
  compilerTemplateSyntax: 'compilerTemplateSyntax',
  compilerExpressions: 'compilerExpressions',
  compilerEventBinding: 'compilerEventBinding',
  compilerScopedCss: 'compilerScopedCss',
  compilerChildComponents: 'compilerChildComponents',
  compilerSlots: 'compilerSlots',
  compilerIfElse: 'compilerIfElse',
  compilerFor: 'compilerFor',
  compilerInputs: 'compilerInputs',
  compilerSourceMaps: 'compilerSourceMaps',
  compilerCompilationApi: 'compilerCompilationApi',
  vitePlugin: 'vitePlugin',
  vitePluginSetup: 'vitePluginSetup',
  vitePluginOptions: 'vitePluginOptions',
  vitePluginTransform: 'vitePluginTransform',
  vitePluginHotReload: 'vitePluginHotReload',
  vitePluginVirtualModules: 'vitePluginVirtualModules',
  vitePluginDiagnostics: 'vitePluginDiagnostics',
  vitePluginSourceMaps: 'vitePluginSourceMaps',
  vitePluginDevtoolsMetadata: 'vitePluginDevtoolsMetadata',
  cli: 'cli',
  cliCommandSurface: 'cliCommandSurface',
  cliProjectCreation: 'cliProjectCreation',
  cliRoleGeneration: 'cliRoleGeneration',
  cliUiPrimitiveAdd: 'cliUiPrimitiveAdd',
  cliConfigMaintenance: 'cliConfigMaintenance',
  cliProjectIntelligence: 'cliProjectIntelligence',
  cliTaskRunners: 'cliTaskRunners',
  cliDevServer: 'cliDevServer',
  cliBuild: 'cliBuild',
  cliTest: 'cliTest',
  configuration: 'configuration',
  configurationFile: 'configurationFile',
  configurationDefaults: 'configurationDefaults',
  configurationUi: 'configurationUi',
  configurationRouter: 'configurationRouter',
  configurationAi: 'configurationAi',
  configurationMaintenance: 'configurationMaintenance',
  routing: 'routing',
  routingRouteTable: 'routingRouteTable',
  routingParamsQuery: 'routingParamsQuery',
  routingLayoutsRedirects: 'routingLayoutsRedirects',
  routingGuards: 'routingGuards',
  routingNavigation: 'routingNavigation',
  routingPreloadingKeepAlive: 'routingPreloadingKeepAlive',
  ssrHydration: 'ssrHydration',
  ssrPackageBoundary: 'ssrPackageBoundary',
  ssrRenderDocument: 'ssrRenderDocument',
  ssrHydrationContract: 'ssrHydrationContract',
  ssrStateSerialization: 'ssrStateSerialization',
  ssrRouter: 'ssrRouter',
  ssrDeferredStreaming: 'ssrDeferredStreaming',
  uiOctober: 'uiOctober',
  theming: 'theming',
  vanrotstyles: 'vanrotstyles',
  testing: 'testing',
  testingComponent: 'testingComponent',
  testingScreen: 'testingScreen',
  testingRouting: 'testingRouting',
  testingStrategy: 'testingStrategy',
  forms: 'forms',
  formsBoundary: 'formsBoundary',
  formsFieldRefs: 'formsFieldRefs',
  formsValidationLifecycle: 'formsValidationLifecycle',
  formsAsyncResources: 'formsAsyncResources',
  formsArraysWizardsErrors: 'formsArraysWizardsErrors',
  formsDraftPersistence: 'formsDraftPersistence',
  formsToolingTests: 'formsToolingTests',
  formatters: 'formatters',
  formattersCompilerOwned: 'formattersCompilerOwned',
  formattersTemplatePipes: 'formattersTemplatePipes',
  formattersBuiltInSuite: 'formattersBuiltInSuite',
  formattersBuiltInArguments: 'formattersBuiltInArguments',
  formattersPipeRoleFiles: 'formattersPipeRoleFiles',
  formattersNamedPresets: 'formattersNamedPresets',
  formattersEnumPipes: 'formattersEnumPipes',
  formattersContext: 'formattersContext',
  formattersCompilerDiagnostics: 'formattersCompilerDiagnostics',
  formattersViteTooling: 'formattersViteTooling',
  formattersTesting: 'formattersTesting',
  devtools: 'devtools',
  devtoolsProjectMap: 'devtoolsProjectMap',
  devtoolsRuntimeGraph: 'devtoolsRuntimeGraph',
  devtoolsViteMetadata: 'devtoolsViteMetadata',
  devtoolsPanelState: 'devtoolsPanelState',
  devtoolsStaleState: 'devtoolsStaleState',
  examples: 'examples',
  exampleMatrix: 'exampleMatrix',
  webglThreejs: 'webglThreejs',
  deployment: 'deployment',
  publicApi: 'publicApi',
  diagnostics: 'diagnostics',
  generatedFiles: 'generatedFiles',
  changelog: 'changelog',
  octoberShowcase: 'octoberShowcase',
  conventions: 'conventions',
  conventionsRoleFiles: 'conventionsRoleFiles',
  conventionsTemplatesStyles: 'conventionsTemplatesStyles',
  conventionsStateLogic: 'conventionsStateLogic',
  conventionsRoutingStrings: 'conventionsRoutingStrings',
  conventionsScopedCss: 'conventionsScopedCss',
  conventionsAiReadable: 'conventionsAiReadable',
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
