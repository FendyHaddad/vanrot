import { signal } from '@vanrot/runtime';

const navCopy = {
  label: 'Navigation',
} as const;

export class UiNav {
  label = signal(navCopy.label);
}
