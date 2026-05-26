import { describe, expect, it } from 'vitest';
import { createRuntimeLifecycleExample } from '../src/main.ts';

describe('runtime lifecycle example', () => {
  it('demonstrates signals, computed values, effects, and disposal', () => {
    expect(createRuntimeLifecycleExample()).toEqual([0, 4]);
  });
});
