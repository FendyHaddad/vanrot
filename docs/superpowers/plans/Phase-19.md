# Phase 19 Store Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Do not use subagents, parallel agents, worktrees, `git add`, `git commit`, or `git push` in this repository unless the user explicitly asks. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `@vanrot/store` as a signal-native first-party store package with fluent actions, selectors, reducers, full effects, page-facing `useStore`, docs, examples, and verification.

**Architecture:** Add `packages/store` as a separate package that consumes `@vanrot/runtime` signal primitives while keeping store code out of runtime. Split store concerns by file and API boundary: errors, actions, state, selectors, reducers, effects, store composition, and page usage. Add docs IA, AI-doc coverage, size checks, and phase tracker updates in the same phase so the package is shippable through the normal Vanrot gates.

**Tech Stack:** TypeScript, Vitest, pnpm workspaces, `@vanrot/runtime` signals, Vanrot site docs registry, Node verification scripts, size-limit-compatible gzip checks.

---

## Local Rules For This Plan

- Work in `/Users/user/IdeaProjects/vanrot`.
- Do not create a branch or worktree.
- Do not stage, commit, or push unless the user explicitly asks.
- Do not use subagents.
- Keep UI markup in `.html`, application logic in `.ts`, and styling in scoped `.css`.
- Do not put store code in `@vanrot/runtime`.
- Use `@vanrot/runtime` as a dependency of `@vanrot/store`.
- Store examples must use quote-free Vanrot HTML for TS-bound attributes, such as `@click=loadClaims` and `disabled={{ isLoading() }}`.
- Use `docs/superpowers/specs/Phase-19.md` as the source of truth for API shape.
- Use `docs/superpowers/plans/Phase-19.md` for this implementation plan.
- Replace commit steps with checkpoint summaries because the user owns commits in this repo.

## File Structure

Create:

- `packages/store/package.json`: package manifest, scripts, exports, dependency on `@vanrot/runtime`.
- `packages/store/tsconfig.json`: package TypeScript project config.
- `packages/store/src/index.ts`: stable public exports only.
- `packages/store/src/constants.ts`: package name, store trace defaults, generated type separators, size labels.
- `packages/store/src/errors.ts`: `StoreError` and `storeError(error)`.
- `packages/store/src/actions.ts`: `actionSet`, `defineActions`, action creators, generated action type strings.
- `packages/store/src/state.ts`: `defineState`, state container types, reset helpers.
- `packages/store/src/selectors.ts`: fluent selector chain and selector descriptors.
- `packages/store/src/reducers.ts`: fluent reducer chain, `patch`, `set`, immutable merge helper.
- `packages/store/src/effects.ts`: effect builder, policy descriptors, retry policy, trace names.
- `packages/store/src/store.ts`: `defineStore`, `useStore`, dispatch, selectors, effect execution.
- `packages/store/src/types.ts`: shared public and internal types.
- `packages/store/tests/package.test.ts`: package metadata, public exports, runtime boundary.
- `packages/store/tests/errors.test.ts`: `StoreError` conversion.
- `packages/store/tests/actions.test.ts`: fluent action sets and generated types.
- `packages/store/tests/state-selectors.test.ts`: state and selectors.
- `packages/store/tests/reducers.test.ts`: patch/set reducer behavior.
- `packages/store/tests/effects.test.ts`: full effect stack.
- `packages/store/tests/store.test.ts`: `defineStore`, `useStore`, page-facing API.
- `packages/store/tests/size.test.ts`: combined runtime + store gzip quality budget.
- `examples/store-foundation/package.json`: runnable package example.
- `examples/store-foundation/tsconfig.json`: example TypeScript config.
- `examples/store-foundation/src/claims.page.ts`: page-facing store usage.
- `examples/store-foundation/src/claims.page.html`: quote-free Vanrot HTML example.
- `examples/store-foundation/src/models/claim.model.ts`: example model.
- `examples/store-foundation/src/models/claim-filters.model.ts`: example filters model.
- `examples/store-foundation/src/models/claim-type.model.ts`: example model-typed state field.
- `examples/store-foundation/src/store/claims.store-keys.ts`: store name source of truth.
- `examples/store-foundation/src/store/claims.state.ts`: state example.
- `examples/store-foundation/src/store/claims.actions.ts`: fluent actions example.
- `examples/store-foundation/src/store/claims.selectors.ts`: fluent selectors example.
- `examples/store-foundation/src/store/claims.effects.ts`: full effect stack example.
- `examples/store-foundation/src/store/claims.effect-options.ts`: timeout, retry, trace constants.
- `examples/store-foundation/src/store/claims.reducer.ts`: patch/set reducer example.
- `examples/store-foundation/src/store/claims.store.ts`: composition example.
- `examples/store-foundation/tests/store-foundation.test.ts`: example smoke test.

Modify:

- `package.json`: workspace scripts only if a new verifier command is required.
- `pnpm-lock.yaml`: dependency graph after package install/build.
- `tsconfig.json`: project references if this repo uses root references for every package.
- `docs/superpowers/feature-maturity.md`: Phase 19 completion row when implementation passes.
- `docs/superpowers/future-pipeline.md`: mark Store Foundation as shipped and leave Store Hardening as Phase 20.
- `docs/superpowers/final-tdd-inventory.md`: add package, API, docs, examples, and verification coverage.
- `apps/vanrot-site/src/docs/site-data.ts`: add `siteArticleKey` entries for Store docs.
- `apps/vanrot-site/src/docs/site-data.json`: add Store parent and child articles.
- `apps/vanrot-site/src/docs/site-navigation.ts`: add Store nav group/children.
- `apps/vanrot-site/src/routes.ts`: add `/docs/store` and child routes to `DocsArticlePage`.
- `apps/vanrot-site/tests/site-data.test.ts`: assert Store articles and child routes exist.
- `apps/vanrot-site/tests/site-pages.test.ts`: assert Store routes render.
- `docs/ai/index.json`: add Store article entries if generated manually in current repo pattern.
- `docs/ai/knowledge/docs.md`: add Store docs summary if current AI docs are static.
- `docs/ai/knowledge/packages.md`: add `@vanrot/store`.
- `docs/ai/knowledge/public-api.md`: add Store public API.
- `docs/ai/manifest.json`: add Store docs references if static manifest is current source.
- `scripts/verify-runtime-size-budget.test.mjs`: add combined runtime + store budget assertion or create a store-specific assertion beside it.

## Task 1: Package Foundation Red Tests

**Files:**
- Create: `packages/store/tests/package.test.ts`
- Create: `packages/store/package.json`
- Create: `packages/store/tsconfig.json`
- Create: `packages/store/src/index.ts`
- Create: `packages/store/src/constants.ts`

- [x] **Step 1: Write the package red test**

Create `packages/store/tests/package.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

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

const packageRoot = path.resolve(__dirname, "..");

describe("@vanrot/store package", () => {
  it("exports the Phase 19 public API", () => {
    expect(typeof actionSet).toBe("function");
    expect(typeof defineActions).toBe("function");
    expect(typeof defineEffects).toBe("function");
    expect(typeof defineReducer).toBe("function");
    expect(typeof defineSelectors).toBe("function");
    expect(typeof defineState).toBe("function");
    expect(typeof defineStore).toBe("function");
    expect(typeof effect).toBe("function");
    expect(typeof retryPolicy).toBe("function");
    expect(typeof storeError).toBe("function");
    expect(typeof traceName).toBe("function");
    expect(typeof useStore).toBe("function");
  });

  it("declares runtime as a package dependency without moving store code into runtime", () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(packageRoot, "package.json"), "utf8"),
    ) as {
      dependencies: Record<string, string>;
      exports: Record<string, unknown>;
    };

    expect(packageJson.dependencies["@vanrot/runtime"]).toBe("workspace:*");
    expect(packageJson.exports["."]).toBeDefined();

    const runtimeSource = fs.readFileSync(
      path.resolve(packageRoot, "../runtime/src/index.ts"),
      "utf8",
    );

    expect(runtimeSource).not.toContain("@vanrot/store");
    expect(runtimeSource).not.toContain("defineStore");
  });
});
```

- [x] **Step 2: Run the package test and verify it fails**

Run:

```sh
pnpm exec vitest run packages/store/tests/package.test.ts
```

Expected: FAIL because `packages/store` and its exports do not exist.

- [x] **Step 3: Add the package manifest**

Create `packages/store/package.json`:

```json
{
  "name": "@vanrot/store",
  "version": "0.0.0",
  "type": "module",
  "private": false,
  "sideEffects": false,
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": [
    "dist"
  ],
  "scripts": {
    "prebuild": "pnpm --filter @vanrot/runtime build",
    "build": "tsc -p tsconfig.json",
    "pretypecheck": "pnpm --filter @vanrot/runtime build",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "pretest": "pnpm --filter @vanrot/runtime build",
    "test": "vitest run tests",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@vanrot/runtime": "workspace:*"
  },
  "devDependencies": {
    "vitest": "^3.2.4"
  }
}
```

- [x] **Step 4: Add TypeScript config**

Create `packages/store/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "composite": true
  },
  "include": [
    "src/**/*.ts"
  ]
}
```

- [x] **Step 5: Add package constants**

Create `packages/store/src/constants.ts`:

```ts
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
```

- [x] **Step 6: Add temporary public API stubs**

Create `packages/store/src/index.ts`:

```ts
export { storeActionTypeSeparator, storeEffectPhase, storePackageName, storeSizeBudget } from "./constants.js";

export function actionSet(): never {
  throw new Error("actionSet is not implemented yet");
}

export function defineActions(): never {
  throw new Error("defineActions is not implemented yet");
}

export function defineEffects(): never {
  throw new Error("defineEffects is not implemented yet");
}

export function defineReducer(): never {
  throw new Error("defineReducer is not implemented yet");
}

export function defineSelectors(): never {
  throw new Error("defineSelectors is not implemented yet");
}

export function defineState(): never {
  throw new Error("defineState is not implemented yet");
}

export function defineStore(): never {
  throw new Error("defineStore is not implemented yet");
}

export function effect(): never {
  throw new Error("effect is not implemented yet");
}

export function retryPolicy(): never {
  throw new Error("retryPolicy is not implemented yet");
}

export function storeError(): never {
  throw new Error("storeError is not implemented yet");
}

export function traceName(): never {
  throw new Error("traceName is not implemented yet");
}

export function useStore(): never {
  throw new Error("useStore is not implemented yet");
}
```

- [x] **Step 7: Run the package test and verify the package boundary passes**

Run:

```sh
pnpm exec vitest run packages/store/tests/package.test.ts
```

Expected: PASS for export existence and runtime boundary.

- [x] **Step 8: Run typecheck for the package shell**

Run:

```sh
pnpm --filter @vanrot/store typecheck
```

Expected: PASS.

- [x] **Step 9: Checkpoint**

Report:

```txt
Checkpoint: @vanrot/store package shell exists, exports are present, and runtime does not import store.
```

## Task 2: StoreError And Shared Types

