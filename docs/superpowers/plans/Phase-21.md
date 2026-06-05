# Phase 21 Forms And Async Implementation Plan

## Status

Implemented. Phase 21 closeout verification passed.

## Source Spec

- `docs/superpowers/specs/Phase-21.md`

## Acceptance Criteria

- `@vanrot/forms` exists as a first-party package and does not add weight to `@vanrot/runtime`.
- A simple form can define fields, read and write values, validate on touch/change, and show all errors on submit.
- Reusable `.form.ts` definitions are supported and discoverable.
- Named refs are the primary authoring path for fields, nested fields, and field arrays.
- Field arrays support add, remove, move, stable keys, nested refs, and validation.
- Wizard forms support step state and per-step validation.
- Async validators and resources expose loading, error, success, refresh, stale, and cancellation state.
- Stale async work is cancelled or ignored automatically.
- Server-returned errors can apply to fields, nested array items, form-level errors, and resources.
- Draft persistence is opt-in, versioned, resettable, and sensitive-field aware.
- UI helpers integrate with `@vanrot/ui` and preserve accessibility wiring.
- Vite can report structured form diagnostics in the terminal; future Forge can consume the same metadata contract.
- Testing helpers cover form state, validation, async resources, draft persistence, and server errors.
- Docs, AI-readable metadata, final TDD inventory, feature maturity, and future pipeline status reflect the shipped scope.

## Non-Goals And Decision Gates

Non-goals:

- Do not create a standalone `@vanrot/resources` package in Phase 21.
- Do not generate backend contracts from frontend forms by default.
- Do not add Angular-style template pipes in this phase.
- Do not add RxJS, Zod, Valibot, Yup, or another schema library as a core dependency.
- Do not hide application logic in templates.
- Do not grow `@vanrot/runtime` unless a tiny hook is proven necessary and still passes the size budget.

Decision gates to resolve before implementation starts:

- Choose final `@vanrot/forms` package exports.
- Decide whether `.form.ts` files are required, recommended, or only discovered when present.
- Lock the exact field-ref and nested field-array shape.
- Lock validator return shape and message shape.
- Lock async cancellation and stale-result semantics.
- Lock server error path mapping.
- Lock draft persistence adapter contract.
- Lock UI helper names and `@vanrot/ui` integration boundary.
- Lock metadata and diagnostics shape for Vite and future Forge.
- Decide whether compiler two-way binding syntax ships in Phase 21 or is deferred.

## Execution Rules

- Follow `docs/superpowers/specs/Phase-21.md`.
- Keep `@vanrot/runtime` out of the implementation unless a size-budgeted hook becomes unavoidable.
- Keep all package contracts readable and signal-native.
- Prefer named constants and named sources of truth over repeated strings.
- Keep all user-facing form copy in named exported constants or metadata objects.
- Keep logic in `.ts` files and UI structure in `.html` files.
- Run focused package tests after each module, then run the phase closeout verification.
- Mark plan tasks complete only after the matching tests and docs pass.

## Planned File Structure

Primary package files:

- `packages/forms/package.json`: package metadata, build/typecheck/test scripts, file dependencies.
- `packages/forms/tsconfig.json`: package TypeScript config.
- `packages/forms/src/index.ts`: public exports.
- `packages/forms/src/constants.ts`: package names, diagnostic codes, sensitive-field defaults, metadata keys.
- `packages/forms/src/types.ts`: shared public and internal types.
- `packages/forms/src/field.ts`: scalar field state and field factories.
- `packages/forms/src/form.ts`: `createForm(...)`, form state, lifecycle, submit orchestration.
- `packages/forms/src/validation.ts`: sync validator factories and validator execution.
- `packages/forms/src/messages.ts`: validation and server message model.
- `packages/forms/src/resources.ts`: form-scoped async resource primitive.
- `packages/forms/src/arrays.ts`: field-array model.
- `packages/forms/src/wizard.ts`: wizard and per-step state.
- `packages/forms/src/server-errors.ts`: server error application and path mapping.
- `packages/forms/src/draft.ts`: draft persistence adapters and sensitive-field policy.
- `packages/forms/src/ui.ts`: UI helper metadata and binding helpers for `@vanrot/ui`.
- `packages/forms/src/metadata.ts`: serializable form metadata export.
- `packages/forms/src/diagnostics.ts`: structured diagnostics.
- `packages/forms/src/testing.ts`: forms testing helpers exported by `@vanrot/forms`.

