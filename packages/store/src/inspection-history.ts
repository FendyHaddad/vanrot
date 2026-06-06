import { storeInspectionEventKind } from "./constants.js";
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
  historyLimit: number,
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

  function addObserverFailure(
    source: StoreInspectionEvent<TState>,
    error: unknown,
  ): void {
    events.push({
      ...source,
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

  function notify(event: StoreInspectionEvent<TState>): void {
    for (const observer of observers) {
      try {
        observer(event);
      } catch (error) {
        addObserverFailure(event, error);
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
