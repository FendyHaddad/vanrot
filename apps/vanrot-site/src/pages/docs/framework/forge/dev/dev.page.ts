import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const forgeDevArticle = {
  "key": "forgeDev",
  "section": "framework",
  "path": "/docs/forge/dev",
  "label": "Dev",
  "title": "Forge Dev",
  "summary": "Forge dev starts the Vanrot-native development server, serves the app shell and source assets, streams reload events, and reports compiler diagnostics without pulling in Vite.",
  "status": "production-ready-through-phase-32",
  "sections": [
    {
      "id": "native-server",
      "title": "Native server",
      "body": "The Forge dev server is a Node HTTP server owned by @vanrot/forge. It serves the app shell, source files, and the Forge client endpoint, then keeps an event stream open for reload instructions. The default address is intentionally local and predictable so CLI output, docs examples, and tests can share the same target.",
      "points": [
        "startForgeDevServer defaults to 127.0.0.1:1964.",
        "The server exposes /@forge/client for the browser reload client.",
        "The server exposes /@forge/events for Server-Sent Events.",
        "runForgeDev can start the server for CLI use and decide whether the process stays open."
      ],
      "code": {
        "title": "Start the server directly",
        "code": "import { startForgeDevServer } from '@vanrot/forge';\n\nconst server = await startForgeDevServer({\n  cwd: process.cwd(),\n  host: '127.0.0.1',\n  port: 1964,\n});\n\nconsole.log(server.url);\nawait server.close();"
      }
    },
    {
      "id": "reload-planner",
      "title": "Reload planner",
      "body": "Forge reloads from role-file meaning, not from generic extension matching. The planner classifies the changed file, finds the owning role file when the change is a sibling template or stylesheet, and returns the smallest reload action the current engine can safely perform.",
      "points": [
        "vanrot.config.ts changes request a server restart.",
        "Page script and template changes request a route refresh.",
        "Component script and template changes request a component refresh.",
        "Scoped CSS changes request a style patch when the owning role is known.",
        "Unknown files fall back to a full reload."
      ],
      "code": {
        "title": "Reload actions",
        "code": "import { planForgeReload } from '@vanrot/forge';\n\nconst pageReload = planForgeReload('src/pages/home/home.page.html');\nconst styleReload = planForgeReload('src/pages/home/home.page.css');\nconst configReload = planForgeReload('vanrot.config.ts');\n\nconsole.log(pageReload.action);\nconsole.log(styleReload.action);\nconsole.log(configReload.action);"
      }
    },
    {
      "id": "diagnostic-loop",
      "title": "Diagnostic loop",
      "body": "Forge dev collects diagnostics before the browser gets stale assumptions. It compiles page, component, and layout role files through the Vanrot compiler and formats compiler failures as Forge diagnostics. The dev loop can warn on role files that are recognized but not compiled by the first Forge slice yet.",
      "points": [
        "collectForgeDevDiagnostics compiles supported role files through compileComponentFromFiles.",
        "Compiler errors are surfaced as VRFORGE007 diagnostics.",
        "Widget and form roles can be discovered before native compilation support lands.",
        "The diagnostic loop is shared by CLI health checks and engine-facing docs."
      ],
      "code": {
        "title": "Collect dev diagnostics",
        "code": "import {\n  collectForgeDevDiagnostics,\n  formatForgeDiagnostic,\n} from '@vanrot/forge';\n\nconst diagnostics = await collectForgeDevDiagnostics({\n  cwd: process.cwd(),\n});\n\nfor (const diagnostic of diagnostics) {\n  console.log(formatForgeDiagnostic(diagnostic));\n}"
      }
    },
    {
      "id": "current-boundary",
      "title": "Current boundary",
      "body": "Forge dev is already useful because it removes Vite from the default Vanrot app path, but it should be described truthfully. The current engine slice focuses on Vanrot app structure, compiler diagnostics, reload planning, and local serving. It does not promise third-party library compatibility, arbitrary bundler plugins, SSR streaming, or production-grade code splitting.",
      "points": [
        "Do not document Forge as a universal frontend dev server.",
        "Do document that Forge has no React or Vue compatibility burden.",
        "Keep future capabilities visible as future work instead of hiding them behind vague claims.",
        "Use benchmarks to compare the measured Vanrot app path only."
      ],
      "code": {
        "title": "Development command",
        "code": "pnpm exec vr dev\npnpm exec vr dev --engine forge\npnpm exec vr dev --engine vite"
      }
    }
  ]
} as const;

const sectionLinks: DocsSectionLink[] = forgeDevArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
}));

export class DevPage {
  title(): string {
    return forgeDevArticle.title;
  }

  summary(): string {
    return forgeDevArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = forgeDevArticle.sections[0].body;
  section1Body = forgeDevArticle.sections[1].body;
  section2Body = forgeDevArticle.sections[2].body;
  section3Body = forgeDevArticle.sections[3].body;
  section0Points = forgeDevArticle.sections[0].points ?? [];
  section1Points = forgeDevArticle.sections[1].points ?? [];
  section2Points = forgeDevArticle.sections[2].points ?? [];
  section3Points = forgeDevArticle.sections[3].points ?? [];
  section0CodeTitle = forgeDevArticle.sections[0].code?.title ?? '';
  section1CodeTitle = forgeDevArticle.sections[1].code?.title ?? '';
  section2CodeTitle = forgeDevArticle.sections[2].code?.title ?? '';
  section3CodeTitle = forgeDevArticle.sections[3].code?.title ?? '';
  section0Code = forgeDevArticle.sections[0].code?.code ?? '';
  section1Code = forgeDevArticle.sections[1].code?.code ?? '';
  section2Code = forgeDevArticle.sections[2].code?.code ?? '';
  section3Code = forgeDevArticle.sections[3].code?.code ?? '';
}
