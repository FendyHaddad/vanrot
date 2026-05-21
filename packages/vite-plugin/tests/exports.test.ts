import { describe, expect, it } from 'vitest';
import vanrot, { vanrotPlugin } from '../src/index.js';

describe('@vanrot/vite-plugin exports', () => {
  it('exports default and named plugin factories', () => {
    expect(vanrot().name).toBe('vanrot');
    expect(vanrotPlugin().name).toBe('vanrot');
  });
});
