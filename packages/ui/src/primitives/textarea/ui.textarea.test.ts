import { describe, expect, it } from 'vitest';
import { UiTextarea } from './ui.textarea.ts';

describe('UiTextarea', () => {
  it('exports the textarea primitive class', () => {
    expect(UiTextarea).toBeTypeOf('function');
  });
});
