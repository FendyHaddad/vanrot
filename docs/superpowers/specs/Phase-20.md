# Phase 20 - Store Hardening

## Goal

Phase 20 hardens `@vanrot/store` for larger apps without changing its identity.
The package should remain signal-first, readable, and useful to new programmers and AI-generated applications.

The work adds inspection contracts, deterministic state snapshots, stronger effect/concurrency evidence, and
Vanrot-native event observation. It does not add RxJS, Redux, or a new devtools product.

## Approved Direction

Phase 20 uses a **Vanrot-Native Store Inspection** approach.

Approved decisions:

- Keep `@vanrot/store` as the core package being hardened.
- Do not add RxJS interop. Vanrot should provide its own action, state, effect, and snapshot observation helpers.
- Do not adopt Redux as a compatibility target. Keep action history, replay, and time travel as Vanrot-native concepts.
- Do not create a new devtools package or a store-owned debug UI in this phase.
- Expose a headless inspection adapter that existing `@vanrot/devtools` can consume in a later devtools repair pass.
- Keep inspection disabled by default in production.
- Keep metadata and annotation work, such as `@Observable` and `@Deprecated`, out of this phase and parked in the future
  pipeline.

## Current Foundation

Phase 19 shipped the core store package:

- `defineState`
- `defineActions`
- `defineReducer`
- `defineSelectors`
- `defineEffects`
- `effect`
- `useStore`
- `StoreError`
- effect policies for `latestBy`, `skipWhen`, `cancelWhen`, `timeout`, `retry`, and trace names
- the `examples/store-foundation` workspace
- the `/docs/store` package documentation surface

Phase 20 builds on those contracts. It should avoid rewriting the core mental model unless a hardening requirement proves
that the current API cannot stay reliable.

## Architecture

`@vanrot/store` gains a small inspection layer beside the existing store runtime.

```text
store dispatch
  -> reducer
  -> state update
  -> effect scheduling
  -> inspection event stream
  -> bounded trace history
  -> snapshots and replay data
  -> future @vanrot/devtools consumer
```

The inspection layer is headless. It emits typed data and owns deterministic replay helpers. UI rendering, browser
extension packaging, and full devtools shell behavior remain outside Phase 20.

Normal store usage must not require the inspection layer:

```ts
const claims = useStore(claimsStore);
claims.action.loadClaims.start({ accountId });
```

Hardening APIs are opt-in:

```ts
const inspector = inspectStore(claimsStore, {
  historyLimit: 200,
  snapshots: "manual",
});

const unsubscribe = inspector.observe((event) => {
  console.log(event.kind, event.action?.type);
});
```

The exact API names can change in the implementation plan, but the final surface must stay readable and English-like.

## Store Inspection Events

Phase 20 should introduce a typed event model that can describe store behavior without requiring a UI.

Required event families:

- dispatch started
- reducer completed
- state changed
- action skipped
- effect started
- effect retried
- effect timed out
- effect succeeded
- effect failed
- effect canceled
- stale write prevented
- snapshot created
- replay started
- replay stepped
- replay completed
- history reset

Each event should include stable fields where relevant:

- store name
- action type
- action metadata
- payload summary
- previous state snapshot id
- next state snapshot id
- changed keys
- effect name or trace name
- concurrency key
- cancellation reason
- retry attempt
- timeout duration
- duration
- timestamp or monotonic sequence id

Payload and state summaries must avoid leaking secrets by default. Full state access should be an explicit development
choice.

## Effect And Concurrency Hardening

Phase 19 already supports runtime behavior for `latestBy`, `cancelWhen`, `skipWhen`, `timeout`, and `retry`.
Phase 20 makes those behaviors inspectable and easier to trust.

Required behavior:

- `latestBy` records the key that caused an older run to be canceled.
- `cancelWhen` records the action that canceled a run.
- `skipWhen` records the reason that an effect did not start.
- `timeout` records the timeout duration and the action/effect that timed out.
- `retry` records attempt count, delay if present, final success, or final failure.
- stale writes after cancellation are prevented and produce inspection evidence.
- concurrent runs are grouped by effect and key.
- active effect state can be read without mutating store state.

Effect inspection should help answer:

- Which effect is running?
- Which action started it?
- Which key controls concurrency?
- Why was an older run canceled?
- Did a canceled or timed-out run attempt to write stale state?
- Which retry attempt produced the final result?

## Vanrot-Native Observation

Phase 20 replaces the old RxJS idea with Vanrot-native observation.

The store should expose simple subscription helpers for:

- action traces
- state snapshots
- changed-key summaries
- effect lifecycle events
- replay events

Observation must be dependency-free. It should use plain callbacks and unsubscribe functions. If future framework features
need richer stream helpers, they should build on this contract instead of importing RxJS.

This lets users do common stream-like jobs in Vanrot terms:

- log every action in development;
- trigger app-local work from a specific action;
- observe selector-relevant changes;
- record history for support reproduction;
- connect future devtools without coupling the store package to a UI.

## Snapshots And Replay

Phase 20 should add deterministic snapshot and replay contracts.

Snapshot requirements:

