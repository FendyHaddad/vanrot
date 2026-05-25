import { signal } from '@vanrot/runtime';

const checkboxCopy = {
  label: 'Checkbox',
} as const;

export class UiCheckbox {
  label = signal(checkboxCopy.label);
}
