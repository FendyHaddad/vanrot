// @vitest-environment jsdom

import { testComponent } from '@vanrot/testing';
import { UiBreadcrumb } from './ui.breadcrumb.ts';

const breadcrumbCopy = {
  label: 'Breadcrumb',
} as const;

testComponent(UiBreadcrumb).can('render its label', function (screen) {
  screen.expect.text(breadcrumbCopy.label);
});
