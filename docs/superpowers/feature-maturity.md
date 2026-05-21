# Vanrot Feature Maturity Ledger

**Date:** 2026-05-22
**Purpose:** Track whether each Vanrot capability is only planned, demo-capable, production-ready, complete, or deferred.

This ledger is the source of truth for feature maturity across phases. Phase checkboxes show delivery milestones. This file shows capability maturity.

After the demo phases are complete, use the package/module groupings in this file to create phase-by-phase implementation plans for production-ready features.

Rows or sections marked with `*` are brainstorming-level pillars. They must get a dedicated brainstorming, design spec, written plan, and review before implementation starts.

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

## Package And Module Map

Each package section is divided into module or submodule tables. This keeps production planning focused: pick a package, choose a module, then write a spec and plan for the deferred production gates.

## Repo

### Workspace Foundation

| Feature | Package or Area | Planned Phase | Demo-Capable Gate | Production-Ready Gate | Status | Notes |
|---|---|---:|---|---|---|---|
| Monorepo workspace foundation | repo | Phase 1 | Core package shells build as empty packages | Workspace scripts, TS config, tests, and clean builds are verified | Complete | `packages/runtime`, `packages/compiler`, `packages/vite-plugin`, and `packages/cli` exist. |

## `@vanrot/runtime`

### Reactive Kernel

| Feature | Package or Area | Planned Phase | Demo-Capable Gate | Production-Ready Gate | Status | Notes |
|---|---|---:|---|---|---|---|
| Runtime `signal()` | runtime | Phase 2 | Writable signal reads and writes update dependent effects | Edge cases, type docs, disposal interactions, and size budget verified | Demo-Capable | Phase 2 verified; required by compiler interpolation demos. |
| Runtime `computed()` | runtime | Phase 2 | Derived value updates when source signals change | Lazy caching, chained computeds, disposal, and graph edge cases verified | Demo-Capable | Phase 2 verified; required for future app examples. |
| Runtime `effect()` | runtime | Phase 2 | Effects rerun when dependencies change | Cleanup, synchronous error behavior, disposal, and batching interactions verified | Demo-Capable | Phase 2 verified; compiler-generated interpolation and property binding depend on it. |
| Runtime `batch()` | runtime | Phase 2 | Multiple writes flush once | Nested batches and error behavior verified | Demo-Capable | Phase 2 verified; not required by Phase 3 compiler output. |
| Runtime `untrack()` | runtime | Phase 2 | Reads without subscribing | Nested effect behavior verified | Demo-Capable | Phase 2 verified; not required by Phase 3 compiler output. |

### Lifecycle And Mounting

| Feature | Package or Area | Planned Phase | Demo-Capable Gate | Production-Ready Gate | Status | Notes |
|---|---|---:|---|---|---|---|
| Runtime cleanup scopes | runtime | Phase 2 | Cleanup callbacks run on dispose | Nested ownership and lifecycle interactions verified | Demo-Capable | Phase 2 verified; required by `listen()` cleanup. |
| Runtime `onMount()` | runtime | Phase 2 | Browser-only callbacks run after insertion | Cleanup return handling and ordering verified | Demo-Capable | Phase 2 verified; not required by Phase 3 compiler output. |
| Runtime `onDestroy()` | runtime | Phase 2 | Cleanup callbacks run on destroy | Multiple callbacks and nested ownership verified | Demo-Capable | Phase 2 verified; required indirectly by `listen()`. |
| Runtime `mount()` | runtime | Phase 2 | Root component can be constructed and destroyed | Final compiler component contract is integrated | Demo-Capable | Phase 2 verified constructor mounting; Phase 4 adds the compiled component bridge for demo integration. |
| Runtime compiled component mount bridge | runtime | Phase 4 | `mount(App, target)` accepts Vite-transformed component modules and appends returned DOM | Lifecycle ordering, cleanup, destroy idempotence, and compiler output integration verified | Demo-Capable | Runtime tests cover compiled module mount, DOM removal, and cleanup-scoped effects. |

### Internal Compiler Helpers

| Feature | Package or Area | Planned Phase | Demo-Capable Gate | Production-Ready Gate | Status | Notes |
|---|---|---:|---|---|---|---|
| Runtime internal `listen()` | runtime | Phase 2 | Event listener auto-removes through cleanup scope | Options, teardown idempotence, and generated-code integration verified | Demo-Capable | Phase 2 verified; Phase 3 event binding emits imports to this helper. |

