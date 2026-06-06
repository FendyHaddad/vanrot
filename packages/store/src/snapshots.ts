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

  return [...keys].filter((key) =>
    !Object.is(
      previousState[key as keyof TState],
      nextState[key as keyof TState],
    )
  );
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
