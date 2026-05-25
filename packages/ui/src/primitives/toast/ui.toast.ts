import { signal } from '@vanrot/runtime';

const toastCopy = {
  label: 'Toast',
} as const;

export class UiToast {
  label = signal(toastCopy.label);
}
