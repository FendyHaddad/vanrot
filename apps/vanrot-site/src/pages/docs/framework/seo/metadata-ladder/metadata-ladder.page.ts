import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const seoMetadataLadderArticle = {
  "key": "seoMetadataLadder",
  "section": "framework",
  "path": "/docs/seo/metadata-ladder",
  "label": "Metadata Ladder",
  "title": "SEO Metadata Ladder",
  "summary": "The SEO ladder defines where metadata comes from and which layer wins when values overlap.",
  "status": "production-ready-through-phase-27",
  "sections": [
    {
      "id": "resolution-order",
      "title": "Resolution order",
      "body": "Vanrot merges metadata through a fixed ladder, and the last layer that sets a field wins for title, description, canonical, social metadata, and structured data. mergeSeoMetadata applies the layers left to right.",
      "points": [
        "Layer 1: vanrot.config.ts seo.defaults global values.",
        "Layer 2: route SEO override defined on the route table.",
        "Layer 3: page SEO override exported from the page module.",
        "Layer 4: dynamic/async SEO resolved with request-aware context."
      ],
      "code": {
        "title": "Merge layers",
        "code": "import { defineSeo, mergeSeoMetadata } from '@vanrot/seo';\n\nconst pageSeo = defineSeo({ title: 'Pricing', description: 'Plans and pricing.' });\nconst resolved = mergeSeoMetadata(configDefaults, routeSeo, pageSeo);"
      }
    },
    {
      "id": "dynamic-metadata",
      "title": "Dynamic metadata",
      "body": "Reach for defineDynamicSeo only when metadata depends on route params, loaded content, or request-time state. It receives a context and returns metadata that merges as the final ladder layer. Static pages should stay static so app metadata remains simple and predictable.",
      "code": {
        "title": "Async SEO",
        "code": "import { defineDynamicSeo } from '@vanrot/seo';\n\nexport const seo = defineDynamicSeo(async ({ params }) => {\n  const post = await loadPost(params.slug);\n  return { title: post.title, description: post.excerpt };\n});"
      }
    },
    {
      "id": "canonical",
      "title": "Canonical resolution",
      "body": "resolveCanonicalUrl joins siteUrl with the current path so canonical tags stay absolute and consistent. When siteUrl is not yet set it returns undefined, so canonical links simply stay off until the production origin is known."
    }
  ]
} as const;

const sectionLinks = seoMetadataLadderArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class MetadataLadderPage {
  title(): string {
    return seoMetadataLadderArticle.title;
  }

  summary(): string {
    return seoMetadataLadderArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = seoMetadataLadderArticle.sections[0].body;
  section1Body = seoMetadataLadderArticle.sections[1].body;
  section2Body = seoMetadataLadderArticle.sections[2].body;
  section0Points = seoMetadataLadderArticle.sections[0].points ?? [];
  section0Code = seoMetadataLadderArticle.sections[0].code?.code ?? '';
  section1Code = seoMetadataLadderArticle.sections[1].code?.code ?? '';
}
