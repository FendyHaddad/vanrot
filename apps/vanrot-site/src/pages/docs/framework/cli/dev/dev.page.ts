import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const cliDevServerArticle = {
  "key": "cliDevServer",
  "section": "framework",
  "path": "/docs/cli/dev",
  "label": "Dev Server",
  "title": "CLI Dev Server",
  "summary": "vr dev starts the local Vanrot preview loop by validating project config and then running Vite with the configured host and port.",
  "status": "demo-capable-through-phase-14",
  "sections": [
    {
      "id": "what-dev-runs",
      "title": "What vr dev runs",
      "body": "vr dev is the command for the local feedback loop. It is not a custom server hidden behind the framework; it loads Vanrot config, prints config diagnostics, and then delegates to Vite with a stable 127.0.0.1 host and the configured dev server port.",
      "points": [
        "The command starts by calling the config loader so config errors stop before Vite boots.",
        "The default host is explicit because local docs and browser checks should not drift between localhost aliases.",
        "The Vite process still owns transforms, HMR, module loading, and browser refresh behavior."
      ],
      "code": {
        "title": "Start development",
        "code": "vr dev"
      }
    },
    {
      "id": "config-handshake",
      "title": "Config handshake",
      "body": "The dev command depends on vanrot.config.ts because the configured devServer.port is passed directly to Vite. That makes port changes visible in one config file instead of spreading magic numbers through package scripts, docs, and local browser automation.",
      "points": [
        "Fix config diagnostics before debugging Vite because dev will return early on config errors.",
        "Use the configuration guide when a port, route, UI, or AI domain looks stale.",
        "Keep the configured port stable for teams that share scripts or local documentation links."
      ],
      "code": {
        "title": "Dev server config",
        "code": "export default defineVanrotConfig({\\n  devServer: {\\n    port: 1964,\\n  },\\n});"
      }
    },
    {
      "id": "hmr-debugging",
      "title": "HMR debugging",
      "body": "When vr dev starts successfully but the browser output is wrong, move debugging to the transform and runtime layers. Template compilation, role-file transforms, virtual modules, and runtime signals all execute after the CLI has already done its job.",
      "points": [
        "Use the Vite plugin hot reload guide for stale generated modules or template output.",
        "Use compiler docs for invalid template syntax, event bindings, @if, @else, and @for output.",
        "Use runtime docs when signals, controllers, effects, or cleanup behavior look wrong after reload."
      ]
    },
    {
      "id": "daily-workflow",
      "title": "Daily workflow",
      "body": "A healthy local loop starts with vr dev, then uses focused docs routes, component previews, and browser checks to confirm the exact surface being edited. The command should stay boring so the developer can focus on the page or framework behavior.",
      "points": [
        "Restart vr dev after config changes because the port and plugin setup are loaded at process start.",
        "Keep terminal output human-readable during local work so warnings are visible without opening logs.",
        "Use vr doctor when dev repeatedly fails before Vite receives control."
      ],
      "code": {
        "title": "Local loop",
        "code": "vr doctor\\nvr dev"
      }
    }
  ]
} as const;

const sectionLinks = cliDevServerArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class DevPage {
  title(): string {
    return cliDevServerArticle.title;
  }

  summary(): string {
    return cliDevServerArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = cliDevServerArticle.sections[0].body;
  section1Body = cliDevServerArticle.sections[1].body;
  section2Body = cliDevServerArticle.sections[2].body;
  section3Body = cliDevServerArticle.sections[3].body;
  section0Points = cliDevServerArticle.sections[0].points ?? [];
  section1Points = cliDevServerArticle.sections[1].points ?? [];
  section2Points = cliDevServerArticle.sections[2].points ?? [];
  section3Points = cliDevServerArticle.sections[3].points ?? [];
  section0Code = cliDevServerArticle.sections[0].code?.code ?? '';
  section1Code = cliDevServerArticle.sections[1].code?.code ?? '';
  section3Code = cliDevServerArticle.sections[3].code?.code ?? '';
}
