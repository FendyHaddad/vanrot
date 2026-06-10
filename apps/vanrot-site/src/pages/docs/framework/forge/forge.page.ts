import type { DocsSectionLink } from '../../shared/docs-content.ts';

export const forgeArticle = {
  "key": "forge",
  "section": "framework",
  "path": "/docs/forge",
  "label": "Forge",
  "title": "Forge",
  "summary": "@vanrot/forge is the native Vanrot app engine. It runs dev and build without Vite when a project chooses the Forge engine, while keeping Vite available as an explicit compatibility engine.",
  "status": "production-ready-through-phase-32",
  "sections": [
    {
      "id": "engine-boundary",
      "title": "Engine boundary",
      "body": "Forge is not a general bundler and it is not a Vite replacement for every frontend stack. It is the Vanrot-native execution engine: it understands Vanrot role files, the Vanrot compiler, the Vanrot router graph, and the first-party diagnostics contract. That smaller target is the reason Forge can stay focused and avoid compatibility work for React, Vue, Svelte, or arbitrary plugin ecosystems.",
      "points": [
        "Use Forge when the app is a Vanrot app and you want the first-party engine path.",
        "Use Vite when a project explicitly chooses the compatibility engine or needs Vite-specific integration behavior.",
        "Keep engine choice in Vanrot configuration and CLI flags instead of hiding it inside application code.",
        "Treat Forge as the default Vanrot path, with Vite remaining a supported option."
      ],
      "code": {
        "title": "Engine choice in configuration",
        "code": "import { defineVanrotConfig } from '@vanrot/config';\n\nexport default defineVanrotConfig({\n  engine: 'forge',\n  source: {\n    root: 'src',\n  },\n});"
      }
    },
    {
      "id": "command-surface",
      "title": "Command surface",
      "body": "The same CLI commands stay stable for users. A project still runs vr dev and vr build; the configured engine decides whether those commands dispatch to Forge or Vite. Create flows can choose the engine up front, and one-command flags can override the local config when a maintainer needs to compare paths.",
      "points": [
        "vr create defaults to Forge for new Vanrot projects.",
        "vr create --engine vite keeps the Vite app shape available.",
        "vr dev and vr build read vanrot.config.ts and dispatch to the selected engine.",
        "Engine flags are command-level overrides, not a reason to fork the app template."
      ],
      "code": {
        "title": "Stable app scripts",
        "code": "{\n  \"scripts\": {\n    \"dev\": \"vr dev\",\n    \"build\": \"vr build\"\n  },\n  \"dependencies\": {\n    \"@vanrot/forge\": \"workspace:*\"\n  }\n}"
      }
    },
    {
      "id": "graph-and-diagnostics",
      "title": "Graph and diagnostics",
      "body": "Forge builds a Vanrot app graph before serving or building. The graph starts with config, scans role files, classifies owners and sibling assets, discovers routes, and passes compiler diagnostics through Forge diagnostic codes. This gives the engine a framework-level view instead of a generic file-transform view.",
      "points": [
        "createForgeAppGraph reads project config and source root before scanning files.",
        "Role files keep page, component, layout, widget, and form ownership explicit.",
        "Compiler failures become Forge diagnostics so CLI output, docs, and health checks share the same vocabulary.",
        "Unsupported role surfaces warn during the MVP instead of pretending they are compiled."
      ],
      "code": {
        "title": "Forge graph API",
        "code": "import {\n  createForgeAppGraph,\n  discoverForgeRoutes,\n  formatForgeDiagnostic,\n} from '@vanrot/forge';\n\nconst graph = await createForgeAppGraph(process.cwd());\nconst routes = discoverForgeRoutes(graph.files);\nconst messages = graph.diagnostics.map(formatForgeDiagnostic);"
      }
    },
    {
      "id": "child-guides",
      "title": "Child guides",
      "body": "Forge documentation is split by operating surface because the engine has real product boundaries. The dev guide covers the native server and reload planner. The build guide covers generated output and failure behavior. Config explains engine selection and graph inputs. Hooks explains first-party metadata channels. Benchmarks explain how to measure Forge without making unsupported speed claims.",
      "points": [
        "Read Dev for native server behavior, SSE events, and reload actions.",
        "Read Build for generated files, diagnostics output, and deployment boundaries.",
        "Read Config for engine selection, role suffixes, and doctor checks.",
        "Read Benchmarks before publishing any speed or dependency claim."
      ],
      "code": {
        "title": "Guide map",
        "code": "/docs/forge/dev\n/docs/forge/build\n/docs/forge/config\n/docs/forge/hooks\n/docs/forge/benchmarks"
      }
    }
  ]
} as const;

const sectionLinks: DocsSectionLink[] = forgeArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
}));

export class ForgePage {
  title(): string {
    return forgeArticle.title;
  }

  summary(): string {
    return forgeArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = forgeArticle.sections[0].body;
  section1Body = forgeArticle.sections[1].body;
  section2Body = forgeArticle.sections[2].body;
  section3Body = forgeArticle.sections[3].body;
  section0Points = forgeArticle.sections[0].points ?? [];
  section1Points = forgeArticle.sections[1].points ?? [];
  section2Points = forgeArticle.sections[2].points ?? [];
  section3Points = forgeArticle.sections[3].points ?? [];
  section0CodeTitle = forgeArticle.sections[0].code?.title ?? '';
  section1CodeTitle = forgeArticle.sections[1].code?.title ?? '';
  section2CodeTitle = forgeArticle.sections[2].code?.title ?? '';
  section3CodeTitle = forgeArticle.sections[3].code?.title ?? '';
  section0Code = forgeArticle.sections[0].code?.code ?? '';
  section1Code = forgeArticle.sections[1].code?.code ?? '';
  section2Code = forgeArticle.sections[2].code?.code ?? '';
  section3Code = forgeArticle.sections[3].code?.code ?? '';
}
