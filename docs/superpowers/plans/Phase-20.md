# Phase 20 Store Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Do not use subagents, parallel agents, worktrees, `git add`, `git commit`, or `git push` in this repository unless the user explicitly asks. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden `@vanrot/store` with headless inspection, Vanrot-native observation, snapshots, replay contracts, and stronger effect/concurrency evidence without adding RxJS, Redux, or store-owned UI.

**Architecture:** Keep `@vanrot/store` headless. Add focused inspection, history, snapshot, and replay modules beside the current action/reducer/effect runtime, then wire `store.ts` so dispatch and effect execution publish typed events through an opt-in inspector. Docs, examples, AI docs, and trackers ship in the same phase; existing `@vanrot/devtools` repair stays parked in the future pipeline.

**Tech Stack:** TypeScript, Vitest, pnpm workspaces, `@vanrot/runtime` signals, Vanrot docs registry, AI docs generator, Node verification scripts.

---

## Source Spec

- `docs/superpowers/specs/Phase-20.md`

## Execution Rules

- Follow `AGENTS.md` and the Phase 20 spec.
- Keep `@vanrot/store` usable without inspection.
- Keep inspection disabled by default for production users.
- Do not add RxJS, Redux, `@vanrot/metadata`, decorators, or a new devtools UI.
- Keep UI in HTML and logic in TypeScript for examples and docs previews.
- Prefer named constants over repeated strings.
- Run focused tests after each package module task.
- Run `pnpm verify:phase-docs` after tracker/spec/plan edits.
- Run `pnpm verify` before marking Phase 20 complete.
- Leave changes unstaged unless the user explicitly asks for staging or commits.

## Planned File Structure

Create:

- `packages/store/src/inspection-types.ts`: public inspection protocol, event, summary, observer, history, snapshot, and replay types.
- `packages/store/src/inspection-history.ts`: bounded event history, observer registry, observer error isolation, and history reset helpers.
- `packages/store/src/snapshots.ts`: snapshot id generation, safe state summaries, changed-key summaries, and snapshot records.
- `packages/store/src/inspection.ts`: `inspectStore(...)`, internal inspection controller, production-disabled behavior, public inspector facade.
- `packages/store/src/replay.ts`: pure reducer replay, replay step results, replay unsupported-case reporting.
- `packages/store/tests/inspection.test.ts`: dispatch, reducer, state change, observer, history, and production-disabled tests.
- `packages/store/tests/effect-inspection.test.ts`: effect lifecycle, timeout, retry, cancellation, concurrency key, and stale-write tests.
- `packages/store/tests/replay.test.ts`: snapshot and reducer replay tests.
- `examples/store-foundation/src/store/claims.inspection.ts`: example inspection constants and observer setup.

Modify:

- `packages/store/src/constants.ts`: protocol id, event kind constants, snapshot prefix, default history limit.
- `packages/store/src/index.ts`: public exports for inspection, snapshots, replay, and protocol types.
- `packages/store/src/types.ts`: small shared type additions only when needed by existing store/effect signatures.
- `packages/store/src/store.ts`: wire dispatch, reducer, state update, effect execution, and stale-write checks to the inspection controller.
- `packages/store/src/effects.ts`: expose effect policy metadata needed by inspection without coupling effects to UI.
- `packages/store/tests/package.test.ts`: public export coverage.
- `packages/store/tests/store.test.ts`: dispatch behavior stays unchanged when inspection is unused.
- `packages/store/tests/effects.test.ts`: existing effect behavior still passes with inspection hooks present.
- `packages/store/tests/size.test.ts`: update budget assertion only if measured package size changes.
- `examples/store-foundation/src/store/claims.effects.ts`: demonstrate `latestBy`, `cancelWhen`, timeout, retry, and stale-write prevention flows.
- `examples/store-foundation/src/store/claims.effect-options.ts`: add named inspection strings and timing constants.
- `examples/store-foundation/src/store/claims.store.ts`: expose example store with inspection-ready names.
- `examples/store-foundation/tests/store-foundation.test.ts`: example hardening coverage.
- `apps/vanrot-site/src/docs/site-data.ts`: article keys for Store hardening, inspection, and replay pages.
- `apps/vanrot-site/src/docs/site-data.json`: real Store child article content.
- `apps/vanrot-site/src/docs/site-navigation.ts`: Store child nav entries.
- `apps/vanrot-site/src/routes.ts`: `/docs/store/hardening`, `/docs/store/inspection`, `/docs/store/replay`.
- `apps/vanrot-site/src/docs/framework-reference.json`: new Store public exports and route metadata.
- `apps/vanrot-site/tests/site-data.test.ts`: Store child article and nav assertions.
- `apps/vanrot-site/tests/site-pages.test.ts`: Store child routes render.
- `apps/vanrot-site/tests/framework-reference.test.ts`: new Store public API and route metadata coverage.
- `docs/ai/index.json`: generated AI docs index after docs changes.
- `docs/ai/knowledge/docs.md`: generated Store docs knowledge.
- `docs/ai/knowledge/examples.md`: generated Store example knowledge.
- `docs/ai/knowledge/packages.md`: generated Store package knowledge.
- `docs/ai/knowledge/public-api.md`: generated Store public API knowledge.
- `docs/ai/knowledge/routes.md`: generated Store route knowledge.
- `docs/ai/manifest.json`: generated AI docs manifest.
- `docs/superpowers/final-tdd-inventory.md`: Phase 20 store inspection, replay, docs, examples, and tests.
- `docs/superpowers/feature-maturity.md`: mark Phase 20 complete only after final verification passes.
- `docs/superpowers/future-pipeline.md`: mark active Store Hardening ideas shipped and leave Devtools Shell Repair plus Framework Annotation Metadata parked.
- `docs/superpowers/plans/Phase-20.md`: check off tasks as they pass.

## Public Contract Target

The final names should stay close to this contract unless implementation proves a clearer name:

```ts
export {
  inspectStore,
  storeInspectionProtocol,
  storeInspectionEventKind,
  storeInspectionSnapshotMode,
} from "./inspection.js";

export type {
  StoreInspectionEvent,
  StoreInspectionEventKind,
  StoreInspectionObserver,
  StoreInspectionOptions,
  StoreInspector,
  StoreInspectionHistory,
  StoreInspectionSnapshot,
  StoreReplayResult,
  StoreReplayStep,
} from "./inspection-types.js";
```

Recommended user-facing shape:

```ts
const inspector = inspectStore(claimsStore, {
  historyLimit: 200,
  snapshots: "manual",
});

const unsubscribe = inspector.observe((event) => {
  if (event.kind !== storeInspectionEventKind.stateChanged) {
    return;
  }

  console.log(event.changedKeys);
});

const snapshot = inspector.snapshot("before reload");
const replay = inspector.replayFrom(snapshot.id);

unsubscribe();
```

## Task 1: Public Contract Red Tests

**Files:**

- Modify: `packages/store/tests/package.test.ts`
- Create: `packages/store/tests/inspection.test.ts`
- Create: `packages/store/tests/replay.test.ts`

- [x] **Step 1: Add public export expectations**

Add assertions to `packages/store/tests/package.test.ts`:

```ts
import * as store from "../src/index.js";

it("exports store inspection contracts", () => {
  expect(store.inspectStore).toBeTypeOf("function");
  expect(store.storeInspectionProtocol).toBe("vanrot.store.inspection.v1");
  expect(store.storeInspectionEventKind.dispatchStarted).toBe("store.dispatch.started");
  expect(store.storeInspectionSnapshotMode.manual).toBe("manual");
});
```

- [x] **Step 2: Add first inspection red test**

Create `packages/store/tests/inspection.test.ts` with this starting test:

