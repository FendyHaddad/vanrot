import { signal } from '@vanrot/runtime';

const srcCopy = {
  label: 'Source',
} as const;

export class UiSrc {
  label = signal(srcCopy.label);
}
