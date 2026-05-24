# Phase 16B UI October Core Primitives

## Purpose

Phase 16B makes the first real October component slice production-ready.

Phase 16A established `@vanrot/ui`, `vanrotstyles.css`, October tokens, UI config, package inventory, and starter integration. Phase 16B now proves the repeatable primitive pattern: semantic custom tags, app-owned source files, variants, accessibility defaults, docs, CLI add flow, and compiler support.

This phase is intentionally narrow. It does not complete the full VR UI ecosystem. It creates the foundation that Phase 16C reuses for the Vanrot site base, then Phase 16D and later reuse for layout, forms, data, overlays, and app shell components.

## Approved Visual Direction

The accepted design reference is:

```text
.superpowers/brainstorm/75913-1779602752/content/phase-16b-core-primitives.html
```

That file is the current visual baseline for Phase 16B. It presents the primitive catalog in a shadcn/ui-style documentation rhythm: left navigation, preview-first component sections, compact variant grids, code-like selector chips, dark-first October styling, and source-owned component language.

shadcn/ui is the non-negotiable quality benchmark for the docs and component presentation. Vanrot should follow the same level of clarity, preview-first documentation, component index structure, install/usage/example rhythm, accessibility notes, and developer-owned philosophy. Vanrot must still keep its own identity: October tokens, Vanrot naming, `vr-*` semantic tags, `vanrotstyles`, and original documentation copy.

## Scope

Phase 16B includes these core primitives:

| Primitive        | Purpose                                   | Variants                                                        |
| ---------------- | ----------------------------------------- | --------------------------------------------------------------- |
| `<vr-button>`    | Actions and command triggers              | `default`, `secondary`, `outline`, `ghost`, `danger`, `link`    |
| `<vr-card>`      | Grouped content surfaces                  | `default`, `muted`, `interactive`                               |
| `<vr-badge>`     | Small status and category labels          | `default`, `secondary`, `success`, `warning`, `danger`, `outline` |
| `<vr-avatar>`    | Person, team, tenant, or entity identity  | `default`, `soft`, `outline`                                    |
| `<vr-alert>`     | Persistent inline feedback                | `info`, `success`, `warning`, `danger`                          |
| `<vr-loader>`    | Loading indicators                        | `spinner`, `dots`, `bar`                                        |
| `<vr-skeleton>`  | Layout-preserving loading placeholders    | `text`, `avatar`, `card`, `block`                               |
| `<vr-separator>` | Structural separation                     | `horizontal`, `vertical`                                        |

`<vr-loader>` is the public Vanrot name. A spinner is one loader variant, not the primitive name.

## Out Of Scope

These components stay in later Phase 16 slices:

| Slice | Components |
| ----- | ---------- |
| Phase 16C | `apps/vanrot-site`, shadcn-style docs shell, component page template, Phase 16B primitive docs, and docs drift guard |
| Phase 16D | `<vr-layout>`, `<vr-header>`, `<vr-footer>`, `<vr-sidebar>`, `<vr-nav>`, `<vr-grid>`, `<vr-breadcrumb>`, `<vr-tab>`, `<vr-img>`, `<vr-src>` |
| Phase 16E | `<vr-form>`, `<vr-input>`, `<vr-select>`, `<vr-table>`, `<vr-pagination>` |
| Phase 16F | `<vr-modal>`, `<vr-dialog>`, `<vr-dropdown>`, `<vr-toast>`, `<vr-tooltip>` |

Phase 16B should not introduce a heavy runtime component framework. The output remains compiler-lowered, source-owned, readable, and light.

## Component Anatomy

Every Phase 16B primitive follows the same anatomy:

- A semantic custom tag such as `<vr-card>`.
- An owning metadata entry in `@vanrot/ui`.
- App-owned source files using the local prefix convention: `<local-prefix>.<primitive>.ts`, `<local-prefix>.<primitive>.html`, and `<local-prefix>.<primitive>.css`.
- Variant names owned by a shared source of truth, not repeated string literals across compiler, CLI, docs, and tests.
- October styles built from `vanrotstyles.css` and `vanrot-tokens.css`.
- Native semantics first. ARIA is added only when native HTML does not provide the needed behavior.
- Class passthrough so project-owned styling remains possible.
- Documentation that shows preview, install command, usage, examples, variants, accessibility notes, and source ownership.

