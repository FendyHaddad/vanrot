# Vanrot Core Production Audit

`pnpm audit:core` runs production-hardening tests for Phase 12A.

These tests are intentionally red until their owning slices make them pass:

- `12B runtime production hardening`
- `12C compiler diagnostics and source locations`
- `12D Vite dev/build/HMR hardening`
- `12E TypeScript contracts and maturity gates`

The normal development gate remains `pnpm verify`. Do not add these audit files to package-level test globs until the owning slice turns a red audit into passing production coverage.
