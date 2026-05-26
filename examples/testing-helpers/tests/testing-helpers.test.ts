import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(import.meta.dirname, '..');

describe('testing helpers example', () => {
  it('contains a component fixture and test entry', () => {
    expect(existsSync(join(root, 'src/counter.component.ts'))).toBe(true);
    expect(existsSync(join(root, 'src/counter.component.html'))).toBe(true);
  });
});
