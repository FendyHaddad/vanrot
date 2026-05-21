# Vanrot UI And Tokens MVP Design

**Date:** 2026-05-22
**Phase:** Phase 9 - UI and Tokens MVP
**Packages:** `@vanrot/ui`, `@vanrot/compiler`, `@vanrot/cli`, `@vanrot/vite-plugin`
**Status:** Draft for review
**Related:**
- `docs/brainstorm.md`
- `docs/superpowers/feature-maturity.md`
- `docs/superpowers/specs/Phase-03.md`
- `docs/superpowers/specs/Phase-05.md`
- `docs/superpowers/specs/Phase-08.md`

---

## 1. Goal

Phase 9 adds the first official Vanrot UI surface without turning the demo into the full production design system.

The milestone is successful when a generated app has Vanrot token CSS, the CLI can add the first official button primitive, and a Vanrot template can use clean first-party UI syntax:

```html
<vr-button class="vr-button-primary" type="button">
  {{ t('home.cta') }}
</vr-button>
```

The compiler lowers that syntax to a native browser button. Phase 9 must keep real button semantics, keep the runtime small, and avoid pretending Vanrot already supports child components, props, slots, or a full UI catalog.

---

## 2. Core Decision

Phase 9 uses a compiler-lowered UI primitive.

`<vr-button>` is not a custom element and not a Vanrot child component. It is a compiler-known primitive that produces native DOM:

```html
<button class="vr-button vr-button-primary" type="button">
  ...
</button>
```

This gives Vanrot the template style the framework wants while preserving native button behavior for accessibility, keyboard interaction, forms, and browser semantics.

The first UI package is real, but demo-small:

```txt
@vanrot/ui
+
compiler-lowered <vr-button>
+
vr add button
+
starter tokens
```

The production UI system, UI flavors, utility classes, and component parameter model stay tracked in `docs/superpowers/feature-maturity.md`.

---

## 3. Explicit Non-Goals

Phase 9 must not implement:

```txt
V01 or V02 UI flavor selection
full shadcn-style component catalog
PrimeFlex-inspired utility class layer
Tailwind setup automation
UI parameters and variants
component props
slots or content projection
true child components
UI registry upgrades
theme generator
component documentation site
```

Those are important production tracks, but each needs its own brainstorming and design cycle.

---

## 4. Public Template API

Phase 9 introduces one compiler-known UI primitive:

```html
<vr-button class="flex w-full" type="button">
  {{ t('home.cta') }}
</vr-button>
```

The lowering rules are:

```txt
vr-button creates a native button element
vr-button always adds the base vr-button class
user class values are appended after the base class
type, id, aria-*, data-*, and safe standard attributes pass through
(click) and existing event binding behavior continue to work
[disabled] and existing property binding behavior continue to work
child text and interpolation are preserved
```

The compiler output should not leave `<vr-button>` in the DOM. It should emit a native `button` node so the demo has honest browser semantics.

Tailwind classes may be passed through with `class`. Phase 9 does not install or configure Tailwind. Future Tailwind guidance and Vanrot utility classes are tracked in the maturity ledger.

---

## 5. UI Primitive File Naming

Vanrot UI primitive files use typed role segments:

```txt
<local-prefix>.<component-type>.<file-kind>
```

The local prefix is user-owned and flexible:

```txt
ui.button.ts
primary.button.ts
danger.button.ts
marketing.card.ts
profile.avatar.ts
```

The middle segment is the durable role/type:

```txt
.button
.card
.avatar
.tabs
.tooltip
.dropdown
.popover
.toast
.skeleton
.progress
```

Phase 9 only supports `.button.ts`, `.button.html`, and `.button.css` as demo-capable output.

The default added button is:

```txt
src/ui/button/
  ui.button.ts
  ui.button.html
  ui.button.css
```

A custom local prefix changes only the file prefix:

```txt
src/ui/button/
  primary.button.ts
  primary.button.html
  primary.button.css
```

This keeps `.component` for custom app/domain components while allowing first-party and shared UI primitives to state their specific type.

---

## 6. Package Shape

Phase 9 creates `@vanrot/ui` as the owner of UI assets and metadata.

Target package shape:

```txt
packages/ui/
  package.json
  tsconfig.json
  src/
    index.ts
    tokens/
      vanrot-tokens.css
    primitives/
      button/
        button.css
        button.html
        button.ts
        metadata.ts
```

`@vanrot/ui` should not add behavior to `@vanrot/runtime`.

The package should own:

```txt
Vanrot token CSS
the first button blueprint
metadata that lets the CLI copy the correct files
```

The compiler owns `<vr-button>` lowering. The CLI owns copying files into apps. App code owns imported token CSS and imported primitive CSS.

The copied `ui.button.ts` and `ui.button.html` files are the app-owned source blueprint for the button primitive. Phase 9 does not consume them as a child component. The copied `ui.button.css` file provides the actual `.vr-button` styles that the compiler-lowered primitive uses.

---

## 7. CLI Contract

Phase 9 adds a new CLI command family:

```bash
vr add button
vr add <local-prefix> button
```

