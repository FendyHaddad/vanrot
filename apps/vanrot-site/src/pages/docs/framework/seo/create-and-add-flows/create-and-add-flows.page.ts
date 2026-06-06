import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const seoCreateAndAddFlowsArticle = {
  "key": "seoCreateAndAddFlows",
  "section": "framework",
  "path": "/docs/seo/create-and-add-flows",
  "label": "Create and Add Flows",
  "title": "SEO Create and Add Flows",
  "summary": "Projects can opt into SEO during creation or add the full starter surface later.",
  "status": "production-ready-through-phase-27",
  "sections": [
    {
      "id": "create-flags",
      "title": "Create flags",
      "body": "vr create supports --seo, --no-seo, and --seo-site-url for non-interactive setup. When SEO is selected, the generated app includes @vanrot/seo, a vanrot.config.ts seo block, and src/app/seo.ts utilities.",
      "code": {
        "title": "Create with SEO",
        "code": "vr create my-app \\\n  --seo \\\n  --seo-site-url https://vanrot.dev"
      }
    },
    {
      "id": "add-later",
      "title": "Add later",
      "body": "When a project opted out during creation, vr add seo brings the full starter surface up to parity with a created-with-SEO app.",
      "points": [
        "Installs @vanrot/seo into the app.",
        "Upserts the seo block in vanrot.config.ts without clobbering other config.",
        "Writes src/app/seo.ts and suggests vr doctor to catch drift immediately."
      ],
      "code": {
        "title": "Add later",
        "code": "vr add seo\nvr doctor"
      }
    }
  ]
} as const;

const sectionLinks = seoCreateAndAddFlowsArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class CreateAndAddFlowsPage {
  title(): string {
    return seoCreateAndAddFlowsArticle.title;
  }

  summary(): string {
    return seoCreateAndAddFlowsArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = seoCreateAndAddFlowsArticle.sections[0].body;
  section1Body = seoCreateAndAddFlowsArticle.sections[1].body;
  section1Points = seoCreateAndAddFlowsArticle.sections[1].points ?? [];
  section0Code = seoCreateAndAddFlowsArticle.sections[0].code?.code ?? '';
  section1Code = seoCreateAndAddFlowsArticle.sections[1].code?.code ?? '';
}
