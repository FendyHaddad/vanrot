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
} from "../src/index.ts";

type CounterState = {
  readonly count: number;
};

function createCounterStore() {
  const state = defineState<CounterState>({ count: 0 });
  const actions = defineActions("counter", {
    increment: actionSet()
      .start<{ readonly amount: number }>()
      .success()
      .error(),
  });
  const reducer = defineReducer(state)
    .on(actions.increment.start)
    .patch(({ state: current, action }) => ({
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
    const inspector = inspectStore(counter, {
      historyLimit: 10,
      snapshots: "manual",
    });

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
});