```ts
import { describe, expect, it } from "vitest";

import {
  actionSet,
  defineActions,
  defineReducer,
  defineSelectors,
  defineState,
  defineStore,
  inspectStore,
  storeInspectionEventKind,
  useStore,
} from "../src/index.js";

type CounterState = {
  readonly count: number;
};

function createCounterStore() {
  const state = defineState<CounterState>({ count: 0 });
  const actions = defineActions("counter", {
    increment: actionSet<{ readonly amount: number }>(),
  });
  const reducer = defineReducer(state).on(actions.increment.start).patch(({ state: current, action }) => ({
    count: current.count + action.amount,
  }));
  const selectors = defineSelectors(state).count((state) => state.count);

  return defineStore({
    name: "counter",
    state,
    actions,
    selectors,
    reducer,
    effects: {},
  });
}

describe("store inspection", () => {
  it("observes dispatch, reducer, and state change events", () => {
    const counterDefinition = createCounterStore();
    const counter = useStore(counterDefinition);
    const inspector = inspectStore(counter, { historyLimit: 10, snapshots: "automatic" });
    const events: string[] = [];

    inspector.observe((event) => {
      events.push(event.kind);
    });

    counter.action.increment.start({ amount: 2 });

    expect(events).toEqual([
      storeInspectionEventKind.dispatchStarted,
      storeInspectionEventKind.reducerCompleted,
      storeInspectionEventKind.stateChanged,
    ]);
    expect(inspector.history().map((event) => event.kind)).toEqual(events);
    expect(counter.state.current()).toEqual({ count: 2 });
  });
});
```

- [x] **Step 3: Add first replay red test**

Create `packages/store/tests/replay.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import {
  actionSet,
  defineActions,
  defineReducer,
  defineSelectors,
  defineState,
  defineStore,
  inspectStore,
  useStore,
} from "../src/index.js";

type CounterState = {
  readonly count: number;
};

function createCounterStore() {
  const state = defineState<CounterState>({ count: 0 });
  const actions = defineActions("counter", {
    increment: actionSet<{ readonly amount: number }>(),
  });
  const reducer = defineReducer(state).on(actions.increment.start).patch(({ state: current, action }) => ({
    count: current.count + action.amount,
  }));
  const selectors = defineSelectors(state).count((state) => state.count);

  return defineStore({
    name: "counter",
    state,
    actions,
    selectors,
    reducer,
    effects: {},
  });
}

describe("store replay", () => {
  it("replays reducer actions from a manual snapshot", () => {
    const counterDefinition = createCounterStore();
    const counter = useStore(counterDefinition);
    const inspector = inspectStore(counter, { historyLimit: 10, snapshots: "manual" });

    const initial = inspector.snapshot("initial");
    counter.action.increment.start({ amount: 1 });
    counter.action.increment.start({ amount: 4 });

    const replay = inspector.replayFrom(initial.id);

    expect(replay.ok).toBe(true);
    expect(replay.finalState).toEqual({ count: 5 });
    expect(replay.steps.map((step) => step.action.type)).toEqual([
      "counter/increment/start",
      "counter/increment/start",
    ]);
  });
});
```

- [x] **Step 4: Run the red tests**

Run:

```sh
pnpm --filter @vanrot/store test -- inspection.test.ts replay.test.ts package.test.ts
```

Expected: fail because `inspectStore`, `storeInspectionProtocol`, `storeInspectionEventKind`, and replay contracts do not exist.

## Task 2: Inspection Types, Constants, And Exports

**Files:**

- Create: `packages/store/src/inspection-types.ts`
- Modify: `packages/store/src/constants.ts`
- Modify: `packages/store/src/index.ts`

- [x] **Step 1: Add constants**

Add to `packages/store/src/constants.ts`:

```ts
export const storeInspectionProtocol = "vanrot.store.inspection.v1";

export const storeInspectionEventKind = {
  dispatchStarted: "store.dispatch.started",
  reducerCompleted: "store.reducer.completed",
  stateChanged: "store.state.changed",
  actionSkipped: "store.action.skipped",
  effectStarted: "store.effect.started",
  effectRetried: "store.effect.retried",
  effectTimedOut: "store.effect.timed-out",
  effectSucceeded: "store.effect.succeeded",
  effectFailed: "store.effect.failed",
  effectCanceled: "store.effect.canceled",
  staleWritePrevented: "store.effect.stale-write-prevented",
  snapshotCreated: "store.snapshot.created",
  replayStarted: "store.replay.started",
  replayStepped: "store.replay.stepped",
  replayCompleted: "store.replay.completed",
  historyReset: "store.history.reset",
  observerFailed: "store.observer.failed",
} as const;

export const storeInspectionSnapshotMode = {
  automatic: "automatic",
  manual: "manual",
  off: "off",
} as const;

export const defaultStoreInspectionHistoryLimit = 100;
export const storeInspectionSnapshotIdPrefix = "store";
```

- [x] **Step 2: Add public types**

Create `packages/store/src/inspection-types.ts`:

```ts
import type { StoreAction, StoreReducer } from "./types.js";

import type {
  storeInspectionEventKind,
  storeInspectionSnapshotMode,
} from "./constants.js";

export type StoreInspectionEventKind =
  (typeof storeInspectionEventKind)[keyof typeof storeInspectionEventKind];

export type StoreInspectionSnapshotMode =
  (typeof storeInspectionSnapshotMode)[keyof typeof storeInspectionSnapshotMode];

export type StoreInspectionSummary = {
  readonly kind: "hidden" | "value";
  readonly value: unknown;
};

export type StoreInspectionSnapshot<TState extends object = Record<string, unknown>> = {
  readonly id: string;
  readonly storeName: string;
  readonly label: string | undefined;
  readonly state: TState;
  readonly summary: StoreInspectionSummary;
  readonly sequence: number;
};

export type StoreInspectionEvent<TState extends object = Record<string, unknown>> = {
  readonly kind: StoreInspectionEventKind;
  readonly protocol: "vanrot.store.inspection.v1";
  readonly sequence: number;
  readonly storeName: string;
  readonly action: StoreAction<any> | undefined;
  readonly actionType: string | undefined;
  readonly payloadSummary: StoreInspectionSummary | undefined;
  readonly previousSnapshotId: string | undefined;
  readonly nextSnapshotId: string | undefined;
  readonly changedKeys: readonly string[];
  readonly effectName: string | undefined;
  readonly concurrencyKey: string | undefined;
  readonly cancellationReason: string | undefined;
  readonly retryAttempt: number | undefined;
  readonly timeoutMs: number | undefined;
  readonly durationMs: number | undefined;
  readonly message: string | undefined;
  readonly state: TState | undefined;
};

export type StoreInspectionObserver<TState extends object = Record<string, unknown>> = (
  event: StoreInspectionEvent<TState>,
) => void;

export type StoreInspectionOptions = {
  readonly enabled?: boolean;
  readonly historyLimit?: number;
  readonly snapshots?: StoreInspectionSnapshotMode;
  readonly exposeState?: boolean;
};

export type StoreInspectionHistory<TState extends object = Record<string, unknown>> = {
  readonly events: readonly StoreInspectionEvent<TState>[];
  readonly snapshots: readonly StoreInspectionSnapshot<TState>[];
};

export type StoreReplayStep<TState extends object = Record<string, unknown>> = {
  readonly action: StoreAction<any>;
  readonly previousState: TState;
  readonly nextState: TState;
};

export type StoreReplayResult<TState extends object = Record<string, unknown>> =
  | {
      readonly ok: true;
      readonly initialSnapshotId: string;
      readonly finalState: TState;
      readonly steps: readonly StoreReplayStep<TState>[];
    }
  | {
      readonly ok: false;
      readonly reason: "snapshot-not-found" | "action-not-replayable";
      readonly message: string;
      readonly steps: readonly StoreReplayStep<TState>[];
    };

export type StoreInspector<TState extends object = Record<string, unknown>> = {
  readonly observe: (observer: StoreInspectionObserver<TState>) => () => void;
  readonly history: () => readonly StoreInspectionEvent<TState>[];
  readonly snapshots: () => readonly StoreInspectionSnapshot<TState>[];
  readonly snapshot: (label?: string) => StoreInspectionSnapshot<TState>;
  readonly clearHistory: () => void;
  readonly replayFrom: (snapshotId: string) => StoreReplayResult<TState>;
};

export type StoreReplayReducer<TState extends object> = StoreReducer<TState>;
```

