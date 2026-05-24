import { signal } from '@vanrot/runtime';

const separatorCopy = {
  label: 'Section divider',
} as const;

export class UiSeparator {
  label = signal(separatorCopy.label);
}
