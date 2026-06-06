import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const compilerEventBindingArticle = {
  "key": "compilerEventBinding",
  "section": "framework",
  "path": "/docs/compiler/event-binding",
  "label": "Event Binding",
  "title": "Compiler Event Binding",
  "summary": "Event binding compiles declarative template events into generated listeners that call component methods and stay cleanup-safe.",
  "status": "production-ready-through-phase-12",
  "sections": [
    {
      "id": "method-call",
      "title": "Method call",
      "body": "Vanrot event binding is deliberately boring: write (click)=\"save\" or (click)=\"save()\" style handler intent, and keep the real work in a component method. That keeps generated code readable and avoids arbitrary statements inside HTML.",
      "points": [
        "Use zero-argument component methods for current compiler support.",
        "Do not pass $event or inline lambdas unless a future compiler phase documents that support.",
        "Move branching, validation, async work, and signal updates into the TypeScript method."
      ],
      "code": {
        "title": "Compile an event binding",
        "code": "import { compileComponent } from '@vanrot/compiler';\n\nconst result = compileComponent({\n  componentPath: 'src/app/save.button.ts',\n  componentSource: 'export class SaveButton { save() {} }',\n  templatePath: 'src/app/save.button.html',\n  templateSource: '<button (click)=\"save\">Save</button>',\n  stylePath: 'src/app/save.button.css',\n  styleSource: 'button { cursor: pointer; }',\n});\n\nconsole.log(result.metadata.features.includes('event-binding'));"
      }
    },
    {
      "id": "why-small",
      "title": "Why it stays small",
      "body": "The event model stays small because generated listeners must be deterministic. If templates could run arbitrary statements, source maps, cleanup, and reviewability would all get weaker, and developers would have to debug behavior in two places.",
      "points": [
        "TypeScript owns command behavior and HTML only points at the command.",
        "Generated listeners can be attached and removed consistently when the compiler knows their shape.",
        "A failed event binding should be fixed by changing the component method surface, not by adding hidden template logic."
      ]
    },
    {
      "id": "common-fixes",
      "title": "Common fixes",
      "body": "When VR007 appears, look for inline mutation, arguments, or expressions that are not method names. The fix is usually to create a named method on the component class and call that method from the template.",
      "points": [
        "Replace (click)=\"count.update(...)\" with (click)=\"increment\" and put increment() in TypeScript.",
        "Replace (submit)=\"save(form.value)\" with (submit)=\"save\" and read form state from component-owned signals.",
        "Keep event handler names short and command-like so templates remain easy to scan."
      ]
    }
  ]
} as const;

const sectionLinks = compilerEventBindingArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class EventBindingPage {
  title(): string {
    return compilerEventBindingArticle.title;
  }

  summary(): string {
    return compilerEventBindingArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = compilerEventBindingArticle.sections[0].body;
  section1Body = compilerEventBindingArticle.sections[1].body;
  section2Body = compilerEventBindingArticle.sections[2].body;
  section0Points = compilerEventBindingArticle.sections[0].points ?? [];
  section1Points = compilerEventBindingArticle.sections[1].points ?? [];
  section2Points = compilerEventBindingArticle.sections[2].points ?? [];
  section0Code = compilerEventBindingArticle.sections[0].code?.code ?? '';
}
