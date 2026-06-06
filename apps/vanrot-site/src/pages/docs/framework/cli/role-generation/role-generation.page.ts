import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const cliRoleGenerationArticle = {
  "key": "cliRoleGeneration",
  "section": "framework",
  "path": "/docs/cli/role-generation",
  "label": "Role Generation",
  "title": "CLI Role Generation",
  "summary": "Role generation writes Vanrot role files with predictable names, suffixes, templates, styles, and starter logic.",
  "status": "demo-capable-through-phase-14",
  "sections": [
    {
      "id": "generate-purpose",
      "title": "Generate purpose",
      "body": "vr generate exists so developers do not need to remember every role suffix or file pairing. It writes a component or page in the project shape expected by the compiler, router, docs, devtools, and AI project map.",
      "points": [
        "Use component for reusable interface pieces.",
        "Use page for route-backed screens.",
        "Use kebab-case names so generated classes and file names stay predictable."
      ],
      "code": {
        "title": "Generate role files",
        "code": "vr generate component invoice-summary\\nvr generate page billing-history"
      }
    },
    {
      "id": "generated-contract",
      "title": "Generated contract",
      "body": "Generated role files should separate TypeScript, template, and CSS by responsibility. TypeScript owns state and event handlers, HTML owns markup, and CSS owns scoped presentation without leaking global selectors.",
      "points": [
        "Do not move generated template markup into the class file.",
        "Do not put business rules in the generated HTML template.",
        "Keep generated CSS local to the role file unless the design token truly belongs globally."
      ]
    },
    {
      "id": "generation-debugging",
      "title": "Generation debugging",
      "body": "When generation fails, check the role name first, then the target directory, then config sourceRoot. Most failures are caused by invalid names, existing files, or running the command from a directory that is not the Vanrot project root.",
      "points": [
        "Use vr doctor after repeated generator failures.",
        "Use vr config recover if the config file is missing or malformed.",
        "Do not delete generated files blindly when the failure is caused by an incorrect source root."
      ]
    }
  ]
} as const;

const sectionLinks = cliRoleGenerationArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class RoleGenerationPage {
  title(): string {
    return cliRoleGenerationArticle.title;
  }

  summary(): string {
    return cliRoleGenerationArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = cliRoleGenerationArticle.sections[0].body;
  section1Body = cliRoleGenerationArticle.sections[1].body;
  section2Body = cliRoleGenerationArticle.sections[2].body;
  section0Points = cliRoleGenerationArticle.sections[0].points ?? [];
  section1Points = cliRoleGenerationArticle.sections[1].points ?? [];
  section2Points = cliRoleGenerationArticle.sections[2].points ?? [];
  section0Code = cliRoleGenerationArticle.sections[0].code?.code ?? '';
}
