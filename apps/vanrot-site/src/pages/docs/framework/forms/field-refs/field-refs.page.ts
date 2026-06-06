import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const formsFieldRefsArticle = {
  "key": "formsFieldRefs",
  "section": "framework",
  "path": "/docs/forms/field-refs",
  "label": "Named field refs",
  "title": "Named Field Refs",
  "summary": "Named field refs give forms a stable source of truth for labels, paths, messages, diagnostics, generated form bindings, and tests.",
  "status": "production-ready",
  "sections": [
    {
      "id": "named-field-refs",
      "title": "Field refs as the source of truth",
      "body": "Define field refs once and reuse them in controllers, templates, messages, and tests. The compiler and Vite tooling can then catch repeated string paths, stale field names, and unsafe generated bindings before the page reaches the browser.",
      "points": [
        "Prefer named refs over repeated string paths.",
        "Use refs for nested objects, arrays, wizard steps, and server error mapping.",
        "Expose readable helpers so templates stay clear without hiding logic inside HTML."
      ],
      "code": {
        "title": "Field refs",
        "code": "export const claimFields = defineFieldRefs({\\n  claimantName: 'claimant.name',\\n  receiptAmount: 'receipt.amount',\\n  receiptDate: 'receipt.date',\\n});"
      }
    }
  ]
} as const;

const sectionLinks = formsFieldRefsArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class FieldRefsPage {
  title(): string {
    return formsFieldRefsArticle.title;
  }

  summary(): string {
    return formsFieldRefsArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = formsFieldRefsArticle.sections[0].body;
  section0Points = formsFieldRefsArticle.sections[0].points ?? [];
  section0Code = formsFieldRefsArticle.sections[0].code?.code ?? '';
}
