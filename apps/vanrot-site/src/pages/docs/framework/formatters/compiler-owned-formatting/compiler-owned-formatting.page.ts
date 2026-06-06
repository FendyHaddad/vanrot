import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const formattersCompilerOwnedArticle = {
  "key": "formattersCompilerOwned",
  "section": "framework",
  "path": "/docs/formatters/compiler-owned-formatting",
  "label": "Compiler-owned formatting",
  "title": "Compiler-Owned Formatting",
  "summary": "Template pipes are a compiler feature backed by @vanrot/formatters, not a runtime trick or template-side business-logic escape hatch.",
  "status": "production-ready",
  "sections": [
    {
      "id": "compiler-owned-formatting",
      "title": "Compiler boundary",
      "body": "A component template can request display-only formatting inside interpolation. The compiler validates the pipe name, arguments, variant, and source span, then generated output imports @vanrot/formatters only when the template actually uses pipe expressions.",
      "points": [
        "Use template pipes for display-only formatting inside interpolation.",
        "Keep data fetching, async work, mutation, validation decisions, and business workflows outside pipes.",
        "Use @vanrot/forms or form resources for asynchronous state, then pipe the resolved value.",
        "Keep @vanrot/runtime small by keeping formatter helpers in @vanrot/formatters."
      ],
      "code": {
        "title": "Template interpolation",
        "code": "<td>{{ row.amount | currency }}</td>\\n<td>{{ row.description | truncate(20) }}</td>\\n<td>{{ claim.status | claimStatus }}</td>"
      }
    }
  ]
} as const;

const sectionLinks = formattersCompilerOwnedArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class CompilerOwnedFormattingPage {
  title(): string {
    return formattersCompilerOwnedArticle.title;
  }

  summary(): string {
    return formattersCompilerOwnedArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = formattersCompilerOwnedArticle.sections[0].body;
  section0Points = formattersCompilerOwnedArticle.sections[0].points ?? [];
  section0Code = formattersCompilerOwnedArticle.sections[0].code?.code ?? '';
}
