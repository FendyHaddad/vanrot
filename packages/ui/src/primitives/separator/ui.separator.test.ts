// @vitest-environment jsdom

import { testComponent } from '@vanrot/testing';
import { UiSeparator } from './ui.separator.ts';

const separatorCopy = {
  label: 'Section divider',
} as const;

testComponent(UiSeparator).can('render its label', function (screen) {
  screen.expect.text(separatorCopy.label);
});
