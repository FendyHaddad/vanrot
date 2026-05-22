// @vitest-environment jsdom

import { onDestroy } from '@vanrot/runtime';
import { describe, expect, it, vi } from 'vitest';
import { runComponentTest, testComponent } from '../src/component-test.js';

describe('testComponent', () => {
  it('exposes a readable component test builder', () => {
    expect(typeof testComponent({ createComponent: createTextComponent('Ready') }).can).toBe('function');
  });

  it('mounts a compiled component and passes a screen helper', async () => {
    await runComponentTest({ createComponent: createTextComponent('Ready') }, function (screen) {
      screen.expect.text('Ready');
    });
  });

  it('supports async component test bodies', async () => {
    await runComponentTest(
      {
        createComponent() {
          const node = document.createElement('button');
          node.textContent = 'Save';

          return {
            node,
            ctx: {},
          };
        },
      },
      async function (screen) {
        await screen.click.button('Save');

        screen.expect.text('Save');
      },
    );
  });

  it('destroys the mounted component after a passing body', async () => {
    const destroy = vi.fn();

    await runComponentTest({ createComponent: createDestroyableComponent(destroy) }, function () {});

    expect(destroy).toHaveBeenCalledTimes(1);
  });

  it('destroys the mounted component after a failing body', async () => {
    const destroy = vi.fn();

    await expect(
      runComponentTest({ createComponent: createDestroyableComponent(destroy) }, function () {
        throw new Error('Test body failed.');
      }),
    ).rejects.toThrow('Test body failed.');
    expect(destroy).toHaveBeenCalledTimes(1);
  });
});

function createTextComponent(text: string): () => { node: Node; ctx: unknown } {
  return function createComponent() {
    const node = document.createElement('p');
    node.textContent = text;

    return {
      node,
      ctx: {},
    };
  };
}

function createDestroyableComponent(destroy: () => void): () => { node: Node; ctx: unknown } {
  return function createComponent() {
    onDestroy(destroy);

    return {
      node: document.createElement('p'),
      ctx: {},
    };
  };
}