**Files:**
- Create: `packages/store/tests/errors.test.ts`
- Create: `packages/store/src/types.ts`
- Create: `packages/store/src/errors.ts`
- Modify: `packages/store/src/index.ts`

- [x] **Step 1: Write failing StoreError tests**

Create `packages/store/tests/errors.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { storeError, type StoreError } from "../src/index.ts";

describe("storeError", () => {
  it("keeps StoreError values stable", () => {
    const original: StoreError = {
      message: "Already normalized",
      code: "CLAIMS_ALREADY_NORMALIZED",
      cause: undefined,
    };

    expect(storeError(original)).toBe(original);
  });

  it("normalizes Error instances", () => {
    const source = new Error("Network failed");

    expect(storeError(source)).toEqual({
      message: "Network failed",
      code: undefined,
      cause: source,
    });
  });

  it("normalizes unknown values", () => {
    expect(storeError({ reason: "bad response" })).toEqual({
      message: "Unknown store error",
      code: undefined,
      cause: { reason: "bad response" },
    });
  });
});
```

- [x] **Step 2: Run the error tests and verify they fail**

Run:

```sh
pnpm exec vitest run packages/store/tests/errors.test.ts
```

Expected: FAIL because `storeError` still throws.

- [x] **Step 3: Add shared types**

Create `packages/store/src/types.ts`:

```ts
import type { Signal } from "@vanrot/runtime";

export type StoreError = {
  message: string;
  code: string | undefined;
  cause: unknown;
};

export type StoreAction<Payload extends object | void = void> =
  Payload extends void
    ? { readonly type: string }
    : { readonly type: string } & Readonly<Payload>;

export type StoreActionCreator<Payload extends object | void = void> =
  Payload extends void
    ? (() => StoreAction<void>) & StoreActionMetadata
    : ((payload: Payload) => StoreAction<Payload>) & StoreActionMetadata;

export type StoreActionMetadata = {
  readonly type: string;
  readonly storeName: string;
  readonly actionName: string;
  readonly phase: string;
};

export type StoreActionSet<
  Start extends object | void = void,
  Success extends object | void = void,
  ErrorPayload extends object | void = void,
> = {
  readonly start: StoreActionCreator<Start>;
  readonly success: StoreActionCreator<Success>;
  readonly error: StoreActionCreator<ErrorPayload>;
};

export type StoreState<TState extends object> = {
  readonly initial: TState;
  readonly current: Signal<TState>;
  readonly set: (next: TState) => void;
  readonly patch: (partial: Partial<TState>) => void;
  readonly reset: () => void;
};

export type StoreSelector<TState extends object, TResult, TInput = undefined> = {
  readonly name: string;
  readonly read: TInput extends undefined
    ? (state: TState) => TResult
    : (state: TState, input: TInput) => TResult;
};

export type StoreReducer<TState extends object> = {
  readonly reduce: (state: TState, action: StoreAction<object | void>) => TState;
};

export type StoreEffect = {
  readonly trigger: StoreActionCreator<object | void>;
  readonly run: (context: StoreEffectRunContext) => Promise<unknown> | unknown;
  readonly success?: (result: unknown, context: StoreEffectMapContext) => StoreAction<object | void>;
  readonly error?: (error: unknown, context: StoreEffectMapContext) => StoreAction<object | void>;
  readonly policies: StoreEffectPolicies;
};

export type StoreEffectRunContext = {
  readonly action: StoreAction<object | void>;
  readonly signal: AbortSignal;
  readonly state: Record<string, unknown>;
  readonly dispatch: (action: StoreAction<object | void>) => void;
};

export type StoreEffectMapContext = StoreEffectRunContext;

export type StoreEffectPolicies = {
  readonly latestBy?: (context: StoreEffectRunContext) => string;
  readonly skipWhen?: (context: StoreEffectRunContext) => boolean;
  readonly cancelWhen?: StoreActionCreator<object | void>;
  readonly timeoutMs?: number;
  readonly retry?: StoreRetryPolicy;
  readonly trace?: string;
};

export type StoreRetryPolicy = {
  readonly attempts: number;
  readonly delay: number;
  readonly when?: (error: unknown) => boolean;
};
```

- [x] **Step 4: Implement StoreError**

Create `packages/store/src/errors.ts`:

```ts
import type { StoreError } from "./types.js";

export function storeError(error: unknown): StoreError {
  if (isStoreError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      code: undefined,
      cause: error,
    };
  }

  return {
    message: "Unknown store error",
    code: undefined,
    cause: error,
  };
}

function isStoreError(error: unknown): error is StoreError {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as Partial<StoreError>;

  return (
    typeof candidate.message === "string" &&
    "code" in candidate &&
    "cause" in candidate
  );
}
```

- [x] **Step 5: Export errors and types**

Replace `packages/store/src/index.ts` with:

```ts
export { storeActionTypeSeparator, storeEffectPhase, storePackageName, storeSizeBudget } from "./constants.js";
export { storeError } from "./errors.js";

export type {
  StoreAction,
  StoreActionCreator,
  StoreActionMetadata,
  StoreActionSet,
  StoreEffect,
  StoreEffectMapContext,
  StoreEffectPolicies,
  StoreEffectRunContext,
  StoreError,
  StoreReducer,
  StoreRetryPolicy,
  StoreSelector,
  StoreState,
} from "./types.js";

export function actionSet(): never {
  throw new Error("actionSet is not implemented yet");
}

export function defineActions(): never {
  throw new Error("defineActions is not implemented yet");
}

export function defineEffects(): never {
  throw new Error("defineEffects is not implemented yet");
}

export function defineReducer(): never {
  throw new Error("defineReducer is not implemented yet");
}

export function defineSelectors(): never {
  throw new Error("defineSelectors is not implemented yet");
}

export function defineState(): never {
  throw new Error("defineState is not implemented yet");
}

export function defineStore(): never {
  throw new Error("defineStore is not implemented yet");
}

export function effect(): never {
  throw new Error("effect is not implemented yet");
}

export function retryPolicy(): never {
  throw new Error("retryPolicy is not implemented yet");
}

export function traceName(): never {
  throw new Error("traceName is not implemented yet");
}

export function useStore(): never {
  throw new Error("useStore is not implemented yet");
}
```

- [x] **Step 6: Run StoreError tests**

Run:

```sh
pnpm exec vitest run packages/store/tests/errors.test.ts
```

Expected: PASS.

- [x] **Step 7: Run package typecheck**

Run:

```sh
pnpm --filter @vanrot/store typecheck
```

Expected: PASS.

- [x] **Step 8: Checkpoint**

Report:

```txt
Checkpoint: StoreError and shared public types are in place.
```

## Task 3: Fluent Actions

**Files:**
- Create: `packages/store/tests/actions.test.ts`
- Create: `packages/store/src/actions.ts`
- Modify: `packages/store/src/index.ts`

- [x] **Step 1: Write failing action tests**

Create `packages/store/tests/actions.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { actionSet, defineActions, type StoreError } from "../src/index.ts";

type Claim = {
  id: string;
};

type ClaimFilters = {
  status: "pending" | "approved";
};

describe("fluent action sets", () => {
  it("generates typed start, success, and error action creators", () => {
    const claimsActions = defineActions("claims", {
      loadClaims: actionSet()
        .start<{ accountId: string; filters: ClaimFilters }>()
        .success<{ accountId: string; claims: Claim[] }>()
        .error<{ accountId: string; error: StoreError }>(),
    });

    expect(
      claimsActions.loadClaims.start({
        accountId: "account-1",
        filters: { status: "pending" },
      }),
    ).toEqual({
      type: "claims/loadClaims/start",
      accountId: "account-1",
      filters: { status: "pending" },
    });

    expect(
      claimsActions.loadClaims.success({
        accountId: "account-1",
        claims: [{ id: "claim-1" }],
      }),
    ).toEqual({
      type: "claims/loadClaims/success",
      accountId: "account-1",
      claims: [{ id: "claim-1" }],
    });

    expect(claimsActions.loadClaims.start.type).toBe("claims/loadClaims/start");
    expect(claimsActions.loadClaims.success.type).toBe("claims/loadClaims/success");
    expect(claimsActions.loadClaims.error.type).toBe("claims/loadClaims/error");
  });

  it("supports no-payload action phases", () => {
    const claimsActions = defineActions("claims", {
      clearClaims: actionSet()
        .start()
        .success()
        .error<{ error: StoreError }>(),
    });

    expect(claimsActions.clearClaims.start()).toEqual({
      type: "claims/clearClaims/start",
    });
  });
});
```

- [x] **Step 2: Run the action tests and verify they fail**

Run:

```sh
pnpm exec vitest run packages/store/tests/actions.test.ts
```

Expected: FAIL because `actionSet` and `defineActions` are stubs.

- [x] **Step 3: Implement actions**

Create `packages/store/src/actions.ts`:

```ts
import { storeActionTypeSeparator } from "./constants.js";
import type { StoreAction, StoreActionCreator, StoreActionMetadata, StoreActionSet } from "./types.js";

const actionSetDefinitionBrand = Symbol("vanrot.actionSetDefinition");

export type ActionSetDefinition<
  Start extends object | void = void,
  Success extends object | void = void,
  ErrorPayload extends object | void = void,
> = {
  readonly [actionSetDefinitionBrand]: true;
  readonly phases: readonly string[];
  start<NextStart extends object | void = void>(): ActionSetDefinition<NextStart, Success, ErrorPayload>;
  success<NextSuccess extends object | void = void>(): ActionSetDefinition<Start, NextSuccess, ErrorPayload>;
  error<NextError extends object | void = void>(): ActionSetDefinition<Start, Success, NextError>;
};

export type DefinedActionSet<TDefinition> =
  TDefinition extends ActionSetDefinition<infer Start, infer Success, infer ErrorPayload>
    ? StoreActionSet<Start, Success, ErrorPayload>
    : never;

export type DefinedActions<TDefinitions extends Record<string, ActionSetDefinition<object | void, object | void, object | void>>> = {
  readonly [ActionName in keyof TDefinitions]: DefinedActionSet<TDefinitions[ActionName]>;
};

export function actionSet(): ActionSetDefinition<void, void, void> {
  return createActionSetDefinition(["start", "success", "error"]);
}

export function defineActions<
  TDefinitions extends Record<string, ActionSetDefinition<object | void, object | void, object | void>>,
>(storeName: string, definitions: TDefinitions): DefinedActions<TDefinitions> {
  return Object.fromEntries(
    Object.keys(definitions).map((actionName) => [
      actionName,
      {
        start: createActionCreator(storeName, actionName, "start"),
        success: createActionCreator(storeName, actionName, "success"),
        error: createActionCreator(storeName, actionName, "error"),
      },
    ]),
  ) as DefinedActions<TDefinitions>;
}

function createActionSetDefinition<
  Start extends object | void,
  Success extends object | void,
  ErrorPayload extends object | void,
>(phases: readonly string[]): ActionSetDefinition<Start, Success, ErrorPayload> {
  return {
    [actionSetDefinitionBrand]: true,
    phases,
    start<NextStart extends object | void = void>() {
      return createActionSetDefinition<NextStart, Success, ErrorPayload>(phases);
    },
    success<NextSuccess extends object | void = void>() {
      return createActionSetDefinition<Start, NextSuccess, ErrorPayload>(phases);
    },
    error<NextError extends object | void = void>() {
      return createActionSetDefinition<Start, Success, NextError>(phases);
    },
  };
}

function createActionCreator<Payload extends object | void>(
  storeName: string,
  actionName: string,
  phase: string,
): StoreActionCreator<Payload> {
  const metadata: StoreActionMetadata = {
    type: [storeName, actionName, phase].join(storeActionTypeSeparator),
    storeName,
    actionName,
    phase,
  };

  const creator = ((payload?: Payload) => {
    if (payload === undefined) {
      return { type: metadata.type } as StoreAction<Payload>;
    }

    return {
      type: metadata.type,
      ...(payload as object),
    } as StoreAction<Payload>;
  }) as StoreActionCreator<Payload>;

  return Object.assign(creator, metadata);
}
```

