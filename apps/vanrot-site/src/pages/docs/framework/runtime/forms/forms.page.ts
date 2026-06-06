import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const runtimeFormsArticle = {
  "key": "runtimeForms",
  "section": "framework",
  "path": "/docs/runtime/forms",
  "label": "Forms",
  "title": "Runtime Forms",
  "summary": "Runtime forms provide a small controller and validator surface for repeated field state, validation, and error handling.",
  "status": "production-ready-through-phase-12",
  "sections": [
    {
      "id": "form-controller",
      "title": "Form controller",
      "body": "createFormController() keeps form state outside template markup while still exposing predictable field controllers for generated UI. Validators stay plain functions, so required, email, and minimum-length rules can be reused across forms.",
      "points": [
        "Use createFormController() when multiple fields need shared validation and submit state.",
        "Use requiredValidator(), emailValidator(), and minLengthValidator() for common field rules.",
        "Keep business-specific validation in named validators instead of embedding logic in HTML."
      ],
      "code": {
        "title": "Field validation",
        "code": "import { createFormController, emailValidator, requiredValidator } from '@vanrot/runtime';\n\nconst form = createFormController({\n  email: {\n    initialValue: '',\n    validators: [requiredValidator('Email is required'), emailValidator('Use a real email')],\n  },\n});"
      }
    }
  ]
} as const;

const sectionLinks = runtimeFormsArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class FormsPage {
  title(): string {
    return runtimeFormsArticle.title;
  }

  summary(): string {
    return runtimeFormsArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = runtimeFormsArticle.sections[0].body;
  section0Points = runtimeFormsArticle.sections[0].points ?? [];
  section0Code = runtimeFormsArticle.sections[0].code?.code ?? '';
}
