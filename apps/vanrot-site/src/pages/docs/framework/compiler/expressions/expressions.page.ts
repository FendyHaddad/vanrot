import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const compilerExpressionsArticle = {
  "key": "compilerExpressions",
  "section": "framework",
  "path": "/docs/compiler/expressions",
  "label": "Expressions",
  "title": "Compiler Expressions",
  "summary": "Vanrot compiler expressions are rewritten into component-safe reads and method calls while rejecting statement-like logic in templates.",
  "status": "production-ready-through-phase-12",
  "sections": [
    {
      "id": "read-model",
      "title": "Read model",
      "body": "Template expressions describe what to read, not what to mutate. The compiler rewrites valid identifiers and property reads into component-safe generated code, while assignments, update operators, lambdas, and statement-like syntax produce VR006.",
      "points": [
        "Read signal values with calls such as count() inside interpolation and property bindings.",
        "Call component methods from event bindings instead of mutating state in HTML.",
        "Keep transformations in computed values or class methods when they become too large for a template."
      ],
      "code": {
        "title": "Rewrite an expression",
        "code": "import { rewriteExpression } from '@vanrot/compiler';\n\nconst rewritten = rewriteExpression('count() + 1', {\n  componentReference: 'instance',\n});\n\nconsole.log(rewritten.code, rewritten.diagnostics);"
      }
    },
    {
      "id": "event-expression",
      "title": "Event expression",
      "body": "Event handlers use a narrower expression form than text and property reads. Vanrot expects a zero-argument component method call such as save(), because generated listeners should be easy to inspect and cleanup should remain deterministic.",
      "points": [
        "Use save() instead of save($event), count.update(...), or inline arrow functions.",
        "Read event target state through component-owned signals and methods.",
        "VR007 points to event-binding docs when a handler expression cannot be generated safely."
      ],
      "code": {
        "title": "Rewrite an event handler",
        "code": "import { rewriteEventHandlerExpression } from '@vanrot/compiler';\n\nconst handler = rewriteEventHandlerExpression('save()', {\n  componentReference: 'instance',\n});\n\nconsole.log(handler.code);"
      }
    },
    {
      "id": "globals",
      "title": "Globals",
      "body": "The compiler exposes expressionGlobals so tooling can understand the safe global names that templates may reference. Treat that list as a compiler contract rather than a reason to turn templates into general-purpose JavaScript.",
      "points": [
        "Prefer component fields and methods over ambient globals for application-specific data.",
        "Use globals only when the compiler explicitly allows the name.",
        "When a value needs setup, create it in TypeScript and expose the result to the template."
      ],
      "code": {
        "title": "Inspect globals",
        "code": "import { expressionGlobals } from '@vanrot/compiler';\n\nconsole.log(expressionGlobals.has('Math'));"
      }
    }
  ]
} as const;

const sectionLinks = compilerExpressionsArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class ExpressionsPage {
  title(): string {
    return compilerExpressionsArticle.title;
  }

  summary(): string {
    return compilerExpressionsArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = compilerExpressionsArticle.sections[0].body;
  section1Body = compilerExpressionsArticle.sections[1].body;
  section2Body = compilerExpressionsArticle.sections[2].body;
  section0Points = compilerExpressionsArticle.sections[0].points ?? [];
  section1Points = compilerExpressionsArticle.sections[1].points ?? [];
  section2Points = compilerExpressionsArticle.sections[2].points ?? [];
  section0Code = compilerExpressionsArticle.sections[0].code?.code ?? '';
  section1Code = compilerExpressionsArticle.sections[1].code?.code ?? '';
  section2Code = compilerExpressionsArticle.sections[2].code?.code ?? '';
}
