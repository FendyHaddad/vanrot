import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { route } from '../src/routes.ts';

const appRoot = process.cwd();
const projectRoot = join(appRoot, '../..');

const phase16ComponentDocPages = [
  {
    routeKey: 'componentBadges',
    path: '/docs/components/badges',
    fileBase: 'component-badge',
    primitive: 'badge',
    title: 'Badge',
    tagName: 'vr-badge',
    tokenGroup: 'tone',
    variants: ['default', 'secondary', 'success', 'warning', 'danger', 'outline'],
  },
  {
    routeKey: 'componentAvatars',
    path: '/docs/components/avatars',
    fileBase: 'component-avatar',
    primitive: 'avatar',
    title: 'Avatar',
    tagName: 'vr-avatar',
    tokenGroup: 'variant',
    variants: ['default', 'soft', 'outline'],
  },
  {
    routeKey: 'componentAlerts',
    path: '/docs/components/alerts',
    fileBase: 'component-alert',
    primitive: 'alert',
    title: 'Alert',
    tagName: 'vr-alert',
    tokenGroup: 'tone',
    variants: ['info', 'success', 'warning', 'danger'],
  },
  {
    routeKey: 'componentLoaders',
    path: '/docs/components/loaders',
    fileBase: 'component-loader',
    primitive: 'loader',
    title: 'Loader',
    tagName: 'vr-loader',
    tokenGroup: 'variant',
    variants: ['spinner', 'dots', 'bar'],
  },
  {
    routeKey: 'componentSkeletons',
    path: '/docs/components/skeletons',
    fileBase: 'component-skeleton',
    primitive: 'skeleton',
    title: 'Skeleton',
    tagName: 'vr-skeleton',
    tokenGroup: 'variant',
    variants: ['text', 'avatar', 'card', 'block'],
  },
  {
    routeKey: 'componentSeparators',
    path: '/docs/components/separators',
    fileBase: 'component-separator',
    primitive: 'separator',
    title: 'Separator',
    tagName: 'vr-separator',
    tokenGroup: 'orientation',
    variants: ['horizontal', 'vertical'],
  },
] as const;

const phase16LayoutNavigationMediaDocPages = [
  {
    routeKey: 'componentBreadcrumbs',
    path: '/docs/components/breadcrumbs',
    fileBase: 'component-breadcrumb',
    title: 'Breadcrumb',
    tokenSnippet: 'aria-label',
  },
  {
    routeKey: 'componentContainers',
    path: '/docs/components/containers',
    fileBase: 'component-container',
    title: 'Container',
    tokenSnippet: 'size.lg',
  },
  {
    routeKey: 'componentFooters',
    path: '/docs/components/footers',
    fileBase: 'component-footer',
    title: 'Footer',
    tokenSnippet: 'vr-footer',
  },
  {
    routeKey: 'componentGrids',
    path: '/docs/components/grids',
    fileBase: 'component-grid',
    title: 'Grid',
    tokenSnippet: 'cols.3 gap.4',
  },
  {
    routeKey: 'componentHeaders',
    path: '/docs/components/headers',
    fileBase: 'component-header',
    title: 'Header',
    tokenSnippet: 'vr-header',
  },
  {
    routeKey: 'componentImages',
    path: '/docs/components/images',
    fileBase: 'component-img',
    title: 'Image',
    tokenSnippet: 'src alt',
  },
  {
    routeKey: 'componentLayouts',
    path: '/docs/components/layouts',
    fileBase: 'component-layout',
    title: 'Layout',
    tokenSnippet: 'vr-layout',
  },
  {
    routeKey: 'componentNavigation',
    path: '/docs/components/navigation',
    fileBase: 'component-nav',
    title: 'Navigation',
    tokenSnippet: 'aria-label',
  },
  {
    routeKey: 'componentSections',
    path: '/docs/components/sections',
    fileBase: 'component-section',
    title: 'Section',
    tokenSnippet: 'spacing.md',
  },
  {
    routeKey: 'componentSidebars',
    path: '/docs/components/sidebars',
    fileBase: 'component-sidebar',
    title: 'Sidebar',
    tokenSnippet: 'placement.left',
  },
  {
    routeKey: 'componentSources',
    path: '/docs/components/sources',
    fileBase: 'component-src',
    title: 'Source',
    tokenSnippet: 'srcset type',
  },
] as const;

const phase16FormsDataDocPages = [
  { routeKey: 'componentCheckboxes', path: '/docs/components/checkboxes', fileBase: 'component-checkbox', title: 'Checkbox', tokenSnippet: 'vr-checkbox' },
  { routeKey: 'componentEmptyStates', path: '/docs/components/empty-states', fileBase: 'component-empty-state', title: 'Empty State', tokenSnippet: 'tone.muted' },
  { routeKey: 'componentForms', path: '/docs/components/forms', fileBase: 'component-form', title: 'Form', tokenSnippet: 'vr-form' },
  { routeKey: 'componentFormFields', path: '/docs/components/form-fields', fileBase: 'component-form-field', title: 'Form Field', tokenSnippet: 'required' },
  { routeKey: 'componentInputs', path: '/docs/components/inputs', fileBase: 'component-input', title: 'Input', tokenSnippet: 'type.email' },
  { routeKey: 'componentLabels', path: '/docs/components/labels', fileBase: 'component-label', title: 'Label', tokenSnippet: 'vr-label' },
  { routeKey: 'componentLists', path: '/docs/components/lists', fileBase: 'component-list', title: 'List', tokenSnippet: 'marker.check' },
  { routeKey: 'componentListItems', path: '/docs/components/list-items', fileBase: 'component-list-item', title: 'List Item', tokenSnippet: 'vr-list-item' },
  { routeKey: 'componentPagination', path: '/docs/components/pagination', fileBase: 'component-pagination', title: 'Pagination', tokenSnippet: 'variant.numbers' },
  { routeKey: 'componentRadioGroups', path: '/docs/components/radio-groups', fileBase: 'component-radio-group', title: 'Radio Group', tokenSnippet: 'vr-radio-group' },
  { routeKey: 'componentRadios', path: '/docs/components/radios', fileBase: 'component-radio', title: 'Radio', tokenSnippet: 'vr-radio' },
  { routeKey: 'componentSelects', path: '/docs/components/selects', fileBase: 'component-select', title: 'Select', tokenSnippet: 'vr-select' },
  { routeKey: 'componentSliders', path: '/docs/components/sliders', fileBase: 'component-slider', title: 'Slider', tokenSnippet: 'vr-slider' },
  { routeKey: 'componentStats', path: '/docs/components/stats', fileBase: 'component-stat', title: 'Stat', tokenSnippet: 'align.left' },
  { routeKey: 'componentSwitches', path: '/docs/components/switches', fileBase: 'component-switch', title: 'Switch', tokenSnippet: 'vr-switch' },
  { routeKey: 'componentTables', path: '/docs/components/tables', fileBase: 'component-table', title: 'Table', tokenSnippet: 'density.compact' },
  { routeKey: 'componentTableBodies', path: '/docs/components/table-bodies', fileBase: 'component-table-body', title: 'Table Body', tokenSnippet: 'vr-table-body' },
  { routeKey: 'componentTableCaptions', path: '/docs/components/table-captions', fileBase: 'component-table-caption', title: 'Table Caption', tokenSnippet: 'vr-table-caption' },
  { routeKey: 'componentTableCells', path: '/docs/components/table-cells', fileBase: 'component-table-cell', title: 'Table Cell', tokenSnippet: 'vr-table-cell' },
  { routeKey: 'componentTableFooters', path: '/docs/components/table-footers', fileBase: 'component-table-footer', title: 'Table Footer', tokenSnippet: 'vr-table-footer' },
  { routeKey: 'componentTableHeads', path: '/docs/components/table-heads', fileBase: 'component-table-head', title: 'Table Head', tokenSnippet: 'vr-table-head' },
  { routeKey: 'componentTableHeaders', path: '/docs/components/table-headers', fileBase: 'component-table-header', title: 'Table Header', tokenSnippet: 'vr-table-header' },
  { routeKey: 'componentTableRows', path: '/docs/components/table-rows', fileBase: 'component-table-row', title: 'Table Row', tokenSnippet: 'vr-table-row' },
  { routeKey: 'componentTextareas', path: '/docs/components/textareas', fileBase: 'component-textarea', title: 'Textarea', tokenSnippet: 'vr-textarea' },
] as const;

