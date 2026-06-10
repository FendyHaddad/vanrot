import { IntroductionPage as introductionPageComponent, introductionArticle } from '../pages/docs/get-started/introduction/introduction.page.ts';
import { InstallationPage as installationPageComponent, installationArticle } from '../pages/docs/get-started/installation/installation.page.ts';
import { ProjectStructurePage as projectStructurePageComponent, projectStructureArticle } from '../pages/docs/get-started/project-structure/project-structure.page.ts';
import { RuntimePage as runtimePageComponent, runtimeArticle } from '../pages/docs/framework/runtime/runtime.page.ts';
import { SignalsPage as runtimeSignalsPageComponent, runtimeSignalsArticle } from '../pages/docs/framework/runtime/signals/signals.page.ts';
import { InputsPage as runtimeInputsPageComponent, runtimeInputsArticle } from '../pages/docs/framework/runtime/inputs/inputs.page.ts';
import { FormsPage as runtimeFormsPageComponent, runtimeFormsArticle } from '../pages/docs/framework/runtime/forms/forms.page.ts';
import { ControllersPage as runtimeControllersPageComponent, runtimeControllersArticle } from '../pages/docs/framework/runtime/controllers/controllers.page.ts';
import { DevtoolsGraphPage as runtimeDevtoolsGraphPageComponent, runtimeDevtoolsGraphArticle } from '../pages/docs/framework/runtime/devtools-graph/devtools-graph.page.ts';
import { LifecyclePage as runtimeLifecyclePageComponent, runtimeLifecycleArticle } from '../pages/docs/framework/runtime/lifecycle/lifecycle.page.ts';
import { MountingPage as runtimeMountingPageComponent, runtimeMountingArticle } from '../pages/docs/framework/runtime/mounting/mounting.page.ts';
import { BehaviorPage as behaviorPageComponent, behaviorArticle } from '../pages/docs/framework/behavior/behavior.page.ts';
import { FormPage as behaviorFormPageComponent, behaviorFormArticle } from '../pages/docs/framework/behavior/form/form.page.ts';
import { OverlayPage as behaviorOverlayPageComponent, behaviorOverlayArticle } from '../pages/docs/framework/behavior/overlay/overlay.page.ts';
import { TooltipPage as behaviorTooltipPageComponent, behaviorTooltipArticle } from '../pages/docs/framework/behavior/tooltip/tooltip.page.ts';
import { TabsPage as behaviorTabsPageComponent, behaviorTabsArticle } from '../pages/docs/framework/behavior/tabs/tabs.page.ts';
import { TablePage as behaviorTablePageComponent, behaviorTableArticle } from '../pages/docs/framework/behavior/table/table.page.ts';
import { ToastPage as behaviorToastPageComponent, behaviorToastArticle } from '../pages/docs/framework/behavior/toast/toast.page.ts';
import { CommandMenuPage as behaviorCommandMenuPageComponent, behaviorCommandMenuArticle } from '../pages/docs/framework/behavior/command-menu/command-menu.page.ts';
import { PositionedLayerPage as behaviorPositionedLayerPageComponent, behaviorPositionedLayerArticle } from '../pages/docs/framework/behavior/positioned-layer/positioned-layer.page.ts';
import { SeoPage as seoPageComponent, seoArticle } from '../pages/docs/framework/seo/seo.page.ts';
import { PackageBoundaryPage as seoPackageBoundaryPageComponent, seoPackageBoundaryArticle } from '../pages/docs/framework/seo/package-boundary/package-boundary.page.ts';
import { MetadataLadderPage as seoMetadataLadderPageComponent, seoMetadataLadderArticle } from '../pages/docs/framework/seo/metadata-ladder/metadata-ladder.page.ts';
import { ConfigControlPlanePage as seoConfigControlPlanePageComponent, seoConfigControlPlaneArticle } from '../pages/docs/framework/seo/config-control-plane/config-control-plane.page.ts';
import { CreateAndAddFlowsPage as seoCreateAndAddFlowsPageComponent, seoCreateAndAddFlowsArticle } from '../pages/docs/framework/seo/create-and-add-flows/create-and-add-flows.page.ts';
import { DoctorAndBuildOutputPage as seoDoctorAndBuildOutputPageComponent, seoDoctorAndBuildOutputArticle } from '../pages/docs/framework/seo/doctor-and-build-output/doctor-and-build-output.page.ts';
import { SocialImagesPage as seoSocialImagesPageComponent, seoSocialImagesArticle } from '../pages/docs/framework/seo/social-images/social-images.page.ts';
import { CompilerPage as compilerPageComponent, compilerArticle } from '../pages/docs/framework/compiler/compiler.page.ts';
import { FileConventionsPage as compilerFileConventionsPageComponent, compilerFileConventionsArticle } from '../pages/docs/framework/compiler/file-conventions/file-conventions.page.ts';
import { ComponentClassPage as compilerComponentClassPageComponent, compilerComponentClassArticle } from '../pages/docs/framework/compiler/component-class/component-class.page.ts';
import { TemplateSyntaxPage as compilerTemplateSyntaxPageComponent, compilerTemplateSyntaxArticle } from '../pages/docs/framework/compiler/template-syntax/template-syntax.page.ts';
import { ExpressionsPage as compilerExpressionsPageComponent, compilerExpressionsArticle } from '../pages/docs/framework/compiler/expressions/expressions.page.ts';
import { EventBindingPage as compilerEventBindingPageComponent, compilerEventBindingArticle } from '../pages/docs/framework/compiler/event-binding/event-binding.page.ts';
import { ScopedCssPage as compilerScopedCssPageComponent, compilerScopedCssArticle } from '../pages/docs/framework/compiler/scoped-css/scoped-css.page.ts';
import { ChildComponentsPage as compilerChildComponentsPageComponent, compilerChildComponentsArticle } from '../pages/docs/framework/compiler/child-components/child-components.page.ts';
import { SlotsPage as compilerSlotsPageComponent, compilerSlotsArticle } from '../pages/docs/framework/compiler/slots/slots.page.ts';
import { ForPage as compilerForPageComponent, compilerForArticle } from '../pages/docs/framework/compiler/for/for.page.ts';
import { IfElsePage as compilerIfElsePageComponent, compilerIfElseArticle } from '../pages/docs/framework/compiler/if-else/if-else.page.ts';
import { InputsPage as compilerInputsPageComponent, compilerInputsArticle } from '../pages/docs/framework/compiler/inputs/inputs.page.ts';
import { SourceMapsPage as compilerSourceMapsPageComponent, compilerSourceMapsArticle } from '../pages/docs/framework/compiler/source-maps/source-maps.page.ts';
import { CompilationApiPage as compilerCompilationApiPageComponent, compilerCompilationApiArticle } from '../pages/docs/framework/compiler/compilation-api/compilation-api.page.ts';
import { VitePluginPage as vitePluginPageComponent, vitePluginArticle } from '../pages/docs/framework/vite-plugin/vite-plugin.page.ts';
import { SetupPage as vitePluginSetupPageComponent, vitePluginSetupArticle } from '../pages/docs/framework/vite-plugin/setup/setup.page.ts';
import { OptionsPage as vitePluginOptionsPageComponent, vitePluginOptionsArticle } from '../pages/docs/framework/vite-plugin/options/options.page.ts';
import { RoleFileTransformPage as vitePluginTransformPageComponent, vitePluginTransformArticle } from '../pages/docs/framework/vite-plugin/role-file-transform/role-file-transform.page.ts';
import { HotReloadPage as vitePluginHotReloadPageComponent, vitePluginHotReloadArticle } from '../pages/docs/framework/vite-plugin/hot-reload/hot-reload.page.ts';
import { VirtualModulesPage as vitePluginVirtualModulesPageComponent, vitePluginVirtualModulesArticle } from '../pages/docs/framework/vite-plugin/virtual-modules/virtual-modules.page.ts';
import { DiagnosticsPage as vitePluginDiagnosticsPageComponent, vitePluginDiagnosticsArticle } from '../pages/docs/framework/vite-plugin/diagnostics/diagnostics.page.ts';
import { SourceMapsPage as vitePluginSourceMapsPageComponent, vitePluginSourceMapsArticle } from '../pages/docs/framework/vite-plugin/source-maps/source-maps.page.ts';
import { DevtoolsMetadataPage as vitePluginDevtoolsMetadataPageComponent, vitePluginDevtoolsMetadataArticle } from '../pages/docs/framework/vite-plugin/devtools-metadata/devtools-metadata.page.ts';
import { ForgePage as forgePageComponent, forgeArticle } from '../pages/docs/framework/forge/forge.page.ts';
import { DevPage as forgeDevPageComponent, forgeDevArticle } from '../pages/docs/framework/forge/dev/dev.page.ts';
import { BuildPage as forgeBuildPageComponent, forgeBuildArticle } from '../pages/docs/framework/forge/build/build.page.ts';
import { ConfigPage as forgeConfigPageComponent, forgeConfigArticle } from '../pages/docs/framework/forge/config/config.page.ts';
import { HooksPage as forgeHooksPageComponent, forgeHooksArticle } from '../pages/docs/framework/forge/hooks/hooks.page.ts';
import { BenchmarksPage as forgeBenchmarksPageComponent, forgeBenchmarksArticle } from '../pages/docs/framework/forge/benchmarks/benchmarks.page.ts';
import { CliPage as cliPageComponent, cliArticle } from '../pages/docs/framework/cli/cli.page.ts';
import { CommandsPage as cliCommandSurfacePageComponent, cliCommandSurfaceArticle } from '../pages/docs/framework/cli/commands/commands.page.ts';
import { ProjectCreationPage as cliProjectCreationPageComponent, cliProjectCreationArticle } from '../pages/docs/framework/cli/project-creation/project-creation.page.ts';
import { RoleGenerationPage as cliRoleGenerationPageComponent, cliRoleGenerationArticle } from '../pages/docs/framework/cli/role-generation/role-generation.page.ts';
import { UiPrimitivesPage as cliUiPrimitiveAddPageComponent, cliUiPrimitiveAddArticle } from '../pages/docs/framework/cli/ui-primitives/ui-primitives.page.ts';
import { ConfigMaintenancePage as cliConfigMaintenancePageComponent, cliConfigMaintenanceArticle } from '../pages/docs/framework/cli/config-maintenance/config-maintenance.page.ts';
import { ProjectIntelligencePage as cliProjectIntelligencePageComponent, cliProjectIntelligenceArticle } from '../pages/docs/framework/cli/project-intelligence/project-intelligence.page.ts';
import { TaskRunnersPage as cliTaskRunnersPageComponent, cliTaskRunnersArticle } from '../pages/docs/framework/cli/task-runners/task-runners.page.ts';
import { DevPage as cliDevServerPageComponent, cliDevServerArticle } from '../pages/docs/framework/cli/dev/dev.page.ts';
import { BuildPage as cliBuildPageComponent, cliBuildArticle } from '../pages/docs/framework/cli/build/build.page.ts';
import { TestPage as cliTestPageComponent, cliTestArticle } from '../pages/docs/framework/cli/test/test.page.ts';
import { ConfigurationPage as configurationPageComponent, configurationArticle } from '../pages/docs/framework/configuration/configuration.page.ts';
import { FilePage as configurationFilePageComponent, configurationFileArticle } from '../pages/docs/framework/configuration/file/file.page.ts';
import { DefaultsPage as configurationDefaultsPageComponent, configurationDefaultsArticle } from '../pages/docs/framework/configuration/defaults/defaults.page.ts';
import { UiPage as configurationUiPageComponent, configurationUiArticle } from '../pages/docs/framework/configuration/ui/ui.page.ts';
import { RouterPage as configurationRouterPageComponent, configurationRouterArticle } from '../pages/docs/framework/configuration/router/router.page.ts';
import { AiPage as configurationAiPageComponent, configurationAiArticle } from '../pages/docs/framework/configuration/ai/ai.page.ts';
import { MaintenancePage as configurationMaintenancePageComponent, configurationMaintenanceArticle } from '../pages/docs/framework/configuration/maintenance/maintenance.page.ts';
import { EditorToolingPage as editorToolingPageComponent, editorToolingArticle } from '../pages/docs/framework/editor-tooling/editor-tooling.page.ts';
import { WebTypesPage as editorToolingWebTypesPageComponent, editorToolingWebTypesArticle } from '../pages/docs/framework/editor-tooling/web-types/web-types.page.ts';
import { NavigationPage as editorToolingNavigationPageComponent, editorToolingNavigationArticle } from '../pages/docs/framework/editor-tooling/navigation/navigation.page.ts';
import { DiagnosticsPage as editorToolingDiagnosticsPageComponent, editorToolingDiagnosticsArticle } from '../pages/docs/framework/editor-tooling/diagnostics/diagnostics.page.ts';
import { JetbrainsPage as editorToolingJetBrainsPageComponent, editorToolingJetBrainsArticle } from '../pages/docs/framework/editor-tooling/jetbrains/jetbrains.page.ts';
import { RoutingPage as routingPageComponent, routingArticle } from '../pages/docs/framework/routing/routing.page.ts';
import { RouteTablePage as routingRouteTablePageComponent, routingRouteTableArticle } from '../pages/docs/framework/routing/route-table/route-table.page.ts';
import { ParamsQueryPage as routingParamsQueryPageComponent, routingParamsQueryArticle } from '../pages/docs/framework/routing/params-query/params-query.page.ts';
import { LayoutsRedirectsPage as routingLayoutsRedirectsPageComponent, routingLayoutsRedirectsArticle } from '../pages/docs/framework/routing/layouts-redirects/layouts-redirects.page.ts';
import { GuardsPage as routingGuardsPageComponent, routingGuardsArticle } from '../pages/docs/framework/routing/guards/guards.page.ts';
import { NavigationPage as routingNavigationPageComponent, routingNavigationArticle } from '../pages/docs/framework/routing/navigation/navigation.page.ts';
import { PreloadingKeepAlivePage as routingPreloadingKeepAlivePageComponent, routingPreloadingKeepAliveArticle } from '../pages/docs/framework/routing/preloading-keep-alive/preloading-keep-alive.page.ts';
import { SsrHydrationPage as ssrHydrationPageComponent, ssrHydrationArticle } from '../pages/docs/framework/ssr-hydration/ssr-hydration.page.ts';
import { PackageBoundaryPage as ssrPackageBoundaryPageComponent, ssrPackageBoundaryArticle } from '../pages/docs/framework/ssr-hydration/package-boundary/package-boundary.page.ts';
import { RenderDocumentPage as ssrRenderDocumentPageComponent, ssrRenderDocumentArticle } from '../pages/docs/framework/ssr-hydration/render-document/render-document.page.ts';
import { HydrationContractPage as ssrHydrationContractPageComponent, ssrHydrationContractArticle } from '../pages/docs/framework/ssr-hydration/hydration-contract/hydration-contract.page.ts';
import { StateSerializationPage as ssrStateSerializationPageComponent, ssrStateSerializationArticle } from '../pages/docs/framework/ssr-hydration/state-serialization/state-serialization.page.ts';
import { RouterSsrPage as ssrRouterPageComponent, ssrRouterArticle } from '../pages/docs/framework/ssr-hydration/router-ssr/router-ssr.page.ts';
import { DeferredStreamingPage as ssrDeferredStreamingPageComponent, ssrDeferredStreamingArticle } from '../pages/docs/framework/ssr-hydration/deferred-streaming/deferred-streaming.page.ts';
import { UiPage as uiOctoberPageComponent, uiOctoberArticle } from '../pages/docs/ui/ui/ui.page.ts';
import { ThemingPage as themingPageComponent, themingArticle } from '../pages/docs/ui/theming/theming.page.ts';
import { VanrotstylesPage as vanrotstylesPageComponent, vanrotstylesArticle } from '../pages/docs/ui/vanrotstyles/vanrotstyles.page.ts';
import { TestingPage as testingPageComponent, testingArticle } from '../pages/docs/framework/testing/testing.page.ts';
import { ComponentTestsPage as testingComponentPageComponent, testingComponentArticle } from '../pages/docs/framework/testing/component-tests/component-tests.page.ts';
import { ScreenPage as testingScreenPageComponent, testingScreenArticle } from '../pages/docs/framework/testing/screen/screen.page.ts';
import { RoutingPage as testingRoutingPageComponent, testingRoutingArticle } from '../pages/docs/framework/testing/routing/routing.page.ts';
import { StrategyPage as testingStrategyPageComponent, testingStrategyArticle } from '../pages/docs/framework/testing/strategy/strategy.page.ts';
import { FormsPage as formsPageComponent, formsArticle } from '../pages/docs/framework/forms/forms.page.ts';
import { PackageBoundaryPage as formsBoundaryPageComponent, formsBoundaryArticle } from '../pages/docs/framework/forms/package-boundary/package-boundary.page.ts';
import { FieldRefsPage as formsFieldRefsPageComponent, formsFieldRefsArticle } from '../pages/docs/framework/forms/field-refs/field-refs.page.ts';
import { ValidationLifecyclePage as formsValidationLifecyclePageComponent, formsValidationLifecycleArticle } from '../pages/docs/framework/forms/validation-lifecycle/validation-lifecycle.page.ts';
import { AsyncResourcesPage as formsAsyncResourcesPageComponent, formsAsyncResourcesArticle } from '../pages/docs/framework/forms/async-resources/async-resources.page.ts';
import { ArraysWizardsServerErrorsPage as formsArraysWizardsErrorsPageComponent, formsArraysWizardsErrorsArticle } from '../pages/docs/framework/forms/arrays-wizards-server-errors/arrays-wizards-server-errors.page.ts';
import { DraftPersistencePage as formsDraftPersistencePageComponent, formsDraftPersistenceArticle } from '../pages/docs/framework/forms/draft-persistence/draft-persistence.page.ts';
import { ToolingTestsPage as formsToolingTestsPageComponent, formsToolingTestsArticle } from '../pages/docs/framework/forms/tooling-tests/tooling-tests.page.ts';
import { StorePage as storePageComponent, storeArticle } from '../pages/docs/framework/store/store.page.ts';
import { ActionsPage as storeActionsPageComponent, storeActionsArticle } from '../pages/docs/framework/store/actions/actions.page.ts';
import { SelectorsPage as storeSelectorsPageComponent, storeSelectorsArticle } from '../pages/docs/framework/store/selectors/selectors.page.ts';
import { ReducersPage as storeReducersPageComponent, storeReducersArticle } from '../pages/docs/framework/store/reducers/reducers.page.ts';
import { EffectsPage as storeEffectsPageComponent, storeEffectsArticle } from '../pages/docs/framework/store/effects/effects.page.ts';
import { PageUsagePage as storePageUsagePageComponent, storePageUsageArticle } from '../pages/docs/framework/store/page-usage/page-usage.page.ts';
import { InspectionPage as storeInspectionPageComponent, storeInspectionArticle } from '../pages/docs/framework/store/inspection/inspection.page.ts';
import { ReplayPage as storeReplayPageComponent, storeReplayArticle } from '../pages/docs/framework/store/replay/replay.page.ts';
import { FormattersPage as formattersPageComponent, formattersArticle } from '../pages/docs/framework/formatters/formatters.page.ts';
import { CompilerOwnedFormattingPage as formattersCompilerOwnedPageComponent, formattersCompilerOwnedArticle } from '../pages/docs/framework/formatters/compiler-owned-formatting/compiler-owned-formatting.page.ts';
import { TemplatePipesPage as formattersTemplatePipesPageComponent, formattersTemplatePipesArticle } from '../pages/docs/framework/formatters/template-pipes/template-pipes.page.ts';
import { BuiltInSuitePage as formattersBuiltInSuitePageComponent, formattersBuiltInSuiteArticle } from '../pages/docs/framework/formatters/built-in-suite/built-in-suite.page.ts';
import { BuiltInArgumentsPage as formattersBuiltInArgumentsPageComponent, formattersBuiltInArgumentsArticle } from '../pages/docs/framework/formatters/built-in-arguments/built-in-arguments.page.ts';
import { PipeRoleFilesPage as formattersPipeRoleFilesPageComponent, formattersPipeRoleFilesArticle } from '../pages/docs/framework/formatters/pipe-role-files/pipe-role-files.page.ts';
import { NamedPresetsPage as formattersNamedPresetsPageComponent, formattersNamedPresetsArticle } from '../pages/docs/framework/formatters/named-presets/named-presets.page.ts';
import { EnumPipesPage as formattersEnumPipesPageComponent, formattersEnumPipesArticle } from '../pages/docs/framework/formatters/enum-pipes/enum-pipes.page.ts';
import { ContextPage as formattersContextPageComponent, formattersContextArticle } from '../pages/docs/framework/formatters/context/context.page.ts';
import { CompilerDiagnosticsPage as formattersCompilerDiagnosticsPageComponent, formattersCompilerDiagnosticsArticle } from '../pages/docs/framework/formatters/compiler-diagnostics/compiler-diagnostics.page.ts';
import { ViteToolingPage as formattersViteToolingPageComponent, formattersViteToolingArticle } from '../pages/docs/framework/formatters/vite-tooling/vite-tooling.page.ts';
import { TestingPage as formattersTestingPageComponent, formattersTestingArticle } from '../pages/docs/framework/formatters/testing/testing.page.ts';
import { DevtoolsPage as devtoolsPageComponent, devtoolsArticle } from '../pages/docs/framework/devtools/devtools.page.ts';
import { ProjectMapPage as devtoolsProjectMapPageComponent, devtoolsProjectMapArticle } from '../pages/docs/framework/devtools/project-map/project-map.page.ts';
import { RuntimeGraphPage as devtoolsRuntimeGraphPageComponent, devtoolsRuntimeGraphArticle } from '../pages/docs/framework/devtools/runtime-graph/runtime-graph.page.ts';
import { ViteMetadataPage as devtoolsViteMetadataPageComponent, devtoolsViteMetadataArticle } from '../pages/docs/framework/devtools/vite-metadata/vite-metadata.page.ts';
import { PanelStatePage as devtoolsPanelStatePageComponent, devtoolsPanelStateArticle } from '../pages/docs/framework/devtools/panel-state/panel-state.page.ts';
import { StaleStatePage as devtoolsStaleStatePageComponent, devtoolsStaleStateArticle } from '../pages/docs/framework/devtools/stale-state/stale-state.page.ts';
import { ExamplesPage as examplesPageComponent, examplesArticle } from '../pages/docs/examples/examples/examples.page.ts';
import { ExampleMatrixPage as exampleMatrixPageComponent, exampleMatrixArticle } from '../pages/docs/examples/example-matrix/example-matrix.page.ts';
import { WebglThreejsPage as webglThreejsPageComponent, webglThreejsArticle } from '../pages/docs/examples/examples/webgl-threejs/webgl-threejs.page.ts';
import { DeploymentPage as deploymentPageComponent, deploymentArticle } from '../pages/docs/reference/deployment/deployment.page.ts';
import { PublicApiPage as publicApiPageComponent, publicApiArticle } from '../pages/docs/reference/public-api/public-api.page.ts';
import { DiagnosticsPage as diagnosticsPageComponent, diagnosticsArticle } from '../pages/docs/reference/diagnostics/diagnostics.page.ts';
import { GeneratedFilesPage as generatedFilesPageComponent, generatedFilesArticle } from '../pages/docs/reference/generated-files/generated-files.page.ts';
import { ChangelogPage as changelogPageComponent, changelogArticle } from '../pages/docs/changelog/changelog.page.ts';
import { OctoberShowcasePage as octoberShowcasePageComponent, octoberShowcaseArticle } from '../pages/docs/examples/examples/october-showcase/october-showcase.page.ts';
import { ConventionsPage as conventionsPageComponent, conventionsArticle } from '../pages/docs/framework/conventions/conventions.page.ts';
import { RoleFilesPage as conventionsRoleFilesPageComponent, conventionsRoleFilesArticle } from '../pages/docs/framework/conventions/role-files/role-files.page.ts';
import { TemplatesAndStylesPage as conventionsTemplatesStylesPageComponent, conventionsTemplatesStylesArticle } from '../pages/docs/framework/conventions/templates-and-styles/templates-and-styles.page.ts';
import { StateAndLogicPage as conventionsStateLogicPageComponent, conventionsStateLogicArticle } from '../pages/docs/framework/conventions/state-and-logic/state-and-logic.page.ts';
import { RoutingAndStringsPage as conventionsRoutingStringsPageComponent, conventionsRoutingStringsArticle } from '../pages/docs/framework/conventions/routing-and-strings/routing-and-strings.page.ts';
import { ScopedCssPage as conventionsScopedCssPageComponent, conventionsScopedCssArticle } from '../pages/docs/framework/conventions/scoped-css/scoped-css.page.ts';
import { AiReadableProjectsPage as conventionsAiReadablePageComponent, conventionsAiReadableArticle } from '../pages/docs/framework/conventions/ai-readable-projects/ai-readable-projects.page.ts';
import { LimitationsPage as limitationsPageComponent, limitationsArticle } from '../pages/docs/reference/limitations/limitations.page.ts';
import { StatusPage as referenceStatusPageComponent, referenceStatusArticle } from '../pages/docs/reference/status/status.page.ts';

