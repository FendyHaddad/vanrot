import type { DocsSectionLink } from '../../shared/docs-content.ts';

export const formsArticle = {
  "key": "forms",
  "section": "framework",
  "path": "/docs/forms",
  "label": "Forms",
  "title": "Forms And Async Resources",
  "summary": "@vanrot/forms is the first-party package for signal-native form state, validation, field arrays, wizards, form-scoped async resources, server errors, draft persistence, metadata, diagnostics, and tests.",
  "status": "production-ready",
  "sections": [
    {
      "id": "forms-boundary",
      "title": "Package boundary",
      "body": "@vanrot/forms owns form state and form-scoped async resources. It depends on the runtime signal API but does not add new browser runtime behavior, and it does not create a standalone resources package until a non-form resource use case proves that boundary is needed.",
      "points": [
        "Use createForm for named fields, lifecycle, validation, draft persistence, metadata, and submit orchestration.",
        "Use createFormResource for form-scoped async validation and loading workflows.",
        "Keep backend contracts app-owned; schema adapters can consume domain schemas without making frontend forms the backend source of truth."
      ],
      "code": {
        "title": "Package import",
        "code": "import {\n  createForm,\n  createFormResource,\n  field,\n  required,\n} from '@vanrot/forms';"
      }
    },
    {
      "id": "field-refs",
      "title": "Named field refs",
      "body": "Fields are addressed through named refs instead of repeated path strings. A form definition can live in a `.form.ts` role file so Vite, future Forge, editor tooling, docs, and AI-readable reports can discover the same contract.",
      "points": [
        "Prefer form.fields.email over repeated string paths.",
        "Nested groups preserve readable refs such as form.fields.profile.email.",
        "fieldArray rows expose stable keys and nested item refs for repeated sections."
      ],
      "code": {
        "title": "Simple form",
        "code": "import { createForm, email, field, required } from '@vanrot/forms';\\n\\nexport const profileForm = createForm({\\n  name: 'profile',\\n  fields: {\\n    email: field('', { validators: [required(), email()] }),\\n  },\\n});\\n\\nprofileForm.fields.email.value.set('user@example.com');"
      }
    },
    {
      "id": "validation-lifecycle",
      "title": "Validation lifecycle",
      "body": "Validation state and visible messages are separate. A field can be invalid before the user sees copy, messages stay quiet initially, touched or changed fields reveal their own messages, and submit reveals every known field, schema, resource, and server message.",
      "points": [
        "Use required, minLength, email, or custom validators for synchronous rules.",
        "Use createFormMessage when a validator needs an explicit source or code.",
        "Use form.validate before submit handlers that need a full all-errors pass."
      ],
      "code": {
        "title": "Validation pass",
        "code": "const form = createForm({\\n  fields: {\\n    password: field('', { validators: [required(), minLength(8)] }),\\n  },\\n});\\n\\nawait form.validate();\\nform.fields.password.messages();"
      }
    },
    {
      "id": "async-resources",
      "title": "Async resources",
      "body": "Form resources expose loading, success, error, value, stale, refresh, and cancellation state. A newer run aborts or ignores older async work so the latest valid user interaction wins.",
      "points": [
        "Use dependsOn metadata to document the fields that drive a resource.",
        "Use refresh when the last request should run again.",
        "Use cancel when a step, row, or form is no longer active."
      ],
      "code": {
        "title": "Async validator",
        "code": "const emailAvailability = createFormResource<string, string | null>({\\n  dependsOn: ['email'],\\n  load: async ({ value, signal }) => {\\n    return checkEmailAvailability(value, { signal });\\n  },\\n});\\n\\nconst form = createForm({\\n  fields: {\\n    email: field('', { asyncValidators: [emailAvailability] }),\\n  },\\n});"
      }
    },
    {
      "id": "arrays-wizards-errors",
      "title": "Arrays, wizards, and server errors",
      "body": "Field arrays, wizard steps, and server error mapping use the same field refs and paths. Server-returned field errors can target nested paths such as items[2].sku while form-level errors remain on the form.",
      "points": [
        "Use fieldArray for repeated item rows with add, remove, move, stable keys, and nested refs.",
        "Use createWizard for step state, blocked steps, completed steps, and per-step validation.",
        "Use applyServerErrors for field-level, form-level, and resource-oriented errors returned by submit handlers."
      ],
      "code": {
        "title": "Field array and server error",
        "code": "const invoiceForm = createForm({\\n  fields: {\\n    items: fieldArray(() => ({\\n      sku: field(''),\\n      quantity: field(1),\\n    })),\\n  },\\n});\\n\\ninvoiceForm.fields.items.add({ sku: 'A-100', quantity: 2 });\\napplyServerErrors(invoiceForm, { fields: { 'items[0].sku': ['SKU is unavailable.'] } });"
      }
    },
    {
      "id": "drafts-and-sensitive-fields",
      "title": "Draft persistence",
      "body": "Draft persistence is opt-in and versioned. Sensitive names such as password, secret, token, key, and credential are excluded unless the field explicitly allows persistence.",
      "points": [
        "Use createDraftStorage with local, session, or custom adapters.",
        "Use persistence: 'never' for fields that should never be written to drafts.",
        "Use diagnoseForm to catch sensitive fields configured with explicit draft persistence."
      ],
      "code": {
        "title": "Draft storage",
        "code": "const checkoutForm = createForm({\\n  draft: createDraftStorage({ key: 'checkout-v1', storage: 'local', version: 1 }),\\n  fields: {\\n    email: field(''),\\n    password: field('', { persistence: 'never' }),\\n  },\\n});\\n\\nawait checkoutForm.saveDraft();"
      }
    },
    {
      "id": "tooling-and-tests",
      "title": "Tooling and tests",
      "body": "Forms export serializable metadata and diagnostics that Vite can report in the terminal. Future Forge can consume the same metadata contract without changing the forms package.",
      "points": [
        "Use `.form.ts` role files for reusable definitions that tooling can discover.",
        "Use createFormTest for readable form tests without reaching into private internals.",
        "Use Vite form diagnostics to catch repeated string paths and unsafe form authoring patterns during development."
      ],
      "code": {
        "title": "Form test helper",
        "code": "const testForm = createFormTest(profileForm);\\n\\ntestForm.set('email', 'bad-email');\\ntestForm.touch('email');\\nexpect(testForm.field('email').messages()).toEqual(['Email is invalid.']);"
      }
    }
  ]
} as const;

