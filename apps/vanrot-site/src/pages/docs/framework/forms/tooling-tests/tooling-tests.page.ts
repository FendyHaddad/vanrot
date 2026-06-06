import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const formsToolingTestsArticle = {
  "key": "formsToolingTests",
  "section": "framework",
  "path": "/docs/forms/tooling-tests",
  "label": "Tooling and tests",
  "title": "Forms Tooling And Tests",
  "summary": "Forms ship diagnostics, Vite discovery hooks, and test helpers so generated form behavior can be proved without clicking through every field manually.",
  "status": "production-ready",
  "sections": [
    {
      "id": "tooling-tests",
      "title": "Diagnostics and focused tests",
      "body": "The forms package should tell users when refs, validators, resources, arrays, or server error maps are wrong. Tests should exercise the form controller directly and then keep one compiled-template test for critical generated bindings.",
      "points": [
        "Report duplicate refs, missing refs, unsupported async validators, and invalid server error maps.",
        "Use form test helpers for values, dirty state, touched state, validation, and messages.",
        "Use one compiled template test for critical generated form bindings.",
        "Keep diagnostic output terminal-friendly with file path and line number."
      ],
      "code": {
        "title": "Form test helper",
        "code": "const testForm = createFormTest(profileForm);\\n\\ntestForm.set('email', 'bad-email');\\ntestForm.touch('email');\\nexpect(testForm.field('email').messages()).toEqual(['Email is invalid.']);"
      }
    }
  ]
} as const;

const sectionLinks = formsToolingTestsArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class ToolingTestsPage {
  title(): string {
    return formsToolingTestsArticle.title;
  }

  summary(): string {
    return formsToolingTestsArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = formsToolingTestsArticle.sections[0].body;
  section0Points = formsToolingTestsArticle.sections[0].points ?? [];
  section0Code = formsToolingTestsArticle.sections[0].code?.code ?? '';
}
