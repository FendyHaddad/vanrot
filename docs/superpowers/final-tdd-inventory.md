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

## `@vanrot/runtime`

| Area | Item | Current Maturity | Final TDD Expectation | Owner Phase | Notes |
|------|------|------------------|-----------------------|-------------|-------|
| reactive | `signal()` | Production-Ready | Covers reads, writes, equality behavior, subscriber ordering, disposal interaction, and nested graph behavior. | Phase 2, Phase 12B | Required by compiler-generated interpolation and examples. |
| reactive | `computed()` | Production-Ready | Covers lazy caching, chained computed values, invalidation, disposal, and nested dependency changes. | Phase 2, Phase 12B | Must stay small enough for runtime size budget. |
| reactive | `effect()` | Production-Ready | Covers cleanup order, synchronous error behavior, reentrancy, dependency replacement, and disposal idempotence. | Phase 2, Phase 12B | Production hardening covers initial and rerun errors. |
| reactive | `batch()` | Production-Ready | Covers nested batches, flush order, thrown errors, and interaction with computed/effect dependencies. | Phase 2, Phase 12B | Phase 12B verifies nested and thrown-batch behavior. |
| reactive | `untrack()` | Production-Ready | Covers nested effects, computed reads, and non-subscription guarantees. | Phase 2, Phase 12B | Useful for advanced store/form work later. |
| lifecycle | cleanup scopes | Production-Ready | Covers nested scopes, cleanup ordering, repeated dispose, callbacks registered during cleanup, and orphan calls. | Phase 2, Phase 12B | Internal exports live under `@vanrot/runtime/internal`. |
| lifecycle | `onMount()` | Production-Ready | Covers callback ordering after mount, cleanup return values, browser-only policy, and repeated flush behavior. | Phase 2, Phase 12B | Future SSR work must revisit this boundary. |
| lifecycle | `onDestroy()` | Production-Ready | Covers multiple callbacks, nested scope behavior, and disposal idempotence. | Phase 2, Phase 12B | Used indirectly by generated listener cleanup. |
| mounting | `mount()` constructor contract | Production-Ready | Covers target validation, component creation scope, DOM insertion/removal, destroy idempotence, and lifecycle order. | Phase 2, Phase 12B | Constructor and compiled-module bridges both need final coverage. |
| mounting | compiled component mount bridge | Production-Ready | Covers Vite-transformed default module shape, returned element cleanup, and generated code integration. | Phase 4, Phase 12B | Must align with TypeScript contracts in 12E. |
| events | internal `listen()` | Production-Ready | Covers listener options, event object passing, cleanup-scope removal, idempotence, and generated event bindings. | Phase 2, Phase 12B | Internal helper, not a public app-author API. |
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
| validation | `validateVanrotConfig(...)` | Production-Ready | Unknown keys and invalid semantic states emit stable diagnostics with actionable suggestions. | Phase 13 | Diagnostic codes are `VRCFG001` through `VRCFG005`. |
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
| command | `vr add button` | Demo-Capable | Adds `src/ui/button/ui.button.*`, tokens, package dependency, and starter usage without overwriting user files. | Phase 9, Phase 16 | Local prefix defaults to `ui`. |
| command | `vr add <local-prefix> button` | Demo-Capable | Adds locally prefixed button files such as `primary.button.*` with correct imports and usage. | Phase 9, Phase 16 | Keeps user naming flexible. |
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
| route config | `defineRoutes(...)` | Production-Ready for 15A route contracts | Provides a typed route table with path, label, page/loadPage, route refs, parent normalization, and diagnostics. | Phase 8, Phase 15A | Route config remains the single source of truth; nested layouts and redirects stay in later slices. |
| route config | `createRoutes()` | Production-Ready | Authors route refs without parent-name string literals and supports child `.page(...)` builders. | Phase 15A | Object-form `defineRoutes(...)` remains compatible. |
| matching | `matchRoute(...)` | Production-Ready for 15A route contracts | Covers root, missing, query strings, encoded params, and deterministic matching order. | Phase 8, Phase 15A | Nested route chains and redirects stay in later slices. |
| loading | `resolveRoutePage(...)` | Demo-Capable | Handles eager pages, lazy pages, default exports, failures, and loading/error policies. | Phase 8, Phase 15 | Component-as-page support exists by contract. |
| state | `provideRouter(...)` | Demo-Capable | Sets route table, current match, route params, cleanup, and invalid setup diagnostics. | Phase 8, Phase 15 | Production needs stronger boundaries. |
| state | `navigate(...)` | Production-Ready for 15A route contracts | Handles path updates, history behavior, params, query strings, and invalid route behavior. | Phase 8, Phase 15A | Guard/redirect navigation policy stays in later slices. |
| state | `routeParams` | Production-Ready for 15A route contracts | Exposes params through signals and updates predictably across navigation. | Phase 8, Phase 15A | Works with signal-first design. |
| state | `buildRouteBreadcrumbs(...)` | Production-Ready | Builds breadcrumb labels and hrefs from route object refs and the shared URL builder. | Phase 15A | Dynamic entity labels stay deferred. |
| DOM | `<vr-router>` outlet | Demo-Capable | Renders route pages, swaps lazy pages, handles cleanup, nested outlets, and error outlets. | Phase 8, Phase 15 | Nested outlets are deferred. |
| DOM | `<vr route.name />` link | Production-Ready for 15A route contracts | Renders accessible anchors from route metadata without repeated path or label strings. | Phase 8, Phase 15A | Params, query, and exact active state are covered; custom labels stay deferred. |
| diagnostics | route diagnostics foundation | Production-Ready | Provides shared `VR_ROUTE_*` codes, diagnostic factory, route-level diagnostics, and param/query misuse errors. | Phase 15A | CLI/project-map diagnostics stay in a later router diagnostics slice. |

