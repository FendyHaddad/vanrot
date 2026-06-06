import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const cliProjectIntelligenceArticle = {
  "key": "cliProjectIntelligence",
  "section": "framework",
  "path": "/docs/cli/project-intelligence",
  "label": "Project Intelligence",
  "title": "CLI Project Intelligence",
  "summary": "Project intelligence commands let Vanrot explain what it sees in the project, either as a doctor report, a persisted project map, or AI-readable context artifacts.",
  "status": "production-ready-through-phase-23",
  "sections": [
    {
      "id": "mental-model",
      "title": "Mental model",
      "body": "Project intelligence is Vanrot's read model of the app. It is built from source files, config, route metadata, role suffixes, imports, i18n files, compiler metadata, and generated graph contracts. The CLI exposes that model in two different ways: doctor --inspect for a terminal summary, and vr map for a persisted manifest.",
      "points": [
        "Use doctor --inspect when a human wants to understand the project immediately.",
        "Use vr map when devtools, scripts, or AI readers need .vanrot/project-map.json on disk.",
        "Use vr cache clean when generated local metadata should be removed and rebuilt from source."
      ],
      "code": {
        "title": "Inspect, persist, reset",
        "code": "vr doctor --inspect\\nvr map\\nvr cache clean --dry-run"
      }
    },
    {
      "id": "doctor-inspect",
      "title": "Doctor inspect",
      "body": "vr doctor --inspect keeps inspection inside the health command instead of adding a separate vr inspect command. That gives developers one doorway for local understanding: normal doctor output explains what is wrong, while the inspect section explains what Vanrot currently understands about roles, routes, graph metadata, i18n, and stale project-map reasons.",
      "points": [
        "The inspect section is read-only; it builds the project map in memory and does not write .vanrot/project-map.json.",
        "The report keeps health findings and intelligence summary together so missing config, stale graphs, and structural surprises are visible in one command.",
        "Standalone vr inspect is intentionally not a command. The CLI redirects that mental model to vr doctor --inspect."
      ],
      "code": {
        "title": "Read-only project model",
        "code": "vr doctor --inspect\\n\\n# Use structured result output only when automation needs the command result.\\nvr doctor --inspect --json"
      }
    },
    {
      "id": "map-command",
      "title": "Map command",
      "body": "vr map writes the local project map used by devtools, scripts, and AI readers. It discovers role files, groups pages, components, dialogs, layouts, widgets, and forms, then records route and compiler metadata in a schema-versioned graph manifest.",
      "points": [
        "Run vr map after moving role files, changing route structure, or cleaning caches.",
        "Treat .vanrot/project-map.json as generated project intelligence that can be deleted and regenerated.",
        "Use doctor --inspect first when you only need a summary and do not want to touch generated files."
      ],
      "code": {
        "title": "Refresh project map",
        "code": "vr map\\nvr update map"
      }
    },
    {
      "id": "cache-clean",
      "title": "Cache clean",
      "body": "vr cache clean removes Vanrot-owned generated local metadata so the project can rebuild it from source. The command deliberately uses clean rather than clear: it does not promise to erase every cache in the JavaScript toolchain, and it does not touch user-authored files.",
      "points": [
        "Run vr cache clean --dry-run before deleting anything; the output lists the exact Vanrot-owned paths.",
        "The current allowlist is .vanrot/cache and .vanrot/project-map.json.",
        "After cleaning the project map, run vr doctor --inspect for a read-only check or vr map when the manifest should be written again."
      ],
      "code": {
        "title": "Clean and rebuild",
        "code": "vr cache clean --dry-run\\nvr cache clean\\nvr map"
      }
    },
    {
      "id": "ai-commands",
      "title": "AI commands",
      "body": "init-ai and ai prepare local context for AI-assisted work. They should stay tied to real docs, package metadata, and project scans so AI consumers receive canonical information instead of invented framework behavior.",
      "points": [
        "Use init-ai before expecting AI files to exist in a fresh workspace.",
        "Regenerate AI context after docs or package APIs change.",
        "Keep AI artifacts thin consumers of canonical project data."
      ]
    },
    {
      "id": "freshness",
      "title": "Freshness",
      "body": "Project intelligence is only useful when it is fresh. If devtools, CLI help, or AI output disagrees with source files, inspect first, then rebuild the generated artifact that is stale. Do not patch generated JSON by hand when source-owned commands can recreate it.",
      "points": [
        "Check doctor --inspect for role, route, graph, i18n, and stale-state clues.",
        "Rerun vr map after route or role-file changes when .vanrot/project-map.json is the stale artifact.",
        "Rerun AI docs generation after large documentation edits, then verify the docs bundle before shipping."
      ]
    }
  ]
} as const;

const sectionLinks = cliProjectIntelligenceArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class ProjectIntelligencePage {
  title(): string {
    return cliProjectIntelligenceArticle.title;
  }

  summary(): string {
    return cliProjectIntelligenceArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = cliProjectIntelligenceArticle.sections[0].body;
  section1Body = cliProjectIntelligenceArticle.sections[1].body;
  section2Body = cliProjectIntelligenceArticle.sections[2].body;
  section3Body = cliProjectIntelligenceArticle.sections[3].body;
  section4Body = cliProjectIntelligenceArticle.sections[4].body;
  section5Body = cliProjectIntelligenceArticle.sections[5].body;
  section0Points = cliProjectIntelligenceArticle.sections[0].points ?? [];
  section1Points = cliProjectIntelligenceArticle.sections[1].points ?? [];
  section2Points = cliProjectIntelligenceArticle.sections[2].points ?? [];
  section3Points = cliProjectIntelligenceArticle.sections[3].points ?? [];
  section4Points = cliProjectIntelligenceArticle.sections[4].points ?? [];
  section5Points = cliProjectIntelligenceArticle.sections[5].points ?? [];
  section0Code = cliProjectIntelligenceArticle.sections[0].code?.code ?? '';
  section1Code = cliProjectIntelligenceArticle.sections[1].code?.code ?? '';
  section2Code = cliProjectIntelligenceArticle.sections[2].code?.code ?? '';
  section3Code = cliProjectIntelligenceArticle.sections[3].code?.code ?? '';
}
