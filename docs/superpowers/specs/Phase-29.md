# Phase 29 Formatters And Template Pipes Spec

## Status

Implemented. Phase 29 shipped compiler-native template pipes, the `@vanrot/formatters` package, `.pipe.ts` discovery,
named presets, formatting context defaults, Vite diagnostics, docs, examples, AI/reference coverage, release metadata,
and verification gates.

## Goal

Phase 29 gives Vanrot compiler-native template pipes for common display formatting, business-specific labels, and
enterprise-friendly formatting defaults without adding meaningful weight to `@vanrot/runtime`.

The feature should make templates easier to scan, keep repeated formatting out of component logic, and expose metadata
that Vite, future Forge, editor tooling, docs, and AI-readable reports can inspect.

## Problem

Vanrot templates currently support interpolation and reactive expressions, but reusable display formatting still has to
live in component code, repeated template expressions, or application-specific helpers. Real apps need date formats,
money formats, masked values, enum labels, validation messages, and clean business presets such as invoice dates or
country-specific phone masks.

If formatting becomes only application code, templates grow noisy and tooling cannot diagnose missing or invalid
formatters. If formatting becomes runtime-heavy, it risks the core browser size budget. The compiler should own pipe
syntax, validation, diagnostics, and metadata while keeping actual formatting helpers tree-shakeable.

## Design Principles

- Treat pipes as a compiler feature first.
- Keep `@vanrot/runtime` almost untouched unless a tiny stable hook is proven necessary.
- Support a full suite in one phase rather than a narrow MVP.
- Keep pipes pure: no async work, API calls, mutation, or side effects.
- Keep templates readable with pipe syntax and clean presets.
- Let users define business-specific pipes and presets in `.pipe.ts` role files.
- Make unknown pipes, unknown variants, duplicate names, and knowable invalid arguments fatal diagnostics.
- Include file path, line, column, code frame, diagnostic code, suggestion, and docs path in terminal output.

## Template Syntax

Pipe syntax is valid inside interpolation expressions:

```html
{{ value | pipeName }}
{{ value | pipeName(arg1, arg2) }}
{{ value | namespace.variant }}
{{ value | namespace.variant(arg1) }}
{{ value | firstPipe | secondPipe(arg) }}
```

Pipes run left to right. The output of one pipe becomes the input of the next pipe.

Pipe arguments should support strings, numbers, booleans, identifiers, and simple property reads. The implementation
plan can decide whether more complex expression arguments are allowed, but large object literals should not become the
teaching path.

## Built-In Pipe Style

Vanrot uses mixed style:

```html
{{ name | uppercase }}
{{ row.description | truncate(20) }}
{{ createdAt | date.monthDayYear }}
{{ amount | number.thousands }}
{{ amount | currency }}
{{ phone | mask("###-#######") }}
```

Small common pipes can be standalone. Variant-heavy pipes use namespaces.

## Built-In Pipe Suite

### Text

```html
{{ value | uppercase }}
{{ value | lowercase }}
{{ value | titlecase }}
{{ value | sentencecase }}
{{ value | truncate(20) }}
{{ value | fallback("N/A") }}
{{ value | initials }}
```

### Date And Time

```html
{{ createdAt | date }}
{{ createdAt | date.monthDayYear }}
{{ createdAt | date.dayMonthYear }}
{{ createdAt | date.monthYear }}
{{ createdAt | date.short }}
{{ createdAt | date.long }}
{{ createdAt | date("MM/dd/yyyy") }}
{{ createdAt | time }}
{{ createdAt | time("HH:mm") }}
{{ createdAt | datetime }}
{{ createdAt | datetime("dd/MM/yyyy HH:mm") }}
{{ createdAt | relativeTime }}
{{ durationMs | duration }}
```

Date format strings remain available for custom cases, but named presets should be preferred when a format is reused.

### Number And Money

```html
{{ amount | number }}
{{ amount | number.thousands }}
{{ amount | number.cents }}
{{ amount | number("0,0.00") }}
{{ amount | percent }}
{{ amount | currency }}
{{ amount | currency("USD") }}
{{ amount | compact }}
{{ bytes | filesize }}
```

### Lists And Counts

```html
{{ tags | join(", ") }}
{{ items | count }}
{{ items.length | plural("item", "items") }}
```

### Masks

```html
{{ phone | mask("###-#######") }}
{{ phone | mask.malaysiaPhone }}
```

Masks ship with generic `mask(pattern)` support and user-defined presets. Phase 29 should not claim universal
country-specific masks as built-ins.

### Forms And Validation Messages

```html
{{ email | message }}
{{ email | messages }}
```

Forms message pipes should integrate with `@vanrot/forms` field message state without making forms a dependency of the
core runtime.

## Pipe Role Files

`.pipe.ts` files are app-global registries. Vite and the compiler discover them and expose a single pipe registry for
the app.

Preset exports attach to a built-in namespace:

