import { signal } from '@vanrot/runtime';
import type { FormResource, FormResourceOptions } from './types.js';

export function createFormResource<TInput, TOutput>(
  options: FormResourceOptions<TInput, TOutput>,
): FormResource<TInput, TOutput> {
  const loading = signal(false);
  const success = signal(false);
  const value = signal<TOutput | undefined>(undefined);
  const error = signal<unknown>(undefined);
  const stale = signal(false);
  let controller: AbortController | undefined;
  let runId = 0;
  let lastInput: TInput | undefined;
  let hasLastInput = false;

  const resource: FormResource<TInput, TOutput> = {
    ...(options.name ? { name: options.name } : {}),
    dependsOn: [...(options.dependsOn ?? [])],
    loading: () => loading(),
    success: () => success(),
    value: () => value(),
    error: () => error(),
    stale: () => stale(),
    run: async (input: TInput) => {
      controller?.abort();
      controller = new AbortController();
      const ownRunId = ++runId;
      lastInput = input;
      hasLastInput = true;
      loading.set(true);
      success.set(false);
      error.set(undefined);
      stale.set(value() !== undefined);

      try {
        const result = await options.load({ value: input, signal: controller.signal });

        if (ownRunId !== runId || controller.signal.aborted) {
          return undefined;
        }

        value.set(result);
        success.set(true);
        stale.set(false);
        return result;
      } catch (caughtError) {
        if (ownRunId !== runId || controller.signal.aborted) {
          return undefined;
        }

        error.set(caughtError);
        success.set(false);
        throw caughtError;
      } finally {
        if (ownRunId === runId) {
          loading.set(false);
        }
      }
    },
    refresh: async () => {
      if (!hasLastInput) {
        return undefined;
      }

      stale.set(true);
      return resource.run(lastInput as TInput);
    },
    cancel: () => {
      controller?.abort();
      runId += 1;
      loading.set(false);
      success.set(false);
      stale.set(value() !== undefined);
    },
  };

  return resource;
}
