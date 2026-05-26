import { describe, expect, it } from 'vitest';
import { UiCommandMenu } from './ui.command-menu.ts';

const commandMenuSelector = 'vr-command-menu';

describe('UiCommandMenu', () => {
  it('exposes stable demo copy', () => {
    const component = new UiCommandMenu();

    expect(component.label()).toBe('Command menu');
    expect(commandMenuSelector).toBe('vr-command-menu');
  });
});
