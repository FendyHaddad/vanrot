import { getCurrentMatch } from '@vanrot/router';
import {
  getSiteArticle,
  siteArticleKey,
  siteArticles,
  type SiteArticle,
} from '../../docs/site-data.ts';

const routeKeyToArticleKey = {
  docsIntroduction: siteArticleKey.introduction,
  docsInstallation: siteArticleKey.installation,
  docsProjectStructure: siteArticleKey.projectStructure,
  docsRuntime: siteArticleKey.runtime,
  docsCompiler: siteArticleKey.compiler,
  docsVitePlugin: siteArticleKey.vitePlugin,
  docsCli: siteArticleKey.cli,
  docsConfiguration: siteArticleKey.configuration,
  docsRouting: siteArticleKey.routing,
  docsUi: siteArticleKey.uiOctober,
  docsTheming: siteArticleKey.theming,
  docsVanrotstyles: siteArticleKey.vanrotstyles,
  docsTesting: siteArticleKey.testing,
  docsExamples: siteArticleKey.examples,
  docsConventions: siteArticleKey.conventions,
  docsChangelog: siteArticleKey.changelog,
} as const;

type ArticleRouteKey = keyof typeof routeKeyToArticleKey;

export class DocsArticlePage {
  article(): SiteArticle {
    const routeKey = getCurrentMatch()?.route.key;

    if (isArticleRouteKey(routeKey)) {
      return getSiteArticle(routeKeyToArticleKey[routeKey]);
    }

    return siteArticles.introduction;
  }
}

function isArticleRouteKey(value: string | undefined): value is ArticleRouteKey {
  return value !== undefined && value in routeKeyToArticleKey;
}
