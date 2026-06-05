import { signal } from '@vanrot/runtime';
import { assignFieldPaths, collectFields, collectMetadata, findField, valuesFromFields } from './arrays.js';
import { restoreDraftValues, saveDraftValues } from './draft.js';
import { applyServerErrors } from './server-errors.js';
import type {
  CreateFormOptions,
  FieldFactoryMap,
  FieldValues,
  InternalFormField,
  InternalVanrotForm,
  ServerErrorInput,
  SubmitResult,
  VanrotForm,
} from './types.js';
import { FORM_METADATA_KIND, RESOURCE_ERROR_SOURCE } from './constants.js';
import { normalizeMessageResult } from './messages.js';

export function createForm<TFields extends FieldFactoryMap>(options: CreateFormOptions<TFields>): VanrotForm<TFields> {
  assignFieldPaths(options.fields);

  const submitCount = signal(0);
  const submitting = signal(false);
  const formMessages = signal<string[]>([]);
  const fields = collectFields(options.fields);
  const fieldMap = new Map<string, InternalFormField<unknown>>(fields.map((field) => [field.path, field]));

  let form: InternalVanrotForm<TFields>;

  const allFields = (): InternalFormField<unknown>[] => collectFields(options.fields);
  const isFormValid = (): boolean => allFields().every((field) => field.valid()) && formMessages().length === 0;
  const currentValues = (): FieldValues<TFields> => valuesFromFields(options.fields);
  const findFormField = (path: string): InternalFormField<unknown> | undefined =>
    fieldMap.get(path) ?? findField(options.fields, path);

  form = {
    ...(options.name ? { name: options.name } : {}),
    fields: options.fields,
    submitCount: () => submitCount(),
    submitting: () => submitting(),
    valid: () => isFormValid(),
    invalid: () => !isFormValid(),
    messages: () => formMessages(),
    values: () => currentValues(),
    validate: async () => {
      const values = currentValues() as Record<string, unknown>;

      allFields().forEach((field) => {
        field.setValidated(true);
        field.setSchemaErrors([]);
        field.setResourceErrors([]);
      });

      for (const schema of options.schemas ?? []) {
        const result = await schema.validate(values);

        if (!result.ok) {
          for (const [path, messages] of Object.entries(result.errors ?? {})) {
            findFormField(path)?.setSchemaErrors(messages);
          }
        }
      }

      allFields().forEach((field) => field.validate({ reveal: true, formValues: values }));
      await runAsyncValidators(allFields());
      return isFormValid();
    },
    submit: async (handler?: (values: FieldValues<TFields>) => Promise<SubmitResult | void> | SubmitResult | void) => {
      submitCount.update((count) => count + 1);
      allFields().forEach((field) => {
        field.setSubmitted(true);
        field.touch();
      });

      const isValid = await form.validate();

      if (!isValid) {
        return { ok: false };
      }

      submitting.set(true);

      try {
        const result = await handler?.(currentValues());

        if (result?.errors) {
          applyServerErrors(form, result.errors);
        }

        return result ?? { ok: true };
      } finally {
        submitting.set(false);
      }
    },
    reset: () => {
      formMessages.set([]);
      submitCount.set(0);
      allFields().forEach((field) => field.reset());
    },
    saveDraft: async () => {
      if (options.draft) {
        await saveDraftValues(options.draft, allFields());
      }
    },
    restoreDraft: async () => {
      if (options.draft) {
        await restoreDraftValues(options.draft, allFields());
      }
    },
    clearDraft: async () => {
      await options.draft?.adapter.remove(options.draft.key);
    },
    metadata: () => ({
      kind: FORM_METADATA_KIND,
      ...(options.name ? { name: options.name } : {}),
      fields: collectMetadata(options.fields),
      backendContractGenerated: false,
    }),
    findField: (path: string) => findFormField(path),
    setFormErrors: (messages: string[]) => formMessages.set([...messages]),
    fieldMap,
  } satisfies InternalVanrotForm<TFields>;

  return form;
}

async function runAsyncValidators(fields: InternalFormField<unknown>[]): Promise<void> {
  for (const formField of fields) {
    const resources = formField.options.asyncValidators ?? [];

    if (resources.length === 0) {
      continue;
    }

    formField.pending.set(true);

    try {
      const messages: string[] = [];

      for (const resource of resources) {
        const result = await resource.run(formField.value());
        messages.push(...normalizeMessageResult(result, RESOURCE_ERROR_SOURCE, resource.name).map((message) => message.message));
      }

      formField.setResourceErrors(messages);
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : String(caughtError);
      formField.setResourceErrors([message]);
    } finally {
      formField.pending.set(false);
    }
  }
}
