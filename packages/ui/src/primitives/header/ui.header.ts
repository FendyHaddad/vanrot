import { signal } from '@vanrot/runtime';

const headerCopy = {
  label: 'Header',
} as const;

export class UiHeader {
  label = signal(headerCopy.label);
}
