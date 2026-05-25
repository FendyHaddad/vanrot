import { signal } from '@vanrot/runtime';

const tableRowCopy = {
  label: 'Table row',
} as const;

export class UiTableRow {
  label = signal(tableRowCopy.label);
}
