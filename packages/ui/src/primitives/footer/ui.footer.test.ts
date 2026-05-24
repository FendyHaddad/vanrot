// @vitest-environment jsdom

import { testComponent } from '@vanrot/testing';
import { UiFooter } from './ui.footer.ts';

const footerCopy = {
  label: 'Footer',
} as const;

testComponent(UiFooter).can('render its label', function (screen) {
  screen.expect.text(footerCopy.label);
});
