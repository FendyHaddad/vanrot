import { signal } from '@vanrot/runtime';

const tableHeaderCopy = {
  label: 'Table header',
} as const;

export class UiTableHeader {
  label = signal(tableHeaderCopy.label);
}
