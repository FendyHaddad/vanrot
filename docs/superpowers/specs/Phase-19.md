# Phase 19 - Store Foundation

Status: Approved design spec. Ready for writing-plan pass.

## Goal

Create `@vanrot/store` as the first-party store package for Vanrot.
The package should be signal-native, plain-English to use, and enterprise-capable without copying NgRx ceremony or requiring RxJS by default.

The public name is **Store**.
Avoid framework acronyms and acronym-like API names.
`vr` remains the CLI exception; store APIs should say what they do.

## Design Decisions

- Store ships as a separate package: `@vanrot/store`.
- Store Foundation ships as a full usable suite in Phase 19, not a thin partial feature.
- Phase 19 includes state, actions, selectors, reducers, full effects, `useStore`, `StoreError`, examples, docs, and verification.
- Phase 19 includes the full effect policy stack: `latestBy`, `skipWhen`, `cancelWhen`, `timeout`, `retry`, and lightweight `trace`.
- Browser devtools bridge, RxJS interop, and migration tooling move to Phase 20.
- Store code must stay out of `@vanrot/runtime`.
- `@vanrot/store` may consume `@vanrot/runtime` signal primitives.
- A combined `@vanrot/runtime` + `@vanrot/store` target around `10 KB` gzip is acceptable if measured and justified.
- Do not damage API readability to chase an artificially tiny sub-6 KB store.
- Store examples must follow Vanrot HTML style: no quotes around TS-bound attributes or calls; quotes are only for literal HTML string descriptions.

## Local File Shape

Store roles live in separate files.
Do not collapse state, actions, selectors, effects, reducers, and composition into one large store file.

```txt
claims/
  claims.page.html
  claims.page.ts
  claims.page.scss
  store/
    claims.store-keys.ts
    claims.state.ts
    claims.actions.ts
    claims.selectors.ts
    claims.effects.ts
    claims.reducer.ts
    claims.store.ts
```

`claims.store.ts` composes the pieces.
It should not hold the actual state, action, selector, effect, or reducer logic.

## Store Keys

Store names should live in a named source of truth.

```ts
// claims.store-keys.ts
export const claimsStoreName = "claims";
```

Generated action types stay predictable and Redux-compatible:

```txt
claims/loadClaims/start
claims/loadClaims/success
claims/loadClaims/error
```

Users should not handwrite those strings.

## State

State should keep named types and a named initial state.
This keeps tests, reset behavior, docs, SSR hydration, and enterprise review straightforward.

```ts
// claims.state.ts
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

Model-typed fields are normal state fields.
If there is no honest default, prefer `Model | undefined` over fake blank models.

## Actions

Actions use the same fluent style as effects.
Each user-facing workflow action set includes `start`, `success`, and `error`.

```ts
// claims.actions.ts
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

This replaces object-heavy action definitions such as `actionSet({ start: action<T>() })`.
It preserves a Redux-compatible mental model while staying readable.

## Effects

Effects use a fluent stack.
Simple effects stay short.

```ts
// claims.effects.ts
import { defineEffects, effect, storeError } from "@vanrot/store";
import { claimsActions } from "./claims.actions";
import { claimsService } from "../claims.service";

export const claimsEffects = defineEffects({
  loadClaims: effect(claimsActions.loadClaims.start)
    .run(({ action, signal }) =>
      claimsService.list({
        accountId: action.accountId,
        filters: action.filters,
        signal,
      })
    )
    .success((claims, { action }) =>
      claimsActions.loadClaims.success({
        accountId: action.accountId,
        claims,
      })
    )
    .error((error, { action }) =>
      claimsActions.loadClaims.error({
        accountId: action.accountId,
        error: storeError(error),
      })
    ),
});
```

Full effects still scan line by line.
Move policy details to named constants when they would crowd the workflow.

```ts
// claims.effects.ts
import {
  defineEffects,
  effect,
  storeError,
  traceName,
} from "@vanrot/store";
import { claimsActions } from "./claims.actions";
import {
  claimsRetry,
  claimsTimeouts,
  claimsTraces,
} from "./claims.effect-options";
import { claimsService } from "../claims.service";

export const claimsEffects = defineEffects({
  loadClaims: effect(claimsActions.loadClaims.start)
    .latestBy(({ action }) => action.accountId)
    .skipWhen(({ state, action }) => state.loadingByAccount[action.accountId])
    .cancelWhen(claimsActions.closeClaims.start)
    .timeout(claimsTimeouts.loadClaims)
    .retry(claimsRetry.loadClaims)
    .run(({ action, signal }) =>
      claimsService.list({
        accountId: action.accountId,
        filters: action.filters,
        signal,
      })
    )
    .success((claims, { action }) =>
      claimsActions.loadClaims.success({
        accountId: action.accountId,
        claims,
      })
    )
    .error((error, { action }) =>
      claimsActions.loadClaims.error({
        accountId: action.accountId,
        error: storeError(error),
      })
    )
    .trace(traceName(claimsTraces.loadClaims)),
});
```

