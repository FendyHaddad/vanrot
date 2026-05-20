# Vanrot Monorepo Foundation Implementation Plan

**Date:** 2026-05-20
**Phase:** Phase 1 - Monorepo foundation
**Status:** Draft for review
**Spec:** `docs/superpowers/specs/Phase-01.md`

This plan creates the monorepo foundation only. It intentionally does not implement runtime, compiler, Vite plugin, or CLI behavior.

---

## File Structure

Target files and directories:

```txt
package.json
pnpm-workspace.yaml
tsconfig.base.json
tsconfig.json
packages/
  runtime/
    package.json
    tsconfig.json
    src/
      index.ts
      internal.ts
    tests/
      smoke.test.ts
  compiler/
    package.json
    tsconfig.json
    src/
      index.ts
    tests/
      smoke.test.ts
  vite-plugin/
    package.json
    tsconfig.json
    src/
      index.ts
    tests/
      smoke.test.ts
  cli/
    package.json
    tsconfig.json
    src/
      index.ts
    tests/
      smoke.test.ts
apps/
examples/
```

Generated outputs:

```txt
packages/*/dist/
```

Generated outputs are not committed.

---

## Stage 1 - Workspace Root

### Task 1: Create root workspace metadata

**Files:**

- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `tsconfig.base.json`
- Create: `tsconfig.json`

**Steps:**

- [ ] Check local package tooling with `node --version`, `corepack --version`, and `pnpm --version`.
- [ ] Create a private root `package.json`.
- [ ] Set `packageManager` to the exact local `pnpm --version` value.
- [ ] Add workspace scripts: `build`, `typecheck`, `test`, `lint`, `clean`, and `verify`.
- [ ] Create `pnpm-workspace.yaml` with workspace globs for `packages/*`, `apps/*`, and `examples/*`.
- [ ] Create `tsconfig.base.json` with shared strict ESM TypeScript settings.
- [ ] Create root `tsconfig.json` with references to the four core packages.
- [ ] Verify the root files contain no package behavior beyond workspace orchestration.

**Acceptance:**

- Root package is private.
- Workspace globs match the Phase 1 spec.
- Root TypeScript config can coordinate package builds.
- No framework code is implemented.

---

## Stage 2 - Core Package Shells

### Task 2: Create `@vanrot/runtime` shell

**Files:**

- Create: `packages/runtime/package.json`
- Create: `packages/runtime/tsconfig.json`
- Create: `packages/runtime/src/index.ts`
- Create: `packages/runtime/src/internal.ts`
- Create: `packages/runtime/tests/smoke.test.ts`

**Steps:**

- [ ] Create the package directory.
- [ ] Create the package manifest with name `@vanrot/runtime`.
- [ ] Configure ESM package output from `src` to `dist`.
- [ ] Configure public export path for `src/index.ts` compiled output.
- [ ] Reserve internal export path for `src/internal.ts` compiled output.
- [ ] Add a smoke test that verifies the package test runner is wired.
- [ ] Keep `signal`, `computed`, `effect`, `batch`, `untrack`, cleanup scopes, lifecycle, and mounting unimplemented.

**Acceptance:**

- Runtime package builds as an empty shell.
- Internal entrypoint exists as a reserved compiler-facing boundary.
- Runtime kernel behavior remains untouched.

### Task 3: Create `@vanrot/compiler` shell

**Files:**

- Create: `packages/compiler/package.json`
- Create: `packages/compiler/tsconfig.json`
- Create: `packages/compiler/src/index.ts`
- Create: `packages/compiler/tests/smoke.test.ts`

**Steps:**

- [ ] Create the package directory.
- [ ] Create the package manifest with name `@vanrot/compiler`.
- [ ] Configure ESM package output from `src` to `dist`.
- [ ] Add a package-local TypeScript config extending the root base config.
- [ ] Add a smoke test that verifies the package test runner is wired.
- [ ] Keep parsing, template compilation, binding compilation, and CSS scoping unimplemented.

**Acceptance:**

- Compiler package builds as an empty shell.
- No compiler API or parser behavior exists yet.

### Task 4: Create `@vanrot/vite-plugin` shell

**Files:**

- Create: `packages/vite-plugin/package.json`
- Create: `packages/vite-plugin/tsconfig.json`
- Create: `packages/vite-plugin/src/index.ts`
- Create: `packages/vite-plugin/tests/smoke.test.ts`

**Steps:**

