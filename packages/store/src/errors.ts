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
