# @vanrot/ui Package Inventory

`@vanrot/ui` is the first-party Vanrot UI package for the October flavor.

It includes:

- October design tokens in `vanrot-tokens.css`
- first-party utility classes in `vanrotstyles.css`
- compiler-lowered semantic elements such as `<vr-button>`
- generated source templates for developer-owned UI primitives
- component registry metadata for CLI and docs
- package guidelines for theming, accessibility, typography, and style-mode choices

October is dark-first and light-capable. Teams can override semantic tokens to use their own brand colors without rewriting every component.

The package is developer-owned in spirit: generated component source belongs to the app after `vr add ...` writes it.

## Phase 16B Core Primitives

October ships these source-owned core primitives:

- `vr-button`
- `vr-card`
- `vr-badge`
- `vr-avatar`
- `vr-alert`
- `vr-loader`
- `vr-skeleton`
- `vr-separator`

Each primitive includes metadata, variants, compiler lowering, CLI add support, scoped CSS, a usage snippet, and a local test template.

Later Phase 16 slices keep layout, navigation, forms, data display, overlays, and stateful interaction separate from this core primitive set.
