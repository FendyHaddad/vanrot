# Vanrot Final TDD Inventory

**Created:** 2026-05-22
**Purpose:** Grow a complete release-testing checklist from every completed Vanrot phase.
**Final owner:** Phase 26 - Distribution and release hardening

This file is the final release memory for Vanrot.

Every production phase in `docs/superpowers/feature-maturity.md` must update this inventory when it adds or changes a
package, feature, component, command, convention, helper, example, or generated file. At the end of the production
roadmap, Vanrot comes back to this file and writes complete failing and passing tests for the whole framework before
public distribution.

## Status Values

| Status | Meaning |
|--------|---------|
| Complete | Existing repo infrastructure with no separate user-facing maturity gate. |
| Demo-Capable | Implemented for demo workflows; final release tests must still cover production behavior. |
| Production-Ready | Fully implemented and verified against the production readiness gate. |
| Deferred | Planned for a later production phase. |
| Audit-Needed | Exists, but Phase 12A or later production work must add red/green tests before release. |

## Update Rule

When a phase adds or changes framework surface area:

1. Add or update the matching row in this file.
2. Keep the owning phase or future slice accurate.
3. Describe the final release test expectation, not only the current demo test.
4. Do not remove known gaps until a phase makes them pass through tests.
5. Use this file during Phase 26 to drive the final full-framework TDD pass.

## Repo And Standards

| Area | Item | Current Maturity | Final TDD Expectation | Owner Phase | Notes |
|------|------|------------------|-----------------------|-------------|-------|
| repo | pnpm monorepo workspace | Complete | Fresh clone can install, typecheck, test, build, and verify all packages through root scripts. | Phase 1, Phase 26 | Package manager is `pnpm@11.1.3`. |
| repo | package shells | Complete | Every public package has export checks, typecheck, build, and package metadata coverage. | Phase 1, Phase 26 | Current packages are runtime, compiler, config, vite-plugin, cli, router, ui, and testing. |
| repo | TypeScript shared build posture | Complete | Package references and module settings compile cleanly from root and inside package tests. | Phase 1, Phase 26 | Final pass should include clean-machine verification. |
| repo | `.gitignore` | Complete | Generated outputs, dependencies, caches, and local-only files stay out of source control. | Phase 1, Phase 26 | Keep release artifacts intentional. |
| docs | feature maturity ledger | Production-Ready | Completed phases, maturity rows, presentation state, and plan checklists stay synchronized. | Phase 11 | Source of truth is `docs/superpowers/feature-maturity.md`. |
| docs | phase documentation verifier | Production-Ready | Verifier fails on mismatched completed phases, unchecked plan tasks, stale maturity rows, and presentation drift. | Phase 11 | Implemented by `scripts/verify-phase-docs.mjs`. |
| docs | temporary phase completion hook | Production-Ready | Hook blocks phase-completion commits that omit required tracker, plan, presentation, or inventory updates. | Phase 11, Phase 12A | Phase 12A adds inventory enforcement. |
| docs | final TDD inventory | Audit-Needed | Inventory grows with every phase and becomes the Phase 26 final test checklist. | Phase 12A, Phase 26 | This file is the starting population. |
| docs and web | `apps/vanrot-site` learning surface | Demo-Capable through Phase 16F plus Phase 15E route metadata | Site documents implemented framework surface, supported commands, package references, diagnostics, conventions, examples, UI primitives, route-owned document metadata, and maturity status with drift checks. | Phase 15E, Phase 16C, Phase 16D, Phase 16E, Phase 16F, Phase 24 | Phase 16F adds example-only interaction component docs and `vr ui <component> --help` anatomy reference data; Phase 24 performs the final exhaustive audit. |
| docs and web | `apps/vanrot-site` workspace app | Demo-Capable through Phase 16F plus Phase 15E route metadata | Site builds as a Vanrot app with router, pages, route-owned titles/meta descriptions, October tokens, `vanrotstyles.css`, a Phase 16B primitive gallery, and dedicated docs pages for every current Phase 16B, 16D, 16E, and 16F primitive. | Phase 15E, Phase 16C, Phase 16D, Phase 16E, Phase 16F, Phase 24 | Phase 16F keeps interaction primitives as examples instead of adopting them into the docs shell. |
| docs and web | site docs data registry | Demo-Capable through Phase 16F | Registry covers implemented framework docs, commands, package references, diagnostics, conventions, examples, UI primitives, and maturity status. | Phase 16C, Phase 16D, Phase 16E, Phase 16F, Phase 24 | Component docs now consume rich Phase 16F registry metadata for token, boolean, open-attribute, event, slot, anatomy, example, and docs-path copy. |
| docs and web | `verify:site-docs` | Demo-Capable through Phase 16C | Guard catches missing framework docs, primitive docs, command docs, package references, diagnostic paths, and maturity reference coverage. | Phase 16C, Phase 24 | Runs inside root `pnpm verify` after build. |

## `@vanrot/runtime`

