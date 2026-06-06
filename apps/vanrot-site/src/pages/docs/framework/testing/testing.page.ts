import type { DocsSectionLink } from '../../shared/docs-content.ts';

export const testingArticle = {
  "key": "testing",
  "section": "framework",
  "path": "/docs/testing",
  "label": "Testing",
  "title": "Testing",
  "summary": "@vanrot/testing ships component, page, router, accessibility, async, and generator helpers for readable Vitest and jsdom workflows.",
  "status": "production-ready",
  "sections": [
    {
      "id": "testing-boundary",
      "title": "Testing boundary",
      "body": "Testing helpers should make Vanrot components and pages easy to mount without hiding framework behavior. @vanrot/testing now owns component tests, page tests, route-ref navigation tests, accessibility assertions, async coordination, fake timer bridges, and generated test files.",
      "points": [
        "Use testComponent for component behavior and testPage for role-based page files.",
        "Use Screen helpers to query rendered DOM instead of reaching into internals.",
        "Use setupRouterTest when the behavior depends on route refs, params, query values, redirects, guards, or lazy pages."
      ],
      "code": {
        "title": "Page test",
        "code": "import { testPage } from '@vanrot/testing';\\nimport { ProfilePage } from './profile.page';\\n\\ntestPage(ProfilePage).can('render the profile page', function (page) {\\n  page.screen.expect.text('Profile');\\n});"
      }
    },
    {
      "id": "test-layers",
      "title": "Test layers",
      "body": "A Vanrot app should test at the layer where the risk lives. Runtime state belongs in component tests, route table behavior belongs in setupRouterTest checks, compiler transforms belong in compiler tests, and docs IA belongs in site-data tests.",
      "points": [
        "Do not test compiler behavior through a browser page when a compiler unit test is clearer.",
        "Do test user-facing component and page output through rendered DOM.",
        "Do add docs tests when sidebar, routes, or article richness are part of the requirement."
      ]
    },
    {
      "id": "workflow-helpers",
      "title": "Workflow helpers",
      "body": "Phase 18 adds helpers for the cases that used to force teams into private DOM plumbing. Accessibility assertions cover button, input, dialog, and navigation semantics. Async helpers flush promise work, wait for signal-driven DOM updates, bridge Vitest fake timers explicitly, and clean up abortable work.",
      "points": [
        "Use createAccessibilityAssertions for role, name, disabled, focus, and semantic checks.",
        "Use flushTestingTasks and waitForDomUpdate around signal-driven DOM updates.",
        "Use createFakeTimerBridge and createAsyncTestScope when timers, promises, or cancellation can leak across tests."
      ],
      "code": {
        "title": "Accessibility and async",
        "code": "const a11y = createAccessibilityAssertions(page.target, { source: 'profile.page.ts' });\\na11y.expect.role('button', { name: 'Save' });\\n\\nawait waitForDomUpdate(() => {\\n  page.screen.expect.text('Saved');\\n});"
      }
    },
    {
      "id": "debugging-tests",
      "title": "Debugging tests",
      "body": "When a test fails, identify the boundary first. A blank render can be a runtime mount problem, a route resolution problem, a compiler output problem, or a missing DOM query; each has a different fix.",
      "points": [
        "Check generated DOM before assuming state logic failed.",
        "Check route refs before assuming a docs page disappeared.",
        "Check config and Vite plugin output before blaming runtime rendering."
      ]
    },
    {
      "id": "child-guides",
      "title": "Child guides",
      "body": "The child pages cover component tests, the Screen query surface, route-related tests, and production testing strategy. They now point at the shipped Phase 18 helpers instead of describing route-aware and async testing as future work.",
      "points": [
        "Start with Component Tests when testing a Vanrot class and template.",
        "Use Screen when queries are unclear or brittle.",
        "Use Routing Tests and Strategy when a failing case depends on route refs, fake timers, async cleanup, CLI generation, or site docs tests."
      ]
    }
  ]
} as const;

const sectionLinks = testingArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class TestingPage {
  title(): string {
    return testingArticle.title;
  }

  summary(): string {
    return testingArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = testingArticle.sections[0].body;
  section1Body = testingArticle.sections[1].body;
  section2Body = testingArticle.sections[2].body;
  section3Body = testingArticle.sections[3].body;
  section4Body = testingArticle.sections[4].body;
  section0Points = testingArticle.sections[0].points ?? [];
  section1Points = testingArticle.sections[1].points ?? [];
  section2Points = testingArticle.sections[2].points ?? [];
  section3Points = testingArticle.sections[3].points ?? [];
  section4Points = testingArticle.sections[4].points ?? [];
  section0Code = testingArticle.sections[0].code?.code ?? '';
  section2Code = testingArticle.sections[2].code?.code ?? '';
}
