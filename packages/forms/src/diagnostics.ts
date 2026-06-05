import { FORM_DIAGNOSTIC_CODES } from './constants.js';
import { isSensitiveField } from './field.js';
import type { FormDiagnostic, InternalVanrotForm, VanrotForm } from './types.js';

export function diagnoseForm(form: VanrotForm<any>): FormDiagnostic[] {
  const diagnostics: FormDiagnostic[] = [];
  const internal = form as InternalVanrotForm;

  for (const field of internal.fieldMap.values()) {
    if (field.options.persistence === 'allow' && isSensitiveField(field.path)) {
      diagnostics.push({
        code: FORM_DIAGNOSTIC_CODES.sensitiveDraftField,
        severity: 'warning',
        message: `Sensitive field "${field.path}" is configured for draft persistence.`,
        formPath: form.name ?? 'anonymous-form',
        fieldPath: field.path,
      });
    }
  }

  return diagnostics;
}
