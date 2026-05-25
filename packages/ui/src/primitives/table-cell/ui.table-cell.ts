import { signal } from '@vanrot/runtime';

const tableCellCopy = {
  label: 'Table cell',
} as const;

export class UiTableCell {
  label = signal(tableCellCopy.label);
}
