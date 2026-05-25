import { signal } from '@vanrot/runtime';

const dropdownCopy = {
  label: 'Dropdown',
} as const;

export class UiDropdown {
  label = signal(dropdownCopy.label);
}
