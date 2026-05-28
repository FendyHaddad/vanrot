import { describe, expect, it } from 'vitest';
import { findSlotDefinition } from '../src/features/definition.js';

const template = '<div>\n  <slot.body></slot.body>\n</div>';

describe('findSlotDefinition', () => {
  it('locates the slot outlet by name in the template', () => {
    const location = findSlotDefinition('body', template, 'file:///app/x.layout.html');

    expect(location?.uri).toBe('file:///app/x.layout.html');
    expect(location?.range.start.line).toBe(1);
  });

  it('returns null for an unknown slot', () => {
    expect(findSlotDefinition('missing', template, 'file:///app/x.layout.html')).toBeNull();
  });
});