| Area | Item | Current Maturity | Final TDD Expectation | Owner Phase | Notes |
|------|------|------------------|-----------------------|-------------|-------|
| reactive | `signal()` | Production-Ready | Covers reads, writes, equality behavior, subscriber ordering, disposal interaction, and nested graph behavior. | Phase 2, Phase 12B | Required by compiler-generated interpolation and examples. |
| reactive | `computed()` | Production-Ready | Covers lazy caching, chained computed values, invalidation, disposal, and nested dependency changes. | Phase 2, Phase 12B | Must stay small enough for runtime size budget. |
| reactive | `effect()` | Production-Ready | Covers cleanup order, synchronous error behavior, reentrancy, dependency replacement, and disposal idempotence. | Phase 2, Phase 12B | Production hardening covers initial and rerun errors. |
| reactive | `batch()` | Production-Ready | Covers nested batches, flush order, thrown errors, and interaction with computed/effect dependencies. | Phase 2, Phase 12B | Phase 12B verifies nested and thrown-batch behavior. |
| reactive | `untrack()` | Production-Ready | Covers nested effects, computed reads, and non-subscription guarantees. | Phase 2, Phase 12B | Useful for advanced store/form work later. |
| lifecycle | cleanup scopes | Production-Ready | Covers nested scopes, cleanup ordering, repeated dispose, callbacks registered during cleanup, orphan calls, and intentionally unowned internal cleanup work. | Phase 2, Phase 12B, Phase 15D | Internal exports live under `@vanrot/runtime/internal`; Phase 15D added `runWithoutCleanupScope(...)` so router-owned kept-alive views are not destroyed by parent layout scopes. |
| lifecycle | `onMount()` | Production-Ready | Covers callback ordering after mount, cleanup return values, browser-only policy, and repeated flush behavior. | Phase 2, Phase 12B | Future SSR work must revisit this boundary. |
| lifecycle | `onDestroy()` | Production-Ready | Covers multiple callbacks, nested scope behavior, and disposal idempotence. | Phase 2, Phase 12B | Used indirectly by generated listener cleanup. |
| mounting | `mount()` constructor contract | Production-Ready | Covers target validation, component creation scope, DOM insertion/removal, destroy idempotence, and lifecycle order. | Phase 2, Phase 12B | Constructor and compiled-module bridges both need final coverage. |
| mounting | compiled component mount bridge | Production-Ready | Covers Vite-transformed default module shape, returned element cleanup, and generated code integration. | Phase 4, Phase 12B | Must align with TypeScript contracts in 12E. |
| events | internal `listen()` | Production-Ready | Covers listener options, event object passing, cleanup-scope removal, idempotence, and generated event bindings. | Phase 2, Phase 12B | Internal helper, not a public app-author API. |
| forms | `createFormController(...)` | Demo-Capable | Covers field registration, value/dirty/touched/errors, built-in validators, custom validators, reset, submit orchestration, and DOM control connection. | Phase 16E, Phase 21 | Phase 16E keeps the helper small; app code owns persistence and async save behavior. |
| data | `createTableController(...)` | Demo-Capable | Covers sorting, filtering, pagination, selection, loading, empty state, DOM filter wiring, and teardown behavior. | Phase 16E | Useful table state exists without becoming an enterprise grid or query/cache layer. |
| interaction | `createOverlayController(...)` | Demo-Capable | Covers open/close state, trigger/content registration, focus movement, focus restore, escape close, outside pointer close, inside pointer ignore, and disposal. | Phase 16F | Shared by dialog, drawer, and dropdown templates without adding a broad UI manager. |
| interaction | `createTabsController(...)` | Demo-Capable | Covers selected value state, trigger/panel registration, ARIA state, click selection, arrow-key movement, and disposal. | Phase 16F | Keeps tabs interaction reusable while templates own markup. |
| interaction | `createToastController(...)` | Demo-Capable | Covers accessible toast queue state, tone metadata, manual dismiss, timeout dismiss, and timer cleanup. | Phase 16F | App code owns persistence and notification policy. |
| size | runtime size budget | Production-Ready | Runtime stays under target and hard size budgets after production hardening. | Phase 2, Phase 12B, Phase 26 | `pnpm verify:size` owns current check. |

## `@vanrot/compiler`

| Area | Item | Current Maturity | Final TDD Expectation | Owner Phase | Notes |
|------|------|------------------|-----------------------|-------------|-------|
| API | `compileComponent(...)` | Production-Ready | Compiles supported role modules, returns JS/CSS/metadata/diagnostics/mappings, and handles fatal diagnostics predictably. | Phase 3, Phase 12C | Final tests must re-run malformed source and multi-feature production fixture coverage. |
| API | `compileComponentFromFiles(...)` | Production-Ready | Reads sibling files, reports missing file diagnostics, and preserves stable source paths. | Phase 3, Phase 12C | Final tests should include filesystem role triplets before release packaging. |
| file model | `.component.ts/html/css` convention | Production-Ready | Resolves component triplets with diagnostics for missing, duplicate, and mismatched siblings. | Phase 3, Phase 12C | Phase 12C verifies source-rich role diagnostics. |
| file model | `.page.ts/html/css` convention | Production-Ready | Page modules compile through the same contract as components with role-specific diagnostics. | Phase 8, Phase 12C | Router depends on this. |
| file model | `.button.ts/html/css` convention | Production-Ready | UI role modules compile through the same contract without leaking generic component assumptions. | Phase 9, Phase 12C | Used by `vr add button`; broader UI role catalog remains Phase 16. |
| metadata | component class detection | Production-Ready | Covers named export detection, default export diagnostics, constructor validation, and multiple export ambiguity. | Phase 3, Phase 12C | Final tests should keep constructor and export-shape edge cases. |
| template | static element parsing | Production-Ready | Covers nested elements, attributes, comments, unsupported syntax, slot outlets, and stable AST output. | Phase 3, Phase 12C | Parser now supports recursive control flow inside element content. |
| template | text interpolation `{{ }}` | Production-Ready | Covers escaping, nested context, invalid expressions, source locations, and reactive update cleanup. | Phase 3, Phase 12C | Requires runtime `effect()`. |
| template | property binding `[property]` | Production-Ready | Covers boolean properties, attributes vs properties, SVG behavior, invalid targets, and cleanup. | Phase 3, Phase 12C | Phase 12C adds source diagnostics and mapping metadata. |
| template | event binding `(event)` | Production-Ready | Covers event object, arguments/modifiers policy, method diagnostics, and listener cleanup. | Phase 3, Phase 12C | Current production policy supports zero-argument method calls. |
| template | expression rewriting | Production-Ready | Covers allowed globals, member expressions, calls, invalid syntax, no `eval()`, and source locations. | Phase 3, Phase 12C | Must preserve the no-reused-string-literals project rule in examples. |
| router | `<vr-router>` lowering | Demo-Capable | Covers outlet compilation, lazy route swaps, nested future outlets, cleanup, and diagnostics. | Phase 8, Phase 12C, Phase 15 | Production nested routes stay Phase 15. |
| router | `<vr route.name />` lowering | Demo-Capable | Covers route metadata labels, href generation, invalid route refs, and no repeated path strings in templates. | Phase 8, Phase 12C, Phase 15 | Aligns with Vanrot route single-source rule. |
| ui | `<vr-button>` lowering | Demo-Capable | Covers native button output, class passthrough, children, events, properties, accessibility, and unsupported UI tags. | Phase 9, Phase 12C, Phase 16 | Rich UI variants stay Phase 16. |
| ui | Phase 16B `vr-*` primitive lowering | Demo-Capable | Lowers button, card, badge, avatar, alert, loader, skeleton, and separator to native markup with base classes, variant classes, and accessibility defaults. | Phase 16B | Uses `@vanrot/ui` metadata so compiler tag support does not drift from the primitive registry. |
| ui | Phase 16E forms/data primitive lowering | Demo-Capable | Lowers form controls, table anatomy, pagination, list, stat, and empty-state tags with registry-owned token diagnostics, native tags, class precedence, and semantic defaults. | Phase 16E | Dotted token coverage includes size, tone, type, density, marker, align, and pagination variant groups. |
| ui | Phase 16F interaction primitive lowering | Demo-Capable | Lowers dialog, drawer, dropdown, tabs, toast, and their anatomy tags with registry-owned token diagnostics, native tags, class precedence, semantic defaults, and role defaults. | Phase 16F | Dotted token coverage includes size, motion, side, align, orientation, tone, and placement groups. |
| diagnostics | `VR019` invalid UI primitive variant | Demo-Capable | Reports invalid static variants with a stable code, supported variant list, docs hook, and source frame. | Phase 16B | Keeps framework-only `variant` handling explicit while leaving future dynamic variant syntax sliced. |
| ui | Phase 16D dotted token attributes | Demo-Capable | Lowers strict compile-time dotted tokens such as `variant.danger`, `tone.success`, `cols.3`, and `gap.4` to static classes without runtime token parsing. | Phase 16D | Duplicate token groups report `VR020`; unknown finite tokens report `VR021`; platform string attributes such as `type`, `src`, `alt`, and ARIA remain normal. |
| styling | scoped CSS | Production-Ready | Covers selector matrix, `:global` policy, at-rules, source maps, and CSS diagnostics. | Phase 3, Phase 12C | Phase 12C covers scoped selectors, `:host`, `:global(...)`, media rules, unsupported selector diagnostics, and CSS mappings. |
| diagnostics | `VR001` through `VR018` diagnostics | Production-Ready | Every diagnostic has source location, suggestion, docs hook, fixture coverage, and Vite/CLI integration. | Phase 3, Phase 12C | Final release should re-run catalog coverage and Vite/CLI display checks. |
| output | readable generated output | Production-Ready | Generated output stays stable, inspectable, and source-map aligned. | Phase 3, Phase 12C, Phase 14 | Future `vr inspect` owns polished inspection. |
| maps | source maps | Production-Ready | Generated JS and CSS map accurately to template and style files. | Phase 12C | Phase 12C returns source-map-ready mapping metadata; final packaging should verify emitted map files. |
| control flow | `@if` | Production-Ready | Conditional DOM handles nested cleanup, diagnostics, source maps, and integration tests. | Phase 12C | Final tests should include nested conditionals, destroy cleanup, and else transitions. |
| control flow | `@for` | Production-Ready | List rendering handles keys, cleanup, nested blocks, diagnostics, and integration tests. | Phase 12C | Final tests should include reorder, removal, empty states, and nested projected content. |
| composition | child components | Production-Ready | Parent/child component boundaries cover props, lifecycle, cleanup, diagnostics, and generated typing. | Phase 12C | Phase 12C covers child input handoff, invalid input diagnostics, dependency metadata, and projection fragments; 12E owns generated typing. |
| composition | slots | Production-Ready | Static and named slots cover fallback content, scope rules, diagnostics, and tests. | Phase 12C | Phase 12C covers `<slot>`, `<slot.name>`, `slot.name`, fallback, projection grouping, and production fixture coverage. |

