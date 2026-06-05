# Diagnostics

## VR001

Compiler diagnostic for unsupported or invalid component source.

Docs: /docs/diagnostics

## VR019

Compiler diagnostic for invalid Vanrot UI primitive variants.

Docs: /docs/ui/primitives

## VR020

Compiler diagnostic for duplicate Vanrot UI dotted tokens.

Docs: /docs/ui/dotted-token-attributes

## VR021

Compiler diagnostic for unknown Vanrot UI dotted tokens.

Docs: /docs/ui/dotted-token-attributes

## VR_PIPE_UNKNOWN

Template pipe diagnostic for a pipe name that is not built in and not exported from a .pipe.ts role file.

Docs: /docs/formatters

## VR_PIPE_UNKNOWN_VARIANT

Template pipe diagnostic for an unknown namespace preset such as date.invoice or mask.malaysiaPhone.

Docs: /docs/formatters

## VR_PIPE_DUPLICATE_NAME

Template pipe diagnostic for duplicate custom pipe names discovered across .pipe.ts files.

Docs: /docs/formatters

## VR_PIPE_DUPLICATE_PRESET

Template pipe diagnostic for duplicate custom presets in the same formatter namespace.

Docs: /docs/formatters

## VR_PIPE_INVALID_ARGUMENT

Template pipe diagnostic for argument shapes the compiler cannot lower safely.

Docs: /docs/formatters

## VR_PIPE_INVALID_DEFINITION

Template pipe diagnostic for custom pipe exports that do not use the supported formatter helpers.

Docs: /docs/formatters

## VR_PIPE_ASYNC

Template pipe diagnostic for async pipe handlers, which are unsupported because pipes must stay pure and synchronous.

Docs: /docs/formatters

## VRSSR_BROWSER_API

SSR diagnostic for browser-only API access during server rendering.

Docs: /docs/ssr-hydration

## VRSSR_TEXT_MISMATCH

Hydration diagnostic for server/client text divergence.

Docs: /docs/ssr-hydration

## VRSSR_ATTRIBUTE_MISMATCH

Hydration diagnostic for server/client attribute divergence.

Docs: /docs/ssr-hydration

## VRSSR_ROUTE_DIVERGENCE

Hydration diagnostic for server/client route divergence.

Docs: /docs/ssr-hydration

## VRCFG001

Config diagnostic for invalid config shape or loading failure.

Docs: /docs/diagnostics

## VRCFG008

Config diagnostic for the Phase 13 validation catalog.

Docs: /docs/diagnostics

## VRCFG009

Config diagnostic for AI rule section validation.

Docs: /docs/diagnostics

## VRCFG010

Config diagnostic for AI rule ordering validation.

Docs: /docs/diagnostics

## VRCFG011

Config diagnostic for AI rule customization validation.

Docs: /docs/diagnostics

## VRCFG012

Config diagnostic for AI rule source validation.

Docs: /docs/diagnostics

## VRCFG_FORMATTING_LOCALE_EMPTY

Config diagnostic for an empty formatting.locale value in vanrot.config.ts.

Docs: /docs/formatters

## VRCFG_FORMATTING_TIMEZONE_EMPTY

Config diagnostic for an empty formatting.timezone value in vanrot.config.ts.

Docs: /docs/formatters

## VRCFG_FORMATTING_CURRENCY_EMPTY

Config diagnostic for an empty formatting.currency value in vanrot.config.ts.

Docs: /docs/formatters

## VR_CHILD_BEFORE_PARENT

Router diagnostic for child routes declared before a valid parent.

Docs: /docs/diagnostics

## VR_FORM_MISSING_DEFAULT

Form diagnostic for a field definition missing an explicit default value.

Docs: /docs/forms

## VR_FORM_UNSAFE_ASYNC_RESOURCE

Form diagnostic for async form work that cannot be cancelled or safely ignored.

Docs: /docs/forms

## VR_FORM_SENSITIVE_DRAFT_FIELD

Form diagnostic for sensitive fields configured for draft persistence.

Docs: /docs/forms

## VR_FORM_REPEATED_STRING_PATH

Vite terminal warning for repeated string field paths instead of named form refs.

Docs: /docs/forms

## VR_FORM_UNSUPPORTED_TWO_WAY_BINDING

Form diagnostic for unsupported compiler two-way binding syntax before a forms-aware syntax ships.

Docs: /docs/forms

## VR_FORM_INVALID_SERVER_ERROR_PATH

Form diagnostic for server-returned errors targeting an unknown form path.

Docs: /docs/forms

## VR_FORM_INVALID_SCHEMA_ADAPTER

Form diagnostic for invalid schema adapter shape or field metadata.

Docs: /docs/forms
