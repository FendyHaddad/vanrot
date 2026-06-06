import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const cliUiPrimitiveAddArticle = {
  "key": "cliUiPrimitiveAdd",
  "section": "framework",
  "path": "/docs/cli/ui-primitives",
  "label": "UI Primitives",
  "title": "CLI UI Primitive Add",
  "summary": "UI primitive commands add Vanrot UI files and imports without breaking the project conventions around style mode and generated component ownership.",
  "status": "demo-capable-through-phase-14",
  "sections": [
    {
      "id": "add-flow",
      "title": "Add flow",
      "body": "Use vr ui add when a project needs one or more UI primitives from @vanrot/ui. The CLI can render primitive files, patch starter usage where appropriate, and keep imports aligned with the configured UI flavor.",
      "points": [
        "Add only the primitives the screen actually uses.",
        "Prefer the documented primitive name instead of guessing file names.",
        "Review generated CSS if the project uses a custom UI style mode."
      ],
      "code": {
        "title": "Add primitives",
        "code": "vr ui add button card dialog\\nvr ui add table toast tooltip"
      }
    },
    {
      "id": "style-handshake",
      "title": "Style handshake",
      "body": "The UI add command relies on configuration to decide what flavor and style mode should be rendered. That keeps the CLI from creating files that visually disagree with the rest of the application.",
      "points": [
        "Keep ui.flavor stable inside vanrot.config.ts.",
        "Keep ui.styleMode stable before adding many primitives.",
        "Use configuration maintenance commands before adding primitives to a migrated project."
      ]
    },
    {
      "id": "primitive-ownership",
      "title": "Primitive ownership",
      "body": "Generated UI primitive files are project assets, but their API should still match @vanrot/ui metadata and docs. If a primitive needs a behavior change, update the shared primitive source and docs rather than mutating each generated copy differently.",
      "points": [
        "Do not fork generated primitive APIs without a deliberate project reason.",
        "Use docs examples to verify class names, tokens, and expected attributes.",
        "Regenerate or update consistently when shared primitive metadata changes."
      ]
    }
  ]
} as const;

const sectionLinks = cliUiPrimitiveAddArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class UiPrimitivesPage {
  title(): string {
    return cliUiPrimitiveAddArticle.title;
  }

  summary(): string {
    return cliUiPrimitiveAddArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = cliUiPrimitiveAddArticle.sections[0].body;
  section1Body = cliUiPrimitiveAddArticle.sections[1].body;
  section2Body = cliUiPrimitiveAddArticle.sections[2].body;
  section0Points = cliUiPrimitiveAddArticle.sections[0].points ?? [];
  section1Points = cliUiPrimitiveAddArticle.sections[1].points ?? [];
  section2Points = cliUiPrimitiveAddArticle.sections[2].points ?? [];
  section0Code = cliUiPrimitiveAddArticle.sections[0].code?.code ?? '';
}
