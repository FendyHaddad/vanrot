// @vitest-environment jsdom

import { testComponent } from '@vanrot/testing';
import { UiSection } from './ui.section.ts';

const sectionCopy = {
  label: 'Section',
} as const;

testComponent(UiSection).can('render its label', function (screen) {
  screen.expect.text(sectionCopy.label);
});
