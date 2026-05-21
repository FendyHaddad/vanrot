import type { CompiledComponentModule } from '@vanrot/runtime';

export function createTestPage(name: string): CompiledComponentModule {
  return {
    createComponent() {
      const node = document.createElement('section');
      node.textContent = name;

      return {
        node,
        ctx: {},
      };
    },
  };
}
