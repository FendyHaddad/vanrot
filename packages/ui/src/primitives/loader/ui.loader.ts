import { signal } from '@vanrot/runtime';

const loaderCopy = {
  label: 'Loading',
} as const;

export class UiLoader {
  label = signal(loaderCopy.label);
}
