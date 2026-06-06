import type { DocsSectionLink } from '../../shared/docs-content.ts';

export const uiOctoberArticle = {
  "key": "uiOctober",
  "section": "ui",
  "path": "/docs/ui",
  "label": "October",
  "title": "UI October",
  "summary": "October is Vanrot's dark-first, light-capable UI foundation with source-owned primitives, tokens, and vanrotstyles.",
  "status": "in-progress-through-phase-16b",
  "sections": [
    {
      "id": "ownership",
      "title": "Source Ownership",
      "body": "Vanrot UI follows a developer-owned model. Primitives are readable source files and compiler-lowered semantic tags, not opaque black boxes."
    },
    {
      "id": "current-primitives",
      "title": "Current Primitives",
      "body": "Phase 16B includes button, card, badge, avatar, alert, loader, skeleton, and separator."
    }
  ]
} as const;

const sectionLinks = uiOctoberArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class UiPage {
  title(): string {
    return uiOctoberArticle.title;
  }

  summary(): string {
    return uiOctoberArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = uiOctoberArticle.sections[0].body;
  section1Body = uiOctoberArticle.sections[1].body;
}
