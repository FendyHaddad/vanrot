import { signal } from '@vanrot/runtime';

const radioGroupCopy = {
  label: 'Radio group',
} as const;

export class UiRadioGroup {
  label = signal(radioGroupCopy.label);
}