```ts
// src/formatting/business.pipe.ts
export const invoice = datePattern("dd/MM/yyyy");
export const malaysiaPhone = maskPattern("###-#######");
export const accounting = numberPattern("(0,0.00)");
```

They are used as:

```html
{{ invoice.createdAt | date.invoice }}
{{ customer.phone | mask.malaysiaPhone }}
{{ total | number.accounting }}
```

Custom pipe function exports are standalone:

```ts
// src/claims/claims.pipe.ts
export const claimStatus = definePipe((status, ctx) => {
  switch (status) {
    case "APPROVED":
      return ctx.locale === "ms-MY" ? "Diluluskan" : "Approved";
    case "REJECTED":
      return "Rejected";
    case "PENDING_REVIEW":
      return "Pending review";
    default:
      return "Unknown";
  }
});
```

They are used as:

```html
{{ claim.status | claimStatus }}
```

The implementation should support normal TypeScript imports, including enums imported from separate files.

## Enum Pipes

Enterprise apps often receive backend enum values and need readable labels. Phase 29 should include `enumPipe(...)` as a
first-party helper.

```ts
// claim-status.ts
export enum ClaimStatus {
  Approved = "APPROVED",
  Rejected = "REJECTED",
  PendingReview = "PENDING_REVIEW",
}
```

```ts
// claims.pipe.ts
import { ClaimStatus } from "./claim-status";

export const claimStatus = enumPipe(ClaimStatus, {
  [ClaimStatus.Approved]: "Approved",
  [ClaimStatus.Rejected]: "Rejected",
  [ClaimStatus.PendingReview]: "Pending review",
  fallback: "Unknown",
});
```

The compiler does not need to understand every enum value in v1. TypeScript can typecheck the imported enum. Vanrot
should discover the exported pipe and diagnose missing template references.

## Formatting Context

Custom pipes receive read-only formatting context:

```ts
definePipe((value, ctx, ...args) => formattedValue)
```

The initial context should include:

- `locale`;
- `timezone`;
- `currency`.

Global defaults live in Vanrot config:

```ts
export default defineConfig({
  formatting: {
    locale: "ms-MY",
    timezone: "Asia/Kuala_Lumpur",
    currency: "MYR",
  },
});
```

Pipe files can add domain presets. Template arguments remain available for per-use overrides.

## Diagnostics

Pipe diagnostics are fatal when they indicate wrong framework usage:

- unknown pipe name;
- unknown namespace variant;
- duplicate custom pipe name;
- duplicate preset inside the same namespace;
- invalid preset helper usage;
- async custom pipe;
- invalid pipe argument when knowable at compile time.

Diagnostic output must include source location and code frame:

```txt
src/pages/orders.page.html:14:27 VR_PIPE_INVALID_ARGUMENT
Pipe "truncate" expects number for argument 1.

14 | {{ row.description | truncate("twenty") }}
   |                           ^^^^^^^^^^^^^
Suggestion: Use truncate(20).
Docs: /docs/formatters
```

Dev server startup should report malformed `.pipe.ts` files and duplicate exports even before a template uses them.

## Compiler And Tooling Contract

The compiler should:

- parse pipe chains inside interpolation expressions;
- preserve source spans for pipe names, variants, and arguments;
- validate built-in and discovered custom pipes;
- lower pipe chains into generated formatter calls;
- emit metadata for pipe definitions, presets, source files, and template usages;
- keep the generated output SSR-safe and deterministic.

The Vite plugin should:

- discover `.pipe.ts` role files;
- format compiler diagnostics for the terminal;
- report diagnostics on startup and rebuild;
- expose pipe metadata for docs, future Forge, editor tooling, and AI-readable output.

Future Forge should consume the same metadata contract instead of inventing a second formatter registry.

## Docs And Examples

Phase 29 should add a `/docs/formatters` guide covering:

- pipe syntax;
- chaining;
- built-in text/date/time/number/money/list/mask/forms pipes;
- `.pipe.ts` role files;
- custom presets;
- custom `definePipe(...)` functions;
- `enumPipe(...)`;
- formatting context and config defaults;
- diagnostics and common fixes.

An example app should show:

- date presets;
- number and currency formatting;
- `mask(pattern)` and mask presets;
- text truncation and fallback;
- enum labels from backend-like values;
- forms message pipes.

## Testing Requirements

Phase 29 should include failing-first and passing coverage for:

- parser support for pipe names, arguments, dotted variants, and chains;
- compiler generation for built-ins and custom pipes;
- source span preservation for diagnostics;
- unknown pipe diagnostics;
- unknown variant diagnostics;
- duplicate custom name diagnostics;
- invalid argument diagnostics;
- async custom pipe diagnostics;
- formatting context from config;
- `.pipe.ts` discovery;
- Vite terminal diagnostics;
- docs-site route and content;
- AI docs/reference freshness;
- runtime size budget;
- release dry-run package surface.

Final closeout should run `pnpm verify`, `pnpm verify:size`, relevant docs verifiers, AI docs verification, and release
dry-run checks before marking the phase complete.
