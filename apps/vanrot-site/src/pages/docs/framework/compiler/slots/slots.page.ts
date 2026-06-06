import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const compilerSlotsArticle = {
  "key": "compilerSlots",
  "section": "framework",
  "path": "/docs/compiler/slots",
  "label": "Slots",
  "title": "Compiler Slots",
  "summary": "Slots let a parent provide named content to a child component while the compiler validates slot targets and lowers slot outlets.",
  "status": "production-ready-through-phase-12",
  "sections": [
    {
      "id": "slot-outlets",
      "title": "Slot outlets",
      "body": "A slot outlet is a compiler-known template node, not an arbitrary runtime string. The parser recognizes slot outlet syntax, the generator lowers it into content insertion, and diagnostics keep unknown targets from silently rendering in the wrong place.",
      "points": [
        "Use named slots when a child component owns layout but the parent owns specific content.",
        "Keep fallback and branching behavior in the child template so the slot contract remains obvious.",
        "Unknown slot targets produce VR013 and should be fixed at the source contract."
      ],
      "code": {
        "title": "Parse slot syntax",
        "code": "import { parseTemplate } from '@vanrot/compiler';\n\nconst parsed = parseTemplate(\n  '<panel-card><slot.header>Revenue</slot.header></panel-card>',\n  'dashboard.page.html',\n);\n\nconsole.log(parsed.nodes);"
      }
    },
    {
      "id": "named-content",
      "title": "Named content",
      "body": "Named content is useful when a child component exposes multiple content regions, such as header, body, actions, or footer. The compiler keeps those regions explicit so generated output is easier to inspect than a loose runtime projection API.",
      "points": [
        "Use slot names that describe the region, not the parent that happens to fill it.",
        "Do not use slots for ordinary scalar data; use inputs for values.",
        "Keep deeply nested slot composition rare because it spreads one UI decision across too many files."
      ]
    },
    {
      "id": "debugging-slots",
      "title": "Debugging slots",
      "body": "Slot bugs are usually contract bugs. Check the child component's expected slot names, the parent's provided slot names, and the generated diagnostics before assuming runtime projection is broken.",
      "points": [
        "If the slot name is unknown, fix the parent template or the child slot declaration.",
        "If content appears in the wrong region, inspect the generated component dependency and slot lowering.",
        "If the slot only passes text or a value, replace it with an input to keep intent clear."
      ],
      "code": {
        "title": "Compile a slot owner",
        "code": "import { compileComponent } from '@vanrot/compiler';\n\nconst result = compileComponent({\n  componentPath: 'src/app/panel.component.ts',\n  componentSource: 'export class PanelComponent {}',\n  templatePath: 'src/app/panel.component.html',\n  templateSource: '<section><slot.header></slot.header></section>',\n  stylePath: 'src/app/panel.component.css',\n  styleSource: 'section { display: grid; }',\n});\n\nconsole.log(result.metadata.features.includes('slot'));"
      }
    }
  ]
} as const;

const sectionLinks = compilerSlotsArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class SlotsPage {
  title(): string {
    return compilerSlotsArticle.title;
  }

  summary(): string {
    return compilerSlotsArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = compilerSlotsArticle.sections[0].body;
  section1Body = compilerSlotsArticle.sections[1].body;
  section2Body = compilerSlotsArticle.sections[2].body;
  section0Points = compilerSlotsArticle.sections[0].points ?? [];
  section1Points = compilerSlotsArticle.sections[1].points ?? [];
  section2Points = compilerSlotsArticle.sections[2].points ?? [];
  section0Code = compilerSlotsArticle.sections[0].code?.code ?? '';
  section2Code = compilerSlotsArticle.sections[2].code?.code ?? '';
}
