import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { deploymentTarget } from '../src/main.ts';

const root = join(import.meta.dirname, '..');

describe('build deploy example', () => {
  it('contains a Vanrot app entry and config files', () => {
    expect(existsSync(join(root, 'package.json'))).toBe(true);
    expect(existsSync(join(root, 'index.html'))).toBe(true);
    expect(existsSync(join(root, 'src/main.ts'))).toBe(true);
    expect(existsSync(join(root, 'tsconfig.json'))).toBe(true);
    expect(deploymentTarget).toBe('vanrot.vankode.com');
  });
});