- stable snapshot ids;
- previous and next snapshot linkage for each dispatch;
- bounded history with a configurable limit;
- manual snapshot creation;
- reset/clear helpers for tests;
- safe summary mode by default;
- optional full-state snapshots in development.

Replay requirements:

- replay a recorded action sequence from an initial snapshot;
- step forward one action at a time;
- report if an action is not replayable;
- skip effect execution during pure reducer replay unless explicitly enabled;
- preserve state immutability expectations;
- produce replay events that future tools can display.

Time travel is implemented as deterministic replay data, not as a UI feature in Phase 20.

## Store Protocol Boundary

Phase 20 should define a versioned protocol shape for future tools.

Recommended protocol id:

```text
vanrot.store.inspection.v1
```

The protocol is a TypeScript contract exported from `@vanrot/store`. It should be serializable enough for future
`@vanrot/devtools` and Vite middleware to forward it across browser boundaries, but Phase 20 does not need to build the
full devtools bridge UI.

The protocol must be Vanrot-owned. It can learn from familiar devtool workflows, but it should not require Redux, RxJS,
or external browser extensions to be useful.

## Error Handling

Inspection should fail soft.

- If inspection is disabled, store behavior is unchanged.
- If an observer throws, the store catches the observer error and continues dispatching.
- Observer errors are reported through a separate inspection error event or test-visible diagnostic.
- Snapshot limits should evict old entries predictably.
- Replay should return structured failure results instead of throwing for normal unsupported cases.
- Production builds should not accidentally retain large histories.

## Docs IA

Store remains a package parent in the framework docs.

Required documentation surface:

- parent label: `Store`
- parent route: `/docs/store`
- child route: `/docs/store/hardening`
- child route: `/docs/store/inspection`
- child route: `/docs/store/replay`

The child routes must be real pages with article keys, route-to-article mapping, site data entries, sidebar entries,
generated AI-doc entries, and route/render tests. Do not hide child guides inside parent-page anchors.

Docs should teach in this order:

1. normal store usage;
2. effect cancellation and concurrency hardening;
3. action/state/effect inspection;
4. snapshots and replay;
5. when plain signals are enough;
6. future `@vanrot/devtools` consumption.

The docs should explicitly say that RxJS is not part of Vanrot store and that Redux is not a dependency or compatibility
target.

## Examples

Update `examples/store-foundation` or add a focused companion example if the existing example becomes too dense.

Example coverage should show:

- duplicate requests with `latestBy`;
- action canceling another effect through `cancelWhen`;
- retry and timeout inspection;
- a stale write prevented after cancellation;
- a bounded trace history;
- a manual snapshot;
- pure reducer replay;
- Vanrot-native observation through callback/unsubscribe helpers.

Examples must follow Vanrot project rules:

- use guard clauses instead of nested control flow;
- use signals for state;
- keep UI markup in HTML;
- keep application logic out of HTML;
- use role-based file suffixes;
- avoid repeated string literals by adding named sources of truth.

## Testing And Verification

Required focused tests:

- inspection events for dispatch and reducer completion;
- state changed events with changed-key summaries;
- effect start, success, error, cancel, timeout, retry, and stale-write prevention events;
- `latestBy` cancellation records the concurrency key;
- `cancelWhen` records the canceling action;
- observer unsubscribe behavior;
- observer error isolation;
- bounded history eviction;
- manual snapshot creation;
- pure reducer replay;
- replay unsupported-case reporting;
- production-disabled behavior;
- package public exports;
- size budget for `@vanrot/store`;
- example coverage for hardening flows;
- docs route and sidebar coverage for every Store child page;
- generated AI-doc coverage for new Store pages and public APIs.

Final verification remains:

```sh
pnpm verify
```

## Out Of Scope

Out of scope for Phase 20:

- RxJS interop;
- Redux compatibility helpers;
- a new `@vanrot/metadata` package;
- decorator or annotation APIs such as `@Observable` or `@Deprecated`;
- rebuilding the existing `@vanrot/devtools` shell;
- a browser extension Store panel;
- production-enabled trace collection by default;
- compiler syntax for store declarations.

## Future Pipeline Moves

Move these ideas out of Phase 20 and keep them parked:

- `@vanrot/devtools` shell repair and Store panel integration;
- framework metadata/annotation APIs such as `@Observable`, `@Deprecated`, `@Experimental`, `@Internal`, and `@Docs`,
  preferably owned by existing framework packages instead of a standalone metadata package;
- richer editor/language-server use of store inspection metadata.

## Acceptance Criteria

Phase 20 is complete when:

- `@vanrot/store` exposes stable headless inspection, snapshot, observation, and replay contracts;
- effect cancellation and concurrency behavior can be inspected through typed events;
- stale writes after canceled effects are prevented and tested;
- RxJS and Redux wording is removed from active Store hardening docs;
- Store docs include real child pages for hardening, inspection, and replay;
- AI docs and framework reference data include the new Store hardening surface;
- examples show realistic enterprise store hardening without teaching external reactive libraries;
- the future pipeline parks devtools repair and metadata annotations;
- `pnpm verify` passes.
