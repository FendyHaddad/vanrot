import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const formsArraysWizardsErrorsArticle = {
  "key": "formsArraysWizardsErrors",
  "section": "framework",
  "path": "/docs/forms/arrays-wizards-server-errors",
  "label": "Arrays and server errors",
  "title": "Arrays, Wizards, And Server Errors",
  "summary": "Forms support repeated groups, wizard steps, and backend error hydration with stable refs instead of ad hoc index strings.",
  "status": "production-ready",
  "sections": [
    {
      "id": "arrays-wizards-errors",
      "title": "Complex form flows",
      "body": "Enterprise forms need arrays, staged workflows, and server-returned validation without losing source-of-truth discipline. Array helpers keep keys stable, wizard helpers keep step validity explicit, and server error hydration maps backend paths back onto field refs.",
      "points": [
        "Use field arrays for repeatable records instead of hand-built index state.",
        "Use wizard helpers for step validity, step navigation, and blocked submit state.",
        "Map backend error payloads into typed field messages.",
        "Keep generated diagnostics precise enough to show the broken form line."
      ],
      "code": {
        "title": "Server errors",
        "code": "form.applyServerErrors(response.errors, {\\n  claimantName: claimFields.claimantName,\\n  receiptAmount: claimFields.receiptAmount,\\n});"
      }
    }
  ]
} as const;

const sectionLinks = formsArraysWizardsErrorsArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class ArraysWizardsServerErrorsPage {
  title(): string {
    return formsArraysWizardsErrorsArticle.title;
  }

  summary(): string {
    return formsArraysWizardsErrorsArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = formsArraysWizardsErrorsArticle.sections[0].body;
  section0Points = formsArraysWizardsErrorsArticle.sections[0].points ?? [];
  section0Code = formsArraysWizardsErrorsArticle.sections[0].code?.code ?? '';
}