## `@vanrot/config`

| Area | Item | Current Maturity | Final TDD Expectation | Owner Phase | Notes |
|------|------|------------------|-----------------------|-------------|-------|
| API | `defineVanrotConfig(...)` | Production-Ready | Helper preserves typed config authoring and supports canonical root config pattern. | Phase 13 | Generated apps use helper-based default export pattern. |
| defaults | `normalizeVanrotConfig(...)` | Production-Ready | Required domains default to `source.root='src'` and `devServer.port=1010` while preserving explicit values. | Phase 13 | Shared by CLI and Vite plugin. |
| validation | `validateVanrotConfig(...)` | Production-Ready | Unknown keys and invalid semantic states emit stable diagnostics with actionable suggestions. | Phase 13, Phase 15E | Diagnostic codes now include router navigation polish validation through `VRCFG010`. |
| router config | `router.navigationPolish` | Production-Ready | Normalizes title, meta, scroll, and focus booleans and injects them into router runtime behavior through Vite. | Phase 15E | Defaults keep navigation polish enabled; apps can disable each behavior in `vanrot.config.ts`. |
| router diagnostics config | `router.diagnostics` | Production-Ready | Normalizes missing title/meta description levels and validates `off`, `warn`, and `error`. | Phase 15E | Missing title defaults to `warn`; missing meta description defaults to `off`. |
| loading | `loadVanrotProjectConfig(...)` | Production-Ready | Loader discovers root config, normalizes defaults, reports migration warnings, and hard-fails on parse/load errors. | Phase 13 | Missing config remains runnable with defaults + warning. |
| migrations | `migrateVanrotConfig(...)` | Production-Ready | Migration writes canonical config and supports guarded/destructive overwrite modes. | Phase 13 | Used by `vr config migrate`. |
| recovery | `recoverVanrotConfig(...)` | Production-Ready | Recovery rebuilds config without Git and reports ambiguity diagnostics for manual review. | Phase 13 | Infers optional domains from detected dependencies. |
| editor | install-aware config editor | Production-Ready | Upsert/remove helpers preserve user ownership and remain idempotent for repeated installer operations. | Phase 13 | `vr add button` uses shared editor helpers. |

## `@vanrot/vite-plugin`