- [ ] Create the package directory.
- [ ] Create the package manifest with name `@vanrot/vite-plugin`.
- [ ] Configure ESM package output from `src` to `dist`.
- [ ] Add a package-local TypeScript config extending the root base config.
- [ ] Add a smoke test that verifies the package test runner is wired.
- [ ] Do not add Vite behavior yet.
- [ ] Do not require a Vite peer dependency until plugin behavior exists.

**Acceptance:**

- Vite plugin package builds as an empty shell.
- No Vite hooks or transform behavior exists yet.

### Task 5: Create `@vanrot/cli` shell

**Files:**

- Create: `packages/cli/package.json`
- Create: `packages/cli/tsconfig.json`
- Create: `packages/cli/src/index.ts`
- Create: `packages/cli/tests/smoke.test.ts`

**Steps:**

- [ ] Create the package directory.
- [ ] Create the package manifest with name `@vanrot/cli`.
- [ ] Configure ESM package output from `src` to `dist`.
- [ ] Add a package-local TypeScript config extending the root base config.
- [ ] Add a smoke test that verifies the package test runner is wired.
- [ ] Do not expose the `vr` binary until an executable command entrypoint exists.
- [ ] Keep `vr create`, `vr build`, `vr dev`, `vr generate`, `vr doctor`, and `vr test` unimplemented.

**Acceptance:**

- CLI package builds as an empty shell.
- No command behavior exists yet.

---

## Stage 3 - Shared Directories

### Task 6: Create future workspace directories

**Files:**

- Create: `apps/`
- Create: `examples/`

**Steps:**

- [ ] Create `apps/` for future playground or docs apps.
- [ ] Create `examples/` for future example projects.
- [ ] Do not create an app package.
- [ ] Do not create an example package.

**Acceptance:**

- Workspace roots exist for future phases.
- No runnable app is added in Phase 1.

---

## Stage 4 - Verification

### Task 7: Install dependencies

**Files:**

- Create: `pnpm-lock.yaml`

**Steps:**

- [ ] Run dependency install through pnpm.
- [ ] Confirm root dev dependencies are installed.
- [ ] Confirm no package has production dependencies.

**Acceptance:**

- Lockfile exists.
- Workspace install completes.

### Task 8: Verify empty package builds

**Commands:**

```txt
pnpm build
pnpm typecheck
pnpm test
pnpm verify
```

**Steps:**

- [ ] Run `pnpm build`.
- [ ] Run `pnpm typecheck`.
- [ ] Run `pnpm test`.
- [ ] Run `pnpm verify`.
- [ ] Confirm all four core packages participate.
- [ ] Confirm `packages/*/dist/` is generated only as build output.

**Acceptance:**

- All verification commands pass.
- All four package shells build.
- Test runner works.
- No framework behavior is implemented.

---

## Stage 5 - Tracker Update

### Task 9: Mark Phase 1 complete after verification

**Files:**

- Modify: `docs/brainstorm.md`

**Steps:**

- [ ] Find `# 38. Phase Checklist`.
- [ ] Change Phase 1 from `[ ]` to `[x]`.
- [ ] Leave Phase 2 and later phases unchecked.
- [ ] Mention verification commands that passed near the implementation summary or memory observation.

**Acceptance:**

- Phase 1 is checked only after verification passes.
- Later phases remain unchecked.

---

## Self-Review Checklist

Spec coverage:

| Spec section | Covered by task |
|---|---|
| Package manager decision | Task 1 |
| Workspace layout | Task 1, Task 6 |
| Root package contract | Task 1 |
| Shared TypeScript contract | Task 1 |
| Package shell contract | Tasks 2-5 |
| Core package boundaries | Tasks 2-5 |
| Deferred packages | Tasks 2-6 |
| Dependency policy | Task 7 |
| Verification contract | Task 8 |
| Tracker rule | Task 9 |

No implementation rule:

- This plan creates package shells only.
- Runtime APIs remain unimplemented.
- Compiler behavior remains unimplemented.
- Vite plugin behavior remains unimplemented.
- CLI command behavior remains unimplemented.

Completeness scan:

- No unresolved markers.
- No missing file paths.
- No unspecified package names.

Ambiguity check:

- Package manager is pnpm.
- Phase 1 core packages are exactly `runtime`, `compiler`, `vite-plugin`, and `cli`.
- `buildable empty package` means TypeScript can emit package output from minimal entrypoints.

Execution handoff:

- Start with Task 1.
- Do not start Phase 2 runtime kernel behavior until Task 8 passes and Task 9 is complete.
