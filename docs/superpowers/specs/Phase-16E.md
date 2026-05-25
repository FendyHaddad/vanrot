# Phase 16E Controlled Forms And Data Primitives

## Purpose

Phase 16E makes Vanrot UI useful for real app screens.

Phase 16A established the October UI foundation. Phase 16B proved the core primitive pattern. Phase 16C created the Vanrot learning site. Phase 16D added layout, navigation, media primitives, and strict dotted token attributes.

Phase 16E builds the next production slice: controlled form primitives, practical data display primitives, a rich component attribute registry, and CLI help that exposes component APIs before the future IDE plugin exists.

The goal is not to create a bloated enterprise UI framework. The goal is a low-ceremony Vanrot layer that can build forms, dashboard tables, settings screens, and docs examples with strong accessibility, clear diagnostics, and discoverable APIs.

## Approved Direction

Phase 16E uses the **Controlled Forms + Useful Data Primitives** approach.

Approved decisions:

- Dotted token attributes remain the primary Vanrot docs and authoring style.
- Form primitives are controlled by Vanrot form context, not just styled native wrappers.
- Form validation includes common built-in rules and custom validator support.
- Form submit orchestration is included, but app code owns the actual async save.
- Data primitives include a useful table, not just static anatomy.
- `<vr-table>` supports sorting, filtering, pagination, selection, loading, and empty states.
- `<vr-pagination>` is standalone and reusable outside tables.
- Table docs follow the usefulness and clean design rhythm of shadcn table docs without copying implementation.
- The component registry becomes rich enough to support docs, compiler diagnostics, CLI help, and future IDE tooling.
- `vr ui <component> --help` exposes supported component attributes, dotted tokens, token values, events, slots, examples, and docs paths.
- Tests cover all new behavior, metadata, docs, diagnostics, and CLI surfaces.

## Scope

Phase 16E includes these form primitives:

- `<vr-form>`
- `<vr-form-field>`
- `<vr-label>`
- `<vr-input>`
- `<vr-textarea>`
- `<vr-select>`
- `<vr-checkbox>`
- `<vr-radio-group>`
- `<vr-radio>`
- `<vr-switch>`
- `<vr-slider>`

Phase 16E includes these data primitives:

- `<vr-table>`
- `<vr-table-header>`
- `<vr-table-body>`
- `<vr-table-row>`
- `<vr-table-head>`
- `<vr-table-cell>`
- `<vr-table-footer>`
- `<vr-table-caption>`
- `<vr-pagination>`
- `<vr-list>`
- `<vr-list-item>`
- `<vr-stat>`
- `<vr-empty-state>`

Phase 16E also includes:

- controlled form state;
- built-in validation rules;
- submit orchestration;
- table sorting;
- table filtering;
- table pagination;
- table row selection;
- table loading and empty states;
- rich shared token scales;
- component-specific allowed token subsets;
- a rich UI component registry;
- compiler diagnostics that consume the registry;
- docs attribute/value tables generated from the registry;
- CLI UI help that consumes the registry;
- dedicated component documentation pages for every new primitive;
- tests for every new registry, compiler, runtime, CLI, and docs behavior.

## Out Of Scope

These stay outside Phase 16E:

- date picker;
- combobox;
- file upload;
- OTP input;
- rich text editor;
- charting;
- table virtualization;
- column resizing;
- pinned columns;
- grouped rows;
- server data source engine;
- async query/cache abstraction;
- schema library integration as a required dependency;
- full IntelliJ plugin or language service.

The future IDE plugin should consume the Phase 16E registry, but Phase 16E should not implement the plugin.

## Form Architecture

`<vr-form>` owns the form context.

It tracks:

- value;
- dirty;
- touched;
- valid;
- invalid;
- errors;
- disabled;
- pending;
- submitted.

`<vr-form-field>` registers a field and owns field wiring. It connects name, label, help text, validation messages, IDs, `aria-describedby`, `aria-invalid`, required state, and field-level status.

Controls such as `<vr-input>`, `<vr-select>`, and `<vr-checkbox>` stay clean. They render accessible native controls, read and write through the nearest form field context when present, and still work as standalone UI primitives outside `<vr-form>`.

Approved shape:

```html
<vr-form>
  <vr-form-field name.email label.email required>
    <vr-input type.email placeholder="Email" />
  </vr-form-field>

  <vr-button type.submit>Save</vr-button>
</vr-form>
```

Form validation supports:

- `required`;
- `min`;
- `max`;
- `minLength`;
- `maxLength`;
- `pattern`;
- `email`;
- custom validator functions.

Submit orchestration:

- validates on submit;
- marks invalid fields touched;
- prevents invalid submit;
- exposes pending state;
- allows application code to handle async save;
- avoids server action abstractions in this phase.

## Data Architecture

`<vr-table>` owns a lightweight table context.

It supports:

- sorting;
- filtering;
- pagination;
- row selection;
- loading state;
- empty state.

Approved shape:

