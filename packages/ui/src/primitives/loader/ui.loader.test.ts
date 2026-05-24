// @vitest-environment jsdom

import { testComponent } from '@vanrot/testing';
import { UiLoader } from './ui.loader.ts';

const loaderCopy = {
  label: 'Loading',
} as const;

testComponent(UiLoader).can('render its label', function (screen) {
  screen.expect.text(loaderCopy.label);
});
