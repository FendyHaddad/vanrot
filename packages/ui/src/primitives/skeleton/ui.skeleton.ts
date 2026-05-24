import { signal } from '@vanrot/runtime';

const skeletonCopy = {
  label: 'Loading content',
} as const;

export class UiSkeleton {
  label = signal(skeletonCopy.label);
}