## `@vanrot/compiler`

### Component File Model

| Feature | Package or Area | Planned Phase | Demo-Capable Gate | Production-Ready Gate | Status | Notes |
|---|---|---:|---|---|---|---|
| Compiler file convention resolver | compiler | Phase 3 | Resolves `.component.ts`, `.component.html`, `.component.css` siblings | Supports all Vanrot UI role suffixes with diagnostics | Demo-Capable | Phase 3 verified; supports `.component.*` only and is not production-ready. |
| Compiler component class detection | compiler | Phase 3 | Matching named export class is found | Multiple exports, default exports, inheritance, and constructor diagnostics verified | Demo-Capable | Phase 3 verified for matching named exports with no required constructor args; not production-ready. |
| Component module TypeScript typing | vite-plugin and compiler | Post-demo hardening | Demo apps can typecheck with an explicit transformed-component import boundary | First-class TypeScript declarations or plugin-aware typing remove user-facing suppressions for transformed `.component.ts` modules | Deferred | Phase 6 revealed that TypeScript sees raw named-export component classes while Vite compiles default component modules. The counter demo and generated starter use a narrow `@ts-expect-error`; production hardening must make this clean. |

### Template Compilation

| Feature | Package or Area | Planned Phase | Demo-Capable Gate | Production-Ready Gate | Status | Notes |
|---|---|---:|---|---|---|---|
| Compiler text interpolation `{{ }}` | compiler | Phase 3 | Basic expressions update generated text nodes through `effect()` | Rich diagnostics, escaping rules, source maps, and nested context behavior verified | Demo-Capable | Phase 3 verified for demo expressions; not production-ready. |
| Compiler event binding `(event)` | compiler | Phase 3 | `(click)="increment()"` calls a component method through `listen()` | Typed events, arguments, modifiers, accessibility diagnostics, and cleanup tests verified | Demo-Capable | Phase 3 verified for zero-argument method calls; not production-ready. |
| Compiler property binding `[property]` | compiler | Phase 3 | `[value]="name()"` and `[disabled]="saving()"` assign DOM properties through `effect()` | Property vs attribute matrix, boolean behavior, SVG behavior, and diagnostics verified | Demo-Capable | Phase 3 verified for direct DOM property assignment; not production-ready. |
| Compiler expression rewriting | compiler | Phase 3 | Bare identifiers rewrite to `ctx.<name>` without `eval()` | Full expression grammar policy, diagnostics, and source locations verified | Demo-Capable | Phase 3 verified with TypeScript AST rewriting for the MVP subset; not production-ready. |
| Compiler `@if` conditionals | compiler | Future | Conditional DOM can render in a demo | Nested cleanup, keyed transitions, diagnostics, and source maps verified | Deferred | Excluded from Phase 3. |
| Compiler `@for` loops | compiler | Future | List DOM can render in a demo | Keyed diffing, cleanup, nested blocks, and diagnostics verified | Deferred | Excluded from Phase 3. |
| Compiler child components | compiler | Future | Parent can instantiate one child component | Props, lifecycle boundaries, cleanup, slots, and diagnostics verified | Deferred | Excluded from Phase 3. |
| Compiler slots | compiler | Future | Parent can pass static slot content | Named slots, fallback content, scope rules, and diagnostics verified | Deferred | Excluded from Phase 3. |
| Compiler two-way binding | compiler | Future | A simple input can read and write a signal | Forms integration, event policy, validation, and diagnostics verified | Deferred | Excluded from Phase 3. |

### Styling

| Feature | Package or Area | Planned Phase | Demo-Capable Gate | Production-Ready Gate | Status | Notes |
|---|---|---:|---|---|---|---|
| Compiler scoped CSS | compiler | Phase 3 | Basic selectors rewrite with a generated scope attribute | Complex selectors, global escapes, source maps, and CSS diagnostics verified | Demo-Capable | Phase 3 verified for basic selectors and `@media`; not production-ready. |

### Diagnostics And Inspection

