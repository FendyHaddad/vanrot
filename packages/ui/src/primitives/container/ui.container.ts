import { signal } from '@vanrot/runtime';

const containerCopy = {
  label: 'Container',
} as const;

export class UiContainer {
  label = signal(containerCopy.label);
}