- [x] **Step 3: Export constants and types**

Update `packages/store/src/index.ts`:

```ts
export {
  defaultStoreInspectionHistoryLimit,
  storeActionTypeSeparator,
  storeEffectPhase,
  storeInspectionEventKind,
  storeInspectionProtocol,
  storeInspectionSnapshotIdPrefix,
  storeInspectionSnapshotMode,
  storePackageName,
  storeSizeBudget,
} from "./constants.js";
export { inspectStore } from "./inspection.js";

export type {
  StoreInspectionEvent,
  StoreInspectionEventKind,
  StoreInspectionHistory,
  StoreInspectionObserver,
  StoreInspectionOptions,
  StoreInspectionSnapshot,
  StoreInspectionSnapshotMode,
  StoreInspector,
  StoreReplayResult,
  StoreReplayStep,
} from "./inspection-types.js";
```

Keep existing exports in the file. Add these beside them rather than replacing unrelated exports.

- [x] **Step 4: Run export tests**

Run:

```sh
pnpm --filter @vanrot/store test -- package.test.ts
```

Expected: fail only because `./inspection.js` does not exist yet.

## Task 3: History, Snapshots, And Inspector Facade

**Files:**

- Create: `packages/store/src/inspection-history.ts`
- Create: `packages/store/src/snapshots.ts`
- Create: `packages/store/src/inspection.ts`
- Modify: `packages/store/src/store.ts`

- [x] **Step 1: Implement snapshot helpers**

Create `packages/store/src/snapshots.ts`:

```ts
import {
  storeInspectionSnapshotIdPrefix,
} from "./constants.js";
import type {
  StoreInspectionSnapshot,
  StoreInspectionSummary,
} from "./inspection-types.js";

export function summarizeInspectionValue(
  value: unknown,
  exposeState: boolean,
): StoreInspectionSummary {
  if (!exposeState) {
    return {
      kind: "hidden",
      value: "[hidden]",
    };
  }

  return {
    kind: "value",
    value,
  };
}

export function changedStateKeys<TState extends object>(
  previousState: TState,
  nextState: TState,
): readonly string[] {
  const keys = new Set([
    ...Object.keys(previousState),
    ...Object.keys(nextState),
  ]);

  return [...keys].filter((key) => {
    return !Object.is(
      previousState[key as keyof TState],
      nextState[key as keyof TState],
    );
  });
}

export function createStoreInspectionSnapshot<TState extends object>(
  storeName: string,
  state: TState,
  sequence: number,
  label: string | undefined,
  exposeState: boolean,
): StoreInspectionSnapshot<TState> {
  return {
    id: `${storeInspectionSnapshotIdPrefix}:${storeName}@${sequence}`,
    storeName,
    label,
    state,
    summary: summarizeInspectionValue(state, exposeState),
    sequence,
  };
}
```

- [x] **Step 2: Implement bounded history**

Create `packages/store/src/inspection-history.ts`:

```ts
import {
  defaultStoreInspectionHistoryLimit,
  storeInspectionEventKind,
} from "./constants.js";
import type {
  StoreInspectionEvent,
  StoreInspectionObserver,
  StoreInspectionSnapshot,
} from "./inspection-types.js";

export type StoreInspectionHistoryController<TState extends object> = {
  readonly addEvent: (event: StoreInspectionEvent<TState>) => void;
  readonly addSnapshot: (snapshot: StoreInspectionSnapshot<TState>) => void;
  readonly observe: (observer: StoreInspectionObserver<TState>) => () => void;
  readonly events: () => readonly StoreInspectionEvent<TState>[];
  readonly snapshots: () => readonly StoreInspectionSnapshot<TState>[];
  readonly clear: (storeName: string, sequence: number) => void;
};

export function createStoreInspectionHistory<TState extends object>(
  historyLimit = defaultStoreInspectionHistoryLimit,
): StoreInspectionHistoryController<TState> {
  const events: StoreInspectionEvent<TState>[] = [];
  const snapshots: StoreInspectionSnapshot<TState>[] = [];
  const observers = new Set<StoreInspectionObserver<TState>>();

  function trimHistory(): void {
    while (events.length > historyLimit) {
      events.shift();
    }

    while (snapshots.length > historyLimit) {
      snapshots.shift();
    }
  }

  function notify(event: StoreInspectionEvent<TState>): void {
    for (const observer of observers) {
      try {
        observer(event);
      } catch (error) {
        events.push({
          ...event,
          kind: storeInspectionEventKind.observerFailed,
          action: undefined,
          actionType: undefined,
          payloadSummary: undefined,
          previousSnapshotId: undefined,
          nextSnapshotId: undefined,
          changedKeys: [],
          effectName: undefined,
          concurrencyKey: undefined,
          cancellationReason: undefined,
          retryAttempt: undefined,
          timeoutMs: undefined,
          durationMs: undefined,
          message: error instanceof Error ? error.message : String(error),
          state: undefined,
        });
        trimHistory();
      }
    }
  }

  return {
    addEvent(event) {
      events.push(event);
      trimHistory();
      notify(event);
    },
    addSnapshot(snapshot) {
      snapshots.push(snapshot);
      trimHistory();
    },
    observe(observer) {
      observers.add(observer);

      return () => {
        observers.delete(observer);
      };
    },
    events() {
      return [...events];
    },
    snapshots() {
      return [...snapshots];
    },
    clear(storeName, sequence) {
      events.length = 0;
      snapshots.length = 0;
      events.push({
        kind: storeInspectionEventKind.historyReset,
        protocol: "vanrot.store.inspection.v1",
        sequence,
        storeName,
        action: undefined,
        actionType: undefined,
        payloadSummary: undefined,
        previousSnapshotId: undefined,
        nextSnapshotId: undefined,
        changedKeys: [],
        effectName: undefined,
        concurrencyKey: undefined,
        cancellationReason: undefined,
        retryAttempt: undefined,
        timeoutMs: undefined,
        durationMs: undefined,
        message: "History reset",
        state: undefined,
      });
    },
  };
}
```

- [x] **Step 3: Implement inspector facade and internal symbol**

Create `packages/store/src/inspection.ts`:

