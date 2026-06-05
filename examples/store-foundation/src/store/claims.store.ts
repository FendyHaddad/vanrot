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
