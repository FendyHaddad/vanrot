import { signal } from '@vanrot/runtime';

const tableFooterCopy = {
  label: 'Table footer',
} as const;

export class UiTableFooter {
  label = signal(tableFooterCopy.label);
}
