import { signal } from '@vanrot/runtime';

const listCopy = {
  label: 'List',
} as const;

export class UiList {
  label = signal(listCopy.label);
}
