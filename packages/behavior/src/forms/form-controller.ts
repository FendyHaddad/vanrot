import { signal, type WritableSignal } from '@vanrot/runtime';

export type FormFieldValue = string | number | boolean | null | undefined;
export type FormValues = Readonly<Record<string, FormFieldValue>>;
export type FormErrors = Readonly<Record<string, readonly string[]>>;
export type FormValidator = (value: FormFieldValue, values: FormValues) => string | null;

export interface FormFieldOptions {
  name: string;
  initialValue?: FormFieldValue;
  required?: boolean;
  disabled?: boolean;
  validators?: readonly FormValidator[];
}

export interface FormFieldController {
  name: string;
  value: WritableSignal<FormFieldValue>;
  dirty: WritableSignal<boolean>;
  touched: WritableSignal<boolean>;
  errors: WritableSignal<readonly string[]>;
  valid: () => boolean;
  invalid: () => boolean;
  setValue(value: FormFieldValue): void;
  markTouched(): void;
  validate(values: FormValues): readonly string[];
  reset(value?: FormFieldValue): void;
}

export interface FormController {
  value: WritableSignal<FormValues>;
  dirty: WritableSignal<boolean>;
  touched: WritableSignal<boolean>;
  valid: WritableSignal<boolean>;
  invalid: WritableSignal<boolean>;
  errors: WritableSignal<FormErrors>;
  disabled: WritableSignal<boolean>;
  pending: WritableSignal<boolean>;
  submitted: WritableSignal<boolean>;
  registerField(options: FormFieldOptions): FormFieldController;
  setValue(name: string, value: FormFieldValue): void;
  validate(): boolean;
  reset(values?: FormValues): void;
  submit(handler: (values: FormValues) => void | Promise<void>): Promise<boolean>;
}

export function requiredValidator(value: FormFieldValue): string | null {
  if (value === null || value === undefined || value === '') {
    return 'This field is required.';
  }

  return null;
}

export function emailValidator(value: FormFieldValue): string | null {
  if (typeof value !== 'string' || value.length === 0) {
    return null;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : 'Enter a valid email address.';
}

export function minLengthValidator(length: number): FormValidator {
  return (value) => {
    if (typeof value !== 'string' || value.length >= length) {
      return null;
    }

    return `Use at least ${length} characters.`;
  };
}

export function createFormController(initialValues: FormValues = {}): FormController {
  const fields = new Map<string, FormFieldController>();
  const value = signal<FormValues>({ ...initialValues });
  const dirty = signal(false);
  const touched = signal(false);
  const valid = signal(true);
  const invalid = signal(false);
  const errors = signal<FormErrors>({});
  const disabled = signal(false);
  const pending = signal(false);
  const submitted = signal(false);

  function syncFlags(): void {
    const nextErrors = Object.fromEntries(
      [...fields.values()]
        .map((field) => [field.name, field.errors()] as const)
        .filter(([, fieldErrors]) => fieldErrors.length > 0),
    );
    const hasErrors = Object.keys(nextErrors).length > 0;

    errors.set(nextErrors);
    invalid.set(hasErrors);
    valid.set(!hasErrors);
    dirty.set([...fields.values()].some((field) => field.dirty()));
    touched.set([...fields.values()].some((field) => field.touched()));
  }

  function registerField(options: FormFieldOptions): FormFieldController {
    const initialValue = value()[options.name] ?? options.initialValue ?? '';
    const validators = [
      ...(options.required ? [requiredValidator] : []),
      ...(options.validators ?? []),
    ];
    const fieldValue = signal<FormFieldValue>(initialValue);
    const fieldDirty = signal(false);
    const fieldTouched = signal(false);
    const fieldErrors = signal<readonly string[]>([]);

    const field: FormFieldController = {
      name: options.name,
      value: fieldValue,
      dirty: fieldDirty,
      touched: fieldTouched,
      errors: fieldErrors,
      valid: () => fieldErrors().length === 0,
      invalid: () => fieldErrors().length > 0,
      setValue(nextValue) {
        fieldValue.set(nextValue);
        fieldDirty.set(true);
        value.set({
          ...value(),
          [options.name]: nextValue,
        });
        syncFlags();
      },
      markTouched() {
        fieldTouched.set(true);
        syncFlags();
      },
      validate(values) {
        const nextErrors = validators
          .map((validator) => validator(fieldValue(), values))
          .filter((message): message is string => message !== null);

        fieldErrors.set(nextErrors);
        syncFlags();

        return nextErrors;
      },
      reset(nextValue = initialValue) {
        fieldValue.set(nextValue);
        fieldDirty.set(false);
        fieldTouched.set(false);
        fieldErrors.set([]);
      },
    };

    fields.set(options.name, field);
    value.set({
      ...value(),
      [options.name]: initialValue,
    });
    syncFlags();

    return field;
  }

  function validate(): boolean {
    const values = value();

    for (const field of fields.values()) {
      field.validate(values);
    }

    syncFlags();

    return valid();
  }

  function reset(values: FormValues = initialValues): void {
    value.set({ ...values });
    submitted.set(false);
    pending.set(false);

    for (const field of fields.values()) {
      field.reset(values[field.name] ?? '');
    }

    syncFlags();
  }

  return {
    value,
    dirty,
    touched,
    valid,
    invalid,
    errors,
    disabled,
    pending,
    submitted,
    registerField,
    setValue(name, nextValue) {
      const field = fields.get(name);

      if (field === undefined) {
        value.set({
          ...value(),
          [name]: nextValue,
        });
        return;
      }

      field.setValue(nextValue);
    },
    validate,
    reset,
    async submit(handler) {
      submitted.set(true);

      if (!validate()) {
        for (const field of fields.values()) {
          field.markTouched();
        }

        return false;
      }

      pending.set(true);

      try {
        await handler(value());
        return true;
      } finally {
        pending.set(false);
      }
    },
  };
}

export function connectFormControl(
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  field: FormFieldController,
): () => void {
  const onInput = (): void => {
    field.setValue(element.value);
  };
  const onBlur = (): void => {
    field.markTouched();
  };

  element.addEventListener('input', onInput);
  element.addEventListener('change', onInput);
  element.addEventListener('blur', onBlur);

  return () => {
    element.removeEventListener('input', onInput);
    element.removeEventListener('change', onInput);
    element.removeEventListener('blur', onBlur);
  };
}
