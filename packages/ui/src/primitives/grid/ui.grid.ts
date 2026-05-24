import { signal } from '@vanrot/runtime';

const gridCopy = {
  label: 'Grid',
} as const;

export class UiGrid {
  label = signal(gridCopy.label);
}
