import { signal } from '@vanrot/runtime';

const statCopy = {
  label: 'Stat',
} as const;

export class UiStat {
  label = signal(statCopy.label);
}