| Area | Item | Current Maturity | Final TDD Expectation | Owner Phase | Notes |
|------|------|------------------|-----------------------|-------------|-------|
| API | `vanrot()` default plugin export | Production-Ready | Plugin works in dev/build, has typed options, peer dependency behavior, and examples. | Phase 4, Phase 12D | Named `vanrotPlugin` alias also exists. |
| options | include/exclude normalization | Production-Ready | Options cover `.component.ts`, `.page.ts`, `.button.ts`, custom patterns, and invalid options. | Phase 4, Phase 12D | Phase 12D production-tests current defaults; Phase 13 owns config-driven convention expansion. |
| transform | component TS transform | Production-Ready | Vite transforms supported role modules consistently in dev and production build. | Phase 4, Phase 12D | Aligns with compiler source-map metadata. |
| virtual modules | virtual source module | Production-Ready | Prevents recursive transforms, preserves source imports, and handles encoded paths cross-platform. | Phase 4, Phase 12D | Needed for transformed component class imports. |
| virtual modules | virtual CSS module | Production-Ready | CSS loads in dev, extracts in build, invalidates correctly, and maps back to owner file. | Phase 4, Phase 12D | Build fixture emits CSS and sourcemaps. |
| diagnostics | Vite diagnostics bridge | Production-Ready | Compiler diagnostics surface as Vite errors/warnings with code frames, suggestions, docs links, and source positions. | Phase 4, Phase 12D | Phase 12D keeps this text-based; overlay metadata remains out of scope. |
| config bridge | router navigation polish define | Production-Ready | Vite injects normalized router polish config into the router package so app authors can use `vanrot.config.ts` without manual runtime imports. | Phase 15E | Uses `__VANROT_ROUTER_NAVIGATION_POLISH__` as a compile-time define. |
| dev server | sibling file watching | Production-Ready | TS/HTML/CSS changes invalidate the right module without stale output. | Phase 4, Phase 12D | Owner-module HMR covers sibling edits. |
| dev server | full reload fallback | Production-Ready | Full reload remains correct as a fallback but does not hide missing true HMR. | Phase 4, Phase 12D | Full reload is only the missing-owner fallback. |
| dev server | true state-preserving HMR | Production-Ready | HTML/CSS updates preserve state where safe and clean up invalidated generated effects. | Phase 12D | Phase 12D returns owner modules to Vite; generated accept/dispose remains future hardening if needed. |
| build | production build fixture | Production-Ready | Build emits correct JS/CSS assets, sourcemaps where configured, and works from a clean fixture install. | Phase 4, Phase 12D, Phase 26 | Phase 12D adds clean app-style package-output fixture coverage; Phase 26 owns final release install. |
| typing | transformed component imports | Production-Ready | App authors can import compiled `.component.ts`, `.page.ts`, and `.button.ts` modules without `@ts-expect-error`. | Phase 12E | Named Vite exports, router `ComponentType` page contracts, examples, UI button tests, and CLI generated files are covered. |

## `@vanrot/cli`

| Area | Item | Current Maturity | Final TDD Expectation | Owner Phase | Notes |
|------|------|------------------|-----------------------|-------------|-------|
| binary | `vr` command entry | Demo-Capable | Installed binary runs on supported platforms, handles help/errors, global output flags, and exits with correct codes. | Phase 5, Phase 14, Phase 26 | Phase 14 adds grouped root help, descriptions, examples, structured-output parsing, and unsupported-mode diagnostics. |
| command | `vr create <name>` | Demo-Capable | Creates a routed Vanrot app, handles package managers, overwrite policy, workspace mode, and clean install. | Phase 5, Phase 14, Phase 26 | Generated app includes router by default. |
| command | `vr generate component <name>` | Demo-Capable | Generates role-based component files with naming, feature folders, collision handling, and optional tests later. | Phase 5, Phase 18 | Alias `vr g` exists. |
| command | `vr generate page <name>` | Demo-Capable | Generates page role files and later integrates with routes safely. | Phase 5, Phase 15, Phase 18 | Router integration is future production work. |
| command | `vr add <primitive>` | Demo-Capable through Phase 16F | Adds app-owned files for every current primitive without overwriting user files. | Phase 9, Phase 16B, Phase 16D, Phase 16E, Phase 16F | Respects tokens, `ui.styles`, starter usage patching, registry-driven supported primitive output, and kebab file names for multi-word primitives. |
| command | `vr add <local-prefix> <primitive>` | Demo-Capable through Phase 16F | Adds locally prefixed files such as `profile.avatar.*`, `primary.form-field.*`, and `account.dropdown.*` with correct imports and style entry wiring. | Phase 9, Phase 16B, Phase 16E, Phase 16F | Keeps user naming flexible while the primitive role segment remains stable. |
| command | `vr ui <component> --help` | Demo-Capable through Phase 16F | Lists registry-backed UI components and prints selector, native tag, docs path, dotted tokens, booleans, open attributes, events, slots, anatomy, and examples. | Phase 16E, Phase 16F | Consumes `@vanrot/ui` rich registry metadata instead of duplicating component help strings. |
| command | `vr add button --test` | Demo-Capable | Adds colocated `.button.test.ts` only when requested and keeps no-test default clean. | Phase 10, Phase 18 | Test generation stays opt-in. |
| command | `vr config migrate` / `vr config recover` | Production-Ready | Config maintenance commands create or recover canonical root config with migration/recovery diagnostics. | Phase 13 | Includes `vr config migrate --recover` alias and guarded overwrite flags. |
| command | `vr doctor` | Demo-Capable | Reports project health, Vanrot rule violations, missing scripts, raw template text, nested control-flow warnings, stable one-line findings, and structured result output. | Phase 5, Phase 14 | Production doctor still needs broader diagnostics, code frames, and docs links. |
| command | `vr map` | Demo-Capable | Writes `.vanrot/project-map.json` with stable role-file and i18n hints. | Phase 7, Phase 23 | Production graphing is future work. |
| command | `vr init-ai` | Demo-Capable | Writes `.vanrot/ai-rules.md`, `.vanrot/ai/context.json`, `.vanrot/ai/doctor.json`, `.vanrot/ai/prompt.md`, and gitignores `.vanrot/ai/`. | Phase 7, Phase 14, Phase 25 | Future AI provider execution remains Phase 25. |
| command | `vr ai context` / `doctor` / `prompt` / `record` / `summarize` | Demo-Capable | Writes provider-neutral AI doorway files, records error history JSONL, summarizes unresolved entries first, and respects `ai.enabled: false`. | Phase 14, Phase 25 | Deterministic local files only; no provider calls. |
| command | `vr dev` | Demo-Capable | Wraps Vite dev server with beautiful output, lifecycle handling, config loading, and localhost experience. | Phase 5, Phase 14 | Current wrapper is thin. |
| command | `vr build` | Demo-Capable | Wraps Vite build with readable reports, failure summaries, and config integration. | Phase 5, Phase 14 | Current wrapper delegates to `vite build`. |
| command | `vr test` | Demo-Capable | Wraps Vitest with readable output and future framework-aware test presets. | Phase 5, Phase 14, Phase 18 | Current wrapper delegates to `vitest run`. |
| command | `vr inspect` | Deferred | Shows generated component output with source-map aligned explanation. | Phase 14 | Tracked in feature maturity. |
| command | `vr cache clear` | Deferred | Safely clears Vanrot-owned caches with dry-run/list modes and doctor integration. | Phase 14 | Requested as Angular-like cache clean. |
| reporter | memory and console reporters | Production-Ready | CLI output is scriptable, testable, beautiful, and consistent across commands. | Phase 5, Phase 14 | Phase 14 verifies padded labels, continuation indentation, stable headings, and next-step output. |
| diagnostics | CLI diagnostic catalog | Demo-Capable | CLI-owned diagnostics keep stable codes for unknown commands, structured-output failures, command failures, and AI doorway errors. | Phase 14, Phase 26 | Final release should expand code coverage as more CLI commands become production-ready. |
| output | structured `--json` / `--jsonl` modes | Demo-Capable | Supported read commands can emit deterministic final JSON/JSONL events and unsupported write commands fail with precise guidance. | Phase 14, Phase 26 | Current support covers the first result-event contract and global mode parser. |
| runner | process runner | Demo-Capable | Command wrappers run local binaries cross-platform with safe env/path behavior. | Phase 5, Phase 14 | Current tests cover local `node_modules/.bin`. |
| generated app | starter scripts | Demo-Capable | Generated `package.json` scripts stay synchronized from command metadata. | Phase 5, Phase 13 | Avoid reused command string literals. |
| generated app | root `vanrot.config.ts` | Production-Ready | Generated app root includes canonical `vanrot.config.ts` and stays compatible with shared loader/validator/migration contracts. | Phase 13 | Default config contains schema version, `source.root`, and `devServer.port`. |
| generated app | starter router app | Demo-Capable | App includes `src/routes.ts`, `<vr-router>`, named route links, page files, and no repeated route strings. | Phase 8, Phase 15 | Production config moves to Phase 13. |
| generated app | starter UI tokens | Demo-Capable | Starter includes tokens without generating button source until requested. | Phase 9, Phase 16 | Keeps app clean by default. |

