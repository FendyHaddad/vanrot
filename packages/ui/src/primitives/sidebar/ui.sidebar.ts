import { signal } from '@vanrot/runtime';

const sidebarCopy = {
  label: 'Sidebar',
} as const;

export class UiSidebar {
  label = signal(sidebarCopy.label);
}
