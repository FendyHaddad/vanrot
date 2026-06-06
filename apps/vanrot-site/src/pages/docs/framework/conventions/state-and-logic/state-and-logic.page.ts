import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const conventionsStateLogicArticle = {
  "key": "conventionsStateLogic",
  "section": "framework",
  "path": "/docs/conventions/state-and-logic",
  "label": "State and Logic",
  "title": "Conventions State and Logic",
  "summary": "State and logic conventions keep Vanrot components signal-driven, readable, testable, and free of template-side business rules.",
  "status": "available-now",
  "sections": [
    {
      "id": "signals-for-state",
      "title": "Signals for state",
      "body": "Use signals for component state because they make reads, writes, computed values, and effects explicit. Signals also give runtime and devtools a clear model for understanding state relationships.",
      "points": [
        "Use signal for writable local state.",
        "Use computed for derived values.",
        "Use effect for side effects that need cleanup or dependency tracking."
      ],
      "code": {
        "title": "State shape",
        "code": "import { computed, effect, signal } from '@vanrot/runtime';\\n\\nconst count = signal(0);\\nconst doubled = computed(() => count() * 2);\\neffect(() => console.log(doubled()));"
      }
    },
    {
      "id": "guard-clauses",
      "title": "Guard clauses",
      "body": "Use guard clauses instead of nested control flow. They keep event handlers and lifecycle hooks readable, and they make test cases easier to map to the branches users actually experience.",
      "points": [
        "Return early when required inputs are missing.",
        "Return early when a user action is not allowed.",
        "Keep the main path at the lowest indentation level."
      ]
    },
    {
      "id": "logic-location",
      "title": "Logic location",
      "body": "Application logic belongs in TypeScript, not HTML. Templates may bind values and call event handlers, but validation, branching, data shaping, and business decisions should live in the role class where tests can reach them.",
      "points": [
        "Use computed values for display decisions.",
        "Use methods for event behavior.",
        "Keep templates focused on structure and bindings."
      ]
    }
  ]
} as const;

const sectionLinks = conventionsStateLogicArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class StateAndLogicPage {
  title(): string {
    return conventionsStateLogicArticle.title;
  }

  summary(): string {
    return conventionsStateLogicArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = conventionsStateLogicArticle.sections[0].body;
  section1Body = conventionsStateLogicArticle.sections[1].body;
  section2Body = conventionsStateLogicArticle.sections[2].body;
  section0Points = conventionsStateLogicArticle.sections[0].points ?? [];
  section1Points = conventionsStateLogicArticle.sections[1].points ?? [];
  section2Points = conventionsStateLogicArticle.sections[2].points ?? [];
  section0Code = conventionsStateLogicArticle.sections[0].code?.code ?? '';
}
