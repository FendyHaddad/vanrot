// @vitest-environment jsdom

import { testComponent } from '@vanrot/testing';
import { UiAvatar } from './ui.avatar.ts';

const avatarCopy = {
  initials: 'VR',
} as const;

testComponent(UiAvatar).can('render its initials', function (screen) {
  screen.expect.text(avatarCopy.initials);
});
