import { describe, expect, it } from 'vitest';
import { UiDialog } from './ui.dialog.ts';

const dialogSelector = 'vr-dialog';

describe('UiDialog', () => {
  it('exposes stable demo copy', () => {
    const component = new UiDialog();

    expect(component.label()).toBe('Dialog');
    expect(dialogSelector).toBe('vr-dialog');
  });
});
