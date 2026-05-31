// @vitest-environment jsdom

import { onDestroy, onMount, type ComponentType } from '@vanrot/runtime';
import { describe, expect, it, vi } from 'vitest';
import { runPageTest, testPage } from '../src/page-test.js';

describe('testPage', () => {
  it('exposes a readable page test builder', () => {
    expect(typeof testPage(createTextPage('Ready')).can).toBe('function');
  });

  it('mounts a page into a jsdom app shell with stable helpers', async () => {
    await runPageTest(createTextPage('Ready'), async function (page) {
      page.screen.expect.text('Ready');
      expect(page.root).toBeInstanceOf(HTMLElement);
      expect(page.target.parentElement).toBe(document.body);
    });
  });

  it('runs page lifecycle cleanup when the test ends', async () => {
    const mounted = vi.fn();
    const destroyed = vi.fn();

    await runPageTest(createLifecyclePage(mounted, destroyed), function (page) {
      page.screen.expect.text('Lifecycle Ready');
    });

    expect(mounted).toHaveBeenCalledTimes(1);
    expect(destroyed).toHaveBeenCalledTimes(1);
  });

  it('supports rerendering with deterministic cleanup', async () => {
    const firstDestroyed = vi.fn();
    const secondDestroyed = vi.fn();

    await runPageTest(createDestroyablePage('First', firstDestroyed), async function (page) {
      page.screen.expect.text('First');

      await page.rerender(createDestroyablePage('Second', secondDestroyed));

      page.screen.expect.text('Second');
      expect(page.target.textContent).not.toContain('First');
      expect(firstDestroyed).toHaveBeenCalledTimes(1);
      expect(secondDestroyed).not.toHaveBeenCalled();
    });

    expect(secondDestroyed).toHaveBeenCalledTimes(1);
  });

  it('runs registered page cleanup callbacks after app teardown', async () => {
    const cleanup = vi.fn();

    await runPageTest(createTextPage('Ready'), function (page) {
      page.addCleanup(cleanup);
    });

    expect(cleanup).toHaveBeenCalledTimes(1);
  });
});

function createTextPage(text: string): ComponentType {
  return {
    createComponent() {
      const node = document.createElement('main');
      node.textContent = text;

      return {
        node,
        ctx: {},
      };
    },
  };
}

function createLifecyclePage(mounted: () => void, destroyed: () => void): ComponentType {
  return {
    createComponent() {
      onMount(mounted);
      onDestroy(destroyed);
      const node = document.createElement('main');
      node.textContent = 'Lifecycle Ready';

      return {
        node,
        ctx: {},
      };
    },
  };
}

function createDestroyablePage(text: string, destroyed: () => void): ComponentType {
  return {
    createComponent() {
      onDestroy(destroyed);
      const node = document.createElement('main');
      node.textContent = text;

      return {
        node,
        ctx: {},
      };
    },
  };
}
