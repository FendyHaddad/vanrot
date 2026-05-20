# Vanrot Feature Maturity Ledger

**Date:** 2026-05-21
**Purpose:** Track whether each Vanrot capability is only planned, demo-capable, production-ready, complete, or deferred.

This ledger is the source of truth for feature maturity across phases. Phase checkboxes show delivery milestones. This file shows capability maturity.

## Status Values

```txt
Planned           known work, not implemented
In Progress       actively being implemented in another branch or workspace
Demo-Capable      works for the milestone demo with intentional limits
Production-Ready  stable, documented, tested for edge cases, and integrated
Complete          non-runtime foundation work is done and verified
Deferred          intentionally outside the current MVP slice
Blocked           depends on a missing upstream decision or implementation
```

## Ledger

| Feature | Package or Area | Planned Phase | Demo-Capable Gate | Production-Ready Gate | Status | Notes |
|---|---|---:|---|---|---|---|
| Monorepo workspace foundation | repo | Phase 1 | Core package shells build as empty packages | Workspace scripts, TS config, tests, and clean builds are verified | Complete | `packages/runtime`, `packages/compiler`, `packages/vite-plugin`, and `packages/cli` exist. |
| Runtime `signal()` | runtime | Phase 2 | Writable signal reads and writes update dependent effects | Edge cases, type docs, disposal interactions, and size budget verified | Demo-Capable | Phase 2 verified; required by compiler interpolation demos. |
| Runtime `computed()` | runtime | Phase 2 | Derived value updates when source signals change | Lazy caching, chained computeds, disposal, and graph edge cases verified | Demo-Capable | Phase 2 verified; required for future app examples. |
| Runtime `effect()` | runtime | Phase 2 | Effects rerun when dependencies change | Cleanup, synchronous error behavior, disposal, and batching interactions verified | Demo-Capable | Phase 2 verified; compiler-generated interpolation and property binding depend on it. |
| Runtime `batch()` | runtime | Phase 2 | Multiple writes flush once | Nested batches and error behavior verified | Demo-Capable | Phase 2 verified; not required by Phase 3 compiler output. |
| Runtime `untrack()` | runtime | Phase 2 | Reads without subscribing | Nested effect behavior verified | Demo-Capable | Phase 2 verified; not required by Phase 3 compiler output. |
| Runtime cleanup scopes | runtime | Phase 2 | Cleanup callbacks run on dispose | Nested ownership and lifecycle interactions verified | Demo-Capable | Phase 2 verified; required by `listen()` cleanup. |
| Runtime `onMount()` | runtime | Phase 2 | Browser-only callbacks run after insertion | Cleanup return handling and ordering verified | Demo-Capable | Phase 2 verified; not required by Phase 3 compiler output. |
| Runtime `onDestroy()` | runtime | Phase 2 | Cleanup callbacks run on destroy | Multiple callbacks and nested ownership verified | Demo-Capable | Phase 2 verified; required indirectly by `listen()`. |
| Runtime `mount()` | runtime | Phase 2 | Root component can be constructed and destroyed | Final compiler component contract is integrated | Demo-Capable | Phase 2 verified with placeholder component type; final compiler factory integration remains future work. |
| Runtime internal `listen()` | runtime | Phase 2 | Event listener auto-removes through cleanup scope | Options, teardown idempotence, and generated-code integration verified | Demo-Capable | Phase 2 verified; Phase 3 event binding emits imports to this helper. |
| Compiler file convention resolver | compiler | Phase 3 | Resolves `.component.ts`, `.component.html`, `.component.css` siblings | Supports all Vanrot UI role suffixes with diagnostics | Demo-Capable | Phase 3 verified; supports `.component.*` only and is not production-ready. |
| Compiler text interpolation `{{ }}` | compiler | Phase 3 | Basic expressions update generated text nodes through `effect()` | Rich diagnostics, escaping rules, source maps, and nested context behavior verified | Demo-Capable | Phase 3 verified for demo expressions; not production-ready. |
| Compiler event binding `(event)` | compiler | Phase 3 | `(click)="increment()"` calls a component method through `listen()` | Typed events, arguments, modifiers, accessibility diagnostics, and cleanup tests verified | Demo-Capable | Phase 3 verified for zero-argument method calls; not production-ready. |
| Compiler property binding `[property]` | compiler | Phase 3 | `[value]="name()"` and `[disabled]="saving()"` assign DOM properties through `effect()` | Property vs attribute matrix, boolean behavior, SVG behavior, and diagnostics verified | Demo-Capable | Phase 3 verified for direct DOM property assignment; not production-ready. |
| Compiler scoped CSS | compiler | Phase 3 | Basic selectors rewrite with a generated scope attribute | Complex selectors, global escapes, source maps, and CSS diagnostics verified | Demo-Capable | Phase 3 verified for basic selectors and `@media`; not production-ready. |
| Compiler readable generated output | compiler | Phase 3 | Generated code is snapshot-tested and understandable | Stable inspect output, source maps, and docs integration verified | Demo-Capable | Phase 3 verified; future `vr inspect` still owns production inspection polish. |
| Compiler component class detection | compiler | Phase 3 | Matching named export class is found | Multiple exports, default exports, inheritance, and constructor diagnostics verified | Demo-Capable | Phase 3 verified for matching named exports with no required constructor args; not production-ready. |
| Compiler expression rewriting | compiler | Phase 3 | Bare identifiers rewrite to `ctx.<name>` without `eval()` | Full expression grammar policy, diagnostics, and source locations verified | Demo-Capable | Phase 3 verified with TypeScript AST rewriting for the MVP subset; not production-ready. |
| Compiler Vite import override | compiler | Phase 4 | Compiler can emit generated code that imports the component class from a Vite virtual source module | Option is documented, tested with Vite integration, and does not change normal compiler output when omitted | Planned | Narrow integration extension needed to avoid recursive `.component.ts` transforms. |
| Compiler `@if` conditionals | compiler | Future | Conditional DOM can render in a demo | Nested cleanup, keyed transitions, diagnostics, and source maps verified | Deferred | Excluded from Phase 3. |
| Compiler `@for` loops | compiler | Future | List DOM can render in a demo | Keyed diffing, cleanup, nested blocks, and diagnostics verified | Deferred | Excluded from Phase 3. |
| Compiler child components | compiler | Future | Parent can instantiate one child component | Props, lifecycle boundaries, cleanup, slots, and diagnostics verified | Deferred | Excluded from Phase 3. |
| Compiler slots | compiler | Future | Parent can pass static slot content | Named slots, fallback content, scope rules, and diagnostics verified | Deferred | Excluded from Phase 3. |
| Compiler two-way binding | compiler | Future | A simple input can read and write a signal | Forms integration, event policy, validation, and diagnostics verified | Deferred | Excluded from Phase 3. |
| Compiler i18n extraction | compiler and cli | Future | Template keys can be extracted into locale JSON | Missing-key diagnostics, pluralization policy, and CLI workflow verified | Deferred | Excluded from Phase 3. |
| Compiler source maps | compiler | Future | Generated output maps to template and CSS files | Accurate template, style, and generated-code mappings verified | Deferred | Excluded from Phase 3. |
| Compiler production diagnostics | compiler and cli | Future | Basic fatal diagnostics identify unsupported syntax | Code frames, suggestions, recovery, documentation links, and integration with Vite and CLI verified | Deferred | Phase 3 has only basic fatal diagnostics. |
| Vite plugin public API | vite-plugin | Phase 4 | `vanrot()` returns a Vite plugin usable in `vite.config.ts` | Typed options, peer dependency behavior, docs, and integration examples verified | Planned | Default export plus named `vanrotPlugin` alias. |
| Vite transform integration | vite-plugin | Phase 4 | Vanrot component compiles through Vite dev/build | Watch mode, rebuilds, HMR preparation, and error overlay verified | Planned | Phase 4 owns this. |
| Vite virtual source modules | vite-plugin | Phase 4 | Generated code imports original component class through an internal virtual module | Recursive import prevention, path encoding, Vite resolution, and build/dev behavior verified | Planned | Required because `.component.ts` imports become generated component modules. |
| Vite CSS virtual modules | vite-plugin | Phase 4 | Generated component modules import scoped CSS through Vite | CSS transforms, dev injection, production extraction, and cache invalidation verified | Planned | The plugin must not manually inject style tags. |
| Vite file watching | vite-plugin | Phase 4 | Changes to TS, HTML, and CSS trigger rebuilds | Dependency graph accuracy and HMR behavior verified | Planned | Phase 4 owns reliable rebuilds, not state-preserving HMR. |
| Vite diagnostics overlay bridge | vite-plugin | Phase 4 | Compiler diagnostics appear as Vite errors or warnings | Code frames, source maps, suggestions, and docs links verified | Planned | Uses Vite's default dev overlay in Phase 4. |
| Vite production build integration | vite-plugin | Phase 4 | `vite build` emits JavaScript and CSS for a Vanrot fixture app | Asset output, minification compatibility, sourcemap policy, and framework examples verified | Planned | Build integration is required before CLI `vr build`. |
| Vite true HMR | vite-plugin | Future | Component HTML and CSS can update without full page reload | State preservation, partial invalidation, cleanup safety, and compiler boundary tracking verified | Deferred | Phase 4 uses full reload fallback only. |
| Vite config loading `vanrot.config.ts` | vite-plugin and cli | Future | Plugin can read Vanrot config defaults | Config discovery, schema validation, CLI sharing, and diagnostics verified | Deferred | Excluded from Phase 4. |
| Runtime compiled component mount bridge | runtime | Phase 4 | `mount(App, target)` accepts Vite-transformed component modules and appends returned DOM | Lifecycle ordering, cleanup, destroy idempotence, and compiler output integration verified | Planned | Narrow bridge from Phase 2 placeholder mount type to Phase 3 generated component shape. |
| CLI `vr create` | cli | Phase 5 | Creates a minimal Vanrot app | Package manager handling, templates, errors, and docs verified | Deferred | Phase 5 owns this. |
| CLI `vr generate component` | cli | Phase 5 | Creates convention component files | Role suffixes, folder rules, naming diagnostics, and tests verified | Deferred | Phase 5 owns this. |
| CLI `vr generate page` | cli | Phase 5 | Creates convention page files | Routing integration and feature-folder placement verified | Deferred | Phase 5 owns this. |
| CLI `vr doctor` | cli | Phase 5 or Phase 7 | Runs basic project checks | Diagnostics for naming, i18n, a11y, cleanup, imports, and structure verified | Deferred | Basic command may start in Phase 5; project intelligence expands in Phase 7. |
| CLI `vr build` | cli | Phase 5 | Invokes Vite build for a Vanrot app | Config loading, diagnostics, and build report verified | Deferred | Depends on Phase 4. |
| CLI `vr test` | cli | Phase 5 | Invokes app tests | Testing package integration and generated test support verified | Deferred | Depends on test strategy. |
| Counter demo app | examples | Phase 6 | Counter compiles and updates without virtual DOM | Demo documents runtime, compiler, Vite, and CLI integration boundaries | Deferred | Phase 6 owns this. |
| Project map `.vanrot/project-map.json` | cli | Phase 7 | Maps pages, components, dialogs, forms, routes, i18n, and UI | Incremental updates, graph output, and diagnostics verified | Deferred | Phase 7 owns this. |
| AI rules `.vanrot/ai-rules.md` | cli | Phase 7 | Generates framework rules file | Customization and provider-independent workflows verified | Deferred | Optional AI features remain provider-neutral. |
| Router route config | router | Phase 8 | Explicit routes render pages | Params, lazy loading, guards, and diagnostics verified | Deferred | Phase 8 owns this. |
| Router link helper | router | Phase 8 | Links navigate between routes | Active state, accessibility, params, and history behavior verified | Deferred | Phase 8 owns this. |
| UI copyable components | ui | Phase 9 | `vr add button` copies source | Tokens, accessibility, theming, ownership, and docs verified | Deferred | Phase 9 owns this. |
| Design tokens | ui | Phase 9 | Generated app includes token CSS | Theme overrides and component integration verified | Deferred | Phase 9 owns this. |
| Testing helpers | testing | Phase 10 | Can render a component in tests | Events, queries, cleanup, and docs verified | Deferred | Phase 10 owns this. |
| API docs | docs | Phase 10 | Public APIs are documented | Examples, versioning, and generated docs verified | Deferred | Phase 10 owns this. |
| SSR-safe APIs | ssr | Phase 11 | Browser APIs are isolated behind `onMount()` | Server render, hydration, routing, and diagnostics verified | Deferred | Phase 11 owns this. |
| Hydration | ssr | Phase 11 | Static markup can attach client behavior | Mismatch diagnostics and streaming strategy verified | Deferred | Phase 11 owns this. |
| Async resources | async | Phase 11 | Basic async state primitive works | Cancellation, cache policy, suspense policy, and SSR behavior verified | Deferred | Optional package. |
| Stores | store | Phase 11 | App-level state primitive works | Devtools, SSR, and persistence policy verified | Deferred | Optional package. |
| Forms | forms | Phase 11 | Basic form state works | Validation, accessibility, and two-way binding policy verified | Deferred | Optional package. |
| Devtools | devtools | Phase 11 | Runtime graph can be inspected in development | Browser extension or panel integration verified | Deferred | Optional package. |
| Optional AI commands | cli | Phase 11 | Provider-neutral AI command can run when configured | OpenAI, Claude, Ollama, and self-hosted provider abstraction verified | Deferred | Vanrot must work without AI. |

## Update Rule

Every phase plan must include a final ledger update step.

A feature must not move to `Demo-Capable` unless the phase acceptance gate has been verified.

A feature must not move to `Production-Ready` unless it has:

- documented public behavior
- focused tests for normal and edge cases
- integration tests for the expected user workflow
- diagnostics for common misuse
- no known deferred behavior hidden behind the same status
