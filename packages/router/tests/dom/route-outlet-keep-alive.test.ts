// @vitest-environment jsdom

import { onDestroy } from '@vanrot/runtime';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRouterOutlet } from '../../src/dom/route-outlet.js';
import { createRoutes, defineRoutes, navigate, provideRouter } from '../../src/index.js';
import {
  getRouteKeepAliveDiagnosticsForTests,
  setRouteKeepAliveNowForTests,
} from '../../src/route/route-keep-alive.js';
import { resetRouterForTests } from '../../src/route/router-state.js';
import { createTestPage } from '../../src/test/test-pages.js';

describe('createRouterOutlet keepAlive', () => {
  let host: HTMLElement;
  let disposeOutlet: (() => void) | undefined;

  beforeEach(() => {
    resetRouterForTests();
    setRouteKeepAliveNowForTests(() => new Date('2026-05-24T08:00:00'));
    host = document.createElement('main');
    document.body.replaceChildren(host);
    window.history.replaceState(null, '', '/profile');
  });

  afterEach(() => {
    disposeOutlet?.();
    resetRouterForTests();
    setRouteKeepAliveNowForTests(() => new Date());
    document.body.replaceChildren();
  });

  it('preserves local route view state when navigating away and back on the same day', async () => {
    const destroyed = {
      profile: vi.fn(),
      home: vi.fn(),
    };
    const routes = createRoutes();
    const profile = routes.page({
      path: '/profile',
      label: 'Profile',
      page: formPage('profile-draft', destroyed.profile),
      keepAlive: routes.keepAlive.sessionDay(),
    });
    const home = routes.page({
      path: '/',
      label: 'Home',
      page: createTestPage('home', destroyed.home),
    });

    await provideRouter(defineRoutes({ home, profile }));
    disposeOutlet = createRouterOutlet(host);
    await flushRouteOutlet();
    const input = host.querySelector('input');
    expect(input).not.toBeNull();
    input!.value = 'changed draft';

    await navigate('/');
    await flushRouteOutlet();
    await navigate('/profile');
    await flushRouteOutlet();

    expect(host.querySelector('input')?.value).toBe('changed draft');
    expect(destroyed.profile).not.toHaveBeenCalled();
    expect(destroyed.home).toHaveBeenCalledOnce();
  });

  it('does not restore kept-alive views after local day rollover', async () => {
    const destroyed = vi.fn();
    const routes = createRoutes();
    const profile = routes.page({
      path: '/profile',
      label: 'Profile',
      page: formPage('profile-draft', destroyed),
      keepAlive: routes.keepAlive.sessionDay(),
    });
    const home = routes.page({
      path: '/',
      label: 'Home',
      page: createTestPage('home'),
    });

    await provideRouter(defineRoutes({ home, profile }));
    disposeOutlet = createRouterOutlet(host);
    await flushRouteOutlet();
    host.querySelector('input')!.value = 'changed draft';

    await navigate('/');
    await flushRouteOutlet();
    setRouteKeepAliveNowForTests(() => new Date('2026-05-25T00:01:00'));
    await navigate('/profile');
    await flushRouteOutlet();

    expect(host.querySelector('input')?.value).toBe('profile-draft');
    expect(destroyed).toHaveBeenCalledOnce();
  });

  it('does not restore a kept-alive view when current guards block navigation', async () => {
    let allowProfile = true;
    const routes = createRoutes();
    const home = routes.page({
      path: '/',
      label: 'Home',
      page: createTestPage('home'),
    });
    const profile = routes.page({
      path: '/profile',
      label: 'Profile',
      page: formPage('profile-draft'),
      canEnter: () => allowProfile,
      keepAlive: routes.keepAlive.sessionDay(),
    });

    await provideRouter(defineRoutes({ home, profile }));
    disposeOutlet = createRouterOutlet(host);
    await flushRouteOutlet();
    host.querySelector('input')!.value = 'changed draft';
    await navigate('/');
    await flushRouteOutlet();
    allowProfile = false;

    await expect(navigate('/profile')).resolves.toBe(false);
    await flushRouteOutlet();

    expect(host.textContent).toBe('home');
    expect(getRouteKeepAliveDiagnosticsForTests()).toContainEqual(
      expect.objectContaining({
        code: 'VR_KEEP_ALIVE_RESTORE_BLOCKED',
        message: 'KeepAlive restore skipped because current guards blocked route "profile".',
      }),
    );
  });
});

async function flushRouteOutlet(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

function formPage(value: string, destroyed: () => void = () => {}) {
  return {
    createComponent() {
      const input = document.createElement('input');
      input.value = value;
      onDestroy(destroyed);

      return {
        node: input,
        ctx: {},
      };
    },
  };
}
