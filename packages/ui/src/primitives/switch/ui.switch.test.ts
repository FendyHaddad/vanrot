import { describe, expect, it } from 'vitest';
import { UiSwitch } from './ui.switch.ts';

describe('UiSwitch', () => {
  it('exports the switch primitive class', () => {
    expect(UiSwitch).toBeTypeOf('function');
  });
});
