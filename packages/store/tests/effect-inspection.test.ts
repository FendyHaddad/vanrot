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
} from "../src/index.ts";

type LoadState = {
  readonly loading: boolean;
  readonly value: string;
  readonly error: string | undefined;
};

function createLoadStore(
  handler: (accountId: string, signal: AbortSignal) => Promise<string>,
) {
  const state = defineState<LoadState>({
    loading: false,
    value: "",
    error: undefined,
  });
  const actions = defineActions("load", {
    loadValue: actionSet()
      .start<{ readonly accountId: string }>()
      .success<{ readonly value: string }>()
      .error<{ readonly error: ReturnType<typeof storeError> }>(),
    cancelLoad: actionSet()
      .start()
      .success()
      .error(),
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
      .retry(retryPolicy({ attempts: 2, delay: 1 }))
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

    expect(inspector.history().map((event) => event.kind)).toContain(
      storeInspectionEventKind.effectStarted,
    );
    expect(inspector.history().map((event) => event.kind)).toContain(
      storeInspectionEventKind.effectSucceeded,
    );
    expect(
      inspector.history().find((event) =>
        event.kind === storeInspectionEventKind.effectStarted
      )?.effectName,
    ).toBe("loadValueEffect");
  });

  it("records latestBy cancellation with concurrency key", async () => {
    const releases: Array<(value: string) => void> = [];
    const { store } = createLoadStore((accountId) =>
      new Promise<string>((resolve) => {
        releases.push(() => resolve(accountId));
      })
    );
    const instance = useStore(store);
    const inspector = inspectStore(instance, { historyLimit: 40 });

    instance.action.loadValue.start({ accountId: "account-1" });
    instance.action.loadValue.start({ accountId: "account-1" });
    releases[0]?.("stale");
    releases[1]?.("fresh");

    await vi.waitFor(() => {
      expect(instance.state.current().value).toBe("account-1");
    });

    const canceled = inspector.history().find((event) =>
      event.kind === storeInspectionEventKind.effectCanceled
    );
    expect(canceled?.concurrencyKey).toBe("account-1");
    expect(canceled?.cancellationReason).toBe("latestBy");
    expect(
      inspector.history().some((event) =>
        event.kind === storeInspectionEventKind.staleWritePrevented
      ),
    ).toBe(true);
  });

  it("records cancelWhen action cancellation", async () => {
    const { actions, store } = createLoadStore(() =>
      new Promise<string>(() => undefined)
    );
    const instance = useStore(store);
    const inspector = inspectStore(instance, { historyLimit: 30 });

    instance.action.loadValue.start({ accountId: "account-2" });
    instance.dispatch(actions.cancelLoad.start());

    await vi.waitFor(() => {
      expect(
        inspector.history().some((event) =>
          event.kind === storeInspectionEventKind.effectCanceled
        ),
      ).toBe(true);
    });

    const canceled = inspector.history().find((event) =>
      event.kind === storeInspectionEventKind.effectCanceled
    );
    expect(canceled?.cancellationReason).toBe(
      "cancelWhen:load/cancelLoad/start",
    );
  });

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
    expect(
      inspector.history().some((event) =>
        event.kind === storeInspectionEventKind.effectRetried
      ),
    ).toBe(true);
    expect(
      inspector.history()
        .filter((event) => event.kind === storeInspectionEventKind.effectRetried)
        .map((event) => event.retryAttempt),
    ).toEqual([1]);
  });
});
