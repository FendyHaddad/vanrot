// @vitest-environment jsdom

import { testComponent } from '@vanrot/testing';
import { UiHeader } from './ui.header.ts';

const headerCopy = {
  label: 'Header',
} as const;

testComponent(UiHeader).can('render its label', function (screen) {
  screen.expect.text(headerCopy.label);
});