const phase16InteractionDocPages = [
  { routeKey: 'componentDialogs', path: '/docs/components/dialogs', fileBase: 'component-dialog', primitive: 'dialog', title: 'Dialog', tokenSnippet: 'size.md' },
  { routeKey: 'componentDrawers', path: '/docs/components/drawers', fileBase: 'component-drawer', primitive: 'drawer', title: 'Drawer', tokenSnippet: 'side.right' },
  { routeKey: 'componentDropdowns', path: '/docs/components/dropdowns', fileBase: 'component-dropdown', primitive: 'dropdown', title: 'Dropdown', tokenSnippet: 'align.start' },
  { routeKey: 'componentTabs', path: '/docs/components/tabs', fileBase: 'component-tabs', primitive: 'tabs', title: 'Tabs', tokenSnippet: 'variant.line' },
  { routeKey: 'componentToasts', path: '/docs/components/toasts', fileBase: 'component-toast', primitive: 'toast', title: 'Toast', tokenSnippet: 'tone.success' },
] as const;

const phase16FinalDocPages = [
  { routeKey: 'componentPopovers', path: '/docs/components/popovers', fileBase: 'component-popover', primitive: 'popover', title: 'Popover', tokenSnippet: 'side.bottom' },
  { routeKey: 'componentTooltips', path: '/docs/components/tooltips', fileBase: 'component-tooltip', primitive: 'tooltip', title: 'Tooltip', tokenSnippet: 'delay.normal' },
  { routeKey: 'componentCommandMenu', path: '/docs/components/command-menu', fileBase: 'component-command-menu', primitive: 'commandMenu', title: 'Command Menu', tokenSnippet: 'density.compact' },
] as const;

async function readSiteFile(path: string): Promise<string> {
  return readFile(join(appRoot, path), 'utf8');
}

async function readProjectFile(path: string): Promise<string> {
  return readFile(join(projectRoot, path), 'utf8');
}

const phase16CoreComponentFiles = [
  'component-button',
  'component-card',
  ...phase16ComponentDocPages.map((page) => page.fileBase),
  ...phase16LayoutNavigationMediaDocPages.map((page) => page.fileBase),
] as const;