| Feature | Package or Area | Planned Phase | Demo-Capable Gate | Production-Ready Gate | Status | Notes |
|---|---|---:|---|---|---|---|
| Compiler readable generated output | compiler | Phase 3 | Generated code is snapshot-tested and understandable | Stable inspect output, source maps, and docs integration verified | Demo-Capable | Phase 3 verified; future `vr inspect` still owns production inspection polish. |
| Compiler i18n extraction | compiler and cli | Future | Template keys can be extracted into locale JSON | Missing-key diagnostics, pluralization policy, and CLI workflow verified | Deferred | Excluded from Phase 3. |
| Compiler source maps | compiler | Future | Generated output maps to template and CSS files | Accurate template, style, and generated-code mappings verified | Deferred | Excluded from Phase 3. |
| Compiler production diagnostics | compiler and cli | Future | Basic fatal diagnostics identify unsupported syntax | Code frames, suggestions, recovery, documentation links, and integration with Vite and CLI verified | Deferred | Phase 3 has only basic fatal diagnostics. |

### Vite-Aware Compiler Hooks

| Feature | Package or Area | Planned Phase | Demo-Capable Gate | Production-Ready Gate | Status | Notes |
|---|---|---:|---|---|---|---|
| Compiler Vite import override | compiler | Phase 4 | Compiler can emit generated code that imports the component class from a Vite virtual source module | Option is documented, tested with Vite integration, and does not change normal compiler output when omitted | Demo-Capable | Phase 4 verified the narrow override with compiler tests and Vite fixture builds; not production-ready. |

## `@vanrot/vite-plugin`

### Plugin API

| Feature | Package or Area | Planned Phase | Demo-Capable Gate | Production-Ready Gate | Status | Notes |
|---|---|---:|---|---|---|---|
| Vite plugin public API | vite-plugin | Phase 4 | `vanrot()` returns a Vite plugin usable in `vite.config.ts` | Typed options, peer dependency behavior, docs, and integration examples verified | Demo-Capable | Default export plus named `vanrotPlugin` alias are tested; not production-ready. |
| Vite config loading `vanrot.config.ts` | vite-plugin and cli | Future | Plugin can read Vanrot config defaults | Config discovery, schema validation, CLI sharing, and diagnostics verified | Deferred | Excluded from Phase 4. |

### Transform And Virtual Modules

| Feature | Package or Area | Planned Phase | Demo-Capable Gate | Production-Ready Gate | Status | Notes |
|---|---|---:|---|---|---|---|
| Vite transform integration | vite-plugin | Phase 4 | Vanrot component compiles through Vite dev/build | Watch mode, rebuilds, HMR preparation, and error overlay verified | Demo-Capable | Component transforms are covered by unit tests and a Vite fixture; true HMR remains deferred. |
| Vite virtual source modules | vite-plugin | Phase 4 | Generated code imports original component class through an internal virtual module | Recursive import prevention, path encoding, Vite resolution, and build/dev behavior verified | Demo-Capable | Virtual source IDs avoid recursive `.component.ts` transforms in dev and build. |
| Vite CSS virtual modules | vite-plugin | Phase 4 | Generated component modules import scoped CSS through Vite | CSS transforms, dev injection, production extraction, and cache invalidation verified | Demo-Capable | Scoped CSS flows through Vite virtual CSS modules and build CSS output; not production-ready. |

### Dev Server And Production Build

| Feature | Package or Area | Planned Phase | Demo-Capable Gate | Production-Ready Gate | Status | Notes |
|---|---|---:|---|---|---|---|
| Vite file watching | vite-plugin | Phase 4 | Changes to TS, HTML, and CSS trigger rebuilds | Dependency graph accuracy and HMR behavior verified | Demo-Capable | Sibling HTML/CSS files are watched and full reload fallback is tested. |
| Vite diagnostics overlay bridge | vite-plugin | Phase 4 | Compiler diagnostics appear as Vite errors or warnings | Code frames, source maps, suggestions, and docs links verified | Demo-Capable | Compiler diagnostics are formatted into Vite errors/warnings; custom overlays and code frames remain deferred. |
| Vite production build integration | vite-plugin | Phase 4 | `vite build` emits JavaScript and CSS for a Vanrot fixture app | Asset output, minification compatibility, sourcemap policy, and framework examples verified | Demo-Capable | Fixture build emits JavaScript and CSS assets through Vite. |
| Vite true HMR | vite-plugin | Future | Component HTML and CSS can update without full page reload | State preservation, partial invalidation, cleanup safety, and compiler boundary tracking verified | Deferred | Phase 4 uses full reload fallback only. |

