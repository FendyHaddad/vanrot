import { describe, expect, it } from 'vitest';
import { UiLabel } from './ui.label.ts';

describe('UiLabel', () => {
  it('exports the label primitive class', () => {
    expect(UiLabel).toBeTypeOf('function');
  });
});
