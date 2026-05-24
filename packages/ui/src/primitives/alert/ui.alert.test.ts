// @vitest-environment jsdom

import { testComponent } from '@vanrot/testing';
import { UiAlert } from './ui.alert.ts';

const alertCopy = {
  message: 'Heads up',
} as const;

testComponent(UiAlert).can('render its message', function (screen) {
  screen.expect.text(alertCopy.message);
});
