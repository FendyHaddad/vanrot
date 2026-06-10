import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const forgeConfigArticle = {
  "key": "forgeConfig",
  "section": "framework",
  "path": "/docs/forge/config",
  "label": "Config",
  "title": "Forge Config",
  "summary": "Forge config is the engine decision point. vanrot.config.ts selects Forge or Vite, defines the source root, and gives the native engine enough structure to build the Vanrot app graph.",
  "status": "production-ready-through-phase-32",
  "sections": [
    {
      "id": "engine-field",
      "title": "Engine field",
      "body": "Vanrot now treats the app engine as a first-class project setting. The engine field accepts forge or vite, defaults to forge, and is validated by @vanrot/config before CLI commands dispatch. That keeps the default native path simple while still making Vite an explicit project choice.",
      "points": [
        "engine: 'forge' selects @vanrot/forge for dev and build.",
        "engine: 'vite' selects the Vite plugin path.",
        "Missing engine values default to forge.",
        "Invalid values produce VRCFG021 with a concrete suggestion."
      ],
      "code": {
        "title": "Forge default config",
        "code": "import { defineVanrotConfig } from '@vanrot/config';\n\nexport default defineVanrotConfig({\n  engine: 'forge',\n  source: {\n    root: 'src',\n  },\n});"
      }
    },
    {
      "id": "project-graph",
      "title": "Project graph",
      "body": "Forge config feeds the app graph. The graph loader resolves the project root, reads Vanrot config, computes the source root, scans role files, classifies sibling ownership, and discovers page routes. Dev, build, diagnostics, benchmarks, and future metadata hooks all depend on that same graph shape.",
      "points": [
        "Config owns the source root; Forge does not guess from arbitrary folders.",
        "Graph creation records source files before route discovery.",
        "Route discovery uses page role files as the route boundary.",
        "Diagnostics can report config and graph failures before compile work starts."
      ],
      "code": {
        "title": "Create a graph from config",
        "code": "import { createForgeAppGraph } from '@vanrot/forge';\n\nconst graph = await createForgeAppGraph(process.cwd());\n\nconsole.log(graph.config.engine);\nconsole.log(graph.sourceRoot);\nconsole.log(graph.routes.length);"
      }
    },
    {
      "id": "role-files",
      "title": "Role files",
      "body": "Forge only stays small if role files remain explicit. The classifier recognizes Vanrot suffixes for pages, components, layouts, widgets, and forms, then finds matching HTML and CSS siblings when a file belongs to a role owner. The engine can then serve, reload, diagnose, and build from framework meaning instead of filename luck.",
      "points": [
        ".page.ts files own routes.",
        ".component.ts files own reusable component roles.",
        ".layout.ts files own layout roles.",
        ".widget.ts and .form.ts are recognized for graph and diagnostics boundaries.",
        ".page.html and .page.css stay as sibling assets, not markup in TypeScript."
      ],
      "code": {
        "title": "Role suffixes",
        "code": "import {\n  classifyForgeFileRole,\n  forgeRoleSuffix,\n} from '@vanrot/forge';\n\nconsole.log(forgeRoleSuffix.page);\nconsole.log(classifyForgeFileRole('src/pages/home/home.page.ts'));"
      }
    },
    {
      "id": "doctor-diagnostics",
      "title": "Doctor diagnostics",
      "body": "The CLI doctor checks package boundaries against the selected engine. A Forge app should depend on @vanrot/forge and should not need Vite packages. A Vite app should keep vite and @vanrot/vite-plugin available. Config diagnostics and doctor diagnostics tell the user which boundary is wrong instead of asking them to infer it from a failed command.",
      "points": [
        "Forge projects use @vanrot/forge as the engine package.",
        "Vite projects use vite and @vanrot/vite-plugin.",
        "VRCFG021 catches invalid engine values at config validation time.",
        "Doctor output keeps engine package advice separate from compiler or route diagnostics."
      ],
      "code": {
        "title": "Engine-aware doctor",
        "code": "pnpm exec vr doctor\n\n# Forge app should have @vanrot/forge\n# Vite app should have vite and @vanrot/vite-plugin"
      }
    }
  ]
} as const;

const sectionLinks: DocsSectionLink[] = forgeConfigArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
}));

export class ConfigPage {
  title(): string {
    return forgeConfigArticle.title;
  }

  summary(): string {
    return forgeConfigArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = forgeConfigArticle.sections[0].body;
  section1Body = forgeConfigArticle.sections[1].body;
  section2Body = forgeConfigArticle.sections[2].body;
  section3Body = forgeConfigArticle.sections[3].body;
  section0Points = forgeConfigArticle.sections[0].points ?? [];
  section1Points = forgeConfigArticle.sections[1].points ?? [];
  section2Points = forgeConfigArticle.sections[2].points ?? [];
  section3Points = forgeConfigArticle.sections[3].points ?? [];
  section0CodeTitle = forgeConfigArticle.sections[0].code?.title ?? '';
  section1CodeTitle = forgeConfigArticle.sections[1].code?.title ?? '';
  section2CodeTitle = forgeConfigArticle.sections[2].code?.title ?? '';
  section3CodeTitle = forgeConfigArticle.sections[3].code?.title ?? '';
  section0Code = forgeConfigArticle.sections[0].code?.code ?? '';
  section1Code = forgeConfigArticle.sections[1].code?.code ?? '';
  section2Code = forgeConfigArticle.sections[2].code?.code ?? '';
  section3Code = forgeConfigArticle.sections[3].code?.code ?? '';
}
