# Vanrot IntelliJ Plugin — Design

**Date:** 2026-05-29
**Status:** Approved (brainstorm), pending implementation plan
**Topic:** A full template-language plugin for JetBrains IDEs, backed by a reusable TypeScript language server.

## Summary

Vanrot templates (`.component.html`, `.page.html`, `.layout.html`, and the role/UI-suffixed
variants) are authored as plain HTML today. IntelliJ treats them as HTML, which produces false
warnings (e.g. `CheckEmptyScriptTag` on self-closing `<vr route.docs />`) and offers no vanrot-aware
completion, navigation, or diagnostics.

This design introduces a **full template language** for vanrot in JetBrains IDEs. The language
intelligence lives in a reusable TypeScript **language server** that wraps `@vanrot/compiler` as the
single source of truth. The IntelliJ plugin is a thin LSP client plus minimal native polish. The same
server can power VSCode / Antigravity / Neovim later at low cost — but those editors are explicitly
out of scope for this effort.

## Goals

- Self-closing custom tags (`<vr route.docs />`, `<vr-*/>`, components, slots) are valid with no
  warning — natively, retiring the `.idea` scope workaround for plugin users.
- Vanrot-aware completion: route names, `vr` / `vr-*` elements, slots, component tags, attributes.
- Go-to-definition and find-references: route name → `routes.ts`, component tag → `.component.ts`,
  slot → its definition.
- Diagnostic parity: surface `@vanrot/compiler` VR#### diagnostics inline, matching build errors.
- Expression binding smarts: resolve template expressions against the component class (completion,
  hover types, type errors, rename).

## Non-goals

- VSCode, Antigravity, Neovim, or any non-JetBrains editor (deferred; the LSP architecture keeps this
  cheap later, but no client is built now).
- IntelliJ IDEA Community Edition (lacks HTML/JS/CSS language APIs).
- Reimplementing any template logic in Kotlin.

## Target IDEs

WebStorm and IntelliJ IDEA Ultimate only. Both provide the HTML/JS/TS/CSS PSI and the LSP client API
(`LspServerSupportProvider`, available since 2023.2) the plugin depends on. `sinceBuild` = 2023.2+.

## Architecture (Approach A: standalone LSP + thin client)

```
              ┌──────────────────────────────┐
 WebStorm /   │ editors/intellij (Kotlin)     │
 IDEA         │  LspServerSupportProvider      │── spawns ──┐
 Ultimate ───▶│  + file type (self-close legal)│            │
              │  + bundles web-types.json      │            ▼
              └──────────────────────────────┘   ┌────────────────────────────┐
                                                  │ @vanrot/language-server (TS)│
 (VSCode / Antigravity / nvim — later) ─ ─ ─ ─ ▶ │  LSP over stdio             │
                                                  │  ├─ reuses @vanrot/compiler  │  ← single source of truth
                                                  │  │   (parse, VR diagnostics) │
                                                  │  └─ TS bridge (tsserver/ts)  │  ← expression smarts
                                                  │  reads routes.ts + metadata  │
                                                  │  via @vanrot/config          │
                                                  └────────────────────────────┘
```

### Components and boundaries

**`packages/language-server` (`@vanrot/language-server`, TypeScript, in the pnpm workspace)**
- The only place vanrot template intelligence lives.
- Depends on `@vanrot/compiler` (parse + diagnostics) and `@vanrot/config` (project + route
  resolution). Adds an internal TS bridge module for expression type-checking.
- Implements LSP over stdio: `initialize`, document sync, `completion`, `hover`, `definition`,
  `references`, `publishDiagnostics`, `rename`.
- Published to npm so future editor clients (and CI) reuse it.

**`editors/intellij` (Kotlin / Gradle, outside the pnpm workspace)**
- Holds zero vanrot semantics. Responsibilities:
  1. Register the language server for vanrot template file globs via `LspServerSupportProvider`.
  2. Declare a lightweight file type so self-closing custom tags are legal (kills
     `CheckEmptyScriptTag` natively for plugin users).
  3. Ship the existing `web-types.json` as a static fallback for completion when the server is down.
- Built independently by Gradle.

**`editors/vscode` (later, not built now)** — a thin client on the same server.

### Source-of-truth map

| Concern | Owner |
|---|---|
| Template parse + VR#### diagnostics | `@vanrot/compiler` |
| Routes + project/config resolution | `@vanrot/config` |
| Expression types | TS bridge (tsserver / TS API) over the component class |
| IDE wiring only | IntelliJ plugin (Kotlin) |

### Template file set

The set of files treated as vanrot templates is the same glob set used by the committed `.idea`
inspection scope (`Vanrot Templates`): all `*.html` except real entry/doc HTML (`index.html`,
`panel.html`, `devtools.html`, `*-presentation.html`, `landing-page-design.html`). This list is the
single owned source of truth, shared by the plugin registration and the `.idea` scope.

### Build isolation

`editors/` is excluded from the pnpm workspace globs and the root `tsconfig`. The Gradle build pulls
the prebuilt `@vanrot/language-server` output and bundles it into the plugin distribution. CI gains a
separate JVM job alongside the existing `pnpm` pipeline.

## Milestones

Each milestone is an independently shippable increment.

