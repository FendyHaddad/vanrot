// @vitest-environment jsdom

import { testComponent } from '@vanrot/testing';
import { UiStack } from './ui.stack.ts';

const stackCopy = {
  label: 'Stack',
} as const;

testComponent(UiStack).can('render its label', function (screen) {
  screen.expect.text(stackCopy.label);
});
