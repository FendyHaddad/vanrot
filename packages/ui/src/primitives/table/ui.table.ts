import { signal } from '@vanrot/runtime';

const tableCopy = {
  label: 'Table',
} as const;

export class UiTable {
  label = signal(tableCopy.label);
}
