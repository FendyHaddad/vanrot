import { signal } from '@vanrot/runtime';

const avatarCopy = {
  initials: 'VR',
} as const;

export class UiAvatar {
  initials = signal(avatarCopy.initials);
}
