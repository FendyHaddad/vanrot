# Phase 13 Plan Checklist

## 13A Config Shape And Defaults
- [x] `@vanrot/config` package scaffolded.
- [x] `defineVanrotConfig` helper exported and tested.
- [x] Required defaults normalized: `source.root='src'`, `devServer.port=1010`.
- [x] `vr create` generates canonical root `vanrot.config.ts`.

## 13B Validation And Diagnostics
- [x] Shared config diagnostics model implemented (`VRCFG001`-`VRCFG005`).
- [x] Schema validation implemented (unknown top-level keys).
- [x] Semantic validation implemented (`devServer.port` range).
- [x] CLI and Vite plugin consume shared diagnostics through `@vanrot/config`.

## 13C Shared CLI And Vite Loading
- [x] Shared `loadVanrotProjectConfig(...)` loader implemented.
- [x] `vr dev`, `vr build`, `vr test` load normalized config before command execution.
- [x] `vr doctor` merges config diagnostics into doctor findings.
- [x] `@vanrot/vite-plugin` loads normalized config in `configResolved(...)`.

## 13D Install-Aware Config Updates
- [x] AST-aware editor helper `upsertVanrotConfigDomain(...)` implemented.
- [x] Safe generated-domain removal helper `removeVanrotConfigDomainIfGenerated(...)` implemented.
- [x] `vr add button` upserts `ui` config domain idempotently.

## 13E Migration, Recovery, And Port 1010
- [x] `migrateVanrotConfig(...)` implemented with destructive overwrite option.
- [x] `recoverVanrotConfig(...)` implemented for no-Git scenarios.
- [x] Recovery infers optional domains from installed dependencies (`@vanrot/router`, `@vanrot/ui`).
- [x] `vr config migrate`, `vr config recover`, and `vr config migrate --recover` wired in CLI.
- [x] Default dev port behavior verified through normalized config and CLI runner tests.

## Verification Evidence
- [x] `CI=true pnpm --filter @vanrot/config test -- tests/smoke.test.ts`
- [x] `CI=true pnpm --filter @vanrot/config test -- tests/define-config.test.ts tests/defaults.test.ts tests/validate.test.ts tests/load.test.ts tests/editor.test.ts tests/migrate.test.ts tests/recover.test.ts`
- [x] `CI=true pnpm --filter @vanrot/cli test -- tests/create.test.ts tests/cli.test.ts tests/runner-commands.test.ts tests/doctor.test.ts tests/add.test.ts`
- [x] `CI=true pnpm --filter @vanrot/vite-plugin test -- tests/options.test.ts tests/plugin-transform.test.ts`
