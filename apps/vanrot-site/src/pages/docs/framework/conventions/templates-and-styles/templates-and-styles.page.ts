import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const conventionsTemplatesStylesArticle = {
  "key": "conventionsTemplatesStyles",
  "section": "framework",
  "path": "/docs/conventions/templates-and-styles",
  "label": "Templates and Styles",
  "title": "Conventions Templates and Styles",
  "summary": "Template and style conventions keep markup, behavior, and presentation split across HTML, TypeScript, and scoped CSS.",
  "status": "available-now",
  "sections": [
    {
      "id": "template-ownership",
      "title": "Template ownership",
      "body": "Templates own UI structure. Do not put UI markup in TypeScript strings, and do not move application logic into HTML. This split keeps compiler output, docs examples, and test assertions easy to understand.",
      "points": [
        "Put markup in .html companion files.",
        "Call component methods from templates only for user events or simple bindings.",
        "Move decisions and state transitions into TypeScript."
      ],
      "code": {
        "title": "Companion files",
        "code": "settings.page.ts\\nsettings.page.html\\nsettings.page.css"
      }
    },
    {
      "id": "style-ownership",
      "title": "Style ownership",
      "body": "Styles own presentation. Component CSS should be scoped to the role file, while global styles should contain only tokens, resets, and truly shared rules that every page is expected to inherit.",
      "points": [
        "Use scoped CSS for component and page styling.",
        "Use global styles for tokens and shell-wide defaults.",
        "Avoid putting state rules in CSS when TypeScript should own the state."
      ]
    },
    {
      "id": "debug-split",
      "title": "Debug the split",
      "body": "When a screen is hard to test, check whether responsibilities are mixed. Markup in TypeScript, logic in HTML, and global CSS for local state are usually signs that the file boundaries need to be restored.",
      "points": [
        "Move repeated markup back into templates.",
        "Move condition logic back into computed values or methods.",
        "Move page-specific global styles back into scoped CSS."
      ]
    }
  ]
} as const;

const sectionLinks = conventionsTemplatesStylesArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class TemplatesAndStylesPage {
  title(): string {
    return conventionsTemplatesStylesArticle.title;
  }

  summary(): string {
    return conventionsTemplatesStylesArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = conventionsTemplatesStylesArticle.sections[0].body;
  section1Body = conventionsTemplatesStylesArticle.sections[1].body;
  section2Body = conventionsTemplatesStylesArticle.sections[2].body;
  section0Points = conventionsTemplatesStylesArticle.sections[0].points ?? [];
  section1Points = conventionsTemplatesStylesArticle.sections[1].points ?? [];
  section2Points = conventionsTemplatesStylesArticle.sections[2].points ?? [];
  section0Code = conventionsTemplatesStylesArticle.sections[0].code?.code ?? '';
}
