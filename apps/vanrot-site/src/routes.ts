import { createRoutes, defineRoutes } from '@vanrot/router';
import { DocsLayout } from './layouts/docs/docs.layout.ts';
import { ComponentAlertPage } from './pages/components/component-alert.page.ts';
import { ComponentArticlePage } from './pages/components/component-article.page.ts';
import { ComponentAvatarPage } from './pages/components/component-avatar.page.ts';
import { ComponentBadgePage } from './pages/components/component-badge.page.ts';
import { ComponentBreadcrumbPage } from './pages/components/component-breadcrumb.page.ts';
import { ComponentButtonPage } from './pages/components/component-button.page.ts';
import { ComponentCardPage } from './pages/components/component-card.page.ts';
import { ComponentCheckboxPage } from './pages/components/component-checkbox.page.ts';
import { ComponentCommandMenuPage } from './pages/components/component-command-menu.page.ts';
import { ComponentContainerPage } from './pages/components/component-container.page.ts';
import { ComponentDialogPage } from './pages/components/component-dialog.page.ts';
import { ComponentDrawerPage } from './pages/components/component-drawer.page.ts';
import { ComponentDropdownPage } from './pages/components/component-dropdown.page.ts';
import { ComponentEmptyStatePage } from './pages/components/component-empty-state.page.ts';
import { ComponentFooterPage } from './pages/components/component-footer.page.ts';
import { ComponentFormFieldPage } from './pages/components/component-form-field.page.ts';
import { ComponentFormPage } from './pages/components/component-form.page.ts';
import { ComponentGalleryPage } from './pages/components/component-gallery.page.ts';
import { ComponentGridPage } from './pages/components/component-grid.page.ts';
import { ComponentHeaderPage } from './pages/components/component-header.page.ts';
import { ComponentImgPage } from './pages/components/component-img.page.ts';
import { ComponentInputPage } from './pages/components/component-input.page.ts';
import { ComponentLabelPage } from './pages/components/component-label.page.ts';
import { ComponentLayoutPage } from './pages/components/component-layout.page.ts';
import { ComponentListItemPage } from './pages/components/component-list-item.page.ts';
import { ComponentListPage } from './pages/components/component-list.page.ts';
import { ComponentLoaderPage } from './pages/components/component-loader.page.ts';
import { ComponentNavPage } from './pages/components/component-nav.page.ts';
import { ComponentPaginationPage } from './pages/components/component-pagination.page.ts';
import { ComponentPopoverPage } from './pages/components/component-popover.page.ts';
import { ComponentRadioGroupPage } from './pages/components/component-radio-group.page.ts';
import { ComponentRadioPage } from './pages/components/component-radio.page.ts';
import { ComponentSectionPage } from './pages/components/component-section.page.ts';
import { ComponentSelectPage } from './pages/components/component-select.page.ts';
import { ComponentSeparatorPage } from './pages/components/component-separator.page.ts';
import { ComponentSidebarPage } from './pages/components/component-sidebar.page.ts';
import { ComponentSkeletonPage } from './pages/components/component-skeleton.page.ts';
import { ComponentSliderPage } from './pages/components/component-slider.page.ts';
import { ComponentSrcPage } from './pages/components/component-src.page.ts';
import { ComponentStatPage } from './pages/components/component-stat.page.ts';
import { ComponentSwitchPage } from './pages/components/component-switch.page.ts';
import { ComponentTabsPage } from './pages/components/component-tabs.page.ts';
import { ComponentTableBodyPage } from './pages/components/component-table-body.page.ts';
import { ComponentTableCaptionPage } from './pages/components/component-table-caption.page.ts';
import { ComponentTableCellPage } from './pages/components/component-table-cell.page.ts';
import { ComponentTableFooterPage } from './pages/components/component-table-footer.page.ts';
import { ComponentTableHeadPage } from './pages/components/component-table-head.page.ts';
import { ComponentTableHeaderPage } from './pages/components/component-table-header.page.ts';
import { ComponentTableRowPage } from './pages/components/component-table-row.page.ts';
import { ComponentTablePage } from './pages/components/component-table.page.ts';
import { ComponentTextareaPage } from './pages/components/component-textarea.page.ts';
import { ComponentTooltipPage } from './pages/components/component-tooltip.page.ts';
import { ComponentToastPage } from './pages/components/component-toast.page.ts';
import { DocsArticlePage } from './pages/docs/docs-article.page.ts';
import { DocsChangelogPage } from './pages/docs/docs-changelog.page.ts';
import { DocsExampleMatrixPage } from './pages/docs/docs-example-matrix.page.ts';
import { DocsReferencePage } from './pages/docs/docs-reference.page.ts';
import { OctoberShowcasePage } from './pages/examples/october-showcase.page.ts';
import { HomePage } from './pages/home/home.page.ts';
import { ReferencePage } from './pages/reference/reference.page.ts';
import {
  getSiteArticle,
  siteArticleKey,
  type SiteArticleKey,
} from './docs/site-data.ts';
import { componentDocPath } from './docs/component-doc-paths.ts';

