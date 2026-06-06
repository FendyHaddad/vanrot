import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const formsValidationLifecycleArticle = {
  "key": "formsValidationLifecycle",
  "section": "framework",
  "path": "/docs/forms/validation-lifecycle",
  "label": "Validation lifecycle",
  "title": "Validation Lifecycle",
  "summary": "Validation runs through predictable sync and async stages with typed messages, dirty and touched state, submit guards, and line-numbered diagnostics.",
  "status": "production-ready",
  "sections": [
    {
      "id": "validation-lifecycle",
      "title": "Validation states",
      "body": "Validation should be explicit enough for enterprise forms and small enough for daily screens. Required, email, length, custom predicate, async uniqueness, and backend-returned errors all flow into the same message surface so templates render messages instead of deciding validation policy.",
      "points": [
        "Run synchronous validators before async validators.",
        "Track dirty, touched, pending, valid, invalid, and submitted state.",
        "Normalize backend errors into the same field message model.",
        "Report invalid validator definitions through terminal diagnostics with source line numbers."
      ],
      "code": {
        "title": "Validation rules",
        "code": "const email = field.email()\\n  .required('Email is required.')\\n  .validateUnique(checkEmailAvailable);"
      }
    }
  ]
} as const;

const sectionLinks = formsValidationLifecycleArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class ValidationLifecyclePage {
  title(): string {
    return formsValidationLifecycleArticle.title;
  }

  summary(): string {
    return formsValidationLifecycleArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = formsValidationLifecycleArticle.sections[0].body;
  section0Points = formsValidationLifecycleArticle.sections[0].points ?? [];
  section0Code = formsValidationLifecycleArticle.sections[0].code?.code ?? '';
}