## `@vanrot/router`

| Area | Item | Current Maturity | Final TDD Expectation | Owner Phase | Notes |
|------|------|------------------|-----------------------|-------------|-------|
| route config | `defineRoutes(...)` | Production-Ready through 15E navigation polish | Provides a typed route table with path, label, optional title/meta description, page/loadPage, route refs, parent normalization, redirects, guards, preload policies, keepAlive policies, and diagnostics. | Phase 8, Phase 15A, Phase 15C, Phase 15D, Phase 15E | Route config remains the single source of truth for routing behavior, document metadata, and route performance policy. |
| route config | `createRoutes()` | Production-Ready | Authors route refs without parent-name string literals, supports child `.page(...)`, `.layout(...)`, and `.redirect(...)` builders, keeps page/layout/redirect targets separate at the TypeScript boundary, exposes `redirectTo(...)`, and owns `routes.preload.*` / `routes.keepAlive.*` policy helpers. | Phase 15A, Phase 15B, Phase 15C, Phase 15D | Object-form `defineRoutes(...)` remains compatible. |
| matching | `matchRoute(...)` | Production-Ready for 15E route contracts | Covers root, missing, query strings, encoded params, hash-safe matching, and deterministic matching order. | Phase 8, Phase 15A, Phase 15E | Nested route chains and redirect leaves are covered by `matchRouteChain(...)`; hash fragments do not break route matching. |
| loading | `resolveRoutePage(...)` / `resolveRouteLayout(...)` | Production-Ready | Handles eager pages/layouts, lazy modules, default exports, failures, successful lazy module caching, and retry-after-failure behavior. | Phase 8, Phase 15D | Shared by route rendering and route-chain preloading. |
| state | `provideRouter(...)` | Production-Ready through 15E navigation polish | Sets route table, current match, route params, cleanup, initial redirect handling, guarded initial navigation, document metadata, route definition versioning, and reset cleanup for preload/keepAlive/navigation polish state. | Phase 8, Phase 15C, Phase 15D, Phase 15E | Returns `Promise<boolean>` so async guard decisions can complete without a broad router event API. |
| state | `navigate(...)` | Production-Ready through 15E navigation polish | Handles path updates, history behavior, params, query strings, hash fragments, invalid route behavior, redirects, blocking guards, stale async navigation protection, document metadata, scroll polish, and blocked keepAlive restore diagnostics. | Phase 8, Phase 15A, Phase 15C, Phase 15D, Phase 15E | Guard/redirect navigation policy now runs through the shared decision pipeline before document metadata, scroll, focus, or kept-alive view restore applies. |
| state | `routeParams` | Production-Ready for 15A route contracts | Exposes params through signals and updates predictably across navigation. | Phase 8, Phase 15A | Works with signal-first design. |
| state | `buildRouteBreadcrumbs(...)` | Production-Ready | Builds breadcrumb labels and hrefs from route object refs and the shared URL builder. | Phase 15A | Dynamic entity labels stay deferred. |
| DOM | `<vr-router>` outlet | Production-Ready through 15E navigation polish | Renders route pages, swaps lazy pages, handles cleanup, nested outlets, error outlets, same-day kept-alive route view detach/restore, router-managed internal anchor clicks, accessible focus after mount, and atomic async route swaps that keep the current view visible until the next view resolves. | Phase 8, Phase 15B, Phase 15D, Phase 15E | Nested outlets, routed internal anchors, kept-alive leaf views, and lazy focus timing are covered under realistic layout transitions. |
| DOM | `<vr route.name />` link | Production-Ready through 15D preloading and keepAlive integration | Renders accessible anchors from route metadata without repeated path or label strings, routes normal clicks through guarded navigation, and preloads lazy route chains on hover/focus/touch intent. | Phase 8, Phase 15A, Phase 15C, Phase 15D | Params, query, exact active state, guard/redirect behavior, and intent preloading are covered; router-managed same-origin anchors inside outlets share the same intent preload and guarded navigation pipeline. |
| diagnostics | route diagnostics foundation | Production-Ready | Provides shared `VR_ROUTE_*` codes, diagnostic factory, route-level diagnostics, param/query misuse errors, preload policy warnings, preload failures, keepAlive diagnostics, and title/meta diagnostics. | Phase 15A, Phase 15D, Phase 15E | CLI/project-map diagnostics stay in a later router diagnostics slice. |
| router | nested layout routes | Production-Ready | Root layouts, child layouts, index child pages, params, query values, shared-layout retention, cleanup, lazy child page loading, and diagnostics are covered. | Phase 15B | Depends on Phase 15A route contract. |
| router | route registry order | Production-Ready | `defineRoutes({ ... })` order is canonical for rendering, parent `children` arrays, generated navigation, diagnostics, and docs examples. Child-before-parent route order fails with a stable diagnostic. | Phase 15B | No route-name string parent references. |
| router | `matchRouteChain(...)` | Production-Ready | Resolves active root layout, nested layout, leaf page, and redirect chains while preserving leaf `matchRoute(...)` compatibility. | Phase 15B, Phase 15C | Index child pages and redirects use `path: ''`. |
| router | `getCurrentRouteChain()` | Production-Ready | Router state exposes the active matched chain while preserving `getCurrentMatch()`, `navigate(...)`, `routeParams`, and breadcrumb behavior. | Phase 15B | Params and query remain leaf-facing. |
| DOM | nested router outlets | Production-Ready | One app-level router outlet renders depth 0 and route-local outlets render the next matched depth with branch cleanup and shared-layout retention. | Phase 15B | Eager layouts/pages mount synchronously; lazy pages load only when active. |
| compiler | router and outlet placement | Production-Ready | `<vr-router />` is allowed only once in `app.layout.html`; `<vr-outlet />` is required exactly once in route layout templates and rejected in page templates. | Phase 15B | Compiler diagnostics expose source positions. |
| compiler and vite-plugin | `.layout.ts` role files | Production-Ready | Layout role files resolve sibling `.layout.html` and `.layout.css` files, participate in Vite transform/HMR, and compile through the normal component pipeline. | Phase 15B | Required by the nested router starter. |
| cli | nested router starter | Production-Ready | Generated starter uses `app.layout.*`, route layout examples, route-owned nav metadata, and no repeated route path or label literals outside `src/routes.ts`. | Phase 15B | Keeps the framework rule visible in new apps. |
| router | navigation decisions | Production-Ready | Runs redirect routes and `canEnter` guards through one decision pipeline for initial load, programmatic navigation, browser back/forward, and route-link clicks. | Phase 15C | Guards run parent-to-child and left-to-right; stale async results are ignored. |
| router | redirect routes | Production-Ready | Supports root and child redirect routes, structured params/query redirect targets, redirect route diagnostics, and redirect loop detection. | Phase 15C | Redirects use route refs and `routes.redirectTo(...)`, not manual URL strings. |
| diagnostics | navigation route diagnostics | Production-Ready | Reports duplicate full paths, invalid redirect shapes, missing redirect targets, redirect loops, invalid guards, invalid guard results, missing guard redirect targets, and guard redirect loops with stable codes. | Phase 15C | Built on the Phase 15A diagnostic foundation. |
| router | route preloading | Production-Ready | Preloads lazy layout/page chains from route-owned `routes.preload.intent()` policy on generated link hover, focus, and touch intent without guards, redirects, history writes, route commits, mounts, or keepAlive entries. | Phase 15D | Uses the shared lazy module cache and records `VR_ROUTE_PRELOAD_FAILED` diagnostics while allowing later navigation retry. |
| router | keepAlive route views | Production-Ready | Preserves route-local DOM/component state in memory for same-day navigation through `routes.keepAlive.sessionDay()`, restores only after current guards allow navigation, expires on local day rollover, and clears on router reset. | Phase 15D | Keeps API/data caching out of router; Phase 21 owns broader data cache policy. |
| router | navigation polish | Production-Ready | Updates route-owned document title/meta after successful navigation, scrolls normal navigation to top, restores back/forward scroll, preserves hash behavior, and focuses the mounted route view. | Phase 15E | All behavior is configurable through `vanrot.config.ts` and reset in router tests. |

