// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest';
import { onDestroy } from '../../src/lifecycle/on-destroy.js';
import { onMount } from '../../src/lifecycle/on-mount.js';
import { mount, type ComponentType } from '../../src/mounting/mount.js';
import { effect } from '../../src/reactive/effect.js';
import { signal } from '../../src/reactive/signal.js';

describe('mount', () => {
  it('runs onMount callbacks after component construction', () => {
    const log: string[] = [];
    const target = document.createElement('div');
    class TestComponent {
      constructor() {
        log.push('constructor');
        onMount(() => log.push('onMount'));
      }
    }

    mount(TestComponent as ComponentType, target);

    expect(log).toEqual(['constructor', 'onMount']);
  });

  it('destroy runs onDestroy callbacks', () => {
    const target = document.createElement('div');
    const spy = vi.fn();
    class TestComponent {
      constructor() {
        onDestroy(spy);
      }
    }

    const app = mount(TestComponent as ComponentType, target);
    app.destroy();

    expect(spy).toHaveBeenCalledOnce();
  });

  it('destroy runs onMount cleanup', () => {
    const target = document.createElement('div');
    const cleanup = vi.fn();
    class TestComponent {
      constructor() {
        onMount(() => cleanup);
      }
    }

    const app = mount(TestComponent as ComponentType, target);
    app.destroy();

    expect(cleanup).toHaveBeenCalledOnce();
  });

  it('destroy is safe to call twice', () => {
    const target = document.createElement('div');
    const spy = vi.fn();
    class TestComponent {
      constructor() {
        onDestroy(spy);
      }
    }

    const app = mount(TestComponent as ComponentType, target);
    app.destroy();

    expect(() => app.destroy()).not.toThrow();
    expect(spy).toHaveBeenCalledOnce();
  });

  it('disposes effects created during construction', () => {
    const target = document.createElement('div');
    const count = signal(0);
    const spy = vi.fn();
    class TestComponent {
      constructor() {
        effect(() => {
          count();
          spy();
        });
      }
    }

    const app = mount(TestComponent as ComponentType, target);
    spy.mockClear();
    app.destroy();
    count.set(1);

    expect(spy).not.toHaveBeenCalled();
  });

  it('disposes effects created during onMount', () => {
    const target = document.createElement('div');
    const count = signal(0);
    const spy = vi.fn();
    class TestComponent {
      constructor() {
        onMount(() => {
          effect(() => {
            count();
            spy();
          });
        });
      }
    }

    const app = mount(TestComponent as ComponentType, target);
    spy.mockClear();
    app.destroy();
    count.set(1);

    expect(spy).not.toHaveBeenCalled();
  });

  it('mounts a compiled component module and appends its node', () => {
    const target = document.createElement('div');
    const node = document.createElement('p');
    node.textContent = 'Hello Vanrot';

    const app = mount(
      {
        createComponent() {
          return { node, ctx: {} };
        },
      },
      target,
    );

    expect(target.textContent).toBe('Hello Vanrot');

    app.destroy();
    expect(target.textContent).toBe('');
  });

  it('runs compiled component effects inside the root cleanup scope', () => {
    const target = document.createElement('div');
    const count = signal(0);
    const spy = vi.fn();

    const app = mount(
      {
        createComponent() {
          effect(() => {
            count();
            spy();
          });

          return { node: document.createTextNode('count'), ctx: {} };
        },
      },
      target,
    );

    spy.mockClear();
    app.destroy();
    count.set(1);

    expect(spy).not.toHaveBeenCalled();
  });
});
