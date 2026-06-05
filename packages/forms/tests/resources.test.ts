import { describe, expect, it } from 'vitest';
import { createFormResource } from '../src/index.js';

describe('@vanrot/forms async resources', () => {
  it('ignores stale async results and keeps the latest interaction', async () => {
    const calls: Array<{ value: string; aborted: boolean }> = [];
    const resource = createFormResource<string, string>({
      load: async ({ value, signal }) => {
        await new Promise((resolve) => setTimeout(resolve, value === 'first' ? 20 : 1));
        calls.push({ value, aborted: signal.aborted });
        return `${value}-ok`;
      },
    });

    const first = resource.run('first');
    const second = resource.run('second');

    await expect(first).resolves.toBeUndefined();
    await expect(second).resolves.toBe('second-ok');

    expect(resource.value()).toBe('second-ok');
    expect(resource.success()).toBe(true);
    expect(resource.stale()).toBe(false);
    expect(calls).toEqual([
      { value: 'second', aborted: false },
      { value: 'first', aborted: true },
    ]);
  });

  it('refreshes the last request and exposes stale and cancellation state', async () => {
    const seen: string[] = [];
    const resource = createFormResource<string, string>({
      load: async ({ value, signal }) => {
        await new Promise((resolve) => setTimeout(resolve, 1));
        seen.push(`${value}:${signal.aborted}`);
        return `${value}-${seen.length}`;
      },
    });

    await expect(resource.run('profile')).resolves.toBe('profile-1');

    const refreshed = resource.refresh();

    expect(resource.loading()).toBe(true);
    expect(resource.stale()).toBe(true);

    await expect(refreshed).resolves.toBe('profile-2');

    const cancelled = resource.run('profile');
    resource.cancel();

    await expect(cancelled).resolves.toBeUndefined();
    expect(resource.loading()).toBe(false);
    expect(resource.stale()).toBe(true);
    expect(resource.success()).toBe(false);
  });
});
