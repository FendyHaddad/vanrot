import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const seoSocialImagesArticle = {
  "key": "seoSocialImages",
  "section": "framework",
  "path": "/docs/seo/social-images",
  "label": "Social Images",
  "title": "SEO Social Images",
  "summary": "@vanrot/seo validates social preview metadata while leaving artwork creation to the app.",
  "status": "production-ready-through-phase-27",
  "sections": [
    {
      "id": "validation-only",
      "title": "Validation only",
      "body": "defineOpenGraph and defineTwitterCard shape social metadata, and validateSeoImages checks preview image URLs, dimensions, and alt text. The package does not create preview artwork, because app teams should own brand imagery and visual review.",
      "points": [
        "validateSeoImages returns diagnostics for missing alt text or bad URLs.",
        "defineOpenGraph and defineTwitterCard return frozen, typed metadata.",
        "Social defaults (siteName, defaultImage, twitterHandle) live in the seo config."
      ],
      "code": {
        "title": "Define social metadata",
        "code": "import { defineOpenGraph, validateSeoImages } from '@vanrot/seo';\n\nconst openGraph = defineOpenGraph({\n  title: 'Vanrot',\n  images: [{ url: '/og/home.png', alt: 'Vanrot home' }],\n});\nconst diagnostics = validateSeoImages(openGraph.images);"
      }
    },
    {
      "id": "where-assets-live",
      "title": "Where assets live",
      "body": "Keep social preview assets in the app, reference them from src/app/seo.ts or vanrot.config.ts social defaults, and let vr doctor catch broken URLs or missing alt text before release."
    }
  ]
} as const;

const sectionLinks = seoSocialImagesArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class SocialImagesPage {
  title(): string {
    return seoSocialImagesArticle.title;
  }

  summary(): string {
    return seoSocialImagesArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = seoSocialImagesArticle.sections[0].body;
  section1Body = seoSocialImagesArticle.sections[1].body;
  section0Points = seoSocialImagesArticle.sections[0].points ?? [];
  section0Code = seoSocialImagesArticle.sections[0].code?.code ?? '';
}
