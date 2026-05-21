import { describe, expect, it } from 'vitest';
import { resolveRoutePage } from '../../src/route/page-loader.js';
import { createTestPage } from '../../src/test/test-pages.js';

describe('resolveRoutePage', () => {
  it('returns eager pages', async () => {
    const page = createTestPage('home');

    await expect(resolveRoutePage({ key: 'home', path: '/', label: 'Home', page })).resolves.toBe(page);
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
