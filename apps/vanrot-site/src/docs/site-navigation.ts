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
  children: readonly SiteNavigationItem[];
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

function navItem(
  key: SiteArticleKey,
  children: readonly SiteNavigationItem[] = [],
): SiteNavigationItem {
  const article = getSiteArticle(key);

  return {
    key,
    href: article.path,
    label: article.label,
    children,
  };
}

function componentNavItem(doc: ComponentDoc): SiteNavigationItem {
  return {
    key: doc.primitive,
    href: doc.href,
    label: doc.title,
    children: [],
  };
}

const runtimeNavigationChildren = [
  navItem(siteArticleKey.runtimeSignals),
  navItem(siteArticleKey.runtimeInputs),
  navItem(siteArticleKey.runtimeForms),
  navItem(siteArticleKey.runtimeControllers),
  navItem(siteArticleKey.runtimeDevtoolsGraph),
  navItem(siteArticleKey.runtimeLifecycle),
  navItem(siteArticleKey.runtimeMounting),
] as const;

const compilerNavigationChildren = [
  navItem(siteArticleKey.compilerFileConventions),
  navItem(siteArticleKey.compilerComponentClass),
  navItem(siteArticleKey.compilerTemplateSyntax),
  navItem(siteArticleKey.compilerExpressions),
  navItem(siteArticleKey.compilerEventBinding),
  navItem(siteArticleKey.compilerScopedCss),
  navItem(siteArticleKey.compilerChildComponents),
  navItem(siteArticleKey.compilerSlots),
  navItem(siteArticleKey.compilerIfElse),
  navItem(siteArticleKey.compilerFor),
  navItem(siteArticleKey.compilerInputs),
  navItem(siteArticleKey.compilerSourceMaps),
  navItem(siteArticleKey.compilerCompilationApi),
] as const;

const vitePluginNavigationChildren = [
  navItem(siteArticleKey.vitePluginSetup),
  navItem(siteArticleKey.vitePluginOptions),
  navItem(siteArticleKey.vitePluginTransform),
  navItem(siteArticleKey.vitePluginHotReload),
  navItem(siteArticleKey.vitePluginVirtualModules),
  navItem(siteArticleKey.vitePluginDiagnostics),
  navItem(siteArticleKey.vitePluginSourceMaps),
  navItem(siteArticleKey.vitePluginDevtoolsMetadata),
] as const;

const cliNavigationChildren = [
  navItem(siteArticleKey.cliCommandSurface),
  navItem(siteArticleKey.cliProjectCreation),
  navItem(siteArticleKey.cliRoleGeneration),
  navItem(siteArticleKey.cliUiPrimitiveAdd),
  navItem(siteArticleKey.cliConfigMaintenance),
  navItem(siteArticleKey.cliProjectIntelligence),
  navItem(siteArticleKey.cliTaskRunners),
  navItem(siteArticleKey.cliDevServer),
  navItem(siteArticleKey.cliBuild),
  navItem(siteArticleKey.cliTest),
] as const;

const configurationNavigationChildren = [
  navItem(siteArticleKey.configurationFile),
  navItem(siteArticleKey.configurationDefaults),
  navItem(siteArticleKey.configurationUi),
  navItem(siteArticleKey.configurationRouter),
  navItem(siteArticleKey.configurationAi),
  navItem(siteArticleKey.configurationMaintenance),
] as const;

const routingNavigationChildren = [
  navItem(siteArticleKey.routingRouteTable),
  navItem(siteArticleKey.routingParamsQuery),
  navItem(siteArticleKey.routingLayoutsRedirects),
  navItem(siteArticleKey.routingGuards),
  navItem(siteArticleKey.routingNavigation),
  navItem(siteArticleKey.routingPreloadingKeepAlive),
] as const;

const testingNavigationChildren = [
  navItem(siteArticleKey.testingComponent),
  navItem(siteArticleKey.testingScreen),
  navItem(siteArticleKey.testingRouting),
  navItem(siteArticleKey.testingStrategy),
] as const;

const devtoolsNavigationChildren = [
  navItem(siteArticleKey.devtoolsProjectMap),
  navItem(siteArticleKey.devtoolsRuntimeGraph),
  navItem(siteArticleKey.devtoolsViteMetadata),
  navItem(siteArticleKey.devtoolsPanelState),
  navItem(siteArticleKey.devtoolsStaleState),
] as const;

const conventionsNavigationChildren = [
  navItem(siteArticleKey.conventionsRoleFiles),
  navItem(siteArticleKey.conventionsTemplatesStyles),
  navItem(siteArticleKey.conventionsStateLogic),
  navItem(siteArticleKey.conventionsRoutingStrings),
  navItem(siteArticleKey.conventionsScopedCss),
  navItem(siteArticleKey.conventionsAiReadable),
] as const;

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
      navItem(siteArticleKey.runtime, runtimeNavigationChildren),
      navItem(siteArticleKey.behavior),
      navItem(siteArticleKey.compiler, compilerNavigationChildren),
      navItem(siteArticleKey.vitePlugin, vitePluginNavigationChildren),
      navItem(siteArticleKey.cli, cliNavigationChildren),
      navItem(siteArticleKey.configuration, configurationNavigationChildren),
      navItem(siteArticleKey.routing, routingNavigationChildren),
      navItem(siteArticleKey.testing, testingNavigationChildren),
      navItem(siteArticleKey.devtools, devtoolsNavigationChildren),
      navItem(siteArticleKey.conventions, conventionsNavigationChildren),
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
      navItem(siteArticleKey.changelog),
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

export function flattenNavigationItems(
  items: readonly SiteNavigationItem[],
): readonly SiteNavigationItem[] {
  return items.flatMap((item) => [item, ...flattenNavigationItems(item.children)]);
}
