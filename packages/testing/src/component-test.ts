import { mount, type ComponentType } from '@vanrot/runtime';
import { test } from 'vitest';
import { createScreen, type Screen } from './screen.js';

export type ComponentTestBody = (screen: Screen) => void | Promise<void>;

export interface ComponentTestBuilder {
  can(description: string, body: ComponentTestBody): void;
}

export function testComponent(Component: ComponentType): ComponentTestBuilder {
  return {
    can(description: string, body: ComponentTestBody): void {
      test(description, async function () {
        await runComponentTest(Component, body);
      });
    },
  };
}

export async function runComponentTest(
  Component: ComponentType,
  body: ComponentTestBody,
): Promise<void> {
  const target = document.createElement('div');
  document.body.append(target);
  const app = mount(Component, target);

  try {
    await body(createScreen(target));
  } finally {
    app.destroy();
    target.remove();
  }
}
