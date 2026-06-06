import type { DocsSectionLink } from '../../shared/docs-content.ts';

export const seoArticle = {
  "key": "seo",
  "section": "framework",
  "path": "/docs/seo",
  "label": "SEO",
  "title": "SEO",
  "summary": "@vanrot/seo is an optional first-party package for metadata, canonical URLs, structured data, sitemaps, robots.txt, and doctor diagnostics without adding runtime bloat.",
  "status": "production-ready-through-phase-27",
  "sections": [
    {
      "id": "package-boundary",
      "title": "Package boundary",
      "body": "@vanrot/seo stays outside @vanrot/runtime. Apps install it during vr create or later with vr add seo, and the core runtime size budget does not change when a project chooses SEO."
    },
    {
      "id": "metadata-ladder",
      "title": "Metadata ladder",
      "body": "Vanrot resolves SEO through one ladder: vanrot.config.ts global defaults, route SEO overrides, page SEO overrides, then dynamic/async SEO for final values. The last layer wins for title, description, canonical, social metadata, and structured data."
    },
    {
      "id": "config-control-plane",
      "title": "Config control plane",
      "body": "vanrot.config.ts owns the rich seo block so packages do not scatter settings across many files. siteUrl can be omitted while a production URL is unknown, but syntax such as diagnostics mode, robots directives, sitemap routes, and default titles is still validated."
    },
    {
      "id": "create-and-add-flows",
      "title": "Create and add flows",
      "body": "vr create supports --seo, --no-seo, and --seo-site-url for non-interactive setup. When a project opted out earlier, vr add seo installs @vanrot/seo, upserts the seo config block, writes src/app/seo.ts, and suggests running vr doctor."
    },
    {
      "id": "doctor-and-build-output",
      "title": "Doctor and build output",
      "body": "vr doctor reports SEO package/config drift plus config diagnostics. Missing siteUrl is a warning so early projects keep moving; malformed site URLs, invalid sitemap route syntax, unsupported robots directives, and bad defaults are errors. Vite emits sitemap.xml and robots.txt once siteUrl is configured."
    },
    {
      "id": "social-images",
      "title": "Social images",
      "body": "@vanrot/seo validates social preview image URLs and alt text, but it does not create preview artwork. Keep assets in the app, reference them from the SEO utility or config, and let doctor catch broken URLs or missing alt text."
    }
  ]
} as const;

const sectionLinks = seoArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class SeoPage {
  title(): string {
    return seoArticle.title;
  }

  summary(): string {
    return seoArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = seoArticle.sections[0].body;
  section1Body = seoArticle.sections[1].body;
  section2Body = seoArticle.sections[2].body;
  section3Body = seoArticle.sections[3].body;
  section4Body = seoArticle.sections[4].body;
  section5Body = seoArticle.sections[5].body;
}
