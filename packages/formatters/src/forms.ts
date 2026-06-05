type FormLikeMessageSource = {
  messages: () => readonly string[];
};

export function messagePipe(value: unknown): string {
  return messagesPipe(value)[0] ?? '';
}

export function messagesPipe(value: unknown): string[] {
  if (!isFormLikeMessageSource(value)) {
    return [];
  }

  return [...value.messages()];
}

function isFormLikeMessageSource(value: unknown): value is FormLikeMessageSource {
  return typeof value === 'object' && value !== null && 'messages' in value && typeof value.messages === 'function';
}
