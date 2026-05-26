import { computed, effect, signal } from '@vanrot/runtime';

export function createRuntimeLifecycleExample() {
  const count = signal(0);
  const doubled = computed(() => count() * 2);
  const values: number[] = [];

  const dispose = effect(() => {
    values.push(doubled());
  });

  count.set(2);
  dispose();
  count.set(3);

  return values;
}
