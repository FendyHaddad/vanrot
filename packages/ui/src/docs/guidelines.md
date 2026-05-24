# @vanrot/ui Guidelines

Vanrot UI is developer-owned. Generated component files are readable app source, not a closed runtime dependency.

Use `vanrotstyles.css` when you want Vanrot's first-party utility layer. Use `vanrot.config.ts` with `ui.styles: 'tailwind'` when your project owns a Tailwind path. Use `ui.styles: 'none'` when your app owns all utilities.

October uses Geist for UI text and JetBrains Mono for numeric surfaces. Data tables, counters, financial values, and statistics should use tabular lining numbers.

Semantic colors, surfaces, radius, shadow, motion, and typography should be customized through tokens.

Interactive components must preserve native behavior where possible and provide keyboard, focus, contrast, and reduced-motion support.

## Component Documentation Standard

Vanrot component documentation follows the shadcn/ui rhythm: title, preview first, install command, usage, examples, variants, accessibility notes, source ownership, and previous-next links.

The structure is the benchmark, not the branding or text. Vanrot examples use October tokens, `vr-*` semantic tags, `vanrotstyles`, and source-owned component files.

Primitive names, selectors, variants, docs paths, and generated file names should come from `@vanrot/ui` metadata so CLI, compiler, and docs do not drift.
