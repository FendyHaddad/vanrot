import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const testingScreenArticle = {
  "key": "testingScreen",
  "section": "framework",
  "path": "/docs/testing/screen",
  "label": "Screen",
  "title": "Testing Screen",
  "summary": "Screen is the small DOM query surface returned by @vanrot/testing component and page tests.",
  "status": "production-ready",
  "sections": [
    {
      "id": "screen-purpose",
      "title": "Screen purpose",
      "body": "Screen wraps the mounted target so tests can ask user-facing questions about rendered DOM. It keeps tests from relying on implementation details while still staying lightweight enough for framework packages.",
      "points": [
        "Use text queries for visible copy.",
        "Use DOM-level checks when the API under test is structural.",
        "Avoid snapshotting whole pages when one assertion describes the behavior."
      ],
      "code": {
        "title": "Read rendered text",
        "code": "testComponent(StatusBadgeComponent).can('render active state', function (screen) {\\n  screen.expect.text('Active');\\n});"
      }
    },
    {
      "id": "query-discipline",
      "title": "Query discipline",
      "body": "Good screen queries describe what a user can observe. They should not depend on generated class names, compiler temporary markers, or the exact order of internal wrapper elements unless that structure is the public contract.",
      "points": [
        "Prefer visible labels and text.",
        "Use attributes only when the attribute is part of the public API.",
        "Avoid brittle queries that fail after harmless markup cleanup."
      ]
    },
    {
      "id": "screen-debugging",
      "title": "Screen debugging",
      "body": "When a screen query fails, inspect the rendered target before changing the component. The component may have rendered different valid output, or the test may be asking a question that no user would ask.",
      "points": [
        "Check text content before checking nested selectors.",
        "Make empty-state assertions explicit.",
        "Use clearer component copy when tests reveal ambiguous UI."
      ]
    }
  ]
} as const;

const sectionLinks = testingScreenArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class ScreenPage {
  title(): string {
    return testingScreenArticle.title;
  }

  summary(): string {
    return testingScreenArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = testingScreenArticle.sections[0].body;
  section1Body = testingScreenArticle.sections[1].body;
  section2Body = testingScreenArticle.sections[2].body;
  section0Points = testingScreenArticle.sections[0].points ?? [];
  section1Points = testingScreenArticle.sections[1].points ?? [];
  section2Points = testingScreenArticle.sections[2].points ?? [];
  section0Code = testingScreenArticle.sections[0].code?.code ?? '';
}
