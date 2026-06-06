import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const compilerInputsArticle = {
  "key": "compilerInputs",
  "section": "framework",
  "path": "/docs/compiler/inputs",
  "label": "Inputs",
  "title": "Compiler Inputs",
  "summary": "Compiler input metadata lets Vanrot validate child component input bindings before generated code reaches the browser.",
  "status": "production-ready-through-phase-12",
  "sections": [
    {
      "id": "input-metadata",
      "title": "Input metadata",
      "body": "readComponentInputs() scans a child component source file and returns the input names the compiler can require from parent templates. This keeps child component contracts visible to tooling and stops missing input bugs during compilation.",
      "points": [
        "Declare inputs in the component class using the supported runtime input helpers.",
        "Let the compiler read the child source instead of duplicating input metadata in docs or config files.",
        "VR018 appears when an input declaration cannot be read safely."
      ],
      "code": {
        "title": "Read inputs",
        "code": "import { readComponentInputs } from '@vanrot/compiler';\n\nconst result = readComponentInputs(\n  'user-card.component.ts',\n  'export class UserCard { readonly user = input.required<User>(); }',\n);\n\nconsole.log(result.inputs, result.diagnostics);"
      }
    },
    {
      "id": "parent-bindings",
      "title": "Parent bindings",
      "body": "Parent templates pass child inputs with property binding syntax. The compiler compares those bindings with the child's metadata, then records the accepted bindings inside ComponentDependencyInput entries for inspection.",
      "points": [
        "Pass every required child input explicitly.",
        "Use expressions that read parent state rather than mutating it.",
        "When a child input is optional, keep the default behavior documented in the child component source."
      ]
    },
    {
      "id": "input-debugging",
      "title": "Input debugging",
      "body": "Input diagnostics usually mean either the child did not declare the input the parent expects, or the parent used the wrong binding shape. Fix the source contract first, then re-run the compiler so metadata and generated imports agree.",
      "points": [
        "Check the child component's input declarations before changing the parent template.",
        "Check that the parent uses [name]=\"expression\" rather than a plain attribute for dynamic values.",
        "Use compileComponent() metadata to inspect the componentDependencies array when tests need proof."
      ],
      "code": {
        "title": "Inspect passed inputs",
        "code": "import { compileComponent } from '@vanrot/compiler';\n\nconst result = compileComponent({\n  componentPath: 'src/app/profile.page.ts',\n  componentSource: 'export class ProfilePage {}',\n  templatePath: 'src/app/profile.page.html',\n  templateSource: '<user-card [user]=\"selectedUser()\"></user-card>',\n  stylePath: 'src/app/profile.page.css',\n  styleSource: ':host { display: block; }',\n});\n\nconsole.log(result.metadata.componentDependencies[0]?.inputs);"
      }
    }
  ]
} as const;

const sectionLinks = compilerInputsArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class InputsPage {
  title(): string {
    return compilerInputsArticle.title;
  }

  summary(): string {
    return compilerInputsArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = compilerInputsArticle.sections[0].body;
  section1Body = compilerInputsArticle.sections[1].body;
  section2Body = compilerInputsArticle.sections[2].body;
  section0Points = compilerInputsArticle.sections[0].points ?? [];
  section1Points = compilerInputsArticle.sections[1].points ?? [];
  section2Points = compilerInputsArticle.sections[2].points ?? [];
  section0Code = compilerInputsArticle.sections[0].code?.code ?? '';
  section2Code = compilerInputsArticle.sections[2].code?.code ?? '';
}
