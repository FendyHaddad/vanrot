# Phase 21 Forms And Async Spec

## Status

Implemented in Phase 21. Closeout verification tracks the shipped `@vanrot/forms` package, docs, metadata, release
surface, and runtime-size guardrails.

## Goal

Phase 21 gives Vanrot a first-party `@vanrot/forms` package for form-heavy and async-heavy apps without adding weight to
`@vanrot/runtime`. The package should make simple forms easy, keep large enterprise forms understandable, and expose
structured metadata that Vite, future Forge, editor tooling, and AI-readable reports can inspect.

## Problem

Vanrot currently supports signals, component templates, events, property bindings, UI primitives, router refs, SSR, and
testing helpers, but it does not have a first-party form model. Real apps need validation, field state, async lookups,
submit lifecycle, server-returned errors, draft persistence, and accessible UI wiring. If these concerns are patched
directly into the compiler or runtime, the framework risks growing the runtime kernel and hiding application logic in
templates.

## Design Principles

- Keep form behavior in `@vanrot/forms`, not `@vanrot/runtime`.
- Prefer named refs and readable APIs over repeated string paths.
- Keep business logic in TypeScript and UI structure in HTML.
- Use signals for form state.
- Make the common path seamless and the advanced path explicit.
- Keep advanced features tree-shakeable.
- Make diagnostics structured so Vite can report them now and Forge can report them later.
- Do not make frontend forms the backend contract source of truth.

## Package Boundary

Phase 21 should design `@vanrot/forms` as the owning package for forms and form-scoped async resources.

There should not be a standalone `@vanrot/resources` package in the first design. Async resources are related to forms in
the expected use cases: async validation, option loading, dependent fields, submit status, refresh, stale state, and
cancellation. A separate resources package should only be reopened if a later design proves strong non-form usage.

`@vanrot/forms` should expose:

- a function-first core, such as `createForm(...)`;
- reusable `.form.ts` role-file definitions;
- UI helpers that bind cleanly to `@vanrot/ui`;
- structured metadata for Vite, Forge, editor diagnostics, and AI-readable reports;
- testing helpers exported from `@vanrot/forms`.

## Form Role Files

Reusable form definitions should prefer `.form.ts` files, such as `checkout.form.ts` or `profile.form.ts`.

These files should be discoverable by project intelligence and should describe:

- fields and nested field groups;
- field arrays;
- validation rules;
- async validators and resources;
- submit lifecycle behavior;
- draft persistence;
- sensitive-field policy;
- diagnostics metadata.

Component files can instantiate or consume a form, but shared form contracts should live in role files when they are
reused or complex enough for tooling to inspect.

## API Model

The public API should support both layers:

- Function core: `createForm(...)`, fields, validators, resources, submit, reset, draft lifecycle, and metadata export.
- UI helpers: form and field helpers that connect to `@vanrot/ui` labels, messages, disabled state, pending state,
  accessibility state, and repeated field rendering.

Field access should prefer named refs:

```ts
const checkoutForm = createForm({
  fields: {
    email: field(''),
    items: fieldArray(() => ({
      sku: field(''),
      quantity: field(1),
    })),
  },
});

checkoutForm.fields.email;
checkoutForm.fields.items.items()[0]?.fields.quantity;
```

For docs and examples, the generic pattern should be shown as `form.fields.email` instead of `field("email")`.

String paths may exist for diagnostics or adapters, but they should not be the main authoring API.

## Field State

Each field should expose signal-native state for:

- value;
- initial value;
- dirty;
- touched;
- focused where useful;
- disabled;
- pending;
- valid and invalid;
- errors and messages;
- source of errors, such as local validation, async validation, server error, or resource failure.

Nested fields and field arrays should preserve named refs while still exporting stable metadata paths for diagnostics and
server error mapping.

## Validation

Validation should start with plain Vanrot functions.

Examples:

- `required()`;
- `minLength(8)`;
- `email()`;
- custom validator functions;
- async validators through the form-scoped resource model.

Validation messages should:

- stay quiet initially;
- appear after touch or change;
- show all known errors on submit;
- allow server-returned errors to be applied without replacing local validation rules.

Schema adapters can be added later for Zod, Valibot, Yup, or backend/domain schemas. The core package should consume
schemas through adapters, not generate backend contracts by default.

## Async Resources

Async resources belong inside `@vanrot/forms` for this phase.

Resources should model:

- loading;
- success;
- error;
- refresh;
- stale;
- cancellation;
- ignored stale results;
- dependency fields;
- submit status;
- async option loading;
- async validation.