Primary test files:

- `packages/forms/tests/package.test.ts`: package exports and no-runtime-growth guardrails.
- `packages/forms/tests/field.test.ts`: field state.
- `packages/forms/tests/form.test.ts`: form lifecycle and submit.
- `packages/forms/tests/validation.test.ts`: sync validation and message timing.
- `packages/forms/tests/resources.test.ts`: async resource state and cancellation.
- `packages/forms/tests/arrays.test.ts`: field arrays.
- `packages/forms/tests/wizard.test.ts`: wizard state.
- `packages/forms/tests/server-errors.test.ts`: server error mapping.
- `packages/forms/tests/draft.test.ts`: draft persistence.
- `packages/forms/tests/ui.test.ts`: UI helper state and accessibility metadata.
- `packages/forms/tests/metadata.test.ts`: metadata export.
- `packages/forms/tests/diagnostics.test.ts`: diagnostics.
- `packages/forms/tests/testing.test.ts`: testing helper behavior.

Tooling and integration files:

- `packages/vite-plugin/src/forms/forms-metadata.ts`: discover `.form.ts` files and read metadata.
- `packages/vite-plugin/src/forms/forms-diagnostics.ts`: adapt `@vanrot/forms` diagnostics to Vite terminal and overlay.
- `packages/vite-plugin/tests/forms-metadata.test.ts`: `.form.ts` discovery and metadata tests.
- `packages/vite-plugin/tests/forms-diagnostics.test.ts`: Vite-facing diagnostics tests.
- `packages/vite-plugin/package.json`: add `@vanrot/forms` file dependency only if the plugin imports forms code directly.
- `packages/testing/src/forms.ts`: optional bridge helpers if forms testing should also be exported from `@vanrot/testing`.
- `packages/testing/tests/forms.test.ts`: testing bridge coverage if the bridge ships.
- `packages/cli/src/create/write-app.ts` and related starter files: add forms examples only if Phase 21 starter docs require generated sample forms.
- `publish.sh`, `scripts/verify-release-dry-run.mjs`, package release metadata, and AI bundle inputs: add `@vanrot/forms` when package metadata ships.

Documentation and tracker files:

- `docs/superpowers/specs/Phase-21.md`: update only if requirements change.
- `docs/superpowers/plans/Phase-21.md`: mark tasks complete as they pass.
- `docs/superpowers/feature-maturity.md`: mark Phase 21 complete only after all acceptance criteria pass.
- `docs/superpowers/final-tdd-inventory.md`: add every package, command, helper, example, and generated file added by Phase 21.
- `docs/superpowers/future-pipeline.md`: update when Phase 21 ships or scope changes.
- `apps/vanrot-site`: add docs pages only after public API shape is stable.
- `.vanrot/ai` outputs: rebuild after docs or package metadata changes.

## Module And Submodule Checklist

### Module 21A: Package Foundation And Public Contract

- [x] Create `packages/forms/package.json` with `@vanrot/forms`, ESM exports, `build`, `typecheck`, `test`, and `clean` scripts matching existing package style.
- [x] Create `packages/forms/tsconfig.json` extending `../../tsconfig.base.json` with `rootDir: "src"`, `outDir: "dist"`, declarations, and `src/**/*.ts` include.
- [x] Create `packages/forms/src/index.ts` with only stable public exports.
- [x] Create `packages/forms/src/constants.ts` with package name, diagnostic code constants, metadata key constants, and sensitive field name constants.
- [x] Create `packages/forms/src/types.ts` with signal-native form, field, validation, resource, draft, metadata, and diagnostics types.
- [x] Add `packages/forms/tests/package.test.ts` covering public exports and confirming the package does not import from `@vanrot/runtime` unless the final design explicitly approves it.
- [x] Run `pnpm --filter @vanrot/forms test` and `pnpm --filter @vanrot/forms typecheck`.

Expected public contract sketch:

```ts
export {
  createForm,
  field,
  fieldArray,
  required,
  minLength,
  email,
  createFormResource,
  createDraftStorage,
  applyServerErrors,
  createFormTest,
} from '@vanrot/forms';
```

### Module 21B: Field State, Form Lifecycle, And Validation

