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
