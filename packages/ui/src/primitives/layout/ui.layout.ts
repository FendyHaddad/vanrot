import { signal } from '@vanrot/runtime';

const layoutCopy = {
  label: 'Layout',
} as const;

export class UiLayout {
  label = signal(layoutCopy.label);
}