## `@vanrot/cli` *

*The CLI needs a dedicated design-focused brainstorming cycle before production polish. The target is beautiful yet functional: calm, premium, fast to read, useful under pressure, and not decorative at the cost of clarity.*

### Project Creation And Generation

| Feature | Package or Area | Planned Phase | Demo-Capable Gate | Production-Ready Gate | Status | Notes |
|---|---|---:|---|---|---|---|
| CLI `vr create` | cli | Phase 5 | Creates a minimal Vanrot app in standalone-style mode and internal fixture/workspace mode | Package manager handling, template variants, overwrite safety, errors, and docs verified | Demo-Capable | Phase 5 verified create output, workspace dependency mode, and overwrite protection; production package publishing remains future work. |
| CLI `vr generate component` | cli | Phase 5 | Creates convention component files | Role suffixes, folder rules, naming diagnostics, and tests verified | Demo-Capable | Phase 5 verified component generation in feature and default folders. |
| CLI `vr generate page` | cli | Phase 5 | Creates convention page files | Routing integration and feature-folder placement verified | Demo-Capable | Phase 5 verified page generation in feature and default folders without router integration. |

### Command Wrappers

| Feature | Package or Area | Planned Phase | Demo-Capable Gate | Production-Ready Gate | Status | Notes |
|---|---|---:|---|---|---|---|
| CLI `vr dev` | cli | Phase 5 | Invokes the Vite dev server for a Vanrot app | Config loading, diagnostics, dev server lifecycle, and readable startup output verified | Demo-Capable | Phase 5 verifies the thin runner wrapper through injected runner tests; production lifecycle polish remains future work. |
| CLI `vr build` | cli | Phase 5 | Invokes Vite build for a Vanrot app | Config loading, diagnostics, and build report verified | Demo-Capable | Phase 5 verifies the thin build wrapper through injected runner tests. Build reports remain deferred. |
| CLI `vr test` | cli | Phase 5 | Invokes app tests | Testing package integration and generated test support verified | Demo-Capable | Phase 5 verifies the thin test wrapper through injected runner tests before `@vanrot/testing` exists. |

### Doctor, Reports, And Maintenance

| Feature | Package or Area | Planned Phase | Demo-Capable Gate | Production-Ready Gate | Status | Notes |
|---|---|---:|---|---|---|---|
| CLI `vr doctor` starter checks | cli | Phase 5 | Runs project-health checks and starter Vanrot rule checks | Diagnostics for naming, i18n, a11y, cleanup, imports, and structure verified | Demo-Capable | Phase 5 verifies project health, sibling files, role suffixes, raw visible template text, and nested `if` warnings only. |
| CLI full `vr doctor` diagnostics | cli | Post-demo hardening | Starter checks can report health and first Vanrot rules | Full a11y, i18n, SSR, import-depth, unused CSS/components, cleanup, code frames, docs links, and strict mode verified | Deferred | Phase 5 intentionally covers only project health plus the starter Vanrot rule set. |
| CLI strict `vr doctor --strict` mode | cli | Post-demo hardening | Strict mode can promote selected warnings to errors in local and CI workflows | Rule configuration, CI exit behavior, docs links, suppression policy, and team adoption workflow verified | Deferred | Phase 7 does not implement strict diagnostics; it only prepares project intelligence files that future diagnostics can consume. |
| CLI i18n diagnostics | cli and compiler | Post-demo hardening | Templates can report raw user-facing text and missing i18n-ready patterns | Key extraction, missing-key checks, locale coverage, pluralization policy, code frames, and docs verified | Deferred | Phase 7 keeps i18n as map metadata only. Full i18n diagnostics need their own design. |
| CLI accessibility diagnostics | cli and compiler | Post-demo hardening | Templates can report common accessibility issues | Keyboard interaction checks, ARIA guidance, semantic element checks, focus-management rules, code frames, and docs verified | Deferred | Phase 7 does not inspect template accessibility. This remains production diagnostic work. |
| CLI build reports and budgets | cli | Post-demo hardening | `vr build` can invoke Vite build | Runtime/app/CSS budgets, largest page report, unused CSS summary, warning policy, and CI behavior verified | Deferred | Kept out of Phase 5 so the CLI MVP stays demo-capable. |
| CLI cache clearing command | cli | Post-demo hardening | `vr cache clear` removes Vanrot-owned local compiler, Vite, and project metadata caches with a clear summary | Cache location policy, dry-run/list modes, safe path boundaries, cross-platform cleanup, and `vr doctor` integration verified | Deferred | Requested as an Angular-like cache clean workflow for when stale framework caches cause confusing local behavior. |
| Project map `.vanrot/project-map.json` | cli | Phase 7 | Maps role-based files, source root, i18n file hints, schema version, and generated timestamp | Incremental updates, route graphing, dependency graphing, compiler-aware metadata, and diagnostics verified | Demo-Capable | Phase 7 verified the demo-capable filesystem convention map, not the production graph engine. |
| Project route and dependency graphing | cli, compiler, router | Post-demo hardening | Project intelligence can show simple relationships between known role files | Route graph, component usage graph, import graph, graph output formats, stale graph detection, and docs verified | Deferred | Kept out of Phase 7 so `vr map` stays deterministic and filesystem-based. |
| Compiler-aware project intelligence | cli and compiler | Post-demo hardening | Project map can incorporate compiler metadata beyond filenames | Template usage, bindings, styles, source locations, diagnostics, and source map alignment verified | Deferred | Requires a separate design after compiler metadata and diagnostics mature. |
| AI rules `.vanrot/ai-rules.md` | cli | Phase 7 | Generates provider-neutral Vanrot rules file | Customization, merge behavior, docs synchronization, and provider-independent workflows verified | Demo-Capable | Phase 7 verified deterministic local rules, not AI provider integration. |

