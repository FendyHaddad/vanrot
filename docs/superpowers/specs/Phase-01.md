# Vanrot Monorepo Foundation Design

**Date:** 2026-05-20
**Phase:** Phase 1 - Monorepo foundation
**Status:** Draft for review
**Related:**
- `docs/brainstorm.md`
- `docs/superpowers/specs/Phase-02.md`
- `docs/superpowers/plans/Phase-02.md`

---

## 1. Goal

Phase 1 creates the project foundation that every later Vanrot package will build on.

The output is a private monorepo with shared TypeScript configuration, package manager configuration, workspace scripts, and empty buildable package shells for the core MVP packages.

Phase 1 is successful when these package directories exist and can build as empty packages:

```txt
packages/runtime
packages/compiler
packages/vite-plugin
packages/cli
```

No framework behavior is implemented in Phase 1.

---

## 2. Non-Goals

Phase 1 must not implement:

```txt
signal()
computed()
effect()
batch()
untrack()
cleanup scopes
mount()
compiler parsing
template compilation
Vite plugin behavior
CLI commands
router behavior
UI components
example apps
```

The phase creates structure only.

---

## 3. Package Manager Decision

Vanrot uses `pnpm` workspaces.

Reasons:

- Native workspace linking is simple.
- Monorepo package boundaries stay explicit.
- `pnpm-workspace.yaml` makes package discovery obvious.
- Recursive commands can build and test all packages consistently.

The root `package.json` must be private and must include an exact `packageManager` value.

During implementation, the exact value is set from the local `pnpm --version` output:

```txt
packageManager = pnpm@<local pnpm version>
```

This is not user-facing. Generated Vanrot apps do not need to use pnpm unless the CLI chooses that later.

---

## 4. Workspace Layout

Phase 1 creates this workspace shape:

```txt
vanrot/
  package.json
  pnpm-workspace.yaml
  tsconfig.base.json
  tsconfig.json
  packages/
    runtime/
    compiler/
    vite-plugin/
    cli/
  apps/
  examples/
  docs/
```

Workspace globs:

```txt
packages/*
apps/*
examples/*
```

`docs/` is not a workspace package.

---

## 5. Root Package Contract

The root package is not publishable.

Required root behavior:

- `private: true`
- package manager pinned through `packageManager`
- workspace scripts for build, typecheck, test, lint, clean, and verify
- no production dependencies unless the root itself later runs code
- shared dev dependencies live at the root unless a package needs a package-specific tool

Required root scripts:

```txt
build       build every workspace package
typecheck   typecheck every workspace package
test        run tests where packages define tests
lint        run lint where packages define lint
clean       remove generated outputs
verify      run typecheck, test, and build
```

Scripts must be safe for empty package shells.

---

## 6. Shared TypeScript Contract

The root owns shared TypeScript defaults in `tsconfig.base.json`.

Required defaults:

- strict type checking
- ESM output
- declaration output for packages
- source maps for package builds
- modern JavaScript target
- no implicit CommonJS assumptions
- package-local `src` to `dist` compilation

Recommended baseline:

```txt
target: ES2022
module: ESNext
moduleResolution: Bundler
strict: true
declaration: true
sourceMap: true
declarationMap: true
skipLibCheck: true
```

The root `tsconfig.json` coordinates package references. Package `tsconfig.json` files extend the base config.

---

## 7. Package Shell Contract

Each Phase 1 package has:

```txt
package.json
tsconfig.json
src/index.ts
tests/
```

Each package must be buildable even before real behavior exists.

All packages use:

```txt
type: module
main: ./dist/index.js
module: ./dist/index.js
types: ./dist/index.d.ts
exports: ./dist/index.js
files: dist
```

Package build output goes to `dist/`.

Package source stays under `src/`.

Tests stay under `tests/`.

---

## 8. Core Package Boundaries

### `@vanrot/runtime`

Creates the package shell only.

Runtime behavior belongs to Phase 2 and the runtime kernel plan.

The package shell reserves space for:

```txt
src/index.ts
src/internal.ts
```

`src/internal.ts` may remain empty in Phase 1.

### `@vanrot/compiler`

Creates the package shell only.

Compiler behavior begins in Phase 3.

### `@vanrot/vite-plugin`

Creates the package shell only.

Vite integration begins in Phase 4.

No Vite peer dependency is required until plugin behavior exists.

### `@vanrot/cli`

Creates the package shell only.

CLI commands begin in Phase 5.

The `vr` binary is not required until there is an executable command entrypoint.

---

## 9. Deferred Packages

These packages are not created in Phase 1:

```txt
@vanrot/router
@vanrot/ui
@vanrot/testing
@vanrot/store
@vanrot/async
@vanrot/forms
```

Reason: Phase 1 should produce the minimum foundation needed by runtime, compiler, Vite plugin, and CLI work. Extra empty packages create maintenance noise before they have a job.

---

## 10. Dependency Policy

Phase 1 should keep dependencies small.

Allowed root dev dependencies:

```txt
typescript
vitest
```

Optional root dev dependencies if used by implementation:

```txt
tsx
rimraf
```

Package-level production dependencies are not allowed in Phase 1.

Package-level peer dependencies are deferred until a package has real behavior that needs them.

---

## 11. Verification Contract

Phase 1 is complete only when these checks pass after dependencies are installed:

```txt
pnpm build
pnpm typecheck
pnpm test
pnpm verify
```

Expected result:

- all four core packages build
- no framework APIs are implemented
- no package accidentally depends on another future package
- no package publishes source-only output
- generated `dist/` output is ignored by source control

---

## 12. Tracker Rule

After Phase 1 is implemented and verified, update `docs/brainstorm.md`:

```txt
Phase 1 - Monorepo foundation
```

Change its checkbox from `[ ]` to `[x]` only after the verification contract passes.

---

## 13. Self-Review

Completeness scan:

- No unresolved markers.
- No incomplete file names.
- No unspecified package list.

Internal consistency:

- The package list matches the Phase 1 tracker in `docs/brainstorm.md`.
- Runtime behavior remains owned by the runtime kernel spec and plan.
- Router and UI remain deferred even though they are part of the wider MVP vision.

Scope check:

- This spec is focused on repository foundation only.
- It is small enough for one implementation plan.

Ambiguity check:

- Package manager is `pnpm`.
- Core Phase 1 packages are exactly runtime, compiler, vite-plugin, and cli.
- Buildable means TypeScript package shells compile to `dist/`; it does not mean framework behavior exists.
