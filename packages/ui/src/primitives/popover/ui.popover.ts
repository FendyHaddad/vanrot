import { signal } from '@vanrot/runtime';

const popoverCopy = {
  label: 'Popover',
} as const;

export class UiPopover {
  label = signal(popoverCopy.label);
}
