// @vitest-environment jsdom

import { testComponent } from '@vanrot/testing';
import { UiLayout } from './ui.layout.ts';

const layoutCopy = {
  label: 'Layout',
} as const;

testComponent(UiLayout).can('render its label', function (screen) {
  screen.expect.text(layoutCopy.label);
});
