import { signal } from '@vanrot/runtime';

const imgCopy = {
  label: 'Image',
} as const;

export class UiImg {
  label = signal(imgCopy.label);
}