## `@vanrot/ui`

| Area | Item | Current Maturity | Final TDD Expectation | Owner Phase | Notes |
|------|------|------------------|-----------------------|-------------|-------|
| package | UI package foundation | Demo-Capable | Package exports metadata, assets, primitives, docs hooks, and remains tree-shakeable. | Phase 9, Phase 16 | First UI surface is the button primitive. |
| metadata | default UI prefix | Demo-Capable | Prefix rules support default `ui` and user-chosen local prefixes consistently. | Phase 9, Phase 16 | File prefix can vary; component type stays central. |
| metadata | primitive registry metadata | Demo-Capable | Registry lists supported primitives, generated file names, asset URLs, and future flavors. | Phase 9, Phase 16 | Current primitive type is `button`. |
| assets | `vanrot-tokens.css` | Demo-Capable | Tokens support V01, V02, utility interop, theming policy, docs examples, and visual QA. | Phase 9, Phase 16, Phase 17 | Current token CSS is starter-level. |
| primitive | `UiButton` source component | Demo-Capable | Button supports accessible defaults, children, events, disabled state, form behavior, variants, and class passthrough. | Phase 9, Phase 16 | Source files are `ui.button.ts/html/css`. |
| compiler | `<vr-button>` lowering | Demo-Capable | Native output stays accessible and compatible with future UI parameters and variants. | Phase 9, Phase 16 | Rich parameters are deferred. |
| CLI | generated `src/ui/button/ui.button.*` | Demo-Capable | Generator handles default and local prefixes, collision safety, tokens, usage patching, and optional tests. | Phase 9, Phase 16, Phase 18 | `primary.button.*` style is supported by local prefix. |
| flavor | V01 shadcn-inspired UI | Deferred | Production primitive catalog, variants, accessibility, tokens, and docs. | Phase 16 | Codename until final naming. |
| flavor | V02 brutalist UI | Deferred | Brutalist flavor keeps parity with V01 contracts and passes visual QA. | Phase 17 | Future flavor work. |

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
| generated convention | UI primitive role files | Demo-Capable | UI source, template, and scoped CSS use prefix-first file names. | Phase 9, Phase 16 | `ui.button.ts/html/css` or `primary.button.ts/html/css`. |
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
| Router production 15A | router, compiler | Route contract production slice works | Red/green tests for builder refs, typed params, query strings, URL generation, active links, breadcrumbs, compiler lowering, and route diagnostics. | Phase 15A |
| Router production remaining | router, compiler | 15A complete, later slices deferred | Red/green tests for nested layouts, redirects, guards, strict route graph diagnostics, preloading, and integration workflows. | Phase 15B-15D |
| UI production V01/V02 | ui, compiler, cli | Button demo works | Red/green tests for primitive catalog, variants, accessibility, tokens, utilities, and flavor parity. | Phase 16, Phase 17 |
| Testing production | testing | Component helper demo works | Red/green tests for pages, router workflows, accessibility, async helpers, and generator-wide `--test`. | Phase 18 |
| Store | store | Deferred | Red/green tests for signal-native state, actions, reducers, selectors, effects, tracing, and interop. | Phase 19, Phase 20 |
| Forms and async resources | forms, async | Deferred | Red/green tests for field metadata, validation, resource cancellation, cache policy, and loading/error conventions. | Phase 21 |
| SSR and hydration | ssr, runtime, router | Deferred | Red/green tests for SSR-safe APIs, rendering, hydration, mismatch diagnostics, and routing integration. | Phase 22 |
| Devtools and AI intelligence | devtools, cli, docs | Project map demo works | Red/green tests for route/component graphs, runtime graph metadata, MCP/Skill.sh manifests, and AI rules. | Phase 23, Phase 25 |
| Docs and web presence | docs, web | Deferred | Completeness tests prove every package, command, convention, feature, and limitation is documented. | Phase 24 |
| Distribution | distribution | Deferred | Clean-machine install matrix, package provenance, npm publish dry runs, Homebrew formula, and release checks pass. | Phase 26 |
