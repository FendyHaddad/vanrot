import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const testingComponentArticle = {
  "key": "testingComponent",
  "section": "framework",
  "path": "/docs/testing/component-tests",
  "label": "Component Tests",
  "title": "Testing Component Tests",
  "summary": "Component tests mount a Vanrot component through testComponent and assert against rendered behavior.",
  "status": "production-ready",
  "sections": [
    {
      "id": "mounting",
      "title": "Mounting",
      "body": "testComponent mounts a component type and provides a builder for the test body. Use it when the test needs rendered DOM, runtime signal updates, template bindings, or event behavior from a component.",
      "points": [
        "Import the component type directly from the role file.",
        "Assert user-visible output instead of private fields.",
        "Keep each test focused on one behavior."
      ],
      "code": {
        "title": "Mount and assert",
        "code": "import { testComponent } from '@vanrot/testing';\\n\\ntestComponent(ProfileCardComponent).can('render profile details', function (screen) {\\n  screen.expect.text('Profile');\\n});"
      }
    },
    {
      "id": "state-updates",
      "title": "State updates",
      "body": "Component tests should exercise signal-driven behavior the same way users do: render the component, trigger the public interaction, and assert the DOM changed. Avoid reaching into signal internals unless the API being tested is the signal itself.",
      "points": [
        "Prefer event simulation over mutating private state.",
        "Assert the final DOM state.",
        "Use runtime tests for lower-level signal semantics."
      ]
    },
    {
      "id": "component-debugging",
      "title": "Component debugging",
      "body": "If a component test fails before assertions, inspect whether the component can mount, whether its template compiled, and whether the DOM query is too strict. The failure boundary points to the right package.",
      "points": [
        "Compile errors belong in compiler or Vite plugin investigation.",
        "Mount errors belong in runtime setup investigation.",
        "Query errors usually belong in the test or screen helper."
      ]
    }
  ]
} as const;

const sectionLinks = testingComponentArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class ComponentTestsPage {
  title(): string {
    return testingComponentArticle.title;
  }

  summary(): string {
    return testingComponentArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = testingComponentArticle.sections[0].body;
  section1Body = testingComponentArticle.sections[1].body;
  section2Body = testingComponentArticle.sections[2].body;
  section0Points = testingComponentArticle.sections[0].points ?? [];
  section1Points = testingComponentArticle.sections[1].points ?? [];
  section2Points = testingComponentArticle.sections[2].points ?? [];
  section0Code = testingComponentArticle.sections[0].code?.code ?? '';
}
