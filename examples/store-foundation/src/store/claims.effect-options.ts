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
