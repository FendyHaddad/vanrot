import { describe, expect, it } from 'vitest';
import {
  escapeAttribute,
  escapeHtml,
  renderDocument,
  renderToString,
  serializeHydrationState,
  type ServerComponentModule,
} from '../src/index.js';

describe('SSR rendering', () => {
  it('renders a server component module to deterministic HTML', () => {
    const profileCard = {
      renderToHtml(initialInputs) {
        return {
          html: `<article data-user="${escapeAttribute(initialInputs['user'])}">${escapeHtml(initialInputs['user'])}</article>`,
          ctx: { rendered: true },
        };
      },
    } satisfies ServerComponentModule;

    expect(renderToString(profileCard, { inputs: { user: 'Ada <Admin>' } })).toBe(
      '<article data-user="Ada &lt;Admin&gt;">Ada &lt;Admin&gt;</article>',
    );
  });

  it('escapes text, attributes, and inline hydration state', () => {
    expect(escapeHtml('<script>alert("x")</script> & copy')).toBe(
      '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; copy',
    );
    expect(escapeAttribute('"quoted" & <tag>')).toBe('&quot;quoted&quot; &amp; &lt;tag&gt;');
    expect(serializeHydrationState({ unsafe: '</script><img src=x onerror=1>' })).toBe(
      '{"unsafe":"\\u003c/script\\u003e\\u003cimg src=x onerror=1\\u003e"}',
    );
  });

  it('builds an HTML shell with deterministic head, assets, body, and state placement', () => {
    const html = renderDocument({
      title: 'Admin <Home>',
      lang: 'en',
      head: ['<meta name="viewport" content="width=device-width, initial-scale=1">'],
      body: '<main data-vr-hydrate>Ready</main>',
      assets: {
        basePath: '/assets/',
        styles: ['app.css'],
        scripts: ['main.js'],
      },
      state: { route: '/admin', unsafe: '</script>' },
    });

    expect(html).toContain('<html lang="en">');
    expect(html).toContain('<title>Admin &lt;Home&gt;</title>');
    expect(html).toContain('<link rel="stylesheet" href="/assets/app.css">');
    expect(html).toContain('<main data-vr-hydrate>Ready</main>');
    expect(html).toContain(
      '<script type="application/json" id="__vanrot_hydration_state__">{"route":"/admin","unsafe":"\\u003c/script\\u003e"}</script>',
    );
    expect(html).toContain('<script type="module" src="/assets/main.js"></script>');
  });

  it('turns browser-only server work into a deterministic diagnostic error', () => {
    const browserOnly = {
      renderToHtml() {
        document.createElement('main');

        return { html: '<main>bad</main>', ctx: null };
      },
    } satisfies ServerComponentModule;

    expect(() => renderToString(browserOnly)).toThrow(
      'VRSSR_BROWSER_API: Server rendering touched a browser-only API while rendering an SSR component.',
    );
  });
});