The implementation should keep the existing Vanrot rule: no UI markup in TypeScript, no application logic in HTML, scoped CSS for component styling, and readable English-like APIs.

## Compiler Behavior

The compiler lowers supported `vr-*` primitives to accessible native HTML or simple structural markup.

Expected lowering direction:

| Primitive | Native direction |
| --------- | ---------------- |
| `<vr-button>` | Native `<button>` unless a later route/link mode explicitly owns anchor behavior |
| `<vr-card>` | Section-like surface with preserved children and classes |
| `<vr-badge>` | Inline status/category element |
| `<vr-avatar>` | Image or fallback identity element, depending on supplied content |
| `<vr-alert>` | Message container with role only when severity needs it |
| `<vr-loader>` | Decorative or labelled loading indicator depending on accessibility attributes |
| `<vr-skeleton>` | Decorative placeholder hidden from assistive tech by default |
| `<vr-separator>` | Native or ARIA separator behavior based on orientation |

Unsupported `vr-*` primitives should continue producing clear diagnostics.

## CLI And Registry Behavior

`vr add <primitive>` should add the selected primitive as app-owned source, not as a black-box dependency.

The expected commands for this phase are:

```text
vr add button
vr add card
vr add badge
vr add avatar
vr add alert
vr add loader
vr add skeleton
vr add separator
```

The add flow should:

- Use the existing local prefix convention.
- Avoid overwriting user files without an explicit policy.
- Ensure October token and `vanrotstyles` assets exist when the project uses `ui.styles: 'vanrotstyles'`.
- Respect `ui.styles: 'tailwind'` and `ui.styles: 'none'`.
- Keep generated files readable enough for the developer and AI tools to edit directly.

## Documentation Template

`vanrot.vankode.com` should follow a shadcn-style component page template for each primitive:

1. Title and one-line purpose.
2. Preview panel first.
3. Install command tab.
4. Manual usage tab when useful.
5. Usage snippet.
6. Examples by variant.
7. Accessibility notes.
8. Source ownership notes.
9. Previous and next component links.

The docs must not use copied shadcn text or branding. The structure and quality bar are the reference, not the content.

## Accessibility Standards

Phase 16B primitives should be accessible by default:

- `<vr-button>` preserves disabled behavior, focus visibility, keyboard activation, and button type rules.
- `<vr-badge>` remains readable and does not rely on color alone for meaning in examples.
- `<vr-avatar>` supports accessible image naming and fallback initials.
- `<vr-alert>` uses severity-appropriate semantics without turning every visual note into an interruptive alert.
- `<vr-loader>` supports labelled loading states when it communicates progress.
- `<vr-skeleton>` is hidden from assistive technology unless explicitly labelled.
- `<vr-separator>` exposes orientation when semantics are needed.

Focus styles should align with October tokens and `vanrotstyles` utilities.

## Testing Expectations

Phase 16B should add focused tests for:

- UI metadata exports for all included primitives and variants.
- Compiler lowering for each primitive.
- Unsupported primitive diagnostics remain clear.
- CLI add commands generate the correct app-owned files.
- Generated files use the local prefix convention.
- `vanrotstyles` and token assets are copied or skipped according to `ui.styles`.
- Docs/package inventory lists the included primitives and the future slices.
- Accessibility-sensitive output for button, alert, loader, skeleton, and separator.

The phase is not complete until `pnpm verify` passes.

## Production Readiness Outcome

After Phase 16B, Vanrot should have a small but serious October primitive catalog that feels production-quality:

- visually consistent with the accepted preview;
- documented with a shadcn-level docs rhythm;
- installed as project-owned source;
- backed by typed metadata and source-of-truth constants;
- compiler-lowered without adding heavy runtime behavior;
- accessible by default;
- ready for Phase 16C to document the current primitives in the public site, and for Phase 16D layout and navigation primitives to reuse the same pattern.
