import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const forgeBuildArticle = {
  "key": "forgeBuild",
  "section": "framework",
  "path": "/docs/forge/build",
  "label": "Build",
  "title": "Forge Build",
  "summary": "Forge build turns a Vanrot app graph into deterministic static output: app shell, compiled application JavaScript, scoped CSS, route metadata, asset metadata, and optional diagnostics.",
  "status": "production-ready-through-phase-32",
  "sections": [
    {
      "id": "build-contract",
      "title": "Build contract",
      "body": "runForgeBuild owns the native build path. It loads the app graph, compiles supported role files through the Vanrot compiler, writes the application shell, and records routes and assets as first-party metadata. The build command exits through the CLI, but the build API remains importable for tests and future tool integration.",
      "points": [
        "The default output directory is dist.",
        "The build accepts an explicit cwd and outDir for tests and custom automation.",
        "Reporter output is optional so tests can assert results without parsing logs.",
        "The API returns generated file paths and diagnostics instead of hiding them inside console output."
      ],
      "code": {
        "title": "Run a Forge build",
        "code": "import { runForgeBuild } from '@vanrot/forge';\n\nconst result = await runForgeBuild({\n  cwd: process.cwd(),\n  outDir: 'dist',\n});\n\nconsole.log(result.outputFiles);\nconsole.log(result.diagnostics.length);"
      }
    },
    {
      "id": "generated-output",
      "title": "Generated output",
      "body": "Forge writes a small, explicit output surface. The JavaScript and CSS files are named as Vanrot application assets rather than leaking bundler internals. Route and asset manifests are JSON files so deployment checks, docs, and future AI/devtools readers can inspect the build without reverse engineering emitted code.",
      "points": [
        "index.html is the static entry shell.",
        "assets/vanrot-app.js contains compiled application code.",
        "assets/vanrot-app.css contains scoped CSS collected from role files.",
        "vanrot-routes.json records discovered page routes.",
        "vanrot-assets.json records emitted build assets."
      ],
      "code": {
        "title": "Forge dist shape",
        "code": "dist/\n  index.html\n  assets/\n    vanrot-app.js\n    vanrot-app.css\n  vanrot-routes.json\n  vanrot-assets.json"
      }
    },
    {
      "id": "failure-model",
      "title": "Failure model",
      "body": "Build failures should be boring and machine-readable. Forge maps compiler failures and graph failures to Forge diagnostics, writes diagnostic output when useful, and returns a non-zero result through the CLI command. That keeps CI, docs verification, and local developer output aligned around the same diagnostic codes.",
      "points": [
        "Compiler failures are exposed as VRFORGE007.",
        "Missing source roots and graph problems are reported before output claims success.",
        "vanrot-diagnostics.txt can be emitted when diagnostics need to travel with build artifacts.",
        "Build callers should read the structured result before printing custom summaries."
      ],
      "code": {
        "title": "Build command behavior",
        "code": "pnpm exec vr build\npnpm exec vr build --engine forge\npnpm exec vr build --engine vite"
      }
    },
    {
      "id": "deployment-boundary",
      "title": "Deployment boundary",
      "body": "The current Forge build is a static Vanrot output path. It is designed for the first production slice of native Vanrot apps and for honest benchmarking against the equivalent Vite app path. SSR streaming, route-level chunk splitting, advanced asset optimization, and adapter-specific deploy behavior remain future layers instead of hidden requirements inside Phase 32.",
      "points": [
        "Deploy the emitted dist directory as static output.",
        "Do not promise SSR behavior from Forge build until the SSR package is integrated.",
        "Keep route metadata stable so future deploy adapters can build on it.",
        "Use the benchmark harness to compare generated output and dependency surfaces."
      ],
      "code": {
        "title": "Static deploy input",
        "code": "pnpm exec vr build\n\n# deploy the generated directory\ndist/index.html\ndist/assets/vanrot-app.js\ndist/assets/vanrot-app.css"
      }
    }
  ]
} as const;

const sectionLinks: DocsSectionLink[] = forgeBuildArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
}));

export class BuildPage {
  title(): string {
    return forgeBuildArticle.title;
  }

  summary(): string {
    return forgeBuildArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = forgeBuildArticle.sections[0].body;
  section1Body = forgeBuildArticle.sections[1].body;
  section2Body = forgeBuildArticle.sections[2].body;
  section3Body = forgeBuildArticle.sections[3].body;
  section0Points = forgeBuildArticle.sections[0].points ?? [];
  section1Points = forgeBuildArticle.sections[1].points ?? [];
  section2Points = forgeBuildArticle.sections[2].points ?? [];
  section3Points = forgeBuildArticle.sections[3].points ?? [];
  section0CodeTitle = forgeBuildArticle.sections[0].code?.title ?? '';
  section1CodeTitle = forgeBuildArticle.sections[1].code?.title ?? '';
  section2CodeTitle = forgeBuildArticle.sections[2].code?.title ?? '';
  section3CodeTitle = forgeBuildArticle.sections[3].code?.title ?? '';
  section0Code = forgeBuildArticle.sections[0].code?.code ?? '';
  section1Code = forgeBuildArticle.sections[1].code?.code ?? '';
  section2Code = forgeBuildArticle.sections[2].code?.code ?? '';
  section3Code = forgeBuildArticle.sections[3].code?.code ?? '';
}