```html
<vr-table sortable filterable paginated selectable density.compact>
  <vr-table-caption>Recent invoices</vr-table-caption>
  <vr-table-header>
    <vr-table-row>
      <vr-table-head sort.amount>Amount</vr-table-head>
      <vr-table-head sort.status>Status</vr-table-head>
    </vr-table-row>
  </vr-table-header>
  <vr-table-body>
    <vr-table-row>
      <vr-table-cell>$250.00</vr-table-cell>
      <vr-table-cell>Paid</vr-table-cell>
    </vr-table-row>
  </vr-table-body>
</vr-table>
```

The table should be useful enough for dashboards and admin screens, but it must not become a full enterprise data grid in this phase.

`<vr-pagination>` is a standalone primitive. Tables may consume it, but pagination can also be used by lists, search results, docs pages, and app screens.

`<vr-list>`, `<vr-list-item>`, `<vr-stat>`, and `<vr-empty-state>` provide practical dashboard/data display surfaces without introducing charting or query-layer behavior.

## Dotted Token Attributes

Phase 16E keeps dotted token attributes as a compile-time authoring feature.

Approved examples:

```html
<vr-input type.email size.md tone.danger>
<vr-select size.lg>
<vr-checkbox tone.success>
<vr-table density.compact sortable filterable paginated selectable>
<vr-pagination size.sm>
```

Rules:

- Dotted tokens are compile-time only.
- Supported token families are finite and registry-owned.
- Unknown token families are compiler errors.
- Unknown token values are compiler errors with suggestions.
- Duplicate token families on the same element are compiler errors.
- Unsupported values for a component are compiler errors with allowed values.
- Boolean behavior attributes stay readable.
- Open-ended values remain normal attributes or bindings.

Invalid examples:

```html
<vr-input size.sm size.lg>
<vr-table density.nano>
<vr-input placeholder.email>
```

Open-ended values stay normal:

```html
<vr-input name="invoiceTotal" value="ABC-123" aria-label="Invoice total">
```

## Rich Token Scale Strategy

Phase 16E introduces rich shared token families and component-specific allowed subsets.

Shared token families include:

