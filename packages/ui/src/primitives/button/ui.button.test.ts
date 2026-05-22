// @vitest-environment jsdom

import { testComponent } from '@vanrot/testing';
// @ts-expect-error Vanrot's Vite plugin compiles button modules to default exports.
import UiButton from './ui.button.ts';

const buttonCopy = {
  label: 'Button',
} as const;

testComponent(UiButton).can('render its label', function (screen) {
  screen.expect.text(buttonCopy.label);
});
