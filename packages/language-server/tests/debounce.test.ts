import { describe, expect, it, vi } from 'vitest';
import { debounce } from '../src/lsp/debounce.js';

describe('debounce', () => {
  it('invokes once after the trailing delay', async () => {
    vi.useFakeTimers();
    const spy = vi.fn();
    const run = debounce(spy, 50);
    run('a');
    run('b');
    vi.advanceTimersByTime(60);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('b');
    vi.useRealTimers();
  });
});