Cancellation or stale-result ignoring should be automatic by default. The latest valid user interaction wins.

Custom async resources should be diagnosable. Vite and future Forge should warn when a resource cannot be cancelled or
cannot safely ignore stale results.

## UI Helpers

UI helpers should integrate with `@vanrot/ui` without hiding application logic in HTML.

They should provide ergonomic wiring for:

- labels;
- descriptions;
- validation messages;
- server errors;
- pending states;
- disabled states;
- `aria-*` attributes;
- submit buttons;
- repeated field-array rows;
- wizard step state.

Helpers should consume form state; they should not become a second form model.

## Wizards And Field Arrays

The package should support a full suite from the start, while keeping advanced code tree-shakeable.

Wizard support should cover:

- step state;
- current step;
- completed and blocked steps;
- per-step validation;
- submit gates;
- draft restoration.

Field arrays should cover:

- add;
- remove;
- move;
- stable item keys;
- nested item refs;
- per-item validation;
- cross-array validation;
- server error mapping for item paths.

## Server Errors

Server-returned errors are first-class.

The package should support:

- field-level server errors;
- nested and array field server errors;
- form-level server errors;
- resource errors;
- submit result helpers that apply server errors to the existing message system.

Server errors should be visible through the same UI helper message flow as local validation errors.

## Draft Persistence

Draft persistence should be opt-in per form.

The first design should include:

- local storage adapter;
- session storage adapter;
- custom adapter contract;
- versioned draft keys;
- restore, clear, and reset lifecycle;
- sensitive-field defaults.

Secrets and passwords should not persist by default. Diagnostics should warn when a persisted field looks sensitive unless
the field explicitly allows persistence.

## Tooling Diagnostics

`@vanrot/forms` should expose structured diagnostics and metadata without coupling to a single build tool.

Vite should consume the metadata first. Future Forge should consume the same contract.

Diagnostics should cover:

- invalid form definitions;
- missing field defaults;
- invalid validator return shapes;
- unsafe async resource cancellation;
- sensitive fields with draft persistence;
- unknown field refs in UI helpers;
- invalid server error paths;
- repeated string paths when a named ref exists;
- unsupported compiler two-way binding usage before the forms contract is active.

Diagnostics should be terminal-friendly and overlay-friendly.

## Compiler Integration

Two-way binding should be designed with the forms package, not patched into the compiler alone.

Phase 21 should define the field contract first. Compiler work can then decide whether Vanrot needs template syntax sugar
for binding fields to inputs.

Compiler syntax is not required for the first usable form core. Function APIs and UI helpers should work without waiting
for new template syntax.

Future compiler `@await` or `@defer` ideas should coordinate with async resource state, but Phase 21 should not implement
those compiler features early.

## Non-Goals

- No standalone `@vanrot/resources` package in the first design.
- No backend schema generation from frontend forms by default.
- No runtime-kernel growth unless a tiny hook is proven necessary and still passes the size budget.
- No Angular-style template pipe feature in this phase.
- No hidden application logic in templates.
- No dependency on RxJS or a schema library in the core package.
- No full data-loading framework.

## Decision Gates

Phase 21 design must resolve:

- final `@vanrot/forms` public package exports;
- whether `.form.ts` files are required, recommended, or only discovered when present;
- exact field-ref and nested field-array shape;
- validator return shape;
- async resource cancellation contract;
- server error path contract;
- draft persistence adapter contract;
- UI helper names and `@vanrot/ui` integration boundary;
- metadata and diagnostics shape consumed by Vite and future Forge;
- whether compiler two-way binding syntax is included in Phase 21 or deferred to a later compiler slice.

## Acceptance Criteria

Phase 21 is complete only when:

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

## Verification

Minimum closeout verification:

- Package tests for `@vanrot/forms`.
- Compiler or Vite tests for `.form.ts` discovery and diagnostics if tooling integration ships.
- UI helper tests with generated or source-owned `@vanrot/ui` form primitives.
- Async cancellation tests for validators and resources.
- Draft persistence tests, including sensitive-field warnings.
- Server error mapping tests for nested fields and field arrays.
- Testing helper coverage for form-heavy examples.
- `pnpm verify:size`
- `pnpm verify:release-dry-run` after package metadata or version changes.
- `PUBLISH_DRY_RUN=1 ./publish.sh` after package metadata or version changes; add `forms` to publish metadata if
  `@vanrot/forms` ships.
- `pnpm verify`
