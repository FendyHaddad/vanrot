# Phase 26: Distribution And Release Hardening

## Status

Implemented. `pnpm verify:release-dry-run -- --keep` passed with packed package installs, pnpm and npm consumer smoke/build coverage, and local Homebrew tap install verification.

## Purpose

Phase 26 proves Vanrot is installable and usable from release-like artifacts before real publishing. The phase does not publish packages, create a public release command, or claim that distribution is complete. It creates a strict local release dry-run gate that catches package metadata mistakes, missing packed files, broken CLI flows, stale generated docs, and install problems before users test the framework.

## Scope

Phase 26 adds a repository-owned release verifier:

- `pnpm verify:release-dry-run`;
- root `pnpm verify` integration;
- local tarball packing for public Vanrot packages;
- a full `pnpm` consumer app simulation;
- a lightweight `npm` consumer smoke test;
- Node and package metadata checks;
- an optional local Homebrew install check when `brew` is available;
- human-readable and machine-readable release dry-run reports.

The release dry-run is strict enough for tomorrow's user testing, but it remains local and unpublished.

## Non-Goals

Phase 26 does not:

- publish npm packages;
- push tags or create releases;
- add a public `vr release` command;
- require external CI infrastructure;
- require Homebrew to be installed on every machine;
- implement multi-Node CI matrices;
- create provider-specific AI integrations.

## User Decisions

- Optimize Phase 26 for a release dry-run before public publishing.
- Use a full consumer app simulation as the success definition.
- Keep the feature as a repo script and root verification gate, not a public CLI command.
- Use a practical near-release matrix:
  - full `pnpm` workflow;
  - lightweight `npm` install/import smoke;
  - Node and package metadata validation.
- Include a full local Homebrew test when Homebrew exists.
- Use temp directories by default.
- Keep `.vanrot/release-dry-run/` artifacts when `--keep` is passed or when the verifier fails.
- Include `verify:release-dry-run` in normal `pnpm verify`.
- Produce concise colored console output plus JSON and Markdown reports when artifacts are kept or the verifier fails.

## Release Verifier Flow

The verifier lives in `scripts/verify-release-dry-run.mjs`, with focused tests in `scripts/verify-release-dry-run.test.mjs`.

The command runs these stages:

1. Validate repository prerequisites.
2. Build the packages needed for release artifact checks.
3. Discover public Vanrot packages.
4. Validate package metadata:
   - package name;
   - package version;
   - `exports`;
   - `bin`;
   - `files`;
   - `engines`;
   - dependency shape.
5. Pack every public Vanrot package into local tarballs.
6. Create an isolated `pnpm` consumer app.
7. Install packed tarballs into the `pnpm` consumer app.
8. Run a full consumer workflow:
   - import core packages;
   - run the CLI flow needed to create or exercise a generated app;
   - build the generated app;
   - verify the AI bundle contract from the packed artifacts when available.
9. Create an isolated `npm` consumer app.
10. Install packed tarballs into the `npm` consumer app.
11. Run lightweight import or entrypoint smoke checks with `npm`.
12. Check Homebrew:
   - if `brew` is missing, record a warning and skip;
   - if `brew` exists, run a local formula install/check for `vanrot`;
   - if Homebrew exists but the formula test fails, fail the verifier.
13. Write release dry-run reports.
14. Delete temporary artifacts after success unless `--keep` is passed.

## Artifact Policy

Normal successful runs use OS temp directories and clean up after themselves.

The verifier keeps `.vanrot/release-dry-run/` when:

- the command receives `--keep`;
- any required step fails;
- Homebrew is present and its local check fails.

Kept artifacts include:

- packed package tarballs;
- consumer app workspaces;
- captured command output;
- `report.json`;
- `report.md`.

`.vanrot/release-dry-run/` stays local-only and must be ignored by git.

## Reporting

Console output should be concise and readable:

- step name;
- pass/fail/skip status;
- short reason;
- failure hint;
- kept artifact path when available.

`report.json` is the machine-readable contract. It records:

- start and end timestamps;
- repository root;
- package list;
- package tarball paths;
- command steps;
- exit codes;
- skipped checks;
- warnings;
- failure details;
- artifact paths.

`report.md` is the human-readable handoff for failed or kept runs. It records:

- summary;
- failed step;
- relevant command;
- output tail;
- next action.

## Failure Rules

Required failures fail `pnpm verify`:

- package metadata validation failure;
- package packing failure;
- `pnpm` consumer install failure;
- `pnpm` consumer workflow failure;
- `npm` consumer install failure;
- `npm` import or entrypoint smoke failure;
- stale or missing AI bundle artifacts when the packed workflow requires them;
- Homebrew formula failure when Homebrew exists.

Allowed skips do not fail `pnpm verify`:

- Homebrew not installed;
- Homebrew unavailable on the current platform.

Allowed skips must still be explicit in console output and reports. Silent skips are not acceptable.

## Testing Strategy

Unit tests cover the verifier's decision logic without running expensive package installs:

- package discovery;
- metadata validation;
- keep/delete artifact decisions;
- report shape;
- Homebrew skip and failure classification;
- command result summarization.

The real install/build workflow is verified by `pnpm verify:release-dry-run` itself, which runs inside root `pnpm verify`.

## Documentation And Tracker Updates

Phase 26 implementation must update:

- `docs/superpowers/plans/Phase-26.md`;
- `docs/superpowers/feature-maturity.md`;
- `docs/superpowers/final-tdd-inventory.md`;
- `docs/vanrot-presentation.html`;
- command references or release docs if the verifier adds user-visible npm/Homebrew install guidance.

## Acceptance Criteria

Phase 26 is complete when:

- `pnpm verify:release-dry-run` exists and runs the strict local release gate;
- root `pnpm verify` includes `verify:release-dry-run`;
- public Vanrot packages are packed and installed into a `pnpm` consumer app;
- the `pnpm` consumer app exercises a real generated-app workflow;
- packed artifacts pass a lightweight `npm` consumer smoke test;
- package metadata checks cover names, versions, exports, bins, files, engines, and dependency shape;
- Homebrew local testing runs when `brew` exists and reports explicit skips when it does not;
- failure and `--keep` runs write `.vanrot/release-dry-run/report.json` and `report.md`;
- successful default runs clean up temporary artifacts;
- `pnpm verify`, `pnpm audit --audit-level moderate`, `pnpm audit:core`, and `git diff --check` pass;
- the phase ledger, final TDD inventory, presentation, and plan are synchronized.
