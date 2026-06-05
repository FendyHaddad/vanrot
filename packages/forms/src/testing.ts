import type { FormField, VanrotForm } from './types.js';

export type FormTestHandle = {
  set(path: string, value: unknown): void;
  touch(path: string): void;
  field(path: string): FormField<unknown>;
  submit(): Promise<void>;
  expectField(path: string): {
    toHaveMessage(message: string): void;
  };
};

export function createFormTest(form: VanrotForm<any>): FormTestHandle {
  return {
    set: (path, value) => {
      getField(form, path).value.set(value);
    },
    touch: (path) => getField(form, path).touch(),
    field: (path) => getField(form, path),
    submit: async () => {
      await form.submit();
    },
    expectField: (path) => ({
      toHaveMessage: (message) => {
        if (!getField(form, path).messages().includes(message)) {
          throw new Error(`Expected field "${path}" to include message "${message}".`);
        }
      },
    }),
  };
}

function getField(form: VanrotForm<any>, path: string): FormField<unknown> {
  const field = form.findField(path);

  if (!field) {
    throw new Error(`Unknown form field "${path}".`);
  }

  return field;
}
