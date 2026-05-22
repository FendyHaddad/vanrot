// @vitest-environment jsdom

import { testComponent } from '@vanrot/testing';
import { UiButton } from './ui.button.ts';

const buttonCopy = {
  label: 'Button',
} as const;

testComponent(UiButton).can('render its label', function (screen) {
  screen.expect.text(buttonCopy.label);
});
