import { describe, expect, it } from 'vitest';
import { UiSlider } from './ui.slider.ts';

describe('UiSlider', () => {
  it('exports the slider primitive class', () => {
    expect(UiSlider).toBeTypeOf('function');
  });
});
