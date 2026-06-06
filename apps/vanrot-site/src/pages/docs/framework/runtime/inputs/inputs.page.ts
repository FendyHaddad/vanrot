import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const runtimeInputsArticle = {
  "key": "runtimeInputs",
  "section": "framework",
  "path": "/docs/runtime/inputs",
  "label": "Inputs",
  "title": "Runtime Inputs",
  "summary": "Runtime inputs are signal-shaped component boundary values for required and defaulted data passed into generated components.",
  "status": "production-ready-through-phase-12",
  "sections": [
    {
      "id": "input-contract",
      "title": "Input contract",
      "body": "input.required() and input.default() let component edges use the same read model as local state. A required input reports an early read before a value is provided; a default input starts from a stable fallback and remains writable for generated code.",
      "points": [
        "Use input.required<T>() when the parent must supply the value.",
        "Use input.default(value) when the component can render without parent data.",
        "Treat inputs as boundary state, not as a replacement for internal signal() state."
      ],
      "code": {
        "title": "Required and defaulted inputs",
        "code": "import { computed, input } from '@vanrot/runtime';\n\nconst userName = input.required<string>();\nconst disabled = input.default(false);\n\nconst buttonLabel = computed(() => {\n  if (disabled()) {\n    return 'Unavailable';\n  }\n\n  return `Invite ${userName()}`;\n});"
      }
    }
  ]
} as const;

const sectionLinks = runtimeInputsArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class InputsPage {
  title(): string {
    return runtimeInputsArticle.title;
  }

  summary(): string {
    return runtimeInputsArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = runtimeInputsArticle.sections[0].body;
  section0Points = runtimeInputsArticle.sections[0].points ?? [];
  section0Code = runtimeInputsArticle.sections[0].code?.code ?? '';
}