### Phase 15D Router Preloading And KeepAlive Integration

- Package: `@vanrot/router`
- Public route policy helpers: `routes.preload.none()`, `routes.preload.intent()`, `routes.keepAlive.none()`, `routes.keepAlive.sessionDay()`
- Internal helpers: lazy module cache in `page-loader.ts`, route-chain preloading in `route-preload.ts`, route view identity/store in `route-keep-alive.ts`
- Generated link behavior: hover, focus, and touch intent preload lazy route chains without committing navigation
- Outlet behavior: `keepAlive.sessionDay()` detaches and restores same-day route views after guards allow navigation
- Diagnostics: redirect preload policy, redirect keepAlive policy, preload without lazy target, preload failure, keepAlive identity missing, keepAlive restore blocked
- Verification: focused route tests, jsdom link/outlet tests, full Phase 15D router integration test, router typecheck, and full `pnpm verify`

### Phase 15E Router Navigation Polish

- Package: `@vanrot/router`, `@vanrot/config`, `@vanrot/vite-plugin`, `apps/vanrot-site`
- Public route metadata: optional `title` and `meta.description` on route definitions
- Config: `router.navigationPolish.title/meta/scroll/focus` and `router.diagnostics.missingTitle/missingMetaDescription`
- Vite bridge: normalized router polish config is injected for runtime use without app-authored config imports
- Runtime behavior: document title/meta updates after successful navigation; normal navigation scrolls to top; browser back/forward restores previous scroll; hash-only navigation remains native; route outlet focuses the mounted view or first heading
- Diagnostics: missing title, missing meta description, invalid title, and invalid meta description route diagnostics
- Site dogfood: `apps/vanrot-site/src/routes.ts` owns document metadata for site routes and component docs routes
- Verification: config tests, Vite plugin config tests, router metadata/document/scroll/focus tests, router typecheck, site tests/typecheck, phase docs, and full `pnpm verify`

### Phase 16F October Interaction Foundation

- Packages: `@vanrot/runtime`, `@vanrot/ui`, `@vanrot/compiler`, `@vanrot/cli`, `apps/vanrot-site`
- Public runtime helpers: `createOverlayController(...)`, `createTabsController(...)`, `createToastController(...)`
- UI primitives: dialog, drawer, dropdown, tabs, and toast
- Registry metadata: selector, native tag, docs path, file-backed assets, dotted tokens, booleans, open attributes, events, slots, examples, accessibility notes, and anatomy entries
- Compiler behavior: root and anatomy `vr-*` tags lower to native markup with registry-owned classes, semantic defaults, and `VR020`/`VR021` dotted token diagnostics
- CLI behavior: `vr add` copies all five interaction primitive templates; `vr ui <component> --help` prints anatomy alongside tokens, events, slots, examples, and docs paths
- Site docs: `/docs/components/dialogs`, `/docs/components/drawers`, `/docs/components/dropdowns`, `/docs/components/tabs`, and `/docs/components/toasts` are example-only docs pages, not docs-shell dogfooding
- Verification: runtime, UI, compiler, CLI, and site focused tests/typechecks; phase docs; full `pnpm verify`

## `@vanrot/ui`