- [x] Implement `packages/forms/src/field.ts` with `field(initialValue, options)` returning signal-native value, initial value, dirty, touched, disabled, pending, valid, invalid, errors, and message state.
- [x] Implement `packages/forms/src/form.ts` with `createForm(...)`, named `form.fields`, reset, touch, validate, submit, and metadata hooks.
- [x] Implement `packages/forms/src/validation.ts` with plain Vanrot validator functions first: `required()`, `minLength(...)`, `email()`, and custom validator execution.
- [x] Implement `packages/forms/src/messages.ts` so validation messages stay quiet initially, appear after touch/change, and all known messages show on submit.
- [x] Add `packages/forms/tests/field.test.ts` covering dirty, touched, disabled, pending, valid, invalid, reset, and named refs.
- [x] Add `packages/forms/tests/form.test.ts` covering `createForm(...)`, named `form.fields.email`, submit lifecycle, all-errors-on-submit, and reset.
- [x] Add `packages/forms/tests/validation.test.ts` covering sync validators, custom validators, message timing, and validator source metadata.
- [x] Run `pnpm --filter @vanrot/forms test` and `pnpm --filter @vanrot/forms typecheck`.

Expected named-ref usage:

```ts
const form = createForm({
  fields: {
    email: field('', { validators: [required(), email()] }),
  },
});

form.fields.email.value.set('user@example.com');
form.fields.email.value();
```

### Module 21C: Async Resources And Cancellation

- [x] Implement `packages/forms/src/resources.ts` with a form-scoped async resource primitive for loading, success, error, refresh, stale, cancellation, and ignored stale results.
- [x] Add async validator support through the resource model, not a separate runtime.
- [x] Make cancellation or stale-result ignoring automatic by default.
- [x] Expose dependency fields so resources refresh when related fields change.
- [x] Add diagnostics for custom async work that cannot be cancelled or safely ignored.
- [x] Add `packages/forms/tests/resources.test.ts` covering latest-interaction-wins, stale result ignored, cancellation, refresh, stale state, and async validation.
- [x] Run `pnpm --filter @vanrot/forms test` and `pnpm --filter @vanrot/forms typecheck`.

Expected async resource sketch:

```ts
const form = createForm({
  fields: {
    email: field('', {
      asyncValidators: [
        createFormResource({
          dependsOn: ['email'],
          load: ({ value, signal }) => checkEmailAvailability(value, { signal }),
        }),
      ],
    }),
  },
});
```

### Module 21D: Nested Fields, Field Arrays, Wizards, And Server Errors

- [x] Implement `packages/forms/src/arrays.ts` with add, remove, move, stable item keys, nested item refs, per-item validation, and cross-array validation.
- [x] Implement nested field group support while preserving named refs and exporting stable metadata paths.
- [x] Implement `packages/forms/src/wizard.ts` with step state, current step, completed steps, blocked steps, per-step validation, and submit gates.
- [x] Implement `packages/forms/src/server-errors.ts` with field-level, nested, array-item, form-level, and resource error mapping.
- [x] Add `packages/forms/tests/arrays.test.ts` covering add, remove, move, stable keys, nested refs, and array validation.
- [x] Add `packages/forms/tests/wizard.test.ts` covering current step, blocked step, per-step validation, and submit gates.
- [x] Add `packages/forms/tests/server-errors.test.ts` covering `items[2].sku`, form-level errors, resource errors, and server errors coexisting with local validation.
- [x] Run `pnpm --filter @vanrot/forms test` and `pnpm --filter @vanrot/forms typecheck`.

Expected field-array sketch:

```ts
const form = createForm({
  fields: {
    items: fieldArray(() => ({
      sku: field(''),
      quantity: field(1),
    })),
  },
});

form.fields.items.add({ sku: 'A-100', quantity: 2 });
form.fields.items.move(0, 1);
```

### Module 21E: Draft Persistence And Sensitive Field Policy

- [x] Implement `packages/forms/src/draft.ts` with local storage adapter, session storage adapter, custom adapter contract, versioned keys, restore, clear, and reset lifecycle.
- [x] Add sensitive-field defaults so names such as password, secret, token, key, and credential do not persist unless explicitly allowed.
- [x] Add diagnostics for sensitive fields configured for persistence without an explicit allow flag.
- [x] Add `packages/forms/tests/draft.test.ts` covering local adapter, session adapter, custom adapter, version mismatch, restore, clear, reset, and sensitive-field warning behavior.
- [x] Run `pnpm --filter @vanrot/forms test` and `pnpm --filter @vanrot/forms typecheck`.

