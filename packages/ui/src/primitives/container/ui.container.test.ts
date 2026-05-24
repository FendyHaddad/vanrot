// @vitest-environment jsdom

import { testComponent } from '@vanrot/testing';
import { UiContainer } from './ui.container.ts';

const containerCopy = {
  label: 'Container',
} as const;

testComponent(UiContainer).can('render its label', function (screen) {
  screen.expect.text(containerCopy.label);
});