describe('vanrot site pages', () => {
  it('mounts the app through Vanrot runtime and router', async () => {
    const main = await readSiteFile('src/main.ts');

    expect(main).toContain("import { mount } from '@vanrot/runtime';");
    expect(main).toContain("import { provideRouter } from '@vanrot/router';");
    expect(main).toContain("import './styles/site.css';");
    expect(main).toContain('provideRouter(siteRoute);');
  });

  it('uses a single root vr-router in the app layout', async () => {
    const appLayout = await readSiteFile('src/app/app.layout.html');

    expect(appLayout).toContain('<vr-layout class="site-shell">');
    expect(appLayout).toContain('<vr-header class="site-header">');
    expect(appLayout).toContain('<vr-nav class="site-top-nav" aria-label="Primary">');
    expect(appLayout).toContain('<vr route.docs />');
    expect(appLayout).toContain('<vr route.components></vr>');
    expect(appLayout).toContain('<vr route.changelog></vr>');
    expect(appLayout).not.toContain('route.reference');
    expect(appLayout.match(/<vr-router><\/vr-router>/g)).toHaveLength(1);
    expect(appLayout).not.toContain('<vr-outlet>');
  });

  it('labels the public top navigation as Framework, UI, and Changelog', () => {
    expect(route.docs.label).toBe('Framework');
    expect(route.components.label).toBe('UI');
    expect(route.changelog).toMatchObject({
      fullPath: '/changelog',
      label: 'Changelog',
      kind: 'page',
    });
  });

  it('uses a route outlet only in docs layout', async () => {
    const docsLayout = await readSiteFile('src/layouts/docs/docs.layout.html');

    expect(docsLayout).toContain('<vr-layout class="docs-layout">');
    expect(docsLayout).toContain('<vr-sidebar class="docs-sidebar" placement.left aria-label="Documentation">');
    expect(docsLayout).toContain('<vr-nav class="docs-nav" aria-label="Documentation">');
    expect(docsLayout.match(/<vr-outlet><\/vr-outlet>/g)).toHaveLength(1);
    expect(docsLayout).not.toContain('<vr-router>');
  });

  it('routes framework reference and example matrix pages', async () => {
    expect(route.docsPublicApi.path).toBe('public-api');
    expect(route.docsDiagnostics.path).toBe('diagnostics');
    expect(route.docsGeneratedFiles.path).toBe('generated-files');
    expect(route.docsExampleMatrix.path).toBe('example-matrix');

    const referenceHtml = await readSiteFile('src/pages/docs/docs-reference.page.html');
    const exampleMatrixHtml = await readSiteFile('src/pages/docs/docs-example-matrix.page.html');

    expect(referenceHtml).toContain('<vr-badge');
    expect(referenceHtml).toContain('<vr-card');
    expect(referenceHtml).toContain('publicExportReference');
    expect(exampleMatrixHtml).toContain('<vr-badge');
    expect(exampleMatrixHtml).toContain('exampleReference');
  });

  it('routes Vite plugin parent and child docs pages', () => {
    expect(route.docsVitePlugin.path).toBe('vite-plugin');
    expect(route.docsVitePluginSetup.path).toBe('vite-plugin/setup');
    expect(route.docsVitePluginOptions.path).toBe('vite-plugin/options');
    expect(route.docsVitePluginTransform.path).toBe('vite-plugin/role-file-transform');
    expect(route.docsVitePluginHotReload.path).toBe('vite-plugin/hot-reload');
    expect(route.docsVitePluginVirtualModules.path).toBe('vite-plugin/virtual-modules');
    expect(route.docsVitePluginDiagnostics.path).toBe('vite-plugin/diagnostics');
    expect(route.docsVitePluginSourceMaps.path).toBe('vite-plugin/source-maps');
    expect(route.docsVitePluginDevtoolsMetadata.path).toBe('vite-plugin/devtools-metadata');
  });

  it('routes framework parent and child docs pages', () => {
    expect(route.docsCli.path).toBe('cli');
    expect(route.docsCliCommandSurface.path).toBe('cli/commands');
    expect(route.docsCliProjectCreation.path).toBe('cli/project-creation');
    expect(route.docsCliRoleGeneration.path).toBe('cli/role-generation');
    expect(route.docsCliUiPrimitiveAdd.path).toBe('cli/ui-primitives');
    expect(route.docsCliConfigMaintenance.path).toBe('cli/config-maintenance');
    expect(route.docsCliProjectIntelligence.path).toBe('cli/project-intelligence');
    expect(route.docsCliTaskRunners.path).toBe('cli/task-runners');
    expect(route.docsCliDevServer.path).toBe('cli/dev');
    expect(route.docsCliBuild.path).toBe('cli/build');
    expect(route.docsCliTest.path).toBe('cli/test');
    expect(route.docsBehavior.path).toBe('behavior');
    expect(route.docsConfiguration.path).toBe('configuration');
    expect(route.docsConfigurationFile.path).toBe('configuration/file');
    expect(route.docsConfigurationDefaults.path).toBe('configuration/defaults');
    expect(route.docsConfigurationUi.path).toBe('configuration/ui');
    expect(route.docsConfigurationRouter.path).toBe('configuration/router');
    expect(route.docsConfigurationAi.path).toBe('configuration/ai');
    expect(route.docsConfigurationMaintenance.path).toBe('configuration/maintenance');
    expect(route.docsRouting.path).toBe('routing');
    expect(route.docsRoutingRouteTable.path).toBe('routing/route-table');
    expect(route.docsRoutingParamsQuery.path).toBe('routing/params-query');
    expect(route.docsRoutingLayoutsRedirects.path).toBe('routing/layouts-redirects');
    expect(route.docsRoutingGuards.path).toBe('routing/guards');
    expect(route.docsRoutingNavigation.path).toBe('routing/navigation');
    expect(route.docsRoutingPreloadingKeepAlive.path).toBe('routing/preloading-keep-alive');
    expect(route.docsTesting.path).toBe('testing');
    expect(route.docsTestingComponent.path).toBe('testing/component-tests');
    expect(route.docsTestingScreen.path).toBe('testing/screen');
    expect(route.docsTestingRouting.path).toBe('testing/routing');
    expect(route.docsTestingStrategy.path).toBe('testing/strategy');
    expect(route.docsDevtools.path).toBe('devtools');
    expect(route.docsDevtoolsProjectMap.path).toBe('devtools/project-map');
    expect(route.docsDevtoolsRuntimeGraph.path).toBe('devtools/runtime-graph');
    expect(route.docsDevtoolsViteMetadata.path).toBe('devtools/vite-metadata');
    expect(route.docsDevtoolsPanelState.path).toBe('devtools/panel-state');
    expect(route.docsDevtoolsStaleState.path).toBe('devtools/stale-state');
    expect(route.docsConventions.path).toBe('conventions');
    expect(route.docsConventionsRoleFiles.path).toBe('conventions/role-files');
    expect(route.docsConventionsTemplatesStyles.path).toBe('conventions/templates-and-styles');
    expect(route.docsConventionsStateLogic.path).toBe('conventions/state-and-logic');
    expect(route.docsConventionsRoutingStrings.path).toBe('conventions/routing-and-strings');
    expect(route.docsConventionsScopedCss.path).toBe('conventions/scoped-css');
    expect(route.docsConventionsAiReadable.path).toBe('conventions/ai-readable-projects');
  });

  it('renders framework guide sections with Vanrot-native surfaces', async () => {
    const html = await readSiteFile('src/pages/docs/docs-article.page.html');
    const css = await readSiteFile('src/pages/docs/docs-article.page.css');
    const source = await readSiteFile('src/pages/docs/docs-article.page.ts');
    const interactions = await readSiteFile('src/layouts/docs/docs-shell-interactions.widget.ts');

    expect(html).toContain('docs-article-layout');
    expect(html).toContain('docs-article-bookmarks');
    expect(html).toContain('section.code.lines');
    expect(html).toContain('line.tokens');
    expect(html).toContain('token.kind');
    expect(html).toContain('code-line-number');
    expect(html).toContain('class="token keyword"');
    expect(html).toContain('class="token function"');
    expect(html).toContain('class="token string"');
    expect(html).toContain('data-vr-docs-article-bookmark');
    expect(html).not.toContain('copy-icon-button');
    expect(html).not.toContain('<vr-badge');
    expect(html).not.toContain('<vr-card');
    expect(html).toContain('<vr-separator');
    expect(html).not.toContain('article().sections');
    expect(html).not.toContain('docs-on-this-page');
    expect(html).not.toContain('[hidden]="section.code.code === \'\'"');
    expect(html).toContain('[hidden]="section.code.isEmpty"');
    expect(html).toContain('section.points');
    expect(html).toContain('section.code');
    expect(html).toContain('docs-note');
    expect(css).toContain('.docs-section-grid');
    expect(css).toContain('.docs-section:first-child');
    expect(css).toContain('.code-snippet');
    expect(css).toContain('.code-line-number');
    expect(css).toContain('.token.keyword');
    expect(css).toContain('.token.function');
    expect(css).toContain('.token.string');
    expect(css).toContain('.token.comment');
    expect(css).toContain('.docs-article-bookmarks');
    expect(css).toContain('.docs-article-bookmark-active');
    expect(css).toContain('position: sticky');
    expect(css).toContain('max-height: calc(100vh - 132px)');
    expect(css).toContain('overflow-y: auto');
    expect(css).not.toContain('.docs-on-this-page');
    expect(css).toContain('code');
    expect(source).toContain('toCodeLines');
    expect(source).toContain('toCodeTokens');
    expect(source).toContain('docsBehavior: siteArticleKey.behavior');
    expect(interactions).toContain('setupArticleBookmarks');
    expect(interactions).toContain('docs-article-bookmark-active');
  });

  it('routes runtime export guides as Runtime sidebar children', async () => {
    type RuntimeRouteKey =
      | 'docsRuntimeSignals'
      | 'docsRuntimeInputs'
      | 'docsRuntimeForms'
      | 'docsRuntimeControllers'
      | 'docsRuntimeDevtoolsGraph'
      | 'docsRuntimeLifecycle'
      | 'docsRuntimeMounting';

    const siteRoute = route as Record<RuntimeRouteKey, { path: string; fullPath: string }>;
    const html = await readSiteFile('src/layouts/docs/docs.layout.html');
    const css = await readSiteFile('src/layouts/docs/docs.layout.css');

    expect(siteRoute.docsRuntimeSignals.path).toBe('runtime/signals');
    expect(siteRoute.docsRuntimeInputs.path).toBe('runtime/inputs');
    expect(siteRoute.docsRuntimeForms.path).toBe('runtime/forms');
    expect(siteRoute.docsRuntimeControllers.path).toBe('runtime/controllers');
    expect(siteRoute.docsRuntimeDevtoolsGraph.path).toBe('runtime/devtools-graph');
    expect(siteRoute.docsRuntimeLifecycle.path).toBe('runtime/lifecycle');
    expect(siteRoute.docsRuntimeMounting.path).toBe('runtime/mounting');
    expect(siteRoute.docsRuntimeSignals.fullPath).toBe('/docs/runtime/signals');

    expect(html).toContain('item.children');
    expect(html).toContain('docs-nav-parent');
    expect(html).toContain('docs-nav-children');
    expect(css).toContain('.docs-nav-parent');
    expect(css).toContain('.docs-nav-child-link');
  });

  it('keeps docs sidebar rendering away from loop-local nested controls', async () => {
    const docsLayout = await readSiteFile('src/layouts/docs/docs.layout.html');
    const docsLayoutSource = await readSiteFile('src/layouts/docs/docs.layout.ts');

    expect(docsLayout).not.toContain('@if ');
    expect(docsLayout).not.toContain('group.items');
    expect(docsLayout).not.toContain('row.kind');
    expect(docsLayout).toContain('item of frameworkItems');
    expect(docsLayout).toContain('item of referenceItems');
    expect(docsLayout).not.toContain('item of componentItems');
    expect(docsLayoutSource).not.toContain('componentItems = siteNavigationBySection.components;');
  });

  it('ships the Phase 16B primitive gallery visual baseline', async () => {
    const galleryPath = join(appRoot, 'src/pages/components/component-gallery.page.html');

    expect(existsSync(galleryPath)).toBe(true);

    const gallery = await readSiteFile('src/pages/components/component-gallery.page.html');

    expect(gallery).toContain('Phase 16B preview');
    expect(gallery).toContain('class="preview-body variant-grid"');

    for (const tagName of [
      'vr-button',
      'vr-card',
      'vr-badge',
      'vr-avatar',
      'vr-alert',
      'vr-loader',
      'vr-skeleton',
      'vr-separator',
    ]) {
      expect(gallery).toContain(`<${tagName}`);
    }

    for (const variant of [
      'variant.danger',
      'variant.interactive',
      'tone.success',
      'variant.soft',
      'tone.warning',
      'variant.bar',
      'variant.block',
      'orientation.vertical',
    ]) {
      expect(gallery).toContain(variant);
    }
  });

  it('routes Button and Card gallery navigation to dedicated docs pages', async () => {
    const gallery = await readSiteFile('src/pages/components/component-gallery.page.html');
    const buttonPage = await readSiteFile('src/pages/components/component-button.page.html');
    const cardPage = await readSiteFile('src/pages/components/component-card.page.html');
    const siteRoute = route as Record<string, { fullPath: string; kind: string; parent?: unknown }>;

    expect(gallery).toContain('<a class="nav-link" href="/docs/components/buttons">Button</a>');
    expect(gallery).not.toContain('<a class="nav-link active" href="#button">Button</a>');
    expect(gallery).toContain('<a class="nav-link" href="/docs/components/cards">Card</a>');
    expect(gallery).not.toContain('<a class="nav-link" href="#card">Card</a>');
    const componentButtonsRoute = siteRoute.componentButtons;
    const componentCardsRoute = siteRoute.componentCards;

    if (componentButtonsRoute === undefined) {
      throw new Error('Expected componentButtons route to be defined.');
    }
    if (componentCardsRoute === undefined) {
      throw new Error('Expected componentCards route to be defined.');
    }

    expect(componentButtonsRoute).toMatchObject({
      fullPath: '/docs/components/buttons',
      kind: 'page',
    });
    expect(componentCardsRoute).toMatchObject({
      fullPath: '/docs/components/cards',
      kind: 'page',
    });
    expect(componentButtonsRoute.parent).toBeUndefined();
    expect(componentCardsRoute.parent).toBeUndefined();
    expect(buttonPage).toContain('class="app component-gallery-app component-button-app"');
    expect(buttonPage).toContain('<vr-sidebar class="sidebar" placement.left');
    expect(buttonPage).not.toContain('docs-sidebar');
    expect(buttonPage).toContain('<a class="nav-link active" href="/docs/components/buttons">Button</a>');
    expect(buttonPage).toContain('<a class="nav-link" href="/docs/components/cards">Card</a>');
    expect(cardPage).toContain('class="app component-gallery-app component-card-app"');
    expect(cardPage).toContain('<vr-sidebar class="sidebar" placement.left');
    expect(cardPage).not.toContain('docs-sidebar');
    expect(cardPage).toContain('<a class="nav-link" href="/docs/components/buttons">Button</a>');
    expect(cardPage).toContain('<a class="nav-link active" href="/docs/components/cards">Card</a>');
  });

  it('routes remaining Phase 16B component navigation to dedicated docs pages', async () => {
    const gallery = await readSiteFile('src/pages/components/component-gallery.page.html');
    const buttonPage = await readSiteFile('src/pages/components/component-button.page.html');
    const cardPage = await readSiteFile('src/pages/components/component-card.page.html');
    const siteRoute = route as Record<string, { fullPath: string; kind: string; parent?: unknown }>;

    for (const page of phase16ComponentDocPages) {
      expect(gallery).toContain(
        `<a class="nav-link" href="${page.path}">${page.title}</a>`,
      );
      expect(gallery).not.toContain(
        `<a class="nav-link" href="#${page.primitive}">${page.title}</a>`,
      );
      expect(buttonPage).toContain(
        `<a class="nav-link" href="${page.path}">${page.title}</a>`,
      );
      expect(cardPage).toContain(
        `<a class="nav-link" href="${page.path}">${page.title}</a>`,
      );

      const routeEntry = siteRoute[page.routeKey];

      if (routeEntry === undefined) {
        throw new Error(`Expected ${page.routeKey} route to be defined.`);
      }

      expect(routeEntry).toMatchObject({
        fullPath: page.path,
        kind: 'page',
      });
      expect(routeEntry.parent).toBeUndefined();
    }
  });

  it('routes Phase 16D component navigation to dedicated docs pages', async () => {
    const buttonPage = await readSiteFile('src/pages/components/component-button.page.html');
    const siteRoute = route as Record<string, { fullPath: string; kind: string; parent?: unknown }>;
    const componentLabels = [
      ...buttonPage.matchAll(/<a class="nav-link(?: active)?" href="\/docs\/components\/[^"]+">([^<]+)<\/a>/g),
    ].map((match) => match[1] ?? '');

    expect(componentLabels).toEqual([...componentLabels].sort((left, right) => left.localeCompare(right)));

    for (const page of phase16LayoutNavigationMediaDocPages) {
      const componentPage = await readSiteFile(`src/pages/components/${page.fileBase}.page.html`);
      const routeEntry = siteRoute[page.routeKey];

      if (routeEntry === undefined) {
        throw new Error(`Expected ${page.routeKey} route to be defined.`);
      }

      expect(routeEntry).toMatchObject({
        fullPath: page.path,
        kind: 'page',
      });
      expect(routeEntry.parent).toBeUndefined();
      expect(componentPage).toContain(
        `class="app component-gallery-app component-${page.fileBase.replace('component-', '')}-app"`,
      );
      expect(componentPage).toContain('<vr-sidebar class="sidebar" placement.left');
      expect(componentPage).toContain(
        `<a class="nav-link active" href="${page.path}">${page.title}</a>`,
      );
      expect(componentPage).toContain('<h1>{{ doc().title }}</h1>');
      expect(componentPage).toContain('<div class="variant-preview">');
      expect(componentPage).toContain('<div class="code-snippet">');
      expect(componentPage).toContain(page.tokenSnippet);
    }
  });

  it('does not expose Stack in component feature navigation', async () => {
    const gallery = await readSiteFile('src/pages/components/component-gallery.page.html');
    const buttonPage = await readSiteFile('src/pages/components/component-button.page.html');
    const siteRoute = route as Record<string, { fullPath: string; kind: string; parent?: unknown }>;

    expect(siteRoute.componentStacks).toBeUndefined();
    expect(gallery).not.toContain('/docs/components/stacks');
    expect(buttonPage).not.toContain('/docs/components/stacks');
    expect(gallery).not.toContain('>Stack</a>');
    expect(buttonPage).not.toContain('>Stack</a>');
  });

  it('routes Phase 16E forms and data docs to dedicated pages', async () => {
    const siteRoute = route as Record<string, { fullPath: string; kind: string; parent?: unknown }>;
    const siteCss = await readSiteFile('src/styles/site.css');

    expect(siteCss).toContain('@import "../pages/components/component-phase16e.css";');

    for (const page of phase16FormsDataDocPages) {
      const html = await readSiteFile(`src/pages/components/${page.fileBase}.page.html`);
      const css = await readSiteFile(`src/pages/components/${page.fileBase}.page.css`);
      const source = await readSiteFile(`src/pages/components/${page.fileBase}.page.ts`);
      const routeEntry = siteRoute[page.routeKey];

      if (routeEntry === undefined) {
        throw new Error(`Expected ${page.routeKey} route to be defined.`);
      }

      expect(routeEntry).toMatchObject({
        fullPath: page.path,
        kind: 'page',
      });
      expect(routeEntry.parent).toBeUndefined();
      expect(source).toContain('ComponentRegistryDocPage');
      expect(html).toContain('<h1>{{ doc().title }}</h1>');
      expect(html).toContain('Phase 16E');
      expect(html).toContain('Registry API');
      expect(css).not.toContain('component-phase16e.css');
    }
  });

  it('routes Phase 16F interaction docs to example-only pages', async () => {
    const siteRoute = route as Record<string, { fullPath: string; kind: string; parent?: unknown }>;

    for (const page of phase16InteractionDocPages) {
      const html = await readSiteFile(`src/pages/components/${page.fileBase}.page.html`);
      const css = await readSiteFile(`src/pages/components/${page.fileBase}.page.css`);
      const source = await readSiteFile(`src/pages/components/${page.fileBase}.page.ts`);
      const routeEntry = siteRoute[page.routeKey];

      if (routeEntry === undefined) {
        throw new Error(`Expected ${page.routeKey} route to be defined.`);
      }

      expect(routeEntry).toMatchObject({
        fullPath: page.path,
        kind: 'page',
      });
      expect(routeEntry.parent).toBeUndefined();
      expect(source).toContain(`${page.title} component docs`);
      expect(html).toContain('<h1>{{ doc().title }}</h1>');
      expect(html).toContain('class="variant-doc"');
      expect(html).toContain('class="code-snippet"');
      expect(html).toContain('copy-icon-button');
      expect(html).toContain(page.tokenSnippet);
      expect(css).toContain(`component-${page.fileBase.replace('component-', '')}-app`);
    }
  });

  it('renders the Dialog docs as a shadcn-style modal with blurred backdrop', async () => {
    const dialogPage = await readSiteFile('src/pages/components/component-dialog.page.html');
    const dialogCss = await readSiteFile('src/pages/components/component-dialog.page.css');

    expect(dialogPage).toContain('<div class="preview-head"><span>Examples</span><span>1</span></div>');
    expect(dialogPage).toContain('<div class="dialog-form">');
    expect(dialogPage).toContain('<label for="dialog-preview-name">Name</label>');
    expect(dialogPage).toContain('value="Pedro Duarte"');
    expect(dialogPage).toContain('<label for="dialog-preview-username">Username</label>');
    expect(dialogPage).toContain('value="@peduarte"');
    expect(dialogPage).toContain('class="dialog-close-button"');
    expect(dialogPage).toContain('aria-label="Close dialog"');
    expect(dialogPage).toContain('class="dialog-footer-actions"');
    expect(dialogPage).toContain('Make changes to your profile here. Click save when you are done.');
    expect(dialogCss).toContain('.component-dialog-app:has([data-vr-overlay-content][data-state="open"])::before');
    expect(dialogCss).toContain('backdrop-filter: blur(14px);');
    expect(dialogCss).toContain('.component-dialog-app [data-vr-overlay-content]');
    expect(dialogCss).toContain('.dialog-form {');
    expect(dialogCss).toContain('.dialog-input {');
    expect(dialogCss).toContain('.dialog-close-button {');
    expect(dialogCss).toContain('.dialog-footer-actions {');
  });

  it('renders the Dropdown docs as a shadcn-style grouped menu with shortcuts', async () => {
    const dropdownPage = await readSiteFile('src/pages/components/component-dropdown.page.html');
    const dropdownCss = await readSiteFile('src/pages/components/component-dropdown.page.css');

    expect(dropdownPage).toContain('<vr-dropdown class="dropdown-demo" data-vr-overlay-preview align.start>');
    expect(dropdownPage).toContain('<vr-dropdown-trigger class="dropdown-demo-trigger"');
    expect(dropdownPage).toContain('<vr-dropdown-content class="dropdown-preview-content" data-vr-overlay-content hidden role="menu">');
    expect(dropdownPage).toContain('<vr-dropdown-label class="dropdown-preview-label">My Account</vr-dropdown-label>');
    expect(dropdownPage).toContain('<span class="dropdown-item-text">Profile</span>');
    expect(dropdownPage).toContain('<span class="dropdown-shortcut">⇧⌘P</span>');
    expect(dropdownPage).toContain('<span class="dropdown-item-text">Invite users</span>');
    expect(dropdownPage).toContain('<span class="dropdown-chevron" aria-hidden="true">›</span>');
    expect(dropdownPage).toContain('<span class="dropdown-item-text">API</span>');
    expect(dropdownPage).toContain('aria-disabled="true"');
    expect(dropdownPage).toContain('<span class="dropdown-shortcut">⇧⌘Q</span>');
    expect(dropdownCss).toContain('.dropdown-preview-content {');
    expect(dropdownCss).toContain('width: 232px;');
    expect(dropdownCss).toContain('border-radius: 12px;');
    expect(dropdownCss).toContain('.dropdown-shortcut {');
    expect(dropdownCss).toContain('.dropdown-menu-item.is-disabled {');
  });

  it('wires Phase 16F interaction examples to runtime preview controllers', async () => {
    const siteCss = await readSiteFile('src/styles/site.css');
    const interactionPreviewHelper = await readSiteFile(
      'src/pages/components/component-interaction-preview.widget.ts',
    );

    for (const primitive of ['dialog', 'drawer', 'dropdown', 'tabs', 'toast']) {
      expect(siteCss).toContain(
        `@import "../../../../packages/ui/src/primitives/${primitive}/ui.${primitive}.css";`,
      );
    }

    expect(interactionPreviewHelper).toContain('createOverlayController');
    expect(interactionPreviewHelper).toContain('createTabsController');
    expect(interactionPreviewHelper).toContain('createToastController');
    expect(interactionPreviewHelper).toContain('onMount');
    expect(interactionPreviewHelper).toContain('effect');

    for (const fileBase of ['component-dialog', 'component-drawer', 'component-dropdown']) {
      const html = await readSiteFile(`src/pages/components/${fileBase}.page.html`);
      const source = await readSiteFile(`src/pages/components/${fileBase}.page.ts`);

      expect(source).toContain('setupOverlayPreview');
      expect(html).toContain('data-vr-overlay-preview');
      expect(html).toContain('data-vr-overlay-trigger');
      expect(html).toContain('data-vr-overlay-content hidden');
      expect(html).toContain('data-vr-overlay-close');
    }

    for (const fileBase of ['component-dialog', 'component-drawer']) {
      const html = await readSiteFile(`src/pages/components/${fileBase}.page.html`);

      expect(html).toContain('role="dialog"');
      expect(html).toContain('aria-modal="true"');
    }

    const dropdownPage = await readSiteFile('src/pages/components/component-dropdown.page.html');
    const tabsPage = await readSiteFile('src/pages/components/component-tabs.page.html');
    const tabsSource = await readSiteFile('src/pages/components/component-tabs.page.ts');
    const toastPage = await readSiteFile('src/pages/components/component-toast.page.html');
    const toastSource = await readSiteFile('src/pages/components/component-toast.page.ts');

    expect(dropdownPage).toContain('role="menu"');
    expect(tabsSource).toContain('setupTabsPreview');
    expect(tabsPage).toContain('data-vr-tabs-preview');
    expect(tabsPage).toContain('data-vr-tabs-trigger="overview"');
    expect(tabsPage).toContain('data-vr-tabs-panel="activity" hidden');
    expect(toastSource).toContain('setupToastPreview');
    expect(toastPage).toContain('data-vr-toast-trigger');
    expect(toastPage).toContain('data-vr-toast-item hidden');
    expect(toastPage).toContain('data-vr-toast-dismiss');

    const hiddenCssContracts = [
      ['dialog', '.vr-dialog-content[hidden]'],
      ['drawer', '.vr-drawer-content[hidden]'],
      ['dropdown', '.vr-dropdown-content[hidden]'],
      ['tabs', '.vr-tabs-panel[hidden]'],
      ['toast', '.vr-toast-item[hidden]'],
    ] as const;

    for (const [primitive, hiddenSelector] of hiddenCssContracts) {
      const css = await readProjectFile(`packages/ui/src/primitives/${primitive}/ui.${primitive}.css`);

      expect(css).toContain(hiddenSelector);
      expect(css).toContain('display: none;');
    }
  });

  it('routes Phase 16G final docs to dedicated registry-backed pages', async () => {
    const siteRoute = route as Record<string, { fullPath: string; kind: string; parent?: unknown }>;
    const siteCss = await readSiteFile('src/styles/site.css');

    expect(siteCss).toContain('@import "../pages/components/component-phase16g.css";');

    for (const primitive of ['popover', 'tooltip', 'command-menu']) {
      expect(siteCss).toContain(
        `@import \"../../../../packages/ui/src/primitives/${primitive}/ui.${primitive}.css\";`,
      );
    }

    for (const page of phase16FinalDocPages) {
      const html = await readSiteFile(`src/pages/components/${page.fileBase}.page.html`);
      const css = await readSiteFile(`src/pages/components/${page.fileBase}.page.css`);
      const source = await readSiteFile(`src/pages/components/${page.fileBase}.page.ts`);
      const routeEntry = siteRoute[page.routeKey];

      if (routeEntry === undefined) {
        throw new Error(`Expected ${page.routeKey} route to be defined.`);
      }

      expect(routeEntry).toMatchObject({
        fullPath: page.path,
        kind: 'page',
      });
      expect(routeEntry.parent).toBeUndefined();
      expect(source).toContain(`${page.title} component docs`);
      expect(html).toContain('<vr-sidebar class="sidebar" placement.left');
      expect(html).toContain('<vr-header class="topbar">');
      expect(html).toContain('<section class="content">');
      expect(html).toContain(
        `<a class="nav-link active" href="${page.path}">${page.title}</a>`,
      );
      expect(html).toContain('<h1>{{ doc().title }}</h1>');
      expect(html).toContain('Phase 16G');
      expect(html).toContain('class=\"variant-preview\"');
      expect(html).toContain('class=\"code-snippet\"');
      expect(html).toContain(page.tokenSnippet);
      expect(css).toContain(`component-${page.fileBase.replace('component-', '')}-app`);
    }
  });

  it('wires Phase 16G final docs previews to runtime interaction controllers', async () => {
    const previewWidget = await readSiteFile(
      'src/pages/components/component-interaction-preview.widget.ts',
    );
    const popoverSource = await readSiteFile('src/pages/components/component-popover.page.ts');
    const popoverHtml = await readSiteFile('src/pages/components/component-popover.page.html');
    const tooltipSource = await readSiteFile('src/pages/components/component-tooltip.page.ts');
    const tooltipHtml = await readSiteFile('src/pages/components/component-tooltip.page.html');
    const commandMenuSource = await readSiteFile(
      'src/pages/components/component-command-menu.page.ts',
    );
    const commandMenuHtml = await readSiteFile(
      'src/pages/components/component-command-menu.page.html',
    );
    const showcaseSource = await readSiteFile('src/pages/examples/october-showcase.page.ts');
    const showcaseHtml = await readSiteFile('src/pages/examples/october-showcase.page.html');

    expect(previewWidget).toContain('createCommandMenuController');
    expect(previewWidget).toContain('createTooltipController');
    expect(previewWidget).toContain('positionLayer');
    expect(previewWidget).toContain('setupCommandMenuPreview');
    expect(previewWidget).toContain('setupTooltipPreview');
    expect(popoverSource).toContain('setupOverlayPreview();');
    expect(popoverHtml).toContain('data-vr-overlay-preview');
    expect(popoverHtml).toContain('data-vr-overlay-trigger');
    expect(popoverHtml).toContain('data-vr-overlay-content hidden');
    expect(tooltipSource).toContain('setupTooltipPreview();');
    expect(tooltipHtml).toContain('data-vr-tooltip-preview');
    expect(tooltipHtml).toContain('data-vr-tooltip-trigger');
    expect(tooltipHtml).toContain('data-vr-tooltip-content hidden');
    expect(commandMenuSource).toContain('setupCommandMenuPreview();');
    expect(commandMenuHtml).toContain('data-vr-command-menu-preview');
    expect(commandMenuHtml).toContain('data-vr-command-menu-input');
    expect(commandMenuHtml).toContain('data-vr-command-menu-item');
    expect(showcaseSource).toContain('setupOverlayPreview();');
    expect(showcaseSource).toContain('setupCommandMenuPreview();');
    expect(showcaseHtml).toContain('data-vr-overlay-content hidden');
    expect(showcaseHtml).toContain('data-vr-command-menu-preview');
  });

  it('renders Phase 16G final docs with shadcn-style interactive previews', async () => {
    const popoverHtml = await readSiteFile('src/pages/components/component-popover.page.html');
    const tooltipHtml = await readSiteFile('src/pages/components/component-tooltip.page.html');
    const commandMenuHtml = await readSiteFile(
      'src/pages/components/component-command-menu.page.html',
    );
    const phase16gCss = await readSiteFile('src/pages/components/component-phase16g.css');
    const popoverCss = await readSiteFile('src/pages/components/component-popover.page.css');

    expect(tooltipHtml).toContain('<vr-button variant.outline type="button">Hover</vr-button>');
    expect(tooltipHtml).toContain('data-vr-tooltip-content hidden data-vr-tooltip-static>Add to library');
    expect(tooltipHtml).toContain('&lt;vr-tooltip-trigger&gt;Hover&lt;/vr-tooltip-trigger&gt;');

    expect(popoverHtml).toContain('<vr-button variant.outline type="button">Open popover</vr-button>');
    expect(popoverHtml).toContain('<form class="shadcn-popover-form"');
    for (const label of ['Width', 'Max. width', 'Height', 'Max. height']) {
      expect(popoverHtml).toContain(`<label>${label}</label>`);
    }
    for (const value of ['100%', '300px', '25px', 'none']) {
      expect(popoverHtml).toContain(`value="${value}"`);
    }
    expect(popoverCss).toContain('.component-phase16g-app.component-popover-app .preview');
    expect(popoverCss).toContain('overflow: visible;');
    expect(popoverCss).toContain(
      '.component-phase16g-app.component-popover-app .primitive:has([data-vr-overlay-content][data-state="open"])',
    );

    expect(commandMenuHtml).toContain('placeholder="Type a command or search..."');
    expect(commandMenuHtml).toContain('data-vr-command-empty hidden>No results found.');
    expect(commandMenuHtml).toContain('<div class="command-group-heading">Suggestions</div>');
    expect(commandMenuHtml).toContain('<div class="command-group-heading">Settings</div>');
    expect(commandMenuHtml).toContain('>Calendar<');
    expect(commandMenuHtml).toContain('>Search Emoji<');
    expect(commandMenuHtml).toContain('aria-disabled="true">');
    expect(commandMenuHtml).toContain('>Calculator<');
    expect(commandMenuHtml).toContain('<vr-command-menu-shortcut class="command-shortcut">⌘P</vr-command-menu-shortcut>');
    expect(commandMenuHtml).toContain('<vr-command-menu-shortcut class="command-shortcut">⌘B</vr-command-menu-shortcut>');
    expect(commandMenuHtml).toContain('<vr-command-menu-shortcut class="command-shortcut">⌘S</vr-command-menu-shortcut>');

    for (const selector of [
      '.phase16g-preview-frame',
      '.shadcn-tooltip-content::after',
      '.shadcn-popover-form',
      '.vr-popover-title',
      '.vr-popover-description',
      '.command-empty',
      '.command-group-heading',
      '.command-separator',
      '.command-shortcut',
    ]) {
      expect(phase16gCss).toContain(selector);
    }
  });

  it('routes the October showcase to a dedicated example page', async () => {
    const siteRoute = route as Record<string, { fullPath: string; kind: string; parent?: unknown }>;
    const siteData = await readSiteFile('src/docs/site-data.json');
    const siteNavigation = await readSiteFile('src/docs/site-navigation.ts');
    const routeSource = await readSiteFile('src/routes.ts');
    const showcaseSource = await readSiteFile('src/pages/examples/october-showcase.page.ts');
    const showcaseHtml = await readSiteFile('src/pages/examples/october-showcase.page.html');
    const showcaseCss = await readSiteFile('src/pages/examples/october-showcase.page.css');

    expect(siteRoute.docsOctoberShowcase).toMatchObject({
      fullPath: '/docs/examples/october-showcase',
      kind: 'page',
    });
    expect(routeSource).toContain(
      "import { OctoberShowcasePage } from './pages/examples/october-showcase.page.ts';",
    );
    expect(routeSource).toContain('page: OctoberShowcasePage');
    expect(routeSource).not.toContain(
      'const docsOctoberShowcase = articlePage(siteArticleKey.octoberShowcase);',
    );
    expect(showcaseSource).toContain('October showcase example page.');
    expect(showcaseSource).toContain('siteArticleKey.octoberShowcase');
    expect(showcaseHtml).toContain('<article class="october-showcase-page">');
    expect(showcaseHtml).toContain('class="showcase-grid"');
    expect(showcaseHtml).toContain('class="showcase-pattern"');
    expect(showcaseHtml).toContain('vr-popover');
    expect(showcaseHtml).toContain('vr-tooltip');
    expect(showcaseHtml).toContain('vr-command-menu');
    expect(showcaseCss).toContain('.october-showcase-page');
    expect(showcaseCss).toContain('.showcase-grid');
    expect(showcaseCss).toContain('@media (max-width: 780px)');
    expect(siteData).toContain('"key": "octoberShowcase"');
    expect(siteData).toContain('"title": "October Showcase"');
    expect(siteData).toContain('"title": "Admin"');
    expect(siteData).toContain('"title": "Dashboard"');
    expect(siteData).toContain('"title": "Mobile"');
    expect(siteNavigation).toContain('siteArticleKey.octoberShowcase');
  });

  it('wires docs shell interactions through a dedicated runtime widget', async () => {
    const layoutSource = await readSiteFile('src/layouts/docs/docs.layout.ts');
    const layoutHtml = await readSiteFile('src/layouts/docs/docs.layout.html');
    const widgetSource = await readSiteFile('src/layouts/docs/docs-shell-interactions.widget.ts');

    expect(layoutSource).toContain(
      "import { setupDocsShellInteractions } from './docs-shell-interactions.widget.ts';",
    );
    expect(layoutSource).toContain('setupDocsShellInteractions();');
    expect(layoutHtml).toContain('data-vr-docs-command-menu');
    expect(layoutHtml).toContain('data-vr-docs-command-input');
    expect(layoutHtml).toContain('data-vr-docs-command-item');
    expect(layoutHtml).not.toContain('data-vr-docs-popover');
    expect(layoutHtml).not.toContain('data-vr-docs-tooltip-trigger');
    expect(widgetSource).toContain('createCommandMenuController');
    expect(widgetSource).toContain('createOverlayController');
    expect(widgetSource).not.toContain('createTooltipController');
    expect(widgetSource).not.toContain('positionLayer');
    expect(widgetSource).toContain('setupDocsShellInteractions');
    expect(widgetSource).toContain('syncNestedOverlayPreview');
    expect(widgetSource).toContain('data-vr-overlay-preview');
    expect(widgetSource).toContain('data-vr-command-menu-preview');
  });

  it('exposes Phase 16F interaction docs from the component gallery navigation', async () => {
    const gallery = await readSiteFile('src/pages/components/component-gallery.page.html');

    for (const page of phase16InteractionDocPages) {
      expect(gallery).toContain(
        `<a class="nav-link" href="${page.path}">${page.title}</a>`,
      );
      expect(gallery).toContain(
        `<a class="variant-tile component-page-link" href="${page.path}">`,
      );
      expect(gallery).not.toContain(
        `<a class="nav-link" href="#${page.primitive}">${page.title}</a>`,
      );
    }
  });

  it('exposes Phase 16G final docs from the component gallery navigation', async () => {
    const gallery = await readSiteFile('src/pages/components/component-gallery.page.html');

    for (const page of phase16FinalDocPages) {
      expect(gallery).toContain(
        `<a class="nav-link" href="${page.path}">${page.title}</a>`,
      );
      expect(gallery).toContain(
        `<a class="variant-tile component-page-link" href="${page.path}">`,
      );
      expect(gallery).not.toContain(
        `<a class="nav-link" href="#${page.primitive}">${page.title}</a>`,
      );
    }
  });

  it('exposes Phase 16F interaction docs from established component page sidebars', async () => {
    const establishedPages = [
      'component-button',
      'component-separator',
      'component-skeleton',
    ];

    for (const fileBase of establishedPages) {
      const html = await readSiteFile(`src/pages/components/${fileBase}.page.html`);

      for (const page of phase16InteractionDocPages) {
        expect(html).toContain(
          `<a class="nav-link" href="${page.path}">${page.title}</a>`,
        );
      }
    }
  });

  it('exposes Phase 16G final docs from established component page sidebars', async () => {
    const establishedPages = [
      'component-button',
      'component-separator',
      'component-skeleton',
    ];

    for (const fileBase of establishedPages) {
      const html = await readSiteFile(`src/pages/components/${fileBase}.page.html`);

      for (const page of phase16FinalDocPages) {
        expect(html).toContain(
          `<a class="nav-link" href="${page.path}">${page.title}</a>`,
        );
      }
    }
  });

  it('uses dotted token attributes for Vanrot-owned component docs examples', async () => {
    const tokenAttributePattern = /\b(?:variant|tone|orientation)="[^"]+"/;

    for (const fileBase of phase16CoreComponentFiles) {
      const componentPage = await readSiteFile(`src/pages/components/${fileBase}.page.html`);

      expect(componentPage).not.toMatch(tokenAttributePattern);
    }
  });

  it('keeps Button overview separate from shadcn-style variant examples', async () => {
    const buttonPage = await readSiteFile('src/pages/components/component-button.page.html');
    const buttonCss = await readSiteFile('src/pages/components/component-button.page.css');
    const variantSections = [
      ...buttonPage.matchAll(
        /<section class="variant-doc" id="button-(default|secondary|outline|ghost|danger|link)">/g,
      ),
    ];

    expect(buttonPage).not.toContain('<span class="eyebrow">Component documentation</span>');
    expect(buttonPage).toContain('<h1>{{ doc().title }}</h1>');
    expect(buttonPage).not.toContain('<p class="lead">{{ doc().summary }}</p>');
    expect(buttonPage).not.toContain('<h2>Button</h2>');
    expect(buttonPage).not.toContain('<p>{{ doc().usage }}</p>');
    expect(buttonPage).not.toContain('<span class="code-chip">&lt;vr-button&gt;</span>');
    expect(buttonPage).toContain('<div class="preview-head"><span>Variants</span><span>6</span></div>');
    expect(buttonPage).not.toContain('<div class="tabs" aria-label="Preview tabs">');
    expect(buttonPage).not.toContain('class="variant-tabs"');
    expect(buttonPage).not.toContain('<button class="tab active">Preview</button>');
    expect(buttonPage).not.toContain('<span class="panel-label">Accessibility</span>');
    expect(variantSections.map((match) => match[1])).toEqual([
      'default',
      'secondary',
      'outline',
      'ghost',
      'danger',
      'link',
    ]);
    expect(buttonPage.match(/<div class="variant-preview">/g) ?? []).toHaveLength(6);
    expect(buttonPage.match(/<div class="code-snippet">/g) ?? []).toHaveLength(6);
    expect(buttonPage).not.toContain('code-snippet-toolbar');
    expect(buttonPage).not.toContain('class="copy-button"');
    expect(buttonPage.match(/<button class="copy-icon-button" type="button" aria-label="Copy [^"]+ button code">/g) ?? []).toHaveLength(6);
    expect(buttonPage.match(/<pre class="code-block"><code>/g) ?? []).toHaveLength(6);
    expect(buttonPage.match(/<span class="code-line-number">1<\/span>/g) ?? []).toHaveLength(6);
    expect(buttonPage.match(/<span class="code-line-content[^"]*">/g) ?? []).toHaveLength(18);
    expect(buttonPage.match(/<span class="code-line-content code-indent-1">/g) ?? []).toHaveLength(6);
    expect(buttonPage.match(/<span class="token attr"> variant\.[a-z]+<\/span>/g) ?? []).toHaveLength(6);
    expect(buttonPage.match(/<span class="token attr"> type<\/span>/g) ?? []).toHaveLength(6);
    expect(buttonPage).toContain('<span class="token tag">&lt;vr-button</span>');
    expect(buttonPage).not.toContain('code-space');
    expect(buttonCss).toContain('.code-snippet {');
    expect(buttonCss).toContain('.copy-icon-button {');
    expect(buttonCss).toContain('.code-line {');
    expect(buttonCss).toContain('.code-line-number {');
    expect(buttonCss).toContain('.code-line-content {');
    expect(buttonCss).toContain('.code-indent-1 {');
    expect(buttonCss).toContain('.token.tag {');
    expect(buttonCss).toContain('white-space: pre;');
    expect(buttonCss).toContain('min-height: 360px;');
    expect(buttonCss).toContain('.variant-preview {');
    expect(buttonCss).toContain('background-image: radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px);');
    expect(buttonCss).toContain('background-size: 24px 24px;');
    expect(buttonCss).toContain('@media (max-width: 640px) {');
    expect(buttonCss).toContain('.code-block code { font-size: 13px; }');
    expect(buttonCss).toContain('.variant-preview { min-height: 240px; padding: 32px 16px; }');
    expect(buttonCss).toContain('.code-line { grid-template-columns: 48px max-content; }');

    for (const variant of ['default', 'secondary', 'outline', 'ghost', 'danger', 'link']) {
      expect(buttonPage).toContain(`variant.${variant}`);
    }
  });

  it('keeps Card overview separate from shadcn-style variant examples', async () => {
    const cardPage = await readSiteFile('src/pages/components/component-card.page.html');
    const cardCss = await readSiteFile('src/pages/components/component-card.page.css');
    const variantSections = [
      ...cardPage.matchAll(
        /<section class="variant-doc" id="card-(default|muted|interactive)">/g,
      ),
    ];

    expect(cardPage).not.toContain('<span class="eyebrow">Component documentation</span>');
    expect(cardPage).toContain('<h1>{{ doc().title }}</h1>');
    expect(cardPage).not.toContain('<p class="lead">{{ doc().summary }}</p>');
    expect(cardPage).not.toContain('<h2>Card</h2>');
    expect(cardPage).not.toContain('<p>{{ doc().usage }}</p>');
    expect(cardPage).not.toContain('<span class="code-chip">&lt;vr-card&gt;</span>');
    expect(cardPage).toContain('<div class="preview-head"><span>Variants</span><span>3</span></div>');
    expect(cardPage).not.toContain('<div class="tabs" aria-label="Preview tabs">');
    expect(cardPage).not.toContain('class="variant-tabs"');
    expect(cardPage).not.toContain('<button class="tab active">Preview</button>');
    expect(cardPage).not.toContain('<span class="panel-label">Accessibility</span>');
    expect(variantSections.map((match) => match[1])).toEqual([
      'default',
      'muted',
      'interactive',
    ]);
    expect(cardPage.match(/<div class="variant-preview">/g) ?? []).toHaveLength(3);
    expect(cardPage.match(/<div class="code-snippet">/g) ?? []).toHaveLength(3);
    expect(cardPage).not.toContain('code-snippet-toolbar');
    expect(cardPage).not.toContain('class="copy-button"');
    expect(cardPage.match(/<button class="copy-icon-button" type="button" aria-label="Copy [^"]+ card code">/g) ?? []).toHaveLength(3);
    expect(cardPage.match(/<pre class="code-block"><code>/g) ?? []).toHaveLength(3);
    expect(cardPage.match(/<span class="code-line-number">1<\/span>/g) ?? []).toHaveLength(3);
    expect(cardPage.match(/<span class="code-line-content[^"]*">/g) ?? []).toHaveLength(15);
    expect(cardPage.match(/<span class="code-line-content code-indent-1">/g) ?? []).toHaveLength(9);
    expect(cardPage.match(/<span class="token attr"> variant\.[a-z]+<\/span>/g) ?? []).toHaveLength(6);
    expect(cardPage).toContain('<span class="token tag">&lt;vr-card</span>');
    expect(cardPage).not.toContain('code-space');
    expect(cardCss).toContain('.code-snippet {');
    expect(cardCss).toContain('.copy-icon-button {');
    expect(cardCss).toContain('.code-line {');
    expect(cardCss).toContain('.code-line-number {');
    expect(cardCss).toContain('.code-line-content {');
    expect(cardCss).toContain('.code-indent-1 {');
    expect(cardCss).toContain('.token.tag {');
    expect(cardCss).toContain('white-space: pre;');
    expect(cardCss).toContain('min-height: 360px;');
    expect(cardCss).toContain('.variant-preview {');
    expect(cardCss).toContain('background-image: radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px);');
    expect(cardCss).toContain('background-size: 24px 24px;');
    expect(cardCss).toContain('@media (max-width: 640px) {');
    expect(cardCss).toContain('.code-block code { font-size: 13px; }');
    expect(cardCss).toContain('.variant-preview { min-height: 240px; padding: 32px 16px; }');
    expect(cardCss).toContain('.code-line { grid-template-columns: 48px max-content; }');

    for (const variant of ['default', 'muted', 'interactive']) {
      expect(cardPage).toContain(`variant.${variant}`);
    }
  });

  it.each(phase16ComponentDocPages)(
    'keeps $title overview separate from shadcn-style variant examples',
    async (page) => {
      const componentPage = await readSiteFile(
        `src/pages/components/${page.fileBase}.page.html`,
      );
      const componentCss = await readSiteFile(
        `src/pages/components/${page.fileBase}.page.css`,
      );
      const variantExpression = page.variants.join('|');
      const variantSections = [
        ...componentPage.matchAll(
          new RegExp(
            `<section class="variant-doc" id="${page.primitive}-(${variantExpression})">`,
            'g',
          ),
        ),
      ];

      expect(componentPage).toContain(
        `class="app component-gallery-app component-${page.primitive}-app"`,
      );
      expect(componentPage).toContain('<vr-sidebar class="sidebar" placement.left');
      expect(componentPage).not.toContain('docs-sidebar');
      expect(componentPage).toContain(
        `<a class="nav-link active" href="${page.path}">${page.title}</a>`,
      );
      expect(componentPage).not.toContain(
        `<a class="nav-link active" href="#${page.primitive}">${page.title}</a>`,
      );
      expect(componentPage).not.toContain(
        '<span class="eyebrow">Component documentation</span>',
      );
      expect(componentPage).toContain('<h1>{{ doc().title }}</h1>');
      expect(componentPage).not.toContain('<p class="lead">{{ doc().summary }}</p>');
      expect(componentPage).not.toContain(`<h2>${page.title}</h2>`);
      expect(componentPage).not.toContain('<p>{{ doc().usage }}</p>');
      expect(componentPage).not.toContain(
        `<span class="code-chip">&lt;${page.tagName}&gt;</span>`,
      );
      expect(componentPage).toContain(
        `<div class="preview-head"><span>Variants</span><span>${page.variants.length}</span></div>`,
      );
      expect(componentPage).not.toContain('<div class="tabs" aria-label="Preview tabs">');
      expect(componentPage).not.toContain('class="variant-tabs"');
      expect(componentPage).not.toContain('<button class="tab active">Preview</button>');
      expect(componentPage).not.toContain('<span class="panel-label">Accessibility</span>');
      expect(variantSections.map((match) => match[1])).toEqual([...page.variants]);
      expect(componentPage.match(/<div class="variant-preview">/g) ?? []).toHaveLength(
        page.variants.length,
      );
      expect(componentPage.match(/<div class="code-snippet">/g) ?? []).toHaveLength(
        page.variants.length,
      );
      expect(componentPage).not.toContain('code-snippet-toolbar');
      expect(componentPage).not.toContain('class="copy-button"');
      expect(
        componentPage.match(
          new RegExp(
            `<button class="copy-icon-button" type="button" aria-label="Copy [^"]+ ${page.primitive} code">`,
            'g',
          ),
        ) ?? [],
      ).toHaveLength(page.variants.length);
      expect(componentPage.match(/<pre class="code-block"><code>/g) ?? []).toHaveLength(
        page.variants.length,
      );
      expect(
        componentPage.match(/<span class="code-line-number">1<\/span>/g) ?? [],
      ).toHaveLength(page.variants.length);
      expect(componentPage).toContain(`<span class="token tag">&lt;${page.tagName}</span>`);
      expect(componentPage).toContain(`<span class="token attr"> ${page.tokenGroup}.`);
      expect(componentPage).not.toContain('code-space');

      for (const variant of page.variants) {
        expect(componentPage).toContain(`id="${page.primitive}-${variant}"`);
        expect(componentPage).toContain(`${page.tokenGroup}.${variant}`);
        expect(componentPage).toContain(
          `<span class="token attr"> ${page.tokenGroup}.${variant}</span>`,
        );
      }

      expect(componentCss).toContain('.code-snippet {');
      expect(componentCss).toContain('.copy-icon-button {');
      expect(componentCss).toContain('.code-line {');
      expect(componentCss).toContain('.code-line-number {');
      expect(componentCss).toContain('.code-line-content {');
      expect(componentCss).toContain('.code-indent-1 {');
      expect(componentCss).toContain('.token.tag {');
      expect(componentCss).toContain('white-space: pre;');
      expect(componentCss).toContain('min-height: 360px;');
      expect(componentCss).toContain('.variant-preview {');
      expect(componentCss).toContain(
        'background-image: radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px);',
      );
      expect(componentCss).toContain('background-size: 24px 24px;');
      expect(componentCss).toContain('@media (max-width: 640px) {');
      expect(componentCss).toContain('.code-block code { font-size: 13px; }');
      expect(componentCss).toContain(
        '.variant-preview { min-height: 240px; padding: 32px 16px; }',
      );
      expect(componentCss).toContain(
        '.code-line { grid-template-columns: 48px max-content; }',
      );
    },
  );

  it('uses real loader and skeleton primitives instead of hand-built demo internals', async () => {
    const gallery = await readSiteFile('src/pages/components/component-gallery.page.html');
    const galleryCss = await readSiteFile('src/pages/components/component-gallery.page.css');
    const loaderSection = gallery.match(/<section class="primitive" id="loader">[\s\S]*?<\/section>/)?.[0] ?? '';
    const loaderElements = [...loaderSection.matchAll(/<vr-loader\b[^>]*>([\s\S]*?)<\/vr-loader>/g)];

    expect(loaderSection).toContain('<vr-loader class="loader" variant.spinner aria-label="Loading spinner"></vr-loader>');
    expect(loaderSection).toContain('<vr-loader class="loader" variant.dots aria-label="Loading dots"></vr-loader>');
    expect(loaderSection).toContain('<vr-loader class="loader" variant.bar aria-label="Loading bar"></vr-loader>');
    expect(loaderElements).toHaveLength(3);
    for (const match of loaderElements) {
      const content = match[1] ?? '';

      expect(content.trim()).toBe('');
    }
    expect(loaderSection).not.toContain('<span class="spinner"');
    expect(loaderSection).not.toContain('<span class="bar"');
    expect(galleryCss).not.toContain('.dots span');
    expect(galleryCss).not.toContain('.bar span');
  });

  it('matches the saved Phase 16B component presentation shell and CSS selectors', async () => {
    const gallery = await readSiteFile('src/pages/components/component-gallery.page.html');
    const galleryCss = await readSiteFile('src/pages/components/component-gallery.page.css');
    const prototype = await readFile(
      join(appRoot, 'tests/fixtures/phase-16b-core-primitives.html'),
      'utf8',
    );
    const prototypeCss = prototype.match(/<style>([\s\S]*?)<\/style>/)?.[1]?.trim();

    expect(gallery).toContain('class="app component-gallery-app"');
    expect(gallery).toContain('<vr-sidebar class="sidebar" placement.left');
    expect(gallery).toContain('<vr-header class="topbar">');
    expect(gallery).toContain('<vr-button class="btn default"');
    expect(gallery).toContain('<vr-card class="card-demo interactive"');
    expect(gallery).toContain('<vr-alert class="alert warning"');
    expect(gallery).toContain('<vr-loader class="loader" variant.dots');
    expect(gallery).toContain('<vr-skeleton class="skeleton sk-card"');
    expect(gallery).toContain('<vr-separator class="separator-horizontal"');
    expect(gallery.match(/<vr-alert\b/g)?.length).toBe(4);
    expect(gallery.match(/<\/vr-alert>/g)?.length).toBe(4);

    for (const requiredCss of [
      '--bg: #09090b;',
      ':global(:root) {',
      ':global(body) {',
      '.sidebar {',
      '.topbar {',
      '.content {',
      '.btn.default {',
      '.card-demo.interactive {',
      '.badge.warning {',
      '.avatar.soft {',
      '.alert.warning {',
      '.loader {',
      '.skeleton {',
      '.separator-horizontal {',
    ]) {
      expect(galleryCss).toContain(requiredCss);
    }
    expect(prototypeCss).toContain('.spinner {');
    expect(galleryCss).not.toContain('.spinner {');
    expect(galleryCss).not.toContain('@keyframes shimmer');
  });
});