Expected draft sketch:

```ts
const form = createForm({
  draft: createDraftStorage({
    key: 'checkout-v1',
    storage: 'local',
    version: 1,
  }),
  fields: {
    email: field(''),
    password: field('', { persistence: 'never' }),
  },
});
```

### Module 21F: UI Helpers And Accessibility Wiring

- [x] Implement `packages/forms/src/ui.ts` with helper state that `@vanrot/ui` form primitives can consume for label, description, message, disabled, pending, and `aria-*` wiring.
- [x] Keep UI helpers as consumers of form state, not a second form model.
- [x] Define helper metadata for repeated field-array rows and wizard steps.
- [x] Add `packages/forms/tests/ui.test.ts` covering label linkage, description linkage, validation message IDs, server message IDs, pending state, disabled state, array rows, and wizard steps.
- [x] Update `@vanrot/ui` docs or primitives only if helpers require a public UI integration point.
- [x] Run `pnpm --filter @vanrot/forms test`, `pnpm --filter @vanrot/forms typecheck`, and affected `@vanrot/ui` tests if UI files change.

Expected UI helper sketch:

```ts
const emailUi = formField(form.fields.email, {
  label: 'Email',
  description: 'Used for receipts and account recovery.',
});

emailUi.inputAttributes();
emailUi.messageAttributes();
```

### Module 21G: Metadata, Diagnostics, And Vite Integration

- [x] Implement `packages/forms/src/metadata.ts` with serializable metadata for fields, validators, resources, persistence, sensitive fields, messages, and diagnostics paths.
- [x] Implement `packages/forms/src/diagnostics.ts` with structured diagnostics for invalid form definitions, missing defaults, invalid validator returns, unsafe async resources, sensitive draft persistence, unknown field refs, invalid server error paths, repeated string paths, and unsupported two-way binding usage.
- [x] Add `packages/forms/tests/metadata.test.ts` and `packages/forms/tests/diagnostics.test.ts`.
- [x] Add `packages/vite-plugin/src/forms/forms-metadata.ts` for `.form.ts` discovery when forms are present.
- [x] Add `packages/vite-plugin/src/forms/forms-diagnostics.ts` to adapt form diagnostics to terminal and overlay output.
- [x] Add `packages/vite-plugin/tests/forms-metadata.test.ts` and `packages/vite-plugin/tests/forms-diagnostics.test.ts`.
- [x] Update `packages/vite-plugin/package.json` prebuild and dependency entries only if the plugin imports `@vanrot/forms`.
- [x] Run `pnpm --filter @vanrot/forms test`, `pnpm --filter @vanrot/vite-plugin test`, and affected typechecks.

Expected diagnostic shape:

```ts
type FormDiagnostic = {
  code: 'VR_FORM_MISSING_DEFAULT' | 'VR_FORM_UNSAFE_ASYNC_RESOURCE' | 'VR_FORM_SENSITIVE_DRAFT_FIELD';
  severity: 'warning' | 'error';
  message: string;
  formPath: string;
  fieldPath?: string;
  source?: {
    file: string;
    line?: number;
    column?: number;
  };
};
```

### Module 21H: Testing Helpers

- [x] Implement `packages/forms/src/testing.ts` with focused helpers for reading field state, setting values, touching fields, submitting forms, resolving async resources, applying server errors, and inspecting draft state.
- [x] Add `packages/forms/tests/testing.test.ts` covering each helper against real `createForm(...)` forms.
- [x] Decide whether to also export forms testing from `@vanrot/testing`; if yes, add `packages/testing/src/forms.ts`, export it from `packages/testing/src/index.ts`, and add `packages/testing/tests/forms.test.ts`.
- [x] Keep forms testing helpers independent from browser-only APIs unless a test explicitly needs DOM integration.
- [x] Run `pnpm --filter @vanrot/forms test` and affected `@vanrot/testing` tests.

Expected testing helper sketch:

```ts
const testForm = createFormTest(form);

testForm.set('email', 'bad-email');
testForm.touch('email');
testForm.expectField('email').toHaveMessage('Email is invalid');
await testForm.submit();
```

### Module 21I: Schema Adapters And Backend Contract Boundary

