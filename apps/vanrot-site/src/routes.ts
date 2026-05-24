import { createRoutes, defineRoutes } from '@vanrot/router';
import { DocsLayout } from './layouts/docs/docs.layout.ts';
import { ComponentArticlePage } from './pages/components/component-article.page.ts';
import { ComponentGalleryPage } from './pages/components/component-gallery.page.ts';
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
  components: 'components',
  reference: '/reference',
} as const;

const home = routes.page({
  path: routePath.home,
  label: 'Vanrot',
  page: HomePage,
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

const components = docs.page({
  path: routePath.components,
  label: 'Components',
  page: ComponentGalleryPage,
  nav: routes.nav.primary(),
  breadcrumb: routes.breadcrumb.parent(docs),
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
  docs,
  components,
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

  if (path === docsBasePath) {
    return '';
  }

  return path.slice(docsBasePath.length + 1);
}
