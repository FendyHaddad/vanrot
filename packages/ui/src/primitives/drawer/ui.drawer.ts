import { signal } from '@vanrot/runtime';

const drawerCopy = {
  label: 'Drawer',
} as const;

export class UiDrawer {
  label = signal(drawerCopy.label);
}
