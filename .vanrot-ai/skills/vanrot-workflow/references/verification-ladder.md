# Vanrot Verification Ladder

Start narrow. Escalate only when needed.

## First Proof

Use a focused source check or test that proves the convention or bug path:

- `rg` for ownership checks;
- focused Vitest file;
- affected package test;
- script verifier for the touched subsystem.

## Second Proof

Run affected app/package typecheck or build:

- site page work: `pnpm --filter @vanrot/vanrot-site build`
- package work: package-specific test/build
- runtime work: runtime tests and size when relevant

## Frontend Proof

For route-visible frontend changes:

1. restart the site dev server only near the end;
2. verify the route responds;
3. check rendered DOM and page errors, not HTTP 200 alone.

## Broad Proof

Run full `pnpm verify` when:

- the user asks if it is safe to commit/publish;
- release/publish lane is active;
- shared runtime/compiler/package behavior changed;
- broad source/docs metadata changed enough that narrow proof is insufficient.

Normal coding turns should not loop full verify repeatedly. One full run is enough unless a failure is fixed and rerun is required.

## Long Commands

Use logs or context-mode summaries for large output. If a command runs longer than expected, stop polling and choose a bounded next step.
