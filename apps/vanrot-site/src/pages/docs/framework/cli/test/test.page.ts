import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const cliTestArticle = {
  "key": "cliTest",
  "section": "framework",
  "path": "/docs/cli/test",
  "label": "Test",
  "title": "CLI Test",
  "summary": "vr test validates config and runs the project test suite through vitest run so local and CI checks share the same non-watch behavior.",
  "status": "demo-capable-through-phase-14",
  "sections": [
    {
      "id": "what-test-runs",
      "title": "What vr test runs",
      "body": "vr test is the framework-facing test entry point. It loads Vanrot config first, reports diagnostics, and delegates to vitest run so the command exits after one full test pass instead of starting an interactive watcher.",
      "points": [
        "Use it when you want the same behavior locally and in CI.",
        "Fix config errors first because a broken config can invalidate component, router, and docs tests.",
        "Use package-level test commands only when you are intentionally narrowing the surface."
      ],
      "code": {
        "title": "Run project tests",
        "code": "vr test"
      }
    },
    {
      "id": "testing-scope",
      "title": "Testing scope",
      "body": "The command is intentionally broad enough to protect framework contracts but simple enough to explain. It should cover component rendering, runtime state, router behavior, generated docs data, and CLI conventions through normal Vitest project configuration.",
      "points": [
        "Use component tests for rendered behavior and signal-driven updates.",
        "Use router tests for route objects, params, guards, and navigation helpers.",
        "Use docs data tests when navigation, article keys, code examples, or generated docs content changes."
      ],
      "code": {
        "title": "Focused then broad",
        "code": "pnpm --filter @vanrot/vanrot-site test -- tests/site-data.test.ts\\nvr test"
      }
    },
    {
      "id": "failure-debugging",
      "title": "Failure debugging",
      "body": "Test failures should be read as contracts, not noise. A failing docs data test usually means a route, sidebar, article, or generated bundle drifted; a failing component test usually means rendering behavior changed; a config failure blocks both.",
      "points": [
        "Read the first failing assertion before changing implementation.",
        "Keep red-green evidence when adding docs routes or behavior tests.",
        "Regenerate AI docs only after content is correct, not as a way to hide a stale-data failure."
      ]
    },
    {
      "id": "ci-workflow",
      "title": "CI workflow",
      "body": "CI should use vr test as the predictable test command when a project has adopted the CLI surface. It gives automation a one-shot command while still letting package scripts stay available for narrower debugging during local development.",
      "points": [
        "Use vr test before vr build so behavioral regressions fail before production bundling.",
        "Keep structured output for wrappers that parse CLI results and human output for normal logs.",
        "Run doctor separately when CI failures suggest missing files, invalid role suffixes, or stale config."
      ],
      "code": {
        "title": "CI order",
        "code": "vr test\\nvr build"
      }
    }
  ]
} as const;

const sectionLinks = cliTestArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class TestPage {
  title(): string {
    return cliTestArticle.title;
  }

  summary(): string {
    return cliTestArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = cliTestArticle.sections[0].body;
  section1Body = cliTestArticle.sections[1].body;
  section2Body = cliTestArticle.sections[2].body;
  section3Body = cliTestArticle.sections[3].body;
  section0Points = cliTestArticle.sections[0].points ?? [];
  section1Points = cliTestArticle.sections[1].points ?? [];
  section2Points = cliTestArticle.sections[2].points ?? [];
  section3Points = cliTestArticle.sections[3].points ?? [];
  section0Code = cliTestArticle.sections[0].code?.code ?? '';
  section1Code = cliTestArticle.sections[1].code?.code ?? '';
  section3Code = cliTestArticle.sections[3].code?.code ?? '';
}