The default form:

```bash
vr add button
```

writes:

```txt
src/ui/button/
  ui.button.ts
  ui.button.html
  ui.button.css
```

The custom-prefix form:

```bash
vr add primary button
```

writes:

```txt
src/ui/button/
  primary.button.ts
  primary.button.html
  primary.button.css
```

Validation rules:

```txt
button is the only supported component type in Phase 9
local prefix defaults to ui
local prefix must be lowercase kebab-case
output folder is src/ui/button/
existing files are not overwritten unless a future overwrite flag is designed
unsupported component types fail with a clear message
```

Examples:

```txt
vr add button            ok
vr add primary button    ok
vr add danger button     ok
vr add primary card      error in Phase 9
vr add Primary button    error because prefix is not lowercase kebab-case
```

The command should use the existing Quiet Premium reporter.

`vr add button` should copy the typed button files, ensure token CSS exists, and ensure the button CSS is imported through an app-owned style entrypoint.

Phase 9 should use this style entrypoint:

```txt
src/styles/vanrot-ui.css
```

with an import of the copied button CSS. `src/main.ts` should import the style entrypoint once. This avoids repeatedly editing `main.ts` as more UI primitives are added later.

If `vr add button` runs inside a freshly generated starter app, it should patch the generated home page to include a visible `<vr-button>` demo. If the app does not match the generated starter shape, the command should not guess where to mutate user UI. It should copy the files and print the snippet to add manually.

---

## 8. Generated App Shape

After Phase 9, `vr create` should include Vanrot tokens by default:

```txt
src/
  styles/
    vanrot-tokens.css
```

`src/main.ts` imports the token stylesheet once:

```ts
import './styles/vanrot-tokens.css';
```

`vr create` does not install the button primitive files by default. `vr add button` owns that step.

After `vr add button` runs in a generated starter app, the home page should visibly use the first UI primitive:

```html
<vr-button class="vr-button-primary" type="button">
  {{ t('home.cta') }}
</vr-button>
```

The CTA copy should remain owned by the page or route copy source, not repeated across files. Phase 9 must preserve Vanrot's string ownership rule.

---

## 9. Compiler Behavior

The compiler should treat `vr-button` similarly to router primitives: a known Vanrot tag with special lowering.

Required behavior:

```txt
parse <vr-button> as a normal element
lower it to document.createElement('button')
apply the component scope attribute
merge the base vr-button class with user classes
preserve child text and interpolation
preserve existing event binding behavior
preserve existing property binding behavior
include a compile feature marker for ui-button
```

No new runtime helper is required for Phase 9.

Diagnostics should prefer clear fatal errors over silent weirdness. Unsupported Vanrot UI tags such as `<vr-card>` or `<vr-tabs>` should report a narrow compile diagnostic in Phase 9. They should not silently compile as browser custom elements, because a typo in a Vanrot-owned tag should be obvious.

---

## 10. Testing

Phase 9 implementation should follow TDD.

Required tests:

```txt
@vanrot/ui builds and exports its metadata
compiler lowers <vr-button> to native button output
compiler adds vr-button class and preserves user classes
compiler preserves child interpolation inside <vr-button>
compiler preserves (click) event binding on <vr-button>
compiler preserves [disabled] property binding on <vr-button>
vr create writes src/styles/vanrot-tokens.css and imports it
vr add button writes ui.button.ts/html/css
vr add primary button writes primary.button.ts/html/css
vr add button writes or updates src/styles/vanrot-ui.css
vr add button imports src/styles/vanrot-ui.css from src/main.ts once
vr add button patches the generated starter home page when the starter shape is recognized
vr add rejects unsupported component types
vr add rejects invalid prefixes
Vite fixture or generated app build passes with <vr-button>
```

The full phase is accepted only after `pnpm verify` passes.

---

## 11. Documentation And Maturity Updates

When Phase 9 implementation is completed and verified, update:

```txt
docs/brainstorm.md
docs/superpowers/plans/Phase-09.md
docs/vanrot-presentation.html
docs/superpowers/feature-maturity.md
```

The maturity ledger should move only verified Phase 9 capabilities to `Demo-Capable`:

```txt
@vanrot/ui package foundation
Vanrot token CSS
compiler-lowered <vr-button>
vr add button
typed button primitive files
```

Deferred maturity rows must keep tracking:

```txt
V01 and V02 UI flavors
additional UI primitives
component parameters and variants
Tailwind setup and guidance
PrimeFlex-inspired utility class layer
custom add destinations
UI registry and upgrades
true child components and slots
UI documentation site
```

---

## 12. Completion Criteria

Phase 9 is complete when:

```txt
@vanrot/ui exists and builds
compiler-lowered <vr-button> is tested
vr create includes token CSS
vr add button works
vr add <local-prefix> button works
vr add imports copied button CSS through src/styles/vanrot-ui.css
generated starter or fixture uses <vr-button>
Vite build verification passes
pnpm verify passes
phase docs and maturity ledger are updated
no Phase 9 feature is marked Production-Ready
deferred UI work remains explicit in feature-maturity.md
```
