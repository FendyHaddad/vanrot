import { createRoutes, defineRoutes } from '@vanrot/router';
import { DocsLayout } from './layouts/docs/docs.layout.ts';
import { ComponentAlertPage } from './pages/components/component-alert.page.ts';
import { ComponentArticlePage } from './pages/components/component-article.page.ts';
import { ComponentAvatarPage } from './pages/components/component-avatar.page.ts';
import { ComponentBadgePage } from './pages/components/component-badge.page.ts';
import { ComponentBreadcrumbPage } from './pages/components/component-breadcrumb.page.ts';
import { ComponentButtonPage } from './pages/components/component-button.page.ts';
import { ComponentCardPage } from './pages/components/component-card.page.ts';
import { ComponentContainerPage } from './pages/components/component-container.page.ts';
import { ComponentFooterPage } from './pages/components/component-footer.page.ts';
import { ComponentGalleryPage } from './pages/components/component-gallery.page.ts';
import { ComponentGridPage } from './pages/components/component-grid.page.ts';
import { ComponentHeaderPage } from './pages/components/component-header.page.ts';
import { ComponentImgPage } from './pages/components/component-img.page.ts';
import { ComponentLayoutPage } from './pages/components/component-layout.page.ts';
import { ComponentLoaderPage } from './pages/components/component-loader.page.ts';
import { ComponentNavPage } from './pages/components/component-nav.page.ts';
import { ComponentSectionPage } from './pages/components/component-section.page.ts';
import { ComponentSeparatorPage } from './pages/components/component-separator.page.ts';
import { ComponentSidebarPage } from './pages/components/component-sidebar.page.ts';
import { ComponentSkeletonPage } from './pages/components/component-skeleton.page.ts';
import { ComponentSrcPage } from './pages/components/component-src.page.ts';
import { ComponentStackPage } from './pages/components/component-stack.page.ts';
import { DocsArticlePage } from './pages/docs/docs-article.page.ts';
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
  componentAlerts: componentDocPath.alert,
  componentAvatars: componentDocPath.avatar,
  componentBadges: componentDocPath.badge,
  componentBreadcrumbs: componentDocPath.breadcrumb,
  componentButtons: componentDocPath.button,
  componentCards: componentDocPath.card,
  componentContainers: componentDocPath.container,
  componentFooters: componentDocPath.footer,
  componentGrids: componentDocPath.grid,
  componentHeaders: componentDocPath.header,
  componentImages: componentDocPath.img,
  componentLayouts: componentDocPath.layout,
  componentLoaders: componentDocPath.loader,
  componentNavigation: componentDocPath.nav,
  componentSections: componentDocPath.section,
  componentSeparators: componentDocPath.separator,
  componentSidebars: componentDocPath.sidebar,
  componentSkeletons: componentDocPath.skeleton,
  componentSources: componentDocPath.src,
  componentStacks: componentDocPath.stack,
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
  label: 'Components',
  ...siteDocument('Components', 'Vanrot UI component gallery and documentation.'),
  page: ComponentGalleryPage,
  ...componentRoutePerformance(),
  nav: routes.nav.primary(),
  breadcrumb: routes.breadcrumb.root(),
});

const docs = routes.layout({
  path: routePath.docs,
  label: 'Docs',
  ...siteDocument('Docs', 'Vanrot framework guides, package references, and conventions.'),
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

const componentStacks = routes.page({
  path: routePath.componentStacks,
  label: 'Stack',
  ...componentDocument('Stack'),
  page: ComponentStackPage,
  ...componentRoutePerformance(),
  nav: routes.nav.hidden(),
  breadcrumb: routes.breadcrumb.root(),
});

const docsInstallation = articlePage(siteArticleKey.installation);
const docsProjectStructure = articlePage(siteArticleKey.projectStructure);
const docsRuntime = articlePage(siteArticleKey.runtime);
const docsCompiler = articlePage(siteArticleKey.compiler);
const docsVitePlugin = articlePage(siteArticleKey.vitePlugin);
const docsCli = articlePage(siteArticleKey.cli);
const docsConfiguration = articlePage(siteArticleKey.configuration);
const docsRouting = articlePage(siteArticleKey.routing);
const docsUi = articlePage(siteArticleKey.uiOctober);
const docsTheming = articlePage(siteArticleKey.theming);
const docsVanrotstyles = articlePage(siteArticleKey.vanrotstyles);
const docsTesting = articlePage(siteArticleKey.testing);
const docsExamples = articlePage(siteArticleKey.examples);
const docsConventions = articlePage(siteArticleKey.conventions);

const reference = routes.page({
  path: routePath.reference,
  label: getSiteArticle(siteArticleKey.referenceStatus).label,
  ...articleDocument(siteArticleKey.referenceStatus),
  page: ReferencePage,
  nav: routes.nav.primary(),
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
const uiStack = componentPage('stack', 'Stack');
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
  componentButtons,
  componentCards,
  componentBadges,
  componentAvatars,
  componentAlerts,
  componentBreadcrumbs,
  componentContainers,
  componentFooters,
  componentGrids,
  componentHeaders,
  componentImages,
  componentLayouts,
  componentLoaders,
  componentNavigation,
  componentSections,
  componentSkeletons,
  componentSeparators,
  componentSidebars,
  componentSources,
  componentStacks,
  docsIntroduction,
  docsInstallation,
  docsProjectStructure,
  docsRuntime,
  docsCompiler,
  docsVitePlugin,
  docsCli,
  docsConfiguration,
  docsRouting,
  docsUi,
  docsTheming,
  docsVanrotstyles,
  docsTesting,
  docsExamples,
  docsConventions,
  reference,
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
  uiStack,
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
