import { createRoutes, defineRoutes } from '@vanrot/router';
import { DocsLayout } from './layouts/docs/docs.layout.ts';
import { ComponentAlertPage } from './pages/components/component-alert.page.ts';
import { ComponentArticlePage } from './pages/components/component-article.page.ts';
import { ComponentAvatarPage } from './pages/components/component-avatar.page.ts';
import { ComponentBadgePage } from './pages/components/component-badge.page.ts';
import { ComponentButtonPage } from './pages/components/component-button.page.ts';
import { ComponentCardPage } from './pages/components/component-card.page.ts';
import { ComponentGalleryPage } from './pages/components/component-gallery.page.ts';
import { ComponentLoaderPage } from './pages/components/component-loader.page.ts';
import { ComponentSeparatorPage } from './pages/components/component-separator.page.ts';
import { ComponentSkeletonPage } from './pages/components/component-skeleton.page.ts';
import { DocsArticlePage } from './pages/docs/docs-article.page.ts';
import { HomePage } from './pages/home/home.page.ts';
import { ReferencePage } from './pages/reference/reference.page.ts';
import {
  getSiteArticle,
  siteArticleKey,
  type SiteArticleKey,
} from './docs/site-data.ts';

const routes = createRoutes();
const docsBasePath = '/docs';
const routePath = {
  home: '/',
  docs: docsBasePath,
  components: '/docs/components',
  componentButtons: '/docs/components/buttons',
  componentCards: '/docs/components/cards',
  componentBadges: '/docs/components/badges',
  componentAvatars: '/docs/components/avatars',
  componentAlerts: '/docs/components/alerts',
  componentLoaders: '/docs/components/loaders',
  componentSkeletons: '/docs/components/skeletons',
  componentSeparators: '/docs/components/separators',
  reference: '/reference',
} as const;

const home = routes.page({
  path: routePath.home,
  label: 'Vanrot',
  page: HomePage,
  nav: routes.nav.primary(),
  breadcrumb: routes.breadcrumb.root(),
});

const components = routes.page({
  path: routePath.components,
  label: 'Components',
  page: ComponentGalleryPage,
  nav: routes.nav.primary(),
  breadcrumb: routes.breadcrumb.root(),
});

const docs = routes.layout({
  path: routePath.docs,
  label: 'Docs',
  layout: DocsLayout,
  nav: routes.nav.primary(),
  breadcrumb: routes.breadcrumb.root(),
});

const docsIntroduction = docs.page({
  path: articleChildPath(siteArticleKey.introduction),
  label: getSiteArticle(siteArticleKey.introduction).label,
  page: DocsArticlePage,
  nav: routes.nav.hidden(),
  breadcrumb: routes.breadcrumb.parent(docs),
});

const componentButtons = routes.page({
  path: routePath.componentButtons,
  label: 'Button',
  page: ComponentButtonPage,
  nav: routes.nav.hidden(),
  breadcrumb: routes.breadcrumb.root(),
});

const componentCards = routes.page({
  path: routePath.componentCards,
  label: 'Card',
  page: ComponentCardPage,
  nav: routes.nav.hidden(),
  breadcrumb: routes.breadcrumb.root(),
});

const componentBadges = routes.page({
  path: routePath.componentBadges,
  label: 'Badge',
  page: ComponentBadgePage,
  nav: routes.nav.hidden(),
  breadcrumb: routes.breadcrumb.root(),
});

const componentAvatars = routes.page({
  path: routePath.componentAvatars,
  label: 'Avatar',
  page: ComponentAvatarPage,
  nav: routes.nav.hidden(),
  breadcrumb: routes.breadcrumb.root(),
});

const componentAlerts = routes.page({
  path: routePath.componentAlerts,
  label: 'Alert',
  page: ComponentAlertPage,
  nav: routes.nav.hidden(),
  breadcrumb: routes.breadcrumb.root(),
});

const componentLoaders = routes.page({
  path: routePath.componentLoaders,
  label: 'Loader',
  page: ComponentLoaderPage,
  nav: routes.nav.hidden(),
  breadcrumb: routes.breadcrumb.root(),
});

const componentSkeletons = routes.page({
  path: routePath.componentSkeletons,
  label: 'Skeleton',
  page: ComponentSkeletonPage,
  nav: routes.nav.hidden(),
  breadcrumb: routes.breadcrumb.root(),
});

const componentSeparators = routes.page({
  path: routePath.componentSeparators,
  label: 'Separator',
  page: ComponentSeparatorPage,
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

export const route = defineRoutes({
  home,
  components,
  docs,
  componentButtons,
  componentCards,
  componentBadges,
  componentAvatars,
  componentAlerts,
  componentLoaders,
  componentSkeletons,
  componentSeparators,
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
});

function articlePage(key: SiteArticleKey) {
  const article = getSiteArticle(key);

  return docs.page({
    path: articleChildPath(key),
    label: article.label,
    page: DocsArticlePage,
    breadcrumb: routes.breadcrumb.parent(docs),
  });
}

function componentPage(primitive: string, label: string) {
  return docs.page({
    path: `ui/${primitive}`,
    label,
    page: ComponentArticlePage,
    breadcrumb: routes.breadcrumb.parent(docs),
  });
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
