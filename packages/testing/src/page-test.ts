import { mount, type AppHandle, type ComponentType } from '@vanrot/runtime';
import { test } from 'vitest';
import { createScreen, type Screen } from './screen.js';

export type PageTestCleanup = () => void | Promise<void>;
export type PageTestBody = (page: PageTestHarness) => void | Promise<void>;

export interface PageTestBuilder {
  can(description: string, body: PageTestBody): void;
}

export interface PageTestHarness {
  readonly root: HTMLElement;
  readonly target: HTMLElement;
  readonly screen: Screen;
  readonly click: Screen['click'];
  addCleanup(cleanup: PageTestCleanup): void;
  rerender(Component: ComponentType): Promise<void>;
  cleanup(): Promise<void>;
}

export function testPage(Page: ComponentType): PageTestBuilder {
  return {
    can(description: string, body: PageTestBody): void {
      test(description, async function () {
        await runPageTest(Page, body);
      });
    },
  };
}

export async function runPageTest(Page: ComponentType, body: PageTestBody): Promise<void> {
  const target = document.createElement('main');
  target.setAttribute('data-vanrot-test-page-root', '');
  document.body.append(target);

  let app: AppHandle | null = null;
  let cleaned = false;
  const cleanups: PageTestCleanup[] = [];
  const screen = createScreen(target);

  const mountPage = (Component: ComponentType): void => {
    app?.destroy();
    target.replaceChildren();
    app = mount(Component, target);
  };

  const cleanup = async (): Promise<void> => {
    if (cleaned) {
      return;
    }

    cleaned = true;
    app?.destroy();
    app = null;
    target.remove();

    for (const registeredCleanup of cleanups.reverse()) {
      await registeredCleanup();
    }
  };

  const harness: PageTestHarness = {
    root: target,
    target,
    screen,
    click: screen.click,
    addCleanup(registeredCleanup: PageTestCleanup): void {
      cleanups.push(registeredCleanup);
    },
    async rerender(Component: ComponentType): Promise<void> {
      mountPage(Component);
    },
    cleanup,
  };

  mountPage(Page);

  try {
    await body(harness);
  } finally {
    await cleanup();
  }
}
