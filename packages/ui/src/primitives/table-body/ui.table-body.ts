import { signal } from '@vanrot/runtime';

const tableBodyCopy = {
  label: 'Table body',
} as const;

export class UiTableBody {
  label = signal(tableBodyCopy.label);
}
