import { signal } from '@vanrot/runtime';

const tooltipCopy = {
  label: 'Tooltip',
} as const;

export class UiTooltip {
  label = signal(tooltipCopy.label);
}
