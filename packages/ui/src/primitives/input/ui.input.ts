import { signal } from '@vanrot/runtime';

const inputCopy = {
  label: 'Input',
} as const;

export class UiInput {
  label = signal(inputCopy.label);
}
