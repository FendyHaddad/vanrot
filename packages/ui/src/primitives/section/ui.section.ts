import { signal } from '@vanrot/runtime';

const sectionCopy = {
  label: 'Section',
} as const;

export class UiSection {
  label = signal(sectionCopy.label);
}
