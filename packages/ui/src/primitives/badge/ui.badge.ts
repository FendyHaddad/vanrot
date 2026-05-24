import { signal } from '@vanrot/runtime';

const badgeCopy = {
  label: 'Badge',
} as const;

export class UiBadge {
  label = signal(badgeCopy.label);
}
