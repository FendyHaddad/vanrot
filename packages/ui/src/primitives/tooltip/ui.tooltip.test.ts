import { describe, expect, it } from 'vitest';
import { UiTooltip } from './ui.tooltip.ts';

const tooltipSelector = 'vr-tooltip';

describe('UiTooltip', () => {
  it('exposes stable demo copy', () => {
    const component = new UiTooltip();

    expect(component.label()).toBe('Tooltip');
    expect(tooltipSelector).toBe('vr-tooltip');
  });
});
