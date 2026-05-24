// @vitest-environment jsdom

import { testComponent } from '@vanrot/testing';
import { UiSidebar } from './ui.sidebar.ts';

const sidebarCopy = {
  label: 'Sidebar',
} as const;

testComponent(UiSidebar).can('render its label', function (screen) {
  screen.expect.text(sidebarCopy.label);
});
