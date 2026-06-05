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