### Terminal Experience And Inspection

| Feature | Package or Area | Planned Phase | Demo-Capable Gate | Production-Ready Gate | Status | Notes |
|---|---|---:|---|---|---|---|
| CLI Quiet Premium reporter | cli | Phase 5 | Commands use a shared structured reporter with calm headings, status lines, warnings, errors, and next steps | Cross-platform terminal behavior, interactive states, theming, accessibility, snapshots, and docs verified | Demo-Capable | Phase 5 verifies shared structured reporter output; production polish comes after demo phases. |
| CLI design language * | cli | Post-demo production track | CLI design principles are approved for command layout, rhythm, progress, errors, and next steps | Real command journeys, terminal snapshots, narrow/wide viewport checks, accessibility, cross-platform QA, and docs verified | Deferred | Requires a focused design conversation. Beautiful yet functional is the key standard. |
| CLI production terminal experience | cli | Post-demo hardening | Reporter foundation can render consistent command summaries | Claude Code-quality polish with refined interaction, progress states, terminal resizing, theming, and cross-platform QA verified | Deferred | Long-term goal: Vanrot CLI should feel beautiful and engaging compared with other framework CLIs. |
| CLI `vr inspect` | cli and compiler | Future | Can show generated output for a component | Source maps, stable generated-file output, docs links, and source-to-generated mapping verified | Deferred | Future command for readable generated output and debugging. |
| Optional AI commands | cli | Phase 11 | Provider-neutral AI command can run when configured | OpenAI, Claude, Ollama, and self-hosted provider abstraction verified | Deferred | Vanrot must work without AI. |

## `@vanrot/store` *

*Requires a dedicated brainstorming and design cycle before implementation. The goal is not to piggyback on NgRx or recreate an Angular-era, RxJS-heavy architecture. Vanrot store should be future-facing: signal-native, enterprise-capable, lightweight by default, and written with clear English-first APIs. Redux, NgRx, and RxJS are references for enterprise needs and migration pressure, not the design destination.*

### Enterprise Store Core