const sectionLinks = formsArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class FormsPage {
  title(): string {
    return formsArticle.title;
  }

  summary(): string {
    return formsArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = formsArticle.sections[0].body;
  section1Body = formsArticle.sections[1].body;
  section2Body = formsArticle.sections[2].body;
  section3Body = formsArticle.sections[3].body;
  section4Body = formsArticle.sections[4].body;
  section5Body = formsArticle.sections[5].body;
  section6Body = formsArticle.sections[6].body;
  section0Points = formsArticle.sections[0].points ?? [];
  section1Points = formsArticle.sections[1].points ?? [];
  section2Points = formsArticle.sections[2].points ?? [];
  section3Points = formsArticle.sections[3].points ?? [];
  section4Points = formsArticle.sections[4].points ?? [];
  section5Points = formsArticle.sections[5].points ?? [];
  section6Points = formsArticle.sections[6].points ?? [];
  section0Code = formsArticle.sections[0].code?.code ?? '';
  section1Code = formsArticle.sections[1].code?.code ?? '';
  section2Code = formsArticle.sections[2].code?.code ?? '';
  section3Code = formsArticle.sections[3].code?.code ?? '';
  section4Code = formsArticle.sections[4].code?.code ?? '';
  section5Code = formsArticle.sections[5].code?.code ?? '';
  section6Code = formsArticle.sections[6].code?.code ?? '';
}
