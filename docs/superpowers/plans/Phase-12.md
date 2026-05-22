# Vanrot Phase 12 Core Framework Hardening Completion Plan

**Goal:** Track the completed Phase 12 hardening slices as the aggregate phase plan required by `verify:phase-docs`.

- [x] **12A: Core audit lane and red tests**

Created the isolated audit lane and recorded known production gaps for runtime, compiler, Vite, and TypeScript contracts.

- [x] **12B: Runtime production hardening**

Burned down runtime audit failures and promoted signal, lifecycle, cleanup-scope, and mount behavior to production-ready coverage.

- [x] **12C: Compiler production hardening**

Burned down compiler audit failures across diagnostics, source spans, source maps, control flow, child components, slots, and scoped CSS.

- [x] **12D: Vite production hardening**

Burned down Vite audit failures across transforms, virtual CSS, sourcemaps, dev invalidation, production builds, and HMR ownership.

- [x] **12E: TypeScript contract hardening**

Burned down TypeScript contract audit failures by emitting named compiled exports, accepting router `ComponentType` pages, and removing app-facing suppressions.

- [x] **Phase 12 completion docs**

Updated `feature-maturity.md`, `final-tdd-inventory.md`, `vanrot-presentation.html`, and the slice plans so Phase 12 is complete and Phase 13 is active.
