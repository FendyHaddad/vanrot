// @vitest-environment jsdom

import { testComponent } from '@vanrot/testing';
import { UiBadge } from './ui.badge.ts';

const badgeCopy = {
  label: 'Badge',
} as const;

testComponent(UiBadge).can('render its label', function (screen) {
  screen.expect.text(badgeCopy.label);
});
