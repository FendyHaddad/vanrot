import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const formattersTestingArticle = {
  "key": "formattersTesting",
  "section": "framework",
  "path": "/docs/formatters/testing",
  "label": "Testing",
  "title": "Testing Formatter Behavior",
  "summary": "Formatter tests cover built-ins, custom pipes, context, diagnostics, generated imports, and compiled template behavior.",
  "status": "production-ready",
  "sections": [
    {
      "id": "testing-formatters",
      "title": "Focused pipe tests",
      "body": "Test custom pipes directly for domain mappings, test context-aware pipes with explicit locale and currency, and keep at least one compiled-template test for important formatter workflows. Compiler diagnostic tests should assert line numbers for broken templates.",
      "points": [
        "Use direct pipe tests for enum labels, masks, and formatting options.",
        "Use context fixtures for locale, currency, time zone, and message catalogs.",
        "Use compiler tests for invalid syntax and generated imports.",
        "Use one realistic compiled template test for custom pipes central to a user workflow."
      ],
      "code": {
        "title": "Focused pipe test",
        "code": "import { createPipeTest } from '@vanrot/formatters/testing';\\nimport { claimStatus } from '../src/business.pipe';\\n\\nconst testPipe = createPipeTest(claimStatus);\\n\\nexpect(testPipe('APPROVED')).toBe('Approved');\\nexpect(testPipe('PENDING_REVIEW')).toBe('Pending review');"
      }
    }
  ]
} as const;

const sectionLinks = formattersTestingArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class TestingPage {
  title(): string {
    return formattersTestingArticle.title;
  }

  summary(): string {
    return formattersTestingArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = formattersTestingArticle.sections[0].body;
  section0Points = formattersTestingArticle.sections[0].points ?? [];
  section0Code = formattersTestingArticle.sections[0].code?.code ?? '';
}