| Area | Item | Current Maturity | Final TDD Expectation | Owner Phase | Notes |
|------|------|------------------|-----------------------|-------------|-------|
| package | UI package foundation | Demo-Capable | Package exports metadata, assets, primitives, docs hooks, and remains tree-shakeable. | Phase 9, Phase 16 | First UI surface is the button primitive. |
| metadata | default UI prefix | Demo-Capable | Prefix rules support default `ui` and user-chosen local prefixes consistently. | Phase 9, Phase 16 | File prefix can vary; component type stays central. |
| metadata | primitive registry metadata | Demo-Capable through Phase 16F | Registry lists supported primitives, generated file names, asset URLs, token groups, native tags, docs paths, anatomy, and future flavors. | Phase 9, Phase 16B, Phase 16D, Phase 16E, Phase 16F | Phase 16F adds rich registry metadata for interaction anatomy, tokens, booleans, open attributes, events, slots, examples, accessibility notes, and CLI/docs paths. |
| assets | `vanrot-tokens.css` | Production-Ready for Phase 16A foundation | Tokens support October dark/light themes, Geist text hooks, JetBrains Mono numeric hooks, utility interop, theming policy, docs examples, and future visual QA. | Phase 9, Phase 16A | Full component integration and visual QA remain Phase 16B-16E. |
| primitive | Phase 16B core primitive source templates | Demo-Capable | Each core primitive ships TS, HTML, CSS, usage, and optional test templates with scoped CSS variants. | Phase 16B | Source files stay app-owned after `vr add`; layout, forms, data, and overlays remain later slices. |
| compiler | Phase 16B primitive variants and accessibility defaults | Demo-Capable | Native output preserves class passthrough, strips framework-only `variant`, adds valid variant classes, and handles loader/skeleton/separator defaults. | Phase 16B | Invalid variants report `VR019`; dynamic variant syntax remains future work. |
| primitive | Phase 16D layout/navigation/media primitive source templates | Demo-Capable | Each 16D primitive ships TS, HTML, CSS, usage, file-backed asset URLs, metadata, docs data, routes, and site pages. | Phase 16D | Covers layout, container, section, grid, header, footer, sidebar, nav, breadcrumb, image, and source. |
| primitive | Phase 16E forms/data primitive source templates | Demo-Capable | Each 16E primitive ships TS, HTML, CSS, usage, file-backed asset URLs, metadata, rich registry data, docs data, routes, and site pages. | Phase 16E | Covers form, form-field, label, input, textarea, select, checkbox, radio-group, radio, switch, slider, table anatomy, pagination, list, list-item, stat, and empty-state. |
| primitive | Phase 16F interaction primitive source templates | Demo-Capable | Each 16F primitive ships TS, HTML, CSS, usage, optional test templates, file-backed asset URLs, metadata, anatomy, rich registry data, docs data, routes, and site pages. | Phase 16F | Covers dialog, drawer, dropdown, tabs, and toast. |
| CLI | generated `src/ui/<primitive>/<prefix>.<primitive>.*` | Demo-Capable through Phase 16F | Generator handles default and local prefixes, collision safety, tokens, usage patching, style modes, and optional tests for every current primitive. | Phase 9, Phase 16B, Phase 16E, Phase 16F, Phase 18 | Multi-word primitives use kebab file names such as `ui.form-field.ts` and `primary.empty-state.css`; interaction primitives use the same registry path. |
| package | `@vanrot/ui` October inventory | Production-Ready for Phase 16A foundation | Package exports October metadata, package inventory docs, guidelines, tokens, `vanrotstyles.css`, and asset URLs. | Phase 16A | Component catalog implementation remains Phase 16B-16E. |
| asset | `vanrotstyles.css` | Production-Ready for Phase 16A foundation | Unprefixed utility classes cover display, flex, grid, spacing, sizing, typography, surfaces, borders, radius, shadows, motion, overflow, z-index, and accessibility helpers. | Phase 16A | Teams can disable usage through config style mode. |
| config | `ui.styles` | Production-Ready for Phase 16A foundation | `vanrot.config.ts` normalizes and validates `vanrotstyles`, `tailwind`, and `none` style modes. | Phase 16A | CLI create/add respects the style mode. |
| compiler | October UI tag diagnostics | Production-Ready through Phase 16F | Supported `vr-*` primitives lower through metadata and unsupported `vr-*` UI tags use October diagnostics. | Phase 16A, Phase 16B, Phase 16D, Phase 16E, Phase 16F | Interaction roots and anatomy tags are now compiler-known; popover, tooltip, and command menu remain Phase 16G decisions. |
| flavor | October UI | In Progress through Phase 16F | Production primitive catalog, variants, accessibility, tokens, docs, dotted tokens, interaction controllers, and visual QA. | Phase 16 | Phase 16F adds dialog, drawer, dropdown, tabs, toast, and runtime interaction helpers; 16G owns final October polish and visual QA. |
| flavor | Future brutalist UI | Deferred | Brutalist flavor keeps parity with October contracts and passes visual QA. | Phase 17 | Future flavor work. |

## `@vanrot/testing`

| Area | Item | Current Maturity | Final TDD Expectation | Owner Phase | Notes |
|------|------|------------------|-----------------------|-------------|-------|
| API | `testComponent(...)` | Demo-Capable | Mounts components with readable syntax, cleanup safety, async handling, and diagnostics. | Phase 10, Phase 18 | Wraps Vitest while hiding `it(...)` from generated examples. |
| API | `runComponentTest(...)` | Demo-Capable | Supports direct test execution, cleanup on failure, and richer setup options. | Phase 10, Phase 18 | Internal helper exposed today. |
| screen | `screen.expect.text(...)` | Demo-Capable | Covers text visibility, multiple matches, useful failures, and accessibility-aware queries. | Phase 10, Phase 18 | Current assertion is narrow. |
| screen | `screen.click.button(...)` | Demo-Capable | Clicks by accessible label, handles disabled buttons, async updates, and useful failures. | Phase 10, Phase 18 | Needed by generated button tests. |
| generator | `.button.test.ts` opt-in | Demo-Capable | `vr add button --test` produces readable tests that compile in generated apps. | Phase 10, Phase 18 | No default test file unless requested. |
| syntax | generated tests use `function` | Demo-Capable | All generated tests use readable English-first style and avoid confusing shorthand. | Phase 10, Phase 18 | Aligns with user's readability preference. |
| API | `testPage(...)` | Deferred | Tests route pages with router setup, params, navigation, lazy pages, and cleanup. | Phase 18 | Deferred from Phase 10. |
| API | accessibility assertions | Deferred | Provides readable checks for common accessibility expectations. | Phase 18 | Final UI/router tests will need this. |
| API | async and fake timer helpers | Deferred | Tests timers, promises, resources, and cancellation without unreadable syntax. | Phase 18 | Important for forms/resources/store. |

## Examples And Fixtures

