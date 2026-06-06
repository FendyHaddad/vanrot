import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const configurationDefaultsArticle = {
  "key": "configurationDefaults",
  "section": "framework",
  "path": "/docs/configuration/defaults",
  "label": "Defaults",
  "title": "Configuration Defaults",
  "summary": "Configuration defaults explain what @vanrot/config supplies when a project leaves optional settings out.",
  "status": "production-ready-through-phase-13",
  "sections": [
    {
      "id": "default-values",
      "title": "Default values",
      "body": "The defaults keep fresh projects small. The default source root is src, the local docs/site preview port is 1964 in this workspace, the default UI flavor is october, and the default UI style mode is vanrotstyles.",
      "points": [
        "Leave sourceRoot unset when the project uses src.",
        "Set devServerPort only when the default conflicts with another local service.",
        "Keep UI defaults until the design system intentionally changes."
      ],
      "code": {
        "title": "Normalize defaults",
        "code": "import { normalizeVanrotConfig } from '@vanrot/config';\\n\\nconst config = normalizeVanrotConfig({});\\nconsole.log(config.sourceRoot);"
      }
    },
    {
      "id": "why-defaults",
      "title": "Why defaults exist",
      "body": "Defaults make new projects usable without hiding behavior from mature projects. A package can rely on a normalized config, while the source file can stay compact until the project needs a custom root, UI, router, or AI domain.",
      "points": [
        "Defaults reduce boilerplate in starter projects.",
        "Normalized values keep package code simple.",
        "Explicit config still wins when a project needs a different shape."
      ]
    },
    {
      "id": "debug-defaults",
      "title": "Debug defaults",
      "body": "When behavior looks surprising, ask whether the value came from the config file or from normalization. This is especially important for source roots, generated UI style, and router diagnostics because defaults can affect many files.",
      "points": [
        "Inspect the loaded config in CLI diagnostics.",
        "Check normalized values before debugging the compiler.",
        "Prefer documenting a deliberate override over relying on a surprising implicit default."
      ]
    }
  ]
} as const;

const sectionLinks = configurationDefaultsArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class DefaultsPage {
  title(): string {
    return configurationDefaultsArticle.title;
  }

  summary(): string {
    return configurationDefaultsArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = configurationDefaultsArticle.sections[0].body;
  section1Body = configurationDefaultsArticle.sections[1].body;
  section2Body = configurationDefaultsArticle.sections[2].body;
  section0Points = configurationDefaultsArticle.sections[0].points ?? [];
  section1Points = configurationDefaultsArticle.sections[1].points ?? [];
  section2Points = configurationDefaultsArticle.sections[2].points ?? [];
  section0Code = configurationDefaultsArticle.sections[0].code?.code ?? '';
}
