import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const seoPackageBoundaryArticle = {
  "key": "seoPackageBoundary",
  "section": "framework",
  "path": "/docs/seo/package-boundary",
  "label": "Package Boundary",
  "title": "SEO Package Boundary",
  "summary": "@vanrot/seo is an optional package for metadata and crawl artifacts, not part of the core runtime.",
  "status": "production-ready-through-phase-27",
  "sections": [
    {
      "id": "runtime-boundary",
      "title": "Runtime boundary",
      "body": "@vanrot/seo stays outside @vanrot/runtime. Apps can add SEO during vr create or later with vr add seo, and projects that do not need metadata helpers do not pay for them in the core browser runtime, so the runtime size budget never moves when a project chooses SEO."
    },
    {
      "id": "owned-surfaces",
      "title": "Owned surfaces",
      "body": "@vanrot/seo owns metadata definition and merging, canonical URL resolution, structured data, social metadata validation, sitemap XML, robots.txt, explicit head updates, and SEO diagnostics.",
      "points": [
        "Metadata: defineSeo, defineDynamicSeo, mergeSeoMetadata, resolveCanonicalUrl.",
        "Head + crawl: applySeoToHead, generateSitemapXml, generateRobotsTxt.",
        "Social + data: defineOpenGraph, defineTwitterCard, validateSeoImages, structured data helpers."
      ]
    },
    {
      "id": "where-it-plugs-in",
      "title": "Where it plugs in",
      "body": "The package is consumed in three places: vanrot.config.ts holds the seo defaults block, src/app/seo.ts holds app-level metadata helpers, and the Vite plugin reads config to emit crawl artifacts at build. Each surface stays optional and is wired only when SEO is enabled.",
      "code": {
        "title": "Import surface",
        "code": "import {\n  applySeoToHead,\n  defineSeo,\n  mergeSeoMetadata,\n} from '@vanrot/seo';"
      }
    }
  ]
} as const;

const sectionLinks = seoPackageBoundaryArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class PackageBoundaryPage {
  title(): string {
    return seoPackageBoundaryArticle.title;
  }

  summary(): string {
    return seoPackageBoundaryArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = seoPackageBoundaryArticle.sections[0].body;
  section1Body = seoPackageBoundaryArticle.sections[1].body;
  section2Body = seoPackageBoundaryArticle.sections[2].body;
  section1Points = seoPackageBoundaryArticle.sections[1].points ?? [];
  section2Code = seoPackageBoundaryArticle.sections[2].code?.code ?? '';
}
