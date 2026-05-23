import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const packageRoot = resolve(import.meta.dirname, '..');

describe('router repository rules', () => {
  it('typechecks route builder usage with an explicit TypeScript project', () => {
    expect(() => {
      execFileSync('pnpm', ['exec', 'tsc', '-p', 'tests/tsconfig.json', '--noEmit'], {
        cwd: packageRoot,
        stdio: 'pipe',
      });
    }).not.toThrow();
  });
});
