import { signal } from '@vanrot/runtime';

const dialogCopy = {
  label: 'Dialog',
} as const;

export class UiDialog {
  label = signal(dialogCopy.label);
}
