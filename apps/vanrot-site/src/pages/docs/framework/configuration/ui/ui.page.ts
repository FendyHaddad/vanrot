import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const configurationUiArticle = {
  "key": "configurationUi",
  "section": "framework",
  "path": "/docs/configuration/ui",
  "label": "UI Config",
  "title": "UI Configuration",
  "summary": "UI configuration controls the flavor and style mode used by generated UI primitive files.",
  "status": "production-ready-through-phase-13",
  "sections": [
    {
      "id": "ui-domain",
      "title": "UI domain",
      "body": "The UI domain exists so generated primitives follow the same visual system across the project. CLI add flows, component docs, and generated source should all agree on the configured flavor and style mode.",
      "points": [
        "Use flavor for the broader primitive family.",
        "Use styleMode for generated styling conventions.",
        "Change UI config before adding many primitives so generated files stay consistent."
      ],
      "code": {
        "title": "UI domain",
        "code": "import { defineVanrotConfig } from '@vanrot/config';\\n\\nexport default defineVanrotConfig({\\n  ui: {\\n    flavor: 'october',\\n    styleMode: 'vanrotstyles',\\n  },\\n});"
      }
    },
    {
      "id": "generation-impact",
      "title": "Generation impact",
      "body": "UI config is read by CLI generation rather than by every component at runtime. That means changing it affects future generated files and migration decisions more than already-rendered DOM behavior.",
      "points": [
        "Regenerate or update existing primitives deliberately after a style-mode change.",
        "Do not mix generated files from different style modes without documenting the reason.",
        "Keep primitive docs aligned with the configured UI defaults."
      ]
    },
    {
      "id": "debug-ui-config",
      "title": "Debug UI config",
      "body": "If generated UI files look wrong, inspect config before editing component output. The wrong flavor or style mode can make a correct generator produce files that feel inconsistent with the rest of the project.",
      "points": [
        "Run config validation before regenerating primitives.",
        "Check sourceRoot when generated files land in the wrong folder.",
        "Compare generated primitive names with @vanrot/ui metadata."
      ]
    }
  ]
} as const;

const sectionLinks = configurationUiArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class UiPage {
  title(): string {
    return configurationUiArticle.title;
  }

  summary(): string {
    return configurationUiArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = configurationUiArticle.sections[0].body;
  section1Body = configurationUiArticle.sections[1].body;
  section2Body = configurationUiArticle.sections[2].body;
  section0Points = configurationUiArticle.sections[0].points ?? [];
  section1Points = configurationUiArticle.sections[1].points ?? [];
  section2Points = configurationUiArticle.sections[2].points ?? [];
  section0Code = configurationUiArticle.sections[0].code?.code ?? '';
}
