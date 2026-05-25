import { signal } from '@vanrot/runtime';

const formFieldCopy = {
  label: 'Form field',
} as const;

export class UiFormField {
  label = signal(formFieldCopy.label);
}
