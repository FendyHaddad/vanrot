import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const formsBoundaryArticle = {
  "key": "formsBoundary",
  "section": "framework",
  "path": "/docs/forms/package-boundary",
  "label": "Package boundary",
  "title": "Forms Package Boundary",
  "summary": "@vanrot/forms owns form state, validation, form resources, field arrays, wizards, server errors, draft persistence, diagnostics, and test helpers without moving app logic into templates.",
  "status": "production-ready",
  "sections": [
    {
      "id": "package-boundary",
      "title": "What belongs in forms",
      "body": "Use @vanrot/forms when a screen needs coordinated field state, validation messages, async submit state, backend errors, or draft persistence. Keep form schemas and controllers in role files, keep markup in the template, and keep business workflow decisions in page or component code.",
      "points": [
        "Use forms for field state, dirty and touched state, validation, arrays, wizards, and server error hydration.",
        "Use resources inside forms only when the value belongs to the form workflow.",
        "Do not put business branching, fetch orchestration, or mutation logic in HTML.",
        "Keep @vanrot/runtime small by leaving form behavior in this package."
      ],
      "code": {
        "title": "Form boundary",
        "code": "export const profileForm = defineForm({\\n  fields: {\\n    email: field.email().required(),\\n    displayName: field.text().required(),\\n  },\\n});"
      }
    }
  ]
} as const;

const sectionLinks = formsBoundaryArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class PackageBoundaryPage {
  title(): string {
    return formsBoundaryArticle.title;
  }

  summary(): string {
    return formsBoundaryArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = formsBoundaryArticle.sections[0].body;
  section0Points = formsBoundaryArticle.sections[0].points ?? [];
  section0Code = formsBoundaryArticle.sections[0].code?.code ?? '';
}
