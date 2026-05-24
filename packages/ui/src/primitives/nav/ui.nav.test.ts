// @vitest-environment jsdom

import { testComponent } from '@vanrot/testing';
import { UiNav } from './ui.nav.ts';

const navCopy = {
  label: 'Navigation',
} as const;

testComponent(UiNav).can('render its label', function (screen) {
  screen.expect.text(navCopy.label);
});
