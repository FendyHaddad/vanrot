# Phase 13 Design: Project Configuration System

Date: 2026-05-23  
Phase: 13 (`13A` through `13E`)  
Status: Proposed (approved in brainstorming conversation, pending implementation planning)

## 1. Purpose

Phase 13 makes `vanrot.config.ts` the typed, production-ready, single source of truth for Vanrot project conventions and framework-owned settings.

This phase must deliver:

- Root config file as a first-class app artifact.
- Full production config schema and validation.
- Shared config loading for CLI and Vite plugin.
- Install-aware config auto-population with idempotent edits.
- Migration and recovery workflows, including default port `1010` verification.

## 2. Scope and Phase Slices

Phase 13 is implemented as the following canonical slices (from the maturity ledger):

- `13A`: Config shape and defaults.
- `13B`: Schema validation and diagnostics.
- `13C`: Vite/CLI config loading.
- `13D`: Install-aware config updates.
- `13E`: Generated app migration and port `1010` verification.

## 3. Architecture

## 3.1 New package ownership

Create `packages/config` (`@vanrot/config`) as the only owner for Vanrot config behavior.

Responsibilities:

- `schema`: `VanrotConfig` types, domain types, `schemaVersion`, defaults.
- `loader`: discover and load `vanrot.config.ts`, apply defaults, return normalized config + diagnostics.
- `validator`: structural + semantic validation and stable diagnostic codes.
- `migrations`: detect migration needs and plan/configure upgrades.
- `editor`: AST-preserving read/update/write operations for install-aware updates.
- `recovery`: rebuild missing/corrupt config from project state.

## 3.2 Integration boundaries

- `@vanrot/cli` consumes `@vanrot/config` for `create`, `add`, `dev`, `build`, `test`, `doctor`, and config maintenance commands.
- `@vanrot/vite-plugin` consumes `@vanrot/config` loader output for defaults and plugin behavior.
- No second configuration system is permitted inside CLI or Vite plugin.

## 4. Config Authoring Model

Generated/Canonical pattern:

```ts
import { defineVanrotConfig } from '@vanrot/config';

export default defineVanrotConfig({
  schemaVersion: 1,
  project: { name: 'my-app' },
  source: { root: 'src' },
  devServer: { port: 1010 },
});
```

Decision:

- Primary authoring style is `defineVanrotConfig(...)`.
- New apps created by `vr create` always include `vanrot.config.ts`.

## 4.1 Domain model

Top-level config domains:

- `schemaVersion`
- `project`
- `source`
- `devServer`
- `router`
- `ui`
- `store`
- `testing`
- `build`
- `cache`
- `docs`
- `ai`
- `conventions` (single-source names/paths/suffix mappings)

Rules:

- Minimal required domains for runtime operation are always normalized (`source`, `devServer`).
- Optional domains are install-aware and appear only when needed.
- Shared conventions used by generators/compiler/diagnostics come from config-owned fields, not repeated literals.

## 5. Defaults and Required Behavior

Base defaults:

- `source.root = 'src'`
- `devServer.port = 1010`

Behavior:

- `vr create` writes canonical `vanrot.config.ts` with required defaults.
- CLI and Vite plugin consume the same normalized config object.
- Missing fields in existing configs are filled by versioned defaults during normalization.

## 6. Validation and Diagnostics

## 6.1 Validation layers

- Load errors:
  - missing/invalid default export
  - config execution/parse failure
- Schema errors:
  - wrong types
  - unknown keys (strictness policy owned by config package)
  - invalid enum/literal values
- Semantic errors:
  - invalid port range
  - path and convention conflicts
  - incompatible cross-domain combinations

## 6.2 Diagnostic contract

All config diagnostics use shared structured data with:

- stable diagnostic code (`VRCFG###`)
- severity (`error` or `warning`)
- message
- suggestion
- optional location metadata

Rendering:

- CLI uses shared formatting from `@vanrot/config`.
- Vite plugin maps the same diagnostics into Vite reporting path.

