import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createToastController } from '../../src/ui/toast-controller.js';

describe('createToastController', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('enqueues accessible toast messages', () => {
    const controller = createToastController();

    const toast = controller.enqueue({
      title: 'Saved',
      description: 'Profile changes were saved.',
      tone: 'success',
    });

    expect(controller.toasts()).toEqual([
      {
        id: toast.id,
        title: 'Saved',
        description: 'Profile changes were saved.',
        tone: 'success',
      },
    ]);
  });

  it('dismisses a toast manually', () => {
    const controller = createToastController();
    const toast = controller.enqueue({ title: 'Removed', tone: 'danger' });

    controller.dismiss(toast.id);

    expect(controller.toasts()).toEqual([]);
  });

  it('dismisses a toast after its timeout', () => {
    const controller = createToastController({ defaultTimeoutMs: 5000 });

    controller.enqueue({ title: 'Queued', tone: 'default' });
    vi.advanceTimersByTime(4999);
    expect(controller.toasts()).toHaveLength(1);

    vi.advanceTimersByTime(1);
    expect(controller.toasts()).toHaveLength(0);
  });
});
