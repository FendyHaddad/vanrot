# Vanrot Vite Integration Design

**Date:** 2026-05-21
**Phase:** Phase 4 - Vite integration
**Package:** `@vanrot/vite-plugin`
**Status:** Draft for review
**Related:**
- `docs/brainstorm.md`
- `docs/superpowers/specs/Phase-01.md`
- `docs/superpowers/specs/Phase-02.md`
- `docs/superpowers/specs/Phase-03.md`
- `docs/superpowers/feature-maturity.md`

---

## 1. Goal

Phase 4 wires the Vanrot compiler into Vite dev and build flows.

The output is a demo-capable `@vanrot/vite-plugin` package that lets a Vite app import a Vanrot component entry file:

```ts
import { mount } from '@vanrot/runtime';
import App from './app.component.ts';

mount(App, document.getElementById('app')!);
```

The plugin compiles:

```txt
app.component.ts
app.component.html
app.component.css
```

into a browser-ready component module and CSS delivered through Vite.

Phase 4 is successful when a fixture app can run through Vite dev/build and changes to the component TypeScript, HTML, or CSS files cause the app to rebuild.

---

## 2. Maturity Level

Phase 4 creates demo-capable build integration, not production-ready build tooling.

Every Phase 4 capability must be tracked in:

```txt
docs/superpowers/feature-maturity.md
```

Rows added or moved for Phase 4 must distinguish:

```txt
Planned
Demo-Capable
Production-Ready
Deferred
```

No Phase 4 feature may be marked `Production-Ready` until it has documented behavior, focused tests, Vite dev and build integration tests, diagnostics for common misuse, and no hidden deferred behavior under the same row.

---

## 3. Prerequisites

Phase 4 assumes Phase 1 created the package shell:

```txt
packages/vite-plugin
```

Phase 4 depends on the Phase 2 runtime API:

```ts
import { mount } from '@vanrot/runtime';
```

Phase 4 depends on the Phase 3 compiler API:

```ts
import { compileComponentFromFiles } from '@vanrot/compiler';
```

Phase 3 is currently being implemented in another workspace. Phase 4 implementation must not begin against a half-merged compiler. If Phase 4 work starts before Phase 3 lands, tests may use a local compiler stub, but final integration tests must run against the real `@vanrot/compiler` package before the Phase 4 tracker is checked off.

---

## 4. Non-Goals

Phase 4 must not implement:

```txt
vr CLI commands
project creation templates
counter demo app milestone
router integration
child components
@if conditionals
@for loops
forms
i18n extraction
source maps
true state-preserving HMR
production diagnostics
vanrot.config.ts loading
SSR
hydration
```

These remain tracked in the feature maturity ledger with future phase ownership or deferred status.

---

## 5. Approach Decision

Three approaches were considered.

### Approach A - Transform `.component.ts` directly with no virtual source module

The plugin transforms `app.component.ts` into generated component code.

Problem: Phase 3 generated code imports the component class from the source `.component.ts` file. If the transformed module imports itself, Vite can recurse or load the generated module where the original class is expected.

This approach is rejected.

### Approach B - Transform component entries and use virtual source and CSS modules

The plugin transforms `.component.ts` into the generated component module that app code imports.

The original component class is served through an internal virtual source module:

```txt
\0vanrot:source:<encoded absolute path>
```

Component CSS is served through an internal virtual CSS module:

```txt
\0vanrot:css:<encoded absolute path>
```

This keeps app imports clean while avoiding recursive imports.

This is the chosen approach.

### Approach C - Require app authors to import explicit virtual modules

App code would import a generated virtual module directly:

```ts
import App from 'virtual:vanrot-component:/src/app.component.ts';
```

This avoids transform complexity but exposes build-tool internals to app authors. It does not match Vanrot conventions.

This approach is rejected.

---

## 6. Public Plugin API

The package exports a default plugin factory and a named alias:

```ts
import vanrot from '@vanrot/vite-plugin';

export default {
  plugins: [vanrot()],
};
```

Required exports:

```ts
import type { Plugin } from 'vite';

export interface VanrotPluginOptions {
  include?: RegExp | RegExp[];
  exclude?: RegExp | RegExp[];
  root?: string;
}

export function vanrot(options?: VanrotPluginOptions): Plugin;
export { vanrot as vanrotPlugin };
export default vanrot;
```

The plugin name is:

```txt
vanrot
```

The plugin runs with:

```ts
enforce: 'pre'
```

This lets Vanrot compile component entries before Vite's normal TypeScript handling turns the source component into plain JavaScript.

---

## 7. Component Module Contract

A Vanrot component entry is a file ending in:

```txt
.component.ts
```

When app code imports a component entry, Vite receives a generated component module instead of the raw class source.

Input:

```ts
import App from './app.component.ts';
```

Output module shape:

```ts
import 'virtual:vanrot-css:<id>';

export function createComponent() {
  // generated by @vanrot/compiler
}

const component = { createComponent };
export default component;
```

The default export is the public app-facing value passed to `mount()`.

The original component class remains available only to generated code through the internal virtual source module.

---

## 8. Compiler Integration Contract

The Vite plugin calls:

```ts
compileComponentFromFiles(componentPath, {
  componentImportSpecifier: virtualSourceSpecifier,
});
```

The `componentImportSpecifier` option is a narrow integration extension to the Phase 3 compiler API. It allows generated code to import the component class from the Vite plugin's public virtual source module instead of importing the transformed `.component.ts` module recursively.

