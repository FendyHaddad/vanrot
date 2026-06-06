import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const formattersBuiltInSuiteArticle = {
  "key": "formattersBuiltInSuite",
  "section": "framework",
  "path": "/docs/formatters/built-in-suite",
  "label": "Built-in pipe suite",
  "title": "Built-In Pipe Suite",
  "summary": "@vanrot/formatters ships the common display helpers most screens need before users define custom pipes.",
  "status": "production-ready",
  "sections": [
    {
      "id": "built-in-suite",
      "title": "Included pipes",
      "body": "The built-in suite should cover the high-frequency display work in dashboards, tables, forms, and admin screens. Users can still define custom pipes for domain values, but they should not need to build date, number, currency, fallback, mask, plural, or text helpers from scratch.",
      "points": [
        "Text: upper, lower, title, sentence, trim, fallback, truncate, initials, and mask.",
        "Date and time: date, time, dateTime, relativeTime, duration, and named date presets.",
        "Numbers: number, integer, decimal, thousands, compact, percent, fileSize, and currency.",
        "Messages: plural, count, list, message format, and form-message helpers."
      ],
      "code": {
        "title": "Built-ins",
        "code": "{{ user.name | title }}\\n{{ uploadedBytes | fileSize }}\\n{{ selectedCount | plural('item', 'items') }}\\n{{ phone | mask.malaysiaPhone }}"
      }
    }
  ]
} as const;

const sectionLinks = formattersBuiltInSuiteArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class BuiltInSuitePage {
  title(): string {
    return formattersBuiltInSuiteArticle.title;
  }

  summary(): string {
    return formattersBuiltInSuiteArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = formattersBuiltInSuiteArticle.sections[0].body;
  section0Points = formattersBuiltInSuiteArticle.sections[0].points ?? [];
  section0Code = formattersBuiltInSuiteArticle.sections[0].code?.code ?? '';
}
