// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest';
import { createTabsController } from '../../src/ui/tabs-controller.js';

describe('createTabsController', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('selects tabs by value and exposes selected state', () => {
    const controller = createTabsController({ defaultValue: 'overview' });

    controller.select('activity');

    expect(controller.value()).toBe('activity');
    expect(controller.isSelected('overview')).toBe(false);
    expect(controller.isSelected('activity')).toBe(true);
  });

  it('moves selection with arrow keys in registration order', () => {
    const overview = document.createElement('button');
    const activity = document.createElement('button');
    const billing = document.createElement('button');
    document.body.append(overview, activity, billing);

    const controller = createTabsController({ defaultValue: 'overview' });
    controller.registerTrigger('overview', overview);
    controller.registerTrigger('activity', activity);
    controller.registerTrigger('billing', billing);

    overview.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(controller.value()).toBe('activity');
    expect(document.activeElement).toBe(activity);

    activity.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    expect(controller.value()).toBe('overview');
    expect(document.activeElement).toBe(overview);

    controller.dispose();
  });

  it('connects triggers and panels through selected state', () => {
    const trigger = document.createElement('button');
    const panel = document.createElement('div');

    const controller = createTabsController({ defaultValue: 'overview' });
    controller.registerTrigger('activity', trigger);
    controller.registerPanel('activity', panel);

    controller.select('activity');

    expect(trigger.getAttribute('aria-selected')).toBe('true');
    expect(panel.hidden).toBe(false);

    controller.select('other');

    expect(trigger.getAttribute('aria-selected')).toBe('false');
    expect(panel.hidden).toBe(true);

    controller.dispose();
  });
});
