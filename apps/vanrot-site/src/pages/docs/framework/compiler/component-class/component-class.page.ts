import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const compilerComponentClassArticle = {
  "key": "compilerComponentClass",
  "section": "framework",
  "path": "/docs/compiler/component-class",
  "label": "Component Class",
  "title": "Compiler Component Class",
  "summary": "The compiler reads a named exported class from each role file and uses that class as the generated component identity.",
  "status": "production-ready-through-phase-12",
  "sections": [
    {
      "id": "named-export",
      "title": "Named export",
      "body": "A component role file must export one named class whose name matches the role file. The compiler rejects default exports, ambiguous class candidates, missing classes, and names that do not match the expected class because generated imports need a stable symbol.",
      "points": [
        "counter.page.ts should export class CounterPage, not default class CounterPage.",
        "Keep one component class candidate per role file so metadata extraction is deterministic.",
        "The compiler returns VR004, VR014, or VR015 when it cannot identify the class safely."
      ],
      "code": {
        "title": "Read component metadata",
        "code": "import { createComponentFileSet, readComponentMetadata } from '@vanrot/compiler';\n\nconst fileSet = createComponentFileSet('src/app/counter.page.ts');\n\nif (fileSet !== null) {\n  const result = readComponentMetadata(\n    fileSet,\n    'export class CounterPage {}',\n  );\n\n  console.log(result.metadata?.componentName);\n}"
      }
    },
    {
      "id": "constructor-rules",
      "title": "Constructor rules",
      "body": "Compiled components must be constructable by generated code without a dependency-injection container. Required constructor parameters produce VR016, because the runtime cannot know how to create those arguments during mount or child component creation.",
      "points": [
        "Use signal fields, methods, and imported services instead of required constructor arguments.",
        "Optional constructor parameters are still discouraged because they make generated creation harder to reason about.",
        "Keep setup that needs the DOM inside lifecycle helpers rather than the constructor."
      ]
    },
    {
      "id": "state-and-methods",
      "title": "State and methods",
      "body": "The component class is where application logic belongs. Template expressions read state and call methods, but assignment, update operators, lambdas, and statement-like logic should stay in TypeScript so the compiler can keep HTML declarative.",
      "points": [
        "Use signals for mutable view state and computed values for derived view state.",
        "Expose zero-argument methods for event handlers, such as save() or increment().",
        "Do not put UI markup in TypeScript and do not hide business rules inside HTML expressions."
      ],
      "code": {
        "title": "Component class shape",
        "code": "import { signal } from '@vanrot/runtime';\nimport { readComponentMetadata } from '@vanrot/compiler';\n\nexport class CounterPage {\n  readonly count = signal(0);\n\n  increment() {\n    this.count.update((value) => value + 1);\n  }\n}\n\nvoid readComponentMetadata;"
      }
    }
  ]
} as const;

const sectionLinks = compilerComponentClassArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class ComponentClassPage {
  title(): string {
    return compilerComponentClassArticle.title;
  }

  summary(): string {
    return compilerComponentClassArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = compilerComponentClassArticle.sections[0].body;
  section1Body = compilerComponentClassArticle.sections[1].body;
  section2Body = compilerComponentClassArticle.sections[2].body;
  section0Points = compilerComponentClassArticle.sections[0].points ?? [];
  section1Points = compilerComponentClassArticle.sections[1].points ?? [];
  section2Points = compilerComponentClassArticle.sections[2].points ?? [];
  section0Code = compilerComponentClassArticle.sections[0].code?.code ?? '';
  section2Code = compilerComponentClassArticle.sections[2].code?.code ?? '';
}
