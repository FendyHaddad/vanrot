import {
  createCleanupScope,
  disposeCleanupScope,
  flushMountCallbacks,
  runWithCleanupScope,
} from '../lifecycle/cleanup-scope.js';

export type ComponentType = new (...args: never[]) => unknown;

export interface AppHandle {
  destroy(): void;
}

export function mount(Component: ComponentType, _target: Element): AppHandle {
  const rootScope = createCleanupScope();
  let destroyed = false;

  runWithCleanupScope(rootScope, () => {
    new Component();
  });

  flushMountCallbacks(rootScope);

  return {
    destroy(): void {
      if (destroyed) {
        return;
      }

      destroyed = true;
      disposeCleanupScope(rootScope);
    },
  };
}
