import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const forgeBenchmarksArticle = {
  "key": "forgeBenchmarks",
  "section": "framework",
  "path": "/docs/forge/benchmarks",
  "label": "Benchmarks",
  "title": "Forge Benchmarks",
  "summary": "Forge benchmarks measure the Vanrot-native engine against the equivalent Vanrot Vite path, with a strict rule: public speed claims require measured comparison data.",
  "status": "production-ready-through-phase-32",
  "sections": [
    {
      "id": "benchmark-fixtures",
      "title": "Benchmark fixtures",
      "body": "The benchmark harness uses committed fixture apps instead of ad hoc local projects. One fixture represents a Forge app with @vanrot/forge. The other represents a Vite app with vite and @vanrot/vite-plugin. Both keep the shared Vanrot dependencies visible so the comparison is about the engine path, not missing framework packages.",
      "points": [
        "Fixture apps live under packages/forge/tests/fixtures/benchmarks.",
        "Forge and Vite fixtures both include @vanrot/router.",
        "The Forge fixture includes @vanrot/forge.",
        "The Vite fixture includes vite and @vanrot/vite-plugin."
      ],
      "code": {
        "title": "Benchmark command",
        "code": "pnpm benchmark:forge\npnpm vitest run scripts/benchmark-forge.test.mjs"
      }
    },
    {
      "id": "reported-fields",
      "title": "Reported fields",
      "body": "The script reports JSON so docs, CI, and future dashboards can consume it without scraping prose. The current fields include dependency counts, Forge cold dev startup timing, generated output files, and comparison gates. Vite timing fields can remain null until the harness performs a measured Vite run.",
      "points": [
        "dependencyCount records the installed engine dependency surface.",
        "coldDevStartupMs records measured Forge server startup.",
        "buildOutputFiles records emitted Forge dist files.",
        "comparison.publicClaimAllowed tells release notes whether a speed claim is allowed."
      ],
      "code": {
        "title": "Benchmark JSON shape",
        "code": "{\n  \"forge\": {\n    \"coldDevStartupMs\": 18.805,\n    \"dependencyCount\": 2,\n    \"buildOutputFiles\": [\"index.html\", \"assets/vanrot-app.js\"]\n  },\n  \"vite\": {\n    \"coldDevStartupMs\": null,\n    \"dependencyCount\": 3\n  },\n  \"comparison\": {\n    \"publicClaimAllowed\": false\n  }\n}"
      }
    },
    {
      "id": "claim-policy",
      "title": "Claim policy",
      "body": "Forge can be architecturally lighter than Vite for Vanrot because it does not carry general-library compatibility or a generic plugin ecosystem. That is a design claim. A speed claim needs measured Forge and measured Vite timings from the same harness, same machine class, and same fixture shape. The benchmark output keeps those two ideas separate.",
      "points": [
        "It is valid to document that Forge has a narrower Vanrot-only support target.",
        "It is valid to document dependency counts when the harness reports them.",
        "Do not publish faster-than-Vite claims while Vite timing fields are null.",
        "Use publicClaimAllowed as the release-note gate."
      ],
      "code": {
        "title": "Public claim gate",
        "code": "if (result.comparison.publicClaimAllowed !== true) {\n  throw new Error('Do not publish a Forge speed claim yet.');\n}"
      }
    },
    {
      "id": "extend-harness",
      "title": "Extend the harness",
      "body": "The next benchmark slice should measure the Vite path directly and repeat enough runs to reduce noise. Keep the output structured, keep fixtures committed, and keep the claim gate conservative. Benchmarking should help the framework tell the truth, not make the docs sound bigger than the engine has proven.",
      "points": [
        "Add Vite cold dev startup timing before speed comparisons.",
        "Add build timing for Forge and Vite only when both paths are measured.",
        "Report sample count and confidence details before publishing claims.",
        "Keep benchmark fixtures minimal Vanrot apps, not marketing demos."
      ],
      "code": {
        "title": "Future measured fields",
        "code": "{\n  \"forge\": {\n    \"coldDevStartupMs\": 18.805,\n    \"buildMs\": 42.114\n  },\n  \"vite\": {\n    \"coldDevStartupMs\": 77.441,\n    \"buildMs\": 108.992\n  },\n  \"comparison\": {\n    \"publicClaimAllowed\": true\n  }\n}"
      }
    }
  ]
} as const;

const sectionLinks: DocsSectionLink[] = forgeBenchmarksArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
}));

export class BenchmarksPage {
  title(): string {
    return forgeBenchmarksArticle.title;
  }

  summary(): string {
    return forgeBenchmarksArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = forgeBenchmarksArticle.sections[0].body;
  section1Body = forgeBenchmarksArticle.sections[1].body;
  section2Body = forgeBenchmarksArticle.sections[2].body;
  section3Body = forgeBenchmarksArticle.sections[3].body;
  section0Points = forgeBenchmarksArticle.sections[0].points ?? [];
  section1Points = forgeBenchmarksArticle.sections[1].points ?? [];
  section2Points = forgeBenchmarksArticle.sections[2].points ?? [];
  section3Points = forgeBenchmarksArticle.sections[3].points ?? [];
  section0CodeTitle = forgeBenchmarksArticle.sections[0].code?.title ?? '';
  section1CodeTitle = forgeBenchmarksArticle.sections[1].code?.title ?? '';
  section2CodeTitle = forgeBenchmarksArticle.sections[2].code?.title ?? '';
  section3CodeTitle = forgeBenchmarksArticle.sections[3].code?.title ?? '';
  section0Code = forgeBenchmarksArticle.sections[0].code?.code ?? '';
  section1Code = forgeBenchmarksArticle.sections[1].code?.code ?? '';
  section2Code = forgeBenchmarksArticle.sections[2].code?.code ?? '';
  section3Code = forgeBenchmarksArticle.sections[3].code?.code ?? '';
}