const routes = createRoutes();
const docsBasePath = '/docs';
const routePath = {
  home: '/',
  docs: docsBasePath,
  components: '/docs/components',
  changelog: '/changelog',
  changelogPackage: '/changelog/:packageSlug',
  docsPublicApi: '/docs/public-api',
  docsDiagnostics: '/docs/diagnostics',
  docsGeneratedFiles: '/docs/generated-files',
  docsExampleMatrix: '/docs/example-matrix',
  componentAlerts: componentDocPath.alert,
  componentAvatars: componentDocPath.avatar,
  componentBadges: componentDocPath.badge,
  componentBreadcrumbs: componentDocPath.breadcrumb,
  componentButtons: componentDocPath.button,
  componentCards: componentDocPath.card,
  componentContainers: componentDocPath.container,
  componentCheckboxes: componentDocPath.checkbox,
  componentCommandMenu: componentDocPath.commandMenu,
  componentDialogs: componentDocPath.dialog,
  componentDrawers: componentDocPath.drawer,
  componentDropdowns: componentDocPath.dropdown,
  componentEmptyStates: componentDocPath.emptyState,
  componentFooters: componentDocPath.footer,
  componentForms: componentDocPath.form,
  componentFormFields: componentDocPath.formField,
  componentGrids: componentDocPath.grid,
  componentHeaders: componentDocPath.header,
  componentImages: componentDocPath.img,
  componentInputs: componentDocPath.input,
  componentLabels: componentDocPath.label,
  componentLayouts: componentDocPath.layout,
  componentLists: componentDocPath.list,
  componentListItems: componentDocPath.listItem,
  componentLoaders: componentDocPath.loader,
  componentNavigation: componentDocPath.nav,
  componentPagination: componentDocPath.pagination,
  componentPopovers: componentDocPath.popover,
  componentRadios: componentDocPath.radio,
  componentRadioGroups: componentDocPath.radioGroup,
  componentSections: componentDocPath.section,
  componentSelects: componentDocPath.select,
  componentSeparators: componentDocPath.separator,
  componentSidebars: componentDocPath.sidebar,
  componentSkeletons: componentDocPath.skeleton,
  componentSliders: componentDocPath.slider,
  componentSources: componentDocPath.src,
  componentStats: componentDocPath.stat,
  componentSwitches: componentDocPath.switch,
  componentTabs: componentDocPath.tabs,
  componentTables: componentDocPath.table,
  componentTableBodies: componentDocPath.tableBody,
  componentTableCaptions: componentDocPath.tableCaption,
  componentTableCells: componentDocPath.tableCell,
  componentTableFooters: componentDocPath.tableFooter,
  componentTableHeads: componentDocPath.tableHead,
  componentTableHeaders: componentDocPath.tableHeader,
  componentTableRows: componentDocPath.tableRow,
  componentTextareas: componentDocPath.textarea,
  componentTooltips: componentDocPath.tooltip,
  componentToasts: componentDocPath.toast,
  reference: '/reference',
} as const;

function componentRoutePerformance() {
  return {
    preload: routes.preload.intent(),
    keepAlive: routes.keepAlive.sessionDay(),
  };
}

const siteTitleSuffix = ' - Vanrot';

function siteDocument(label: string, description: string) {
  return {
    title: `${label}${siteTitleSuffix}`,
    meta: { description },
  };
}

function componentDocument(label: string) {
  return siteDocument(label, `${label} component documentation for Vanrot UI.`);
}

function componentDocsPage(path: string, label: string, page: new () => object) {
  return routes.page({
    path,
    label,
    ...componentDocument(label),
    page,
    ...componentRoutePerformance(),
    nav: routes.nav.hidden(),
    breadcrumb: routes.breadcrumb.root(),
  });
}

const home = routes.page({
  path: routePath.home,
  label: 'Vanrot',
  ...siteDocument(
    'Vanrot',
    'Vanrot framework documentation, UI components, commands, and production readiness.',
  ),
  page: HomePage,
  nav: routes.nav.primary(),
  breadcrumb: routes.breadcrumb.root(),
});

const components = routes.page({
  path: routePath.components,
  label: 'UI',
  ...siteDocument('UI', 'Vanrot UI component gallery and documentation.'),
  page: ComponentGalleryPage,
  ...componentRoutePerformance(),
  nav: routes.nav.primary(),
  breadcrumb: routes.breadcrumb.root(),
});

const docs = routes.layout({
  path: routePath.docs,
  label: 'Framework',
  ...siteDocument('Framework', 'Vanrot framework guides, package references, and conventions.'),
  layout: DocsLayout,
  nav: routes.nav.primary(),
  breadcrumb: routes.breadcrumb.root(),
});

const docsIntroduction = docs.page({
  path: articleChildPath(siteArticleKey.introduction),
  label: getSiteArticle(siteArticleKey.introduction).label,
  ...articleDocument(siteArticleKey.introduction),
  page: DocsArticlePage,
  nav: routes.nav.hidden(),
  breadcrumb: routes.breadcrumb.parent(docs),
});

const componentButtons = routes.page({
  path: routePath.componentButtons,
  label: 'Button',
  ...componentDocument('Button'),
  page: ComponentButtonPage,
  ...componentRoutePerformance(),
  nav: routes.nav.hidden(),
  breadcrumb: routes.breadcrumb.root(),
});

const componentCards = routes.page({
  path: routePath.componentCards,
  label: 'Card',
  ...componentDocument('Card'),
  page: ComponentCardPage,
  ...componentRoutePerformance(),
  nav: routes.nav.hidden(),
  breadcrumb: routes.breadcrumb.root(),
});

