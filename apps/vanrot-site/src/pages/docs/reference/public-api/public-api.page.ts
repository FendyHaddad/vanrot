import type { DocsSectionLink } from '../../shared/docs-content.ts';

export const publicApiArticle = {
  "key": "publicApi",
  "section": "reference",
  "path": "/docs/public-api",
  "label": "Public API",
  "title": "Public API Reference",
  "summary": "Read the documented public exports for each current Vanrot package and see which guide owns the behavior.",
  "status": "phase-24-active",
  "sections": [
    {
      "id": "export-coverage",
      "title": "Export Coverage",
      "body": "Every public export from package index files must have structured reference coverage. The verification script compares package source exports with the registry before Phase 24 can close."
    },
    {
      "id": "status-language",
      "title": "Status Language",
      "body": "Each export uses explicit status language such as production-ready, demo-capable, limited, deferred, or not-browser-facing. The docs explain capability without overstating unfinished work."
    },
    {
      "id": "docs-links",
      "title": "Docs Links",
      "body": "Each export points to the guide or reference route that explains it. This keeps the registry useful for humans and keeps Phase 25 free to build AI-readable output from clean data."
    }
  ]
} as const;

const sectionLinks = publicApiArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class PublicApiPage {
  title(): string {
    return publicApiArticle.title;
  }

  summary(): string {
    return publicApiArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = publicApiArticle.sections[0].body;
  section1Body = publicApiArticle.sections[1].body;
  section2Body = publicApiArticle.sections[2].body;
}
