import { signal } from '@vanrot/runtime';

const commandMenuCopy = {
  label: 'Command menu',
} as const;

export class UiCommandMenu {
  label = signal(commandMenuCopy.label);
}
