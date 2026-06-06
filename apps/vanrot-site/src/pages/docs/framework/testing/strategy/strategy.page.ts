import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const testingStrategyArticle = {
  "key": "testingStrategy",
  "section": "framework",
  "path": "/docs/testing/strategy",
  "label": "Strategy",
  "title": "Testing Strategy",
  "summary": "Testing strategy explains where to put coverage across Vanrot runtime, compiler, router, CLI, docs, UI, and generated artifacts.",
  "status": "production-ready",
  "sections": [
    {
      "id": "choose-layer",
      "title": "Choose the layer",
      "body": "Tests should live at the layer that owns the behavior. A docs sidebar bug needs docs-data tests, a code transform bug needs compiler tests, and a user-visible component bug needs rendered component tests.",
      "points": [
        "Start with the smallest layer that proves the behavior.",
        "Add integration tests when two packages share a contract.",
        "Use browser or HTTP checks for visual routing and local docs smoke coverage."
      ],
      "code": {
        "title": "Layer examples",
        "code": "pnpm --filter @vanrot/runtime test\\npnpm --filter @vanrot/compiler test\\npnpm --filter @vanrot/vanrot-site test -- tests/site-data.test.ts"
      }
    },
    {
      "id": "regression-tests",
      "title": "Regression tests",
      "body": "A regression test should name the behavior that broke, not the implementation detail that happened to fail. This keeps future refactors possible while preserving the user-facing contract.",
      "points": [
        "Write the failing assertion before the fix when possible.",
        "Keep fixtures small and specific.",
        "Do not broaden test scope just to avoid understanding the failing layer."
      ]
    },
    {
      "id": "verification",
      "title": "Verification",
      "body": "Verification should match risk. Focused tests prove the changed area, typecheck catches cross-file API drift, docs verification catches generated bundle drift, release dry-run catches package export drift, and a local route smoke check proves the page is reachable.",
      "points": [
        "Use focused package tests during iteration.",
        "Run typecheck before claiming route or data keys are wired correctly.",
        "Run docs, release, size, publish dry-run, and site-route verification after package metadata or docs bundles change."
      ]
    }
  ]
} as const;

const sectionLinks = testingStrategyArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class StrategyPage {
  title(): string {
    return testingStrategyArticle.title;
  }

  summary(): string {
    return testingStrategyArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = testingStrategyArticle.sections[0].body;
  section1Body = testingStrategyArticle.sections[1].body;
  section2Body = testingStrategyArticle.sections[2].body;
  section0Points = testingStrategyArticle.sections[0].points ?? [];
  section1Points = testingStrategyArticle.sections[1].points ?? [];
  section2Points = testingStrategyArticle.sections[2].points ?? [];
  section0Code = testingStrategyArticle.sections[0].code?.code ?? '';
}
