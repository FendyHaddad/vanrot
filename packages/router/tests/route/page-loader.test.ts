import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearRouteModuleCacheForTests,
  resolveRouteLayout,
  resolveRoutePage,
} from '../../src/route/page-loader.js';
import { createTestLayout, createTestPage } from '../../src/test/test-pages.js';

class SettingsPage {}

beforeEach(() => {
  clearRouteModuleCacheForTests();
});

describe('resolveRoutePage', () => {
  it('returns eager pages', async () => {
    const page = createTestPage('home');

    await expect(resolveRoutePage({ key: 'home', path: '/', label: 'Home', page })).resolves.toBe(page);
  });

  it('returns eager class pages', async () => {
    await expect(
      resolveRoutePage({ key: 'settings', path: '/settings', label: 'Settings', page: SettingsPage }),
    ).resolves.toBe(SettingsPage);
  });

  it('returns lazy default class pages', async () => {
    await expect(
      resolveRoutePage({
        key: 'settings',
        path: '/settings',
        label: 'Settings',
        loadPage: async () => ({ default: SettingsPage }),
      }),
    ).resolves.toBe(SettingsPage);
  });

  it('returns lazy default page modules', async () => {
    const page = createTestPage('about');

    await expect(
      resolveRoutePage({
        key: 'about',
        path: '/about',
        label: 'About',
        loadPage: async () => ({ default: page }),
      }),
    ).resolves.toBe(page);
  });

  it('returns lazy direct page modules', async () => {
    const page = createTestPage('settings');

    await expect(
      resolveRoutePage({
        key: 'settings',
        path: '/settings',
        label: 'Settings',
        loadPage: async () => page,
      }),
    ).resolves.toBe(page);
  });
});

describe('route lazy module cache', () => {
  it('caches successful lazy page loads by defined route', async () => {
    const page = createTestPage('cached-page');
    const loadPage = vi.fn(async () => ({ default: page }));
    const route = {
      key: 'cached',
      path: '/cached',
      label: 'Cached',
      loadPage,
    };

    await expect(resolveRoutePage(route)).resolves.toBe(page);
    await expect(resolveRoutePage(route)).resolves.toBe(page);

    expect(loadPage).toHaveBeenCalledOnce();
  });

  it('retries lazy page loads after rejection', async () => {
    const page = createTestPage('retry-page');
    const loadPage = vi
      .fn<() => Promise<{ default: typeof page }>>()
      .mockRejectedValueOnce(new Error('first load failed'))
      .mockResolvedValueOnce({ default: page });
    const route = {
      key: 'retry',
      path: '/retry',
      label: 'Retry',
      loadPage,
    };

    await expect(resolveRoutePage(route)).rejects.toThrow('first load failed');
    await expect(resolveRoutePage(route)).resolves.toBe(page);

    expect(loadPage).toHaveBeenCalledTimes(2);
  });

  it('caches successful lazy layout loads by defined route', async () => {
    const layout = createTestLayout('cached-layout');
    const loadLayout = vi.fn(async () => ({ default: layout }));
    const route = {
      key: 'cachedLayout',
      path: '/cached-layout',
      label: 'Cached layout',
      loadLayout,
    };

    await expect(resolveRouteLayout(route)).resolves.toBe(layout);
    await expect(resolveRouteLayout(route)).resolves.toBe(layout);

    expect(loadLayout).toHaveBeenCalledOnce();
  });
});
