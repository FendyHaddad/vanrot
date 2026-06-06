import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const compilerForArticle = {
  "key": "compilerFor",
  "section": "framework",
  "path": "/docs/compiler/for",
  "label": "@for",
  "title": "Compiler @for",
  "summary": "@for compiles list rendering with an explicit item source and required tracking expression so generated DOM updates stay predictable.",
  "status": "production-ready-through-phase-12",
  "sections": [
    {
      "id": "loop-contract",
      "title": "Loop contract",
      "body": "@for is the compiler-owned list rendering primitive. It requires an item variable, an iterable expression, and a track expression, because list identity must be visible at compile time instead of guessed from DOM order.",
      "points": [
        "Use @for (item of items(); track item.id) for stable item identity.",
        "Do not omit track; missing or malformed track expressions produce VR011.",
        "Keep data shaping in a computed value or method before passing the list to the template."
      ],
      "code": {
        "title": "Parse @for",
        "code": "import { parseTemplate } from '@vanrot/compiler';\n\nconst parsed = parseTemplate(\n  '@for (item of items(); track item.id) { <li>{{ item.label }}</li> }',\n  'list.component.html',\n);\n\nconsole.log(parsed.nodes, parsed.diagnostics);"
      }
    },
    {
      "id": "generated-updates",
      "title": "Generated updates",
      "body": "Generated @for output creates the DOM for each item and keeps cleanup tied to the item block. The track expression gives the compiler a stable identity anchor when list membership or ordering changes.",
      "points": [
        "Use domain ids when available instead of array indexes.",
        "Avoid creating new random ids in the template because identity must be stable between renders.",
        "Keep per-item effects inside generated cleanup scopes so removal does not leak listeners or nested child state."
      ]
    },
    {
      "id": "common-mistakes",
      "title": "Common mistakes",
      "body": "Most @for mistakes come from treating it like a JavaScript for loop. It is a declarative template block, so mutation, counters, and list preparation belong in TypeScript rather than inside the block header.",
      "points": [
        "Replace filtered inline loops with a computed filteredItems value.",
        "Replace index-based tracking with a stable id when rows can reorder.",
        "Keep nested loops readable; extract a child component when row content grows large."
      ],
      "code": {
        "title": "Compile a list component",
        "code": "import { compileComponent } from '@vanrot/compiler';\n\nconst result = compileComponent({\n  componentPath: 'src/app/list.component.ts',\n  componentSource: 'export class ListComponent { items() { return []; } }',\n  templatePath: 'src/app/list.component.html',\n  templateSource: '@for (item of items(); track item.id) { <li>{{ item.label }}</li> }',\n  stylePath: 'src/app/list.component.css',\n  styleSource: 'li { list-style: none; }',\n});\n\nconsole.log(result.metadata.features.includes('control-flow-for'));"
      }
    }
  ]
} as const;

const sectionLinks = compilerForArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class ForPage {
  title(): string {
    return compilerForArticle.title;
  }

  summary(): string {
    return compilerForArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = compilerForArticle.sections[0].body;
  section1Body = compilerForArticle.sections[1].body;
  section2Body = compilerForArticle.sections[2].body;
  section0Points = compilerForArticle.sections[0].points ?? [];
  section1Points = compilerForArticle.sections[1].points ?? [];
  section2Points = compilerForArticle.sections[2].points ?? [];
  section0Code = compilerForArticle.sections[0].code?.code ?? '';
  section2Code = compilerForArticle.sections[2].code?.code ?? '';
}
