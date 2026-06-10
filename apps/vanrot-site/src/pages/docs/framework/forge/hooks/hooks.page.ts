import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const forgeHooksArticle = {
  "key": "forgeHooks",
  "section": "framework",
  "path": "/docs/forge/hooks",
  "label": "Hooks",
  "title": "Forge Hooks",
  "summary": "Forge hooks are first-party metadata and diagnostics hooks for Vanrot tools. They are deliberately not generic bundler plugin hooks.",
  "status": "production-ready-through-phase-32",
  "sections": [
    {
      "id": "first-party-hooks",
      "title": "First-party hooks",
      "body": "Forge exposes a hook registry for Vanrot-owned metadata and diagnostics surfaces. A hook receives the project root, source root, app graph, and current mode. The contract is intentionally narrow so packages can describe Vanrot behavior without gaining arbitrary transform authority over source files.",
      "points": [
        "Hooks run in dev or build mode.",
        "Hook context includes the already-created Forge app graph.",
        "Hook names make output traceable in tests and diagnostics.",
        "The registry rejects generic bundler hook names."
      ],
      "code": {
        "title": "Forge hook shape",
        "code": "import type { ForgeHook } from '@vanrot/forge';\n\nexport const seoMetadataHook: ForgeHook = {\n  name: 'seo-metadata',\n  routeMetadata(context) {\n    return context.graph.routes.map((route) => route.path);\n  },\n};"
      }
    },
    {
      "id": "metadata-channels",
      "title": "Metadata channels",
      "body": "Hooks separate metadata by consumer. Route metadata can feed routing and docs. Build metadata can describe generated output. Devtools metadata can feed inspection. AI metadata can feed generated knowledge files. The channel names stay explicit so consumers do not have to parse one mixed object.",
      "points": [
        "runForgeRouteMetadataHooks collects route-facing metadata.",
        "runForgeBuildMetadataHooks collects build-facing metadata.",
        "runForgeDevtoolsMetadataHooks collects inspection metadata.",
        "runForgeAiMetadataHooks collects AI-reader metadata.",
        "Each channel can grow without breaking the others."
      ],
      "code": {
        "title": "Run metadata hooks",
        "code": "import {\n  createForgeHookRegistry,\n  runForgeAiMetadataHooks,\n  runForgeRouteMetadataHooks,\n} from '@vanrot/forge';\n\nconst registry = createForgeHookRegistry([seoMetadataHook]);\nconst routeMetadata = await runForgeRouteMetadataHooks(registry, context);\nconst aiMetadata = await runForgeAiMetadataHooks(registry, context);"
      }
    },
    {
      "id": "diagnostic-hooks",
      "title": "Diagnostic hooks",
      "body": "Diagnostic hooks let first-party packages report framework-level problems through the same Forge diagnostic surface used by dev and build. This is where package integrations can flag missing metadata, unsupported role combinations, or configuration problems that only appear once the full app graph exists.",
      "points": [
        "Diagnostics hooks return ForgeDiagnostic objects.",
        "The hook registry keeps diagnostics tied to a named hook.",
        "Consumers can format diagnostics with formatForgeDiagnostic.",
        "Diagnostics stay framework-level instead of becoming console-only warnings."
      ],
      "code": {
        "title": "Diagnostic hook",
        "code": "import type { ForgeHook } from '@vanrot/forge';\n\nexport const routeHealthHook: ForgeHook = {\n  name: 'route-health',\n  diagnostics(context) {\n    return context.graph.routes.length === 0\n      ? [{ code: 'VRFORGE005', severity: 'warning', message: 'No Forge routes found.' }]\n      : [];\n  },\n};"
      }
    },
    {
      "id": "unsupported-bundler-hooks",
      "title": "Unsupported bundler hooks",
      "body": "Forge deliberately rejects transform, resolveId, load, handleHotUpdate, and configureServer. Those names belong to generic bundler/plugin ecosystems. Keeping them out of Forge preserves the engine boundary: Forge hooks are for Vanrot diagnostics and metadata, not arbitrary source transformation.",
      "points": [
        "Do not port Vite plugins into Forge hooks by name.",
        "Do not use Forge hooks to transform arbitrary third-party libraries.",
        "Use the Vite engine when a project depends on Vite plugin behavior.",
        "Use Forge hooks when a first-party Vanrot package needs graph-aware metadata."
      ],
      "code": {
        "title": "Rejected hook names",
        "code": "createForgeHookRegistry([\n  {\n    name: 'bad-bundler-hook',\n    transform() {\n      return null;\n    },\n  },\n]);\n\n// Throws: Forge hooks do not support generic bundler hook \"transform\"."
      }
    }
  ]
} as const;

const sectionLinks: DocsSectionLink[] = forgeHooksArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
}));

export class HooksPage {
  title(): string {
    return forgeHooksArticle.title;
  }

  summary(): string {
    return forgeHooksArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = forgeHooksArticle.sections[0].body;
  section1Body = forgeHooksArticle.sections[1].body;
  section2Body = forgeHooksArticle.sections[2].body;
  section3Body = forgeHooksArticle.sections[3].body;
  section0Points = forgeHooksArticle.sections[0].points ?? [];
  section1Points = forgeHooksArticle.sections[1].points ?? [];
  section2Points = forgeHooksArticle.sections[2].points ?? [];
  section3Points = forgeHooksArticle.sections[3].points ?? [];
  section0CodeTitle = forgeHooksArticle.sections[0].code?.title ?? '';
  section1CodeTitle = forgeHooksArticle.sections[1].code?.title ?? '';
  section2CodeTitle = forgeHooksArticle.sections[2].code?.title ?? '';
  section3CodeTitle = forgeHooksArticle.sections[3].code?.title ?? '';
  section0Code = forgeHooksArticle.sections[0].code?.code ?? '';
  section1Code = forgeHooksArticle.sections[1].code?.code ?? '';
  section2Code = forgeHooksArticle.sections[2].code?.code ?? '';
  section3Code = forgeHooksArticle.sections[3].code?.code ?? '';
}
