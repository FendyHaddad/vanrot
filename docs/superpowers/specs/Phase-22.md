# Phase 22 SSR And Hydration Spec

## Status

Implemented as an opt-in `@vanrot/ssr` package. Streaming, event replay, partial hydration, islands, resumability,
and async-resource SSR behavior remain deferred follow-up gates.

Implementation plan: `docs/superpowers/plans/Phase-22.md`.

## Goal

Make Vanrot capable of server rendering and hydration through explicit opt-in APIs while keeping the browser runtime boundary clear and small.

## Problem

SSR touches runtime lifecycle, compiler output, routing, asset URLs, HTML shell generation, state serialization, streaming, and security. The current plan covers the broad path, but the missing shell, serialization, escaping, asset, and event policy details make the implementation risky. Without these gates, Phase 22 can accidentally weaken the client router contract or add server-only weight to `@vanrot/runtime`.

## Design Principles

- Keep SSR opt-in, preferably through `@vanrot/ssr`.
- Keep `@vanrot/runtime` browser-first and under the `1.98 KB` gzip cap.
- Mark public APIs as server-safe, client-only, or hydration-only.
- Reuse route refs and existing route matching instead of string literal routing.
- Prefer deterministic HTML and deterministic diagnostics over magic repair.
- Make streaming a later slice unless static render, hydration, diagnostics, router integration, shell output, and serialized state are stable.

## Scope

Phase 22 owns:

- SSR-safe API audit across runtime, compiler, router, UI, forms candidates, and async-resource candidates.
- An opt-in server rendering boundary, defaulting to `@vanrot/ssr` if a package ships.
- HTML shell output, including head/meta/style/script placement and asset URL handling.
- Safe state serialization and escaping for data needed during hydration.
- Explicit `hydrate(...)` lifecycle ordering and cleanup semantics.
- Hydration mismatch diagnostics for text, attributes, node order, missing nodes, extra nodes, route divergence, and serialized-state mismatch.
- Router integration for static pages, hydrated routes, route params, redirects, guards, and lazy route boundaries.
- Streaming only after the base SSR and hydration contract is proven.

## Non-Goals

- No Node-only assumptions in `@vanrot/runtime`.
- No server framework adapter in the first SSR release.
- No full data-loading framework.
- No partial hydration, islands architecture, or resumability unless explicitly split into a later phase.
- No event replay by default unless it passes a separate decision gate.
- No streaming before the non-streaming path passes acceptance criteria.

## Decision Gates

Resolved for the first SSR release:

- Shipped boundary: `@vanrot/ssr`.
- HTML shell contract: `renderDocument(...)` owns title, head entries, body markup, style links, module scripts, asset base paths, and `__vanrot_hydration_state__`.
- Hydration event replay: explicitly deferred.
- Asset URLs: resolved by `renderDocument(...)` with optional `assets.basePath`.
- Escaping and serialization: `escapeHtml(...)`, `escapeAttribute(...)`, and `serializeHydrationState(...)` live in `@vanrot/ssr`.

## Acceptance Criteria

Phase 22 is complete only when:

- Server rendering can produce deterministic HTML for static pages without touching browser-only APIs.
- The HTML shell handles head, meta, style, script, body, asset URLs, and serialized state predictably.
- Serialized state is escaped and covered by security-focused tests.
- `hydrate(...)` attaches client behavior without rerunning server-only lifecycle work.
- `onMount()` runs only on the client after hydration begins.
- Hydration mismatch diagnostics are deterministic and include enough source or route context to fix common issues.
- Router SSR covers route refs, params, redirects, guards, lazy route boundaries, and divergence diagnostics.
- Streaming is either fully tested or explicitly deferred in docs and post-production tracking.
- `@vanrot/runtime` remains free of SSR-only dependencies and stays within the `1.98 KB` gzip cap for `dist/index.js` plus `dist/internal.js`.
- Docs, AI bundles, final TDD inventory, feature maturity, and post-production ideas reflect the shipped status.

## Verification

Minimum closeout verification:

- Package tests for runtime, compiler, router, and SSR if `@vanrot/ssr` ships.
- Hydration tests through compiled output, not only hand-written fixtures.
- Security tests for escaping and serialized-state handling.
- Site tests, typecheck, build, server restart, and route response check after site docs change.
- `pnpm verify:size`
- `pnpm verify:release-dry-run` after package metadata or version changes.
- `PUBLISH_DRY_RUN=1 ./publish.sh` after package metadata or version changes; add `ssr` to `publish.sh` if `@vanrot/ssr` ships.
- `pnpm verify`
