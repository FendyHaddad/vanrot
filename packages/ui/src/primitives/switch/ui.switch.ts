import { signal } from '@vanrot/runtime';

const switchCopy = {
  label: 'Switch',
} as const;

export class UiSwitch {
  label = signal(switchCopy.label);
}
