import { signal } from '@vanrot/runtime';

const stackCopy = {
  label: 'Stack',
} as const;

export class UiStack {
  label = signal(stackCopy.label);
}
