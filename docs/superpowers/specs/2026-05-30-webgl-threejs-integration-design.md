# WebGL And three.js Integration Spec

## Status

Implemented as a recipe-only post-production candidate. This is not a numbered phase. If follow-up work becomes a numbered phase, rename the plan and create the matching phase spec before implementation.

Implementation plan: `docs/superpowers/plans/2026-05-30-webgl-threejs-integration.md`.

## Goal

Make WebGL and three.js feel first-class in Vanrot through lifecycle-safe recipes, docs, examples, and possibly a tiny adapter package, without adding heavy 3D dependencies to the core runtime.

## Problem

three.js already works inside a Vanrot app by mounting a `<canvas>` in `onMount()`, running WebGL there, and feeding signals into scene state. The missing product question is not basic support. The question is whether Vanrot should bless a documented integration pattern or ship a small adapter package. Without a firm boundary, this candidate can conflict with the lean runtime message and accidentally make 3D feel like a core dependency.

## Design Principles

- Keep `three` as an app dependency or peer dependency, never a dependency of `@vanrot/runtime`.
- Prefer recipe-only documentation unless helper APIs remove real repeated integration code.
- Keep UI markup in Vanrot templates, not TypeScript.
- Make every render loop, resize listener, signal binding, and WebGL resource disposable.
- Provide a non-WebGL fallback for docs and examples.
- Respect `prefers-reduced-motion` and mobile capability limits.
- Use deterministic local fixture assets for repeatable verification.

## Scope

This candidate owns:

- A hard recipe-only vs `@vanrot/three` adapter decision before package work begins.
- A lifecycle-safe `.widget.ts` recipe using `onMount()` and `onDestroy()`.
- Signal-to-scene binding examples for color, camera, rotation, material, and uniforms.
- Cleanup for render loops, resize handling, WebGL resources, texture/model resources, and signal subscriptions.
- Browser capability handling for missing WebGL, context loss, context restore, reduced motion, and mobile fallback.
- Optional example app and site showcase only if they stay lazy, accessible, and measurable.

## Non-Goals

- No `three` dependency in `@vanrot/runtime`.
- No default 3D homepage hero.
- No renderer abstraction that attempts to wrap all of three.js.
- No remote asset dependency in required tests.
- No public adapter package unless recipe-only examples prove repeated code that should be shared.

## Decision Gates

Resolved for this implementation:

- First shipped shape: recipe-only docs and `examples/webgl-threejs`.
- Public package: no `@vanrot/three`; no package export surface or `publish.sh` change.
- Site showcase: no live 3D showcase shipped; docs route uses article content and verified snippets.
- Browser capability floor: progressive enhancement with missing WebGL, compact/mobile fallback, context loss, context restore, and reduced-motion static frame handling.

If any gate is unresolved, update this spec and the plan before code changes.

## Acceptance Criteria

The integration is complete only when:

- Recipe-only or adapter-package direction is explicitly recorded.
- `@vanrot/runtime` has no import, dependency, or transitive dependency on `three` and stays within the `1.98 KB` gzip cap for `dist/index.js` plus `dist/internal.js`.
- The lifecycle recipe cleans up renderer resources, render loops, resize observers/listeners, signal bindings, textures, materials, geometries, and controls.
- Missing WebGL, context loss, context restore, reduced motion, and mobile fallback behavior are documented and verified.
- Any helper API returns cleanup or joins a widget cleanup scope.
- Examples use local deterministic assets and centralized asset paths.
- Any site showcase is lazy-loaded, accessible, mobile-safe, and verified with desktop/mobile screenshots plus a canvas-pixel sanity check.
- Docs, AI bundles, final TDD inventory, feature maturity when applicable, and post-production ideas reflect the shipped status.

## Verification

Minimum closeout verification:

- Unit tests or verified examples for teardown, repeated mount/destroy, resize cleanup, signal cleanup, and resource disposal.
- Bundle/package tests proving `@vanrot/runtime` does not depend on `three`.
- Site tests, typecheck, build, server restart, and route response check after site docs change.
- Browser inspection for any 3D showcase, including desktop/mobile screenshots and a nonblank canvas-pixel check.
- `pnpm verify:size`
- `pnpm verify:release-dry-run` after package metadata or version changes.
- `PUBLISH_DRY_RUN=1 ./publish.sh` after package metadata or version changes; add `three` to `publish.sh` if `@vanrot/three` ships.
- `pnpm verify`
