import { describe, expect, it } from 'vitest';
import { UiPopover } from './ui.popover.ts';

const popoverSelector = 'vr-popover';

describe('UiPopover', () => {
  it('exposes stable demo copy', () => {
    const component = new UiPopover();

    expect(component.label()).toBe('Popover');
    expect(popoverSelector).toBe('vr-popover');
  });
});