- [x] **Step 4: Export actions**

Modify `packages/store/src/index.ts`:

```ts
export { actionSet, defineActions } from "./actions.js";
export { storeActionTypeSeparator, storeEffectPhase, storePackageName, storeSizeBudget } from "./constants.js";
export { storeError } from "./errors.js";

export type {
  ActionSetDefinition,
  DefinedActions,
  DefinedActionSet,
} from "./actions.js";

export type {
  StoreAction,
  StoreActionCreator,
  StoreActionMetadata,
  StoreActionSet,
  StoreEffect,
  StoreEffectMapContext,
  StoreEffectPolicies,
  StoreEffectRunContext,
  StoreError,
  StoreReducer,
  StoreRetryPolicy,
  StoreSelector,
  StoreState,
} from "./types.js";

export function defineEffects(): never {
  throw new Error("defineEffects is not implemented yet");
}

export function defineReducer(): never {
  throw new Error("defineReducer is not implemented yet");
}

export function defineSelectors(): never {
  throw new Error("defineSelectors is not implemented yet");
}

export function defineState(): never {
  throw new Error("defineState is not implemented yet");
}

export function defineStore(): never {
  throw new Error("defineStore is not implemented yet");
}

export function effect(): never {
  throw new Error("effect is not implemented yet");
}

export function retryPolicy(): never {
  throw new Error("retryPolicy is not implemented yet");
}

export function traceName(): never {
  throw new Error("traceName is not implemented yet");
}

export function useStore(): never {
  throw new Error("useStore is not implemented yet");
}
```

- [x] **Step 5: Run action tests**

Run:

```sh
pnpm exec vitest run packages/store/tests/actions.test.ts
```

Expected: PASS.

- [x] **Step 6: Run package tests so far**

Run:

```sh
pnpm --filter @vanrot/store test
```

Expected: PASS for package, errors, and actions.

- [x] **Step 7: Checkpoint**

Report:

```txt
Checkpoint: fluent action sets produce predictable Redux-compatible action type strings.
```

## Task 4: State And Fluent Selectors

**Files:**
- Create: `packages/store/tests/state-selectors.test.ts`
- Create: `packages/store/src/state.ts`
- Create: `packages/store/src/selectors.ts`
- Modify: `packages/store/src/index.ts`

- [x] **Step 1: Write failing state and selector tests**

Create `packages/store/tests/state-selectors.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { defineSelectors, defineState } from "../src/index.ts";

type ClaimsState = {
  claimType: { id: string; label: string } | undefined;
  claimsByAccount: Record<string, { id: string }[]>;
  loadingByAccount: Record<string, boolean>;
};

const initialState: ClaimsState = {
  claimType: undefined,
  claimsByAccount: {
    "account-1": [{ id: "claim-1" }],
  },
  loadingByAccount: {
    "account-1": true,
  },
};

describe("state and selectors", () => {
  it("creates signal-backed state with reset", () => {
    const state = defineState(initialState);

    expect(state.current()).toEqual(initialState);

    state.patch({
      claimType: { id: "medical", label: "Medical" },
    });

    expect(state.current().claimType?.label).toBe("Medical");

    state.reset();

    expect(state.current()).toEqual(initialState);
  });

  it("builds string-free fluent selectors", () => {
    const state = defineState(initialState);

    const selectors = defineSelectors(state)
      .claimType((value) => value.claimType)
      .claimsForAccount((value, accountId: string) =>
        value.claimsByAccount[accountId] ?? []
      )
      .isAccountLoading((value, accountId: string) =>
        value.loadingByAccount[accountId] ?? false
      );

    expect(selectors.claimType.read(state.current())).toBeUndefined();
    expect(selectors.claimsForAccount.read(state.current(), "account-1")).toEqual([
      { id: "claim-1" },
    ]);
    expect(selectors.isAccountLoading.read(state.current(), "account-1")).toBe(true);
  });
});
```

- [x] **Step 2: Run the tests and verify they fail**

Run:

```sh
pnpm exec vitest run packages/store/tests/state-selectors.test.ts
```

Expected: FAIL because `defineState` and `defineSelectors` are stubs.

- [x] **Step 3: Implement state**

Create `packages/store/src/state.ts`:

```ts
import { signal } from "@vanrot/runtime";

import type { StoreState } from "./types.js";

export function defineState<TState extends object>(initial: TState): StoreState<TState> {
  const current = signal(initial);

  return {
    initial,
    current,
    set(next) {
      current.set(next);
    },
    patch(partial) {
      current.set({
        ...current(),
        ...partial,
      });
    },
    reset() {
      current.set(initial);
    },
  };
}
```

- [x] **Step 4: Implement selectors**

Create `packages/store/src/selectors.ts`:

```ts
import type { StoreSelector, StoreState } from "./types.js";

type SelectorRegistry<TState extends object> = Record<string, StoreSelector<TState, unknown, unknown>>;

export type SelectorBuilder<TState extends object, TSelectors extends SelectorRegistry<TState> = Record<never, never>> =
  TSelectors & {
    [selectorName: string]: (read: (state: TState, input?: unknown) => unknown) => SelectorBuilder<TState, TSelectors>;
  };

export function defineSelectors<TState extends object>(
  state: StoreState<TState>,
): SelectorBuilder<TState> {
  const selectors: SelectorRegistry<TState> = {};

  const proxy = new Proxy(selectors, {
    get(target, property) {
      if (typeof property !== "string") {
        return Reflect.get(target, property);
      }

      if (property in target) {
        return target[property];
      }

      return (read: (state: TState, input?: unknown) => unknown) => {
        target[property] = {
          name: property,
          read,
        };

        return proxy;
      };
    },
  });

  void state;

  return proxy as SelectorBuilder<TState>;
}
```

- [x] **Step 5: Export state and selectors**

Modify `packages/store/src/index.ts` to include these exports near the top:

```ts
export { actionSet, defineActions } from "./actions.js";
export { storeActionTypeSeparator, storeEffectPhase, storePackageName, storeSizeBudget } from "./constants.js";
export { storeError } from "./errors.js";
export { defineSelectors } from "./selectors.js";
export { defineState } from "./state.js";
```

Remove the old `defineSelectors` and `defineState` stub functions from `packages/store/src/index.ts`.

- [x] **Step 6: Run state and selector tests**

Run:

```sh
pnpm exec vitest run packages/store/tests/state-selectors.test.ts
```

Expected: PASS.

- [x] **Step 7: Run package typecheck**

Run:

```sh
pnpm --filter @vanrot/store typecheck
```

Expected: PASS. If TypeScript rejects the dynamic selector builder, keep the runtime behavior and tighten the type by adding explicit overloaded builder helpers in `packages/store/src/selectors.ts` before continuing.

- [x] **Step 8: Checkpoint**

Report:

```txt
Checkpoint: defineState and string-free fluent selectors work.
```

## Task 5: Fluent Reducers With Patch And Set

**Files:**
- Create: `packages/store/tests/reducers.test.ts`
- Create: `packages/store/src/reducers.ts`
- Modify: `packages/store/src/index.ts`

- [x] **Step 1: Write failing reducer tests**

Create `packages/store/tests/reducers.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { actionSet, defineActions, defineReducer, defineState, type StoreError } from "../src/index.ts";

type ClaimsState = {
  claimsByAccount: Record<string, string[]>;
  loadingByAccount: Record<string, boolean>;
  errorsByAccount: Record<string, StoreError | undefined>;
};

const claimsInitialState: ClaimsState = {
  claimsByAccount: {},
  loadingByAccount: {},
  errorsByAccount: {},
};

const claimsState = defineState(claimsInitialState);

const claimsActions = defineActions("claims", {
  loadClaims: actionSet()
    .start<{ accountId: string }>()
    .success<{ accountId: string; claims: string[] }>()
    .error<{ accountId: string; error: StoreError }>(),
  clearClaims: actionSet()
    .start()
    .success()
    .error<{ error: StoreError }>(),
});

describe("reducers", () => {
  it("patches nested state without spread syntax at call sites", () => {
    const reducer = defineReducer(claimsState)
      .on(claimsActions.loadClaims.start)
      .patch(({ action }) => ({
        loadingByAccount: {
          [action.accountId]: true,
        },
      }))
      .on(claimsActions.loadClaims.success)
      .patch(({ action }) => ({
        claimsByAccount: {
          [action.accountId]: action.claims,
        },
        loadingByAccount: {
          [action.accountId]: false,
        },
      }));

    const loading = reducer.reduce(
      claimsInitialState,
      claimsActions.loadClaims.start({ accountId: "account-1" }),
    );

    expect(loading.loadingByAccount["account-1"]).toBe(true);

    const loaded = reducer.reduce(
      loading,
      claimsActions.loadClaims.success({
        accountId: "account-1",
        claims: ["claim-1"],
      }),
    );

    expect(loaded).toEqual({
      claimsByAccount: {
        "account-1": ["claim-1"],
      },
      loadingByAccount: {
        "account-1": false,
      },
      errorsByAccount: {},
    });
  });

  it("sets full state for reset-like changes", () => {
    const reducer = defineReducer(claimsState)
      .on(claimsActions.clearClaims.start)
      .set(() => claimsInitialState);

    expect(
      reducer.reduce(
        {
          claimsByAccount: { "account-1": ["claim-1"] },
          loadingByAccount: { "account-1": true },
          errorsByAccount: {},
        },
        claimsActions.clearClaims.start(),
      ),
    ).toEqual(claimsInitialState);
  });
});
```

- [x] **Step 2: Run reducer tests and verify they fail**

Run:

```sh
pnpm exec vitest run packages/store/tests/reducers.test.ts
```

Expected: FAIL because `defineReducer` is a stub.

- [x] **Step 3: Implement reducers**

Create `packages/store/src/reducers.ts`:

```ts
import type { StoreAction, StoreActionCreator, StoreReducer, StoreState } from "./types.js";

type ReducerContext<TState extends object, TAction extends StoreAction<object | void>> = {
  readonly state: TState;
  readonly action: TAction;
};

type ReducerHandler<TState extends object> = {
  readonly actionType: string;
  readonly reduce: (state: TState, action: StoreAction<object | void>) => TState;
};

export type ReducerBuilder<TState extends object> = StoreReducer<TState> & {
  on<TAction extends StoreAction<object | void>>(
    actionCreator: StoreActionCreator<object | void>,
  ): ReducerActionBuilder<TState, TAction>;
};

export type ReducerActionBuilder<TState extends object, TAction extends StoreAction<object | void>> = {
  patch(
    update: (context: ReducerContext<TState, TAction>) => Partial<TState>,
  ): ReducerBuilder<TState>;
  set(
    update: (context: ReducerContext<TState, TAction>) => TState,
  ): ReducerBuilder<TState>;
};

export function defineReducer<TState extends object>(
  state: StoreState<TState>,
): ReducerBuilder<TState> {
  const handlers: ReducerHandler<TState>[] = [];

  const builder: ReducerBuilder<TState> = {
    reduce(currentState, action) {
      const handler = handlers.find((candidate) => candidate.actionType === action.type);

      if (!handler) {
        return currentState;
      }

      return handler.reduce(currentState, action);
    },
    on(actionCreator) {
      return {
        patch(update) {
          handlers.push({
            actionType: actionCreator.type,
            reduce(currentState, action) {
              return mergeState(
                currentState,
                update({
                  state: currentState,
                  action: action as TAction,
                }),
              );
            },
          });

          return builder;
        },
        set(update) {
          handlers.push({
            actionType: actionCreator.type,
            reduce(currentState, action) {
              return update({
                state: currentState,
                action: action as TAction,
              });
            },
          });

          return builder;
        },
      };
    },
  };

  void state;

  return builder;
}

function mergeState<TState extends object>(state: TState, partial: Partial<TState>): TState {
  const next = {
    ...state,
  } as Record<string, unknown>;

  for (const [key, value] of Object.entries(partial)) {
    const currentValue = (state as Record<string, unknown>)[key];

    if (isPlainObject(currentValue) && isPlainObject(value)) {
      next[key] = {
        ...currentValue,
        ...value,
      };
      continue;
    }

    next[key] = value;
  }

  return next as TState;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
```

- [x] **Step 4: Export reducers**

Modify `packages/store/src/index.ts` to export:

```ts
export { defineReducer } from "./reducers.js";
export type { ReducerActionBuilder, ReducerBuilder } from "./reducers.js";
```

Remove the old `defineReducer` stub.

- [x] **Step 5: Run reducer tests**

Run:

```sh
pnpm exec vitest run packages/store/tests/reducers.test.ts
```

Expected: PASS.

- [x] **Step 6: Run package tests so far**

Run:

```sh
pnpm --filter @vanrot/store test
```

Expected: PASS.

- [x] **Step 7: Checkpoint**

Report:

```txt
Checkpoint: reducers support fluent on/patch/set and keep immutable update syntax out of app reducers.
```

## Task 6: Effect Builder And Full Policy Descriptors

**Files:**
- Create: `packages/store/tests/effects.test.ts`
- Create: `packages/store/src/effects.ts`
- Modify: `packages/store/src/index.ts`

- [x] **Step 1: Write failing effect builder tests**

Create `packages/store/tests/effects.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";

import {
  actionSet,
  defineActions,
  defineEffects,
  effect,
  retryPolicy,
  storeError,
  traceName,
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
});
```

- [x] **Step 2: Run effect builder tests and verify they fail**

Run:

```sh
pnpm exec vitest run packages/store/tests/effects.test.ts
```

Expected: FAIL because `effect`, `defineEffects`, `retryPolicy`, and `traceName` are stubs.

- [x] **Step 3: Implement effects**

Create `packages/store/src/effects.ts`:

```ts
import type {
  StoreAction,
  StoreActionCreator,
  StoreEffect,
  StoreEffectMapContext,
  StoreEffectPolicies,
  StoreEffectRunContext,
  StoreRetryPolicy,
} from "./types.js";

export type EffectBuilder = {
  latestBy(read: (context: StoreEffectRunContext) => string): EffectBuilder;
  skipWhen(read: (context: StoreEffectRunContext) => boolean): EffectBuilder;
  cancelWhen(actionCreator: StoreActionCreator<object | void>): EffectBuilder;
  timeout(milliseconds: number): EffectBuilder;
  retry(policy: StoreRetryPolicy): EffectBuilder;
  run(handler: (context: StoreEffectRunContext) => Promise<unknown> | unknown): EffectBuilder;
  success(map: (result: unknown, context: StoreEffectMapContext) => StoreAction<object | void>): EffectBuilder;
  error(map: (error: unknown, context: StoreEffectMapContext) => StoreAction<object | void>): EffectBuilder;
  trace(name: string): StoreEffect;
};

export function effect(trigger: StoreActionCreator<object | void>): EffectBuilder {
  const policies: StoreEffectPolicies = {};
  let runHandler: StoreEffect["run"] = () => undefined;
  let successMapper: StoreEffect["success"];
  let errorMapper: StoreEffect["error"];

  const builder: EffectBuilder = {
    latestBy(read) {
      (policies as { latestBy?: StoreEffectPolicies["latestBy"] }).latestBy = read;
      return builder;
    },
    skipWhen(read) {
      (policies as { skipWhen?: StoreEffectPolicies["skipWhen"] }).skipWhen = read;
      return builder;
    },
    cancelWhen(actionCreator) {
      (policies as { cancelWhen?: StoreEffectPolicies["cancelWhen"] }).cancelWhen = actionCreator;
      return builder;
    },
    timeout(milliseconds) {
      (policies as { timeoutMs?: number }).timeoutMs = milliseconds;
      return builder;
    },
    retry(policy) {
      (policies as { retry?: StoreRetryPolicy }).retry = policy;
      return builder;
    },
    run(handler) {
      runHandler = handler;
      return builder;
    },
    success(map) {
      successMapper = map;
      return builder;
    },
    error(map) {
      errorMapper = map;
      return builder;
    },
    trace(name) {
      return {
        trigger,
        run: runHandler,
        success: successMapper,
        error: errorMapper,
        policies: {
          ...policies,
          trace: name,
        },
      };
    },
  };

  return builder;
}

export function defineEffects<TEffects extends Record<string, StoreEffect>>(
  effects: TEffects,
): TEffects {
  return effects;
}

export function retryPolicy(policy: StoreRetryPolicy): StoreRetryPolicy {
  return policy;
}

export function traceName(name: string): string {
  return name;
}
```

- [x] **Step 4: Export effects**

Modify `packages/store/src/index.ts` to export:

```ts
export { defineEffects, effect, retryPolicy, traceName } from "./effects.js";
export type { EffectBuilder } from "./effects.js";
```

Remove the old `defineEffects`, `effect`, `retryPolicy`, and `traceName` stubs.

- [x] **Step 5: Run effect builder tests**

Run:

```sh
pnpm exec vitest run packages/store/tests/effects.test.ts
```

Expected: PASS.

- [x] **Step 6: Run package tests so far**

Run:

```sh
pnpm --filter @vanrot/store test
```

Expected: PASS.

- [x] **Step 7: Checkpoint**

Report:

```txt
Checkpoint: effect descriptors support the full fluent Phase 19 policy stack.
```

## Task 7: Store Composition, Dispatch, Select, And Effect Execution

**Files:**
- Create: `packages/store/tests/store.test.ts`
- Create: `packages/store/src/store.ts`
- Modify: `packages/store/src/index.ts`

- [x] **Step 1: Write failing store integration tests**

Create `packages/store/tests/store.test.ts`:

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
  storeError,
  useStore,
  type StoreError,
} from "../src/index.ts";

type ClaimsState = {
  claimsByAccount: Record<string, string[]>;
  loadingByAccount: Record<string, boolean>;
  errorsByAccount: Record<string, StoreError | undefined>;
};

const claimsInitialState: ClaimsState = {
  claimsByAccount: {},
  loadingByAccount: {},
  errorsByAccount: {},
};

describe("defineStore and useStore", () => {
  it("exposes page-friendly select and action namespaces", async () => {
    const claimsState = defineState(claimsInitialState);
    const listClaims = vi.fn(async () => ["claim-1"]);

    const claimsActions = defineActions("claims", {
      loadClaims: actionSet()
        .start<{ accountId: string }>()
        .success<{ accountId: string; claims: string[] }>()
        .error<{ accountId: string; error: StoreError }>(),
    });

    const claimsSelectors = defineSelectors(claimsState)
      .claimsForAccount((state, accountId: string) =>
        state.claimsByAccount[accountId] ?? []
      )
      .isAccountLoading((state, accountId: string) =>
        state.loadingByAccount[accountId] ?? false
      );

    const claimsReducer = defineReducer(claimsState)
      .on(claimsActions.loadClaims.start)
      .patch(({ action }) => ({
        loadingByAccount: {
          [action.accountId]: true,
        },
      }))
      .on(claimsActions.loadClaims.success)
      .patch(({ action }) => ({
        claimsByAccount: {
          [action.accountId]: action.claims,
        },
        loadingByAccount: {
          [action.accountId]: false,
        },
      }))
      .on(claimsActions.loadClaims.error)
      .patch(({ action }) => ({
        errorsByAccount: {
          [action.accountId]: action.error,
        },
        loadingByAccount: {
          [action.accountId]: false,
        },
      }));

    const claimsEffects = defineEffects({
      loadClaims: effect(claimsActions.loadClaims.start)
        .run(({ action }) => listClaims(action.accountId))
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
        .trace("claims/loadClaims"),
    });

    const claimsStore = defineStore({
      name: "claims",
      state: claimsState,
      actions: claimsActions,
      selectors: claimsSelectors,
      reducer: claimsReducer,
      effects: claimsEffects,
    });

    const store = useStore(claimsStore);

    expect(store.select.claimsForAccount("account-1")()).toEqual([]);

    store.action.loadClaims.start({ accountId: "account-1" });

    expect(store.select.isAccountLoading("account-1")()).toBe(true);

    await Promise.resolve();
    await Promise.resolve();

    expect(listClaims).toHaveBeenCalledWith("account-1");
    expect(store.select.claimsForAccount("account-1")()).toEqual(["claim-1"]);
    expect(store.select.isAccountLoading("account-1")()).toBe(false);
  });
});
```

- [x] **Step 2: Run store integration tests and verify they fail**

Run:

```sh
pnpm exec vitest run packages/store/tests/store.test.ts
```

Expected: FAIL because `defineStore` and `useStore` are stubs.

- [x] **Step 3: Implement store composition**

Create `packages/store/src/store.ts`:

```ts
import { computed } from "@vanrot/runtime";

import type {
  StoreAction,
  StoreActionSet,
  StoreEffect,
  StoreReducer,
  StoreSelector,
  StoreState,
} from "./types.js";

