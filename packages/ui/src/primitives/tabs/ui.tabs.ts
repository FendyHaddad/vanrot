import { signal } from '@vanrot/runtime';

const tabsCopy = {
  label: 'Tabs',
} as const;

export class UiTabs {
  label = signal(tabsCopy.label);
}
