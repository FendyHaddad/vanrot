import type { DocsSectionLink } from '../../shared/docs-content.ts';

export const storeArticle = {
  "key": "store",
  "section": "framework",
  "path": "/docs/store",
  "label": "Store",
  "title": "Store",
  "summary": "@vanrot/store is the first-party signal-native state package for readable actions, selectors, reducers, full effects, StoreError normalization, page-facing useStore composition, and headless inspection for snapshots and replay.",
  "status": "production-ready-through-phase-20",
  "sections": [
    {
      "id": "store-boundary",
      "title": "Store boundary",
      "body": "@vanrot/store is separate from @vanrot/runtime. Runtime owns signal primitives; Store owns application state workflows built from those primitives. That boundary keeps the browser core small while still giving larger apps a first-party place for actions, reducer rules, selectors, effects, and normalized errors.",
      "points": [
        "Use @vanrot/store when state needs named workflows, derived reads, reducer rules, or async effects.",
        "Keep local one-off component state in runtime signals when no shared workflow exists.",
        "Do not move service calls, reducer logic, or selector decisions into HTML templates.",
        "Treat the store package as optional application structure, not a hidden runtime requirement.",
        "Enable inspectStore only when a page, test, or future devtools bridge needs action timelines, snapshots, or replay."
      ],
      "code": {
        "title": "Store import surface",
        "code": "import {\\n  actionSet,\\n  defineActions,\\n  defineEffects,\\n  defineReducer,\\n  defineSelectors,\\n  defineState,\\n  defineStore,\\n  effect,\\n  storeError,\\n  useStore,\\n} from '@vanrot/store';"
      }
    },
    {
      "id": "file-roles",
      "title": "Local file shape",
      "body": "Store code stays readable when each role has a file. State defines the model and initial value. Actions define workflow names. Selectors define derived reads. Effects define async work. Reducers define state transitions. The composition file wires the pieces together and should not hide business rules.",
      "points": [
        "Use .state.ts for defineState and model-shaped initial state.",
        "Use .actions.ts for actionSet lifecycle declarations.",
        "Use .selectors.ts for string-free selector properties.",
        "Use .effects.ts, .reducer.ts, and .store.ts for orchestration, updates, and composition."
      ],
      "code": {
        "title": "Claims store files",
        "code": "claims.state.ts\\nclaims.actions.ts\\nclaims.selectors.ts\\nclaims.effects.ts\\nclaims.reducer.ts\\nclaims.store.ts\\nclaims.page.ts\\nclaims.page.html"
      }
    },
    {
      "id": "workflow-map",
      "title": "Workflow map",
      "body": "A store workflow starts with a typed action, optionally runs an effect, maps success or error back into another action, and lets the reducer update state. Selectors then expose stable reads to page code. Each step is named in TypeScript, so the template calls page fields instead of rebuilding workflow details in markup.",
      "points": [
        "Actions describe what happened or what should start.",
        "Effects perform async work and map results back to actions.",
        "Reducers make immutable state changes from action payloads.",
        "Selectors prepare rows, flags, and selected records for pages."
      ],
      "code": {
        "title": "Full fluent store stack",
        "code": "import {\\n  actionSet,\\n  defineActions,\\n  defineEffects,\\n  defineReducer,\\n  defineSelectors,\\n  defineState,\\n  defineStore,\\n  effect,\\n  storeError,\\n} from '@vanrot/store';\\n\\nexport const claimsState = defineState<ClaimsState>({\\n  claimType: claimType.medical,\\n  claimsByAccount: {},\\n  loadingByAccount: {},\\n  errorsByAccount: {},\\n  selectedClaimId: undefined,\\n});\\n\\nexport const claimsActions = defineActions(claimsStoreName, {\\n  loadClaims: actionSet()\\n    .start<{ accountId: string; filters: ClaimFilters }>()\\n    .success<{ accountId: string; claims: Claim[] }>()\\n    .error<{ accountId: string; error: StoreError }>(),\\n\\n  selectClaim: actionSet()\\n    .start<{ claimId: string }>(),\\n\\n  clearClaims: actionSet()\\n    .start(),\\n});\\n\\nexport const claimsSelectors = defineSelectors(claimsState)\\n  .claimType((state) => state.claimType)\\n  .claimRows((state) => buildClaimRows(state))\\n  .claimsForAccount((state, accountId: string) =>\\n    state.claimsByAccount[accountId] ?? []\\n  )\\n  .isAccountLoading((state, accountId: string) =>\\n    state.loadingByAccount[accountId] ?? false\\n  );\\n\\nexport const claimsEffects = defineEffects({\\n  loadClaims: effect(claimsActions.loadClaims.start)\\n    .latestBy(({ action }) => action.accountId)\\n    .skipWhen(({ state, action }) =>\\n      Boolean(state.loadingByAccount[action.accountId])\\n    )\\n    .cancelWhen(claimsActions.clearClaims.start)\\n    .timeout(claimsTimeouts.loadClaims)\\n    .retry(claimsRetry.loadClaims)\\n    .run(({ signal, action }) =>\\n      claimsService.list({\\n        accountId: action.accountId,\\n        filters: action.filters,\\n        signal,\\n      })\\n    )\\n    .success((claims, { action }) =>\\n      claimsActions.loadClaims.success({\\n        accountId: action.accountId,\\n        claims,\\n      })\\n    )\\n    .error((error, { action }) =>\\n      claimsActions.loadClaims.error({\\n        accountId: action.accountId,\\n        error: storeError(error),\\n      })\\n    )\\n    .trace(claimsTraces.loadClaims),\\n});\\n\\nexport const claimsReducer = defineReducer(claimsState)\\n  .on(claimsActions.loadClaims.start)\\n  .patch(({ action }) => ({\\n    loadingByAccount: {\\n      [action.accountId]: true,\\n    },\\n  }))\\n  .on(claimsActions.loadClaims.success)\\n  .patch(({ action }) => ({\\n    claimsByAccount: {\\n      [action.accountId]: action.claims,\\n    },\\n    loadingByAccount: {\\n      [action.accountId]: false,\\n    },\\n  }))\\n  .on(claimsActions.clearClaims.start)\\n  .set(() => claimsInitialState);\\n\\nexport const claimsStore = defineStore({\\n  name: claimsStoreName,\\n  state: claimsState,\\n  actions: claimsActions,\\n  selectors: claimsSelectors,\\n  reducer: claimsReducer,\\n  effects: claimsEffects,\\n});"
      }
    },
    {
      "id": "error-and-size",
      "title": "Errors and size",
      "body": "The package includes a small StoreError shape and storeError(error) normalizer so effects can report unknown failures without each app inventing a new wrapper. Store also has an explicit size quality target: the package may be richer than runtime, but it should remain lightweight compared with large state libraries.",
      "points": [
        "StoreError carries message, optional code, and original cause.",
        "Effects should call storeError(error) before dispatching an error action.",
        "Runtime remains under its own core gzip budget.",
        "Runtime plus Store is measured separately so state features do not silently inflate the core."
      ],
      "code": {
        "title": "Error mapping",
        "code": ".error((error, { action }) =>\\n  claimsActions.loadClaims.error({\\n    accountId: action.accountId,\\n    error: storeError(error),\\n  })\\n)"
      }
    }
  ]
} as const;

const sectionLinks = storeArticle.sections.map((section) => ({
  id: section.id,
  title: section.title,
})) satisfies readonly DocsSectionLink[];

export class StorePage {
  title(): string {
    return storeArticle.title;
  }

  summary(): string {
    return storeArticle.summary;
  }

  sectionLinks(): readonly DocsSectionLink[] {
    return sectionLinks;
  }

  section0Body = storeArticle.sections[0].body;
  section1Body = storeArticle.sections[1].body;
  section2Body = storeArticle.sections[2].body;
  section3Body = storeArticle.sections[3].body;
  section0Points = storeArticle.sections[0].points ?? [];
  section1Points = storeArticle.sections[1].points ?? [];
  section2Points = storeArticle.sections[2].points ?? [];
  section3Points = storeArticle.sections[3].points ?? [];
  section0Code = storeArticle.sections[0].code?.code ?? '';
  section1Code = storeArticle.sections[1].code?.code ?? '';
  section2Code = storeArticle.sections[2].code?.code ?? '';
  section3Code = storeArticle.sections[3].code?.code ?? '';
}
