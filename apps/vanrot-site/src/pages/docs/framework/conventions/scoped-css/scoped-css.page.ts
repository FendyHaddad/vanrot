import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const conventionsScopedCssArticle = {
  "key": "conventionsScopedCss",
  "section": "framework",
  "path": "/docs/conventions/scoped-css",
  "label": "Scoped CSS",
  "title": "Conventions Scoped CSS",
  "summary": "Scoped CSS conventions keep role-file styling local, predictable, and portable across generated components and docs examples.",
  "status": "available-now",
  "sections": [
    {
      "id": "local-styles",
      "title": "Local styles",
      "body": "Use scoped CSS for component, page, layout, dialog, widget, and form styling. Local styles make generated docs examples portable and keep one role file from accidentally changing another screen.",
      "points": [
        "Place role-specific styles in the companion .css file.",
        "Use global CSS only for tokens, resets, and shell-wide primitives.",
        "Keep component classes readable and tied to the role's DOM structure."
      ],
      "code": {
        "title": "Scoped CSS files",
        "code": "profile-card.component.ts\\nprofile-card.component.html\\nprofile-card.component.css"
      }
    },
    {
      "id": "style-boundaries",
      "title": "Style boundaries",
      "body": "Style boundaries matter because docs, UI generation, and tests need stable surfaces. A local visual change should not require auditing every page for unintended global selector fallout.",
      "points": [
        "Avoid broad element selectors in role CSS.",
        "Avoid global overrides for one-off component states.",
        "Use design tokens when a value truly belongs across the app."
      ]
    },
    {
      "id": "css-debugging",
      "title": "CSS debugging",
      "body": "When a style leaks, find whether the rule is global, whether a class name is too generic, or whether a generated primitive was edited differently from the shared docs pattern.",
      "points": [
        "Inspect the companion CSS file first.",
        "Check global style files for broad selectors.",
        "Compare generated primitive CSS with current component docs."
      ]
    }
  ]
} as const;

const sectionLinks = conventionsScopedCssArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class ScopedCssPage {
  title(): string {
    return conventionsScopedCssArticle.title;
  }

  summary(): string {
    return conventionsScopedCssArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = conventionsScopedCssArticle.sections[0].body;
  section1Body = conventionsScopedCssArticle.sections[1].body;
  section2Body = conventionsScopedCssArticle.sections[2].body;
  section0Points = conventionsScopedCssArticle.sections[0].points ?? [];
  section1Points = conventionsScopedCssArticle.sections[1].points ?? [];
  section2Points = conventionsScopedCssArticle.sections[2].points ?? [];
  section0Code = conventionsScopedCssArticle.sections[0].code?.code ?? '';
}