## 7. Migration and Compatibility Policy

Compatibility decision:

- Existing pre-Phase-13 apps without `vanrot.config.ts` remain runnable.
- Loader applies versioned defaults and emits migration warning.
- Hard failures occur only for invalid/unsafe semantic states.

Migration behavior:

- Add migration command: `vr config migrate`.
- Writes canonical `vanrot.config.ts` using `defineVanrotConfig(...)`.
- Removes migration warning once successful.
- Migration engine is version-aware via `schemaVersion`.
- Destructive transformations require explicit opt-in flag.

## 8. Recovery Policy (No Git Required)

Add recovery command: `vr config recover` (or `vr config migrate --recover` alias).

Recovery behavior:

- If config is missing/corrupt, reconstruct from:
  - `package.json` dependencies/scripts
  - `vite.config.ts`
  - `src/` project layout and known Vanrot footprints
  - Vanrot defaults (`source.root = 'src'`, `devServer.port = 1010`)
- Write canonical `vanrot.config.ts` output.
- Emit warnings for ambiguous inferred values and list required follow-up edits.

## 9. Install-Aware Auto-Population

## 9.1 Core behavior

- `vr add` commands add only the required config blocks for the selected module.
- Repeated invocations are idempotent.
- No duplicate blocks are produced.
- Unrelated config sections are not rewritten.

## 9.2 Edit strategy

Decision: AST-preserving edits are the default policy.

Requirements:

- Preserve user comments and formatting where possible.
- Detect conflicts and avoid silent destructive overwrites.
- Support safe `--fix-config` style merges when deterministic.
- Leave unsafe conflicts as diagnostics + guided next steps.

## 9.3 Uninstall/removal behavior

- Removing installed features should remove no-longer-needed config blocks when safe.
- If block is user-customized and not safely removable, emit warning and keep block.

## 10. CLI and Vite Integration

Shared loading contract:

- `vr dev`, `vr build`, `vr test`, `vr doctor` call config loader before running tool wrappers.
- Vite plugin loads/receives normalized config from the same package path.
- `devServer.port` normalized value drives default dev port behavior (`1010` when not overridden).

## 11. Testing and Verification Matrix

## 11.1 Unit coverage (`@vanrot/config`)

- type-safe config helper behavior
- defaults normalization
- validator rule sets and codes
- migration planning/version handling
- AST editor operations (insert/update/remove/preserve)
- recovery inference logic

## 11.2 Integration coverage (`@vanrot/cli`)

- `vr create` writes canonical config
- `vr add` config auto-population and idempotency
- `vr config migrate` behavior
- `vr config recover` behavior
- fallback + warning behavior for pre-Phase-13 apps

## 11.3 Integration coverage (`@vanrot/vite-plugin`)

- plugin reads shared normalized config
- config overrides affect plugin behavior as expected
- diagnostics parity with CLI formatting contract

## 11.4 Regression fixtures

- pre-13 app upgraded into 13-compatible config
- missing config recovery in no-Git scenarios
- explicit port `1010` verification in generated and migrated apps

## 12. Acceptance Gates for Phase Completion

`13A` complete when:

- typed config shape + defaults exist and are tested.

`13B` complete when:

- schema + semantic validation and diagnostics are production-ready and tested.

`13C` complete when:

- CLI and Vite plugin share config loading path; no duplicate loaders remain.

`13D` complete when:

- install-aware AST-preserving auto-population is idempotent and conflict-safe.

`13E` complete when:

- migration + recovery flows work on fixtures; generated/migrated apps verify `devServer.port` default `1010`.

Phase 13 overall complete when all slices pass tests and maturity/protocol docs are updated per repo rules.

## 13. Non-Goals for Phase 13

- CLI visual design polish from Phase 14.
- Router production features from Phase 15.
- UI production features from Phases 16 and 17.
- Store production features from later phases.

These may consume config domains introduced here but are not delivered by this phase.