```ts
import {
  defaultStoreInspectionHistoryLimit,
  storeInspectionEventKind,
  storeInspectionProtocol,
  storeInspectionSnapshotMode,
} from "./constants.js";
import { createStoreInspectionHistory } from "./inspection-history.js";
import type {
  StoreInspectionEvent,
  StoreInspectionOptions,
  StoreInspectionSnapshot,
  StoreInspector,
  StoreReplayResult,
} from "./inspection-types.js";
import {
  changedStateKeys,
  createStoreInspectionSnapshot,
  summarizeInspectionValue,
} from "./snapshots.js";
import type { StoreAction, StoreReducer } from "./types.js";

export const storeInspectionControllerKey: unique symbol = Symbol("vanrot.store.inspection");

export type StoreInspectionController<TState extends object> = {
  readonly activate: (options: StoreInspectionOptions) => StoreInspector<TState>;
  readonly emitDispatch: (action: StoreAction<any>, previousState: TState) => void;
  readonly emitReducerCompleted: (
    action: StoreAction<any>,
    previousState: TState,
    nextState: TState,
  ) => void;
  readonly emitStateChanged: (
    action: StoreAction<any>,
    previousState: TState,
    nextState: TState,
  ) => void;
  readonly emitEvent: (event: Partial<StoreInspectionEvent<TState>>) => void;
  readonly inspector: StoreInspector<TState>;
};

export type StoreInspectionHost<TState extends object> = {
  readonly name: string;
  readonly state: {
    readonly current: () => TState;
  };
  readonly [storeInspectionControllerKey]?: StoreInspectionController<TState>;
};

export function inspectStore<TState extends object>(
  store: StoreInspectionHost<TState>,
  options: StoreInspectionOptions = {},
): StoreInspector<TState> {
  const enabled = options.enabled ?? true;

  if (!enabled) {
    return createDisabledInspector(store);
  }

  const controller = store[storeInspectionControllerKey];

  if (controller) {
    return controller.activate(options);
  }

  return createDisabledInspector(store);
}

export function createStoreInspectionController<TState extends object>(
  storeName: string,
  readState: () => TState,
  reducer: StoreReducer<TState>,
  options: StoreInspectionOptions = {},
): StoreInspectionController<TState> {
  let sequence = 0;
  let enabled = options.enabled ?? false;
  let exposeState = options.exposeState ?? false;
  let snapshotMode = options.snapshots ?? storeInspectionSnapshotMode.automatic;
  const history = createStoreInspectionHistory<TState>(
    options.historyLimit ?? defaultStoreInspectionHistoryLimit,
  );
  const actionLog: StoreAction<any>[] = [];

  function nextSequence(): number {
    sequence += 1;

    return sequence;
  }

  function createSnapshot(label: string | undefined): StoreInspectionSnapshot<TState> {
    const snapshot = createStoreInspectionSnapshot(
      storeName,
      readState(),
      nextSequence(),
      label,
      exposeState,
    );
    history.addSnapshot(snapshot);

    return snapshot;
  }

  function createAutomaticSnapshot(label: string): StoreInspectionSnapshot<TState> | undefined {
    if (snapshotMode !== storeInspectionSnapshotMode.automatic) {
      return undefined;
    }

    return createSnapshot(label);
  }

  function emitEvent(event: Partial<StoreInspectionEvent<TState>>): void {
    if (!enabled) {
      return;
    }

    history.addEvent({
      kind: event.kind ?? storeInspectionEventKind.dispatchStarted,
      protocol: storeInspectionProtocol,
      sequence: event.sequence ?? nextSequence(),
      storeName,
      action: event.action,
      actionType: event.actionType,
      payloadSummary: event.payloadSummary,
      previousSnapshotId: event.previousSnapshotId,
      nextSnapshotId: event.nextSnapshotId,
      changedKeys: event.changedKeys ?? [],
      effectName: event.effectName,
      concurrencyKey: event.concurrencyKey,
      cancellationReason: event.cancellationReason,
      retryAttempt: event.retryAttempt,
      timeoutMs: event.timeoutMs,
      durationMs: event.durationMs,
      message: event.message,
      state: event.state,
    });
  }

  const inspector: StoreInspector<TState> = {
    observe: history.observe,
    history: history.events,
    snapshots: history.snapshots,
    snapshot: createSnapshot,
    clearHistory() {
      history.clear(storeName, nextSequence());
    },
    replayFrom(snapshotId) {
      const initial = history.snapshots().find((snapshot) => snapshot.id === snapshotId);

      if (!initial) {
        return {
          ok: false,
          reason: "snapshot-not-found",
          message: `Snapshot ${snapshotId} was not found.`,
          steps: [],
        };
      }

      const steps = actionLog.reduce<StoreReplayResult<TState>["steps"]>((items, action) => {
        const previousState = items.at(-1)?.nextState ?? initial.state;
        const nextState = reducer.reduce(previousState, action);

        return [
          ...items,
          {
            action,
            previousState,
            nextState,
          },
        ];
      }, []);

      return {
        ok: true,
        initialSnapshotId: initial.id,
        finalState: steps.at(-1)?.nextState ?? initial.state,
        steps,
      };
    },
  };

  return {
    activate(nextOptions) {
      enabled = nextOptions.enabled ?? true;
      exposeState = nextOptions.exposeState ?? exposeState;
      snapshotMode = nextOptions.snapshots ?? snapshotMode;

      return inspector;
    },
    emitDispatch(action, previousState) {
      if (!enabled) {
        return;
      }

      actionLog.push(action);
      const snapshot = createAutomaticSnapshot("before dispatch");
      emitEvent({
        kind: storeInspectionEventKind.dispatchStarted,
        action,
        actionType: action.type,
        payloadSummary: summarizeInspectionValue(action, exposeState),
        previousSnapshotId: snapshot?.id,
        state: exposeState ? previousState : undefined,
      });
    },
    emitReducerCompleted(action, previousState, nextState) {
      emitEvent({
        kind: storeInspectionEventKind.reducerCompleted,
        action,
        actionType: action.type,
        changedKeys: changedStateKeys(previousState, nextState),
        state: exposeState ? nextState : undefined,
      });
    },
    emitStateChanged(action, previousState, nextState) {
      const snapshot = createAutomaticSnapshot("after state change");
      emitEvent({
        kind: storeInspectionEventKind.stateChanged,
        action,
        actionType: action.type,
        changedKeys: changedStateKeys(previousState, nextState),
        nextSnapshotId: snapshot?.id,
        state: exposeState ? nextState : undefined,
      });
    },
    emitEvent,
    inspector,
  };
}

function createDisabledInspector<TState extends object>(
  store: StoreInspectionHost<TState>,
): StoreInspector<TState> {
  return {
    observe() {
      return () => undefined;
    },
    history() {
      return [];
    },
    snapshots() {
      return [];
    },
    snapshot(label) {
      return createStoreInspectionSnapshot(store.name, store.state.current(), 0, label, false);
    },
    clearHistory() {
      return undefined;
    },
    replayFrom(snapshotId) {
      return {
        ok: false,
        reason: "snapshot-not-found",
        message: `Inspection is disabled; snapshot ${snapshotId} was not recorded.`,
        steps: [],
      };
    },
  };
}
```

- [x] **Step 4: Attach controller in store instances**

Modify `packages/store/src/store.ts` imports:

```ts
import {
  createStoreInspectionController,
  storeInspectionControllerKey,
} from "./inspection.js";
```

Inside `defineStore(...)`, create the controller before `dispatch` returns the instance:

```ts
const inspection = createStoreInspectionController(
  definition.name,
  definition.state.current,
  definition.reducer,
);
```

In `dispatch`, emit the first three events:

```ts
const dispatch = (action: StoreAction<any>) => {
  const previousState = definition.state.current();

  inspection.emitDispatch(action, previousState);

  const nextState = definition.reducer.reduce(previousState, action);

  inspection.emitReducerCompleted(action, previousState, nextState);
  definition.state.set(nextState);
  inspection.emitStateChanged(action, previousState, nextState);

  cancelMatchingEffects(definition.effects, activeEffects, action);

  void runEffects(
    definition,
    dispatch,
    action,
    previousState,
    activeEffects,
    inspection,
  );
};
```

Attach the controller to the returned instance through the inspection symbol:

```ts
const storeInstance = {
  name: definition.name,
  state: definition.state,
  action: bindActions(definition.actions, dispatch),
  select: bindSelectors(definition.state, definition.selectors),
  dispatch,
  effects: definition.effects,
  [storeInspectionControllerKey]: inspection,
} as StoreInstance<TState, TActions, TSelectors, TEffects> & {
  readonly [storeInspectionControllerKey]: StoreInspectionController<TState>;
};

return storeInstance;
```

If TypeScript cannot see `StoreInspectionController`, import it as a type from `packages/store/src/inspection.ts`. Do not add `reducer` to the public `StoreInstance` surface.

- [x] **Step 5: Run inspection tests**

Run:

```sh
pnpm --filter @vanrot/store test -- inspection.test.ts package.test.ts store.test.ts
```

Expected: inspection and package tests pass; any type errors point to missing `StoreInstance` or import updates.

## Task 4: Dispatch And Observer Behavior Coverage

**Files:**

- Modify: `packages/store/tests/inspection.test.ts`
- Modify: `packages/store/src/inspection-history.ts`
- Modify: `packages/store/src/inspection.ts`
- Modify: `packages/store/tests/store.test.ts`

