import type { DocsSectionLink } from '../../shared/docs-content.ts';

export const introductionArticle = {
  "key": "introduction",
  "section": "getStarted",
  "path": "/docs",
  "label": "Introduction",
  "title": "Vanrot",
  "summary": "Vanrot is a small frontend framework with compiler-known templates, signals, route ownership, source-owned UI, and a documentation-first development path.",
  "status": "available-now",
  "sections": [
    {
      "id": "what-it-is",
      "title": "What Vanrot Gives You",
      "body": "Vanrot combines a small runtime, compiler role files, a Vite plugin, a typed router, a guided CLI, and source-owned UI primitives."
    },
    {
      "id": "what-exists-now",
      "title": "What Exists Now",
      "body": "The implemented surface includes runtime signals, compiled components and pages, scoped CSS, config loading, CLI commands, production router behavior, October tokens, vanrotstyles, and Phase 16B UI primitives."
    }
  ]
} as const;

const sectionLinks = introductionArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class IntroductionPage {
  title(): string {
    return introductionArticle.title;
  }

  summary(): string {
    return introductionArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = introductionArticle.sections[0].body;
  section1Body = introductionArticle.sections[1].body;
}
