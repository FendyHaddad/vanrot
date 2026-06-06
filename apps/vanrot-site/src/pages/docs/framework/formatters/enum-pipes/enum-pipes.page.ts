import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const formattersEnumPipesArticle = {
  "key": "formattersEnumPipes",
  "section": "framework",
  "path": "/docs/formatters/enum-pipes",
  "label": "Enum display pipes",
  "title": "Enum And Backend Value Display",
  "summary": "Enum-backed custom pipes convert backend codes into user-facing labels without leaking backend strings into templates.",
  "status": "production-ready",
  "sections": [
    {
      "id": "enum-display-pipes",
      "title": "Backend values to labels",
      "body": "Backend values often arrive as enum-like strings. A custom pipe can import the enum or constant map from a separate file, then use a switch or lookup table to return display labels. This keeps backend contracts explicit and templates readable.",
      "points": [
        "Use switch cases when labels need special handling or fallbacks.",
        "Use enum or constant imports when the backend contract already has a source of truth.",
        "Return a safe fallback for unknown backend values.",
        "Keep translation or locale-aware decisions in the pipe context when needed."
      ],
      "code": {
        "title": "Enum pipe",
        "code": "export const claimStatus = definePipe((status) => {\\n  switch (status) {\\n    case 'APPROVED':\\n      return 'Approved';\\n    case 'REJECTED':\\n      return 'Rejected';\\n    case 'PENDING_REVIEW':\\n      return 'Pending review';\\n    default:\\n      return 'Unknown';\\n  }\\n});"
      }
    }
  ]
} as const;

const sectionLinks = formattersEnumPipesArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class EnumPipesPage {
  title(): string {
    return formattersEnumPipesArticle.title;
  }

  summary(): string {
    return formattersEnumPipesArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = formattersEnumPipesArticle.sections[0].body;
  section0Points = formattersEnumPipesArticle.sections[0].points ?? [];
  section0Code = formattersEnumPipesArticle.sections[0].code?.code ?? '';
}
