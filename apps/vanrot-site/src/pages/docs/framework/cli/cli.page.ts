import type { DocsSectionLink } from '../../shared/docs-content.ts';

export const cliArticle = {
  "key": "cli",
  "section": "framework",
  "path": "/docs/cli",
  "label": "CLI",
  "title": "CLI",
  "summary": "@vanrot/cli is the project operator for Vanrot applications. It creates projects, writes role files, installs UI primitives, repairs configuration, runs Vite tasks, checks local health, and builds the project intelligence files used by devtools and AI readers.",
  "status": "demo-capable-through-phase-14",
  "sections": [
    {
      "id": "cli-boundary",
      "title": "CLI boundary",
      "body": "The CLI is not a separate framework runtime. It is the command surface that keeps a Vanrot workspace shaped correctly while the runtime, compiler, router, config package, Vite plugin, testing helpers, and devtools keep their own focused responsibilities.",
      "points": [
        "Use create for a new application shell instead of hand-copying starter files.",
        "Use generate when adding a role file because it applies Vanrot naming and suffix conventions.",
        "Use doctor when the workspace feels wrong, doctor --inspect when you need to see Vanrot's project model, and cache clean when generated local metadata needs a reset."
      ],
      "code": {
        "title": "Common project commands",
        "code": "vr create admin-console\\nvr generate page settings\\nvr add button card dialog\\nvr doctor --inspect\\nvr cache clean --dry-run"
      }
    },
    {
      "id": "command-map",
      "title": "Command map",
      "body": "Commands are grouped by workflow instead of by implementation file. Project creation starts the workspace, generation writes role files, UI commands add primitives, configuration commands repair config, doctor checks and inspects the project, cache commands reset Vanrot-owned local metadata, and task runners delegate to Vite.",
      "points": [
        "create, generate, add, and ui change source files.",
        "config, update, upgrade, doctor, cache, map, init-ai, and ai maintain project metadata.",
        "dev, build, and test wrap the local application workflow."
      ]
    },
    {
      "id": "output-contract",
      "title": "Output contract",
      "body": "CLI output is designed for people first, with structured modes available when another tool needs to consume the result. The shared reporter parses --quiet, --verbose, --no-color, --no-interactive, --json, and --jsonl before a command executes.",
      "points": [
        "Use human output while working locally because grouped messages are easier to scan.",
        "Use --json for one machine-readable result object.",
        "Use --jsonl when a long-running integration wants event-style output."
      ],
      "code": {
        "title": "Structured output modes",
        "code": "vr map --json\\nvr doctor --jsonl\\nvr build --quiet --no-color"
      }
    },
    {
      "id": "child-guides",
      "title": "Child guides",
      "body": "The child pages explain each practical CLI surface in detail: command discovery, project creation, role generation, UI primitive installation, configuration maintenance, project intelligence, cache maintenance, task-runner overview, and separate deep dives for vr dev, vr build, and vr test.",
      "points": [
        "Start with Command Surface when you need the full command inventory.",
        "Use Project Intelligence when doctor --inspect, devtools, AI bundles, or graph metadata need to agree.",
        "Use the Dev Server, Build, and Test pages when one lifecycle command needs detailed debugging."
      ]
    }
  ]
} as const;

const sectionLinks = cliArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class CliPage {
  title(): string {
    return cliArticle.title;
  }

  summary(): string {
    return cliArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = cliArticle.sections[0].body;
  section1Body = cliArticle.sections[1].body;
  section2Body = cliArticle.sections[2].body;
  section3Body = cliArticle.sections[3].body;
  section0Points = cliArticle.sections[0].points ?? [];
  section1Points = cliArticle.sections[1].points ?? [];
  section2Points = cliArticle.sections[2].points ?? [];
  section3Points = cliArticle.sections[3].points ?? [];
  section0Code = cliArticle.sections[0].code?.code ?? '';
  section2Code = cliArticle.sections[2].code?.code ?? '';
}