- [x] Define a schema adapter interface in `packages/forms/src/validation.ts` or `packages/forms/src/schema.ts` that lets forms consume backend or domain schemas without adding schema-library dependencies to core.
- [x] Keep adapter output mapped into normal Vanrot validators and message metadata.
- [x] Add tests with a fake schema adapter that proves adapter consumption works without importing Zod, Valibot, Yup, or backend-only code.
- [x] Add diagnostics for adapters that cannot expose stable field paths or message metadata.
- [x] Document that frontend forms do not generate backend contracts by default.
- [x] Add `packages/forms/tests/schema.test.ts` covering adapter consumption, invalid adapter shape, field path mapping, and backend-contract non-generation.
- [x] Run `pnpm --filter @vanrot/forms test` and `pnpm --filter @vanrot/forms typecheck`.

Expected schema adapter sketch:

```ts
const form = createForm({
  fields: {
    email: field(''),
  },
  schemas: [
    useSchemaAdapter({
      name: 'account',
      fields: ['email'],
      validate: (values) => accountSchema.safeParse(values),
    }),
  ],
});
```

### Module 21J: Compiler Two-Way Binding Decision

- [x] Decide whether Phase 21 ships compiler syntax for binding form fields to inputs, or only defines the field contract for a later compiler slice.
- [x] If syntax ships, add compiler tests before implementation for valid field binding, invalid field refs, repeated string paths, and source diagnostics.
- [x] If syntax is deferred, document the deferral in `docs/superpowers/specs/Phase-21.md`, `docs/superpowers/feature-maturity.md`, and `docs/superpowers/future-pipeline.md`.
- [x] Ensure function APIs and UI helpers work without compiler syntax.
- [x] Run compiler tests only if compiler files change.

Allowed first-pass outcome:

```txt
Phase 21 ships `@vanrot/forms` field contracts and UI helpers.
Compiler two-way binding syntax is deferred until the form contract is stable in user-facing examples.
```

### Module 21K: Docs, Examples, AI Metadata, And Release Closeout

- [x] Add `apps/vanrot-site` forms docs only after public API naming is stable.
- [x] Include examples for simple form, field array invoice, wizard form, async validation, server errors, and draft persistence.
- [x] Update `docs/superpowers/final-tdd-inventory.md` with every new forms package feature, helper, example, generated file, diagnostic, and docs page.
- [x] Update `docs/superpowers/feature-maturity.md` when Phase 21 scope or status changes.
- [x] Update `docs/superpowers/future-pipeline.md` when Forms And Resources moves from parked future work to active or shipped phase work.
- [x] Update package release metadata, `publish.sh`, and `scripts/verify-release-dry-run.mjs` if `@vanrot/forms` ships as publishable.
- [x] Rebuild AI-readable outputs after framework docs, public APIs, package metadata, or diagnostics change.
- [x] Restart `apps/vanrot-site` dev server and verify relevant docs routes if site docs change.

Closeout commands:

```sh
pnpm --filter @vanrot/forms test
pnpm --filter @vanrot/forms typecheck
pnpm --filter @vanrot/forms build
pnpm --filter @vanrot/vite-plugin test
pnpm --filter @vanrot/testing test
pnpm verify:size
pnpm verify:release-dry-run
pnpm verify:final-tdd-inventory
pnpm verify:phase-docs
pnpm verify
PUBLISH_DRY_RUN=1 ./publish.sh
```

Run only the commands relevant to the implemented scope during partial module work. Run the full closeout commands before
marking Phase 21 complete.

## Phase Tracking And Verification Closeout

- [x] Keep Phase 21 unchecked in `docs/superpowers/feature-maturity.md` until all acceptance criteria pass.
- [x] Mark completed tasks in this plan only after the matching implementation, tests, docs, and verifier pass.
- [x] Update `docs/superpowers/final-tdd-inventory.md` with all Phase 21 packages, APIs, examples, diagnostics, generated files, and docs pages.
- [x] Update `docs/superpowers/future-pipeline.md` when Forms And Resources is activated, shipped, deferred, or superseded.
- [x] Update `docs/superpowers/specs/Phase-21.md` if implementation changes the accepted design.
- [x] Run `vr ai build` and `vr ai verify` after framework-facing docs, public APIs, package metadata, or diagnostics change.
- [x] Run `pnpm verify` before marking Phase 21 complete.
