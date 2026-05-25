import { describe, expect, it } from 'vitest';
import { UiDrawer } from './ui.drawer.ts';

const drawerSelector = 'vr-drawer';

describe('UiDrawer', () => {
  it('exposes stable demo copy', () => {
    const component = new UiDrawer();

    expect(component.label()).toBe('Drawer');
    expect(drawerSelector).toBe('vr-drawer');
  });
});
