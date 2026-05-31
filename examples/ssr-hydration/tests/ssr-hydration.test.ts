import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  hydrate,
  renderDocument,
  renderRouteToString,
  resolveSsrRoute,
} from '@vanrot/ssr';
import { profilePage } from '../src/profile.page.ts';
import { ssrRoutes } from '../src/routes.ts';

describe('SSR hydration example', () => {
  it('renders a route into an HTML shell with serialized state', async () => {
    const body = await renderRouteToString(ssrRoutes, '/account/42');
    const html = renderDocument({
      title: 'Account',
      body,
      state: { route: '/account/42' },
      assets: { basePath: '/assets/', scripts: ['main.js'] },
    });

    expect(body).toBe('<main data-vr-hydrate><button type="button">Account 42</button></main>');
    expect(html).toContain('__vanrot_hydration_state__');
    expect(html).toContain('<script type="module" src="/assets/main.js"></script>');
  });

  it('hydrates existing markup without replacing it', () => {
    const dom = new JSDOM('<main id="app" data-vr-hydrate><button type="button">Account 42</button></main>');
    const host = dom.window.document.querySelector('#app');

    if (host === null) {
      throw new Error('Missing example hydration host.');
    }

    const before = host.innerHTML;
    const result = hydrate(profilePage, host, { expectedHtml: before });

    expect(result.diagnostics).toEqual([]);
    expect(host.innerHTML).toBe(before);
  });

  it('resolves route params through route refs before rendering', async () => {
    await expect(resolveSsrRoute(ssrRoutes, '/account/42?tab=security')).resolves.toMatchObject({
      status: 'matched',
      params: { accountId: '42' },
      query: { tab: 'security' },
    });
  });

  it('keeps SSR out of the runtime package', () => {
    const runtimeRoot = join('..', '..', 'packages', 'runtime');
    const runtimeManifest = readFileSync(join(runtimeRoot, 'package.json'), 'utf8');
    const runtimeIndex = readFileSync(join(runtimeRoot, 'src', 'index.ts'), 'utf8');

    expect(runtimeManifest).not.toContain('@vanrot/ssr');
    expect(runtimeIndex).not.toContain('renderToString');
    expect(runtimeIndex).not.toContain('hydrate(');
  });
});
