export const storePackageName = "@vanrot/store";

export const storeActionTypeSeparator = "/";

export const storeEffectPhase = {
  start: "start",
  success: "success",
  error: "error",
} as const;

export const storeSizeBudget = {
  combinedRuntimeAndStoreGzipBytes: 10 * 1024,
} as const;

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
