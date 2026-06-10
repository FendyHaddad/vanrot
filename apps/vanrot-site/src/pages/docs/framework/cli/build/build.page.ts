import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const cliBuildArticle = {
  "key": "cliBuild",
  "section": "framework",
  "path": "/docs/cli/build",
  "label": "Build",
  "title": "CLI Build",
  "summary": "vr build validates Vanrot config and then runs the production Vite build so release output uses the same framework plugin path as development.",
  "status": "demo-capable-through-phase-14",
  "sections": [
    {
      "id": "what-build-runs",
      "title": "What vr build runs",
      "body": "vr build is the production bundling entry point. It runs the config loader first, reports warnings without hiding them, blocks on config errors, and delegates to vite build in the project root so application builds use the real Vite pipeline.",
      "points": [
        "The command does not skip Vanrot config validation just because Vite can start without it.",
        "The Vite plugin still owns role-file transforms, virtual modules, CSS handling, and production bundle output.",
        "The exit code is the wrapped build exit code so automation can fail correctly."
      ],
      "code": {
        "title": "Production build",
        "code": "vr build"
      }
    },
    {
      "id": "production-contract",
      "title": "Production contract",
      "body": "Use vr build as the final local proof that docs, examples, role files, imports, and assets survive production bundling. A page can look correct in development while production still catches missing imports, unreachable assets, or transform-only assumptions.",
      "points": [
        "Run it before publishing docs or shipping user-facing application changes.",
        "Pair it with typecheck when TypeScript surface or route contracts changed.",
        "Pair it with AI docs verification when documentation data or generated knowledge bundles changed."
      ],
      "code": {
        "title": "Release gate",
        "code": "vr test\\nvr build\\nvr ai verify"
      }
    },
    {
      "id": "failure-debugging",
      "title": "Failure debugging",
      "body": "Build failures should be split by layer. Config errors belong in configuration, transform errors belong in the compiler or Vite plugin, unresolved modules belong in imports and generated files, and runtime-only behavior needs focused runtime tests.",
      "points": [
        "Read the first config diagnostic before scrolling into Vite output.",
        "Check generated route and role-file paths when an import cannot resolve.",
        "Use compiler source-map docs when production output points at generated code instead of source files."
      ]
    },
    {
      "id": "release-workflow",
      "title": "Release workflow",
      "body": "A release workflow should keep vr build close to the end, after focused tests and before publishing artifacts. That order keeps noisy test failures separate from production bundling failures and makes the final build result easier to trust.",
      "points": [
        "Run narrow tests while developing, then run the broader release gate once the patch is stable.",
        "Keep build logs human-readable unless CI needs structured CLI output.",
        "Do not treat a successful dev server as a production build substitute."
      ],
      "code": {
        "title": "Typical release check",
        "code": "vr test\\nvr build\\nvr doctor"
      }
    }
  ]
} as const;

const sectionLinks = cliBuildArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class BuildPage {
  title(): string {
    return cliBuildArticle.title;
  }

  summary(): string {
    return cliBuildArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = cliBuildArticle.sections[0].body;
  section1Body = cliBuildArticle.sections[1].body;
  section2Body = cliBuildArticle.sections[2].body;
  section3Body = cliBuildArticle.sections[3].body;
  section0Points = cliBuildArticle.sections[0].points ?? [];
  section1Points = cliBuildArticle.sections[1].points ?? [];
  section2Points = cliBuildArticle.sections[2].points ?? [];
  section3Points = cliBuildArticle.sections[3].points ?? [];
  section0Code = cliBuildArticle.sections[0].code?.code ?? '';
  section1Code = cliBuildArticle.sections[1].code?.code ?? '';
  section3Code = cliBuildArticle.sections[3].code?.code ?? '';
}
