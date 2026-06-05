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
  retryPolicy,
  storeError,
  traceName,
  useStore,
} from "../src/index.ts";

const claimsActions = defineActions("claims", {
  loadClaims: actionSet()
    .start<{ accountId: string }>()
    .success<{ accountId: string; claims: string[] }>()
    .error<{ accountId: string; error: ReturnType<typeof storeError> }>(),
  closeClaims: actionSet()
    .start()
    .success()
    .error<{ error: ReturnType<typeof storeError> }>(),
});

describe("effect builder", () => {
  it("creates a readable full effect stack descriptor", async () => {
    const run = vi.fn(async () => ["claim-1"]);

    const effects = defineEffects({
      loadClaims: effect(claimsActions.loadClaims.start)
        .latestBy(({ action }) => action.accountId)
        .skipWhen(({ state, action }) =>
          Boolean((state.loadingByAccount as Record<string, boolean>)[action.accountId])
        )
        .cancelWhen(claimsActions.closeClaims.start)
        .timeout(8000)
        .retry(retryPolicy({ attempts: 2, delay: 1 }))
        .run(run)
        .success((claims, { action }) =>
          claimsActions.loadClaims.success({
            accountId: action.accountId,
            claims: claims as string[],
          })
        )
        .error((error, { action }) =>
          claimsActions.loadClaims.error({
            accountId: action.accountId,
            error: storeError(error),
          })
        )
        .trace(traceName("claims/loadClaims")),
    });

    expect(effects.loadClaims.trigger.type).toBe("claims/loadClaims/start");
    expect(effects.loadClaims.policies.timeoutMs).toBe(8000);
    expect(effects.loadClaims.policies.retry?.attempts).toBe(2);
    expect(effects.loadClaims.policies.trace).toBe("claims/loadClaims");

    const result = await effects.loadClaims.run({
      action: claimsActions.loadClaims.start({ accountId: "account-1" }),
      dispatch: vi.fn(),
      signal: new AbortController().signal,
      state: {
        loadingByAccount: {},
      },
    });

    expect(result).toEqual(["claim-1"]);
  });

  it("skips effects with skipWhen", async () => {
    const state = defineState({
      loadingByAccount: {
        "account-1": true,
      },
    });

    const actions = defineActions("claims", {
      loadClaims: actionSet()
        .start<{ accountId: string }>()
        .success<{ accountId: string }>()
        .error<{ accountId: string; error: ReturnType<typeof storeError> }>(),
    });

    const run = vi.fn();

    const store = useStore(
      defineStore({
        name: "claims",
        state,
        actions,
        selectors: defineSelectors(state).isLoading(
          (value) => value.loadingByAccount["account-1"],
        ),
        reducer: defineReducer(state),
        effects: defineEffects({
          loadClaims: effect(actions.loadClaims.start)
            .skipWhen(({ state: currentState, action }) =>
              Boolean(
                (currentState.loadingByAccount as Record<string, boolean>)[
                  action.accountId
                ],
              )
            )
            .run(run)
            .success(() => actions.loadClaims.success({ accountId: "account-1" }))
            .error((error) =>
              actions.loadClaims.error({
                accountId: "account-1",
                error: storeError(error),
              })
            )
            .trace("claims/loadClaims"),
        }),
      }),
    );

    store.action.loadClaims.start({ accountId: "account-1" });

    await Promise.resolve();

    expect(run).not.toHaveBeenCalled();
  });

  it("retries matching failures", async () => {
    const state = defineState({});
    const actions = defineActions("claims", {
      loadClaims: actionSet()
        .start()
        .success<{ value: string }>()
        .error<{ error: ReturnType<typeof storeError> }>(),
    });

    const run = vi
      .fn()
      .mockRejectedValueOnce(new Error("first failure"))
      .mockResolvedValueOnce("loaded");

    const store = useStore(
      defineStore({
        name: "claims",
        state,
        actions,
        selectors: defineSelectors(state).value(() => "loaded"),
        reducer: defineReducer(state),
        effects: defineEffects({
          loadClaims: effect(actions.loadClaims.start)
            .retry(retryPolicy({ attempts: 2, delay: 1 }))
            .run(run)
            .success((value) =>
              actions.loadClaims.success({ value: value as string })
            )
            .error((error) =>
              actions.loadClaims.error({ error: storeError(error) })
            )
            .trace("claims/loadClaims"),
        }),
      }),
    );

    store.action.loadClaims.start();

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(run).toHaveBeenCalledTimes(2);
  });

  it("keeps latestBy and cancelWhen policy metadata available for Phase 20 tracing", () => {
    const effectDefinition = effect(claimsActions.loadClaims.start)
      .latestBy(({ action }) => action.accountId)
      .cancelWhen(claimsActions.closeClaims.start)
      .run(() => [])
      .success((claims, { action }) =>
        claimsActions.loadClaims.success({
          accountId: action.accountId,
          claims: claims as string[],
        })
      )
      .error((error, { action }) =>
        claimsActions.loadClaims.error({
          accountId: action.accountId,
          error: storeError(error),
        })
      )
      .trace("claims/loadClaims");

    expect(
      effectDefinition.policies.latestBy?.({
        action: claimsActions.loadClaims.start({ accountId: "account-1" }),
        dispatch: vi.fn(),
        signal: new AbortController().signal,
        state: {},
      }),
    ).toBe("account-1");
    expect(effectDefinition.policies.cancelWhen?.type).toBe(
      "claims/closeClaims/start",
    );
  });

  it("aborts and ignores stale latestBy effect runs for the same key", async () => {
    const state = defineState({
      latestClaim: undefined as string | undefined,
    });
    const actions = defineActions("claims", {
      loadClaims: actionSet()
        .start<{ accountId: string }>()
        .success<{ claim: string }>()
        .error<{ error: ReturnType<typeof storeError> }>(),
    });
    const signals: AbortSignal[] = [];
    const resolveRun: Array<(claim: string) => void> = [];

    const store = useStore(
      defineStore({
        name: "claims",
        state,
        actions,
        selectors: defineSelectors(state).latestClaim((value) => value.latestClaim),
        reducer: defineReducer(state)
          .on(actions.loadClaims.success)
          .patch(({ action }) => ({
            latestClaim: action.claim,
          })),
        effects: defineEffects({
          loadClaims: effect(actions.loadClaims.start)
            .latestBy(({ action }) => action.accountId)
            .run(({ signal }) =>
              new Promise((resolve) => {
                signals.push(signal);
                resolveRun.push(resolve);
              })
            )
            .success((claim) =>
              actions.loadClaims.success({ claim: claim as string })
            )
            .error((error) =>
              actions.loadClaims.error({ error: storeError(error) })
            )
            .trace("claims/loadClaims"),
        }),
      }),
    );

    store.action.loadClaims.start({ accountId: "account-1" });
    store.action.loadClaims.start({ accountId: "account-1" });

    expect(signals[0].aborted).toBe(true);
    expect(signals[1].aborted).toBe(false);

    resolveRun[0]("stale-claim");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(state.current().latestClaim).toBeUndefined();

    resolveRun[1]("fresh-claim");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(state.current().latestClaim).toBe("fresh-claim");
  });

  it("aborts and ignores in-flight effects when cancelWhen action dispatches", async () => {
    const state = defineState({
      latestClaim: undefined as string | undefined,
    });
    const actions = defineActions("claims", {
      loadClaims: actionSet()
        .start()
        .success<{ claim: string }>()
        .error<{ error: ReturnType<typeof storeError> }>(),
      closeClaims: actionSet()
        .start()
        .success()
        .error<{ error: ReturnType<typeof storeError> }>(),
    });
    let signal: AbortSignal | undefined;
    let resolveRun: ((claim: string) => void) | undefined;

    const store = useStore(
      defineStore({
        name: "claims",
        state,
        actions,
        selectors: defineSelectors(state).latestClaim((value) => value.latestClaim),
        reducer: defineReducer(state)
          .on(actions.loadClaims.success)
          .patch(({ action }) => ({
            latestClaim: action.claim,
          })),
        effects: defineEffects({
          loadClaims: effect(actions.loadClaims.start)
            .cancelWhen(actions.closeClaims.start)
            .run((context) =>
              new Promise((resolve) => {
                signal = context.signal;
                resolveRun = resolve;
              })
            )
            .success((claim) =>
              actions.loadClaims.success({ claim: claim as string })
            )
            .error((error) =>
              actions.loadClaims.error({ error: storeError(error) })
            )
            .trace("claims/loadClaims"),
        }),
      }),
    );

    store.action.loadClaims.start();
    store.action.closeClaims.start();

    expect(signal?.aborted).toBe(true);

    resolveRun?.("cancelled-claim");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(state.current().latestClaim).toBeUndefined();
  });
});