Generated code imports the public virtual ID:

```txt
virtual:vanrot-source:<encoded absolute path>
```

Vite `resolveId()` maps that public ID to the internal resolved ID:

```txt
\0vanrot:source:<encoded absolute path>
```

If Phase 3 lands without this option, Phase 4 implementation owns adding only this option to the compiler API. The option must not change normal compiler behavior when omitted.

The compiler still owns:

- sibling file resolution diagnostics
- template parsing
- expression rewriting
- CSS scoping
- generated JavaScript
- generated CSS

The Vite plugin owns:

- Vite plugin hooks
- virtual module IDs
- Vite file watching
- Vite diagnostics bridge
- CSS delivery through Vite
- generated module wrapping for default export

---

## 9. CSS Delivery

The compiler returns CSS as a string.

The Vite plugin exposes that CSS through a virtual CSS module and injects an import into the generated component module:

```ts
import 'virtual:vanrot-css:<id>';
```

Vite then handles CSS behavior:

- dev style injection
- production CSS extraction
- CSS transforms configured by the app

The plugin must not manually inject `<style>` tags. CSS belongs in Vite's CSS pipeline.

---

## 10. File Watching and Rebuilds

For every transformed component entry, the plugin watches:

```txt
name.component.ts
name.component.html
name.component.css
```

The `.component.ts` file is already part of Vite's module graph.

The plugin must explicitly register sibling files with:

```ts
this.addWatchFile(templatePath);
this.addWatchFile(stylePath);
```

During dev, when a template or style file changes, the plugin invalidates the owning component module and triggers a full reload.

True state-preserving HMR is deferred. Phase 4 only needs reliable rebuild behavior.

---

## 11. Diagnostics Bridge

Compiler diagnostics are translated into Vite diagnostics.

Rules:

- compiler errors become Vite errors through `this.error(...)`
- compiler warnings become Vite warnings through `this.warn(...)`
- messages include diagnostic code, file path, line, and column when present
- source maps and code frames remain deferred

Vite's dev overlay is allowed to display these errors. Vanrot does not build a custom overlay in Phase 4.

---

## 12. Runtime Mount Bridge

Phase 2 `mount()` intentionally used a placeholder component type until the compiler contract existed.

Phase 4 defines the compiled component mount shape:

```ts
export interface CompiledComponentInstance {
  node: Node;
  ctx: unknown;
}

export interface CompiledComponentModule {
  createComponent(): CompiledComponentInstance;
}
```

`mount(Component, target)` must accept a compiled component module:

```ts
import App from './app.component.ts';
mount(App, target);
```

Required runtime behavior:

1. create a root cleanup scope
2. run `Component.createComponent()` inside that scope
3. append the returned `node` to `target`
4. flush mount callbacks
5. return an app handle that removes the node and disposes the root cleanup scope

This is a narrow integration bridge. It must not add routing, providers, dependency injection, or a full component lifecycle system.

---

## 13. Vite Hook Use

Phase 4 uses standard Vite plugin hooks:

```txt
configResolved
resolveId
load
transform
configureServer
handleHotUpdate
```

Hook responsibilities:

| Hook | Responsibility |
|---|---|
| `configResolved` | store resolved root and normalize plugin options |
| `resolveId` | resolve Vanrot virtual source and CSS module IDs |
| `load` | load virtual source modules and virtual CSS modules |
| `transform` | compile `.component.ts` entries into generated component modules |
| `configureServer` | store dev server reference for invalidation and reload |
| `handleHotUpdate` | react to sibling template and CSS changes |

Vite's newer `hotUpdate` hook can be added in a future compatibility phase. Phase 4 uses `handleHotUpdate` because it remains sufficient for the MVP rebuild behavior.

Virtual module IDs must be excluded from `.component.ts` transform detection. The internal source ID contains the original file path and can end in `.component.ts`, but it represents raw component class source, not a Vanrot component entry.

---

## 14. Testing Requirements

Phase 4 implementation must include tests for:

- public plugin exports
- plugin option normalization
- component file detection
- virtual source module ID creation and decoding
- virtual CSS module ID creation and decoding
- transform ignores non-component TypeScript files
- transform compiles `.component.ts` files
- transform registers sibling HTML and CSS files for watching
- generated component modules include the virtual CSS import
- generated component modules default-export `{ createComponent }`
- compiler diagnostics become Vite errors and warnings
- Vite build works for a fixture app
- Vite dev server rebuilds after `.component.html` and `.component.css` changes
- runtime `mount()` can mount and destroy a compiled component module

The fixture app must use Vanrot conventions:

```txt
app.component.ts
app.component.html
app.component.css
main.ts
index.html
vite.config.ts
```

---

## 15. Phase Completion Rule

Phase 4 is complete only when:

- `pnpm --filter @vanrot/vite-plugin test` passes.
- `pnpm --filter @vanrot/vite-plugin build` passes.
- `pnpm --filter @vanrot/runtime test` passes if `mount()` is changed.
- `pnpm test` passes.
- `pnpm build` passes.
- a Vite fixture app builds with the Vanrot plugin.
- a Vite dev fixture reloads after component HTML and CSS changes.
- `docs/superpowers/feature-maturity.md` marks Phase 4 features as demo-capable only after implementation verification.
- deferred features remain deferred.
- `docs/brainstorm.md` Phase 4 checkbox is updated only after verification.
