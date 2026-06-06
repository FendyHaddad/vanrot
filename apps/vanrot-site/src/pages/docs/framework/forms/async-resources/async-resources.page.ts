import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const formsAsyncResourcesArticle = {
  "key": "formsAsyncResources",
  "section": "framework",
  "path": "/docs/forms/async-resources",
  "label": "Async resources",
  "title": "Form Async Resources",
  "summary": "Form resources load option data, dependent fields, submit state, and server checks while keeping cancellation and stale response handling inside form orchestration.",
  "status": "production-ready",
  "sections": [
    {
      "id": "async-resources",
      "title": "Form-scoped async work",
      "body": "Use form resources when async state is part of a form workflow: dependent dropdowns, preview totals, server validation, draft restore, or submit. Resources should cancel stale requests, preserve current field state, and expose terminal diagnostics when a resource is wired incorrectly.",
      "points": [
        "Scope resources to the form controller so cleanup follows the form lifecycle.",
        "Cancel stale requests when controlling fields change.",
        "Keep fetch implementation outside the template.",
        "Surface pending, success, failure, and stale states as signals."
      ],
      "code": {
        "title": "Dependent options",
        "code": "const branches = form.resource({\\n  dependsOn: [claimFields.country],\\n  load: ({ value }) => loadBranches(value.country),\\n});"
      }
    }
  ]
} as const;

const sectionLinks = formsAsyncResourcesArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class AsyncResourcesPage {
  title(): string {
    return formsAsyncResourcesArticle.title;
  }

  summary(): string {
    return formsAsyncResourcesArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = formsAsyncResourcesArticle.sections[0].body;
  section0Points = formsAsyncResourcesArticle.sections[0].points ?? [];
  section0Code = formsAsyncResourcesArticle.sections[0].code?.code ?? '';
}
