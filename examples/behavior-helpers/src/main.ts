import { createToastController } from '@vanrot/behavior/toast';
import { signal } from '@vanrot/runtime';

export function createBehaviorHelpersExample() {
  const savedCount = signal(0);
  const toasts = createToastController({ defaultTimeoutMs: 0 });

  function saveDraft(label: string): void {
    savedCount.update((current) => current + 1);
    toasts.enqueue({
      description: 'This example uses behavior helpers without installing @vanrot/ui.',
      title: `${label} saved`,
      tone: 'success',
    });
  }

  return {
    clearToasts: toasts.clear,
    savedCount,
    saveDraft,
    toastTitles() {
      return toasts.toasts().map((toast) => toast.title);
    },
  };
}
