import { signal } from '@vanrot/runtime';

const radioCopy = {
  label: 'Radio',
} as const;

export class UiRadio {
  label = signal(radioCopy.label);
}