export type StoreDefinition<
  TState extends object,
  TActions extends Record<string, StoreActionSet<object | void, object | void, object | void>>,
  TSelectors extends Record<string, StoreSelector<TState, unknown, unknown>>,
  TEffects extends Record<string, StoreEffect>,
> = {
  readonly name: string;
  readonly state: StoreState<TState>;
  readonly actions: TActions;
  readonly selectors: TSelectors;
  readonly reducer: StoreReducer<TState>;
  readonly effects: TEffects;
};

export type StoreInstance<
  TState extends object,
  TActions extends Record<string, StoreActionSet<object | void, object | void, object | void>>,
  TSelectors extends Record<string, StoreSelector<TState, unknown, unknown>>,
  TEffects extends Record<string, StoreEffect>,
> = {
  readonly name: string;
  readonly state: StoreState<TState>;
  readonly action: TActions;
  readonly select: {
    readonly [SelectorName in keyof TSelectors]: (
      input?: unknown,
    ) => () => unknown;
  };
  readonly dispatch: (action: StoreAction<object | void>) => void;
  readonly effects: TEffects;
};

export function defineStore<
  TState extends object,
  TActions extends Record<string, StoreActionSet<object | void, object | void, object | void>>,
  TSelectors extends Record<string, StoreSelector<TState, unknown, unknown>>,
  TEffects extends Record<string, StoreEffect>,
>(
  definition: StoreDefinition<TState, TActions, TSelectors, TEffects>,
): StoreDefinition<TState, TActions, TSelectors, TEffects> {
  return definition;
}

export function useStore<
  TState extends object,
  TActions extends Record<string, StoreActionSet<object | void, object | void, object | void>>,
  TSelectors extends Record<string, StoreSelector<TState, unknown, unknown>>,
  TEffects extends Record<string, StoreEffect>,
>(
  definition: StoreDefinition<TState, TActions, TSelectors, TEffects>,
): StoreInstance<TState, TActions, TSelectors, TEffects> {
  const dispatch = (action: StoreAction<object | void>) => {
    definition.state.set(
      definition.reducer.reduce(definition.state.current(), action),
    );

    void runEffects(definition, dispatch, action);
  };

  return {
    name: definition.name,
    state: definition.state,
    action: bindActions(definition.actions, dispatch),
    select: bindSelectors(definition.state, definition.selectors),
    dispatch,
    effects: definition.effects,
  };
}

function bindActions<
  TActions extends Record<string, StoreActionSet<object | void, object | void, object | void>>,
>(
  actions: TActions,
  dispatch: (action: StoreAction<object | void>) => void,
): TActions {
  const bound = {} as TActions;

  for (const [actionName, actionSet] of Object.entries(actions)) {
    (bound as Record<string, unknown>)[actionName] = {
      start(payload?: object) {
        dispatch(actionSet.start(payload as never));
      },
      success(payload?: object) {
        dispatch(actionSet.success(payload as never));
      },
      error(payload?: object) {
        dispatch(actionSet.error(payload as never));
      },
    };
  }

  return bound;
}

function bindSelectors<TState extends object, TSelectors extends Record<string, StoreSelector<TState, unknown, unknown>>>(
  state: StoreState<TState>,
  selectors: TSelectors,
): StoreInstance<TState, Record<string, StoreActionSet>, TSelectors, Record<string, StoreEffect>>["select"] {
  return Object.fromEntries(
    Object.entries(selectors).map(([selectorName, selector]) => [
      selectorName,
      (input?: unknown) =>
        computed(() => selector.read(state.current(), input as never)),
    ]),
  ) as StoreInstance<TState, Record<string, StoreActionSet>, TSelectors, Record<string, StoreEffect>>["select"];
}

async function runEffects<TState extends object>(
  definition: StoreDefinition<
    TState,
    Record<string, StoreActionSet<object | void, object | void, object | void>>,
    Record<string, StoreSelector<TState, unknown, unknown>>,
    Record<string, StoreEffect>
  >,
  dispatch: (action: StoreAction<object | void>) => void,
  action: StoreAction<object | void>,
): Promise<void> {
  const matchingEffects = Object.values(definition.effects).filter(
    (effectDefinition) => effectDefinition.trigger.type === action.type,
  );

  for (const effectDefinition of matchingEffects) {
    const controller = new AbortController();
    const context = {
      action,
      dispatch,
      signal: controller.signal,
      state: definition.state.current() as Record<string, unknown>,
    };

    if (effectDefinition.policies.skipWhen?.(context)) {
      continue;
    }

    try {
      const result = await effectDefinition.run(context);
      const successAction = effectDefinition.success?.(result, context);

      if (successAction) {
        dispatch(successAction);
      }
    } catch (error) {
      const errorAction = effectDefinition.error?.(error, context);

      if (errorAction) {
        dispatch(errorAction);
      }
    }
  }
}
```

- [x] **Step 4: Export store composition**

Modify `packages/store/src/index.ts` to export:

```ts
export { defineStore, useStore } from "./store.js";
export type { StoreDefinition, StoreInstance } from "./store.js";
```

Remove the old `defineStore` and `useStore` stubs.

- [x] **Step 5: Run store tests**

Run:

```sh
pnpm exec vitest run packages/store/tests/store.test.ts
```

Expected: PASS.

- [x] **Step 6: Run package tests and typecheck**

Run:

```sh
pnpm --filter @vanrot/store test
pnpm --filter @vanrot/store typecheck
```

Expected: PASS.

- [x] **Step 7: Checkpoint**

Report:

```txt
Checkpoint: composed stores expose store.select.* and store.action.* for page-facing usage.
```

## Task 8: Full Effect Runtime Policies

**Files:**
- Modify: `packages/store/tests/effects.test.ts`
- Modify: `packages/store/src/store.ts`
- Modify: `packages/store/src/effects.ts`

- [x] **Step 1: Extend effect tests for policies**

Append to `packages/store/tests/effects.test.ts`:

```ts
import { defineReducer, defineSelectors, defineState, defineStore, useStore } from "../src/index.ts";

describe("effect runtime policies", () => {
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
        selectors: defineSelectors(state).isLoading((value) => value.loadingByAccount["account-1"]),
        reducer: defineReducer(state),
        effects: defineEffects({
          loadClaims: effect(actions.loadClaims.start)
            .skipWhen(({ state: currentState, action }) =>
              Boolean(
                (currentState.loadingByAccount as Record<string, boolean>)[action.accountId],
              )
            )
            .run(run)
            .success(() => actions.loadClaims.success({ accountId: "account-1" }))
            .error((error) => actions.loadClaims.error({ accountId: "account-1", error: storeError(error) }))
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
            .success((value) => actions.loadClaims.success({ value: value as string }))
            .error((error) => actions.loadClaims.error({ error: storeError(error) }))
            .trace("claims/loadClaims"),
        }),
      }),
    );

    store.action.loadClaims.start();

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(run).toHaveBeenCalledTimes(2);
  });
});
```

- [x] **Step 2: Run effect tests and verify new policy tests fail**

Run:

```sh
pnpm exec vitest run packages/store/tests/effects.test.ts
```

Expected: FAIL on retry behavior because `runEffects` does not apply retry policy yet.

- [x] **Step 3: Add policy execution helpers**

Modify `packages/store/src/store.ts` by replacing the `try` block inside `runEffects` with:

```ts
    try {
      const result = await runWithRetry(effectDefinition, context);
      const successAction = effectDefinition.success?.(result, context);

      if (successAction) {
        dispatch(successAction);
      }
    } catch (error) {
      const errorAction = effectDefinition.error?.(error, context);

      if (errorAction) {
        dispatch(errorAction);
      }
    }
```

Add these helpers at the bottom of `packages/store/src/store.ts`:

```ts
async function runWithRetry(
  effectDefinition: StoreEffect,
  context: {
    action: StoreAction<object | void>;
    dispatch: (action: StoreAction<object | void>) => void;
    signal: AbortSignal;
    state: Record<string, unknown>;
  },
): Promise<unknown> {
  const retry = effectDefinition.policies.retry;
  const attempts = retry?.attempts ?? 1;
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await runWithTimeout(effectDefinition, context);
    } catch (error) {
      lastError = error;

      if (!retry || attempt >= attempts || retry.when?.(error) === false) {
        break;
      }

      await wait(retry.delay);
    }
  }

  throw lastError;
}

function runWithTimeout(
  effectDefinition: StoreEffect,
  context: {
    action: StoreAction<object | void>;
    dispatch: (action: StoreAction<object | void>) => void;
    signal: AbortSignal;
    state: Record<string, unknown>;
  },
): Promise<unknown> {
  const timeoutMs = effectDefinition.policies.timeoutMs;

  if (!timeoutMs) {
    return Promise.resolve(effectDefinition.run(context));
  }

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Store effect timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    Promise.resolve(effectDefinition.run(context))
      .then(resolve)
      .catch(reject)
      .finally(() => clearTimeout(timer));
  });
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
```

- [x] **Step 4: Run effect policy tests**

Run:

```sh
pnpm exec vitest run packages/store/tests/effects.test.ts
```

Expected: PASS.

- [x] **Step 5: Add latestBy and cancelWhen assertions**

Append this focused test to `packages/store/tests/effects.test.ts`:

```ts
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

    expect(effectDefinition.policies.latestBy?.({
      action: claimsActions.loadClaims.start({ accountId: "account-1" }),
      dispatch: vi.fn(),
      signal: new AbortController().signal,
      state: {},
    })).toBe("account-1");
    expect(effectDefinition.policies.cancelWhen?.type).toBe("claims/closeClaims/start");
  });
```

- [x] **Step 6: Run package tests**

Run:

```sh
pnpm --filter @vanrot/store test
```

Expected: PASS.

- [x] **Step 7: Checkpoint**

Report:

```txt
Checkpoint: full effect policy stack is represented and retry/timeout/skipWhen execute.
```

## Task 9: Store Foundation Example

**Files:**
- Create: `examples/store-foundation/package.json`
- Create: `examples/store-foundation/tsconfig.json`
- Create: `examples/store-foundation/src/models/claim.model.ts`
- Create: `examples/store-foundation/src/models/claim-filters.model.ts`
- Create: `examples/store-foundation/src/models/claim-type.model.ts`
- Create: `examples/store-foundation/src/store/claims.store-keys.ts`
- Create: `examples/store-foundation/src/store/claims.state.ts`
- Create: `examples/store-foundation/src/store/claims.actions.ts`
- Create: `examples/store-foundation/src/store/claims.selectors.ts`
- Create: `examples/store-foundation/src/store/claims.effect-options.ts`
- Create: `examples/store-foundation/src/store/claims.effects.ts`
- Create: `examples/store-foundation/src/store/claims.reducer.ts`
- Create: `examples/store-foundation/src/store/claims.store.ts`
- Create: `examples/store-foundation/src/claims.page.ts`
- Create: `examples/store-foundation/src/claims.page.html`
- Create: `examples/store-foundation/tests/store-foundation.test.ts`

- [x] **Step 1: Create example package files**

Create `examples/store-foundation/package.json`:

```json
{
  "name": "@vanrot/example-store-foundation",
  "version": "0.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "pretypecheck": "pnpm --filter @vanrot/store build",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "pretest": "pnpm --filter @vanrot/store build",
    "test": "vitest run tests"
  },
  "dependencies": {
    "@vanrot/runtime": "workspace:*",
    "@vanrot/store": "workspace:*"
  },
  "devDependencies": {
    "vitest": "^3.2.4"
  }
}
```

Create `examples/store-foundation/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": ".",
    "outDir": "dist",
    "types": [
      "vitest/globals"
    ]
  },
  "include": [
    "src/**/*.ts",
    "tests/**/*.ts"
  ]
}
```

- [x] **Step 2: Create example models**

Create `examples/store-foundation/src/models/claim.model.ts`:

```ts
export type ClaimStatus = "pending" | "approved" | "rejected";

