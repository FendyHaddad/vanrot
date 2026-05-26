// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTooltipController } from '../../src/ui/tooltip-controller.js';

describe('createTooltipController', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('opens on hover after delay and closes on pointer leave', () => {
    const trigger = document.createElement('button');
    const content = document.createElement('div');
    const controller = createTooltipController({ delay: 120 });

    controller.registerTrigger(trigger);
    controller.registerContent(content);

    trigger.dispatchEvent(new PointerEvent('pointerenter'));
    vi.advanceTimersByTime(119);
    expect(controller.open()).toBe(false);

    vi.advanceTimersByTime(1);
    expect(controller.open()).toBe(true);
    expect(content.hidden).toBe(false);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');

    trigger.dispatchEvent(new PointerEvent('pointerleave'));
    expect(controller.open()).toBe(false);
    expect(content.hidden).toBe(true);

    controller.dispose();
  });

  it('opens on focus and closes on escape', () => {
    const trigger = document.createElement('button');
    const content = document.createElement('div');
    const controller = createTooltipController();

    controller.registerTrigger(trigger);
    controller.registerContent(content);

    trigger.dispatchEvent(new FocusEvent('focusin'));
    expect(controller.open()).toBe(true);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(controller.open()).toBe(false);

    controller.dispose();
  });
});