const componentBadges = routes.page({
  path: routePath.componentBadges,
  label: 'Badge',
  ...componentDocument('Badge'),
  page: ComponentBadgePage,
  ...componentRoutePerformance(),
  nav: routes.nav.hidden(),
  breadcrumb: routes.breadcrumb.root(),
});

const componentAvatars = routes.page({
  path: routePath.componentAvatars,
  label: 'Avatar',
  ...componentDocument('Avatar'),
  page: ComponentAvatarPage,
  ...componentRoutePerformance(),
  nav: routes.nav.hidden(),
  breadcrumb: routes.breadcrumb.root(),
});

const componentAlerts = routes.page({
  path: routePath.componentAlerts,
  label: 'Alert',
  ...componentDocument('Alert'),
  page: ComponentAlertPage,
  ...componentRoutePerformance(),
  nav: routes.nav.hidden(),
  breadcrumb: routes.breadcrumb.root(),
});

const componentBreadcrumbs = routes.page({
  path: routePath.componentBreadcrumbs,
  label: 'Breadcrumb',
  ...componentDocument('Breadcrumb'),
  page: ComponentBreadcrumbPage,
  ...componentRoutePerformance(),
  nav: routes.nav.hidden(),
  breadcrumb: routes.breadcrumb.root(),
});

const componentContainers = routes.page({
  path: routePath.componentContainers,
  label: 'Container',
  ...componentDocument('Container'),
  page: ComponentContainerPage,
  ...componentRoutePerformance(),
  nav: routes.nav.hidden(),
  breadcrumb: routes.breadcrumb.root(),
});

const componentFooters = routes.page({
  path: routePath.componentFooters,
  label: 'Footer',
  ...componentDocument('Footer'),
  page: ComponentFooterPage,
  ...componentRoutePerformance(),
  nav: routes.nav.hidden(),
  breadcrumb: routes.breadcrumb.root(),
});

const componentGrids = routes.page({
  path: routePath.componentGrids,
  label: 'Grid',
  ...componentDocument('Grid'),
  page: ComponentGridPage,
  ...componentRoutePerformance(),
  nav: routes.nav.hidden(),
  breadcrumb: routes.breadcrumb.root(),
});

const componentHeaders = routes.page({
  path: routePath.componentHeaders,
  label: 'Header',
  ...componentDocument('Header'),
  page: ComponentHeaderPage,
  ...componentRoutePerformance(),
  nav: routes.nav.hidden(),
  breadcrumb: routes.breadcrumb.root(),
});

const componentImages = routes.page({
  path: routePath.componentImages,
  label: 'Image',
  ...componentDocument('Image'),
  page: ComponentImgPage,
  ...componentRoutePerformance(),
  nav: routes.nav.hidden(),
  breadcrumb: routes.breadcrumb.root(),
});

const componentLayouts = routes.page({
  path: routePath.componentLayouts,
  label: 'Layout',
  ...componentDocument('Layout'),
  page: ComponentLayoutPage,
  ...componentRoutePerformance(),
  nav: routes.nav.hidden(),
  breadcrumb: routes.breadcrumb.root(),
});

const componentLoaders = routes.page({
  path: routePath.componentLoaders,
  label: 'Loader',
  ...componentDocument('Loader'),
  page: ComponentLoaderPage,
  ...componentRoutePerformance(),
  nav: routes.nav.hidden(),
  breadcrumb: routes.breadcrumb.root(),
});

const componentNavigation = routes.page({
  path: routePath.componentNavigation,
  label: 'Navigation',
  ...componentDocument('Navigation'),
  page: ComponentNavPage,
  ...componentRoutePerformance(),
  nav: routes.nav.hidden(),
  breadcrumb: routes.breadcrumb.root(),
});

const componentSections = routes.page({
  path: routePath.componentSections,
  label: 'Section',
  ...componentDocument('Section'),
  page: ComponentSectionPage,
  ...componentRoutePerformance(),
  nav: routes.nav.hidden(),
  breadcrumb: routes.breadcrumb.root(),
});

const componentSkeletons = routes.page({
  path: routePath.componentSkeletons,
  label: 'Skeleton',
  ...componentDocument('Skeleton'),
  page: ComponentSkeletonPage,
  ...componentRoutePerformance(),
  nav: routes.nav.hidden(),
  breadcrumb: routes.breadcrumb.root(),
});

const componentSeparators = routes.page({
  path: routePath.componentSeparators,
  label: 'Separator',
  ...componentDocument('Separator'),
  page: ComponentSeparatorPage,
  ...componentRoutePerformance(),
  nav: routes.nav.hidden(),
  breadcrumb: routes.breadcrumb.root(),
});

const componentSidebars = routes.page({
  path: routePath.componentSidebars,
  label: 'Sidebar',
  ...componentDocument('Sidebar'),
  page: ComponentSidebarPage,
  ...componentRoutePerformance(),
  nav: routes.nav.hidden(),
  breadcrumb: routes.breadcrumb.root(),
});

const componentSources = routes.page({
  path: routePath.componentSources,
  label: 'Source',
  ...componentDocument('Source'),
  page: ComponentSrcPage,
  ...componentRoutePerformance(),
  nav: routes.nav.hidden(),
  breadcrumb: routes.breadcrumb.root(),
});

