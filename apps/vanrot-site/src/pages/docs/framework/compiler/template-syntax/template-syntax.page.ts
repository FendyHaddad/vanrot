import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const compilerTemplateSyntaxArticle = {
  "key": "compilerTemplateSyntax",
  "section": "framework",
  "path": "/docs/compiler/template-syntax",
  "label": "Template Syntax",
  "title": "Compiler Template Syntax",
  "summary": "Vanrot template syntax keeps HTML declarative while supporting interpolation, property binding, event binding, control flow, child components, slots, router tags, and UI primitives.",
  "status": "production-ready-through-phase-12",
  "sections": [
    {
      "id": "template-language",
      "title": "Template language",
      "body": "Templates are parsed as HTML fragments plus Vanrot-specific syntax. The parser returns a typed tree of text nodes, element nodes, @if blocks, @for blocks, and slot outlets so later compiler phases can validate expressions and generate readable DOM code.",
      "points": [
        "Use {{ value }} interpolation for text output.",
        "Use [property]=\"expression\" for property binding and (event)=\"method\" for events.",
        "Use @if, @for, child component tags, slot outlets, router tags, and supported vr-* primitives where the compiler documents them."
      ],
      "code": {
        "title": "Parse a template",
        "code": "import { parseTemplate } from '@vanrot/compiler';\n\nconst parsed = parseTemplate(\n  '<section>{{ title() }}</section>',\n  'src/app/home.page.html',\n);\n\nconsole.log(parsed.nodes, parsed.diagnostics);"
      }
    },
    {
      "id": "template-bindings",
      "title": "Template bindings",
      "body": "After parsing, the compiler extracts template bindings so it knows which expressions feed text, properties, events, router links, child inputs, and UI primitive attributes. Binding extraction is also where invalid expression shapes become diagnostics instead of broken generated code.",
      "points": [
        "Use extractTemplateBindings() when tooling needs to inspect every expression without generating a component.",
        "Use parseInterpolation() when an editor or docs tool needs to split text around interpolation markers.",
        "Template binding diagnostics include code frames so developers can fix the source line directly."
      ],
      "code": {
        "title": "Extract bindings",
        "code": "import { extractTemplateBindings, parseInterpolation, parseTemplate } from '@vanrot/compiler';\n\nconst parsed = parseTemplate('<h1>{{ title() }}</h1>', 'home.page.html');\nconst bindings = extractTemplateBindings(parsed.nodes, 'home.page.html');\nconst interpolation = parseInterpolation('Hello {{ name() }}');\n\nconsole.log(bindings.bindings, interpolation.parts);"
      }
    },
    {
      "id": "unsupported-syntax",
      "title": "Unsupported syntax",
      "body": "Unsupported template syntax produces VR005 instead of falling through to unpredictable output. Vanrot intentionally keeps templates small so the compiler can generate code that remains readable and so developers know whether logic belongs in HTML or TypeScript.",
      "points": [
        "Move complex branching, data preparation, and mutation into the component class.",
        "Keep template expressions side-effect free unless they are simple event handler calls.",
        "When syntax is not supported yet, prefer a source-level helper method over forcing logic into markup."
      ]
    }
  ]
} as const;

const sectionLinks = compilerTemplateSyntaxArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class TemplateSyntaxPage {
  title(): string {
    return compilerTemplateSyntaxArticle.title;
  }

  summary(): string {
    return compilerTemplateSyntaxArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = compilerTemplateSyntaxArticle.sections[0].body;
  section1Body = compilerTemplateSyntaxArticle.sections[1].body;
  section2Body = compilerTemplateSyntaxArticle.sections[2].body;
  section0Points = compilerTemplateSyntaxArticle.sections[0].points ?? [];
  section1Points = compilerTemplateSyntaxArticle.sections[1].points ?? [];
  section2Points = compilerTemplateSyntaxArticle.sections[2].points ?? [];
  section0Code = compilerTemplateSyntaxArticle.sections[0].code?.code ?? '';
  section1Code = compilerTemplateSyntaxArticle.sections[1].code?.code ?? '';
}
