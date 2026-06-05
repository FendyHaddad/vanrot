import { VALIDATION_ERROR_SOURCE } from './constants.js';
import type { FormMessage, FormMessageSource, ValidatorResult } from './types.js';

export function createFormMessage(source: FormMessageSource, message: string, code?: string): FormMessage {
  return {
    source,
    message,
    ...(code ? { code } : {}),
  };
}

export function createValidationMessage(message: string, code?: string): FormMessage {
  return createFormMessage(VALIDATION_ERROR_SOURCE, message, code);
}

export function normalizeMessageResult(
  result: ValidatorResult,
  source: FormMessageSource,
  code?: string,
): FormMessage[] {
  if (!result) {
    return [];
  }

  if (typeof result === 'string') {
    return [createFormMessage(source, result, code)];
  }

  if (Array.isArray(result)) {
    return result.flatMap((item) => {
      if (typeof item === 'string') {
        return [createFormMessage(source, item, code)];
      }

      return [item];
    });
  }

  return [result];
}