const componentCheckboxes = componentDocsPage(
  routePath.componentCheckboxes,
  'Checkbox',
  ComponentCheckboxPage,
);
const componentDialogs = componentDocsPage(routePath.componentDialogs, 'Dialog', ComponentDialogPage);
const componentDrawers = componentDocsPage(routePath.componentDrawers, 'Drawer', ComponentDrawerPage);
const componentDropdowns = componentDocsPage(
  routePath.componentDropdowns,
  'Dropdown',
  ComponentDropdownPage,
);
const componentEmptyStates = componentDocsPage(
  routePath.componentEmptyStates,
  'Empty State',
  ComponentEmptyStatePage,
);
const componentForms = componentDocsPage(routePath.componentForms, 'Form', ComponentFormPage);
const componentFormFields = componentDocsPage(
  routePath.componentFormFields,
  'Form Field',
  ComponentFormFieldPage,
);
const componentInputs = componentDocsPage(routePath.componentInputs, 'Input', ComponentInputPage);
const componentLabels = componentDocsPage(routePath.componentLabels, 'Label', ComponentLabelPage);
const componentLists = componentDocsPage(routePath.componentLists, 'List', ComponentListPage);
const componentListItems = componentDocsPage(
  routePath.componentListItems,
  'List Item',
  ComponentListItemPage,
);
const componentPagination = componentDocsPage(
  routePath.componentPagination,
  'Pagination',
  ComponentPaginationPage,
);
const componentRadioGroups = componentDocsPage(
  routePath.componentRadioGroups,
  'Radio Group',
  ComponentRadioGroupPage,
);
const componentRadios = componentDocsPage(routePath.componentRadios, 'Radio', ComponentRadioPage);
const componentSelects = componentDocsPage(routePath.componentSelects, 'Select', ComponentSelectPage);
const componentSliders = componentDocsPage(routePath.componentSliders, 'Slider', ComponentSliderPage);
const componentStats = componentDocsPage(routePath.componentStats, 'Stat', ComponentStatPage);
const componentSwitches = componentDocsPage(routePath.componentSwitches, 'Switch', ComponentSwitchPage);
const componentTabs = componentDocsPage(routePath.componentTabs, 'Tabs', ComponentTabsPage);
const componentTables = componentDocsPage(routePath.componentTables, 'Table', ComponentTablePage);
const componentTableBodies = componentDocsPage(
  routePath.componentTableBodies,
  'Table Body',
  ComponentTableBodyPage,
);
const componentTableCaptions = componentDocsPage(
  routePath.componentTableCaptions,
  'Table Caption',
  ComponentTableCaptionPage,
);
const componentTableCells = componentDocsPage(
  routePath.componentTableCells,
  'Table Cell',
  ComponentTableCellPage,
);
const componentTableFooters = componentDocsPage(
  routePath.componentTableFooters,
  'Table Footer',
  ComponentTableFooterPage,
);
const componentTableHeads = componentDocsPage(
  routePath.componentTableHeads,
  'Table Head',
  ComponentTableHeadPage,
);
const componentTableHeaders = componentDocsPage(
  routePath.componentTableHeaders,
  'Table Header',
  ComponentTableHeaderPage,
);
const componentTableRows = componentDocsPage(
  routePath.componentTableRows,
  'Table Row',
  ComponentTableRowPage,
);
const componentTextareas = componentDocsPage(
  routePath.componentTextareas,
  'Textarea',
  ComponentTextareaPage,
);
const componentToasts = componentDocsPage(routePath.componentToasts, 'Toast', ComponentToastPage);
const componentPopovers = componentDocsPage(routePath.componentPopovers, 'Popover', ComponentPopoverPage);
const componentTooltips = componentDocsPage(routePath.componentTooltips, 'Tooltip', ComponentTooltipPage);
const componentCommandMenu = componentDocsPage(
  routePath.componentCommandMenu,
  'Command Menu',
  ComponentCommandMenuPage,
);

