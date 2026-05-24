import { signal } from '@vanrot/runtime';

const footerCopy = {
  label: 'Footer',
} as const;

export class UiFooter {
  label = signal(footerCopy.label);
}