The stack should read as:

```txt
when loadClaims.start
keep only latest per account
skip duplicate load
cancel on close
set timeout and retry
run service
map success
map error
trace
```

## Store Error

`StoreError` is built into `@vanrot/store`.
Phase 19 keeps it minimal.

```ts
export type StoreError = {
  message: string;
  code: string | undefined;
  cause: unknown;
};
```

Effects normalize unknown failures with `storeError(error)`.
Do not add `status`, `source`, or `details` in Phase 19 unless the implementation proves they are required.

## Selectors

Selectors use a fluent chain with typed selector properties and no string keys.

```ts
// claims.selectors.ts
import { defineSelectors } from "@vanrot/store";
import { buildClaimRows } from "./claims.view";
import { claimsState } from "./claims.state";

export const claimsSelectors = defineSelectors(claimsState)
  .claimType((state) => state.claimType)

  .claimRows((state) => buildClaimRows(state))

  .isAccountLoading((state, accountId: string) =>
    state.loadingByAccount[accountId] ?? false
  );
```

The generated selector object exposes properties such as:

```ts
claimsSelectors.claimType
claimsSelectors.claimRows
claimsSelectors.isAccountLoading
```

## Reducers

Reducers use fluent `.on(...).patch(...)` by default.
`.patch(...)` performs immutable partial updates so users do not write nested spread syntax for normal state changes.

```ts
// claims.reducer.ts
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

`.set(...)` is for full state replacement.

## Store Composition

The store composition file wires the pieces.
Components and pages should usually import only the composed store.

```ts
// claims.store.ts
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

## Page API

Page-facing code uses `useStore(claimsStore)`.
Normal examples should not call raw `claimsStore.dispatch(claimsStore.actions...)`.

```ts
// claims.page.ts
import { signal } from "@vanrot/runtime";
import { useStore } from "@vanrot/store";
import type { ClaimFilters } from "../models/claim-filters.model";
import { claimsStore } from "./store/claims.store";

export class ClaimsPage {
  private store = useStore(claimsStore);

  accountId = signal("account-1");
  filters = signal<ClaimFilters>({
    status: "pending",
  });

  claimRows = this.store.select.claimRows();
  isLoading = this.store.select.isAccountLoading(this.accountId);

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

Vanrot HTML examples call TS fields and methods without quotes.

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

## Package Surface

Phase 19 public surface should include:

```ts
export {
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
};

export type {
  StoreAction,
  StoreEffect,
  StoreError,
  StoreReducer,
  StoreSelector,
};
```

## Docs IA

Implementation must add the docs surface from the start.

- Docs parent page: `Store`
- Parent route: `/docs/store`
- Real child pages, not hash-anchor fake children
- Child guide for state/actions/selectors/reducers/effects
- Child guide for page usage with `useStore`
- Child guide for full effect policies
- AI docs entries for package setup and API usage
- Public route metadata where the docs app requires it
- Tests proving menu entries, route-to-article mapping, content source entries, generated AI docs, and render coverage cannot disappear

## Verification Scope

Phase 19 plan should include tests for:

- Package exports
- Tree-shaking
- Runtime + store gzip size
- `actionSet().start().success().error()` action typing and generated action types
- `defineState` and initial-state reset behavior
- `defineSelectors(...).selectorName(...)` typing and signal reads
- `defineReducer(...).on(...).patch(...)`
- `defineReducer(...).on(...).set(...)`
- Full effect stack: `run`, `success`, `error`, `latestBy`, `skipWhen`, `cancelWhen`, `timeout`, `retry`, and `trace`
- `StoreError` and `storeError(error)` conversion
- `useStore` page-facing API: `store.select.*` and `store.action.*`
- Quote-free Vanrot HTML examples in docs
- Docs menu and route coverage
- AI docs output
- `feature-maturity.md`, `future-pipeline.md`, and `final-tdd-inventory.md` updates

Final gate remains `pnpm verify`.

## Phase 20 Boundary

Phase 20 should focus on hardening and integration beyond the Phase 19 foundation:

- Browser devtools bridge
- Redux mental-model migration helpers
- RxJS interop
- Deeper tracing visualization
- Enterprise debugging and inspection workflows

Phase 20 should not be required for a normal app to use `@vanrot/store`.
