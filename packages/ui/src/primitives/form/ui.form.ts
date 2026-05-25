import { signal } from '@vanrot/runtime';

const formCopy = {
  label: 'Form',
} as const;

export class UiForm {
  label = signal(formCopy.label);
}