export const docsPageSection = {
  getStarted: 'getStarted',
  framework: 'framework',
  ui: 'ui',
  components: 'components',
  examples: 'examples',
  reference: 'reference',
} as const;

export type DocsPageSection = (typeof docsPageSection)[keyof typeof docsPageSection];

export interface DocsPageArticleSection {
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

export interface DocsPageArticle {
  key: string;
  section: DocsPageSection;
  path: string;
  label: string;
  title: string;
  summary: string;
  status: string;
  sections: readonly DocsPageArticleSection[];
}

export interface DocsPageTreeItem {
  key: string;
  routeKey: string;
  section: DocsPageSection;
  path: string;
  label: string;
  title: string;
  summary: string;
  status: string;
  article: DocsPageArticle;
  componentName: string;
  component: new () => object;
  sourceFiles: {
    ts: string;
    html: string;
    css: string;
  };
  children: readonly DocsPageTreeItem[];
}

export const docsPageTree = [
  {
    key: "introduction",
    routeKey: "docsIntroduction",
    section: docsPageSection.getStarted,
    path: "/docs",
    label: "Introduction",
    title: "Vanrot",
    summary: "Vanrot is a small frontend framework with compiler-known templates, signals, route ownership, source-owned UI, and a documentation-first development path.",
    status: "available-now",
    article: introductionArticle,
    componentName: "IntroductionPage",
    component: introductionPageComponent,
    sourceFiles: {
      ts: "src/pages/docs/get-started/introduction/introduction.page.ts",
      html: "src/pages/docs/get-started/introduction/introduction.page.html",
      css: "src/pages/docs/get-started/introduction/introduction.page.css",
    },
    children: [

    ],
  },
  {
    key: "installation",
    routeKey: "docsInstallation",
    section: docsPageSection.getStarted,
    path: "/docs/installation",
    label: "Installation",
    title: "Installation",
    summary: "Create or run a Vanrot app through the CLI and workspace package graph.",
    status: "demo-capable",
    article: installationArticle,
    componentName: "InstallationPage",
    component: installationPageComponent,
    sourceFiles: {
      ts: "src/pages/docs/get-started/installation/installation.page.ts",
      html: "src/pages/docs/get-started/installation/installation.page.html",
      css: "src/pages/docs/get-started/installation/installation.page.css",
    },
    children: [

    ],
  },
  {
    key: "projectStructure",
    routeKey: "docsProjectStructure",
    section: docsPageSection.getStarted,
    path: "/docs/project-structure",
    label: "Project Structure",
    title: "Project Structure",
    summary: "Vanrot keeps source roles explicit with TypeScript, HTML, and CSS side by side.",
    status: "available-now",
    article: projectStructureArticle,
    componentName: "ProjectStructurePage",
    component: projectStructurePageComponent,
    sourceFiles: {
      ts: "src/pages/docs/get-started/project-structure/project-structure.page.ts",
      html: "src/pages/docs/get-started/project-structure/project-structure.page.html",
      css: "src/pages/docs/get-started/project-structure/project-structure.page.css",
    },
    children: [

    ],
  },
  {
    key: "runtime",
    routeKey: "docsRuntime",
    section: docsPageSection.framework,
    path: "/docs/runtime",
    label: "Runtime",
    title: "Runtime",
    summary: "@vanrot/runtime is the browser runtime boundary for reactivity, inputs, lifecycle cleanup, compiled-component mounting, and runtime graph contracts.",
    status: "production-ready-through-phase-12",
    article: runtimeArticle,
    componentName: "RuntimePage",
    component: runtimePageComponent,
    sourceFiles: {
      ts: "src/pages/docs/framework/runtime/runtime.page.ts",
      html: "src/pages/docs/framework/runtime/runtime.page.html",
      css: "src/pages/docs/framework/runtime/runtime.page.css",
    },
    children: [
      {
        key: "runtimeSignals",
        routeKey: "docsRuntimeSignals",
        section: docsPageSection.framework,
        path: "/docs/runtime/signals",
        label: "Signals",
        title: "Runtime Signals",
        summary: "A signal is the @vanrot/runtime state primitive: readable state, writable updates, cached computed values, and effects all share one explicit dependency graph.",
        status: "production-ready-through-phase-12",
        article: runtimeSignalsArticle,
        componentName: "SignalsPage",
        component: runtimeSignalsPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/runtime/signals/signals.page.ts",
          html: "src/pages/docs/framework/runtime/signals/signals.page.html",
          css: "src/pages/docs/framework/runtime/signals/signals.page.css",
        },
        children: [

        ],
      },
      {
        key: "runtimeInputs",
        routeKey: "docsRuntimeInputs",
        section: docsPageSection.framework,
        path: "/docs/runtime/inputs",
        label: "Inputs",
        title: "Runtime Inputs",
        summary: "Runtime inputs are signal-shaped component boundary values for required and defaulted data passed into generated components.",
        status: "production-ready-through-phase-12",
        article: runtimeInputsArticle,
        componentName: "InputsPage",
        component: runtimeInputsPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/runtime/inputs/inputs.page.ts",
          html: "src/pages/docs/framework/runtime/inputs/inputs.page.html",
          css: "src/pages/docs/framework/runtime/inputs/inputs.page.css",
        },
        children: [

        ],
      },
      {
        key: "runtimeForms",
        routeKey: "docsRuntimeForms",
        section: docsPageSection.framework,
        path: "/docs/runtime/forms",
        label: "Forms",
        title: "Runtime Forms",
        summary: "Runtime forms provide a small controller and validator surface for repeated field state, validation, and error handling.",
        status: "production-ready-through-phase-12",
        article: runtimeFormsArticle,
        componentName: "FormsPage",
        component: runtimeFormsPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/runtime/forms/forms.page.ts",
          html: "src/pages/docs/framework/runtime/forms/forms.page.html",
          css: "src/pages/docs/framework/runtime/forms/forms.page.css",
        },
        children: [

        ],
      },
      {
        key: "runtimeControllers",
        routeKey: "docsRuntimeControllers",
        section: docsPageSection.framework,
        path: "/docs/runtime/controllers",
        label: "UI Controllers",
        title: "Runtime UI Controllers",
        summary: "UI controllers are small runtime helpers for repeated interaction patterns such as overlays, command menus, layers, tabs, tooltips, and toasts.",
        status: "production-ready-through-phase-12",
        article: runtimeControllersArticle,
        componentName: "ControllersPage",
        component: runtimeControllersPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/runtime/controllers/controllers.page.ts",
          html: "src/pages/docs/framework/runtime/controllers/controllers.page.html",
          css: "src/pages/docs/framework/runtime/controllers/controllers.page.css",
        },
        children: [

        ],
      },
      {
        key: "runtimeDevtoolsGraph",
        routeKey: "docsRuntimeDevtoolsGraph",
        section: docsPageSection.framework,
        path: "/docs/runtime/devtools-graph",
        label: "Devtools Graph",
        title: "Runtime Devtools Graph",
        summary: "The runtime graph session records nodes, edges, and events so devtools can inspect reactive behavior without changing application code.",
        status: "production-ready-through-phase-12",
        article: runtimeDevtoolsGraphArticle,
        componentName: "DevtoolsGraphPage",
        component: runtimeDevtoolsGraphPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/runtime/devtools-graph/devtools-graph.page.ts",
          html: "src/pages/docs/framework/runtime/devtools-graph/devtools-graph.page.html",
          css: "src/pages/docs/framework/runtime/devtools-graph/devtools-graph.page.css",
        },
        children: [

        ],
      },
      {
        key: "runtimeLifecycle",
        routeKey: "docsRuntimeLifecycle",
        section: docsPageSection.framework,
        path: "/docs/runtime/lifecycle",
        label: "Lifecycle",
        title: "Runtime Lifecycle",
        summary: "Runtime lifecycle hooks attach setup and cleanup to the active mount scope so effects, DOM listeners, and component teardown stay deterministic.",
        status: "production-ready-through-phase-12",
        article: runtimeLifecycleArticle,
        componentName: "LifecyclePage",
        component: runtimeLifecyclePageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/runtime/lifecycle/lifecycle.page.ts",
          html: "src/pages/docs/framework/runtime/lifecycle/lifecycle.page.html",
          css: "src/pages/docs/framework/runtime/lifecycle/lifecycle.page.css",
        },
        children: [

        ],
      },
      {
        key: "runtimeMounting",
        routeKey: "docsRuntimeMounting",
        section: docsPageSection.framework,
        path: "/docs/runtime/mounting",
        label: "Mounting",
        title: "Runtime Mounting",
        summary: "mount() is the browser entry point that creates the root cleanup scope and attaches compiled component output to a target element.",
        status: "production-ready-through-phase-12",
        article: runtimeMountingArticle,
        componentName: "MountingPage",
        component: runtimeMountingPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/runtime/mounting/mounting.page.ts",
          html: "src/pages/docs/framework/runtime/mounting/mounting.page.html",
          css: "src/pages/docs/framework/runtime/mounting/mounting.page.css",
        },
        children: [

        ],
      }
    ],
  },
  {
    key: "behavior",
    routeKey: "docsBehavior",
    section: docsPageSection.framework,
    path: "/docs/behavior",
    label: "Behavior",
    title: "Behavior",
    summary: "@vanrot/behavior is optional and lets apps pick only the headless behavior helpers they use, from overlays and tables through the Phase 28 interaction suite.",
    status: "production-ready-through-phase-28",
    article: behaviorArticle,
    componentName: "BehaviorPage",
    component: behaviorPageComponent,
    sourceFiles: {
      ts: "src/pages/docs/framework/behavior/behavior.page.ts",
      html: "src/pages/docs/framework/behavior/behavior.page.html",
      css: "src/pages/docs/framework/behavior/behavior.page.css",
    },
    children: [
      {
        key: "behaviorForm",
        routeKey: "docsBehaviorForm",
        section: docsPageSection.framework,
        path: "/docs/behavior/form",
        label: "Form",
        title: "Form Behavior",
        summary: "createFormController gives forms signal-backed values, per-field validation, dirty and touched tracking, and an async submit guard.",
        status: "production-ready-through-phase-16h",
        article: behaviorFormArticle,
        componentName: "FormPage",
        component: behaviorFormPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/behavior/form/form.page.ts",
          html: "src/pages/docs/framework/behavior/form/form.page.html",
          css: "src/pages/docs/framework/behavior/form/form.page.css",
        },
        children: [

        ],
      },
      {
        key: "behaviorOverlay",
        routeKey: "docsBehaviorOverlay",
        section: docsPageSection.framework,
        path: "/docs/behavior/overlay",
        label: "Overlay",
        title: "Overlay Behavior",
        summary: "createOverlayController drives dialogs, popovers, and menus with open state, focus restore, escape-to-close, and outside-pointer dismissal.",
        status: "production-ready-through-phase-16h",
        article: behaviorOverlayArticle,
        componentName: "OverlayPage",
        component: behaviorOverlayPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/behavior/overlay/overlay.page.ts",
          html: "src/pages/docs/framework/behavior/overlay/overlay.page.html",
          css: "src/pages/docs/framework/behavior/overlay/overlay.page.css",
        },
        children: [

        ],
      },
      {
        key: "behaviorTooltip",
        routeKey: "docsBehaviorTooltip",
        section: docsPageSection.framework,
        path: "/docs/behavior/tooltip",
        label: "Tooltip",
        title: "Tooltip Behavior",
        summary: "createTooltipController shows hover and focus tooltips with a configurable delay and correct ARIA wiring.",
        status: "production-ready-through-phase-16h",
        article: behaviorTooltipArticle,
        componentName: "TooltipPage",
        component: behaviorTooltipPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/behavior/tooltip/tooltip.page.ts",
          html: "src/pages/docs/framework/behavior/tooltip/tooltip.page.html",
          css: "src/pages/docs/framework/behavior/tooltip/tooltip.page.css",
        },
        children: [

        ],
      },
      {
        key: "behaviorTabs",
        routeKey: "docsBehaviorTabs",
        section: docsPageSection.framework,
        path: "/docs/behavior/tabs",
        label: "Tabs",
        title: "Tabs Behavior",
        summary: "createTabsController manages a selected tab value with roving-focus arrow navigation and tab/tabpanel ARIA roles.",
        status: "production-ready-through-phase-16h",
        article: behaviorTabsArticle,
        componentName: "TabsPage",
        component: behaviorTabsPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/behavior/tabs/tabs.page.ts",
          html: "src/pages/docs/framework/behavior/tabs/tabs.page.html",
          css: "src/pages/docs/framework/behavior/tabs/tabs.page.css",
        },
        children: [

        ],
      },
      {
        key: "behaviorTable",
        routeKey: "docsBehaviorTable",
        section: docsPageSection.framework,
        path: "/docs/behavior/table",
        label: "Table",
        title: "Table Behavior",
        summary: "createTableController adds client-side filtering, sorting, pagination, and row selection over a typed row array.",
        status: "production-ready-through-phase-16h",
        article: behaviorTableArticle,
        componentName: "TablePage",
        component: behaviorTablePageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/behavior/table/table.page.ts",
          html: "src/pages/docs/framework/behavior/table/table.page.html",
          css: "src/pages/docs/framework/behavior/table/table.page.css",
        },
        children: [

        ],
      },
      {
        key: "behaviorToast",
        routeKey: "docsBehaviorToast",
        section: docsPageSection.framework,
        path: "/docs/behavior/toast",
        label: "Toast",
        title: "Toast Behavior",
        summary: "createToastController manages a queue of dismissible toast messages with tones and auto-expiry timers.",
        status: "production-ready-through-phase-16h",
        article: behaviorToastArticle,
        componentName: "ToastPage",
        component: behaviorToastPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/behavior/toast/toast.page.ts",
          html: "src/pages/docs/framework/behavior/toast/toast.page.html",
          css: "src/pages/docs/framework/behavior/toast/toast.page.css",
        },
        children: [

        ],
      },
      {
        key: "behaviorCommandMenu",
        routeKey: "docsBehaviorCommandMenu",
        section: docsPageSection.framework,
        path: "/docs/behavior/command-menu",
        label: "Command Menu",
        title: "Command Menu Behavior",
        summary: "createCommandMenuController drives a keyboard-navigable command palette with an active item and selection callback.",
        status: "production-ready-through-phase-16h",
        article: behaviorCommandMenuArticle,
        componentName: "CommandMenuPage",
        component: behaviorCommandMenuPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/behavior/command-menu/command-menu.page.ts",
          html: "src/pages/docs/framework/behavior/command-menu/command-menu.page.html",
          css: "src/pages/docs/framework/behavior/command-menu/command-menu.page.css",
        },
        children: [

        ],
      },
      {
        key: "behaviorPositionedLayer",
        routeKey: "docsBehaviorPositionedLayer",
        section: docsPageSection.framework,
        path: "/docs/behavior/positioned-layer",
        label: "Positioned Layer",
        title: "Positioned Layer Behavior",
        summary: "positionLayer places a floating element next to a trigger on a chosen side and alignment with a configurable offset.",
        status: "production-ready-through-phase-16h",
        article: behaviorPositionedLayerArticle,
        componentName: "PositionedLayerPage",
        component: behaviorPositionedLayerPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/behavior/positioned-layer/positioned-layer.page.ts",
          html: "src/pages/docs/framework/behavior/positioned-layer/positioned-layer.page.html",
          css: "src/pages/docs/framework/behavior/positioned-layer/positioned-layer.page.css",
        },
        children: [

        ],
      }
    ],
  },
  {
    key: "seo",
    routeKey: "docsSeo",
    section: docsPageSection.framework,
    path: "/docs/seo",
    label: "SEO",
    title: "SEO",
    summary: "@vanrot/seo is an optional first-party package for metadata, canonical URLs, structured data, sitemaps, robots.txt, and doctor diagnostics without adding runtime bloat.",
    status: "production-ready-through-phase-27",
    article: seoArticle,
    componentName: "SeoPage",
    component: seoPageComponent,
    sourceFiles: {
      ts: "src/pages/docs/framework/seo/seo.page.ts",
      html: "src/pages/docs/framework/seo/seo.page.html",
      css: "src/pages/docs/framework/seo/seo.page.css",
    },
    children: [
      {
        key: "seoPackageBoundary",
        routeKey: "docsSeoPackageBoundary",
        section: docsPageSection.framework,
        path: "/docs/seo/package-boundary",
        label: "Package Boundary",
        title: "SEO Package Boundary",
        summary: "@vanrot/seo is an optional package for metadata and crawl artifacts, not part of the core runtime.",
        status: "production-ready-through-phase-27",
        article: seoPackageBoundaryArticle,
        componentName: "PackageBoundaryPage",
        component: seoPackageBoundaryPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/seo/package-boundary/package-boundary.page.ts",
          html: "src/pages/docs/framework/seo/package-boundary/package-boundary.page.html",
          css: "src/pages/docs/framework/seo/package-boundary/package-boundary.page.css",
        },
        children: [

        ],
      },
      {
        key: "seoMetadataLadder",
        routeKey: "docsSeoMetadataLadder",
        section: docsPageSection.framework,
        path: "/docs/seo/metadata-ladder",
        label: "Metadata Ladder",
        title: "SEO Metadata Ladder",
        summary: "The SEO ladder defines where metadata comes from and which layer wins when values overlap.",
        status: "production-ready-through-phase-27",
        article: seoMetadataLadderArticle,
        componentName: "MetadataLadderPage",
        component: seoMetadataLadderPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/seo/metadata-ladder/metadata-ladder.page.ts",
          html: "src/pages/docs/framework/seo/metadata-ladder/metadata-ladder.page.html",
          css: "src/pages/docs/framework/seo/metadata-ladder/metadata-ladder.page.css",
        },
        children: [

        ],
      },
      {
        key: "seoConfigControlPlane",
        routeKey: "docsSeoConfigControlPlane",
        section: docsPageSection.framework,
        path: "/docs/seo/config-control-plane",
        label: "Config Control Plane",
        title: "SEO Config Control Plane",
        summary: "vanrot.config.ts owns SEO defaults so apps do not spread package settings across many files.",
        status: "production-ready-through-phase-27",
        article: seoConfigControlPlaneArticle,
        componentName: "ConfigControlPlanePage",
        component: seoConfigControlPlanePageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/seo/config-control-plane/config-control-plane.page.ts",
          html: "src/pages/docs/framework/seo/config-control-plane/config-control-plane.page.html",
          css: "src/pages/docs/framework/seo/config-control-plane/config-control-plane.page.css",
        },
        children: [

        ],
      },
      {
        key: "seoCreateAndAddFlows",
        routeKey: "docsSeoCreateAndAddFlows",
        section: docsPageSection.framework,
        path: "/docs/seo/create-and-add-flows",
        label: "Create and Add Flows",
        title: "SEO Create and Add Flows",
        summary: "Projects can opt into SEO during creation or add the full starter surface later.",
        status: "production-ready-through-phase-27",
        article: seoCreateAndAddFlowsArticle,
        componentName: "CreateAndAddFlowsPage",
        component: seoCreateAndAddFlowsPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/seo/create-and-add-flows/create-and-add-flows.page.ts",
          html: "src/pages/docs/framework/seo/create-and-add-flows/create-and-add-flows.page.html",
          css: "src/pages/docs/framework/seo/create-and-add-flows/create-and-add-flows.page.css",
        },
        children: [

        ],
      },
      {
        key: "seoDoctorAndBuildOutput",
        routeKey: "docsSeoDoctorAndBuildOutput",
        section: docsPageSection.framework,
        path: "/docs/seo/doctor-and-build-output",
        label: "Doctor and Build Output",
        title: "SEO Doctor and Build Output",
        summary: "SEO diagnostics and build artifacts are tied to config readiness, especially the presence of siteUrl.",
        status: "production-ready-through-phase-27",
        article: seoDoctorAndBuildOutputArticle,
        componentName: "DoctorAndBuildOutputPage",
        component: seoDoctorAndBuildOutputPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/seo/doctor-and-build-output/doctor-and-build-output.page.ts",
          html: "src/pages/docs/framework/seo/doctor-and-build-output/doctor-and-build-output.page.html",
          css: "src/pages/docs/framework/seo/doctor-and-build-output/doctor-and-build-output.page.css",
        },
        children: [

        ],
      },
      {
        key: "seoSocialImages",
        routeKey: "docsSeoSocialImages",
        section: docsPageSection.framework,
        path: "/docs/seo/social-images",
        label: "Social Images",
        title: "SEO Social Images",
        summary: "@vanrot/seo validates social preview metadata while leaving artwork creation to the app.",
        status: "production-ready-through-phase-27",
        article: seoSocialImagesArticle,
        componentName: "SocialImagesPage",
        component: seoSocialImagesPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/seo/social-images/social-images.page.ts",
          html: "src/pages/docs/framework/seo/social-images/social-images.page.html",
          css: "src/pages/docs/framework/seo/social-images/social-images.page.css",
        },
        children: [

        ],
      }
    ],
  },
  {
    key: "compiler",
    routeKey: "docsCompiler",
    section: docsPageSection.framework,
    path: "/docs/compiler",
    label: "Compiler",
    title: "Compiler",
    summary: "@vanrot/compiler turns role files, HTML templates, and scoped CSS into generated JavaScript, generated CSS, diagnostics, source maps, child component metadata, and readable feature metadata.",
    status: "production-ready-through-phase-12",
    article: compilerArticle,
    componentName: "CompilerPage",
    component: compilerPageComponent,
    sourceFiles: {
      ts: "src/pages/docs/framework/compiler/compiler.page.ts",
      html: "src/pages/docs/framework/compiler/compiler.page.html",
      css: "src/pages/docs/framework/compiler/compiler.page.css",
    },
    children: [
      {
        key: "compilerFileConventions",
        routeKey: "docsCompilerFileConventions",
        section: docsPageSection.framework,
        path: "/docs/compiler/file-conventions",
        label: "File Conventions",
        title: "Compiler File Conventions",
        summary: "Vanrot compiler file conventions pair each role TypeScript file with sibling HTML and CSS sources before any template or style transform runs.",
        status: "production-ready-through-phase-12",
        article: compilerFileConventionsArticle,
        componentName: "FileConventionsPage",
        component: compilerFileConventionsPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/compiler/file-conventions/file-conventions.page.ts",
          html: "src/pages/docs/framework/compiler/file-conventions/file-conventions.page.html",
          css: "src/pages/docs/framework/compiler/file-conventions/file-conventions.page.css",
        },
        children: [

        ],
      },
      {
        key: "compilerComponentClass",
        routeKey: "docsCompilerComponentClass",
        section: docsPageSection.framework,
        path: "/docs/compiler/component-class",
        label: "Component Class",
        title: "Compiler Component Class",
        summary: "The compiler reads a named exported class from each role file and uses that class as the generated component identity.",
        status: "production-ready-through-phase-12",
        article: compilerComponentClassArticle,
        componentName: "ComponentClassPage",
        component: compilerComponentClassPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/compiler/component-class/component-class.page.ts",
          html: "src/pages/docs/framework/compiler/component-class/component-class.page.html",
          css: "src/pages/docs/framework/compiler/component-class/component-class.page.css",
        },
        children: [

        ],
      },
      {
        key: "compilerTemplateSyntax",
        routeKey: "docsCompilerTemplateSyntax",
        section: docsPageSection.framework,
        path: "/docs/compiler/template-syntax",
        label: "Template Syntax",
        title: "Compiler Template Syntax",
        summary: "Vanrot template syntax keeps HTML declarative while supporting interpolation, property binding, event binding, control flow, child components, slots, router tags, and UI primitives.",
        status: "production-ready-through-phase-12",
        article: compilerTemplateSyntaxArticle,
        componentName: "TemplateSyntaxPage",
        component: compilerTemplateSyntaxPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/compiler/template-syntax/template-syntax.page.ts",
          html: "src/pages/docs/framework/compiler/template-syntax/template-syntax.page.html",
          css: "src/pages/docs/framework/compiler/template-syntax/template-syntax.page.css",
        },
        children: [

        ],
      },
      {
        key: "compilerExpressions",
        routeKey: "docsCompilerExpressions",
        section: docsPageSection.framework,
        path: "/docs/compiler/expressions",
        label: "Expressions",
        title: "Compiler Expressions",
        summary: "Vanrot compiler expressions are rewritten into component-safe reads and method calls while rejecting statement-like logic in templates.",
        status: "production-ready-through-phase-12",
        article: compilerExpressionsArticle,
        componentName: "ExpressionsPage",
        component: compilerExpressionsPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/compiler/expressions/expressions.page.ts",
          html: "src/pages/docs/framework/compiler/expressions/expressions.page.html",
          css: "src/pages/docs/framework/compiler/expressions/expressions.page.css",
        },
        children: [

        ],
      },
      {
        key: "compilerEventBinding",
        routeKey: "docsCompilerEventBinding",
        section: docsPageSection.framework,
        path: "/docs/compiler/event-binding",
        label: "Event Binding",
        title: "Compiler Event Binding",
        summary: "Event binding compiles declarative template events into generated listeners that call component methods and stay cleanup-safe.",
        status: "production-ready-through-phase-12",
        article: compilerEventBindingArticle,
        componentName: "EventBindingPage",
        component: compilerEventBindingPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/compiler/event-binding/event-binding.page.ts",
          html: "src/pages/docs/framework/compiler/event-binding/event-binding.page.html",
          css: "src/pages/docs/framework/compiler/event-binding/event-binding.page.css",
        },
        children: [

        ],
      },
      {
        key: "compilerScopedCss",
        routeKey: "docsCompilerScopedCss",
        section: docsPageSection.framework,
        path: "/docs/compiler/scoped-css",
        label: "Scoped CSS",
        title: "Compiler Scoped CSS",
        summary: "Scoped CSS transforms component styles with a generated scope attribute while keeping source mappings back to the original CSS file.",
        status: "production-ready-through-phase-12",
        article: compilerScopedCssArticle,
        componentName: "ScopedCssPage",
        component: compilerScopedCssPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/compiler/scoped-css/scoped-css.page.ts",
          html: "src/pages/docs/framework/compiler/scoped-css/scoped-css.page.html",
          css: "src/pages/docs/framework/compiler/scoped-css/scoped-css.page.css",
        },
        children: [

        ],
      },
      {
        key: "compilerChildComponents",
        routeKey: "docsCompilerChildComponents",
        section: docsPageSection.framework,
        path: "/docs/compiler/child-components",
        label: "Child Components",
        title: "Compiler Child Components",
        summary: "Child component compilation detects component tags, imports the child class, validates inputs, and records dependency metadata.",
        status: "production-ready-through-phase-12",
        article: compilerChildComponentsArticle,
        componentName: "ChildComponentsPage",
        component: compilerChildComponentsPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/compiler/child-components/child-components.page.ts",
          html: "src/pages/docs/framework/compiler/child-components/child-components.page.html",
          css: "src/pages/docs/framework/compiler/child-components/child-components.page.css",
        },
        children: [

        ],
      },
      {
        key: "compilerSlots",
        routeKey: "docsCompilerSlots",
        section: docsPageSection.framework,
        path: "/docs/compiler/slots",
        label: "Slots",
        title: "Compiler Slots",
        summary: "Slots let a parent provide named content to a child component while the compiler validates slot targets and lowers slot outlets.",
        status: "production-ready-through-phase-12",
        article: compilerSlotsArticle,
        componentName: "SlotsPage",
        component: compilerSlotsPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/compiler/slots/slots.page.ts",
          html: "src/pages/docs/framework/compiler/slots/slots.page.html",
          css: "src/pages/docs/framework/compiler/slots/slots.page.css",
        },
        children: [

        ],
      },
      {
        key: "compilerFor",
        routeKey: "docsCompilerFor",
        section: docsPageSection.framework,
        path: "/docs/compiler/for",
        label: "@for",
        title: "Compiler @for",
        summary: "@for compiles list rendering with an explicit item source and required tracking expression so generated DOM updates stay predictable.",
        status: "production-ready-through-phase-12",
        article: compilerForArticle,
        componentName: "ForPage",
        component: compilerForPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/compiler/for/for.page.ts",
          html: "src/pages/docs/framework/compiler/for/for.page.html",
          css: "src/pages/docs/framework/compiler/for/for.page.css",
        },
        children: [

        ],
      },
      {
        key: "compilerIfElse",
        routeKey: "docsCompilerIfElse",
        section: docsPageSection.framework,
        path: "/docs/compiler/if-else",
        label: "@if / @else",
        title: "Compiler @if and @else",
        summary: "@if and @else compile conditional template branches into cleanup-safe DOM updates driven by a component expression.",
        status: "production-ready-through-phase-12",
        article: compilerIfElseArticle,
        componentName: "IfElsePage",
        component: compilerIfElsePageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/compiler/if-else/if-else.page.ts",
          html: "src/pages/docs/framework/compiler/if-else/if-else.page.html",
          css: "src/pages/docs/framework/compiler/if-else/if-else.page.css",
        },
        children: [

        ],
      },
      {
        key: "compilerInputs",
        routeKey: "docsCompilerInputs",
        section: docsPageSection.framework,
        path: "/docs/compiler/inputs",
        label: "Inputs",
        title: "Compiler Inputs",
        summary: "Compiler input metadata lets Vanrot validate child component input bindings before generated code reaches the browser.",
        status: "production-ready-through-phase-12",
        article: compilerInputsArticle,
        componentName: "InputsPage",
        component: compilerInputsPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/compiler/inputs/inputs.page.ts",
          html: "src/pages/docs/framework/compiler/inputs/inputs.page.html",
          css: "src/pages/docs/framework/compiler/inputs/inputs.page.css",
        },
        children: [

        ],
      },
      {
        key: "compilerSourceMaps",
        routeKey: "docsCompilerSourceMaps",
        section: docsPageSection.framework,
        path: "/docs/compiler/source-maps",
        label: "Source Maps",
        title: "Compiler Source Maps",
        summary: "Compiler source mappings connect generated JavaScript and CSS back to original template and style files for diagnostics, inspection, and tests.",
        status: "production-ready-through-phase-12",
        article: compilerSourceMapsArticle,
        componentName: "SourceMapsPage",
        component: compilerSourceMapsPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/compiler/source-maps/source-maps.page.ts",
          html: "src/pages/docs/framework/compiler/source-maps/source-maps.page.html",
          css: "src/pages/docs/framework/compiler/source-maps/source-maps.page.css",
        },
        children: [

        ],
      },
      {
        key: "compilerCompilationApi",
        routeKey: "docsCompilerCompilationApi",
        section: docsPageSection.framework,
        path: "/docs/compiler/compilation-api",
        label: "Compilation API",
        title: "Compiler Compilation API",
        summary: "The @vanrot/compiler API exposes full component compilation plus lower-level parsing, metadata, style, codegen, diagnostics, and source-location helpers for tooling.",
        status: "production-ready-through-phase-12",
        article: compilerCompilationApiArticle,
        componentName: "CompilationApiPage",
        component: compilerCompilationApiPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/compiler/compilation-api/compilation-api.page.ts",
          html: "src/pages/docs/framework/compiler/compilation-api/compilation-api.page.html",
          css: "src/pages/docs/framework/compiler/compilation-api/compilation-api.page.css",
        },
        children: [

        ],
      }
    ],
  },
  {
    key: "vitePlugin",
    routeKey: "docsVitePlugin",
    section: docsPageSection.framework,
    path: "/docs/vite-plugin",
    label: "Vite Plugin",
    title: "Vite Plugin",
    summary: "@vanrot/vite-plugin is the Vite integration layer for Vanrot applications. It compiles role files, watches sibling templates and styles, exposes virtual CSS and source modules, forwards diagnostics, and preserves source-map context during dev and build.",
    status: "production-ready-through-phase-12",
    article: vitePluginArticle,
    componentName: "VitePluginPage",
    component: vitePluginPageComponent,
    sourceFiles: {
      ts: "src/pages/docs/framework/vite-plugin/vite-plugin.page.ts",
      html: "src/pages/docs/framework/vite-plugin/vite-plugin.page.html",
      css: "src/pages/docs/framework/vite-plugin/vite-plugin.page.css",
    },
    children: [
      {
        key: "vitePluginSetup",
        routeKey: "docsVitePluginSetup",
        section: docsPageSection.framework,
        path: "/docs/vite-plugin/setup",
        label: "Setup",
        title: "Vite Plugin Setup",
        summary: "Setup connects @vanrot/vite-plugin to Vite so Vanrot role files compile during development and production builds.",
        status: "production-ready-through-phase-12",
        article: vitePluginSetupArticle,
        componentName: "SetupPage",
        component: vitePluginSetupPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/vite-plugin/setup/setup.page.ts",
          html: "src/pages/docs/framework/vite-plugin/setup/setup.page.html",
          css: "src/pages/docs/framework/vite-plugin/setup/setup.page.css",
        },
        children: [

        ],
      },
      {
        key: "vitePluginOptions",
        routeKey: "docsVitePluginOptions",
        section: docsPageSection.framework,
        path: "/docs/vite-plugin/options",
        label: "Options",
        title: "Vite Plugin Options",
        summary: "VanrotPluginOptions control source matching, project root resolution, and source-root defaults for @vanrot/vite-plugin.",
        status: "production-ready-through-phase-12",
        article: vitePluginOptionsArticle,
        componentName: "OptionsPage",
        component: vitePluginOptionsPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/vite-plugin/options/options.page.ts",
          html: "src/pages/docs/framework/vite-plugin/options/options.page.html",
          css: "src/pages/docs/framework/vite-plugin/options/options.page.css",
        },
        children: [

        ],
      },
      {
        key: "vitePluginTransform",
        routeKey: "docsVitePluginTransform",
        section: docsPageSection.framework,
        path: "/docs/vite-plugin/role-file-transform",
        label: "Role File Transform",
        title: "Vite Plugin Role File Transform",
        summary: "The role-file transform compiles Vanrot component, page, layout, and button files into Vite modules with generated JavaScript, CSS, diagnostics, and source maps.",
        status: "production-ready-through-phase-12",
        article: vitePluginTransformArticle,
        componentName: "RoleFileTransformPage",
        component: vitePluginTransformPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/vite-plugin/role-file-transform/role-file-transform.page.ts",
          html: "src/pages/docs/framework/vite-plugin/role-file-transform/role-file-transform.page.html",
          css: "src/pages/docs/framework/vite-plugin/role-file-transform/role-file-transform.page.css",
        },
        children: [

        ],
      },
      {
        key: "vitePluginHotReload",
        routeKey: "docsVitePluginHotReload",
        section: docsPageSection.framework,
        path: "/docs/vite-plugin/hot-reload",
        label: "Hot Reload",
        title: "Vite Plugin Hot Reload",
        summary: "Hot reload keeps HTML and CSS sibling edits attached to the owning Vanrot role module instead of treating siblings as disconnected files.",
        status: "production-ready-through-phase-12",
        article: vitePluginHotReloadArticle,
        componentName: "HotReloadPage",
        component: vitePluginHotReloadPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/vite-plugin/hot-reload/hot-reload.page.ts",
          html: "src/pages/docs/framework/vite-plugin/hot-reload/hot-reload.page.html",
          css: "src/pages/docs/framework/vite-plugin/hot-reload/hot-reload.page.css",
        },
        children: [

        ],
      },
      {
        key: "vitePluginVirtualModules",
        routeKey: "docsVitePluginVirtualModules",
        section: docsPageSection.framework,
        path: "/docs/vite-plugin/virtual-modules",
        label: "Virtual Modules",
        title: "Vite Plugin Virtual Modules",
        summary: "Virtual modules let generated Vanrot JavaScript import scoped CSS and original source through Vite without writing temporary generated files.",
        status: "production-ready-through-phase-12",
        article: vitePluginVirtualModulesArticle,
        componentName: "VirtualModulesPage",
        component: vitePluginVirtualModulesPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/vite-plugin/virtual-modules/virtual-modules.page.ts",
          html: "src/pages/docs/framework/vite-plugin/virtual-modules/virtual-modules.page.html",
          css: "src/pages/docs/framework/vite-plugin/virtual-modules/virtual-modules.page.css",
        },
        children: [

        ],
      },
      {
        key: "vitePluginDiagnostics",
        routeKey: "docsVitePluginDiagnostics",
        section: docsPageSection.framework,
        path: "/docs/vite-plugin/diagnostics",
        label: "Diagnostics",
        title: "Vite Plugin Diagnostics",
        summary: "Diagnostics from project configuration and Vanrot compilation are surfaced through Vite errors and warnings so integration failures are visible during dev and build.",
        status: "production-ready-through-phase-12",
        article: vitePluginDiagnosticsArticle,
        componentName: "DiagnosticsPage",
        component: vitePluginDiagnosticsPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/vite-plugin/diagnostics/diagnostics.page.ts",
          html: "src/pages/docs/framework/vite-plugin/diagnostics/diagnostics.page.html",
          css: "src/pages/docs/framework/vite-plugin/diagnostics/diagnostics.page.css",
        },
        children: [

        ],
      },
      {
        key: "vitePluginSourceMaps",
        routeKey: "docsVitePluginSourceMaps",
        section: docsPageSection.framework,
        path: "/docs/vite-plugin/source-maps",
        label: "Source Maps",
        title: "Vite Plugin Source Maps",
        summary: "Source maps connect generated Vanrot JavaScript and CSS back to template, style, and role-file source positions.",
        status: "production-ready-through-phase-12",
        article: vitePluginSourceMapsArticle,
        componentName: "SourceMapsPage",
        component: vitePluginSourceMapsPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/vite-plugin/source-maps/source-maps.page.ts",
          html: "src/pages/docs/framework/vite-plugin/source-maps/source-maps.page.html",
          css: "src/pages/docs/framework/vite-plugin/source-maps/source-maps.page.css",
        },
        children: [

        ],
      },
      {
        key: "vitePluginDevtoolsMetadata",
        routeKey: "docsVitePluginDevtoolsMetadata",
        section: docsPageSection.framework,
        path: "/docs/vite-plugin/devtools-metadata",
        label: "Devtools Metadata",
        title: "Vite Plugin Devtools Metadata",
        summary: "The devtools metadata endpoint lets local tooling read Vanrot graph metadata from the Vite dev server.",
        status: "production-ready-through-phase-12",
        article: vitePluginDevtoolsMetadataArticle,
        componentName: "DevtoolsMetadataPage",
        component: vitePluginDevtoolsMetadataPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/vite-plugin/devtools-metadata/devtools-metadata.page.ts",
          html: "src/pages/docs/framework/vite-plugin/devtools-metadata/devtools-metadata.page.html",
          css: "src/pages/docs/framework/vite-plugin/devtools-metadata/devtools-metadata.page.css",
        },
        children: [

        ],
      }
    ],
  },
  {
    key: "forge",
    routeKey: "docsForge",
    section: docsPageSection.framework,
    path: "/docs/forge",
    label: "Forge",
    title: "Forge",
    summary: "@vanrot/forge is the native Vanrot app engine. It runs dev and build without Vite when a project chooses the Forge engine, while keeping Vite available as an explicit compatibility engine.",
    status: "production-ready-through-phase-32",
    article: forgeArticle,
    componentName: "ForgePage",
    component: forgePageComponent,
    sourceFiles: {
      ts: "src/pages/docs/framework/forge/forge.page.ts",
      html: "src/pages/docs/framework/forge/forge.page.html",
      css: "src/pages/docs/framework/forge/forge.page.css",
    },
    children: [
      {
        key: "forgeDev",
        routeKey: "docsForgeDev",
        section: docsPageSection.framework,
        path: "/docs/forge/dev",
        label: "Dev",
        title: "Forge Dev",
        summary: "Forge dev starts the Vanrot-native development server, serves the app shell and source assets, streams reload events, and reports compiler diagnostics without pulling in Vite.",
        status: "production-ready-through-phase-32",
        article: forgeDevArticle,
        componentName: "DevPage",
        component: forgeDevPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/forge/dev/dev.page.ts",
          html: "src/pages/docs/framework/forge/dev/dev.page.html",
          css: "src/pages/docs/framework/forge/dev/dev.page.css",
        },
        children: [

        ],
      },
      {
        key: "forgeBuild",
        routeKey: "docsForgeBuild",
        section: docsPageSection.framework,
        path: "/docs/forge/build",
        label: "Build",
        title: "Forge Build",
        summary: "Forge build turns a Vanrot app graph into deterministic static output: app shell, compiled application JavaScript, scoped CSS, route metadata, asset metadata, and optional diagnostics.",
        status: "production-ready-through-phase-32",
        article: forgeBuildArticle,
        componentName: "BuildPage",
        component: forgeBuildPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/forge/build/build.page.ts",
          html: "src/pages/docs/framework/forge/build/build.page.html",
          css: "src/pages/docs/framework/forge/build/build.page.css",
        },
        children: [

        ],
      },
      {
        key: "forgeConfig",
        routeKey: "docsForgeConfig",
        section: docsPageSection.framework,
        path: "/docs/forge/config",
        label: "Config",
        title: "Forge Config",
        summary: "Forge config is the engine decision point. vanrot.config.ts selects Forge or Vite, defines the source root, and gives the native engine enough structure to build the Vanrot app graph.",
        status: "production-ready-through-phase-32",
        article: forgeConfigArticle,
        componentName: "ConfigPage",
        component: forgeConfigPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/forge/config/config.page.ts",
          html: "src/pages/docs/framework/forge/config/config.page.html",
          css: "src/pages/docs/framework/forge/config/config.page.css",
        },
        children: [

        ],
      },
      {
        key: "forgeHooks",
        routeKey: "docsForgeHooks",
        section: docsPageSection.framework,
        path: "/docs/forge/hooks",
        label: "Hooks",
        title: "Forge Hooks",
        summary: "Forge hooks are first-party metadata and diagnostics hooks for Vanrot tools. They are deliberately not generic bundler plugin hooks.",
        status: "production-ready-through-phase-32",
        article: forgeHooksArticle,
        componentName: "HooksPage",
        component: forgeHooksPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/forge/hooks/hooks.page.ts",
          html: "src/pages/docs/framework/forge/hooks/hooks.page.html",
          css: "src/pages/docs/framework/forge/hooks/hooks.page.css",
        },
        children: [

        ],
      },
      {
        key: "forgeBenchmarks",
        routeKey: "docsForgeBenchmarks",
        section: docsPageSection.framework,
        path: "/docs/forge/benchmarks",
        label: "Benchmarks",
        title: "Forge Benchmarks",
        summary: "Forge benchmarks measure the Vanrot-native engine against the equivalent Vanrot Vite path, with a strict rule: public speed claims require measured comparison data.",
        status: "production-ready-through-phase-32",
        article: forgeBenchmarksArticle,
        componentName: "BenchmarksPage",
        component: forgeBenchmarksPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/forge/benchmarks/benchmarks.page.ts",
          html: "src/pages/docs/framework/forge/benchmarks/benchmarks.page.html",
          css: "src/pages/docs/framework/forge/benchmarks/benchmarks.page.css",
        },
        children: [

        ],
      }
    ],
  },
  {
    key: "cli",
    routeKey: "docsCli",
    section: docsPageSection.framework,
    path: "/docs/cli",
    label: "CLI",
    title: "CLI",
    summary: "@vanrot/cli is the project operator for Vanrot applications. It creates projects, writes role files, installs UI primitives, repairs configuration, runs Vite tasks, checks local health, and builds the project intelligence files used by devtools and AI readers.",
    status: "demo-capable-through-phase-14",
    article: cliArticle,
    componentName: "CliPage",
    component: cliPageComponent,
    sourceFiles: {
      ts: "src/pages/docs/framework/cli/cli.page.ts",
      html: "src/pages/docs/framework/cli/cli.page.html",
      css: "src/pages/docs/framework/cli/cli.page.css",
    },
    children: [
      {
        key: "cliCommandSurface",
        routeKey: "docsCliCommandSurface",
        section: docsPageSection.framework,
        path: "/docs/cli/commands",
        label: "Command Surface",
        title: "CLI Command Surface",
        summary: "The command surface explains how @vanrot/cli names, groups, reports, and validates every current vr command.",
        status: "demo-capable-through-phase-14",
        article: cliCommandSurfaceArticle,
        componentName: "CommandsPage",
        component: cliCommandSurfacePageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/cli/commands/commands.page.ts",
          html: "src/pages/docs/framework/cli/commands/commands.page.html",
          css: "src/pages/docs/framework/cli/commands/commands.page.css",
        },
        children: [

        ],
      },
      {
        key: "cliProjectCreation",
        routeKey: "docsCliProjectCreation",
        section: docsPageSection.framework,
        path: "/docs/cli/project-creation",
        label: "Project Creation",
        title: "CLI Project Creation",
        summary: "Project creation uses @vanrot/cli to start an application with Vanrot source layout, config, Vite wiring, and starter role files already aligned.",
        status: "demo-capable-through-phase-14",
        article: cliProjectCreationArticle,
        componentName: "ProjectCreationPage",
        component: cliProjectCreationPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/cli/project-creation/project-creation.page.ts",
          html: "src/pages/docs/framework/cli/project-creation/project-creation.page.html",
          css: "src/pages/docs/framework/cli/project-creation/project-creation.page.css",
        },
        children: [

        ],
      },
      {
        key: "cliRoleGeneration",
        routeKey: "docsCliRoleGeneration",
        section: docsPageSection.framework,
        path: "/docs/cli/role-generation",
        label: "Role Generation",
        title: "CLI Role Generation",
        summary: "Role generation writes Vanrot role files with predictable names, suffixes, templates, styles, and starter logic.",
        status: "demo-capable-through-phase-14",
        article: cliRoleGenerationArticle,
        componentName: "RoleGenerationPage",
        component: cliRoleGenerationPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/cli/role-generation/role-generation.page.ts",
          html: "src/pages/docs/framework/cli/role-generation/role-generation.page.html",
          css: "src/pages/docs/framework/cli/role-generation/role-generation.page.css",
        },
        children: [

        ],
      },
      {
        key: "cliUiPrimitiveAdd",
        routeKey: "docsCliUiPrimitiveAdd",
        section: docsPageSection.framework,
        path: "/docs/cli/ui-primitives",
        label: "UI Primitives",
        title: "CLI UI Primitive Add",
        summary: "UI primitive commands add Vanrot UI files and imports without breaking the project conventions around style mode and generated component ownership.",
        status: "demo-capable-through-phase-14",
        article: cliUiPrimitiveAddArticle,
        componentName: "UiPrimitivesPage",
        component: cliUiPrimitiveAddPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/cli/ui-primitives/ui-primitives.page.ts",
          html: "src/pages/docs/framework/cli/ui-primitives/ui-primitives.page.html",
          css: "src/pages/docs/framework/cli/ui-primitives/ui-primitives.page.css",
        },
        children: [

        ],
      },
      {
        key: "cliConfigMaintenance",
        routeKey: "docsCliConfigMaintenance",
        section: docsPageSection.framework,
        path: "/docs/cli/config-maintenance",
        label: "Config Maintenance",
        title: "CLI Config Maintenance",
        summary: "Configuration commands keep vanrot.config.ts present, canonical, repairable, and aligned with package expectations.",
        status: "production-ready-through-phase-13",
        article: cliConfigMaintenanceArticle,
        componentName: "ConfigMaintenancePage",
        component: cliConfigMaintenancePageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/cli/config-maintenance/config-maintenance.page.ts",
          html: "src/pages/docs/framework/cli/config-maintenance/config-maintenance.page.html",
          css: "src/pages/docs/framework/cli/config-maintenance/config-maintenance.page.css",
        },
        children: [

        ],
      },
      {
        key: "cliProjectIntelligence",
        routeKey: "docsCliProjectIntelligence",
        section: docsPageSection.framework,
        path: "/docs/cli/project-intelligence",
        label: "Project Intelligence",
        title: "CLI Project Intelligence",
        summary: "Project intelligence commands let Vanrot explain what it sees in the project, either as a doctor report, a persisted project map, or AI-readable context artifacts.",
        status: "production-ready-through-phase-23",
        article: cliProjectIntelligenceArticle,
        componentName: "ProjectIntelligencePage",
        component: cliProjectIntelligencePageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/cli/project-intelligence/project-intelligence.page.ts",
          html: "src/pages/docs/framework/cli/project-intelligence/project-intelligence.page.html",
          css: "src/pages/docs/framework/cli/project-intelligence/project-intelligence.page.css",
        },
        children: [

        ],
      },
      {
        key: "cliTaskRunners",
        routeKey: "docsCliTaskRunners",
        section: docsPageSection.framework,
        path: "/docs/cli/task-runners",
        label: "Task Runners",
        title: "CLI Task Runners",
        summary: "Task runner commands let a Vanrot project use familiar vr dev, vr build, and vr test commands while keeping the Vite integration and project config visible.",
        status: "demo-capable-through-phase-14",
        article: cliTaskRunnersArticle,
        componentName: "TaskRunnersPage",
        component: cliTaskRunnersPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/cli/task-runners/task-runners.page.ts",
          html: "src/pages/docs/framework/cli/task-runners/task-runners.page.html",
          css: "src/pages/docs/framework/cli/task-runners/task-runners.page.css",
        },
        children: [

        ],
      },
      {
        key: "cliDevServer",
        routeKey: "docsCliDevServer",
        section: docsPageSection.framework,
        path: "/docs/cli/dev",
        label: "Dev Server",
        title: "CLI Dev Server",
        summary: "vr dev starts the local Vanrot preview loop by validating project config and then running Vite with the configured host and port.",
        status: "demo-capable-through-phase-14",
        article: cliDevServerArticle,
        componentName: "DevPage",
        component: cliDevServerPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/cli/dev/dev.page.ts",
          html: "src/pages/docs/framework/cli/dev/dev.page.html",
          css: "src/pages/docs/framework/cli/dev/dev.page.css",
        },
        children: [

        ],
      },
      {
        key: "cliBuild",
        routeKey: "docsCliBuild",
        section: docsPageSection.framework,
        path: "/docs/cli/build",
        label: "Build",
        title: "CLI Build",
        summary: "vr build validates Vanrot config and then runs the production Vite build so release output uses the same framework plugin path as development.",
        status: "demo-capable-through-phase-14",
        article: cliBuildArticle,
        componentName: "BuildPage",
        component: cliBuildPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/cli/build/build.page.ts",
          html: "src/pages/docs/framework/cli/build/build.page.html",
          css: "src/pages/docs/framework/cli/build/build.page.css",
        },
        children: [

        ],
      },
      {
        key: "cliTest",
        routeKey: "docsCliTest",
        section: docsPageSection.framework,
        path: "/docs/cli/test",
        label: "Test",
        title: "CLI Test",
        summary: "vr test validates config and runs the project test suite through vitest run so local and CI checks share the same non-watch behavior.",
        status: "demo-capable-through-phase-14",
        article: cliTestArticle,
        componentName: "TestPage",
        component: cliTestPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/cli/test/test.page.ts",
          html: "src/pages/docs/framework/cli/test/test.page.html",
          css: "src/pages/docs/framework/cli/test/test.page.css",
        },
        children: [

        ],
      }
    ],
  },
  {
    key: "configuration",
    routeKey: "docsConfiguration",
    section: docsPageSection.framework,
    path: "/docs/configuration",
    label: "Configuration",
    title: "Configuration",
    summary: "@vanrot/config owns vanrot.config.ts, default normalization, validation, migration, recovery, generated domain editing, router diagnostics settings, UI settings, and AI rules settings.",
    status: "production-ready-through-phase-13",
    article: configurationArticle,
    componentName: "ConfigurationPage",
    component: configurationPageComponent,
    sourceFiles: {
      ts: "src/pages/docs/framework/configuration/configuration.page.ts",
      html: "src/pages/docs/framework/configuration/configuration.page.html",
      css: "src/pages/docs/framework/configuration/configuration.page.css",
    },
    children: [
      {
        key: "configurationFile",
        routeKey: "docsConfigurationFile",
        section: docsPageSection.framework,
        path: "/docs/configuration/file",
        label: "Config File",
        title: "Configuration File",
        summary: "The config file guide explains how vanrot.config.ts is authored, loaded, typed, and shared across packages.",
        status: "production-ready-through-phase-13",
        article: configurationFileArticle,
        componentName: "FilePage",
        component: configurationFilePageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/configuration/file/file.page.ts",
          html: "src/pages/docs/framework/configuration/file/file.page.html",
          css: "src/pages/docs/framework/configuration/file/file.page.css",
        },
        children: [

        ],
      },
      {
        key: "configurationDefaults",
        routeKey: "docsConfigurationDefaults",
        section: docsPageSection.framework,
        path: "/docs/configuration/defaults",
        label: "Defaults",
        title: "Configuration Defaults",
        summary: "Configuration defaults explain what @vanrot/config supplies when a project leaves optional settings out.",
        status: "production-ready-through-phase-13",
        article: configurationDefaultsArticle,
        componentName: "DefaultsPage",
        component: configurationDefaultsPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/configuration/defaults/defaults.page.ts",
          html: "src/pages/docs/framework/configuration/defaults/defaults.page.html",
          css: "src/pages/docs/framework/configuration/defaults/defaults.page.css",
        },
        children: [

        ],
      },
      {
        key: "configurationUi",
        routeKey: "docsConfigurationUi",
        section: docsPageSection.framework,
        path: "/docs/configuration/ui",
        label: "UI Config",
        title: "UI Configuration",
        summary: "UI configuration controls the flavor and style mode used by generated UI primitive files.",
        status: "production-ready-through-phase-13",
        article: configurationUiArticle,
        componentName: "UiPage",
        component: configurationUiPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/configuration/ui/ui.page.ts",
          html: "src/pages/docs/framework/configuration/ui/ui.page.html",
          css: "src/pages/docs/framework/configuration/ui/ui.page.css",
        },
        children: [

        ],
      },
      {
        key: "configurationRouter",
        routeKey: "docsConfigurationRouter",
        section: docsPageSection.framework,
        path: "/docs/configuration/router",
        label: "Router Config",
        title: "Router Configuration",
        summary: "Router configuration controls diagnostics and navigation polish settings consumed by @vanrot/router and related tooling.",
        status: "production-ready-through-phase-15",
        article: configurationRouterArticle,
        componentName: "RouterPage",
        component: configurationRouterPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/configuration/router/router.page.ts",
          html: "src/pages/docs/framework/configuration/router/router.page.html",
          css: "src/pages/docs/framework/configuration/router/router.page.css",
        },
        children: [

        ],
      },
      {
        key: "configurationAi",
        routeKey: "docsConfigurationAi",
        section: docsPageSection.framework,
        path: "/docs/configuration/ai",
        label: "AI Config",
        title: "AI Configuration",
        summary: "AI configuration controls generated AI rule sections and project intelligence behavior without making AI bundles the source of truth.",
        status: "production-ready-through-phase-25",
        article: configurationAiArticle,
        componentName: "AiPage",
        component: configurationAiPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/configuration/ai/ai.page.ts",
          html: "src/pages/docs/framework/configuration/ai/ai.page.html",
          css: "src/pages/docs/framework/configuration/ai/ai.page.css",
        },
        children: [

        ],
      },
      {
        key: "configurationMaintenance",
        routeKey: "docsConfigurationMaintenance",
        section: docsPageSection.framework,
        path: "/docs/configuration/maintenance",
        label: "Maintenance",
        title: "Configuration Maintenance",
        summary: "Configuration maintenance covers migration, recovery, validation, diagnostics, and generated-domain editing in @vanrot/config.",
        status: "production-ready-through-phase-13",
        article: configurationMaintenanceArticle,
        componentName: "MaintenancePage",
        component: configurationMaintenancePageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/configuration/maintenance/maintenance.page.ts",
          html: "src/pages/docs/framework/configuration/maintenance/maintenance.page.html",
          css: "src/pages/docs/framework/configuration/maintenance/maintenance.page.css",
        },
        children: [

        ],
      }
    ],
  },
  {
    key: "editorTooling",
    routeKey: "docsEditorTooling",
    section: docsPageSection.framework,
    path: "/docs/editor-tooling",
    label: "Editor Tooling",
    title: "Editor Tooling",
    summary: "Vanrot editor tooling gives JetBrains IDEs route, component, template, Web Types, diagnostics, code action, and package metadata support through the language server.",
    status: "available-now",
    article: editorToolingArticle,
    componentName: "EditorToolingPage",
    component: editorToolingPageComponent,
    sourceFiles: {
      ts: "src/pages/docs/framework/editor-tooling/editor-tooling.page.ts",
      html: "src/pages/docs/framework/editor-tooling/editor-tooling.page.html",
      css: "src/pages/docs/framework/editor-tooling/editor-tooling.page.css",
    },
    children: [
      {
        key: "editorToolingWebTypes",
        routeKey: "docsEditorToolingWebTypes",
        section: docsPageSection.framework,
        path: "/docs/editor-tooling/web-types",
        label: "Web Types",
        title: "Editor Web Types",
        summary: "Web Types metadata teaches IntelliJ and WebStorm which Vanrot tags and attributes are valid before language-server behavior runs.",
        status: "available-now",
        article: editorToolingWebTypesArticle,
        componentName: "WebTypesPage",
        component: editorToolingWebTypesPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/editor-tooling/web-types/web-types.page.ts",
          html: "src/pages/docs/framework/editor-tooling/web-types/web-types.page.html",
          css: "src/pages/docs/framework/editor-tooling/web-types/web-types.page.css",
        },
        children: [

        ],
      },
      {
        key: "editorToolingNavigation",
        routeKey: "docsEditorToolingNavigation",
        section: docsPageSection.framework,
        path: "/docs/editor-tooling/navigation",
        label: "Navigation",
        title: "Editor Navigation",
        summary: "Vanrot navigation covers definitions, references, and rename for route refs, component tags, docs tags, and Web Types-backed UI tags.",
        status: "available-now",
        article: editorToolingNavigationArticle,
        componentName: "NavigationPage",
        component: editorToolingNavigationPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/editor-tooling/navigation/navigation.page.ts",
          html: "src/pages/docs/framework/editor-tooling/navigation/navigation.page.html",
          css: "src/pages/docs/framework/editor-tooling/navigation/navigation.page.css",
        },
        children: [

        ],
      },
      {
        key: "editorToolingDiagnostics",
        routeKey: "docsEditorToolingDiagnostics",
        section: docsPageSection.framework,
        path: "/docs/editor-tooling/diagnostics",
        label: "Diagnostics",
        title: "Editor Diagnostics",
        summary: "Vanrot editor diagnostics flag unknown route refs, unknown metadata, and stale intelligence without treating valid bracket bindings or docs bindings as bugs.",
        status: "available-now",
        article: editorToolingDiagnosticsArticle,
        componentName: "DiagnosticsPage",
        component: editorToolingDiagnosticsPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/editor-tooling/diagnostics/diagnostics.page.ts",
          html: "src/pages/docs/framework/editor-tooling/diagnostics/diagnostics.page.html",
          css: "src/pages/docs/framework/editor-tooling/diagnostics/diagnostics.page.css",
        },
        children: [

        ],
      },
      {
        key: "editorToolingJetBrains",
        routeKey: "docsEditorToolingJetBrains",
        section: docsPageSection.framework,
        path: "/docs/editor-tooling/jetbrains",
        label: "JetBrains",
        title: "JetBrains Plugin",
        summary: "The JetBrains plugin packages the Vanrot language server and keeps editor behavior in TypeScript.",
        status: "available-now",
        article: editorToolingJetBrainsArticle,
        componentName: "JetbrainsPage",
        component: editorToolingJetBrainsPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/editor-tooling/jetbrains/jetbrains.page.ts",
          html: "src/pages/docs/framework/editor-tooling/jetbrains/jetbrains.page.html",
          css: "src/pages/docs/framework/editor-tooling/jetbrains/jetbrains.page.css",
        },
        children: [

        ],
      }
    ],
  },
  {
    key: "routing",
    routeKey: "docsRouting",
    section: docsPageSection.framework,
    path: "/docs/routing",
    label: "Routing",
    title: "Routing",
    summary: "@vanrot/router owns route refs, nested layouts, params, query strings, redirects, guards, active links, breadcrumbs, preloading, keepAlive, route diagnostics, and current route state.",
    status: "production-ready-through-phase-15",
    article: routingArticle,
    componentName: "RoutingPage",
    component: routingPageComponent,
    sourceFiles: {
      ts: "src/pages/docs/framework/routing/routing.page.ts",
      html: "src/pages/docs/framework/routing/routing.page.html",
      css: "src/pages/docs/framework/routing/routing.page.css",
    },
    children: [
      {
        key: "routingRouteTable",
        routeKey: "docsRoutingRouteTable",
        section: docsPageSection.framework,
        path: "/docs/routing/route-table",
        label: "Route Table",
        title: "Routing Route Table",
        summary: "Route tables use createRoutes and defineRoutes to keep paths, labels, pages, layouts, redirects, and route refs in one named structure.",
        status: "production-ready-through-phase-15",
        article: routingRouteTableArticle,
        componentName: "RouteTablePage",
        component: routingRouteTablePageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/routing/route-table/route-table.page.ts",
          html: "src/pages/docs/framework/routing/route-table/route-table.page.html",
          css: "src/pages/docs/framework/routing/route-table/route-table.page.css",
        },
        children: [

        ],
      },
      {
        key: "routingParamsQuery",
        routeKey: "docsRoutingParamsQuery",
        section: docsPageSection.framework,
        path: "/docs/routing/params-query",
        label: "Params and Query",
        title: "Routing Params and Query",
        summary: "Params and query helpers parse, fill, match, and build URL data without hand-joining route strings.",
        status: "production-ready-through-phase-15",
        article: routingParamsQueryArticle,
        componentName: "ParamsQueryPage",
        component: routingParamsQueryPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/routing/params-query/params-query.page.ts",
          html: "src/pages/docs/framework/routing/params-query/params-query.page.html",
          css: "src/pages/docs/framework/routing/params-query/params-query.page.css",
        },
        children: [

        ],
      },
      {
        key: "routingLayoutsRedirects",
        routeKey: "docsRoutingLayoutsRedirects",
        section: docsPageSection.framework,
        path: "/docs/routing/layouts-redirects",
        label: "Layouts and Redirects",
        title: "Routing Layouts and Redirects",
        summary: "Layouts and redirects describe nested route structure and canonical navigation targets without putting routing policy in templates.",
        status: "production-ready-through-phase-15",
        article: routingLayoutsRedirectsArticle,
        componentName: "LayoutsRedirectsPage",
        component: routingLayoutsRedirectsPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/routing/layouts-redirects/layouts-redirects.page.ts",
          html: "src/pages/docs/framework/routing/layouts-redirects/layouts-redirects.page.html",
          css: "src/pages/docs/framework/routing/layouts-redirects/layouts-redirects.page.css",
        },
        children: [

        ],
      },
      {
        key: "routingGuards",
        routeKey: "docsRoutingGuards",
        section: docsPageSection.framework,
        path: "/docs/routing/guards",
        label: "Guards",
        title: "Routing Guards",
        summary: "Route guards decide whether navigation may continue, redirect, or stop before a protected page renders.",
        status: "production-ready-through-phase-15",
        article: routingGuardsArticle,
        componentName: "GuardsPage",
        component: routingGuardsPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/routing/guards/guards.page.ts",
          html: "src/pages/docs/framework/routing/guards/guards.page.html",
          css: "src/pages/docs/framework/routing/guards/guards.page.css",
        },
        children: [

        ],
      },
      {
        key: "routingNavigation",
        routeKey: "docsRoutingNavigation",
        section: docsPageSection.framework,
        path: "/docs/routing/navigation",
        label: "Navigation",
        title: "Routing Navigation",
        summary: "Navigation polish covers current route state, active links, breadcrumbs, route params signals, and route diagnostics.",
        status: "production-ready-through-phase-15",
        article: routingNavigationArticle,
        componentName: "NavigationPage",
        component: routingNavigationPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/routing/navigation/navigation.page.ts",
          html: "src/pages/docs/framework/routing/navigation/navigation.page.html",
          css: "src/pages/docs/framework/routing/navigation/navigation.page.css",
        },
        children: [

        ],
      },
      {
        key: "routingPreloadingKeepAlive",
        routeKey: "docsRoutingPreloadingKeepAlive",
        section: docsPageSection.framework,
        path: "/docs/routing/preloading-keep-alive",
        label: "Preloading and KeepAlive",
        title: "Routing Preloading and KeepAlive",
        summary: "Preloading and keepAlive improve navigation responsiveness and state restoration when a route really benefits from retained work.",
        status: "production-ready-through-phase-15",
        article: routingPreloadingKeepAliveArticle,
        componentName: "PreloadingKeepAlivePage",
        component: routingPreloadingKeepAlivePageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/routing/preloading-keep-alive/preloading-keep-alive.page.ts",
          html: "src/pages/docs/framework/routing/preloading-keep-alive/preloading-keep-alive.page.html",
          css: "src/pages/docs/framework/routing/preloading-keep-alive/preloading-keep-alive.page.css",
        },
        children: [

        ],
      }
    ],
  },
  {
    key: "ssrHydration",
    routeKey: "docsSsrHydration",
    section: docsPageSection.framework,
    path: "/docs/ssr-hydration",
    label: "SSR and Hydration",
    title: "SSR And Hydration",
    summary: "Use @vanrot/ssr for deterministic server markup, shell output, escaped hydration state, route-aware rendering, and explicit hydration diagnostics.",
    status: "production-ready",
    article: ssrHydrationArticle,
    componentName: "SsrHydrationPage",
    component: ssrHydrationPageComponent,
    sourceFiles: {
      ts: "src/pages/docs/framework/ssr-hydration/ssr-hydration.page.ts",
      html: "src/pages/docs/framework/ssr-hydration/ssr-hydration.page.html",
      css: "src/pages/docs/framework/ssr-hydration/ssr-hydration.page.css",
    },
    children: [
      {
        key: "ssrPackageBoundary",
        routeKey: "docsSsrPackageBoundary",
        section: docsPageSection.framework,
        path: "/docs/ssr-hydration/package-boundary",
        label: "Package boundary",
        title: "SSR Package Boundary",
        summary: "@vanrot/ssr owns server-only rendering APIs so runtime, compiler, router, and app code keep clean browser and server responsibilities.",
        status: "production-ready",
        article: ssrPackageBoundaryArticle,
        componentName: "PackageBoundaryPage",
        component: ssrPackageBoundaryPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/ssr-hydration/package-boundary/package-boundary.page.ts",
          html: "src/pages/docs/framework/ssr-hydration/package-boundary/package-boundary.page.html",
          css: "src/pages/docs/framework/ssr-hydration/package-boundary/package-boundary.page.css",
        },
        children: [

        ],
      },
      {
        key: "ssrRenderDocument",
        routeKey: "docsSsrRenderDocument",
        section: docsPageSection.framework,
        path: "/docs/ssr-hydration/render-document",
        label: "Render document",
        title: "Render Document",
        summary: "renderDocument owns the final HTML shell: title, head entries, body markup, assets, base paths, and serialized hydration state.",
        status: "production-ready",
        article: ssrRenderDocumentArticle,
        componentName: "RenderDocumentPage",
        component: ssrRenderDocumentPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/ssr-hydration/render-document/render-document.page.ts",
          html: "src/pages/docs/framework/ssr-hydration/render-document/render-document.page.html",
          css: "src/pages/docs/framework/ssr-hydration/render-document/render-document.page.css",
        },
        children: [

        ],
      },
      {
        key: "ssrHydrationContract",
        routeKey: "docsSsrHydrationContract",
        section: docsPageSection.framework,
        path: "/docs/ssr-hydration/hydration-contract",
        label: "Hydration contract",
        title: "Hydration Contract",
        summary: "Hydration attaches behavior to server markup and reports deterministic mismatches instead of silently replacing user-visible HTML.",
        status: "production-ready",
        article: ssrHydrationContractArticle,
        componentName: "HydrationContractPage",
        component: ssrHydrationContractPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/ssr-hydration/hydration-contract/hydration-contract.page.ts",
          html: "src/pages/docs/framework/ssr-hydration/hydration-contract/hydration-contract.page.html",
          css: "src/pages/docs/framework/ssr-hydration/hydration-contract/hydration-contract.page.css",
        },
        children: [

        ],
      },
      {
        key: "ssrStateSerialization",
        routeKey: "docsSsrStateSerialization",
        section: docsPageSection.framework,
        path: "/docs/ssr-hydration/state-serialization",
        label: "State serialization",
        title: "State Serialization",
        summary: "Hydration state is serialized and escaped by @vanrot/ssr so the client can resume with safe route, data, and diagnostic context.",
        status: "production-ready",
        article: ssrStateSerializationArticle,
        componentName: "StateSerializationPage",
        component: ssrStateSerializationPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/ssr-hydration/state-serialization/state-serialization.page.ts",
          html: "src/pages/docs/framework/ssr-hydration/state-serialization/state-serialization.page.html",
          css: "src/pages/docs/framework/ssr-hydration/state-serialization/state-serialization.page.css",
        },
        children: [

        ],
      },
      {
        key: "ssrRouter",
        routeKey: "docsSsrRouter",
        section: docsPageSection.framework,
        path: "/docs/ssr-hydration/router-ssr",
        label: "Router SSR",
        title: "Router SSR",
        summary: "SSR route rendering uses route refs, params, query parsing, guards, redirects, and lazy boundaries from the same router contract as client navigation.",
        status: "production-ready",
        article: ssrRouterArticle,
        componentName: "RouterSsrPage",
        component: ssrRouterPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/ssr-hydration/router-ssr/router-ssr.page.ts",
          html: "src/pages/docs/framework/ssr-hydration/router-ssr/router-ssr.page.html",
          css: "src/pages/docs/framework/ssr-hydration/router-ssr/router-ssr.page.css",
        },
        children: [

        ],
      },
      {
        key: "ssrDeferredStreaming",
        routeKey: "docsSsrDeferredStreaming",
        section: docsPageSection.framework,
        path: "/docs/ssr-hydration/deferred-streaming",
        label: "Deferred streaming",
        title: "Deferred Streaming",
        summary: "Streaming, event replay, partial hydration, islands, and resumability stay future work until the base SSR and hydration contract is stable.",
        status: "production-ready",
        article: ssrDeferredStreamingArticle,
        componentName: "DeferredStreamingPage",
        component: ssrDeferredStreamingPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/ssr-hydration/deferred-streaming/deferred-streaming.page.ts",
          html: "src/pages/docs/framework/ssr-hydration/deferred-streaming/deferred-streaming.page.html",
          css: "src/pages/docs/framework/ssr-hydration/deferred-streaming/deferred-streaming.page.css",
        },
        children: [

        ],
      }
    ],
  },
  {
    key: "uiOctober",
    routeKey: "docsUiOctober",
    section: docsPageSection.ui,
    path: "/docs/ui",
    label: "October",
    title: "UI October",
    summary: "October is Vanrot's dark-first, light-capable UI foundation with source-owned primitives, tokens, and vanrotstyles.",
    status: "in-progress-through-phase-16b",
    article: uiOctoberArticle,
    componentName: "UiPage",
    component: uiOctoberPageComponent,
    sourceFiles: {
      ts: "src/pages/docs/ui/ui/ui.page.ts",
      html: "src/pages/docs/ui/ui/ui.page.html",
      css: "src/pages/docs/ui/ui/ui.page.css",
    },
    children: [

    ],
  },
  {
    key: "theming",
    routeKey: "docsTheming",
    section: docsPageSection.ui,
    path: "/docs/theming",
    label: "Theming",
    title: "Theming",
    summary: "Vanrot themes use CSS custom properties for colors, surfaces, radius, shadows, typography, motion, and z-index layers.",
    status: "available-now",
    article: themingArticle,
    componentName: "ThemingPage",
    component: themingPageComponent,
    sourceFiles: {
      ts: "src/pages/docs/ui/theming/theming.page.ts",
      html: "src/pages/docs/ui/theming/theming.page.html",
      css: "src/pages/docs/ui/theming/theming.page.css",
    },
    children: [

    ],
  },
  {
    key: "vanrotstyles",
    routeKey: "docsVanrotstyles",
    section: docsPageSection.ui,
    path: "/docs/vanrotstyles",
    label: "vanrotstyles",
    title: "vanrotstyles",
    summary: "vanrotstyles.css is Vanrot's first-party utility CSS layer with unprefixed utility classes.",
    status: "available-now",
    article: vanrotstylesArticle,
    componentName: "VanrotstylesPage",
    component: vanrotstylesPageComponent,
    sourceFiles: {
      ts: "src/pages/docs/ui/vanrotstyles/vanrotstyles.page.ts",
      html: "src/pages/docs/ui/vanrotstyles/vanrotstyles.page.html",
      css: "src/pages/docs/ui/vanrotstyles/vanrotstyles.page.css",
    },
    children: [

    ],
  },
  {
    key: "testing",
    routeKey: "docsTesting",
    section: docsPageSection.framework,
    path: "/docs/testing",
    label: "Testing",
    title: "Testing",
    summary: "@vanrot/testing ships component, page, router, accessibility, async, and generator helpers for readable Vitest and jsdom workflows.",
    status: "production-ready",
    article: testingArticle,
    componentName: "TestingPage",
    component: testingPageComponent,
    sourceFiles: {
      ts: "src/pages/docs/framework/testing/testing.page.ts",
      html: "src/pages/docs/framework/testing/testing.page.html",
      css: "src/pages/docs/framework/testing/testing.page.css",
    },
    children: [
      {
        key: "testingComponent",
        routeKey: "docsTestingComponent",
        section: docsPageSection.framework,
        path: "/docs/testing/component-tests",
        label: "Component Tests",
        title: "Testing Component Tests",
        summary: "Component tests mount a Vanrot component through testComponent and assert against rendered behavior.",
        status: "production-ready",
        article: testingComponentArticle,
        componentName: "ComponentTestsPage",
        component: testingComponentPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/testing/component-tests/component-tests.page.ts",
          html: "src/pages/docs/framework/testing/component-tests/component-tests.page.html",
          css: "src/pages/docs/framework/testing/component-tests/component-tests.page.css",
        },
        children: [

        ],
      },
      {
        key: "testingScreen",
        routeKey: "docsTestingScreen",
        section: docsPageSection.framework,
        path: "/docs/testing/screen",
        label: "Screen",
        title: "Testing Screen",
        summary: "Screen is the small DOM query surface returned by @vanrot/testing component and page tests.",
        status: "production-ready",
        article: testingScreenArticle,
        componentName: "ScreenPage",
        component: testingScreenPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/testing/screen/screen.page.ts",
          html: "src/pages/docs/framework/testing/screen/screen.page.html",
          css: "src/pages/docs/framework/testing/screen/screen.page.css",
        },
        children: [

        ],
      },
      {
        key: "testingRouting",
        routeKey: "docsTestingRouting",
        section: docsPageSection.framework,
        path: "/docs/testing/routing",
        label: "Routing Tests",
        title: "Testing Routing",
        summary: "Routing tests verify route refs, paths, params, query values, redirects, guards, lazy pages, active state, preloading, and cleanup at the router boundary.",
        status: "production-ready",
        article: testingRoutingArticle,
        componentName: "RoutingPage",
        component: testingRoutingPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/testing/routing/routing.page.ts",
          html: "src/pages/docs/framework/testing/routing/routing.page.html",
          css: "src/pages/docs/framework/testing/routing/routing.page.css",
        },
        children: [

        ],
      },
      {
        key: "testingStrategy",
        routeKey: "docsTestingStrategy",
        section: docsPageSection.framework,
        path: "/docs/testing/strategy",
        label: "Strategy",
        title: "Testing Strategy",
        summary: "Testing strategy explains where to put coverage across Vanrot runtime, compiler, router, CLI, docs, UI, and generated artifacts.",
        status: "production-ready",
        article: testingStrategyArticle,
        componentName: "StrategyPage",
        component: testingStrategyPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/testing/strategy/strategy.page.ts",
          html: "src/pages/docs/framework/testing/strategy/strategy.page.html",
          css: "src/pages/docs/framework/testing/strategy/strategy.page.css",
        },
        children: [

        ],
      }
    ],
  },
  {
    key: "forms",
    routeKey: "docsForms",
    section: docsPageSection.framework,
    path: "/docs/forms",
    label: "Forms",
    title: "Forms And Async Resources",
    summary: "@vanrot/forms is the first-party package for signal-native form state, validation, field arrays, wizards, form-scoped async resources, server errors, draft persistence, metadata, diagnostics, and tests.",
    status: "production-ready",
    article: formsArticle,
    componentName: "FormsPage",
    component: formsPageComponent,
    sourceFiles: {
      ts: "src/pages/docs/framework/forms/forms.page.ts",
      html: "src/pages/docs/framework/forms/forms.page.html",
      css: "src/pages/docs/framework/forms/forms.page.css",
    },
    children: [
      {
        key: "formsBoundary",
        routeKey: "docsFormsBoundary",
        section: docsPageSection.framework,
        path: "/docs/forms/package-boundary",
        label: "Package boundary",
        title: "Forms Package Boundary",
        summary: "@vanrot/forms owns form state, validation, form resources, field arrays, wizards, server errors, draft persistence, diagnostics, and test helpers without moving app logic into templates.",
        status: "production-ready",
        article: formsBoundaryArticle,
        componentName: "PackageBoundaryPage",
        component: formsBoundaryPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/forms/package-boundary/package-boundary.page.ts",
          html: "src/pages/docs/framework/forms/package-boundary/package-boundary.page.html",
          css: "src/pages/docs/framework/forms/package-boundary/package-boundary.page.css",
        },
        children: [

        ],
      },
      {
        key: "formsFieldRefs",
        routeKey: "docsFormsFieldRefs",
        section: docsPageSection.framework,
        path: "/docs/forms/field-refs",
        label: "Named field refs",
        title: "Named Field Refs",
        summary: "Named field refs give forms a stable source of truth for labels, paths, messages, diagnostics, generated form bindings, and tests.",
        status: "production-ready",
        article: formsFieldRefsArticle,
        componentName: "FieldRefsPage",
        component: formsFieldRefsPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/forms/field-refs/field-refs.page.ts",
          html: "src/pages/docs/framework/forms/field-refs/field-refs.page.html",
          css: "src/pages/docs/framework/forms/field-refs/field-refs.page.css",
        },
        children: [

        ],
      },
      {
        key: "formsValidationLifecycle",
        routeKey: "docsFormsValidationLifecycle",
        section: docsPageSection.framework,
        path: "/docs/forms/validation-lifecycle",
        label: "Validation lifecycle",
        title: "Validation Lifecycle",
        summary: "Validation runs through predictable sync and async stages with typed messages, dirty and touched state, submit guards, and line-numbered diagnostics.",
        status: "production-ready",
        article: formsValidationLifecycleArticle,
        componentName: "ValidationLifecyclePage",
        component: formsValidationLifecyclePageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/forms/validation-lifecycle/validation-lifecycle.page.ts",
          html: "src/pages/docs/framework/forms/validation-lifecycle/validation-lifecycle.page.html",
          css: "src/pages/docs/framework/forms/validation-lifecycle/validation-lifecycle.page.css",
        },
        children: [

        ],
      },
      {
        key: "formsAsyncResources",
        routeKey: "docsFormsAsyncResources",
        section: docsPageSection.framework,
        path: "/docs/forms/async-resources",
        label: "Async resources",
        title: "Form Async Resources",
        summary: "Form resources load option data, dependent fields, submit state, and server checks while keeping cancellation and stale response handling inside form orchestration.",
        status: "production-ready",
        article: formsAsyncResourcesArticle,
        componentName: "AsyncResourcesPage",
        component: formsAsyncResourcesPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/forms/async-resources/async-resources.page.ts",
          html: "src/pages/docs/framework/forms/async-resources/async-resources.page.html",
          css: "src/pages/docs/framework/forms/async-resources/async-resources.page.css",
        },
        children: [

        ],
      },
      {
        key: "formsArraysWizardsErrors",
        routeKey: "docsFormsArraysWizardsErrors",
        section: docsPageSection.framework,
        path: "/docs/forms/arrays-wizards-server-errors",
        label: "Arrays and server errors",
        title: "Arrays, Wizards, And Server Errors",
        summary: "Forms support repeated groups, wizard steps, and backend error hydration with stable refs instead of ad hoc index strings.",
        status: "production-ready",
        article: formsArraysWizardsErrorsArticle,
        componentName: "ArraysWizardsServerErrorsPage",
        component: formsArraysWizardsErrorsPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/forms/arrays-wizards-server-errors/arrays-wizards-server-errors.page.ts",
          html: "src/pages/docs/framework/forms/arrays-wizards-server-errors/arrays-wizards-server-errors.page.html",
          css: "src/pages/docs/framework/forms/arrays-wizards-server-errors/arrays-wizards-server-errors.page.css",
        },
        children: [

        ],
      },
      {
        key: "formsDraftPersistence",
        routeKey: "docsFormsDraftPersistence",
        section: docsPageSection.framework,
        path: "/docs/forms/draft-persistence",
        label: "Draft persistence",
        title: "Draft Persistence",
        summary: "Draft persistence saves recoverable form state while protecting sensitive fields and keeping restore behavior explicit.",
        status: "production-ready",
        article: formsDraftPersistenceArticle,
        componentName: "DraftPersistencePage",
        component: formsDraftPersistencePageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/forms/draft-persistence/draft-persistence.page.ts",
          html: "src/pages/docs/framework/forms/draft-persistence/draft-persistence.page.html",
          css: "src/pages/docs/framework/forms/draft-persistence/draft-persistence.page.css",
        },
        children: [

        ],
      },
      {
        key: "formsToolingTests",
        routeKey: "docsFormsToolingTests",
        section: docsPageSection.framework,
        path: "/docs/forms/tooling-tests",
        label: "Tooling and tests",
        title: "Forms Tooling And Tests",
        summary: "Forms ship diagnostics, Vite discovery hooks, and test helpers so generated form behavior can be proved without clicking through every field manually.",
        status: "production-ready",
        article: formsToolingTestsArticle,
        componentName: "ToolingTestsPage",
        component: formsToolingTestsPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/forms/tooling-tests/tooling-tests.page.ts",
          html: "src/pages/docs/framework/forms/tooling-tests/tooling-tests.page.html",
          css: "src/pages/docs/framework/forms/tooling-tests/tooling-tests.page.css",
        },
        children: [

        ],
      }
    ],
  },
  {
    key: "store",
    routeKey: "docsStore",
    section: docsPageSection.framework,
    path: "/docs/store",
    label: "Store",
    title: "Store",
    summary: "@vanrot/store is the first-party signal-native state package for readable actions, selectors, reducers, full effects, StoreError normalization, page-facing useStore composition, and headless inspection for snapshots and replay.",
    status: "production-ready-through-phase-20",
    article: storeArticle,
    componentName: "StorePage",
    component: storePageComponent,
    sourceFiles: {
      ts: "src/pages/docs/framework/store/store.page.ts",
      html: "src/pages/docs/framework/store/store.page.html",
      css: "src/pages/docs/framework/store/store.page.css",
    },
    children: [
      {
        key: "storeActions",
        routeKey: "docsStoreActions",
        section: docsPageSection.framework,
        path: "/docs/store/actions",
        label: "Actions",
        title: "Store Actions",
        summary: "Store actions use fluent actionSet declarations so workflow lifecycle phases stay grouped under one action name without repeated string literals.",
        status: "production-ready-through-phase-19",
        article: storeActionsArticle,
        componentName: "ActionsPage",
        component: storeActionsPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/store/actions/actions.page.ts",
          html: "src/pages/docs/framework/store/actions/actions.page.html",
          css: "src/pages/docs/framework/store/actions/actions.page.css",
        },
        children: [

        ],
      },
      {
        key: "storeSelectors",
        routeKey: "docsStoreSelectors",
        section: docsPageSection.framework,
        path: "/docs/store/selectors",
        label: "Selectors",
        title: "Store Selectors",
        summary: "Store selectors use property names from defineSelectors(state).selectorName(fn), which keeps selector names typed and avoids repeated string literals.",
        status: "production-ready-through-phase-19",
        article: storeSelectorsArticle,
        componentName: "SelectorsPage",
        component: storeSelectorsPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/store/selectors/selectors.page.ts",
          html: "src/pages/docs/framework/store/selectors/selectors.page.html",
          css: "src/pages/docs/framework/store/selectors/selectors.page.css",
        },
        children: [

        ],
      },
      {
        key: "storeReducers",
        routeKey: "docsStoreReducers",
        section: docsPageSection.framework,
        path: "/docs/store/reducers",
        label: "Reducers",
        title: "Store Reducers",
        summary: "Store reducers use on(action).patch(fn) for partial immutable updates and on(action).set(fn) for full state replacement.",
        status: "production-ready-through-phase-19",
        article: storeReducersArticle,
        componentName: "ReducersPage",
        component: storeReducersPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/store/reducers/reducers.page.ts",
          html: "src/pages/docs/framework/store/reducers/reducers.page.html",
          css: "src/pages/docs/framework/store/reducers/reducers.page.css",
        },
        children: [

        ],
      },
      {
        key: "storeEffects",
        routeKey: "docsStoreEffects",
        section: docsPageSection.framework,
        path: "/docs/store/effects",
        label: "Effects",
        title: "Store Effects",
        summary: "Store effects use a fluent stack with run, success, error, latestBy, skipWhen, cancelWhen, timeout, retry, and trace for readable async workflows.",
        status: "production-ready-through-phase-19",
        article: storeEffectsArticle,
        componentName: "EffectsPage",
        component: storeEffectsPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/store/effects/effects.page.ts",
          html: "src/pages/docs/framework/store/effects/effects.page.html",
          css: "src/pages/docs/framework/store/effects/effects.page.css",
        },
        children: [

        ],
      },
      {
        key: "storePageUsage",
        routeKey: "docsStorePageUsage",
        section: docsPageSection.framework,
        path: "/docs/store/page-usage",
        label: "Page usage",
        title: "Store Page Usage",
        summary: "Pages use useStore(store), expose selector reads and action methods from TypeScript, and keep Vanrot HTML quote-free for TS-bound attributes and method calls.",
        status: "production-ready-through-phase-19",
        article: storePageUsageArticle,
        componentName: "PageUsagePage",
        component: storePageUsagePageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/store/page-usage/page-usage.page.ts",
          html: "src/pages/docs/framework/store/page-usage/page-usage.page.html",
          css: "src/pages/docs/framework/store/page-usage/page-usage.page.css",
        },
        children: [

        ],
      },
      {
        key: "storeInspection",
        routeKey: "docsStoreInspection",
        section: docsPageSection.framework,
        path: "/docs/store/inspection",
        label: "Inspection",
        title: "Store Inspection",
        summary: "inspectStore(store) exposes a Vanrot-native event timeline for actions, reducers, state changes, effects, snapshots, and observer failures without RxJS, Redux, or devtools UI coupling.",
        status: "production-ready-through-phase-20",
        article: storeInspectionArticle,
        componentName: "InspectionPage",
        component: storeInspectionPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/store/inspection/inspection.page.ts",
          html: "src/pages/docs/framework/store/inspection/inspection.page.html",
          css: "src/pages/docs/framework/store/inspection/inspection.page.css",
        },
        children: [

        ],
      },
      {
        key: "storeReplay",
        routeKey: "docsStoreReplay",
        section: docsPageSection.framework,
        path: "/docs/store/replay",
        label: "Snapshots and replay",
        title: "Store Snapshots and Replay",
        summary: "Store snapshots and replay let apps capture review checkpoints, replay action history through the store reducer, and inspect each replay step without exposing reducer internals on the public store instance.",
        status: "production-ready-through-phase-20",
        article: storeReplayArticle,
        componentName: "ReplayPage",
        component: storeReplayPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/store/replay/replay.page.ts",
          html: "src/pages/docs/framework/store/replay/replay.page.html",
          css: "src/pages/docs/framework/store/replay/replay.page.css",
        },
        children: [

        ],
      }
    ],
  },
  {
    key: "formatters",
    routeKey: "docsFormatters",
    section: docsPageSection.framework,
    path: "/docs/formatters",
    label: "Formatters",
    title: "Formatters And Template Pipes",
    summary: "Vanrot template pipes are compiler-owned interpolation formatters backed by @vanrot/formatters, .pipe.ts role files, named presets, locale context, terminal diagnostics, and focused pipe tests.",
    status: "production-ready",
    article: formattersArticle,
    componentName: "FormattersPage",
    component: formattersPageComponent,
    sourceFiles: {
      ts: "src/pages/docs/framework/formatters/formatters.page.ts",
      html: "src/pages/docs/framework/formatters/formatters.page.html",
      css: "src/pages/docs/framework/formatters/formatters.page.css",
    },
    children: [
      {
        key: "formattersCompilerOwned",
        routeKey: "docsFormattersCompilerOwned",
        section: docsPageSection.framework,
        path: "/docs/formatters/compiler-owned-formatting",
        label: "Compiler-owned formatting",
        title: "Compiler-Owned Formatting",
        summary: "Template pipes are a compiler feature backed by @vanrot/formatters, not a runtime trick or template-side business-logic escape hatch.",
        status: "production-ready",
        article: formattersCompilerOwnedArticle,
        componentName: "CompilerOwnedFormattingPage",
        component: formattersCompilerOwnedPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/formatters/compiler-owned-formatting/compiler-owned-formatting.page.ts",
          html: "src/pages/docs/framework/formatters/compiler-owned-formatting/compiler-owned-formatting.page.html",
          css: "src/pages/docs/framework/formatters/compiler-owned-formatting/compiler-owned-formatting.page.css",
        },
        children: [

        ],
      },
      {
        key: "formattersTemplatePipes",
        routeKey: "docsFormattersTemplatePipes",
        section: docsPageSection.framework,
        path: "/docs/formatters/template-pipes",
        label: "Template pipes",
        title: "Template Pipes",
        summary: "Pipe syntax uses readable interpolation calls such as {{ createdAt | date.monthDayYear }} and {{ row.description | truncate(20) }}.",
        status: "production-ready",
        article: formattersTemplatePipesArticle,
        componentName: "TemplatePipesPage",
        component: formattersTemplatePipesPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/formatters/template-pipes/template-pipes.page.ts",
          html: "src/pages/docs/framework/formatters/template-pipes/template-pipes.page.html",
          css: "src/pages/docs/framework/formatters/template-pipes/template-pipes.page.css",
        },
        children: [

        ],
      },
      {
        key: "formattersBuiltInSuite",
        routeKey: "docsFormattersBuiltInSuite",
        section: docsPageSection.framework,
        path: "/docs/formatters/built-in-suite",
        label: "Built-in pipe suite",
        title: "Built-In Pipe Suite",
        summary: "@vanrot/formatters ships the common display helpers most screens need before users define custom pipes.",
        status: "production-ready",
        article: formattersBuiltInSuiteArticle,
        componentName: "BuiltInSuitePage",
        component: formattersBuiltInSuitePageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/formatters/built-in-suite/built-in-suite.page.ts",
          html: "src/pages/docs/framework/formatters/built-in-suite/built-in-suite.page.html",
          css: "src/pages/docs/framework/formatters/built-in-suite/built-in-suite.page.css",
        },
        children: [

        ],
      },
      {
        key: "formattersBuiltInArguments",
        routeKey: "docsFormattersBuiltInArguments",
        section: docsPageSection.framework,
        path: "/docs/formatters/built-in-arguments",
        label: "Built-in arguments",
        title: "Built-In Arguments And Variants",
        summary: "Built-in pipes accept readable arguments and named variants for date, number, currency, plural, masks, and message formats.",
        status: "production-ready",
        article: formattersBuiltInArgumentsArticle,
        componentName: "BuiltInArgumentsPage",
        component: formattersBuiltInArgumentsPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/formatters/built-in-arguments/built-in-arguments.page.ts",
          html: "src/pages/docs/framework/formatters/built-in-arguments/built-in-arguments.page.html",
          css: "src/pages/docs/framework/formatters/built-in-arguments/built-in-arguments.page.css",
        },
        children: [

        ],
      },
      {
        key: "formattersPipeRoleFiles",
        routeKey: "docsFormattersPipeRoleFiles",
        section: docsPageSection.framework,
        path: "/docs/formatters/pipe-role-files",
        label: ".pipe.ts role files",
        title: ".pipe.ts Role Files",
        summary: "Custom pipes live in .pipe.ts role files so Vite discovery, compiler validation, diagnostics, and tests can all see them.",
        status: "production-ready",
        article: formattersPipeRoleFilesArticle,
        componentName: "PipeRoleFilesPage",
        component: formattersPipeRoleFilesPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/formatters/pipe-role-files/pipe-role-files.page.ts",
          html: "src/pages/docs/framework/formatters/pipe-role-files/pipe-role-files.page.html",
          css: "src/pages/docs/framework/formatters/pipe-role-files/pipe-role-files.page.css",
        },
        children: [

        ],
      },
      {
        key: "formattersNamedPresets",
        routeKey: "docsFormattersNamedPresets",
        section: docsPageSection.framework,
        path: "/docs/formatters/named-presets",
        label: "Named presets",
        title: "Named Presets",
        summary: "Named presets let teams replace repeated string masks and option objects with readable constants.",
        status: "production-ready",
        article: formattersNamedPresetsArticle,
        componentName: "NamedPresetsPage",
        component: formattersNamedPresetsPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/formatters/named-presets/named-presets.page.ts",
          html: "src/pages/docs/framework/formatters/named-presets/named-presets.page.html",
          css: "src/pages/docs/framework/formatters/named-presets/named-presets.page.css",
        },
        children: [

        ],
      },
      {
        key: "formattersEnumPipes",
        routeKey: "docsFormattersEnumPipes",
        section: docsPageSection.framework,
        path: "/docs/formatters/enum-pipes",
        label: "Enum display pipes",
        title: "Enum And Backend Value Display",
        summary: "Enum-backed custom pipes convert backend codes into user-facing labels without leaking backend strings into templates.",
        status: "production-ready",
        article: formattersEnumPipesArticle,
        componentName: "EnumPipesPage",
        component: formattersEnumPipesPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/formatters/enum-pipes/enum-pipes.page.ts",
          html: "src/pages/docs/framework/formatters/enum-pipes/enum-pipes.page.html",
          css: "src/pages/docs/framework/formatters/enum-pipes/enum-pipes.page.css",
        },
        children: [

        ],
      },
      {
        key: "formattersContext",
        routeKey: "docsFormattersContext",
        section: docsPageSection.framework,
        path: "/docs/formatters/context",
        label: "Formatting context",
        title: "Formatting Context",
        summary: "Pipe context provides locale, time zone, numbering system, currency defaults, message catalog access, and safe app-defined metadata.",
        status: "production-ready",
        article: formattersContextArticle,
        componentName: "ContextPage",
        component: formattersContextPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/formatters/context/context.page.ts",
          html: "src/pages/docs/framework/formatters/context/context.page.html",
          css: "src/pages/docs/framework/formatters/context/context.page.css",
        },
        children: [

        ],
      },
      {
        key: "formattersCompilerDiagnostics",
        routeKey: "docsFormattersCompilerDiagnostics",
        section: docsPageSection.framework,
        path: "/docs/formatters/compiler-diagnostics",
        label: "Compiler diagnostics",
        title: "Compiler Diagnostics",
        summary: "The compiler reports invalid pipe names, arguments, variants, presets, duplicate definitions, and bad async handlers with file and line number.",
        status: "production-ready",
        article: formattersCompilerDiagnosticsArticle,
        componentName: "CompilerDiagnosticsPage",
        component: formattersCompilerDiagnosticsPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/formatters/compiler-diagnostics/compiler-diagnostics.page.ts",
          html: "src/pages/docs/framework/formatters/compiler-diagnostics/compiler-diagnostics.page.html",
          css: "src/pages/docs/framework/formatters/compiler-diagnostics/compiler-diagnostics.page.css",
        },
        children: [

        ],
      },
      {
        key: "formattersViteTooling",
        routeKey: "docsFormattersViteTooling",
        section: docsPageSection.framework,
        path: "/docs/formatters/vite-tooling",
        label: "Vite tooling",
        title: "Vite Discovery And Rebuilds",
        summary: "The Vite plugin discovers .pipe.ts files, rebuilds the formatter registry, reports terminal diagnostics, and invalidates affected templates.",
        status: "production-ready",
        article: formattersViteToolingArticle,
        componentName: "ViteToolingPage",
        component: formattersViteToolingPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/formatters/vite-tooling/vite-tooling.page.ts",
          html: "src/pages/docs/framework/formatters/vite-tooling/vite-tooling.page.html",
          css: "src/pages/docs/framework/formatters/vite-tooling/vite-tooling.page.css",
        },
        children: [

        ],
      },
      {
        key: "formattersTesting",
        routeKey: "docsFormattersTesting",
        section: docsPageSection.framework,
        path: "/docs/formatters/testing",
        label: "Testing",
        title: "Testing Formatter Behavior",
        summary: "Formatter tests cover built-ins, custom pipes, context, diagnostics, generated imports, and compiled template behavior.",
        status: "production-ready",
        article: formattersTestingArticle,
        componentName: "TestingPage",
        component: formattersTestingPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/formatters/testing/testing.page.ts",
          html: "src/pages/docs/framework/formatters/testing/testing.page.html",
          css: "src/pages/docs/framework/formatters/testing/testing.page.css",
        },
        children: [

        ],
      }
    ],
  },
  {
    key: "devtools",
    routeKey: "docsDevtools",
    section: docsPageSection.framework,
    path: "/docs/devtools",
    label: "Devtools",
    title: "Devtools And Project Intelligence",
    summary: "@vanrot/devtools reads project map manifests, runtime graph metadata, Vite plugin metadata, panel state, stale-state diagnostics, and AI-adjacent project intelligence without becoming the source of truth.",
    status: "production-ready-through-phase-23",
    article: devtoolsArticle,
    componentName: "DevtoolsPage",
    component: devtoolsPageComponent,
    sourceFiles: {
      ts: "src/pages/docs/framework/devtools/devtools.page.ts",
      html: "src/pages/docs/framework/devtools/devtools.page.html",
      css: "src/pages/docs/framework/devtools/devtools.page.css",
    },
    children: [
      {
        key: "devtoolsProjectMap",
        routeKey: "docsDevtoolsProjectMap",
        section: docsPageSection.framework,
        path: "/docs/devtools/project-map",
        label: "Project Map",
        title: "Devtools Project Map",
        summary: "The project map manifest describes Vanrot role files, graph nodes, graph edges, routes, compiler metadata, AI metadata, and stale state.",
        status: "production-ready-through-phase-23",
        article: devtoolsProjectMapArticle,
        componentName: "ProjectMapPage",
        component: devtoolsProjectMapPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/devtools/project-map/project-map.page.ts",
          html: "src/pages/docs/framework/devtools/project-map/project-map.page.html",
          css: "src/pages/docs/framework/devtools/project-map/project-map.page.css",
        },
        children: [

        ],
      },
      {
        key: "devtoolsRuntimeGraph",
        routeKey: "docsDevtoolsRuntimeGraph",
        section: docsPageSection.framework,
        path: "/docs/devtools/runtime-graph",
        label: "Runtime Graph",
        title: "Devtools Runtime Graph",
        summary: "The runtime graph describes components, signals, computed values, effects, and dependency edges for development inspection.",
        status: "production-ready-through-phase-23",
        article: devtoolsRuntimeGraphArticle,
        componentName: "RuntimeGraphPage",
        component: devtoolsRuntimeGraphPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/devtools/runtime-graph/runtime-graph.page.ts",
          html: "src/pages/docs/framework/devtools/runtime-graph/runtime-graph.page.html",
          css: "src/pages/docs/framework/devtools/runtime-graph/runtime-graph.page.css",
        },
        children: [

        ],
      },
      {
        key: "devtoolsViteMetadata",
        routeKey: "docsDevtoolsViteMetadata",
        section: docsPageSection.framework,
        path: "/docs/devtools/vite-metadata",
        label: "Vite Metadata",
        title: "Devtools Vite Metadata",
        summary: "Vite metadata connects the dev server, plugin diagnostics, role-file transforms, and devtools inspection.",
        status: "production-ready-through-phase-23",
        article: devtoolsViteMetadataArticle,
        componentName: "ViteMetadataPage",
        component: devtoolsViteMetadataPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/devtools/vite-metadata/vite-metadata.page.ts",
          html: "src/pages/docs/framework/devtools/vite-metadata/vite-metadata.page.html",
          css: "src/pages/docs/framework/devtools/vite-metadata/vite-metadata.page.css",
        },
        children: [

        ],
      },
      {
        key: "devtoolsPanelState",
        routeKey: "docsDevtoolsPanelState",
        section: docsPageSection.framework,
        path: "/docs/devtools/panel-state",
        label: "Panel State",
        title: "Devtools Panel State",
        summary: "Panel state normalizes graph manifests into renderable devtools state without changing the underlying manifest contract.",
        status: "production-ready-through-phase-23",
        article: devtoolsPanelStateArticle,
        componentName: "PanelStatePage",
        component: devtoolsPanelStatePageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/devtools/panel-state/panel-state.page.ts",
          html: "src/pages/docs/framework/devtools/panel-state/panel-state.page.html",
          css: "src/pages/docs/framework/devtools/panel-state/panel-state.page.css",
        },
        children: [

        ],
      },
      {
        key: "devtoolsStaleState",
        routeKey: "docsDevtoolsStaleState",
        section: docsPageSection.framework,
        path: "/docs/devtools/stale-state",
        label: "Stale State",
        title: "Devtools Stale State",
        summary: "Stale-state diagnostics explain when project intelligence needs to be regenerated before devtools or AI consumers can trust it.",
        status: "production-ready-through-phase-23",
        article: devtoolsStaleStateArticle,
        componentName: "StaleStatePage",
        component: devtoolsStaleStatePageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/devtools/stale-state/stale-state.page.ts",
          html: "src/pages/docs/framework/devtools/stale-state/stale-state.page.html",
          css: "src/pages/docs/framework/devtools/stale-state/stale-state.page.css",
        },
        children: [

        ],
      }
    ],
  },
  {
    key: "examples",
    routeKey: "docsExamples",
    section: docsPageSection.examples,
    path: "/docs/examples",
    label: "Examples",
    title: "Examples",
    summary: "Examples show practical Vanrot usage without hiding the source files.",
    status: "demo-capable",
    article: examplesArticle,
    componentName: "ExamplesPage",
    component: examplesPageComponent,
    sourceFiles: {
      ts: "src/pages/docs/examples/examples/examples.page.ts",
      html: "src/pages/docs/examples/examples/examples.page.html",
      css: "src/pages/docs/examples/examples/examples.page.css",
    },
    children: [
      {
        key: "webglThreejs",
        routeKey: "docsWebglThreejs",
        section: docsPageSection.examples,
        path: "/docs/examples/webgl-threejs",
        label: "WebGL And three.js",
        title: "WebGL And three.js Lifecycle",
        summary: "Use Vanrot lifecycle hooks and signals around an app-owned WebGL or three.js scene without adding three.js to the core runtime.",
        status: "demo-capable",
        article: webglThreejsArticle,
        componentName: "WebglThreejsPage",
        component: webglThreejsPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/examples/examples/webgl-threejs/webgl-threejs.page.ts",
          html: "src/pages/docs/examples/examples/webgl-threejs/webgl-threejs.page.html",
          css: "src/pages/docs/examples/examples/webgl-threejs/webgl-threejs.page.css",
        },
        children: [

        ],
      },
      {
        key: "octoberShowcase",
        routeKey: "docsOctoberShowcase",
        section: docsPageSection.examples,
        path: "/docs/examples/october-showcase",
        label: "October Showcase",
        title: "October Showcase",
        summary: "A broad Phase 16G composition surface for admin, dashboard, and mobile patterns.",
        status: "demo-capable",
        article: octoberShowcaseArticle,
        componentName: "OctoberShowcasePage",
        component: octoberShowcasePageComponent,
        sourceFiles: {
          ts: "src/pages/docs/examples/examples/october-showcase/october-showcase.page.ts",
          html: "src/pages/docs/examples/examples/october-showcase/october-showcase.page.html",
          css: "src/pages/docs/examples/examples/october-showcase/october-showcase.page.css",
        },
        children: [

        ],
      }
    ],
  },
  {
    key: "exampleMatrix",
    routeKey: "docsExampleMatrix",
    section: docsPageSection.examples,
    path: "/docs/example-matrix",
    label: "Example Matrix",
    title: "Runnable Example Matrix",
    summary: "Use verified example workspaces as the source of truth for framework workflows and docs snippets.",
    status: "phase-24-active",
    article: exampleMatrixArticle,
    componentName: "ExampleMatrixPage",
    component: exampleMatrixPageComponent,
    sourceFiles: {
      ts: "src/pages/docs/examples/example-matrix/example-matrix.page.ts",
      html: "src/pages/docs/examples/example-matrix/example-matrix.page.html",
      css: "src/pages/docs/examples/example-matrix/example-matrix.page.css",
    },
    children: [

    ],
  },
  {
    key: "deployment",
    routeKey: "docsDeployment",
    section: docsPageSection.reference,
    path: "/docs/deployment",
    label: "Deployment",
    title: "Build And Deployment Preparation",
    summary: "Prepare a Vanrot site for production hosting without pretending this repository controls DNS, credentials, analytics, or live deployment.",
    status: "phase-24-active",
    article: deploymentArticle,
    componentName: "DeploymentPage",
    component: deploymentPageComponent,
    sourceFiles: {
      ts: "src/pages/docs/reference/deployment/deployment.page.ts",
      html: "src/pages/docs/reference/deployment/deployment.page.html",
      css: "src/pages/docs/reference/deployment/deployment.page.css",
    },
    children: [

    ],
  },
  {
    key: "publicApi",
    routeKey: "docsPublicApi",
    section: docsPageSection.reference,
    path: "/docs/public-api",
    label: "Public API",
    title: "Public API Reference",
    summary: "Read the documented public exports for each current Vanrot package and see which guide owns the behavior.",
    status: "phase-24-active",
    article: publicApiArticle,
    componentName: "PublicApiPage",
    component: publicApiPageComponent,
    sourceFiles: {
      ts: "src/pages/docs/reference/public-api/public-api.page.ts",
      html: "src/pages/docs/reference/public-api/public-api.page.html",
      css: "src/pages/docs/reference/public-api/public-api.page.css",
    },
    children: [

    ],
  },
  {
    key: "diagnostics",
    routeKey: "docsDiagnostics",
    section: docsPageSection.reference,
    path: "/docs/diagnostics",
    label: "Diagnostics",
    title: "Diagnostics Reference",
    summary: "Find the current compiler, config, router, CLI, and Vite-plugin diagnostic codes with user-facing explanations.",
    status: "phase-24-active",
    article: diagnosticsArticle,
    componentName: "DiagnosticsPage",
    component: diagnosticsPageComponent,
    sourceFiles: {
      ts: "src/pages/docs/reference/diagnostics/diagnostics.page.ts",
      html: "src/pages/docs/reference/diagnostics/diagnostics.page.html",
      css: "src/pages/docs/reference/diagnostics/diagnostics.page.css",
    },
    children: [

    ],
  },
  {
    key: "generatedFiles",
    routeKey: "docsGeneratedFiles",
    section: docsPageSection.reference,
    path: "/docs/generated-files",
    label: "Generated Files",
    title: "Generated Files And Directories",
    summary: "Understand generated files Vanrot users should expect in starter apps, config flows, route workflows, and project intelligence output.",
    status: "phase-24-active",
    article: generatedFilesArticle,
    componentName: "GeneratedFilesPage",
    component: generatedFilesPageComponent,
    sourceFiles: {
      ts: "src/pages/docs/reference/generated-files/generated-files.page.ts",
      html: "src/pages/docs/reference/generated-files/generated-files.page.html",
      css: "src/pages/docs/reference/generated-files/generated-files.page.css",
    },
    children: [

    ],
  },
  {
    key: "changelog",
    routeKey: "docsChangelog",
    section: docsPageSection.reference,
    path: "/docs/changelog",
    label: "Changelog",
    title: "Changelog",
    summary: "Track published Vanrot versions, release notes, and upgrade guidance from the first npm release onward.",
    status: "available-now",
    article: changelogArticle,
    componentName: "ChangelogPage",
    component: changelogPageComponent,
    sourceFiles: {
      ts: "src/pages/docs/changelog/changelog.page.ts",
      html: "src/pages/docs/changelog/changelog.page.html",
      css: "src/pages/docs/changelog/changelog.page.css",
    },
    children: [

    ],
  },
  {
    key: "conventions",
    routeKey: "docsConventions",
    section: docsPageSection.framework,
    path: "/docs/conventions",
    label: "Conventions",
    title: "Conventions",
    summary: "Vanrot conventions keep role files, templates, styles, state, routing, generated strings, and AI-readable project structure consistent across the framework.",
    status: "available-now",
    article: conventionsArticle,
    componentName: "ConventionsPage",
    component: conventionsPageComponent,
    sourceFiles: {
      ts: "src/pages/docs/framework/conventions/conventions.page.ts",
      html: "src/pages/docs/framework/conventions/conventions.page.html",
      css: "src/pages/docs/framework/conventions/conventions.page.css",
    },
    children: [
      {
        key: "conventionsRoleFiles",
        routeKey: "docsConventionsRoleFiles",
        section: docsPageSection.framework,
        path: "/docs/conventions/role-files",
        label: "Role Files",
        title: "Conventions Role Files",
        summary: "Role file conventions make Vanrot source files discoverable by humans, compiler transforms, CLI generators, Vite plugin matching, devtools, and AI tools.",
        status: "available-now",
        article: conventionsRoleFilesArticle,
        componentName: "RoleFilesPage",
        component: conventionsRoleFilesPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/conventions/role-files/role-files.page.ts",
          html: "src/pages/docs/framework/conventions/role-files/role-files.page.html",
          css: "src/pages/docs/framework/conventions/role-files/role-files.page.css",
        },
        children: [

        ],
      },
      {
        key: "conventionsTemplatesStyles",
        routeKey: "docsConventionsTemplatesStyles",
        section: docsPageSection.framework,
        path: "/docs/conventions/templates-and-styles",
        label: "Templates and Styles",
        title: "Conventions Templates and Styles",
        summary: "Template and style conventions keep markup, behavior, and presentation split across HTML, TypeScript, and scoped CSS.",
        status: "available-now",
        article: conventionsTemplatesStylesArticle,
        componentName: "TemplatesAndStylesPage",
        component: conventionsTemplatesStylesPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/conventions/templates-and-styles/templates-and-styles.page.ts",
          html: "src/pages/docs/framework/conventions/templates-and-styles/templates-and-styles.page.html",
          css: "src/pages/docs/framework/conventions/templates-and-styles/templates-and-styles.page.css",
        },
        children: [

        ],
      },
      {
        key: "conventionsStateLogic",
        routeKey: "docsConventionsStateLogic",
        section: docsPageSection.framework,
        path: "/docs/conventions/state-and-logic",
        label: "State and Logic",
        title: "Conventions State and Logic",
        summary: "State and logic conventions keep Vanrot components signal-driven, readable, testable, and free of template-side business rules.",
        status: "available-now",
        article: conventionsStateLogicArticle,
        componentName: "StateAndLogicPage",
        component: conventionsStateLogicPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/conventions/state-and-logic/state-and-logic.page.ts",
          html: "src/pages/docs/framework/conventions/state-and-logic/state-and-logic.page.html",
          css: "src/pages/docs/framework/conventions/state-and-logic/state-and-logic.page.css",
        },
        children: [

        ],
      },
      {
        key: "conventionsRoutingStrings",
        routeKey: "docsConventionsRoutingStrings",
        section: docsPageSection.framework,
        path: "/docs/conventions/routing-and-strings",
        label: "Routing and Strings",
        title: "Conventions Routing and Strings",
        summary: "Routing and string conventions prevent docs, routes, diagnostics, command names, labels, generated copy, and file suffixes from drifting.",
        status: "available-now",
        article: conventionsRoutingStringsArticle,
        componentName: "RoutingAndStringsPage",
        component: conventionsRoutingStringsPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/conventions/routing-and-strings/routing-and-strings.page.ts",
          html: "src/pages/docs/framework/conventions/routing-and-strings/routing-and-strings.page.html",
          css: "src/pages/docs/framework/conventions/routing-and-strings/routing-and-strings.page.css",
        },
        children: [

        ],
      },
      {
        key: "conventionsScopedCss",
        routeKey: "docsConventionsScopedCss",
        section: docsPageSection.framework,
        path: "/docs/conventions/scoped-css",
        label: "Scoped CSS",
        title: "Conventions Scoped CSS",
        summary: "Scoped CSS conventions keep role-file styling local, predictable, and portable across generated components and docs examples.",
        status: "available-now",
        article: conventionsScopedCssArticle,
        componentName: "ScopedCssPage",
        component: conventionsScopedCssPageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/conventions/scoped-css/scoped-css.page.ts",
          html: "src/pages/docs/framework/conventions/scoped-css/scoped-css.page.html",
          css: "src/pages/docs/framework/conventions/scoped-css/scoped-css.page.css",
        },
        children: [

        ],
      },
      {
        key: "conventionsAiReadable",
        routeKey: "docsConventionsAiReadable",
        section: docsPageSection.framework,
        path: "/docs/conventions/ai-readable-projects",
        label: "AI-readable Projects",
        title: "Conventions AI-readable Projects",
        summary: "AI-readable project conventions help maps, docs bundles, devtools, and external AI consumers recover accurate framework context.",
        status: "available-now",
        article: conventionsAiReadableArticle,
        componentName: "AiReadableProjectsPage",
        component: conventionsAiReadablePageComponent,
        sourceFiles: {
          ts: "src/pages/docs/framework/conventions/ai-readable-projects/ai-readable-projects.page.ts",
          html: "src/pages/docs/framework/conventions/ai-readable-projects/ai-readable-projects.page.html",
          css: "src/pages/docs/framework/conventions/ai-readable-projects/ai-readable-projects.page.css",
        },
        children: [

        ],
      }
    ],
  },
  {
    key: "limitations",
    routeKey: "docsLimitations",
    section: docsPageSection.reference,
    path: "/docs/limitations",
    label: "Limitations",
    title: "Limitations And Deferred Work",
    summary: "Read honest status notes for demo-capable, limited, deferred, and not-browser-facing areas before using Vanrot in production contexts.",
    status: "phase-24-active",
    article: limitationsArticle,
    componentName: "LimitationsPage",
    component: limitationsPageComponent,
    sourceFiles: {
      ts: "src/pages/docs/reference/limitations/limitations.page.ts",
      html: "src/pages/docs/reference/limitations/limitations.page.html",
      css: "src/pages/docs/reference/limitations/limitations.page.css",
    },
    children: [

    ],
  },
  {
    key: "referenceStatus",
    routeKey: "docsReferenceStatus",
    section: docsPageSection.reference,
    path: "/docs/status",
    label: "Status",
    title: "Reference Status",
    summary: "The reference section shows what is available now, demo-capable, in progress, planned, or deferred.",
    status: "available-now",
    article: referenceStatusArticle,
    componentName: "StatusPage",
    component: referenceStatusPageComponent,
    sourceFiles: {
      ts: "src/pages/docs/reference/status/status.page.ts",
      html: "src/pages/docs/reference/status/status.page.html",
      css: "src/pages/docs/reference/status/status.page.css",
    },
    children: [

    ],
  }
] as const satisfies readonly DocsPageTreeItem[];

export function flattenDocsPageTree(items: readonly DocsPageTreeItem[] = docsPageTree): readonly DocsPageTreeItem[] {
  return items.flatMap((item) => [item, ...flattenDocsPageTree(item.children)]);
}

export const docsPageArticles = Object.fromEntries(
  flattenDocsPageTree().map((page) => [page.key, page.article]),
) as Record<string, DocsPageArticle>;

export const docsPageArticleKeys = flattenDocsPageTree().map((page) => page.key);
