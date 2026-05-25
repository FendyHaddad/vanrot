import { describe, expect, it } from 'vitest';
import { UiDropdown } from './ui.dropdown.ts';

const dropdownSelector = 'vr-dropdown';

describe('UiDropdown', () => {
  it('exposes stable demo copy', () => {
    const component = new UiDropdown();

    expect(component.label()).toBe('Dropdown');
    expect(dropdownSelector).toBe('vr-dropdown');
  });
});
