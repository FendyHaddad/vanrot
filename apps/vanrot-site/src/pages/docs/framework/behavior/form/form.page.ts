import type { DocsSectionLink } from '../../../shared/docs-content.ts';

export const behaviorFormArticle = {
  "key": "behaviorForm",
  "section": "framework",
  "path": "/docs/behavior/form",
  "label": "Form",
  "title": "Form Behavior",
  "summary": "createFormController gives forms signal-backed values, per-field validation, dirty and touched tracking, and an async submit guard.",
  "status": "production-ready-through-phase-16h",
  "sections": [
    {
      "id": "controller-shape",
      "title": "Controller shape",
      "body": "createFormController(initialValues) is the state boundary for a form. It returns writable signals for value, dirty, touched, valid, invalid, errors, disabled, pending, and submitted, so templates can read form state without keeping duplicate booleans. Each registered field owns its own value, dirty flag, touched flag, errors array, and validity helpers, while the parent controller keeps the aggregate form snapshot in sync.",
      "points": [
        "registerField({ name, required, validators }) wires a field into the form.",
        "field.setValue marks the field dirty and re-syncs aggregate form flags.",
        "form.validate runs every field validator and returns whether the form is valid."
      ]
    },
    {
      "id": "validators",
      "title": "Built-in validators",
      "body": "The package ships requiredValidator, emailValidator, and minLengthValidator(length). A validator is (value, values) => string | null, so a field-level rule can still read sibling values for confirmation fields, dependent choices, or conditional requirements. Mark a field required: true when the required rule should be inserted automatically, or pass validators explicitly when the field needs a custom ordering.",
      "points": [
        "Validators return the user-facing error text, not a boolean, so the same result can feed inline errors and summaries.",
        "Empty email values are accepted by emailValidator; combine it with requiredValidator when the address must be present.",
        "Cross-field validators should read the values object and avoid mutating controller state while validation is running."
      ]
    },
    {
      "id": "submit-guard",
      "title": "Submit guard",
      "body": "form.submit(handler) is the safe boundary for async saves. It validates first, marks every field touched when validation fails, sets pending while the handler runs, and resolves to true only after the handler completes. That gives buttons, spinners, error summaries, and navigation guards one source of truth instead of scattered local state.",
      "code": {
        "title": "Validated submit",
        "code": "import { createFormController, emailValidator, requiredValidator } from '@vanrot/behavior/form';\n\nconst form = createFormController({ email: '' });\nconst email = form.registerField({\n  name: 'email',\n  validators: [requiredValidator, emailValidator],\n});\n\nemail.setValue('hi@vanrot.dev');\nconst ok = await form.submit(async (values) => save(values));"
      }
    },
    {
      "id": "native-control-bridge",
      "title": "Native control bridge",
      "body": "connectFormControl(element, field) binds a native input, select, or textarea to a field controller. Input and change events push the element value into the field, blur marks it touched, and the returned disposer removes every listener when the owner component is destroyed. Use it when a page keeps markup in HTML but wants the controller to own the state contract.",
      "points": [
        "Call the disposer from the page or component cleanup path.",
        "Prefer one controller per form, then register fields near the elements they control.",
        "Keep submit handlers in TypeScript and render errors from the field and form signals."
      ]
    }
  ]
} as const;

const sectionLinks = behaviorFormArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class FormPage {
  title(): string {
    return behaviorFormArticle.title;
  }

  summary(): string {
    return behaviorFormArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = behaviorFormArticle.sections[0].body;
  section1Body = behaviorFormArticle.sections[1].body;
  section2Body = behaviorFormArticle.sections[2].body;
  section3Body = behaviorFormArticle.sections[3].body;
  section0Points = behaviorFormArticle.sections[0].points ?? [];
  section1Points = behaviorFormArticle.sections[1].points ?? [];
  section3Points = behaviorFormArticle.sections[3].points ?? [];
  section2Code = behaviorFormArticle.sections[2].code?.code ?? '';
}
