// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createCommandMenuController } from '../../src/ui/command-menu-controller.js';

describe('createCommandMenuController', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('moves active state through enabled items', () => {
    const input = document.createElement('input');
    const profile = document.createElement('button');
    const billing = document.createElement('button');
    const disabled = document.createElement('button');
    const settings = document.createElement('button');
    const controller = createCommandMenuController();

    disabled.disabled = true;
    controller.registerInput(input);
    controller.registerItem('profile', profile);
    controller.registerItem('billing', billing);
    controller.registerItem('disabled', disabled);
    controller.registerItem('settings', settings);

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(controller.activeValue()).toBe('profile');
    expect(profile.getAttribute('aria-selected')).toBe('true');

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));

    expect(controller.activeValue()).toBe('settings');
    expect(input.getAttribute('aria-activedescendant')).toBe(settings.id);

    controller.dispose();
  });

  it('selects the active item on enter and clears active state on escape', () => {
    const input = document.createElement('input');
    const item = document.createElement('button');
    const onSelect = vi.fn();
    const controller = createCommandMenuController({ onSelect });

    controller.registerInput(input);
    controller.registerItem('profile', item);
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    expect(onSelect).toHaveBeenCalledWith('profile', item);

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(controller.activeValue()).toBe(null);
    expect(input.hasAttribute('aria-activedescendant')).toBe(false);

    controller.dispose();
  });
});