| Feature | Package or Area | Planned Phase | Demo-Capable Gate | Production-Ready Gate | Status | Notes |
|---|---|---:|---|---|---|---|
| Store package foundation * | store | Phase 11 | `@vanrot/store` can be installed without increasing `@vanrot/runtime` size | Package exports, docs, examples, tree-shaking, SSR boundaries, and release checks verified | Deferred | Optional enterprise package. Must be planned from first principles as a more advanced, lighter, signal-native state system for enterprise applications. |
| Store state containers | store | Phase 11 | A store owns typed state and exposes signal-native reads | Immutable update policy, nested state ergonomics, reset/replace behavior, and serialization verified | Deferred | State must feel native in Vanrot components and should not require RxJS by default. |
| Store actions | store | Phase 11 | Typed actions can be declared and dispatched | Payload typing, namespacing, action tracing, dev diagnostics, and collision handling verified | Deferred | Required for enterprise workflows that expect explicit command/event flow. |
| Store reducers | store | Phase 11 | Reducers update state from actions | Exhaustiveness, immutability enforcement, batching, error behavior, and test helpers verified | Deferred | Vanrot should keep the reducer model familiar without copying NgRx boilerplate. |
| Store selectors | store | Phase 11 | Selectors expose derived signal values | Memoization, composition, parameterized selectors, equality policy, and type inference verified | Deferred | Selectors should bridge cleanly to templates and component fields as signals. |
| Store effects | store | Phase 11 | Effects can react to actions and dispatch follow-up actions | Cancellation, concurrency modes, retries, cleanup, test scheduling, and error channels verified | Deferred | The API should cover enterprise side effects without forcing RxJS into every app. |

### Redux Compatibility

| Feature | Package or Area | Planned Phase | Demo-Capable Gate | Production-Ready Gate | Status | Notes |
|---|---|---:|---|---|---|---|
| Redux-style interop | store | Post-demo production track | Vanrot store can integrate with Redux-style action/reducer mental models | Migration docs, adapter tests, devtools compatibility, middleware policy, and state inspection verified | Deferred | Supports teams that already understand Redux without making Redux a required dependency. |
| Devtools and time travel | store | Post-demo production track | Store changes can be inspected during development | Browser devtools integration, action history, time travel, redaction, and production stripping verified | Deferred | Important for enterprise debugging and parity with mature state libraries. |

### RxJS Interop

| Feature | Package or Area | Planned Phase | Demo-Capable Gate | Production-Ready Gate | Status | Notes |
|---|---|---:|---|---|---|---|
| RxJS bridge | store/rxjs | Post-demo production track | Actions, selectors, or signals can interoperate with RxJS observables | Optional peer dependency, observable cleanup, scheduler behavior, backpressure policy, and docs verified | Deferred | Required for enterprise teams that rely on RxJS, but kept out of the default store path. |
| Observable effects adapter | store/rxjs | Post-demo production track | Store effects can be authored with observable pipelines when RxJS is installed | Cancellation modes, typed action streams, error handling, marble tests, and cleanup verified | Deferred | Provides an NgRx-style escape hatch without making Vanrot store feel RxJS-heavy by default. |

## `@vanrot/router`

### Routing

| Feature | Package or Area | Planned Phase | Demo-Capable Gate | Production-Ready Gate | Status | Notes |
|---|---|---:|---|---|---|---|
| Router route config | router | Phase 8 | Explicit routes render pages | Params, lazy loading, guards, and diagnostics verified | Deferred | Phase 8 owns this. |
| Router link helper | router | Phase 8 | Links navigate between routes | Active state, accessibility, params, and history behavior verified | Deferred | Phase 8 owns this. |

## `@vanrot/ui` *

*The UI package needs a dedicated product/design brainstorming cycle. The package has two planned flavors for now: `V01`, based on the shadcn design language, and `V02`, a brutalist version of codename `V01`. These are codenames until final naming is chosen.*

### Components And Tokens

| Feature | Package or Area | Planned Phase | Demo-Capable Gate | Production-Ready Gate | Status | Notes |
|---|---|---:|---|---|---|---|
| UI copyable components | ui | Phase 9 | `vr add button` copies source | Tokens, accessibility, theming, ownership, and docs verified | Deferred | Phase 9 owns this. |
| Design tokens | ui | Phase 9 | Generated app includes token CSS | Theme overrides and component integration verified | Deferred | Phase 9 owns this. |
| UI flavor `V01` * | ui | Post-demo production track | First-party UI components can be added using a shadcn-inspired design language | Component coverage, accessibility, theming, ownership rules, docs, examples, and visual QA verified | Deferred | Codename only. Intended as the polished, familiar, modern UI baseline. |
| UI flavor `V02` * | ui | Post-demo production track | First-party UI components can be added using the brutalist variation of codename `V01` | Token separation, component parity with `V01`, accessibility, docs, examples, and visual QA verified | Deferred | Codename only. Intended as the bolder brutalist expression of the same component system. |
| UI flavor selection | ui and cli | Post-demo production track | `vr add` or project config can choose a UI flavor without mixing styles accidentally | Migration rules, token compatibility, docs, examples, and generated output checks verified | Deferred | Prevents design drift once both UI flavors exist. |

