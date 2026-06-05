import { createPipeContext } from './context.js';
import { createPipeRegistry, type PipeCall, type PipeRegistryOptions } from './registry.js';

export function createPipeTest(options: PipeRegistryOptions = {}) {
  const registry = createPipeRegistry(options);
  const context = createPipeContext();

  return {
    registry,
    format(value: unknown, calls: readonly PipeCall[]) {
      return registry.apply(value, calls, context);
    },
  };
}
