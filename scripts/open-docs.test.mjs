import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import {
  createBrowserOpenCommand,
  createDevServerCommand,
  createSiteUrl,
  normalizeSitePath,
} from './open-docs.mjs';

describe('open-docs', () => {
  it('opens the site root by default with optional docs subpaths', () => {
    expect(createSiteUrl()).toBe('http://127.0.0.1:1964');
    expect(createSiteUrl({ sitePath: normalizeSitePath('docs') })).toBe(
      'http://127.0.0.1:1964/docs',
    );
    expect(createSiteUrl({ sitePath: normalizeSitePath('docs/changelog') })).toBe(
      'http://127.0.0.1:1964/docs/changelog',
    );
    expect(createSiteUrl({ sitePath: normalizeSitePath('changelog') })).toBe(
      'http://127.0.0.1:1964/docs/changelog',
    );
    expect(createSiteUrl({ sitePath: normalizeSitePath('/docs/components/button') })).toBe(
      'http://127.0.0.1:1964/docs/components/button',
    );
  });

  it('opens the default browser with platform-specific commands', () => {
    expect(createBrowserOpenCommand('darwin', 'http://127.0.0.1:1964/docs')).toEqual({
      command: 'open',
      args: ['http://127.0.0.1:1964/docs'],
    });
    expect(createBrowserOpenCommand('linux', 'http://127.0.0.1:1964/docs')).toEqual({
      command: 'xdg-open',
      args: ['http://127.0.0.1:1964/docs'],
    });
    expect(createBrowserOpenCommand('win32', 'http://127.0.0.1:1964/docs')).toEqual({
      command: 'cmd',
      args: ['/c', 'start', '', 'http://127.0.0.1:1964/docs'],
    });
  });

  it('starts the Vanrot docs dev server on the standard local port', () => {
    expect(createDevServerCommand()).toEqual({
      command: 'pnpm',
      args: [
        '--filter',
        '@vanrot/vanrot-site',
        'dev',
        '--',
        '--host',
        '127.0.0.1',
        '--port',
        '1964',
      ],
    });
  });

  it('documents non-conflicting pnpm shortcuts at the root and site package', async () => {
    const rootPackage = JSON.parse(await readFile('package.json', 'utf8'));
    const sitePackage = JSON.parse(await readFile('apps/vanrot-site/package.json', 'utf8'));

    expect(rootPackage.scripts['open:site']).toBe('node scripts/open-docs.mjs');
    expect(rootPackage.scripts['open:docs']).toBe('node scripts/open-docs.mjs docs');
    expect(rootPackage.scripts['docs:open']).toBe('node scripts/open-docs.mjs docs');
    expect(rootPackage.scripts.docs).toBeUndefined();
    expect(sitePackage.scripts['open:site']).toBe('node ../../scripts/open-docs.mjs');
    expect(sitePackage.scripts['open:docs']).toBe('node ../../scripts/open-docs.mjs docs');
    expect(sitePackage.scripts['docs:open']).toBe('node ../../scripts/open-docs.mjs docs');
    expect(sitePackage.scripts.docs).toBeUndefined();
  });
});
