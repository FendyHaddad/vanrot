import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const formattersContextArticle = {
  "key": "formattersContext",
  "section": "framework",
  "path": "/docs/formatters/context",
  "label": "Formatting context",
  "title": "Formatting Context",
  "summary": "Pipe context provides locale, time zone, numbering system, currency defaults, message catalog access, and safe app-defined metadata.",
  "status": "production-ready",
  "sections": [
    {
      "id": "formatting-context",
      "title": "Context-aware formatting",
      "body": "Some formatting needs app context. Built-ins and custom pipes can read locale, time zone, numbering system, currency defaults, message catalogs, and safe metadata from context instead of hard-coding those values in templates.",
      "points": [
        "Use context for locale, time zone, default currency, and message catalog access.",
        "Keep context serializable and safe for SSR and hydration.",
        "Do not use context to hide business workflow decisions inside pipes.",
        "Let tests pass explicit context so formatter behavior is deterministic."
      ],
      "code": {
        "title": "Context-aware pipe",
        "code": "export const money = definePipe((value, ctx) => {\\n  return new Intl.NumberFormat(ctx.locale, {\\n    style: 'currency',\\n    currency: ctx.currency,\\n  }).format(value);\\n});"
      }
    }
  ]
} as const;

const sectionLinks = formattersContextArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class ContextPage {
  title(): string {
    return formattersContextArticle.title;
  }

  summary(): string {
    return formattersContextArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = formattersContextArticle.sections[0].body;
  section0Points = formattersContextArticle.sections[0].points ?? [];
  section0Code = formattersContextArticle.sections[0].code?.code ?? '';
}
