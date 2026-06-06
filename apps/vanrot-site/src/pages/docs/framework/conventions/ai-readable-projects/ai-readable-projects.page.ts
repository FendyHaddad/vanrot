import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const conventionsAiReadableArticle = {
  "key": "conventionsAiReadable",
  "section": "framework",
  "path": "/docs/conventions/ai-readable-projects",
  "label": "AI-readable Projects",
  "title": "Conventions AI-readable Projects",
  "summary": "AI-readable project conventions help maps, docs bundles, devtools, and external AI consumers recover accurate framework context.",
  "status": "available-now",
  "sections": [
    {
      "id": "ai-readability",
      "title": "AI readability",
      "body": "AI-readable projects are just well-structured projects. Clear role suffixes, named routes, scoped CSS, typed config, rich docs, and fresh project maps give AI tools accurate context without a special parallel architecture.",
      "points": [
        "Keep canonical docs richer than generated summaries.",
        "Keep project maps fresh after structural changes.",
        "Keep route and command strings referenced from named sources."
      ],
      "code": {
        "title": "Refresh AI context",
        "code": "vr map\\nvr init-ai\\nvr ai"
      }
    },
    {
      "id": "canonical-docs",
      "title": "Canonical docs",
      "body": "AI bundles should consume canonical docs, package exports, and project intelligence. They should not become a second place where framework behavior is explained differently from the site.",
      "points": [
        "Update site-data.json before regenerating AI docs.",
        "Run AI docs generation after public docs changes.",
        "Check manifest fingerprints when generated docs look stale."
      ]
    },
    {
      "id": "readability-debugging",
      "title": "Readability debugging",
      "body": "If AI tools misunderstand a project, inspect the same things a developer would inspect: role suffixes, route refs, config domains, docs pages, and project map freshness. Fix the source before patching generated text.",
      "points": [
        "Check whether role files use expected suffixes.",
        "Check whether route labels live in the route table.",
        "Check whether docs and AI bundles were regenerated after changes."
      ]
    }
  ]
} as const;

const sectionLinks = conventionsAiReadableArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class AiReadableProjectsPage {
  title(): string {
    return conventionsAiReadableArticle.title;
  }

  summary(): string {
    return conventionsAiReadableArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = conventionsAiReadableArticle.sections[0].body;
  section1Body = conventionsAiReadableArticle.sections[1].body;
  section2Body = conventionsAiReadableArticle.sections[2].body;
  section0Points = conventionsAiReadableArticle.sections[0].points ?? [];
  section1Points = conventionsAiReadableArticle.sections[1].points ?? [];
  section2Points = conventionsAiReadableArticle.sections[2].points ?? [];
  section0Code = conventionsAiReadableArticle.sections[0].code?.code ?? '';
}
