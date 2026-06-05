import { signal } from '@vanrot/runtime';
import {
  DEFAULT_SENSITIVE_FIELD_NAMES,
  RESOURCE_ERROR_SOURCE,
  SCHEMA_ERROR_SOURCE,
  SERVER_ERROR_SOURCE,
} from './constants.js';
import { runValidators } from './validation.js';
import type {
  FieldOptions,
  FieldPersistence,
  FormField,
  FormFieldMetadata,
  FormMessage,
  InternalFormField,
  ValidateFieldOptions,
} from './types.js';

export function field<T>(initialValue: T, options: FieldOptions<T> = {}): FormField<T> {
  const source = signal(initialValue);
  const initial = signal(initialValue);
  const dirty = signal(false);
  const touched = signal(false);
  const disabled = signal(false);
  const pending = signal(false);
  const submitted = signal(false);
  const validated = signal(false);
  const path = signal('');
  const name = signal('');
  const serverErrors = signal<string[]>([]);
  const schemaErrors = signal<string[]>([]);
  const resourceErrors = signal<string[]>([]);

  const value = (() => source()) as FormField<T>['value'];
  value.set = (next: T) => {
    source.set(next);
    dirty.set(!sameValue(next, initial()));
  };
  value.update = (updater: (current: T) => T) => value.set(updater(source()));

  const getErrors = (): FormMessage[] =>
    currentErrors(
      {
        path: path(),
        value,
      },
      options,
    );

  const fieldRef: InternalFormField<T> = {
    kind: 'field',
    get name() {
      return name();
    },
    get path() {
      return path();
    },
    value,
    initialValue: () => initial(),
    dirty: () => dirty(),
    touched: () => touched(),
    disabled,
    pending,
    valid: () => getErrors().length === 0 && serverErrors().length === 0 && schemaErrors().length === 0 && resourceErrors().length === 0,
    invalid: () => !fieldRef.valid(),
    errors: () => getErrors(),
    messages: () => visibleMessages({ path: path(), value }, options, {
      submitted: submitted(),
      touched: touched(),
      dirty: dirty(),
      validated: validated(),
      serverErrors: serverErrors(),
      schemaErrors: schemaErrors(),
      resourceErrors: resourceErrors(),
    }),
    touch: () => touched.set(true),
    reset: () => {
      source.set(initial());
      dirty.set(false);
      touched.set(false);
      disabled.set(false);
      submitted.set(false);
      validated.set(false);
      serverErrors.set([]);
      schemaErrors.set([]);
      resourceErrors.set([]);
      pending.set(false);
    },
    validate: (validateOptions: ValidateFieldOptions = {}) => {
      if (validateOptions.reveal) {
        validated.set(true);
      }

      return currentErrors({ path: path(), value }, options, validateOptions.formValues);
    },
    setServerErrors: (messages: string[]) => serverErrors.set([...messages]),
    setSchemaErrors: (messages: string[]) => schemaErrors.set([...messages]),
    setResourceErrors: (messages: string[]) => resourceErrors.set([...messages]),
    metadata: () => fieldMetadata({ path: path() }, options),
    setPath: (nextPath: string) => {
      path.set(nextPath);
      name.set(nextPath.split('.').at(-1)?.replace(/\[\d+\]/g, '') ?? nextPath);
    },
    setSubmitted: (nextSubmitted: boolean) => submitted.set(nextSubmitted),
    setValidated: (nextValidated: boolean) => validated.set(nextValidated),
    setInitialValue: (nextValue: T) => {
      initial.set(nextValue);
      source.set(nextValue);
      dirty.set(false);
    },
    options,
  };

  return fieldRef;
}

export function isSensitiveField(path: string): boolean {
  const lowerPath = path.toLowerCase();
  return DEFAULT_SENSITIVE_FIELD_NAMES.some((name) => lowerPath.includes(name));
}

export function shouldPersistField(path: string, persistence: FieldPersistence | undefined): boolean {
  if (persistence === 'never') {
    return false;
  }

  if (persistence === 'allow') {
    return true;
  }

  return !isSensitiveField(path);
}

function currentErrors<T>(
  formField: Pick<FormField<T>, 'path' | 'value'> & { setSchemaErrors?: (messages: string[]) => void },
  options: FieldOptions<T>,
  formValues: Record<string, unknown> = {},
): FormMessage[] {
  return runValidators(options.validators, {
    value: formField.value(),
    path: formField.path,
    formValues,
  });
}

function visibleMessages<T>(
  formField: Pick<FormField<T>, 'path' | 'value'>,
  options: FieldOptions<T>,
  state: {
    submitted: boolean;
    touched: boolean;
    dirty: boolean;
    validated: boolean;
    serverErrors: string[];
    schemaErrors: string[];
    resourceErrors: string[];
  },
): string[] {
  const messages: string[] = [];

  if (state.touched || state.dirty || state.submitted || state.validated) {
    messages.push(...currentErrors(formField, options).map((error) => error.message));
  }

  messages.push(...state.schemaErrors);
  messages.push(...state.serverErrors);
  messages.push(...state.resourceErrors);

  return messages;
}

function fieldMetadata<T>(formField: Pick<FormField<T>, 'path'>, options: FieldOptions<T>): FormFieldMetadata {
  return {
    path: formField.path,
    kind: 'field',
    validators: (options.validators ?? []).map((validator, index) =>
      typeof validator === 'function' ? `custom-${index + 1}` : validator.name,
    ),
    persistence: options.persistence ?? 'auto',
    sensitive: isSensitiveField(formField.path),
  };
}

function sameValue<T>(left: T, right: T): boolean {
  return Object.is(left, right);
}
