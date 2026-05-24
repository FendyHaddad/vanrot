// @vitest-environment jsdom

import { testComponent } from '@vanrot/testing';
import { UiSkeleton } from './ui.skeleton.ts';

const skeletonCopy = {
  label: 'Loading content',
} as const;

testComponent(UiSkeleton).can('render its label', function (screen) {
  screen.expect.text(skeletonCopy.label);
});