| Area | Item | Current Maturity | Final TDD Expectation | Owner Phase | Notes |
|------|------|------------------|-----------------------|-------------|-------|
| example | `examples/counter` | Demo-Capable | Fresh install/build/test flow proves runtime, compiler, Vite, CLI, router, UI, and testing integration. | Phase 6, Phase 26 | Counter is the main demo app. |
| fixture | Vite plugin basic app | Demo-Capable | Fixture validates plugin dev/build behavior with routes, pages, UI assets, and compiled role modules. | Phase 4, Phase 12D | Final install should not depend on unpublished registry packages. |
| fixture | Vite plugin clean app | Production-Ready | Fixture validates package-output Vite builds with emitted JavaScript, CSS, and sourcemaps. | Phase 12D, Phase 26 | Phase 12D uses temporary workspace-style package links; Phase 26 owns clean install matrix coverage. |
| fixture | compiler counter fixture | Demo-Capable | Compiler fixture covers source/template/style triplets and generated output snapshots. | Phase 3, Phase 12C | Extend for control flow and child components. |
| generated convention | route source file `src/routes.ts` | Demo-Capable | Routes keep paths, labels, and page/loadPage references in one source of truth. | Phase 8, Phase 15 | Avoid reused route string literals in pages/templates. |
| generated convention | component role files | Demo-Capable | Component source, template, and scoped CSS remain separate with role-based suffixes. | Phase 5, Phase 12C | `*.component.ts/html/css`. |
| generated convention | page role files | Demo-Capable | Page source, template, and scoped CSS remain separate with role-based suffixes. | Phase 5, Phase 8, Phase 15 | `*.page.ts/html/css`. |
| generated convention | UI primitive role files | Demo-Capable through Phase 16F | UI source, template, and scoped CSS use prefix-first file names across the current primitive catalog. | Phase 9, Phase 16B, Phase 16D, Phase 16E, Phase 16F | `ui.button.ts/html/css`, `profile.avatar.ts/html/css`, `primary.form-field.html`, `account.dropdown.css`, and equivalent primitive role triplets. |
| generated convention | no application logic in HTML | Audit-Needed | Generated and documented templates keep logic in TypeScript and markup in HTML. | Phase 5, Phase 14, Phase 26 | Must be enforced broadly before release. |
| generated convention | no UI markup in TypeScript | Audit-Needed | Generated and documented TS files avoid embedded UI markup. | Phase 5, Phase 14, Phase 26 | Compiler-generated code is an internal exception. |
| generated convention | scoped CSS | Demo-Capable | Component/page/UI CSS remains colocated and scoped by compiler behavior. | Phase 3, Phase 12C | Needs final selector/source-map tests. |
| generated convention | no reused string literals | Audit-Needed | Routes, commands, diagnostics, generated copy, and file suffixes centralize shared values. | Phase 8, Phase 13, Phase 26 | Existing touched code should keep improving toward this rule. |

## Final Release TDD Backlog Anchors

These are the first high-priority red/green anchors for the final release pass. Phase 12A starts by turning core anchors
into isolated audit tests.

| Anchor | Package Or Area | Current State | Final TDD Requirement | Owner Phase |
|--------|-----------------|---------------|-----------------------|-------------|
| Runtime edge cases | runtime | Production runtime coverage exists | Red/green tests for nested cleanup, effect errors, batch nesting, disposal idempotence, and lifecycle ordering. | Phase 12B |
| Compiler source locations | compiler | Production coverage exists | Red/green tests for accurate template/style/source locations, code-frame inputs, and JS/CSS mapping metadata. | Phase 12C |
| Compiler production diagnostics | compiler, cli, vite-plugin | Compiler catalog coverage exists | Red/green tests for suggestions, docs links, recoverable warnings, Vite bridge, and CLI display. | Phase 12C, Phase 14 |
| Compiler control flow | compiler | Production coverage exists | Red/green tests for `@if`, `@for`, cleanup, diagnostics, generated output, and nested element content. | Phase 12C |
| Component composition | compiler, runtime | Production compiler coverage exists | Red/green tests for child components, lifecycle boundaries, props, slots, and projected content. | Phase 12C |
| Vite true HMR | vite-plugin | Full reload fallback | Red/green tests for HTML/CSS updates that preserve safe state and invalidate unsafe modules. | Phase 12D |
| TypeScript import boundary | compiler, vite-plugin | Production coverage exists | Red/green tests proving app authors can import transformed role modules cleanly. | Phase 12E |
| Config source of truth | config, cli, vite-plugin | Deferred | Red/green tests for `vanrot.config.ts`, schema validation, install-aware config blocks, and port `1010`. | Phase 13 |
| Beautiful CLI UX | cli | Demo reporter exists | Red/green snapshot/interaction tests for command output that is beautiful, readable, and scriptable. | Phase 14 |
| Router production 15A | router, compiler | Route contract production slice works | Red/green tests for builder refs, typed params, query strings, URL generation, exact active links, breadcrumb metadata helpers, compiler route-link lowering, and route diagnostics. | Phase 15A |
| Router production 15D | router, runtime | Preloading and keepAlive integration complete | Red/green tests for route policy helpers, redirect policy diagnostics, lazy module caching, intent link preloading, route-chain preload side effects, keepAlive identity/store, outlet detach/restore, nested layout compatibility, and full router integration workflows. | Phase 15D |
| UI October production | ui, compiler, cli | October foundation works | Red/green tests for package inventory, tokens, utilities, config style modes, primitive catalog, variants, accessibility, and approved flavor parity. | Phase 16, Phase 17 |
| Testing production | testing | Component helper demo works | Red/green tests for pages, router workflows, accessibility, async helpers, and generator-wide `--test`. | Phase 18 |
| Store | store | Deferred | Red/green tests for signal-native state, actions, reducers, selectors, effects, tracing, and interop. | Phase 19, Phase 20 |
| Forms and async resources | forms, async | Deferred | Red/green tests for field metadata, validation, resource cancellation, cache policy, and loading/error conventions. | Phase 21 |
| SSR and hydration | ssr, runtime, router | Deferred | Red/green tests for SSR-safe APIs, rendering, hydration, mismatch diagnostics, and routing integration. | Phase 22 |
| Devtools and AI intelligence | devtools, cli, docs | Project map demo works | Red/green tests for route/component graphs, runtime graph metadata, MCP/Skill.sh manifests, and AI rules. | Phase 23, Phase 25 |
| Docs and web presence | docs, web | Deferred | Completeness tests prove every package, command, convention, feature, and limitation is documented. | Phase 24 |
| Distribution | distribution | Deferred | Clean-machine install matrix, package provenance, npm publish dry runs, Homebrew formula, and release checks pass. | Phase 26 |
