import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const formattersBuiltInArgumentsArticle = {
  "key": "formattersBuiltInArguments",
  "section": "framework",
  "path": "/docs/formatters/built-in-arguments",
  "label": "Built-in arguments",
  "title": "Built-In Arguments And Variants",
  "summary": "Built-in pipes accept readable arguments and named variants for date, number, currency, plural, masks, and message formats.",
  "status": "production-ready",
  "sections": [
    {
      "id": "built-in-arguments",
      "title": "Arguments and variants",
      "body": "Many formatting needs are business-specific. Date formats can use variants or string masks, numbers can opt into grouping and decimal behavior, and masks can use built-in or application-defined constants for countries or industry-specific identifiers.",
      "points": [
        "Support date variants such as monthDayYear, dayMonthYear, monthYear, and shortYear forms.",
        "Support number grouping, decimal precision, cents, compact notation, and percent display.",
        "Support currency code, locale, symbol, narrow symbol, and accounting-style options.",
        "Support masks through built-in variants, named constants, or direct masks."
      ],
      "code": {
        "title": "Argument examples",
        "code": "{{ createdAt | date.dayMonthYear }}\\n{{ amount | number({ grouping: true, decimals: 2 }) }}\\n{{ price | currency('MYR', { accounting: true }) }}\\n{{ taxId | mask(BUSINESS_TAX_ID_MASK) }}"
      }
    }
  ]
} as const;

const sectionLinks = formattersBuiltInArgumentsArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class BuiltInArgumentsPage {
  title(): string {
    return formattersBuiltInArgumentsArticle.title;
  }

  summary(): string {
    return formattersBuiltInArgumentsArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = formattersBuiltInArgumentsArticle.sections[0].body;
  section0Points = formattersBuiltInArgumentsArticle.sections[0].points ?? [];
  section0Code = formattersBuiltInArgumentsArticle.sections[0].code?.code ?? '';
}
