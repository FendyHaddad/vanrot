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

describe("store inspection", () => {
  it("observes dispatch, reducer, and state change events", () => {
    const counterDefinition = createCounterStore();
    const counter = useStore(counterDefinition);
    const inspector = inspectStore(counter, {
      historyLimit: 10,
      snapshots: "automatic",
    });
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

  it("isolates observer errors from dispatch", () => {
    const counterDefinition = createCounterStore();
    const counter = useStore(counterDefinition);
    const inspector = inspectStore(counter, { historyLimit: 10 });

    inspector.observe(() => {
      throw new Error("observer failed");
    });

    expect(() => counter.action.increment.start({ amount: 1 })).not.toThrow();
    expect(counter.state.current()).toEqual({ count: 1 });
    expect(
      inspector.history().some((event) =>
        event.kind === storeInspectionEventKind.observerFailed
      ),
    ).toBe(true);
  });

  it("keeps bounded event history", () => {
    const counterDefinition = createCounterStore();
    const counter = useStore(counterDefinition);
    const inspector = inspectStore(counter, { historyLimit: 4 });

    counter.action.increment.start({ amount: 1 });
    counter.action.increment.start({ amount: 1 });
    counter.action.increment.start({ amount: 1 });

    expect(inspector.history()).toHaveLength(4);
    expect(inspector.history().at(-1)?.kind).toBe(
      storeInspectionEventKind.stateChanged,
    );
  });

  it("can be disabled for production-like usage", () => {
    const counterDefinition = createCounterStore();
    const counter = useStore(counterDefinition);
    const inspector = inspectStore(counter, { enabled: false });

    counter.action.increment.start({ amount: 3 });

    expect(inspector.history()).toEqual([]);
    expect(inspector.snapshots()).toEqual([]);
    expect(counter.state.current()).toEqual({ count: 3 });
  });
});