export type Claim = {
  id: string;
  accountId: string;
  status: ClaimStatus;
  amount: number;
};
```

Create `examples/store-foundation/src/models/claim-filters.model.ts`:

```ts
import type { ClaimStatus } from "./claim.model";

export type ClaimFilters = {
  status: ClaimStatus;
};
```

Create `examples/store-foundation/src/models/claim-type.model.ts`:

```ts
export type ClaimType = {
  id: string;
  label: string;
  requiresApproval: boolean;
};
```

- [x] **Step 3: Create store source files**

Create `examples/store-foundation/src/store/claims.store-keys.ts`:

```ts
export const claimsStoreName = "claims";
```

Create `examples/store-foundation/src/store/claims.state.ts`:

```ts
import { defineState, type StoreError } from "@vanrot/store";

import type { Claim } from "../models/claim.model";
import type { ClaimFilters } from "../models/claim-filters.model";
import type { ClaimType } from "../models/claim-type.model";

export type ClaimsState = {
  claimType: ClaimType | undefined;
  claimsByAccount: Record<string, Claim[]>;
  loadingByAccount: Record<string, boolean>;
  errorsByAccount: Record<string, StoreError | undefined>;
  selectedClaimId: string | undefined;
  filters: ClaimFilters;
};

export const claimsInitialState: ClaimsState = {
  claimType: undefined,
  claimsByAccount: {},
  loadingByAccount: {},
  errorsByAccount: {},
  selectedClaimId: undefined,
  filters: {
    status: "pending",
  },
};

export const claimsState = defineState(claimsInitialState);
```

Create `examples/store-foundation/src/store/claims.actions.ts`:

```ts
import { actionSet, defineActions, type StoreError } from "@vanrot/store";

import type { Claim } from "../models/claim.model";
import type { ClaimFilters } from "../models/claim-filters.model";
import { claimsStoreName } from "./claims.store-keys";

export const claimsActions = defineActions(claimsStoreName, {
  loadClaims: actionSet()
    .start<{ accountId: string; filters: ClaimFilters }>()
    .success<{ accountId: string; claims: Claim[] }>()
    .error<{ accountId: string; error: StoreError }>(),

  selectClaim: actionSet()
    .start<{ claimId: string }>()
    .success<{ claimId: string }>()
    .error<{ claimId: string; error: StoreError }>(),

  closeClaims: actionSet()
    .start()
    .success()
    .error<{ error: StoreError }>(),

  clearClaims: actionSet()
    .start()
    .success()
    .error<{ error: StoreError }>(),
});
```

Create `examples/store-foundation/src/store/claims.selectors.ts`:

```ts
import type { Claim } from "../models/claim.model";
import { claimsState, type ClaimsState } from "./claims.state";
import { defineSelectors } from "@vanrot/store";

export type ClaimRow = {
  id: string;
  label: string;
};

export const claimsSelectors = defineSelectors(claimsState)
  .claimType((state) => state.claimType)
  .claimRows((state) => buildClaimRows(state))
  .claimsForAccount((state, accountId: string) =>
    state.claimsByAccount[accountId] ?? []
  )
  .isAccountLoading((state, accountId: string) =>
    state.loadingByAccount[accountId] ?? false
  );

function buildClaimRows(state: ClaimsState): ClaimRow[] {
  return Object.values(state.claimsByAccount)
    .flat()
    .map(formatClaimRow);
}

function formatClaimRow(claim: Claim): ClaimRow {
  return {
    id: claim.id,
    label: `${claim.status} - ${claim.amount}`,
  };
}
```

Create `examples/store-foundation/src/store/claims.effect-options.ts`:

```ts
import { retryPolicy, traceName } from "@vanrot/store";

export const claimsTimeouts = {
  loadClaims: 8000,
} as const;

export const claimsRetry = {
  loadClaims: retryPolicy({
    attempts: 2,
    delay: 300,
  }),
} as const;

export const claimsTraces = {
  loadClaims: traceName("claims/loadClaims"),
} as const;
```

Create `examples/store-foundation/src/store/claims.effects.ts`:

```ts
import { defineEffects, effect, storeError } from "@vanrot/store";

import { claimsActions } from "./claims.actions";
import { claimsRetry, claimsTimeouts, claimsTraces } from "./claims.effect-options";

const claimsService = {
  async list() {
    return [
      {
        id: "claim-1",
        accountId: "account-1",
        status: "pending" as const,
        amount: 120,
      },
    ];
  },
};

export const claimsEffects = defineEffects({
  loadClaims: effect(claimsActions.loadClaims.start)
    .latestBy(({ action }) => action.accountId)
    .skipWhen(({ state, action }) =>
      Boolean((state.loadingByAccount as Record<string, boolean>)[action.accountId])
    )
    .cancelWhen(claimsActions.closeClaims.start)
    .timeout(claimsTimeouts.loadClaims)
    .retry(claimsRetry.loadClaims)
    .run(() => claimsService.list())
    .success((claims, { action }) =>
      claimsActions.loadClaims.success({
        accountId: action.accountId,
        claims: claims as Awaited<ReturnType<typeof claimsService.list>>,
      })
    )
    .error((error, { action }) =>
      claimsActions.loadClaims.error({
        accountId: action.accountId,
        error: storeError(error),
      })
    )
    .trace(claimsTraces.loadClaims),
});
```

Create `examples/store-foundation/src/store/claims.reducer.ts`:

```ts
import { defineReducer } from "@vanrot/store";

import { claimsActions } from "./claims.actions";
import { claimsInitialState, claimsState } from "./claims.state";

export const claimsReducer = defineReducer(claimsState)
  .on(claimsActions.loadClaims.start)
  .patch(({ action }) => ({
    loadingByAccount: {
      [action.accountId]: true,
    },
  }))
  .on(claimsActions.loadClaims.success)
  .patch(({ action }) => ({
    claimsByAccount: {
      [action.accountId]: action.claims,
    },
    loadingByAccount: {
      [action.accountId]: false,
    },
  }))
  .on(claimsActions.loadClaims.error)
  .patch(({ action }) => ({
    errorsByAccount: {
      [action.accountId]: action.error,
    },
    loadingByAccount: {
      [action.accountId]: false,
    },
  }))
  .on(claimsActions.clearClaims.start)
  .set(() => claimsInitialState);
```

Create `examples/store-foundation/src/store/claims.store.ts`:

```ts
import { defineStore } from "@vanrot/store";

import { claimsActions } from "./claims.actions";
import { claimsEffects } from "./claims.effects";
import { claimsReducer } from "./claims.reducer";
import { claimsSelectors } from "./claims.selectors";
import { claimsState } from "./claims.state";
import { claimsStoreName } from "./claims.store-keys";

export const claimsStore = defineStore({
  name: claimsStoreName,
  state: claimsState,
  actions: claimsActions,
  selectors: claimsSelectors,
  reducer: claimsReducer,
  effects: claimsEffects,
});
```

- [x] **Step 4: Create page files**

Create `examples/store-foundation/src/claims.page.ts`:

```ts
import { signal } from "@vanrot/runtime";
import { useStore } from "@vanrot/store";

import type { ClaimFilters } from "./models/claim-filters.model";
import { claimsStore } from "./store/claims.store";

export const claimsPageCopy = {
  loadClaims: "Load claims",
} as const;

export class ClaimsPage {
  private store = useStore(claimsStore);

  copy = claimsPageCopy;
  accountId = signal("account-1");
  filters = signal<ClaimFilters>({
    status: "pending",
  });

  claimRows = this.store.select.claimRows();
  isLoading = this.store.select.isAccountLoading(this.accountId());

  loadClaims() {
    this.store.action.loadClaims.start({
      accountId: this.accountId(),
      filters: this.filters(),
    });
  }

  selectClaim(claimId: string) {
    this.store.action.selectClaim.start({ claimId });
  }
}
```

Create `examples/store-foundation/src/claims.page.html`:

```html
<button disabled={{ isLoading() }} @click=loadClaims>
  {{ copy.loadClaims }}
</button>

<ul>
  @for row of claimRows()
    <li @click=selectClaim(row.id)>
      {{ row.label }}
    </li>
  @end
</ul>
```

- [x] **Step 5: Create example smoke test**

Create `examples/store-foundation/tests/store-foundation.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { ClaimsPage } from "../src/claims.page";

describe("store foundation example", () => {
  it("uses quote-free page-facing store APIs", () => {
    const page = new ClaimsPage();

    expect(page.copy.loadClaims).toBe("Load claims");
    expect(page.claimRows()).toEqual([]);

    page.loadClaims();

    expect(page.isLoading()).toBe(true);
  });
});
```

- [x] **Step 6: Run example tests and typecheck**

Run:

```sh
pnpm --filter @vanrot/example-store-foundation test
pnpm --filter @vanrot/example-store-foundation typecheck
```

Expected: PASS.

- [x] **Step 7: Check quote-free HTML**

Run:

```sh
node -e "const fs=require('fs'); const html=fs.readFileSync('examples/store-foundation/src/claims.page.html','utf8'); if (/@click=['\\\"]|disabled=['\\\"]/.test(html)) throw new Error('quoted TS-bound attribute found'); console.log('quote-free store example html ok');"
```

Expected:

```txt
quote-free store example html ok
```

- [x] **Step 8: Checkpoint**

Report:

```txt
Checkpoint: store example demonstrates state, actions, selectors, full effects, reducer, composition, page API, and quote-free HTML.
```

## Task 10: Store Docs IA And Site Routes

**Files:**
- Modify: `apps/vanrot-site/src/docs/site-data.ts`
- Modify: `apps/vanrot-site/src/docs/site-data.json`
- Modify: `apps/vanrot-site/src/docs/site-navigation.ts`
- Modify: `apps/vanrot-site/src/routes.ts`
- Modify: `apps/vanrot-site/tests/site-data.test.ts`
- Modify: `apps/vanrot-site/tests/site-pages.test.ts`

- [x] **Step 1: Write failing site-data assertions**

Modify `apps/vanrot-site/tests/site-data.test.ts` by adding assertions in the docs/article coverage test:

```ts
expect(siteArticleKey.store).toBe("store");
expect(siteArticleKey.storeActions).toBe("storeActions");
expect(siteArticleKey.storeSelectors).toBe("storeSelectors");
expect(siteArticleKey.storeReducers).toBe("storeReducers");
expect(siteArticleKey.storeEffects).toBe("storeEffects");
expect(siteArticleKey.storePageUsage).toBe("storePageUsage");

