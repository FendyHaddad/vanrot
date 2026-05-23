import { onDestroy, type CompiledComponentModule } from '@vanrot/runtime';
import { createRouterOutlet } from '../dom/route-outlet.js';

export function createTestPage(name: string, destroy?: () => void): CompiledComponentModule {
  return {
    createComponent() {
      const node = document.createElement('section');
      node.dataset.testPage = name;
      node.textContent = name;

      if (destroy !== undefined) {
        onDestroy(destroy);
      }

      return {
        node,
        ctx: {},
      };
    },
  };
}

export function createTestLayout(name: string, destroy?: () => void): CompiledComponentModule {
  return {
    createComponent() {
      const node = document.createElement('section');
      node.dataset.testLayout = name;
      const label = document.createElement('span');
      label.textContent = name;
      const outlet = document.createElement('div');
      createRouterOutlet(outlet, { kind: 'outlet' });
      node.append(label, outlet);

      if (destroy !== undefined) {
        onDestroy(destroy);
      }

      return {
        node,
        ctx: {},
      };
    },
  };
}