- [x] **Step 1: Add observer unsubscribe test**

Append to `packages/store/tests/inspection.test.ts`:

```ts
it("stops notifying an observer after unsubscribe", () => {
  const counterDefinition = createCounterStore();
  const counter = useStore(counterDefinition);
  const inspector = inspectStore(counter, { historyLimit: 10 });
  const events: string[] = [];

  const unsubscribe = inspector.observe((event) => {
    events.push(event.kind);
  });

  unsubscribe();
  counter.action.increment.start({ amount: 1 });

  expect(events).toEqual([]);
  expect(inspector.history().length).toBeGreaterThan(0);
});
```

- [x] **Step 2: Add observer error isolation test**

Append:

```ts
it("isolates observer errors from dispatch", () => {
  const counterDefinition = createCounterStore();
  const counter = useStore(counterDefinition);
  const inspector = inspectStore(counter, { historyLimit: 10 });

  inspector.observe(() => {
    throw new Error("observer failed");
  });

  expect(() => counter.action.increment.start({ amount: 1 })).not.toThrow();
  expect(counter.state.current()).toEqual({ count: 1 });
  expect(inspector.history().some((event) => event.kind === storeInspectionEventKind.observerFailed)).toBe(true);
});
```

- [x] **Step 3: Add bounded history test**

Append:

```ts
it("keeps bounded event history", () => {
  const counterDefinition = createCounterStore();
  const counter = useStore(counterDefinition);
  const inspector = inspectStore(counter, { historyLimit: 4 });

  counter.action.increment.start({ amount: 1 });
  counter.action.increment.start({ amount: 1 });
  counter.action.increment.start({ amount: 1 });

  expect(inspector.history()).toHaveLength(4);
  expect(inspector.history().at(-1)?.kind).toBe(storeInspectionEventKind.stateChanged);
});
```

- [x] **Step 4: Add disabled inspector test**

Append:

```ts
it("can be disabled for production-like usage", () => {
  const counterDefinition = createCounterStore();
  const counter = useStore(counterDefinition);
  const inspector = inspectStore(counter, { enabled: false });

  counter.action.increment.start({ amount: 3 });

  expect(inspector.history()).toEqual([]);
  expect(inspector.snapshots()).toEqual([]);
  expect(counter.state.current()).toEqual({ count: 3 });
});
```

- [x] **Step 5: Run inspection coverage**

Run:

```sh
pnpm --filter @vanrot/store test -- inspection.test.ts store.test.ts
```

Expected: pass.

## Task 5: Effect Lifecycle Inspection

**Files:**

- Create: `packages/store/tests/effect-inspection.test.ts`
- Modify: `packages/store/src/store.ts`
- Modify: `packages/store/src/effects.ts`
- Modify: `packages/store/tests/effects.test.ts`

- [x] **Step 1: Add effect lifecycle tests**

Create `packages/store/tests/effect-inspection.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";

import {
  actionSet,
  defineActions,
  defineEffects,
  defineReducer,
  defineSelectors,
  defineState,
  defineStore,
  effect,
  inspectStore,
  retryPolicy,
  storeError,
  storeInspectionEventKind,
  useStore,
} from "../src/index.js";

type LoadState = {
  readonly loading: boolean;
  readonly value: string;
  readonly error: string | undefined;
};

function createLoadStore(handler: (accountId: string, signal: AbortSignal) => Promise<string>) {
  const state = defineState<LoadState>({
    loading: false,
    value: "",
    error: undefined,
  });
  const actions = defineActions("load", {
    loadValue: actionSet<
      { readonly accountId: string },
      { readonly value: string },
      { readonly error: ReturnType<typeof storeError> }
    >(),
    cancelLoad: actionSet(),
  });
  const reducer = defineReducer(state)
    .on(actions.loadValue.start)
    .patch(() => ({ loading: true, error: undefined }))
    .on(actions.loadValue.success)
    .patch(({ action }) => ({ loading: false, value: action.value }))
    .on(actions.loadValue.error)
    .patch(({ action }) => ({ loading: false, error: action.error.message }));
  const selectors = defineSelectors(state).value((state) => state.value);
  const effects = defineEffects({
    loadValue: effect(actions.loadValue.start)
      .latestBy(({ action }) => action.accountId)
      .cancelWhen(actions.cancelLoad.start)
      .timeout(20)
      .retry(retryPolicy({ attempts: 2, delayMs: 1 }))
      .run(({ action, signal }) => handler(action.accountId, signal))
      .success((value) => actions.loadValue.success({ value: String(value) }))
      .error((error) => actions.loadValue.error({ error: storeError(error) }))
      .trace("loadValueEffect"),
  });

  return {
    actions,
    store: defineStore({
      name: "load",
      state,
      actions,
      selectors,
      reducer,
      effects,
    }),
  };
}

describe("effect inspection", () => {
  it("records effect start and success", async () => {
    const { store } = createLoadStore(async () => "ready");
    const instance = useStore(store);
    const inspector = inspectStore(instance, { historyLimit: 20 });

    instance.action.loadValue.start({ accountId: "account-1" });
    await vi.waitFor(() => {
      expect(instance.state.current().value).toBe("ready");
    });

    expect(inspector.history().map((event) => event.kind)).toContain(storeInspectionEventKind.effectStarted);
    expect(inspector.history().map((event) => event.kind)).toContain(storeInspectionEventKind.effectSucceeded);
    expect(inspector.history().find((event) => event.kind === storeInspectionEventKind.effectStarted)?.effectName)
      .toBe("loadValueEffect");
  });
});
```

- [x] **Step 2: Extend `runEffects` signature**

In `packages/store/src/store.ts`, pass `inspection` into `runEffects` as planned in Task 3. Update the helper signature:

```ts
async function runEffects<
  TState extends object,
  TActions extends Record<string, StoreActionSet<any, any, any>>,
  TSelectors extends Record<string, AnyStoreSelector<TState>>,
>(
  definition: StoreDefinition<
    TState,
    TActions,
    TSelectors,
    Record<string, StoreEffect<any>>
  >,
  dispatch: (action: StoreAction<any>) => void,
  action: StoreAction<any>,
  previousState: TState,
  activeEffects: ActiveEffectControllers,
  inspection: StoreInspectionController<TState>,
): Promise<void> {
```

- [x] **Step 3: Emit effect start and success**

Inside the loop in `runEffects`, derive a readable effect name:

```ts
const effectName = effectDefinition.policies.trace ?? effectDefinition.trigger.type;
```

After registering the effect run, emit:

```ts
inspection.emitEvent({
  kind: storeInspectionEventKind.effectStarted,
  action,
  actionType: action.type,
  effectName,
  concurrencyKey: typeof runKey === "string" ? runKey : undefined,
  state: previousState,
});
```

After `successAction` mapping but before dispatching it, emit:

```ts
inspection.emitEvent({
  kind: storeInspectionEventKind.effectSucceeded,
  action,
  actionType: action.type,
  effectName,
  concurrencyKey: typeof runKey === "string" ? runKey : undefined,
});
```

- [x] **Step 4: Run first effect inspection test**

Run:

```sh
pnpm --filter @vanrot/store test -- effect-inspection.test.ts effects.test.ts
```

Expected: pass for start/success and existing effect behavior.

## Task 6: Cancellation, Timeout, Retry, And Stale Write Evidence

**Files:**

- Modify: `packages/store/tests/effect-inspection.test.ts`
- Modify: `packages/store/src/store.ts`

- [x] **Step 1: Add `latestBy` cancellation test**

Append to `packages/store/tests/effect-inspection.test.ts`:

```ts
it("records latestBy cancellation with concurrency key", async () => {
  const releases: Array<(value: string) => void> = [];
  const { store } = createLoadStore((accountId) => {
    return new Promise<string>((resolve) => {
      releases.push(() => resolve(accountId));
    });
  });
  const instance = useStore(store);
  const inspector = inspectStore(instance, { historyLimit: 40 });

  instance.action.loadValue.start({ accountId: "account-1" });
  instance.action.loadValue.start({ accountId: "account-1" });
  releases[0]?.("stale");
  releases[1]?.("fresh");

  await vi.waitFor(() => {
    expect(instance.state.current().value).toBe("fresh");
  });

  const canceled = inspector.history().find((event) => event.kind === storeInspectionEventKind.effectCanceled);
  expect(canceled?.concurrencyKey).toBe("account-1");
  expect(canceled?.cancellationReason).toBe("latestBy");
  expect(inspector.history().some((event) => event.kind === storeInspectionEventKind.staleWritePrevented)).toBe(true);
});
```

- [x] **Step 2: Add `cancelWhen` test**

Append:

```ts
it("records cancelWhen action cancellation", async () => {
  const { actions, store } = createLoadStore(() => new Promise<string>(() => undefined));
  const instance = useStore(store);
  const inspector = inspectStore(instance, { historyLimit: 30 });

  instance.action.loadValue.start({ accountId: "account-2" });
  instance.dispatch(actions.cancelLoad.start());

  await vi.waitFor(() => {
    expect(inspector.history().some((event) => event.kind === storeInspectionEventKind.effectCanceled)).toBe(true);
  });

  const canceled = inspector.history().find((event) => event.kind === storeInspectionEventKind.effectCanceled);
  expect(canceled?.cancellationReason).toBe("cancelWhen:load/cancelLoad/start");
});
```

- [x] **Step 3: Add timeout and retry tests**

Append:

```ts
it("records timeout and retry attempts", async () => {
  let attempts = 0;
  const { store } = createLoadStore(async () => {
    attempts += 1;
    throw new Error("network down");
  });
  const instance = useStore(store);
  const inspector = inspectStore(instance, { historyLimit: 60 });

  instance.action.loadValue.start({ accountId: "account-3" });

  await vi.waitFor(() => {
    expect(instance.state.current().error).toBe("network down");
  });

  expect(attempts).toBe(2);
  expect(inspector.history().some((event) => event.kind === storeInspectionEventKind.effectRetried)).toBe(true);
  expect(
    inspector.history()
      .filter((event) => event.kind === storeInspectionEventKind.effectRetried)
      .map((event) => event.retryAttempt),
  ).toEqual([1]);
});
```

- [x] **Step 4: Emit cancellation event from `abortEffectRun`**

Update the internal `abortEffectRun(...)` helper in `packages/store/src/store.ts` to accept cancellation metadata:

```ts
function abortEffectRun(
  effectDefinition: StoreEffect<any>,
  activeEffects: ActiveEffectControllers,
  runKey: EffectRunKey,
  inspection: StoreInspectionController<any>,
  action: StoreAction<any>,
  reason: string,
): void {
  const controllers = activeEffects.get(effectDefinition)?.get(runKey);

  if (!controllers) {
    return;
  }

  for (const controller of controllers) {
    controller.abort(storeEffectAbortedMessage);
  }

  inspection.emitEvent({
    kind: storeInspectionEventKind.effectCanceled,
    action,
    actionType: action.type,
    effectName: effectDefinition.policies.trace ?? effectDefinition.trigger.type,
    concurrencyKey: typeof runKey === "string" ? runKey : undefined,
    cancellationReason: reason,
  });
}
```

Update callers:

```ts
abortEffectRun(effectDefinition, activeEffects, runKey, inspection, action, "latestBy");
```

For `cancelMatchingEffects(...)`, pass `inspection`, the canceling action, and:

```ts
`cancelWhen:${action.type}`
```

- [x] **Step 5: Emit stale-write prevented events**

In `runEffects`, when `context.signal.aborted` is true after `runWithRetry(...)`, emit before `continue`:

```ts
inspection.emitEvent({
  kind: storeInspectionEventKind.staleWritePrevented,
  action,
  actionType: action.type,
  effectName,
  concurrencyKey: typeof runKey === "string" ? runKey : undefined,
  cancellationReason: "aborted-before-success-dispatch",
});
```

Do the same in the catch branch:

```ts
inspection.emitEvent({
  kind: storeInspectionEventKind.staleWritePrevented,
  action,
  actionType: action.type,
  effectName,
  concurrencyKey: typeof runKey === "string" ? runKey : undefined,
  cancellationReason: "aborted-before-error-dispatch",
});
```

- [x] **Step 6: Emit retry events**

Inside `runWithRetry(...)`, add an optional inspection context parameter and emit:

```ts
inspection?.emitEvent({
  kind: storeInspectionEventKind.effectRetried,
  action: context.action,
  actionType: context.action.type,
  effectName: effectDefinition.policies.trace ?? effectDefinition.trigger.type,
  retryAttempt: attempt,
});
```

Emit after a failed attempt and before waiting for the next attempt.

- [x] **Step 7: Run effect inspection tests**

Run:

```sh
pnpm --filter @vanrot/store test -- effect-inspection.test.ts effects.test.ts
```

Expected: pass.

## Task 7: Replay Contracts

**Files:**

- Create: `packages/store/src/replay.ts`
- Modify: `packages/store/src/inspection.ts`
- Modify: `packages/store/src/index.ts`
- Modify: `packages/store/tests/replay.test.ts`

- [x] **Step 1: Move replay logic into focused module**

Create `packages/store/src/replay.ts`:

```ts
import type {
  StoreInspectionSnapshot,
  StoreReplayResult,
  StoreReplayStep,
} from "./inspection-types.js";
import type { StoreAction, StoreReducer } from "./types.js";

export function replayStoreActions<TState extends object>(
  snapshot: StoreInspectionSnapshot<TState> | undefined,
  actions: readonly StoreAction<any>[],
  reducer: StoreReducer<TState>,
): StoreReplayResult<TState> {
  if (!snapshot) {
    return {
      ok: false,
      reason: "snapshot-not-found",
      message: "The requested snapshot was not found.",
      steps: [],
    };
  }

  const steps = actions.reduce<StoreReplayStep<TState>[]>((items, action) => {
    const previousState = items.at(-1)?.nextState ?? snapshot.state;
    const nextState = reducer.reduce(previousState, action);

    return [
      ...items,
      {
        action,
        previousState,
        nextState,
      },
    ];
  }, []);

  return {
    ok: true,
    initialSnapshotId: snapshot.id,
    finalState: steps.at(-1)?.nextState ?? snapshot.state,
    steps,
  };
}
```

- [x] **Step 2: Use replay module from inspection facade**

In `packages/store/src/inspection.ts`, import:

```ts
import { replayStoreActions } from "./replay.js";
```

Replace inline replay code with:

```ts
replayFrom(snapshotId) {
  const initial = history.snapshots().find((snapshot) => snapshot.id === snapshotId);
  const replay = replayStoreActions(initial, actionLog, reducer);

  emitEvent({
    kind: replay.ok ? storeInspectionEventKind.replayCompleted : storeInspectionEventKind.replayStarted,
    message: replay.ok ? "Replay completed" : replay.message,
  });

  return replay;
},
```

- [x] **Step 3: Add missing replay tests**

Append to `packages/store/tests/replay.test.ts`:

```ts
it("reports missing snapshot without throwing", () => {
  const counterDefinition = createCounterStore();
  const counter = useStore(counterDefinition);
  const inspector = inspectStore(counter, { historyLimit: 10 });

  const replay = inspector.replayFrom("store:counter@404");

  expect(replay).toEqual({
    ok: false,
    reason: "snapshot-not-found",
    message: "The requested snapshot was not found.",
    steps: [],
  });
});
```

- [x] **Step 4: Run replay tests**

Run:

```sh
pnpm --filter @vanrot/store test -- replay.test.ts inspection.test.ts
```

Expected: pass.

## Task 8: Example Hardening Flow

**Files:**