const docsInstallation = articlePage(siteArticleKey.installation);
const docsProjectStructure = articlePage(siteArticleKey.projectStructure);
const docsRuntime = articlePage(siteArticleKey.runtime);
const docsRuntimeSignals = articlePage(siteArticleKey.runtimeSignals);
const docsRuntimeInputs = articlePage(siteArticleKey.runtimeInputs);
const docsRuntimeForms = articlePage(siteArticleKey.runtimeForms);
const docsRuntimeControllers = articlePage(siteArticleKey.runtimeControllers);
const docsRuntimeDevtoolsGraph = articlePage(siteArticleKey.runtimeDevtoolsGraph);
const docsRuntimeLifecycle = articlePage(siteArticleKey.runtimeLifecycle);
const docsRuntimeMounting = articlePage(siteArticleKey.runtimeMounting);
const docsBehavior = articlePage(siteArticleKey.behavior);
const docsBehaviorForm = articlePage(siteArticleKey.behaviorForm);
const docsBehaviorOverlay = articlePage(siteArticleKey.behaviorOverlay);
const docsBehaviorTooltip = articlePage(siteArticleKey.behaviorTooltip);
const docsBehaviorTabs = articlePage(siteArticleKey.behaviorTabs);
const docsBehaviorTable = articlePage(siteArticleKey.behaviorTable);
const docsBehaviorToast = articlePage(siteArticleKey.behaviorToast);
const docsBehaviorCommandMenu = articlePage(siteArticleKey.behaviorCommandMenu);
const docsBehaviorPositionedLayer = articlePage(siteArticleKey.behaviorPositionedLayer);
const docsSeo = articlePage(siteArticleKey.seo);
const docsSeoPackageBoundary = articlePage(siteArticleKey.seoPackageBoundary);
const docsSeoMetadataLadder = articlePage(siteArticleKey.seoMetadataLadder);
const docsSeoConfigControlPlane = articlePage(siteArticleKey.seoConfigControlPlane);
const docsSeoCreateAndAddFlows = articlePage(siteArticleKey.seoCreateAndAddFlows);
const docsSeoDoctorAndBuildOutput = articlePage(siteArticleKey.seoDoctorAndBuildOutput);
const docsSeoSocialImages = articlePage(siteArticleKey.seoSocialImages);
const docsCompiler = articlePage(siteArticleKey.compiler);
const docsCompilerFileConventions = articlePage(siteArticleKey.compilerFileConventions);
const docsCompilerComponentClass = articlePage(siteArticleKey.compilerComponentClass);
const docsCompilerTemplateSyntax = articlePage(siteArticleKey.compilerTemplateSyntax);
const docsCompilerExpressions = articlePage(siteArticleKey.compilerExpressions);
const docsCompilerEventBinding = articlePage(siteArticleKey.compilerEventBinding);
const docsCompilerScopedCss = articlePage(siteArticleKey.compilerScopedCss);
const docsCompilerChildComponents = articlePage(siteArticleKey.compilerChildComponents);
const docsCompilerSlots = articlePage(siteArticleKey.compilerSlots);
const docsCompilerIfElse = articlePage(siteArticleKey.compilerIfElse);
const docsCompilerFor = articlePage(siteArticleKey.compilerFor);
const docsCompilerInputs = articlePage(siteArticleKey.compilerInputs);
const docsCompilerSourceMaps = articlePage(siteArticleKey.compilerSourceMaps);
const docsCompilerCompilationApi = articlePage(siteArticleKey.compilerCompilationApi);
const docsVitePlugin = articlePage(siteArticleKey.vitePlugin);
const docsVitePluginSetup = articlePage(siteArticleKey.vitePluginSetup);
const docsVitePluginOptions = articlePage(siteArticleKey.vitePluginOptions);
const docsVitePluginTransform = articlePage(siteArticleKey.vitePluginTransform);
const docsVitePluginHotReload = articlePage(siteArticleKey.vitePluginHotReload);
const docsVitePluginVirtualModules = articlePage(siteArticleKey.vitePluginVirtualModules);
const docsVitePluginDiagnostics = articlePage(siteArticleKey.vitePluginDiagnostics);
const docsVitePluginSourceMaps = articlePage(siteArticleKey.vitePluginSourceMaps);
const docsVitePluginDevtoolsMetadata = articlePage(siteArticleKey.vitePluginDevtoolsMetadata);
const docsCli = articlePage(siteArticleKey.cli);
const docsCliCommandSurface = articlePage(siteArticleKey.cliCommandSurface);
const docsCliProjectCreation = articlePage(siteArticleKey.cliProjectCreation);
const docsCliRoleGeneration = articlePage(siteArticleKey.cliRoleGeneration);
const docsCliUiPrimitiveAdd = articlePage(siteArticleKey.cliUiPrimitiveAdd);
const docsCliConfigMaintenance = articlePage(siteArticleKey.cliConfigMaintenance);
const docsCliProjectIntelligence = articlePage(siteArticleKey.cliProjectIntelligence);
const docsCliTaskRunners = articlePage(siteArticleKey.cliTaskRunners);
const docsCliDevServer = articlePage(siteArticleKey.cliDevServer);
const docsCliBuild = articlePage(siteArticleKey.cliBuild);
const docsCliTest = articlePage(siteArticleKey.cliTest);
const docsConfiguration = articlePage(siteArticleKey.configuration);
const docsConfigurationFile = articlePage(siteArticleKey.configurationFile);
const docsConfigurationDefaults = articlePage(siteArticleKey.configurationDefaults);
const docsConfigurationUi = articlePage(siteArticleKey.configurationUi);
const docsConfigurationRouter = articlePage(siteArticleKey.configurationRouter);
const docsConfigurationAi = articlePage(siteArticleKey.configurationAi);
const docsConfigurationMaintenance = articlePage(siteArticleKey.configurationMaintenance);
const docsRouting = articlePage(siteArticleKey.routing);
const docsRoutingRouteTable = articlePage(siteArticleKey.routingRouteTable);
const docsRoutingParamsQuery = articlePage(siteArticleKey.routingParamsQuery);
const docsRoutingLayoutsRedirects = articlePage(siteArticleKey.routingLayoutsRedirects);
const docsRoutingGuards = articlePage(siteArticleKey.routingGuards);
const docsRoutingNavigation = articlePage(siteArticleKey.routingNavigation);
const docsRoutingPreloadingKeepAlive = articlePage(siteArticleKey.routingPreloadingKeepAlive);
const docsSsrHydration = articlePage(siteArticleKey.ssrHydration);
const docsSsrPackageBoundary = articlePage(siteArticleKey.ssrPackageBoundary);
const docsSsrRenderDocument = articlePage(siteArticleKey.ssrRenderDocument);
const docsSsrHydrationContract = articlePage(siteArticleKey.ssrHydrationContract);
const docsSsrStateSerialization = articlePage(siteArticleKey.ssrStateSerialization);
const docsSsrRouter = articlePage(siteArticleKey.ssrRouter);
const docsSsrDeferredStreaming = articlePage(siteArticleKey.ssrDeferredStreaming);
const docsUi = articlePage(siteArticleKey.uiOctober);
const docsTheming = articlePage(siteArticleKey.theming);
const docsVanrotstyles = articlePage(siteArticleKey.vanrotstyles);
const docsTesting = articlePage(siteArticleKey.testing);
const docsTestingComponent = articlePage(siteArticleKey.testingComponent);
const docsTestingScreen = articlePage(siteArticleKey.testingScreen);
const docsTestingRouting = articlePage(siteArticleKey.testingRouting);
const docsTestingStrategy = articlePage(siteArticleKey.testingStrategy);
const docsForms = articlePage(siteArticleKey.forms);
const docsFormsBoundary = articlePage(siteArticleKey.formsBoundary);
const docsFormsFieldRefs = articlePage(siteArticleKey.formsFieldRefs);
const docsFormsValidationLifecycle = articlePage(siteArticleKey.formsValidationLifecycle);
const docsFormsAsyncResources = articlePage(siteArticleKey.formsAsyncResources);
const docsFormsArraysWizardsErrors = articlePage(siteArticleKey.formsArraysWizardsErrors);
const docsFormsDraftPersistence = articlePage(siteArticleKey.formsDraftPersistence);
const docsFormsToolingTests = articlePage(siteArticleKey.formsToolingTests);
const docsStore = articlePage(siteArticleKey.store);
const docsStoreActions = articlePage(siteArticleKey.storeActions);
const docsStoreSelectors = articlePage(siteArticleKey.storeSelectors);
const docsStoreReducers = articlePage(siteArticleKey.storeReducers);
const docsStoreEffects = articlePage(siteArticleKey.storeEffects);
const docsStorePageUsage = articlePage(siteArticleKey.storePageUsage);
const docsStoreInspection = articlePage(siteArticleKey.storeInspection);
const docsStoreReplay = articlePage(siteArticleKey.storeReplay);
const docsFormatters = articlePage(siteArticleKey.formatters);
const docsFormattersCompilerOwned = articlePage(siteArticleKey.formattersCompilerOwned);
const docsFormattersTemplatePipes = articlePage(siteArticleKey.formattersTemplatePipes);
const docsFormattersBuiltInSuite = articlePage(siteArticleKey.formattersBuiltInSuite);
const docsFormattersBuiltInArguments = articlePage(siteArticleKey.formattersBuiltInArguments);
const docsFormattersPipeRoleFiles = articlePage(siteArticleKey.formattersPipeRoleFiles);
const docsFormattersNamedPresets = articlePage(siteArticleKey.formattersNamedPresets);
const docsFormattersEnumPipes = articlePage(siteArticleKey.formattersEnumPipes);
const docsFormattersContext = articlePage(siteArticleKey.formattersContext);
const docsFormattersCompilerDiagnostics = articlePage(siteArticleKey.formattersCompilerDiagnostics);
const docsFormattersViteTooling = articlePage(siteArticleKey.formattersViteTooling);
const docsFormattersTesting = articlePage(siteArticleKey.formattersTesting);
const docsDevtools = articlePage(siteArticleKey.devtools);
const docsDevtoolsProjectMap = articlePage(siteArticleKey.devtoolsProjectMap);
const docsDevtoolsRuntimeGraph = articlePage(siteArticleKey.devtoolsRuntimeGraph);
const docsDevtoolsViteMetadata = articlePage(siteArticleKey.devtoolsViteMetadata);
const docsDevtoolsPanelState = articlePage(siteArticleKey.devtoolsPanelState);
const docsDevtoolsStaleState = articlePage(siteArticleKey.devtoolsStaleState);
const docsExamples = articlePage(siteArticleKey.examples);
const docsExampleMatrix = docs.page({
  path: docsChildPath(routePath.docsExampleMatrix),
  label: getSiteArticle(siteArticleKey.exampleMatrix).label,
  ...articleDocument(siteArticleKey.exampleMatrix),
  page: DocsExampleMatrixPage,
  breadcrumb: routes.breadcrumb.parent(docs),
});
const docsWebglThreejs = articlePage(siteArticleKey.webglThreejs);
const docsOctoberShowcase = docs.page({
  path: articleChildPath(siteArticleKey.octoberShowcase),
  label: getSiteArticle(siteArticleKey.octoberShowcase).label,
  ...articleDocument(siteArticleKey.octoberShowcase),
  page: OctoberShowcasePage,
  breadcrumb: routes.breadcrumb.parent(docs),
});
const docsConventions = articlePage(siteArticleKey.conventions);
const docsConventionsRoleFiles = articlePage(siteArticleKey.conventionsRoleFiles);
const docsConventionsTemplatesStyles = articlePage(siteArticleKey.conventionsTemplatesStyles);
const docsConventionsStateLogic = articlePage(siteArticleKey.conventionsStateLogic);
const docsConventionsRoutingStrings = articlePage(siteArticleKey.conventionsRoutingStrings);
const docsConventionsScopedCss = articlePage(siteArticleKey.conventionsScopedCss);
const docsConventionsAiReadable = articlePage(siteArticleKey.conventionsAiReadable);
const docsDeployment = articlePage(siteArticleKey.deployment);
const docsChangelog = docs.page({
  path: articleChildPath(siteArticleKey.changelog),
  label: getSiteArticle(siteArticleKey.changelog).label,
  ...articleDocument(siteArticleKey.changelog),
  page: DocsChangelogPage,
  breadcrumb: routes.breadcrumb.parent(docs),
});
const docsLimitations = articlePage(siteArticleKey.limitations);
const docsReferenceStatus = articlePage(siteArticleKey.referenceStatus);