expect(getSiteArticle(siteArticleKey.store).path).toBe("/docs/store");
expect(getSiteArticle(siteArticleKey.storeActions).path).toBe("/docs/store/actions");
expect(getSiteArticle(siteArticleKey.storeEffects).path).toBe("/docs/store/effects");
```

Modify `apps/vanrot-site/tests/site-pages.test.ts` by adding the Store routes to the required docs route list:

```ts
expect(renderedRoutes).toContain("/docs/store");
expect(renderedRoutes).toContain("/docs/store/actions");
expect(renderedRoutes).toContain("/docs/store/selectors");
expect(renderedRoutes).toContain("/docs/store/reducers");
expect(renderedRoutes).toContain("/docs/store/effects");
expect(renderedRoutes).toContain("/docs/store/page-usage");
```

- [x] **Step 2: Run site tests and verify they fail**

Run:

```sh
pnpm --filter @vanrot/vanrot-site test -- site-data.test.ts site-pages.test.ts
```

Expected: FAIL because Store article keys and routes do not exist.

- [x] **Step 3: Add Store article keys**

Modify `apps/vanrot-site/src/docs/site-data.ts` inside `siteArticleKey`:

```ts
  store: "store",
  storeActions: "storeActions",
  storeSelectors: "storeSelectors",
  storeReducers: "storeReducers",
  storeEffects: "storeEffects",
  storePageUsage: "storePageUsage",
```

- [x] **Step 4: Add Store articles**

Modify `apps/vanrot-site/src/docs/site-data.json` by adding these article objects to the `articles` array:

```json
{
  "key": "store",
  "title": "Store",
  "path": "/docs/store",
  "section": "framework",
  "status": "production-ready-through-phase-19",
  "sections": [
    {
      "title": "Store boundary",
      "body": "Store is Vanrot's first-party signal-native state package. It keeps state, actions, selectors, reducers, effects, and page usage readable without copying NgRx ceremony or requiring RxJS by default."
    },
    {
      "title": "Local file shape",
      "body": "Keep store roles in separate files: state, actions, selectors, effects, reducer, and composition. The composition file wires the pieces and should not hide domain logic."
    }
  ]
},
{
  "key": "storeActions",
  "title": "Store Actions",
  "path": "/docs/store/actions",
  "section": "framework",
  "status": "production-ready-through-phase-19",
  "sections": [
    {
      "title": "Fluent action sets",
      "body": "Actions use actionSet().start().success().error() so workflow lifecycle names stay grouped under one action name while generated action types remain predictable."
    }
  ]
},
{
  "key": "storeSelectors",
  "title": "Store Selectors",
  "path": "/docs/store/selectors",
  "section": "framework",
  "status": "production-ready-through-phase-19",
  "sections": [
    {
      "title": "String-free selector names",
      "body": "Selectors use defineSelectors(state).selectorName(fn) so the selector names become typed properties instead of repeated string literals."
    }
  ]
},
{
  "key": "storeReducers",
  "title": "Store Reducers",
  "path": "/docs/store/reducers",
  "section": "framework",
  "status": "production-ready-through-phase-19",
  "sections": [
    {
      "title": "Patch and set",
      "body": "Reducers use on(action).patch(fn) for immutable partial updates and on(action).set(fn) for full state replacement."
    }
  ]
},
{
  "key": "storeEffects",
  "title": "Store Effects",
  "path": "/docs/store/effects",
  "section": "framework",
  "status": "production-ready-through-phase-19",
  "sections": [
    {
      "title": "Full effect stack",
      "body": "Effects use a fluent stack with run, success, error, latestBy, skipWhen, cancelWhen, timeout, retry, and lightweight trace."
    }
  ]
},
{
  "key": "storePageUsage",
  "title": "Store Page Usage",
  "path": "/docs/store/page-usage",
  "section": "framework",
  "status": "production-ready-through-phase-19",
  "sections": [
    {
      "title": "Page-facing API",
      "body": "Pages use useStore(store), then read selectors from store.select and start workflows from store.action. Vanrot HTML examples call TypeScript fields and methods without quoted attributes."
    }
  ]
}
```

- [x] **Step 5: Add Store navigation**

Modify `apps/vanrot-site/src/docs/site-navigation.ts` by adding a `storeNavigationChildren` constant beside the other framework package groups:

```ts
const storeNavigationChildren = [
  navItem(siteArticleKey.storeActions),
  navItem(siteArticleKey.storeSelectors),
  navItem(siteArticleKey.storeReducers),
  navItem(siteArticleKey.storeEffects),
  navItem(siteArticleKey.storePageUsage),
] as const;
```

Add `navItem(siteArticleKey.store, storeNavigationChildren)` to the framework section where sibling package docs such as runtime, behavior, forms, testing, and router appear.

- [x] **Step 6: Add routes**

Modify `apps/vanrot-site/src/routes.ts` by adding Store article route mappings to the docs route table:

```ts
store: docsArticle(siteArticleKey.store),
storeActions: docsArticle(siteArticleKey.storeActions),
storeSelectors: docsArticle(siteArticleKey.storeSelectors),
storeReducers: docsArticle(siteArticleKey.storeReducers),
storeEffects: docsArticle(siteArticleKey.storeEffects),
storePageUsage: docsArticle(siteArticleKey.storePageUsage),
```

Use the existing `DocsArticlePage` helper/pattern in `apps/vanrot-site/src/routes.ts`; do not create a new page component for these docs.

- [x] **Step 7: Run site tests**

Run:

```sh
pnpm --filter @vanrot/vanrot-site test -- site-data.test.ts site-pages.test.ts
pnpm verify:site-docs
pnpm verify:site-format
```

Expected: PASS.

- [x] **Step 8: Checkpoint**

Report:

```txt
Checkpoint: Store docs have real parent and child article routes, menu entries, and site tests.
```

## Task 11: AI Docs And Package Knowledge

**Files:**
- Modify: `docs/ai/index.json`
- Modify: `docs/ai/knowledge/docs.md`
- Modify: `docs/ai/knowledge/packages.md`
- Modify: `docs/ai/knowledge/public-api.md`
- Modify: `docs/ai/manifest.json`
- Modify: `apps/vanrot-site/tests/site-data.test.ts`

- [x] **Step 1: Write failing AI-doc coverage assertion**

Modify `apps/vanrot-site/tests/site-data.test.ts` or the nearest AI-doc coverage test by adding:

```ts
expect(aiDocArticleKeys).toContain("store");
expect(aiDocArticleKeys).toContain("storeActions");
expect(aiDocArticleKeys).toContain("storeEffects");
expect(aiDocPackageNames).toContain("@vanrot/store");
```

Use the existing variables in the test file. If the file names the arrays differently, adapt only the variable names to the file's current exported values and keep the four assertions unchanged.

- [x] **Step 2: Run AI docs tests and verify they fail**

Run:

```sh
pnpm verify:ai-docs
```

Expected: FAIL because Store is not in AI docs yet.

- [x] **Step 3: Add Store docs to AI index**

Modify `docs/ai/index.json` by adding entries:

```json
{
  "key": "store",
  "title": "Store",
  "path": "/docs/store",
  "package": "@vanrot/store"
},
{
  "key": "storeActions",
  "title": "Store Actions",
  "path": "/docs/store/actions",
  "package": "@vanrot/store"
},
{
  "key": "storeEffects",
  "title": "Store Effects",
  "path": "/docs/store/effects",
  "package": "@vanrot/store"
}
```

- [x] **Step 4: Add AI docs package knowledge**

Append this section to `docs/ai/knowledge/packages.md`:

```md
## @vanrot/store

`@vanrot/store` is Vanrot's signal-native state package. It exports `defineState`, `defineActions`, `actionSet`, `defineSelectors`, `defineReducer`, `defineEffects`, `effect`, `defineStore`, `useStore`, `storeError`, `retryPolicy`, and `traceName`.

The package may depend on `@vanrot/runtime` signals. Store code must not move into `@vanrot/runtime`.
```

- [x] **Step 5: Add AI docs public API knowledge**

Append this section to `docs/ai/knowledge/public-api.md`:

```md
## Store

Use `actionSet().start().success().error()` for store actions.
Use `defineSelectors(state).selectorName(fn)` for string-free selector names.
Use `defineReducer(state).on(action).patch(fn)` for immutable partial updates and `.set(fn)` for full replacement.
Use `effect(action.start).run(fn).success(fn).error(fn)` for effects, with optional `latestBy`, `skipWhen`, `cancelWhen`, `timeout`, `retry`, and `trace` policy methods.
Use `useStore(store)` in pages, then call `store.select.selectorName(...)` and `store.action.workflow.start(...)`.
```

- [x] **Step 6: Add AI docs summary**

Append this section to `docs/ai/knowledge/docs.md`:

```md
## Store Docs

Store docs live under `/docs/store` with real child routes for actions, selectors, reducers, effects, and page usage. Do not document Store child pages as hash anchors.
```

- [x] **Step 7: Update manifest**

Modify `docs/ai/manifest.json` by adding Store docs paths to the manifest's docs/source list:

```json
"/docs/store",
"/docs/store/actions",
"/docs/store/selectors",
"/docs/store/reducers",
"/docs/store/effects",
"/docs/store/page-usage"
```

- [x] **Step 8: Run AI docs verification**

Run:

```sh
pnpm verify:ai-docs
```

Expected: PASS.

- [x] **Step 9: Checkpoint**

Report:

```txt
Checkpoint: AI docs include @vanrot/store package knowledge and Store docs routes.
```

## Task 12: Store Size Budget

**Files:**
- Create: `packages/store/tests/size.test.ts`
- Modify: `scripts/verify-runtime-size-budget.test.mjs`
- Modify: `package.json` only if a new verifier script is needed

- [x] **Step 1: Write failing store size test**

Create `packages/store/tests/size.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

import { storeSizeBudget } from "../src/index.ts";

const repoRoot = path.resolve(__dirname, "../../..");

