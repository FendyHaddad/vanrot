import { signal } from '@vanrot/runtime';

const tableCaptionCopy = {
  label: 'Table caption',
} as const;

export class UiTableCaption {
  label = signal(tableCaptionCopy.label);
}