- `size`: `2xs`, `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`
- `tone`: `default`, `muted`, `primary`, `secondary`, `success`, `warning`, `danger`, `info`
- `radius`: `none`, `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `full`
- `density`: `compact`, `comfortable`, `spacious`
- `align`: `start`, `center`, `end`
- `justify`: `start`, `center`, `end`, `between`
- `orientation`: `horizontal`, `vertical`
- `placement`: `top`, `right`, `bottom`, `left`

Not every component supports every value. Components opt into the values that make sense.

Example subsets:

- `vrInput.size`: `xs`, `sm`, `md`, `lg`, `xl`
- `vrSelect.size`: `xs`, `sm`, `md`, `lg`, `xl`
- `vrCheckbox.size`: `sm`, `md`, `lg`
- `vrSwitch.size`: `sm`, `md`, `lg`
- `vrSlider.size`: `sm`, `md`, `lg`
- `vrButton.size`: `xs`, `sm`, `md`, `lg`, `xl`, `icon`
- `vrStat.size`: `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`
- `vrTable.density`: `compact`, `comfortable`, `spacious`
- `vrPagination.size`: `sm`, `md`, `lg`

Each value must have rich metadata, not only a string name.

Value metadata includes:

- label;
- description;
- default status;
- deprecation status;
- CSS class or variable hooks;
- accessibility notes;
- example usage;
- related token values;
- migration notes when relevant.

## Rich Component Registry

The UI component registry becomes the source of truth for component APIs.

Every registry entry should include:

- tag;
- kind;
- status;
- description;
- anatomy;
- tokens;
- boolean attributes;
- open attributes;
- events;
- slots;
- CSS variables;
- CSS classes;
- CSS parts where applicable;
- accessibility notes;
- keyboard behavior;
- state model;
- examples;
- docs path;
- source files.

Token entries must include rich value metadata. Boolean and open attributes also require descriptions, accepted value types, native attribute mapping where relevant, validation behavior where relevant, and accessibility notes.

Conceptual shape:

```ts
{
  tag: 'vr-input',
  tokens: {
    size: {
      values: {
        xs: {
          label: 'Extra small',
          description: 'Compact input for dense forms.',
          default: false,
          deprecated: false,
          cssClass: 'vr-input--size-xs',
          examples: ['<vr-input size.xs />']
        },
        md: {
          label: 'Medium',
          description: 'Default input size.',
          default: true,
          deprecated: false,
          cssClass: 'vr-input--size-md',
          examples: ['<vr-input />', '<vr-input size.md />']
        }
      }
    }
  },
  booleanAttributes: {
    required: {
      description: 'Marks the field as required and connects validation.',
      nativeAttribute: true,
      validationRule: 'required'
    }
  },
  openAttributes: {
    name: {
      valueType: 'string',
      description: 'Field key used by form state and validation.'
    }
  }
}
```

Phase 16E must create complete registry entries for the new form and data primitives. It should also backfill enough metadata for Phase 16B and Phase 16D components so docs, compiler diagnostics, and CLI help can treat UI components consistently.

## Styling Precedence

Vanrot tokens provide defaults. User utility classes and project CSS must be able to override them.

Styling hierarchy:

1. Component base styles.
2. Dotted token attributes.
3. User-written utility classes from `vanrotstyles` or Tailwind.
4. Scoped or app CSS loaded after Vanrot.
5. Inline styles.

Compiler output should preserve user class intent by emitting generated base/token classes before user classes.

Conceptual output:

```html
<vr-input class="vr-input vr-input--display-grid flex">
```

In that example, the user-written `flex` utility represents the final local styling intent and should override the generated dotted token class when the utilities conflict.

Vanrot component and utility CSS should avoid `!important` except for rare accessibility escape hatches.

## CLI And Docs Discovery

Phase 16E adds CLI help for UI components.

Approved shape:

```sh
vr ui input --help
vr ui table --help
vr ui list
```

`vr ui <component> --help` should print:

- component description;
- usage examples;
- dotted token families and values;
- boolean attributes;
- open attributes;
- validation support when relevant;
- events;
- slots;
- accessibility notes;
- docs path;
- install or `vr add` notes.

The exact output should be guided, colored, and conventional, matching the existing Vanrot CLI product direction.

Docs pages should consume the same registry data. They should not hand-maintain attribute tables separately from compiler and CLI metadata.

## Component Documentation

Every Phase 16E primitive gets a dedicated docs page in `apps/vanrot-site`.

Docs pages follow the approved Button docs pattern:

- page title only at the top;
- variants overview card;
- one section per important variant or behavior;
- dotted preview backgrounds;
- shadcn-style preview and code blocks;
- code examples below meaningful previews;
- accessibility notes inside descriptions;
- generated attribute/value tables from the registry;
- mobile-ready layout;
- route-owned title and meta description.

Table documentation must especially follow the usefulness and clean rhythm of the shadcn table docs:

- simple anatomy example;
- realistic dashboard or invoice example;
- sortable table example;
- filterable table example;
- paginated table example;
- selectable rows example;
- loading and empty state examples;
- code placed where users naturally expect it.

## Accessibility Standards

Phase 16E components must preserve native semantics where possible.

Forms must:

- connect labels to controls;
- expose help and error messages through `aria-describedby`;
- set invalid state through `aria-invalid`;
- support required state clearly;
- keep keyboard operation native where possible;
- preserve focus visibility;
- support disabled and readonly states correctly;
- avoid logic in HTML templates.

Tables must:

- preserve table semantics;
- expose captions when present;
- support keyboard-reachable controls for sorting, filtering, pagination, and selection;
- expose row selection state accessibly;
- support loading and empty states without hiding table context from assistive technology.

All motion must respect reduced-motion preferences.

## Testing And Verification

Phase 16E must test all new behavior and metadata.

Required coverage:

- registry completeness for every 16E component;
- rich token value metadata;
- component-specific allowed token subsets;
- dotted token parsing;
- unknown token family diagnostics;
- unknown token value diagnostics with suggestions;
- duplicate token family diagnostics;
- unsupported component token value diagnostics;
- generated docs attribute tables;
- `vr ui <component> --help`;
- controlled form state;
- built-in validation;
- custom validator support;
- submit orchestration;
- table sorting;
- table filtering;
- table pagination;
- table row selection;
- table loading state;
- table empty state;
- docs route rendering;
- route-owned title and meta descriptions;
- site typecheck;
- full `pnpm verify`.

The phase is not complete until `pnpm verify` passes.

## Risks

The main risk is making forms and tables too heavy too early.

Mitigation:

- keep the form engine small and explicit;
- avoid required schema library integration;
- avoid server data-source abstractions;
- avoid enterprise table behavior;
- keep all finite API choices in the registry;
- generate docs and CLI help from registry data;
- make diagnostics strict and boring;
- let user utility classes override dotted tokens.

Another risk is registry bloat.

Mitigation:

- require rich metadata only for public component APIs;
- keep examples short and canonical;
- make component-specific token subsets explicit;
- avoid duplicate metadata in docs, compiler, and CLI.

## Questions For The Writing Plan

The writing plan should decide:

- exact package/file layout for the registry expansion;
- whether CLI help lives in the existing CLI command group or a new `ui` group;
- exact test file split for forms, table behavior, registry, compiler diagnostics, docs, and CLI;
- whether Phase 16E should backfill all 16B/16D registry metadata immediately or only the fields needed by shared docs and CLI;
- how much of the docs attribute table generation should be implemented generically in 16E.

## Production Readiness Outcome

Phase 16E is production-ready when Vanrot can build and document controlled forms and practical data screens with:

- semantic custom tags;
- strict dotted token attributes;
- rich registry-backed API discovery;
- accessible form state and validation;
- useful table behavior;
- generated docs metadata;
- CLI component help;
- user styling precedence;
- complete tests;
- passing verification.
