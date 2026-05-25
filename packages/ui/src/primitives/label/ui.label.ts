import { signal } from '@vanrot/runtime';

const labelCopy = {
  label: 'Label',
} as const;

export class UiLabel {
  label = signal(labelCopy.label);
}
