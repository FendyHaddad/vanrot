import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const compilerScopedCssArticle = {
  "key": "compilerScopedCss",
  "section": "framework",
  "path": "/docs/compiler/scoped-css",
  "label": "Scoped CSS",
  "title": "Compiler Scoped CSS",
  "summary": "Scoped CSS transforms component styles with a generated scope attribute while keeping source mappings back to the original CSS file.",
  "status": "production-ready-through-phase-12",
  "sections": [
    {
      "id": "scope-attribute",
      "title": "Scope attribute",
      "body": "The compiler creates a deterministic scope attribute from the component path and style source, adds that attribute to generated DOM, and rewrites selectors so component CSS only targets the component's rendered nodes.",
      "points": [
        "Use createScopeAttribute() when tooling needs the same scope id as compileComponent().",
        "Use scopeCss() to transform CSS without compiling a full component.",
        "The final CompileResult returns metadata.scopeAttribute so tests and inspectors can connect generated DOM with generated CSS."
      ],
      "code": {
        "title": "Scope CSS directly",
        "code": "import { createScopeAttribute, scopeCss } from '@vanrot/compiler';\n\nconst scopeAttribute = createScopeAttribute('src/app/card.component.ts', '.title {}');\nconst scoped = scopeCss('.title { font-weight: 700; }', scopeAttribute, 'card.component.css');\n\nconsole.log(scopeAttribute, scoped.css);"
      }
    },
    {
      "id": "selector-rules",
      "title": "Selector rules",
      "body": "Scoped CSS supports normal component selectors, :host, :global(...), and supported at-rules. Selectors the compiler cannot safely scope produce VR008 because leaking styles across the app would be worse than failing the build.",
      "points": [
        "Use :host for styles that belong to the component root.",
        "Use :global(...) only when intentionally reaching outside the component boundary.",
        "Keep resets, typography, and theme-level tokens in global styles rather than component CSS."
      ]
    },
    {
      "id": "style-mappings",
      "title": "Style mappings",
      "body": "CSS transforms produce mappings so generated CSS can still point back to the source file and original line. That matters for diagnostics, inspector tooling, and future command-line inspection of generated assets.",
      "points": [
        "Treat scoped.mappings as compiler metadata, not application runtime data.",
        "Preserve stylePath when calling scopeCss() so locations are meaningful.",
        "When a mapping looks wrong, reduce the CSS to the smallest selector that reproduces it and test that transform directly."
      ]
    }
  ]
} as const;

const sectionLinks = compilerScopedCssArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class ScopedCssPage {
  title(): string {
    return compilerScopedCssArticle.title;
  }

  summary(): string {
    return compilerScopedCssArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = compilerScopedCssArticle.sections[0].body;
  section1Body = compilerScopedCssArticle.sections[1].body;
  section2Body = compilerScopedCssArticle.sections[2].body;
  section0Points = compilerScopedCssArticle.sections[0].points ?? [];
  section1Points = compilerScopedCssArticle.sections[1].points ?? [];
  section2Points = compilerScopedCssArticle.sections[2].points ?? [];
  section0Code = compilerScopedCssArticle.sections[0].code?.code ?? '';
}