const docsPublicApi = docs.page({
  path: docsChildPath(routePath.docsPublicApi),
  label: getSiteArticle(siteArticleKey.publicApi).label,
  ...articleDocument(siteArticleKey.publicApi),
  page: DocsReferencePage,
  breadcrumb: routes.breadcrumb.parent(docs),
});

const docsDiagnostics = docs.page({
  path: docsChildPath(routePath.docsDiagnostics),
  label: getSiteArticle(siteArticleKey.diagnostics).label,
  ...articleDocument(siteArticleKey.diagnostics),
  page: DocsReferencePage,
  breadcrumb: routes.breadcrumb.parent(docs),
});

const docsGeneratedFiles = docs.page({
  path: docsChildPath(routePath.docsGeneratedFiles),
  label: getSiteArticle(siteArticleKey.generatedFiles).label,
  ...articleDocument(siteArticleKey.generatedFiles),
  page: DocsReferencePage,
  breadcrumb: routes.breadcrumb.parent(docs),
});

const changelog = routes.page({
  path: routePath.changelog,
  label: getSiteArticle(siteArticleKey.changelog).label,
  ...articleDocument(siteArticleKey.changelog),
  page: DocsChangelogPage,
  nav: routes.nav.primary(),
  breadcrumb: routes.breadcrumb.root(),
});

