import { describe, expect, it } from 'vitest';
import { UiTabs } from './ui.tabs.ts';

const tabsSelector = 'vr-tabs';

describe('UiTabs', () => {
  it('exposes stable demo copy', () => {
    const component = new UiTabs();

    expect(component.label()).toBe('Tabs');
    expect(tabsSelector).toBe('vr-tabs');
  });
});
