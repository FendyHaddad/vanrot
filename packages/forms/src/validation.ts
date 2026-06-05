import { normalizeMessageResult } from './messages.js';
import type {
  FieldValidator,
  FieldValidatorInput,
  FormMessage,
  SchemaAdapter,
  ValidatorContext,
  ValidatorResult,
} from './types.js';

export function required(message = 'This field is required.'): FieldValidator<unknown> {
  return {
    name: 'required',
    validate: ({ value }) => {
      if (value === null || value === undefined) {
        return message;
      }

      if (typeof value === 'string' && value.trim().length === 0) {
        return message;
      }

      if (Array.isArray(value) && value.length === 0) {
        return message;
      }

      return null;
    },
  };
}

export function minLength(length: number, message = `Must be at least ${length} characters.`): FieldValidator<unknown> {
  return {
    name: 'minLength',
    validate: ({ value }) => {
      if (typeof value !== 'string') {
        return null;
      }

      return value.length < length ? message : null;
    },
  };
}

export function email(message = 'Email is invalid.'): FieldValidator<unknown> {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return {
    name: 'email',
    validate: ({ value }) => {
      if (typeof value !== 'string' || value.length === 0) {
        return null;
      }

      return emailPattern.test(value) ? null : message;
    },
  };
}

export function normalizeValidator<T>(validator: FieldValidatorInput<T>, index: number): FieldValidator<T> {
  if (typeof validator === 'function') {
    return {
      name: `custom-${index + 1}`,
      validate: validator,
    };
  }

  return validator;
}

export function runValidators<T>(
  validators: FieldValidatorInput<T>[] | undefined,
  context: ValidatorContext<T>,
): FormMessage[] {
  return (validators ?? []).flatMap((validator, index) => {
    const normalized = normalizeValidator(validator, index);
    return normalizeValidatorResult(normalized.validate(context), normalized.name);
  });
}

export function normalizeValidatorResult(result: ValidatorResult, code?: string): FormMessage[] {
  return normalizeMessageResult(result, 'validation', code);
}

export function useSchemaAdapter(adapter: SchemaAdapter): SchemaAdapter {
  return Object.freeze({ ...adapter, fields: [...adapter.fields] });
}
