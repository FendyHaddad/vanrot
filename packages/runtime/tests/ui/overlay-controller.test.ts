// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createOverlayController } from '../../src/ui/overlay-controller.js';

describe('createOverlayController', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('opens and closes with controlled state callbacks', () => {
    const onOpenChange = vi.fn();
    const controller = createOverlayController({ onOpenChange });

    controller.openOverlay();
    expect(controller.open()).toBe(true);
    expect(onOpenChange).toHaveBeenLastCalledWith(true);

    controller.closeOverlay();
    expect(controller.open()).toBe(false);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);

    controller.dispose();
  });

  it('focuses content on open and restores trigger focus on close', () => {
    const trigger = document.createElement('button');
    const content = document.createElement('div');
    const input = document.createElement('input');

    content.tabIndex = -1;
    content.append(input);
    document.body.append(trigger, content);
    trigger.focus();

    const controller = createOverlayController();
    controller.registerTrigger(trigger);
    controller.registerContent(content);

    controller.openOverlay();
    expect(document.activeElement).toBe(input);

    controller.closeOverlay();
    expect(document.activeElement).toBe(trigger);

    controller.dispose();
  });

  it('closes on escape when enabled', () => {
    const controller = createOverlayController();
    controller.openOverlay();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(controller.open()).toBe(false);
    controller.dispose();
  });

  it('closes on outside pointerdown when enabled', () => {
    const content = document.createElement('div');
    const outside = document.createElement('button');
    document.body.append(content, outside);

    const controller = createOverlayController();
    controller.registerContent(content);
    controller.openOverlay();

    outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));

    expect(controller.open()).toBe(false);
    controller.dispose();
  });

  it('keeps open when pointerdown starts inside content', () => {
    const content = document.createElement('div');
    const button = document.createElement('button');
    content.append(button);
    document.body.append(content);

    const controller = createOverlayController();
    controller.registerContent(content);
    controller.openOverlay();

    button.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));

    expect(controller.open()).toBe(true);
    controller.dispose();
  });
});
