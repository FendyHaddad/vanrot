import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const compilerSourceMapsArticle = {
  "key": "compilerSourceMaps",
  "section": "framework",
  "path": "/docs/compiler/source-maps",
  "label": "Source Maps",
  "title": "Compiler Source Maps",
  "summary": "Compiler source mappings connect generated JavaScript and CSS back to original template and style files for diagnostics, inspection, and tests.",
  "status": "production-ready-through-phase-12",
  "sections": [
    {
      "id": "mapping-shape",
      "title": "Mapping shape",
      "body": "A SourceMapping records generated file kind, generated line and column, source file path, and source line and column. The compiler merges mappings from DOM generation and CSS scoping into CompileResult.metadata.mappings.",
      "points": [
        "generatedFile is either js or css so tools can route the mapping to the right emitted asset.",
        "sourceFilePath points at the original template or CSS file, not an intermediate file.",
        "VR017 appears when the compiler cannot build a mapping for a generated location that should be traceable."
      ],
      "code": {
        "title": "Inspect mappings",
        "code": "import { compileComponent } from '@vanrot/compiler';\n\nconst result = compileComponent({\n  componentPath: 'src/app/card.component.ts',\n  componentSource: 'export class CardComponent {}',\n  templatePath: 'src/app/card.component.html',\n  templateSource: '<article>{{ title() }}</article>',\n  stylePath: 'src/app/card.component.css',\n  styleSource: 'article { padding: 1rem; }',\n});\n\nconsole.log(result.metadata.mappings);"
      }
    },
    {
      "id": "code-frames",
      "title": "Code frames",
      "body": "Diagnostics use source locations to produce codeFrame output and sourceText snippets. That makes compiler errors useful inside CLI output, editor integrations, and docs examples without requiring developers to open generated JavaScript.",
      "points": [
        "Use createLineIndex(), positionAtOffset(), and createSourceSpan() for custom compiler-adjacent tools.",
        "Use createCodeFrame() when presenting a source span in terminal output or test failures.",
        "Preserve file paths in calls to parser and style helpers so diagnostics can name the right source file."
      ],
      "code": {
        "title": "Create a code frame",
        "code": "import { createCodeFrame, createLineIndex, createSourceSpan } from '@vanrot/compiler';\n\nconst source = '<button>{{ count() }}</button>';\nconst lineIndex = createLineIndex(source);\nconst span = createSourceSpan('counter.page.html', source, lineIndex, 10, 17);\n\nconsole.log(createCodeFrame(source, span));"
      }
    },
    {
      "id": "debugging-output",
      "title": "Debugging output",
      "body": "When generated output looks wrong, start from the mapping instead of guessing. The mapping tells you which source line produced the generated location, and the diagnostic catalog tells you which guide explains the source-level contract.",
      "points": [
        "Keep generated output readable so mappings are useful during compiler development.",
        "Write focused compiler tests around the source case that produced the wrong mapping.",
        "Do not expose source mappings to application runtime code; they are tooling metadata."
      ]
    }
  ]
} as const;

const sectionLinks = compilerSourceMapsArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class SourceMapsPage {
  title(): string {
    return compilerSourceMapsArticle.title;
  }

  summary(): string {
    return compilerSourceMapsArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = compilerSourceMapsArticle.sections[0].body;
  section1Body = compilerSourceMapsArticle.sections[1].body;
  section2Body = compilerSourceMapsArticle.sections[2].body;
  section0Points = compilerSourceMapsArticle.sections[0].points ?? [];
  section1Points = compilerSourceMapsArticle.sections[1].points ?? [];
  section2Points = compilerSourceMapsArticle.sections[2].points ?? [];
  section0Code = compilerSourceMapsArticle.sections[0].code?.code ?? '';
  section1Code = compilerSourceMapsArticle.sections[1].code?.code ?? '';
}