- Create: `examples/store-foundation/src/store/claims.inspection.ts`
- Modify: `examples/store-foundation/src/store/claims.effect-options.ts`
- Modify: `examples/store-foundation/src/store/claims.effects.ts`
- Modify: `examples/store-foundation/src/claims.page.ts`
- Modify: `examples/store-foundation/tests/store-foundation.test.ts`

- [x] **Step 1: Add inspection constants**

Create `examples/store-foundation/src/store/claims.inspection.ts`:

```ts
import type { StoreInspectionEvent } from "@vanrot/store";

export const claimsInspection = {
  historyLimit: 50,
  snapshotLabels: {
    beforeRefresh: "before claims refresh",
  },
  eventMessages: {
    staleWritePrevented: "A stale claims response was prevented.",
  },
} as const;

export function isClaimsStateChange(event: StoreInspectionEvent): boolean {
  return event.kind === "store.state.changed" && event.storeName === "claims";
}
```

- [x] **Step 2: Use inspector in page code**

Modify `examples/store-foundation/src/claims.page.ts`:

```ts
import { signal } from "@vanrot/runtime";
import { inspectStore, useStore } from "@vanrot/store";

import { claimsInspection, isClaimsStateChange } from "./store/claims.inspection";
import { claimsStore } from "./store/claims.store";

export class ClaimsPage {
  private store = useStore(claimsStore);
  private inspector = inspectStore(this.store, {
    historyLimit: claimsInspection.historyLimit,
    snapshots: "manual",
  });

  accountId = signal("account-1");
  observedChanges = signal<readonly string[]>([]);

  constructor() {
    this.inspector.observe((event) => {
      if (!isClaimsStateChange(event)) {
        return;
      }

      this.observedChanges.set(event.changedKeys);
    });
  }

  loadClaims(): void {
    this.inspector.snapshot(claimsInspection.snapshotLabels.beforeRefresh);
    this.store.action.loadClaims.start({
      accountId: this.accountId(),
    });
  }
}
```

Keep existing page methods and imports. Merge this snippet with the current class instead of replacing unrelated working code.

- [x] **Step 3: Add example test assertions**

Modify `examples/store-foundation/tests/store-foundation.test.ts`:

```ts
it("shows Vanrot-native store inspection without RxJS", async () => {
  const page = new ClaimsPage();

  page.loadClaims();

  expect(page.observedChanges()).toContain("loadingByAccount");
});
```

If the current example test constructs the store directly instead of the page, assert the same behavior through `inspectStore(...)` and `claimsStore`.

- [x] **Step 4: Run example tests**

Run:

```sh
pnpm --filter store-foundation test
```

Expected: pass.

## Task 9: Store Docs IA Red Tests

**Files:**

- Modify: `apps/vanrot-site/tests/site-data.test.ts`
- Modify: `apps/vanrot-site/tests/site-pages.test.ts`
- Modify: `apps/vanrot-site/tests/framework-reference.test.ts`

- [x] **Step 1: Add child article assertions**

Modify `apps/vanrot-site/tests/site-data.test.ts` with a focused test:

```ts
it("documents Store hardening with real child guides", () => {
  const storeArticles = siteArticles.filter((article) => article.path.startsWith("/docs/store"));

  expect(storeArticles.map((article) => article.path)).toEqual(
    expect.arrayContaining([
      "/docs/store",
      "/docs/store/hardening",
      "/docs/store/inspection",
      "/docs/store/replay",
    ]),
  );

  expect(storeArticles.find((article) => article.path === "/docs/store/hardening")?.content)
    .toContain("effect cancellation");
  expect(storeArticles.find((article) => article.path === "/docs/store/inspection")?.content)
    .toContain("Vanrot-native observation");
  expect(storeArticles.find((article) => article.path === "/docs/store/replay")?.content)
    .toContain("snapshots");
});
```

Adjust `siteArticles` import/name to the current test file convention.

- [x] **Step 2: Add route render assertions**

Modify `apps/vanrot-site/tests/site-pages.test.ts`:

```ts
it.each([
  "/docs/store/hardening",
  "/docs/store/inspection",
  "/docs/store/replay",
])("renders %s", async (path) => {
  const result = await renderSiteRoute(path);

  expect(result.status).toBe(200);
  expect(result.text).toContain("Store");
});
```

Use the current route rendering helper name in the file. Keep the paths exact.

- [x] **Step 3: Add framework reference assertions**

Modify `apps/vanrot-site/tests/framework-reference.test.ts`:

```ts
it("includes Store hardening public API in the framework reference", () => {
  expect(reference.exports).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        packageName: "@vanrot/store",
        name: "inspectStore",
        docsPath: "/docs/store/inspection",
      }),
      expect.objectContaining({
        packageName: "@vanrot/store",
        name: "StoreReplayResult",
        docsPath: "/docs/store/replay",
      }),
    ]),
  );
});
```

Use the current reference variable name from the file.

- [x] **Step 4: Run docs red tests**

Run:

```sh
pnpm --filter @vanrot/vanrot-site test -- tests/site-data.test.ts tests/site-pages.test.ts tests/framework-reference.test.ts
```

Expected: fail because new Store child docs and reference entries are not registered yet.

## Task 10: Store Docs And Reference Data

**Files:**

- Modify: `apps/vanrot-site/src/docs/site-data.ts`
- Modify: `apps/vanrot-site/src/docs/site-data.json`
- Modify: `apps/vanrot-site/src/docs/site-navigation.ts`
- Modify: `apps/vanrot-site/src/routes.ts`
- Modify: `apps/vanrot-site/src/docs/framework-reference.json`

- [x] **Step 1: Add article keys**

Add Store child keys to `apps/vanrot-site/src/docs/site-data.ts` beside the existing Store key:

```ts
export const storeArticleKeys = {
  overview: "store",
  hardening: "store-hardening",
  inspection: "store-inspection",
  replay: "store-replay",
} as const;
```

If this file uses a single `siteArticleKey` object, add these names there instead and keep the object as the source of truth.

- [x] **Step 2: Add child article content**

Add three entries to `apps/vanrot-site/src/docs/site-data.json`:

```json
{
  "key": "store-hardening",
  "title": "Store Hardening",
  "path": "/docs/store/hardening",
  "summary": "Effect cancellation, concurrency inspection, stale-write prevention, and trace history for @vanrot/store.",
  "content": "Store hardening keeps @vanrot/store signal-first while making effect behavior inspectable. Use latestBy to keep duplicate requests from writing stale state, cancelWhen to connect cancel actions to active effects, timeout and retry policies to make async boundaries predictable, and inspection events to see why a run started, retried, succeeded, failed, timed out, or was canceled. RxJS is not part of Vanrot store. Redux is not a dependency or compatibility target."
}
```

Add matching `store-inspection` and `store-replay` entries:

```json
{
  "key": "store-inspection",
  "title": "Store Inspection",
  "path": "/docs/store/inspection",
  "summary": "Headless Vanrot-native action, state, effect, and snapshot observation for @vanrot/store.",
  "content": "Store inspection exposes typed events for dispatch, reducer completion, state changes, effect lifecycle, stale-write prevention, snapshots, replay, and history reset. Observers use callbacks and unsubscribe functions. The store remains usable without inspection, and future @vanrot/devtools work consumes the same headless contract."
}
```

```json
{
  "key": "store-replay",
  "title": "Store Replay",
  "path": "/docs/store/replay",
  "summary": "Deterministic snapshots and pure reducer replay for @vanrot/store.",
  "content": "Store replay records bounded action history and snapshots so a reducer sequence can be replayed from a known state. Replay skips effect execution by default and reports unsupported cases as structured results. Use it for debugging, tests, support reproduction, and future Vanrot Devtools panels."
}
```

Match the exact JSON shape used by existing articles. Preserve ordering below the Store parent.

- [x] **Step 3: Add sidebar children**

Modify `apps/vanrot-site/src/docs/site-navigation.ts` so Store has real children:

