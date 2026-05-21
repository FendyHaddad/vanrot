import {
  createCleanupScope,
  disposeCleanupScope,
  flushMountCallbacks,
  runWithCleanupScope,
} from '../lifecycle/cleanup-scope.js';

export interface CompiledComponentInstance {
  node: Node;
  ctx: unknown;
}

export interface CompiledComponentModule {
  createComponent(): CompiledComponentInstance;
}

export type ComponentType =
  | (new (...args: never[]) => unknown)
  | CompiledComponentModule;

export interface AppHandle {
  destroy(): void;
}

export function mount(Component: ComponentType, target: Element): AppHandle {
  const rootScope = createCleanupScope();
  let destroyed = false;
  let mountedNodes: Node[] = [];

  runWithCleanupScope(rootScope, () => {
    if (isCompiledComponentModule(Component)) {
      const instance = Component.createComponent();
      mountedNodes = collectMountedNodes(instance.node);
      target.append(instance.node);
      return;
    }

    new Component();
  });

  flushMountCallbacks(rootScope);

  return {
    destroy(): void {
      if (destroyed) {
        return;
      }

      destroyed = true;
      for (const node of mountedNodes) {
        node.parentNode?.removeChild(node);
      }
      disposeCleanupScope(rootScope);
    },
  };
}

function isCompiledComponentModule(value: ComponentType): value is CompiledComponentModule {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  return typeof value.createComponent === 'function';
}

function collectMountedNodes(node: Node): Node[] {
  if (node.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) {
    return [node];
  }

  return Array.from(node.childNodes);
}