## `@vanrot/testing`

### Test Utilities

| Feature | Package or Area | Planned Phase | Demo-Capable Gate | Production-Ready Gate | Status | Notes |
|---|---|---:|---|---|---|---|
| Testing helpers | testing | Phase 10 | Can render a component in tests | Events, queries, cleanup, and docs verified | Deferred | Phase 10 owns this. |

## Docs *

*Documentation needs a dedicated completeness pass before production. The goal is high-depth documentation where every package, command, public API, generated file, convention, limitation, and production caveat is covered so neither users nor AI assistants have to infer missing framework behavior.*

### Public Documentation

| Feature | Package or Area | Planned Phase | Demo-Capable Gate | Production-Ready Gate | Status | Notes |
|---|---|---:|---|---|---|---|
| API docs | docs | Phase 10 | Public APIs are documented | Examples, versioning, and generated docs verified | Deferred | Phase 10 owns this. |
| Deep documentation system * | docs | Post-demo production track | Docs cover every package, feature, CLI command, convention, and known limitation | Package inventory, examples, migration notes, API references, guides, and completeness checks verified | Deferred | Nothing important should be left out just because an AI assistant or maintainer forgot a package. |
| Documentation completeness checks | docs and ci | Post-demo production track | CI can detect undocumented public packages, commands, and feature-maturity rows | Automated docs inventory, broken link checks, example freshness, and release checklist integration verified | Deferred | Keeps documentation from drifting as Vanrot grows. |
| AI-readable documentation bundle | docs and ai | Post-demo production track | Documentation can be exported into a stable AI-consumable bundle | Versioned manifest, package summaries, examples, limits, changelog links, and validation checks verified | Deferred | Feeds future MCP and Skill.sh integrations with authoritative framework knowledge. |

## Web Presence *

*Vanrot will live at `vanrot.vankode.com`. The docs, install guide, landing page, and UI documentation should feel like one coherent product, not scattered artifacts.*

### `vankode.com` Subdomain

| Feature | Package or Area | Planned Phase | Demo-Capable Gate | Production-Ready Gate | Status | Notes |
|---|---|---:|---|---|---|---|
| Vanrot subdomain site * | web and docs | Post-demo production track | `vanrot.vankode.com` has landing, install, docs, and UI docs IA | Domain routing, deployment, navigation, SEO, accessibility, analytics policy, and release docs workflow verified | Deferred | All public Vanrot material should live under this subdomain. |
| Landing page | web | Post-demo production track | Landing page explains Vanrot clearly and directs users to install/docs | Real copy, responsive design, performance, accessibility, screenshots, and deployment verified | Deferred | Should communicate the framework identity without becoming a replacement for docs. |
| Install guide | web and docs | Post-demo production track | Users can install Vanrot through the recommended package manager path | npm, pnpm, bun, yarn, and Homebrew paths are tested and documented where supported | Deferred | Must stay synchronized with publishing and distribution decisions. |
| UI documentation site | web and ui | Post-demo production track | `@vanrot/ui` components and flavors have browsable docs | Component examples, tokens, accessibility notes, copyable code, visual QA, and versioning verified | Deferred | Covers both `V01` and `V02` when they exist. |

## AI Consumption *

*When Vanrot is production-ready, AI tools should be able to consume the framework directly. Codex and Claude should have a reliable way to understand Vanrot even when users do not know the docs well.*

### MCP And Skill.sh

| Feature | Package or Area | Planned Phase | Demo-Capable Gate | Production-Ready Gate | Status | Notes |
|---|---|---:|---|---|---|---|
| Vanrot MCP server * | ai and docs | Post-demo production track | An MCP server can answer framework questions from authoritative Vanrot docs and package metadata | Versioned data source, tool schema, examples, local/remote setup, security review, and Codex/Claude integration verified | Deferred | Lets AI assistants inspect framework rules, packages, commands, and conventions instead of guessing. |
| Skill.sh package * | ai and docs | Post-demo production track | Vanrot framework instructions can be installed or consumed by AI coding tools | Skill packaging, examples, update workflow, compatibility checks, and docs verified | Deferred | Name and exact distribution can change; intent is AI-native framework understanding. |
| AI framework knowledge manifest | ai and docs | Post-demo production track | Docs expose a structured manifest of packages, commands, rules, examples, and limitations | Schema versioning, validation, changelog links, and generated docs alignment verified | Deferred | Shared source for MCP, Skill.sh, Codex, Claude, and other future AI consumers. |

