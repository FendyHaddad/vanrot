import { signal } from '@vanrot/runtime';

const selectCopy = {
  label: 'Select',
} as const;

export class UiSelect {
  label = signal(selectCopy.label);
}
