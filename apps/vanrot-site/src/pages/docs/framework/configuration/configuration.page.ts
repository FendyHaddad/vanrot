import type { DocsSectionLink } from '../../shared/docs-content.ts';

export const configurationArticle = {
  "key": "configuration",
  "section": "framework",
  "path": "/docs/configuration",
  "label": "Configuration",
  "title": "Configuration",
  "summary": "@vanrot/config owns vanrot.config.ts, default normalization, validation, migration, recovery, generated domain editing, router diagnostics settings, UI settings, and AI rules settings.",
  "status": "production-ready-through-phase-13",
  "sections": [
    {
      "id": "config-boundary",
      "title": "Config boundary",
      "body": "Configuration is the typed agreement between project files and framework packages. The config package loads vanrot.config.ts, applies defaults, validates domains, and gives the compiler, router, CLI, Vite plugin, UI generator, devtools, and AI tools the same project facts.",
      "points": [
        "Use defineVanrotConfig so TypeScript can check the public config shape.",
        "Use normalizeVanrotConfig at package boundaries that need defaults.",
        "Use validateVanrotConfig when a command should report user-facing config diagnostics."
      ],
      "code": {
        "title": "Typed config file",
        "code": "import { defineVanrotConfig } from '@vanrot/config';\\n\\nexport default defineVanrotConfig({\\n  sourceRoot: 'src',\\n  devServerPort: 1964,\\n});"
      }
    },
    {
      "id": "domain-map",
      "title": "Domain map",
      "body": "The config file is split into domains so each framework package can read what it owns without parsing unrelated application decisions. UI, router, and AI settings are explicit domains instead of hidden magic inside command flags.",
      "points": [
        "The UI domain controls flavor and style mode for generated primitive files.",
        "The router domain controls diagnostics and navigation polish behavior.",
        "The AI domain controls rule sections and generated project context behavior."
      ]
    },
    {
      "id": "maintenance-flow",
      "title": "Maintenance flow",
      "body": "Config maintenance is part of the product surface. Migrate renders the canonical file, recover repairs missing or damaged config, and generated-domain editors update only the sections the framework owns.",
      "points": [
        "Use migrate for old config shape changes.",
        "Use recover when the project cannot load config at all.",
        "Use upsertVanrotConfigDomain when a tool needs to update one generated domain."
      ],
      "code": {
        "title": "Config APIs",
        "code": "import { loadVanrotProjectConfig, normalizeVanrotConfig, validateVanrotConfig } from '@vanrot/config';\\n\\nconst loaded = await loadVanrotProjectConfig(process.cwd());\\nconst config = normalizeVanrotConfig(loaded.config);\\nconst diagnostics = validateVanrotConfig(config);"
      }
    },
    {
      "id": "child-guides",
      "title": "Child guides",
      "body": "The child pages separate the practical decisions: how the config file is shaped, which defaults matter, how UI generation reads config, how router settings behave, how AI rules are stored, and how migration or recovery should be used.",
      "points": [
        "Start with Config File before changing sourceRoot or devServerPort.",
        "Use Router Config before changing navigation diagnostics.",
        "Use Maintenance when a config file is stale or generated domains need repair."
      ]
    }
  ]
} as const;

const sectionLinks = configurationArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class ConfigurationPage {
  title(): string {
    return configurationArticle.title;
  }

  summary(): string {
    return configurationArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = configurationArticle.sections[0].body;
  section1Body = configurationArticle.sections[1].body;
  section2Body = configurationArticle.sections[2].body;
  section3Body = configurationArticle.sections[3].body;
  section0Points = configurationArticle.sections[0].points ?? [];
  section1Points = configurationArticle.sections[1].points ?? [];
  section2Points = configurationArticle.sections[2].points ?? [];
  section3Points = configurationArticle.sections[3].points ?? [];
  section0Code = configurationArticle.sections[0].code?.code ?? '';
  section2Code = configurationArticle.sections[2].code?.code ?? '';
}
