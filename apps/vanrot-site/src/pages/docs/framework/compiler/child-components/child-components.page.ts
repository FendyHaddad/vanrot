import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const compilerChildComponentsArticle = {
  "key": "compilerChildComponents",
  "section": "framework",
  "path": "/docs/compiler/child-components",
  "label": "Child Components",
  "title": "Compiler Child Components",
  "summary": "Child component compilation detects component tags, imports the child class, validates inputs, and records dependency metadata.",
  "status": "production-ready-through-phase-12",
  "sections": [
    {
      "id": "dependency-metadata",
      "title": "Dependency metadata",
      "body": "When a template uses a child component tag, the compiler lowers that tag into generated child component creation and records a ComponentDependency entry. That metadata lets tooling inspect which components a compiled owner depends on.",
      "points": [
        "ComponentDependency includes tagName, componentName, importPath, and the input bindings passed by the parent.",
        "The generated import path comes from the child component metadata contract.",
        "The final CompileResult exposes metadata.componentDependencies for tests, docs, and inspectors."
      ],
      "code": {
        "title": "Inspect child dependencies",
        "code": "import { compileComponent } from '@vanrot/compiler';\n\nconst result = compileComponent({\n  componentPath: 'src/app/dashboard.page.ts',\n  componentSource: 'export class DashboardPage {}',\n  templatePath: 'src/app/dashboard.page.html',\n  templateSource: '<user-card [user]=\"selectedUser()\"></user-card>',\n  stylePath: 'src/app/dashboard.page.css',\n  styleSource: ':host { display: block; }',\n});\n\nconsole.log(result.metadata.componentDependencies);"
      }
    },
    {
      "id": "input-validation",
      "title": "Input validation",
      "body": "Child components are not just custom tags. The compiler validates input bindings so required child inputs are passed explicitly and malformed bindings produce VR012 before generated code can fail at runtime.",
      "points": [
        "Pass child inputs with property binding syntax such as [user]=\"selectedUser()\".",
        "Keep input expressions side-effect free, just like other property bindings.",
        "Use the Inputs guide when the issue is about declaring or discovering child input metadata."
      ]
    },
    {
      "id": "production-shape",
      "title": "Production shape",
      "body": "Production child components should have a clear boundary: the parent chooses data, the child renders or handles its own local interaction, and inputs describe the contract between them. Avoid using child tags as a place to smuggle global state.",
      "points": [
        "Keep importable child components in role-file families so their metadata can be read.",
        "Name input properties after the contract they receive, not the parent's local variable names.",
        "Prefer small child components with explicit inputs over templates that grow into unreadable conditional blocks."
      ]
    }
  ]
} as const;

const sectionLinks = compilerChildComponentsArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class ChildComponentsPage {
  title(): string {
    return compilerChildComponentsArticle.title;
  }

  summary(): string {
    return compilerChildComponentsArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = compilerChildComponentsArticle.sections[0].body;
  section1Body = compilerChildComponentsArticle.sections[1].body;
  section2Body = compilerChildComponentsArticle.sections[2].body;
  section0Points = compilerChildComponentsArticle.sections[0].points ?? [];
  section1Points = compilerChildComponentsArticle.sections[1].points ?? [];
  section2Points = compilerChildComponentsArticle.sections[2].points ?? [];
  section0Code = compilerChildComponentsArticle.sections[0].code?.code ?? '';
}
