import { signal } from '@vanrot/runtime';

const emptyStateCopy = {
  label: 'Empty state',
} as const;

export class UiEmptyState {
  label = signal(emptyStateCopy.label);
}
