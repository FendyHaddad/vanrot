import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const seoConfigControlPlaneArticle = {
  "key": "seoConfigControlPlane",
  "section": "framework",
  "path": "/docs/seo/config-control-plane",
  "label": "Config Control Plane",
  "title": "SEO Config Control Plane",
  "summary": "vanrot.config.ts owns SEO defaults so apps do not spread package settings across many files.",
  "status": "production-ready-through-phase-27",
  "sections": [
    {
      "id": "single-config-home",
      "title": "Single config home",
      "body": "The seo block in vanrot.config.ts owns siteUrl, defaults (title, description, canonical, image), social, robots directives, sitemap routes, structured data, and diagnostics mode. Package setup upserts this one block instead of creating a separate SEO settings file.",
      "points": [
        "defaults seeds the bottom of the metadata ladder for every page.",
        "robots.directives and sitemap.routes drive the generated crawl artifacts.",
        "diagnostics.mode chooses how strict vr doctor is about SEO config."
      ],
      "code": {
        "title": "vanrot.config.ts seo block",
        "code": "export default defineConfig({\n  seo: {\n    siteUrl: 'https://vanrot.dev',\n    defaults: { title: 'Vanrot', description: 'Signal-based UI framework.' },\n    social: { siteName: 'Vanrot', twitterHandle: '@vanrot' },\n    sitemap: { enabled: true, routes: [{ path: '/', priority: 1 }] },\n    robots: { directives: [{ userAgent: '*', allow: ['/'] }] },\n  },\n});"
      }
    },
    {
      "id": "site-url-later",
      "title": "Set siteUrl later",
      "body": "siteUrl can be omitted while a production URL is unknown. Syntax is still validated before launch, so malformed diagnostics mode, sitemap route config, robots directives, social image metadata, and default titles are caught early. Crawl artifacts and canonical URLs simply wait until siteUrl is filled in."
    }
  ]
} as const;

const sectionLinks = seoConfigControlPlaneArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class ConfigControlPlanePage {
  title(): string {
    return seoConfigControlPlaneArticle.title;
  }

  summary(): string {
    return seoConfigControlPlaneArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = seoConfigControlPlaneArticle.sections[0].body;
  section1Body = seoConfigControlPlaneArticle.sections[1].body;
  section0Points = seoConfigControlPlaneArticle.sections[0].points ?? [];
  section0Code = seoConfigControlPlaneArticle.sections[0].code?.code ?? '';
}
