import { describe, expect, it } from 'vitest';
import { forgePackageName } from '../src/index.js';

describe('@vanrot/forge', () => {
  it('exports the Forge package name', () => {
    expect(forgePackageName).toBe('@vanrot/forge');
  });
});