```ts
{
  label: "Store",
  path: "/docs/store",
  children: [
    { label: "Hardening", path: "/docs/store/hardening" },
    { label: "Inspection", path: "/docs/store/inspection" },
    { label: "Replay", path: "/docs/store/replay" },
  ],
}
```

If Store already has children, add these three without removing existing valid child pages.

- [x] **Step 4: Add routes**

Modify `apps/vanrot-site/src/routes.ts` with route entries matching existing docs article routes:

```ts
{
  path: "/docs/store/hardening",
  component: DocsArticlePage,
  data: { articleKey: "store-hardening" },
},
{
  path: "/docs/store/inspection",
  component: DocsArticlePage,
  data: { articleKey: "store-inspection" },
},
{
  path: "/docs/store/replay",
  component: DocsArticlePage,
  data: { articleKey: "store-replay" },
},
```

Use the route object format already present in `apps/vanrot-site/src/routes.ts`.

- [x] **Step 5: Add framework reference entries**

Add to `apps/vanrot-site/src/docs/framework-reference.json`:

```json
{
  "packageName": "@vanrot/store",
  "name": "inspectStore",
  "kind": "function",
  "status": "production-ready",
  "summary": "Creates a headless inspector for action, state, effect, snapshot, and replay events.",
  "docsPath": "/docs/store/inspection"
}
```

Also add `StoreInspectionEvent`, `StoreInspector`, `StoreInspectionSnapshot`, and `StoreReplayResult` type entries with docs paths `/docs/store/inspection` or `/docs/store/replay`.

- [x] **Step 6: Run docs tests**

Run:

```sh
pnpm --filter @vanrot/vanrot-site test -- tests/site-data.test.ts tests/site-pages.test.ts tests/framework-reference.test.ts
```

Expected: pass.

## Task 11: AI Docs And Final Inventory

**Files:**

- Modify: `docs/ai/index.json`
- Modify: `docs/ai/knowledge/docs.md`
- Modify: `docs/ai/knowledge/examples.md`
- Modify: `docs/ai/knowledge/packages.md`
- Modify: `docs/ai/knowledge/public-api.md`
- Modify: `docs/ai/knowledge/routes.md`
- Modify: `docs/ai/manifest.json`
- Modify: `docs/superpowers/final-tdd-inventory.md`
- Modify: `docs/superpowers/future-pipeline.md`

- [x] **Step 1: Regenerate AI docs**

Run:

```sh
pnpm exec vr ai build
```

Expected: generated AI docs update Store package, public API, routes, docs, and examples.

If `pnpm exec vr ai build` cannot find the local binary, run:

```sh
node packages/cli/dist/bin.js ai build
```

Expected: same generated AI docs update.

- [x] **Step 2: Verify AI docs**

Run:

```sh
pnpm exec vr ai verify
```

Expected: AI docs verification passes.

If the local binary fallback was needed in Step 1, run:

```sh
node packages/cli/dist/bin.js ai verify
```

Expected: AI docs verification passes.

- [x] **Step 3: Update final TDD inventory**

Add a `Phase 20 Store Hardening` section to `docs/superpowers/final-tdd-inventory.md`:

```md
### Phase 20 Store Hardening

- `@vanrot/store`: headless inspection protocol, bounded history, observer unsubscribe, observer error isolation, snapshot records, changed-key summaries, pure reducer replay, effect lifecycle events, cancellation reasons, concurrency keys, retry evidence, timeout evidence, and stale-write prevention.
- `examples/store-foundation`: duplicate request, cancelWhen, retry, timeout, manual snapshot, inspection observer, and replay usage.
- `apps/vanrot-site`: `/docs/store/hardening`, `/docs/store/inspection`, and `/docs/store/replay` real child pages with sidebar, route, framework-reference, and AI-doc coverage.
- Tests: package exports, dispatch inspection, observer behavior, history bounds, snapshots, replay, effect inspection, stale-write prevention, example hardening, docs routes, docs data, framework reference, AI docs, phase docs, and full `pnpm verify`.
```

- [x] **Step 4: Update future pipeline after implementation passes**

In `docs/superpowers/future-pipeline.md`, mark Store Hardening items complete only after package/docs/tests pass:

```md
- [x] Deepen cancellation and concurrency inspection beyond the Phase 19 `latestBy` and `cancelWhen` runtime behavior.
- [x] Add action tracing in a way that can feed future devtools without coupling store to devtools UI.
- [x] Explore time travel only after state snapshots and replay rules are deterministic.
- [x] Provide Vanrot-native observation for actions, state snapshots, and effect lifecycle events instead of RxJS interop.
- [x] Keep action history and replay as Vanrot-native concepts instead of Redux compatibility helpers.
- [x] Keep examples honest about when the enterprise layer is useful and when plain signals are enough.
```

Leave `Devtools Shell Repair` and `Framework Annotation Metadata` unchecked.

- [x] **Step 5: Run AI and inventory verifiers**

Run:

```sh
pnpm verify:ai-docs
pnpm verify:final-tdd-inventory
```

Expected: both pass.

## Task 12: Size, Phase Tracking, And Closeout Verification

**Files:**

- Modify: `packages/store/tests/size.test.ts`
- Modify: `docs/superpowers/feature-maturity.md`
- Modify: `docs/superpowers/plans/Phase-20.md`

- [x] **Step 1: Run package checks**

Run:

```sh
pnpm --filter @vanrot/store typecheck
pnpm --filter @vanrot/store test
pnpm --filter @vanrot/store build
```

Expected: all pass.

- [x] **Step 2: Run example checks**

Run:

```sh
pnpm --filter store-foundation test
```

Expected: pass.

- [x] **Step 3: Run size verification**

Run:

```sh
pnpm verify:size
```

Expected: pass. If it fails, record the exact `@vanrot/store` and `@vanrot/runtime` gzip sizes in the task notes, reduce inspection code weight if possible, and only raise a store-specific quality budget after explaining which hardening feature caused the increase.

- [x] **Step 4: Run docs verification**

Run:

```sh
pnpm verify:site-docs
pnpm verify:site-format
pnpm verify:phase-docs
```

Expected: all pass.

- [x] **Step 5: Mark Phase 20 complete after full verification**

Only after all focused checks pass, change the Phase 20 row in `docs/superpowers/feature-maturity.md` from:

```md
| [ ]  | Phase 20 | Post-production implementation: store hardening
```

to:

```md
| [x]  | Phase 20 | Post-production implementation: store hardening
```

- [x] **Step 6: Run final verification**

Run:

```sh
pnpm verify
```

Expected: pass.

- [x] **Step 7: Restart site dev server for docs changes**

Run:

```sh
pkill -f "vite/bin/vite.js.*--port 1964" || true
pnpm --filter @vanrot/vanrot-site dev -- --host 127.0.0.1 --port 1964
```

Expected: site dev server starts on `http://localhost:1964`.

- [x] **Step 8: Verify docs routes over HTTP**

Run:

```sh
curl -sS -o /tmp/store-hardening.html -w "%{http_code}\n" http://localhost:1964/docs/store/hardening
curl -sS -o /tmp/store-inspection.html -w "%{http_code}\n" http://localhost:1964/docs/store/inspection
curl -sS -o /tmp/store-replay.html -w "%{http_code}\n" http://localhost:1964/docs/store/replay
```

Expected:

```text
200
200
200
```

## Self-Review Checklist

- [x] Every Phase 20 acceptance criterion maps to at least one task.
- [x] No task adds RxJS, Redux, `@vanrot/metadata`, decorators, or store-owned UI.
- [x] Store inspection is headless and opt-in.
- [x] Effect lifecycle tests cover start, success, cancel, retry, timeout, and stale-write prevention.
- [x] Replay tests cover success and missing snapshot failure.
- [x] Docs child pages are real routes, not parent-page anchors.
- [x] AI docs and final TDD inventory are updated.
- [x] `pnpm verify:phase-docs` passes before implementation handoff.
- [x] `pnpm verify` passes before Phase 20 is marked complete.
