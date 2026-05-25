import { signal } from '@vanrot/runtime';

const listItemCopy = {
  label: 'List item',
} as const;

export class UiListItem {
  label = signal(listItemCopy.label);
}
