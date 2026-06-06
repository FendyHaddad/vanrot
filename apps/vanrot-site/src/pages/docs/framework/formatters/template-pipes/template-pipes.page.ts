import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const formattersTemplatePipesArticle = {
  "key": "formattersTemplatePipes",
  "section": "framework",
  "path": "/docs/formatters/template-pipes",
  "label": "Template pipes",
  "title": "Template Pipes",
  "summary": "Pipe syntax uses readable interpolation calls such as {{ createdAt | date.monthDayYear }} and {{ row.description | truncate(20) }}.",
  "status": "production-ready",
  "sections": [
    {
      "id": "template-pipes",
      "title": "Syntax",
      "body": "Pipe syntax is available only inside interpolation. The compiler parses the base expression first, then applies pipe calls from left to right so each pipe receives the previous pipe result. Arguments use a JavaScript-call shape for readability and constants can replace strings when teams want cleaner templates.",
      "points": [
        "Use property variants for common presets such as date.monthDayYear or mask.malaysiaPhone.",
        "Use call arguments for values such as truncate(20), date('dd/MM/yyyy'), or currency('MYR').",
        "Allow string arguments for one-off formats and named constants for shared enterprise formats.",
        "Use chaining only when each step clearly consumes the previous output."
      ],
      "code": {
        "title": "Syntax shapes",
        "code": "{{ createdAt | date.monthDayYear }}\\n{{ createdAt | date('dd/MM/yyyy') }}\\n{{ total | number.thousands }}\\n{{ invoiceTotal | currency('MYR') }}\\n{{ description | fallback('No description') | truncate(80) }}"
      }
    }
  ]
} as const;

const sectionLinks = formattersTemplatePipesArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class TemplatePipesPage {
  title(): string {
    return formattersTemplatePipesArticle.title;
  }

  summary(): string {
    return formattersTemplatePipesArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = formattersTemplatePipesArticle.sections[0].body;
  section0Points = formattersTemplatePipesArticle.sections[0].points ?? [];
  section0Code = formattersTemplatePipesArticle.sections[0].code?.code ?? '';
}
