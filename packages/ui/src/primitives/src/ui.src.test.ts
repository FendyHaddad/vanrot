import { describe, expect, it } from 'vitest';
import { UiSrc } from './ui.src.ts';

const srcCopy = {
  label: 'Source',
} as const;

describe('UiSrc', () => {
  it('exposes its label signal', () => {
    const component = new UiSrc();

    expect(component.label()).toBe(srcCopy.label);
  });
});