- **M0 — Foundation.** Scaffold `packages/language-server` and `editors/intellij`. LSP handshake
  (`initialize` + document sync). Plugin registers the server for vanrot template globs and declares
  the file type that makes self-close legal. Separate JVM CI job. Hello-world: server connects, no
  features yet.
- **M1 — Tag/attribute completion + self-close.** Completion for `vr` / `vr-*` elements, `route.*`
  attributes, slots, and component tags, sourced from routes + component metadata. Self-close is
  already legal from M0; this retires the `.idea` workaround for plugin users.
- **M2 — Go-to-definition / references.** Resolve route name → `routes.ts`, component tag →
  `.component.ts`, slot → its definition. Find-usages across template + TS.
- **M3 — Diagnostic parity.** Pipe `@vanrot/compiler` VR#### diagnostics straight to LSP diagnostics
  with source ranges. Sequenced before M4 because it is direct compiler reuse and lower risk.
- **M4 — Expression binding smarts.** The compiler emits a virtual TS document per template (each
  expression rewritten into the component-class scope); the TS bridge type-checks it (the technique
  Angular Language Service and Volar use). Yields member completion, hover types, type errors, and
  safe rename. Isolated last to contain risk.

## Data flow per feature

- **Completion (M1):** editor trigger (`<`, `route.`, attribute) → `textDocument/completion` →
  compiler parses fragment and classifies cursor context → routes (`@vanrot/config`) + component
  metadata + web-types → `CompletionItem[]`.
- **Definition/refs (M2):** Ctrl-click → `definition` / `references` → resolve symbol kind from the
  parsed node at offset → route/tag/slot target locations.
- **Diagnostics (M3):** file open/edit (debounced) → run compiler on the 3-file component →
  `publishDiagnostics` with VR#### codes + exact spans.
- **Expressions (M4):** cursor in `{{ expr }}` / binding / control-flow → compiler maps the
  expression span into a virtual TS document in the component-class scope → TS bridge types it →
  completion / hover / type errors / rename.

## Testing strategy

- **Server unit tests (TS, vitest, TDD) — the bulk.** `handler(template + cursor)` → assert
  completions / definitions / diagnostics / hover. Pure, fast, no editor.
- **Server LSP integration (TS, vitest).** Real LSP over stdio with a mock client, a fixture project,
  and the real compiler. Verifies wire protocol and lifecycle.
- **Plugin tests (Kotlin, IntelliJ Platform Test Framework) — thin.** File type registered, server
  registered for vanrot globs, self-close legal. No vanrot logic tested here.
- **E2E smoke (`gradle runIde`).** Sandbox IDE on a fixture app; eyeball each milestone.

No duplication: parsing and VR#### diagnostics are already covered by `@vanrot/compiler` tests; server
tests assert the mapping from compiler output to LSP shapes, not the compiler itself. CI runs a pnpm
job (server unit + integration, joined to existing `pnpm test`) and a JVM job (Gradle plugin tests +
JetBrains `plugin-verifier` against target WebStorm/Ultimate builds). A single tiny fixture app under
`examples/` (routes + components with slots + expressions) serves as the corpus for server
integration, plugin E2E, and manual smoke.

## Distribution

- **Packaging:** the plugin `.zip` bundles a prebuilt server JS for zero npm setup. The server is also
  published as `@vanrot/language-server` for later editor/CI reuse. A Gradle task pulls the pnpm build
  output into the plugin distribution.
- **Node runtime:** resolved in order — project Node → IDE-bundled Node → Node on PATH — with a
  graceful error if none is found.
- **Compatibility:** `sinceBuild` = 2023.2+; JetBrains `plugin-verifier` gates each release.
- **Release channel & timing:** internal dev builds (`runIde` + manual `.zip`) through M0–M2; publish
  to the public JetBrains Marketplace at the first feature-complete release.
- **Versioning:** plugin and server are released in lockstep with the `@vanrot` monorepo version,
  because the server reuses compiler internals and drift risk is real. The plugin also checks the
  project's `@vanrot` version and warns on mismatch.

## Risks

- **Expression bridge (M4)** is the hard part — virtual-TS mapping against the component class. Risk
  contained by sequencing it last and behind M0–M3 value.
- **Node runtime discovery** can fail on unusual setups; mitigated by the ordered fallback and a clear
  error.
- **Compiler internals coupling** — the server reuses compiler internals; mitigated by lockstep
  versioning and the existing compiler test suite.
- **LSP API churn** across IDE versions; mitigated by `plugin-verifier` in CI.

## Open questions

None outstanding. Architecture (Approach A), JetBrains-only target, milestone order, testing strategy,
and all three distribution decisions (release timing, lockstep versioning, single M0–M4 spec) are
resolved.

## Decisions log

- Approach **A** (standalone LSP + thin client) over pure-Kotlin native (B) or tsserver-plugin (C).
- Target **WebStorm + IDEA Ultimate** only; CE and other editors deferred.
- All four feature areas are in v1, sequenced M0→M4 with diagnostics before expressions.
- Release: dev builds first, Marketplace at feature-complete.
- Versioning: lockstep with `@vanrot`.
- This spec covers all of v1 (M0–M4); each milestone gets its own implementation plan.