const changelogPackage = routes.page({
  path: routePath.changelogPackage,
  label: getSiteArticle(siteArticleKey.changelog).label,
  ...articleDocument(siteArticleKey.changelog),
  page: DocsChangelogPage,
  nav: routes.nav.hidden(),
  breadcrumb: routes.breadcrumb.parent(changelog),
});

const reference = routes.page({
  path: routePath.reference,
  label: getSiteArticle(siteArticleKey.referenceStatus).label,
  ...articleDocument(siteArticleKey.referenceStatus),
  page: ReferencePage,
  nav: routes.nav.hidden(),
  breadcrumb: routes.breadcrumb.root(),
});

const uiButton = componentPage('button', 'Button');
const uiCard = componentPage('card', 'Card');
const uiBadge = componentPage('badge', 'Badge');
const uiAvatar = componentPage('avatar', 'Avatar');
const uiAlert = componentPage('alert', 'Alert');
const uiLoader = componentPage('loader', 'Loader');
const uiSkeleton = componentPage('skeleton', 'Skeleton');
const uiSeparator = componentPage('separator', 'Separator');
const uiLayout = componentPage('layout', 'Layout');
const uiContainer = componentPage('container', 'Container');
const uiSection = componentPage('section', 'Section');
const uiGrid = componentPage('grid', 'Grid');
const uiHeader = componentPage('header', 'Header');
const uiFooter = componentPage('footer', 'Footer');
const uiSidebar = componentPage('sidebar', 'Sidebar');
const uiNav = componentPage('nav', 'Navigation');
const uiBreadcrumb = componentPage('breadcrumb', 'Breadcrumb');
const uiImg = componentPage('img', 'Image');
const uiSrc = componentPage('src', 'Source');

