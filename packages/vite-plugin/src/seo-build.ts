import {
  defineRobotsPolicy,
  defineSitemapRoute,
  generateRobotsTxt,
  generateSitemapXml,
} from '@vanrot/seo';
import type { VanrotSeoConfig } from '@vanrot/config';

export interface SeoBuildArtifact {
  fileName: string;
  source: string;
}

export async function buildSeoArtifacts(seo: VanrotSeoConfig | undefined): Promise<SeoBuildArtifact[]> {
  if (!seo?.siteUrl) {
    return [];
  }

  const artifacts: SeoBuildArtifact[] = [];
  const routes = seo.sitemap?.routes ?? [];
  const sitemapEnabled = seo.sitemap?.enabled ?? routes.length > 0;

  if (sitemapEnabled) {
    artifacts.push({
      fileName: 'sitemap.xml',
      source: generateSitemapXml({
        siteUrl: seo.siteUrl,
        routes: routes.map((route) => defineSitemapRoute(route)),
      }),
    });
  }

  artifacts.push({
    fileName: 'robots.txt',
    source: generateRobotsTxt(
      defineRobotsPolicy({
        directives: seo.robots?.directives ?? [],
        sitemap: resolveSitemapUrl(seo.siteUrl),
      }),
    ),
  });

  return artifacts;
}

function resolveSitemapUrl(siteUrl: string): string {
  return new URL('/sitemap.xml', siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`).toString();
}
