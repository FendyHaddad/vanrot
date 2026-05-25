import { signal } from '@vanrot/runtime';

const tableHeadCopy = {
  label: 'Table head',
} as const;

export class UiTableHead {
  label = signal(tableHeadCopy.label);
}
