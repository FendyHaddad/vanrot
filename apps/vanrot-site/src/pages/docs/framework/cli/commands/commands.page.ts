import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const cliCommandSurfaceArticle = {
  "key": "cliCommandSurface",
  "section": "framework",
  "path": "/docs/cli/commands",
  "label": "Command Surface",
  "title": "CLI Command Surface",
  "summary": "The command surface explains how @vanrot/cli names, groups, reports, and validates every current vr command.",
  "status": "demo-capable-through-phase-14",
  "sections": [
    {
      "id": "create",
      "title": "vr create",
      "body": "Use vr create when a project does not exist yet. The command owns the starter workspace, package metadata, application shell, route entry, and first page files so new projects begin with the same file roles the rest of the framework expects.",
      "points": [
        "Pass the application name as kebab-case so generated package and folder names stay predictable.",
        "Use --workspace when the new app should be written into an existing repository workspace.",
        "Use --force only when replacing a failed starter attempt that you have already inspected."
      ],
      "code": {
        "title": "Create a project",
        "code": "vr create admin-console\\ncd admin-console\\npnpm install\\nvr dev"
      }
    },
    {
      "id": "generate",
      "title": "vr generate",
      "body": "Use vr generate when adding role files to an existing app. The generator is intentionally narrow: it writes framework-shaped component or page files, applies naming rules, and keeps markup, logic, and scoped CSS in the expected files.",
      "points": [
        "Generate components for reusable UI inside a feature or shared surface.",
        "Generate pages for routeable screens that belong in the router table.",
        "Use --feature to keep generated files grouped by domain instead of dumping them into a flat folder."
      ],
      "code": {
        "title": "Generate role files",
        "code": "vr generate page settings --feature admin\\nvr generate component filter-panel --feature search"
      }
    },
    {
      "id": "add",
      "title": "vr add",
      "body": "Use vr add when the project needs UI primitives installed into the local app. The command updates source files and package dependencies together, which avoids the half-installed state that happens when a component is copied without its tokens or tests.",
      "points": [
        "Pass one primitive for a focused installation or multiple primitives for a small UI batch.",
        "Use --test when the primitive should include testing support and test dependencies.",
        "Run doctor afterward if dependency or file edits were interrupted."
      ],
      "code": {
        "title": "Add UI primitives",
        "code": "vr add button --test\\nvr add card dialog"
      }
    },
    {
      "id": "remove",
      "title": "vr remove",
      "body": "Use vr remove when a generated or optional Vanrot surface should be cleaned out through the same package-aware command surface that installed it. Phase 16H starts with behavior helpers so projects can prune opt-in controller dependencies without hand-editing config and package metadata.",
      "points": [
        "Run vr remove behavior --behavior tooltip to remove a specific helper from behavior.enabled.",
        "Run vr remove behavior --all when the app should drop every optional behavior helper and the @vanrot/behavior dependency.",
        "Use --package when the cleanup should update a package.json outside the default root."
      ],
      "code": {
        "title": "Remove behavior helpers",
        "code": "vr remove behavior --behavior tooltip\\nvr remove behavior --all"
      }
    },
    {
      "id": "ui",
      "title": "vr ui",
      "body": "Use vr ui when you need to inspect the UI registry before installing or documenting primitives. It is a discovery command, not a file writer, so it is safe to run while deciding which primitive API or token group a page should use.",
      "points": [
        "Run vr ui list to see the current primitive names exposed by @vanrot/ui.",
        "Run vr ui <component> --help to inspect a primitive's API, tokens, and local usage shape.",
        "Use this before writing docs so examples match the generated component surface."
      ],
      "code": {
        "title": "Inspect UI metadata",
        "code": "vr ui list\\nvr ui button --help"
      }
    },
    {
      "id": "config",
      "title": "vr config",
      "body": "Use vr config for direct configuration repair and migration work. This command is scoped to vanrot.config.ts so project settings stay recoverable without hiding edits inside unrelated create, build, or dev workflows.",
      "points": [
        "Use recover when the config file is missing generated domains or has drifted from the expected shape.",
        "Use migrate when a framework version changes the config schema and the project needs a deliberate rewrite.",
        "Read diagnostics before forcing a rewrite because user-authored settings should stay intact."
      ],
      "code": {
        "title": "Repair config",
        "code": "vr config recover\\nvr config migrate --force"
      }
    },
    {
      "id": "update",
      "title": "vr update",
      "body": "Use vr update when generated project intelligence or framework-managed metadata should be refreshed without changing application feature code. It coordinates narrower commands so teams can choose one target or refresh the whole project map.",
      "points": [
        "Use update map after route or role-file moves so devtools and docs see the current project graph.",
        "Use update ai after docs or conventions change so AI-readable files do not go stale.",
        "Use update all before review when a branch changed several generated surfaces."
      ],
      "code": {
        "title": "Refresh generated metadata",
        "code": "vr update map\\nvr update ai\\nvr update all"
      }
    },
    {
      "id": "upgrade",
      "title": "vr upgrade",
      "body": "Use vr upgrade when framework package versions must move together. The command inspects Vanrot package dependencies, chooses a target version, and can optionally run the package manager install step after package.json is updated.",
      "points": [
        "Run without a version to move to the CLI's default supported target.",
        "Pass an explicit version when a project is pinning framework packages for a release train.",
        "Use --install only when package edits should immediately update the lockfile too."
      ],
      "code": {
        "title": "Upgrade packages",
        "code": "vr upgrade\\nvr upgrade 0.8.0 --install"
      }
    },
    {
      "id": "doctor",
      "title": "vr doctor",
      "body": "Use vr doctor when the project behaves strangely and you need a structured health check before editing files. It validates config, package setup, role-file conventions, optional package drift, and project rules so fixes start from evidence instead of guesswork. Add --inspect when you also need to see the project intelligence summary without writing a new .vanrot/project-map.json file.",
      "points": [
        "Run it after failed generation, package upgrades, or manual file moves.",
        "Use --inspect to include role counts, graph size, route count, i18n count, and stale project-map reasons in the same terminal report.",
        "Use structured output when another tool needs to collect diagnostics; --inspect stays read-only and does not replace vr map when a persisted manifest is needed.",
        "Treat repeated doctor findings as documentation gaps or generator bugs, not as normal project work."
      ],
      "code": {
        "title": "Check project health",
        "code": "vr doctor\\nvr doctor --inspect\\nvr doctor --json"
      }
    },
    {
      "id": "cache",
      "title": "vr cache clean",
      "body": "Use vr cache clean when generated Vanrot metadata should be removed and rebuilt from source. The command is intentionally named clean, not clear, because it cleans only Vanrot-owned local cache paths instead of deleting arbitrary project state.",
      "points": [
        "Run --dry-run first when you want to see exactly which paths would be removed.",
        "The current cleanup target is limited to .vanrot/cache and .vanrot/project-map.json.",
        "The command does not remove vanrot.config.ts, AI doorway files, source files, package files, lockfiles, or user-authored docs."
      ],
      "code": {
        "title": "Clean generated metadata",
        "code": "vr cache clean --dry-run\\nvr cache clean\\nvr update map"
      }
    },
    {
      "id": "map",
      "title": "vr map",
      "body": "Use vr map when a tool or teammate needs the persisted project intelligence manifest. Unlike vr doctor --inspect, this command writes .vanrot/project-map.json so devtools, AI readers, and scripts can read the same graph later.",
      "points": [
        "Run it after route or role-file changes when .vanrot/project-map.json should be refreshed.",
        "Run doctor --inspect first when you only need a terminal summary.",
        "Use JSON output when automation needs the final command result in addition to the generated manifest."
      ],
      "code": {
        "title": "Inspect the project map",
        "code": "vr map\\nvr map --json"
      }
    },
    {
      "id": "init-ai",
      "title": "vr init-ai",
      "body": "Use vr init-ai when a repository needs the local instructions and generated context files that make Vanrot readable to coding agents. The command is a project setup step, not a replacement for current docs or verification.",
      "points": [
        "Run it once for a new project that should expose Vanrot rules to agents.",
        "Run it again after major conventions change so local instructions can be refreshed deliberately.",
        "Review generated rule files before committing because they become durable project guidance."
      ],
      "code": {
        "title": "Initialize AI context",
        "code": "vr init-ai\\nvr init-ai --force"
      }
    },
    {
      "id": "ai",
      "title": "vr ai",
      "body": "Use vr ai for the AI-readable knowledge workflow. It builds, verifies, inspects, and records framework context so generated docs, MCP consumers, and coding agents read the same current framework facts.",
      "points": [
        "Run vr ai build after docs or package metadata changes.",
        "Run vr ai verify before shipping AI-consumption updates.",
        "Use record and summarize when diagnostics or recurring fixes should become searchable project knowledge."
      ],
      "code": {
        "title": "Maintain AI knowledge",
        "code": "vr ai context\\nvr ai build\\nvr ai verify\\nvr ai doctor"
      }
    },
    {
      "id": "dev",
      "title": "vr dev",
      "body": "Use vr dev for the local preview loop. The command loads Vanrot config first, reports config diagnostics, then starts Vite on 127.0.0.1 using the configured dev server port so the app and docs use one predictable entry point.",
      "points": [
        "Fix config errors before expecting Vite to start.",
        "Use it for HMR-driven development of pages, components, and docs.",
        "Debug transform errors in the Vite plugin guide after the command successfully starts Vite."
      ],
      "code": {
        "title": "Start the dev server",
        "code": "vr dev"
      }
    },
    {
      "id": "build",
      "title": "vr build",
      "body": "Use vr build before shipping application or docs changes. The command validates Vanrot config, preserves warnings as visible output, and delegates to vite build so production bundling uses the same plugin pipeline as local development.",
      "points": [
        "Treat config errors as build blockers because generated paths and plugins depend on the config.",
        "Use build output to catch production-only import, CSS, or asset failures.",
        "Pair it with docs and AI verification when documentation content changed."
      ],
      "code": {
        "title": "Build for production",
        "code": "vr build"
      }
    },
    {
      "id": "test",
      "title": "vr test",
      "body": "Use vr test to run the project test suite through the Vanrot command surface. The command loads config diagnostics first, then runs vitest run so local and CI verification share the same non-watch test behavior.",
      "points": [
        "Use it for component, router, generated-file, and docs regression coverage.",
        "Fix config diagnostics before investigating downstream test failures.",
        "Keep command output human-readable locally and structured only when automation needs parsing."
      ],
      "code": {
        "title": "Run tests",
        "code": "vr test"
      }
    }
  ]
} as const;

