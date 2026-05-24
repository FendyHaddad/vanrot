// @vitest-environment jsdom

import { testComponent } from '@vanrot/testing';
import { UiGrid } from './ui.grid.ts';

const gridCopy = {
  label: 'Grid',
} as const;

testComponent(UiGrid).can('render its label', function (screen) {
  screen.expect.text(gridCopy.label);
});
