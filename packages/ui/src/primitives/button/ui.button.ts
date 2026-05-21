import { signal } from '@vanrot/runtime';

const buttonCopy = {
  label: 'Button',
} as const;

export class UiButton {
  label = signal(buttonCopy.label);
}
