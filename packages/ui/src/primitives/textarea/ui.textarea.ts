import { signal } from '@vanrot/runtime';

const textareaCopy = {
  label: 'Textarea',
} as const;

export class UiTextarea {
  label = signal(textareaCopy.label);
}
