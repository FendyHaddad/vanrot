import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const configurationFileArticle = {
  "key": "configurationFile",
  "section": "framework",
  "path": "/docs/configuration/file",
  "label": "Config File",
  "title": "Configuration File",
  "summary": "The config file guide explains how vanrot.config.ts is authored, loaded, typed, and shared across packages.",
  "status": "production-ready-through-phase-13",
  "sections": [
    {
      "id": "file-purpose",
      "title": "File purpose",
      "body": "vanrot.config.ts is the project-level source of truth for framework settings. It should be short, typed, and readable because many packages use it to make build, generation, routing, and intelligence decisions.",
      "points": [
        "Keep framework settings in vanrot.config.ts instead of scattering command flags.",
        "Use defineVanrotConfig to preserve object literals while checking the public type.",
        "Keep application secrets out of the config file because docs, tools, and AI readers may inspect it."
      ],
      "code": {
        "title": "Minimal config",
        "code": "import { defineVanrotConfig } from '@vanrot/config';\\n\\nexport default defineVanrotConfig({\\n  sourceRoot: 'src',\\n  devServerPort: 1964,\\n});"
      }
    },
    {
      "id": "loading",
      "title": "Loading",
      "body": "Package entry points should load config through @vanrot/config instead of importing project files manually. The loader returns a LoadedVanrotConfig value so callers can keep path and config details together.",
      "points": [
        "Load from the project root used by the current command or plugin.",
        "Normalize after loading when defaults are needed.",
        "Report diagnostics before continuing when validation finds user-facing issues."
      ]
    },
    {
      "id": "editing",
      "title": "Editing",
      "body": "Tools that update config should edit generated domains through config helpers instead of string replacement. This preserves user-authored settings and keeps generated sections recognizable for future upgrades.",
      "points": [
        "Use upsertVanrotConfigDomain for generated domains.",
        "Use removeVanrotConfigDomainIfGenerated when removing a generated block.",
        "Avoid rewriting the whole file unless the user ran an explicit migration command."
      ]
    }
  ]
} as const;

const sectionLinks = configurationFileArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class FilePage {
  title(): string {
    return configurationFileArticle.title;
  }

  summary(): string {
    return configurationFileArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = configurationFileArticle.sections[0].body;
  section1Body = configurationFileArticle.sections[1].body;
  section2Body = configurationFileArticle.sections[2].body;
  section0Points = configurationFileArticle.sections[0].points ?? [];
  section1Points = configurationFileArticle.sections[1].points ?? [];
  section2Points = configurationFileArticle.sections[2].points ?? [];
  section0Code = configurationFileArticle.sections[0].code?.code ?? '';
}
