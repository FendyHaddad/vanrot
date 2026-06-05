import type { ServerErrorInput, VanrotForm } from './types.js';

export function applyServerErrors(form: VanrotForm<any>, errors: ServerErrorInput): void {
  for (const field of Array.from((form as { fieldMap?: Map<string, { setServerErrors(messages: string[]): void }> }).fieldMap?.values() ?? [])) {
    field.setServerErrors([]);
  }

  for (const [path, messages] of Object.entries(errors.fields ?? {})) {
    form.findField(path)?.setServerErrors(messages);
  }

  form.setFormErrors(errors.form ?? []);
}
