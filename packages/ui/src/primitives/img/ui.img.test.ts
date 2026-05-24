import { describe, expect, it } from 'vitest';
import { UiImg } from './ui.img.ts';

const imgCopy = {
  label: 'Image',
} as const;

describe('UiImg', () => {
  it('exposes its label signal', () => {
    const component = new UiImg();

    expect(component.label()).toBe(imgCopy.label);
  });
});