const sectionLinks = cliCommandSurfaceArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class CommandsPage {
  title(): string {
    return cliCommandSurfaceArticle.title;
  }

  summary(): string {
    return cliCommandSurfaceArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = cliCommandSurfaceArticle.sections[0].body;
  section1Body = cliCommandSurfaceArticle.sections[1].body;
  section2Body = cliCommandSurfaceArticle.sections[2].body;
  section3Body = cliCommandSurfaceArticle.sections[3].body;
  section4Body = cliCommandSurfaceArticle.sections[4].body;
  section5Body = cliCommandSurfaceArticle.sections[5].body;
  section6Body = cliCommandSurfaceArticle.sections[6].body;
  section7Body = cliCommandSurfaceArticle.sections[7].body;
  section8Body = cliCommandSurfaceArticle.sections[8].body;
  section9Body = cliCommandSurfaceArticle.sections[9].body;
  section10Body = cliCommandSurfaceArticle.sections[10].body;
  section11Body = cliCommandSurfaceArticle.sections[11].body;
  section12Body = cliCommandSurfaceArticle.sections[12].body;
  section13Body = cliCommandSurfaceArticle.sections[13].body;
  section14Body = cliCommandSurfaceArticle.sections[14].body;
  section15Body = cliCommandSurfaceArticle.sections[15].body;
  section0Points = cliCommandSurfaceArticle.sections[0].points ?? [];
  section1Points = cliCommandSurfaceArticle.sections[1].points ?? [];
  section2Points = cliCommandSurfaceArticle.sections[2].points ?? [];
  section3Points = cliCommandSurfaceArticle.sections[3].points ?? [];
  section4Points = cliCommandSurfaceArticle.sections[4].points ?? [];
  section5Points = cliCommandSurfaceArticle.sections[5].points ?? [];
  section6Points = cliCommandSurfaceArticle.sections[6].points ?? [];
  section7Points = cliCommandSurfaceArticle.sections[7].points ?? [];
  section8Points = cliCommandSurfaceArticle.sections[8].points ?? [];
  section9Points = cliCommandSurfaceArticle.sections[9].points ?? [];
  section10Points = cliCommandSurfaceArticle.sections[10].points ?? [];
  section11Points = cliCommandSurfaceArticle.sections[11].points ?? [];
  section12Points = cliCommandSurfaceArticle.sections[12].points ?? [];
  section13Points = cliCommandSurfaceArticle.sections[13].points ?? [];
  section14Points = cliCommandSurfaceArticle.sections[14].points ?? [];
  section15Points = cliCommandSurfaceArticle.sections[15].points ?? [];
  section0Code = cliCommandSurfaceArticle.sections[0].code?.code ?? '';
  section1Code = cliCommandSurfaceArticle.sections[1].code?.code ?? '';
  section2Code = cliCommandSurfaceArticle.sections[2].code?.code ?? '';
  section3Code = cliCommandSurfaceArticle.sections[3].code?.code ?? '';
  section4Code = cliCommandSurfaceArticle.sections[4].code?.code ?? '';
  section5Code = cliCommandSurfaceArticle.sections[5].code?.code ?? '';
  section6Code = cliCommandSurfaceArticle.sections[6].code?.code ?? '';
  section7Code = cliCommandSurfaceArticle.sections[7].code?.code ?? '';
  section8Code = cliCommandSurfaceArticle.sections[8].code?.code ?? '';
  section9Code = cliCommandSurfaceArticle.sections[9].code?.code ?? '';
  section10Code = cliCommandSurfaceArticle.sections[10].code?.code ?? '';
  section11Code = cliCommandSurfaceArticle.sections[11].code?.code ?? '';
  section12Code = cliCommandSurfaceArticle.sections[12].code?.code ?? '';
  section13Code = cliCommandSurfaceArticle.sections[13].code?.code ?? '';
  section14Code = cliCommandSurfaceArticle.sections[14].code?.code ?? '';
  section15Code = cliCommandSurfaceArticle.sections[15].code?.code ?? '';
}
