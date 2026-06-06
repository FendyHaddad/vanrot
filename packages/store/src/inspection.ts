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
} from "./inspection-types.js";
import { replayStoreActions } from "./replay.js";
import {
  changedStateKeys,
  createStoreInspectionSnapshot,
  summarizeInspectionValue,
} from "./snapshots.js";
import type { StoreAction, StoreReducer } from "./types.js";

export const storeInspectionControllerKey: unique symbol = Symbol(
  "vanrot.store.inspection",
);

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
  if (options.enabled === false) {
    return createDisabledInspector(store);
  }

  const controller = store[storeInspectionControllerKey];

  if (!controller) {
    return createDisabledInspector(store);
  }

  return controller.activate(options);
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
  let historyLimit = options.historyLimit ?? defaultStoreInspectionHistoryLimit;
  let history = createStoreInspectionHistory<TState>(historyLimit);
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
    observe(observer) {
      return history.observe(observer);
    },
    history() {
      return history.events();
    },
    snapshots() {
      return history.snapshots();
    },
    snapshot: createSnapshot,
    clearHistory() {
      history.clear(storeName, nextSequence());
      actionLog.length = 0;
    },
    replayFrom(snapshotId) {
      const initial = history.snapshots().find((snapshot) =>
        snapshot.id === snapshotId
      );
      emitEvent({
        kind: storeInspectionEventKind.replayStarted,
        message: `Replay started from ${snapshotId}`,
      });
      const replay = replayStoreActions(initial, actionLog, reducer);
      emitEvent({
        kind: storeInspectionEventKind.replayCompleted,
        message: replay.ok ? "Replay completed" : replay.message,
      });

      return replay;
    },
  };

  return {
    activate(nextOptions) {
      enabled = nextOptions.enabled ?? true;
      exposeState = nextOptions.exposeState ?? exposeState;
      snapshotMode = nextOptions.snapshots ?? snapshotMode;

      if (
        nextOptions.historyLimit &&
        nextOptions.historyLimit !== historyLimit
      ) {
        historyLimit = nextOptions.historyLimit;
        history = createStoreInspectionHistory<TState>(historyLimit);
      }

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
      return createStoreInspectionSnapshot(
        store.name,
        store.state.current(),
        0,
        label,
        false,
      );
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
