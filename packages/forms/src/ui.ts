import type { FormField } from './types.js';

export type FormFieldUiOptions = {
  label: string;
  description?: string;
};

export type FormFieldUi = {
  id: string;
  label: string;
  description?: string;
  inputAttributes(): Record<string, string>;
  messageAttributes(): Record<string, string>;
  messages(): string[];
};

export function formField(field: FormField<unknown>, options: FormFieldUiOptions): FormFieldUi {
  const id = sanitizeId(field.path || options.label);
  const descriptionId = `${id}-description`;
  const messageId = `${id}-messages`;

  return {
    id,
    label: options.label,
    ...(options.description ? { description: options.description } : {}),
    inputAttributes: () => ({
      id,
      name: field.path,
      'aria-invalid': field.invalid() ? 'true' : 'false',
      'aria-describedby': [options.description ? descriptionId : '', field.messages().length > 0 ? messageId : '']
        .filter(Boolean)
        .join(' '),
    }),
    messageAttributes: () => ({
      id: messageId,
      role: 'status',
    }),
    messages: () => field.messages(),
  };
}

function sanitizeId(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-|-$/g, '') || 'field';
}
