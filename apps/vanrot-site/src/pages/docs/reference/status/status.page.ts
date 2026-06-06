import type { DocsSectionLink } from '../../shared/docs-content.ts';

export const referenceStatusArticle = {
  "key": "referenceStatus",
  "section": "reference",
  "path": "/docs/status",
  "label": "Status",
  "title": "Reference Status",
  "summary": "The reference section shows what is available now, demo-capable, in progress, planned, or deferred.",
  "status": "available-now",
  "sections": [
    {
      "id": "phases",
      "title": "Production Phases",
      "body": "Phases 11 through 15 are complete. Phase 16A and 16B are complete slices. Phase 16C creates this learning site base."
    },
    {
      "id": "audit",
      "title": "Final Audit",
      "body": "Phase 24 remains the final documentation and public web presence audit after the feature surface stabilizes."
    }
  ]
} as const;

const sectionLinks = referenceStatusArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class StatusPage {
  title(): string {
    return referenceStatusArticle.title;
  }

  summary(): string {
    return referenceStatusArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = referenceStatusArticle.sections[0].body;
  section1Body = referenceStatusArticle.sections[1].body;
}
