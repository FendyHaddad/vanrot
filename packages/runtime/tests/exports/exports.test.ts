import { describe, expect, it } from 'vitest';
import * as internal from '../../src/internal.js';
import * as runtime from '../../src/index.js';

describe('runtime exports', () => {
  it('exposes the public runtime API', () => {
    expect(runtime.signal).toBeTypeOf('function');
    expect(runtime.computed).toBeTypeOf('function');
    expect(runtime.effect).toBeTypeOf('function');
    expect(runtime.batch).toBeTypeOf('function');
    expect(runtime.untrack).toBeTypeOf('function');
    expect(runtime.mount).toBeTypeOf('function');
    expect(runtime.onMount).toBeTypeOf('function');
    expect(runtime.onDestroy).toBeTypeOf('function');
    expect('createFormController' in runtime).toBe(false);
    expect('emailValidator' in runtime).toBe(false);
    expect('positionLayer' in runtime).toBe(false);
    expect('createTooltipController' in runtime).toBe(false);
    expect('createCommandMenuController' in runtime).toBe(false);
  });

  it('exposes the compiler-facing internal API', () => {
    expect(internal.createCleanupScope).toBeTypeOf('function');
    expect(internal.runWithCleanupScope).toBeTypeOf('function');
    expect(internal.runWithoutCleanupScope).toBeTypeOf('function');
    expect(internal.disposeCleanupScope).toBeTypeOf('function');
    expect(internal.listen).toBeTypeOf('function');
    expect('connectFormControl' in internal).toBe(false);
    expect('createTableController' in internal).toBe(false);
    expect('connectTableFilter' in internal).toBe(false);
  });

  it('exports input helpers', async () => {
    const runtime = await import('../../src/index.js');

    expect(runtime.input.required).toBeTypeOf('function');
    expect(runtime.input.default).toBeTypeOf('function');
  });
});