export const route = defineRoutes({
  home,
  components,
  docs,
  changelog,
  componentButtons,
  componentCards,
  componentBadges,
  componentAvatars,
  componentAlerts,
  componentBreadcrumbs,
  componentCheckboxes,
  componentCommandMenu,
  componentContainers,
  componentDialogs,
  componentDrawers,
  componentDropdowns,
  componentEmptyStates,
  componentFooters,
  componentForms,
  componentFormFields,
  componentGrids,
  componentHeaders,
  componentImages,
  componentInputs,
  componentLabels,
  componentLayouts,
  componentLists,
  componentListItems,
  componentLoaders,
  componentNavigation,
  componentPagination,
  componentPopovers,
  componentRadios,
  componentRadioGroups,
  componentSections,
  componentSelects,
  componentSkeletons,
  componentSeparators,
  componentSidebars,
  componentSliders,
  componentSources,
  componentStats,
  componentSwitches,
  componentTabs,
  componentTables,
  componentTableBodies,
  componentTableCaptions,
  componentTableCells,
  componentTableFooters,
  componentTableHeads,
  componentTableHeaders,
  componentTableRows,
  componentTextareas,
  componentTooltips,
  componentToasts,
  docsIntroduction,
  docsInstallation,
  docsProjectStructure,
  docsRuntime,
  docsRuntimeSignals,
  docsRuntimeInputs,
  docsRuntimeForms,
  docsRuntimeControllers,
  docsRuntimeDevtoolsGraph,
  docsRuntimeLifecycle,
  docsRuntimeMounting,
  docsBehavior,
  docsBehaviorForm,
  docsBehaviorOverlay,
  docsBehaviorTooltip,
  docsBehaviorTabs,
  docsBehaviorTable,
  docsBehaviorToast,
  docsBehaviorCommandMenu,
  docsBehaviorPositionedLayer,
  docsSeo,
  docsSeoPackageBoundary,
  docsSeoMetadataLadder,
  docsSeoConfigControlPlane,
  docsSeoCreateAndAddFlows,
  docsSeoDoctorAndBuildOutput,
  docsSeoSocialImages,
  docsCompiler,
  docsCompilerFileConventions,
  docsCompilerComponentClass,
  docsCompilerTemplateSyntax,
  docsCompilerExpressions,
  docsCompilerEventBinding,
  docsCompilerScopedCss,
  docsCompilerChildComponents,
  docsCompilerSlots,
  docsCompilerIfElse,
  docsCompilerFor,
  docsCompilerInputs,
  docsCompilerSourceMaps,
  docsCompilerCompilationApi,
  docsVitePlugin,
  docsVitePluginSetup,
  docsVitePluginOptions,
  docsVitePluginTransform,
  docsVitePluginHotReload,
  docsVitePluginVirtualModules,
  docsVitePluginDiagnostics,
  docsVitePluginSourceMaps,
  docsVitePluginDevtoolsMetadata,
  docsCli,
  docsCliCommandSurface,
  docsCliProjectCreation,
  docsCliRoleGeneration,
  docsCliUiPrimitiveAdd,
  docsCliConfigMaintenance,
  docsCliProjectIntelligence,
  docsCliTaskRunners,
  docsCliDevServer,
  docsCliBuild,
  docsCliTest,
  docsConfiguration,
  docsConfigurationFile,
  docsConfigurationDefaults,
  docsConfigurationUi,
  docsConfigurationRouter,
  docsConfigurationAi,
  docsConfigurationMaintenance,
  docsRouting,
  docsRoutingRouteTable,
  docsRoutingParamsQuery,
  docsRoutingLayoutsRedirects,
  docsRoutingGuards,
  docsRoutingNavigation,
  docsRoutingPreloadingKeepAlive,
  docsSsrHydration,
  docsSsrPackageBoundary,
  docsSsrRenderDocument,
  docsSsrHydrationContract,
  docsSsrStateSerialization,
  docsSsrRouter,
  docsSsrDeferredStreaming,
  docsUi,
  docsTheming,
  docsVanrotstyles,
  docsTesting,
  docsTestingComponent,
  docsTestingScreen,
  docsTestingRouting,
  docsTestingStrategy,
  docsForms,
  docsFormsBoundary,
  docsFormsFieldRefs,
  docsFormsValidationLifecycle,
  docsFormsAsyncResources,
  docsFormsArraysWizardsErrors,
  docsFormsDraftPersistence,
  docsFormsToolingTests,
  docsStore,
  docsStoreActions,
  docsStoreSelectors,
  docsStoreReducers,
  docsStoreEffects,
  docsStorePageUsage,
  docsStoreInspection,
  docsStoreReplay,
  docsFormatters,
  docsFormattersCompilerOwned,
  docsFormattersTemplatePipes,
  docsFormattersBuiltInSuite,
  docsFormattersBuiltInArguments,
  docsFormattersPipeRoleFiles,
  docsFormattersNamedPresets,
  docsFormattersEnumPipes,
  docsFormattersContext,
  docsFormattersCompilerDiagnostics,
  docsFormattersViteTooling,
  docsFormattersTesting,
  docsDevtools,
  docsDevtoolsProjectMap,
  docsDevtoolsRuntimeGraph,
  docsDevtoolsViteMetadata,
  docsDevtoolsPanelState,
  docsDevtoolsStaleState,
  docsExamples,
  docsExampleMatrix,
  docsWebglThreejs,
  docsOctoberShowcase,
  docsConventions,
  docsConventionsRoleFiles,
  docsConventionsTemplatesStyles,
  docsConventionsStateLogic,
  docsConventionsRoutingStrings,
  docsConventionsScopedCss,
  docsConventionsAiReadable,
  docsDeployment,
  docsPublicApi,
  docsDiagnostics,
  docsGeneratedFiles,
  docsChangelog,
  docsLimitations,
  docsReferenceStatus,
  reference,
  changelogPackage,
  uiButton,
  uiCard,
  uiBadge,
  uiAvatar,
  uiAlert,
  uiLoader,
  uiSkeleton,
  uiSeparator,
  uiLayout,
  uiContainer,
  uiSection,
  uiGrid,
  uiHeader,
  uiFooter,
  uiSidebar,
  uiNav,
  uiBreadcrumb,
  uiImg,
  uiSrc,
});

function articlePage(key: SiteArticleKey) {
  const article = getSiteArticle(key);

  return docs.page({
    path: articleChildPath(key),
    label: article.label,
    ...articleDocument(key),
    page: DocsArticlePage,
    breadcrumb: routes.breadcrumb.parent(docs),
  });
}

function componentPage(primitive: string, label: string) {
  return docs.page({
    path: `ui/${primitive}`,
    label,
    ...componentDocument(label),
    page: ComponentArticlePage,
    breadcrumb: routes.breadcrumb.parent(docs),
  });
}

function articleDocument(key: SiteArticleKey) {
  const article = getSiteArticle(key);

  return siteDocument(article.title, article.summary);
}

function articleChildPath(key: SiteArticleKey): string {
  const path = getSiteArticle(key).path;

  return docsChildPath(path);
}

function docsChildPath(path: string): string {
  if (path === docsBasePath) {
    return '';
  }

  return path.slice(docsBasePath.length + 1);
}