## Distribution *

*Distribution should stay familiar for JavaScript users, but production Vanrot also needs native-feeling CLI installation paths.*

### Homebrew

| Feature | Package or Area | Planned Phase | Demo-Capable Gate | Production-Ready Gate | Status | Notes |
|---|---|---:|---|---|---|---|
| Homebrew install `brew install vanrot` * | distribution and cli | Post-demo production track | Vanrot CLI can be installed through Homebrew on supported systems | Formula, release artifact policy, checksums, upgrades, uninstall behavior, CI, and docs verified | Deferred | Requires production CLI packaging first. Should not replace npm/pnpm install paths. |

## Platform Packages

### SSR And Hydration

| Feature | Package or Area | Planned Phase | Demo-Capable Gate | Production-Ready Gate | Status | Notes |
|---|---|---:|---|---|---|---|
| SSR-safe APIs | ssr | Phase 11 | Browser APIs are isolated behind `onMount()` | Server render, hydration, routing, and diagnostics verified | Deferred | Phase 11 owns this. |
| Hydration | ssr | Phase 11 | Static markup can attach client behavior | Mismatch diagnostics and streaming strategy verified | Deferred | Phase 11 owns this. |

### Async, Forms, And Devtools

| Feature | Package or Area | Planned Phase | Demo-Capable Gate | Production-Ready Gate | Status | Notes |
|---|---|---:|---|---|---|---|
| Async resources | async | Phase 11 | Basic async state primitive works | Cancellation, cache policy, suspense policy, and SSR behavior verified | Deferred | Optional package. |
| Forms | forms | Phase 11 | Basic form state works | Validation, accessibility, and two-way binding policy verified | Deferred | Optional package. |
| Devtools | devtools | Phase 11 | Runtime graph can be inspected in development | Browser extension or panel integration verified | Deferred | Optional package. |

## Examples

### Demo Apps

| Feature | Package or Area | Planned Phase | Demo-Capable Gate | Production-Ready Gate | Status | Notes |
|---|---|---:|---|---|---|---|
| Counter demo app | examples | Phase 6 | Counter compiles and updates without virtual DOM | Demo documents runtime, compiler, Vite, and CLI integration boundaries | Demo-Capable | Phase 6 verified a workspace example app with grouped component files, signal updates, scoped CSS, Vite build output, CLI build/test/doctor workflows, and no production hardening claims. |

## Post-Demo Brainstorming Order

When the main demo phases from `docs/brainstorm.md` are complete, use this order for production-ready brainstorming, specs, and implementation plans:

| Order | Track | Why This Comes Here |
|---:|---|---|
| 1 | Deep documentation system * | Production planning needs a complete source of truth before more public surface area is added. |
| 2 | CLI design language and production terminal experience * | The CLI is the daily front door, and its behavior affects install, docs, generation, doctor, and future package workflows. |
| 3 | `vanrot.vankode.com` public site * | Public docs, install guide, landing page, and UI documentation need a permanent home before broad release. |
| 4 | `@vanrot/ui` flavor `V01` * | Establish the familiar shadcn-inspired component baseline first. |
| 5 | `@vanrot/ui` flavor `V02` * | Build the brutalist flavor after `V01` so both flavors share component contracts and token structure. |
| 6 | `@vanrot/store` enterprise state system * | Requires first-principles design for a future-facing, signal-native enterprise store before implementation. |
| 7 | AI consumption through MCP and Skill.sh * | AI integrations should consume stable docs, package metadata, and conventions instead of half-formed APIs. |
| 8 | Homebrew install `brew install vanrot` * | Native CLI distribution should happen after the production CLI packaging and release story are stable. |

## Update Rule

Every phase plan must include a final ledger update step.

A feature must not move to `Demo-Capable` unless the phase acceptance gate has been verified.

A feature must not move to `Production-Ready` unless it has:

- documented public behavior
- focused tests for normal and edge cases
- integration tests for the expected user workflow
- diagnostics for common misuse
- no known deferred behavior hidden behind the same status