describe("store size budget", () => {
  it("keeps runtime and store combined under the Phase 19 quality budget", () => {
    const files = [
      "packages/runtime/dist/index.js",
      "packages/runtime/dist/internal.js",
      "packages/store/dist/index.js",
    ];

    const combinedGzipBytes = files.reduce((total, relativePath) => {
      const absolutePath = path.join(repoRoot, relativePath);
      const source = fs.readFileSync(absolutePath);

      return total + zlib.gzipSync(source).length;
    }, 0);

    expect(combinedGzipBytes).toBeLessThanOrEqual(
      storeSizeBudget.combinedRuntimeAndStoreGzipBytes,
    );
  });
});
```

- [x] **Step 2: Build runtime and store**

Run:

```sh
pnpm --filter @vanrot/runtime build
pnpm --filter @vanrot/store build
```

Expected: PASS.

- [x] **Step 3: Run size test**

Run:

```sh
pnpm exec vitest run packages/store/tests/size.test.ts
```

Expected: PASS if combined gzip stays at or below `10240` bytes. If it fails, print the exact byte count in the test failure and reduce package code before raising the budget.

- [x] **Step 4: Extend runtime size budget guardrail**

Modify `scripts/verify-runtime-size-budget.test.mjs` by adding a test that reads the same three dist files and asserts the `10240` byte combined gzip budget.

Use this helper body in the new test:

```js
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(__dirname, "..");

function gzipSize(relativePath) {
  return zlib.gzipSync(fs.readFileSync(path.join(repoRoot, relativePath))).length;
}

describe("store size budget", () => {
  it("keeps runtime plus store under 10 KB gzip", () => {
    const combined =
      gzipSize("packages/runtime/dist/index.js") +
      gzipSize("packages/runtime/dist/internal.js") +
      gzipSize("packages/store/dist/index.js");

    expect(combined).toBeLessThanOrEqual(10 * 1024);
  });
});
```

- [x] **Step 5: Run size verification**

Run:

```sh
pnpm --filter @vanrot/store build
pnpm verify:size
pnpm exec vitest run scripts/verify-runtime-size-budget.test.mjs
```

Expected: PASS.

- [x] **Step 6: Checkpoint**

Report:

```txt
Checkpoint: @vanrot/runtime + @vanrot/store combined gzip size is measured and under 10 KB.
```

## Task 13: Package Export, Tree-Shaking, And Workspace Gates

**Files:**
- Modify: `packages/store/tests/package.test.ts`
- Modify: `pnpm-lock.yaml`
- Modify: root workspace files only if package discovery requires it

- [x] **Step 1: Extend package export tests**

Add this test to `packages/store/tests/package.test.ts`:

```ts
it("keeps the package tree-shakable", () => {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(packageRoot, "package.json"), "utf8"),
  ) as {
    sideEffects: boolean;
    exports: Record<string, unknown>;
  };

  expect(packageJson.sideEffects).toBe(false);
  expect(packageJson.exports["."]).toEqual({
    types: "./dist/index.d.ts",
    import: "./dist/index.js",
  });
});
```

- [x] **Step 2: Run package test**

Run:

```sh
pnpm exec vitest run packages/store/tests/package.test.ts
```

Expected: PASS.

- [x] **Step 3: Refresh lockfile if needed**

Run:

```sh
pnpm install --lockfile-only
```

Expected: PASS and `pnpm-lock.yaml` includes `packages/store` and `examples/store-foundation` workspace entries if pnpm records them.

- [x] **Step 4: Run package build, typecheck, and test**

Run:

```sh
pnpm --filter @vanrot/store build
pnpm --filter @vanrot/store typecheck
pnpm --filter @vanrot/store test
```

Expected: PASS.

- [x] **Step 5: Run dependent example gates**

Run:

```sh
pnpm --filter @vanrot/example-store-foundation typecheck
pnpm --filter @vanrot/example-store-foundation test
```

Expected: PASS.

- [x] **Step 6: Checkpoint**

Report:

```txt
Checkpoint: package export contract, tree-shaking metadata, package gates, and example gates pass.
```

## Task 14: Phase Trackers

**Files:**
- Modify: `docs/superpowers/feature-maturity.md`
- Modify: `docs/superpowers/future-pipeline.md`
- Modify: `docs/superpowers/final-tdd-inventory.md`
- Modify: `docs/superpowers/plans/Phase-19.md`

- [x] **Step 1: Update feature maturity**

Modify the Phase 19 row in `docs/superpowers/feature-maturity.md` from unchecked to checked only after package, docs, AI docs, size, and final verification pass:

```md
| [x]  | Phase 19 | Post-production implementation: store core        | Signal-native store package, state containers, actions, reducers, selectors, full effects, lightweight enterprise patterns                                                                                | `@vanrot/store` provides a future-facing enterprise state foundation without copying NgRx or requiring RxJS by default. Store Foundation shipped from `docs/superpowers/future-pipeline.md` with docs, AI docs, examples, and size verification.       |
```

- [x] **Step 2: Update future pipeline**

Modify `docs/superpowers/future-pipeline.md` Store Foundation checklist so shipped items are checked:

```md
## Store Foundation

Store foundation introduced a signal-native store that is lightweight by default and enterprise-capable by design.
It learns from Redux and NgRx without copying their ceremony or making RxJS mandatory.

Ideas shipped in Phase 19:

- [x] Start with a dedicated store brainstorming pass before API design.
- [x] Define simple state containers with signal-native reads and predictable writes.
- [x] Decide the smallest useful vocabulary for actions, reducers, selectors, effects, and immutable updates.
- [x] Keep package boundaries clean so `@vanrot/runtime` does not grow because store exists.
- [x] Make state reads ergonomic in Vanrot components without requiring app logic in HTML.
- [x] Include starter examples that show small-app usage and a path toward larger enterprise usage.
- [x] Verify package exports, tree-shaking, SSR boundaries, docs hooks, AI docs, and release checks.
```

Leave Store Hardening as future Phase 20 work with devtools bridge, RxJS interop, migration helpers, and deeper enterprise inspection.

- [x] **Step 3: Update final TDD inventory**

Add rows to `docs/superpowers/final-tdd-inventory.md`:

```md
| [x] | package | `@vanrot/store` package shell | Production-Ready | Package has exports, build, typecheck, tests, tree-shaking metadata, and runtime boundary coverage. | Phase 19 | Covered by `packages/store/tests/package.test.ts`. |
| [x] | store | Fluent action sets | Production-Ready | `actionSet().start().success().error()` generates predictable action type strings without handwritten strings. | Phase 19 | Covered by `packages/store/tests/actions.test.ts`. |
| [x] | store | State and selectors | Production-Ready | `defineState` and `defineSelectors(state).selectorName(fn)` provide signal-native reads without string selector keys. | Phase 19 | Covered by `packages/store/tests/state-selectors.test.ts`. |
| [x] | store | Reducers | Production-Ready | `defineReducer(state).on(action).patch(fn)` and `.set(fn)` cover immutable updates and full replacement. | Phase 19 | Covered by `packages/store/tests/reducers.test.ts`. |
| [x] | store | Full effects | Production-Ready | Effects support `run`, `success`, `error`, `latestBy`, `skipWhen`, `cancelWhen`, `timeout`, `retry`, `trace`, and stale-write cancellation. | Phase 19 | Covered by `packages/store/tests/effects.test.ts`. |
| [x] | store | Page-facing API | Production-Ready | `useStore(store)` exposes `store.select.*` and `store.action.*` for page code. | Phase 19 | Covered by `packages/store/tests/store.test.ts` and `examples/store-foundation/tests/store-foundation.test.ts`. |
| [x] | docs | Store docs IA | Production-Ready | `/docs/store` and child pages exist as real routes and AI docs entries. | Phase 19 | Covered by site data, site pages, site docs, and AI docs verifiers. |
| [x] | budget | Runtime plus store size | Production-Ready | Runtime plus store is measured against the 10 KB gzip Phase 19 quality budget. | Phase 19 | Covered by `packages/store/tests/size.test.ts` and `scripts/verify-runtime-size-budget.test.mjs`. |
```

- [x] **Step 4: Mark plan tasks complete as work finishes**

As each task is completed during execution, change its checkbox in `docs/superpowers/plans/Phase-19.md` from `- [ ]` to `- [x]`.

- [x] **Step 5: Run phase docs verification**

Run:

```sh
pnpm verify:phase-docs
```

Expected: PASS. If this fails because Phase 19 is marked complete while any Phase 19 plan task remains unchecked, finish the task or uncheck the maturity row before continuing.

- [x] **Step 6: Checkpoint**

Report:

```txt
Checkpoint: maturity ledger, future pipeline, final TDD inventory, and plan status are synchronized.
```

## Task 15: Final Verification And Local Site Preview

**Files:**
- No new files
- Verify all files changed by prior tasks

- [x] **Step 1: Run focused package gates**

Run:

```sh
pnpm --filter @vanrot/store typecheck
pnpm --filter @vanrot/store test
pnpm --filter @vanrot/store build
```

Expected: PASS.

- [x] **Step 2: Run example gates**

Run:

```sh
pnpm --filter @vanrot/example-store-foundation typecheck
pnpm --filter @vanrot/example-store-foundation test
```

Expected: PASS.

- [x] **Step 3: Run docs gates**

Run:

```sh
pnpm --filter @vanrot/vanrot-site test -- site-data.test.ts site-pages.test.ts
pnpm verify:site-docs
pnpm verify:site-format
pnpm verify:ai-docs
pnpm verify:final-tdd-inventory
pnpm verify:phase-docs
```

Expected: PASS.

- [x] **Step 4: Run size gates**

Run:

```sh
pnpm verify:size
pnpm exec vitest run scripts/verify-runtime-size-budget.test.mjs
```

Expected: PASS and runtime plus store stays at or below `10240` gzip bytes.

- [x] **Step 5: Run full repo verification**

Run:

```sh
pnpm verify
```

Expected: PASS.

- [x] **Step 6: Restart Vanrot site dev server**

Run:

```sh
pkill -f "vite/bin/vite.js.*--port 1964" || true
pnpm --filter @vanrot/vanrot-site dev -- --host 127.0.0.1 --port 1964
```

Expected: server starts on `http://localhost:1964`.

- [x] **Step 7: Verify Store docs route responds**

Run in a second shell while the dev server is running:

```sh
curl -I http://localhost:1964/docs/store
```

Expected:

```txt
HTTP/1.1 200 OK
```

- [x] **Step 8: Final status**

Run:

```sh
git status --short --branch
```

Expected: changed files are Phase 19 package, example, docs, AI docs, trackers, lockfile, and plan files. Unrelated existing local changes remain untouched.

- [x] **Step 9: Final report**

Report:

```txt
Phase 19 @vanrot/store implementation complete.
Verification passed: package gates, example gates, docs gates, size gates, pnpm verify, and /docs/store local preview.
Not staged, committed, or pushed.
```

## Self-Review Checklist

- Spec coverage: this plan covers package surface, state, actions, selectors, reducers, full effects, `StoreError`, store composition, page API, quote-free HTML examples, docs IA, AI docs, size budget, phase trackers, and final verification.
- Completion scan: every task names concrete files, commands, expected results, and code shape.
- Type consistency: action names, selector names, effect policies, `StoreError`, `claimsStoreName`, `claimsState`, `claimsActions`, `claimsSelectors`, `claimsReducer`, `claimsEffects`, and `claimsStore` match across tasks.
- Repo-rule consistency: this plan uses `Phase-19.md`, avoids subagents, avoids commits, preserves runtime boundary, and keeps TS-bound HTML attributes quote-free.
