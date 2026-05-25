import { describe, expect, it } from 'vitest';
import { UiToast } from './ui.toast.ts';

const toastSelector = 'vr-toast';

describe('UiToast', () => {
  it('exposes stable demo copy', () => {
    const component = new UiToast();

    expect(component.label()).toBe('Toast');
    expect(toastSelector).toBe('vr-toast');
  });
});
