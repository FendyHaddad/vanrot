import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';
import {
  compareHydrationMarkup,
  diagnoseRouteHydration,
  hydrate,
  hydrationEventReplayPolicy,
  readHydrationState,
  type HydratableComponentModule,
} from '../src/index.js';

describe('hydration contract', () => {
  it('attaches client behavior without replacing server markup', () => {
    const dom = new JSDOM('<main id="app"><button type="button">Save</button></main>');
    const host = dom.window.document.querySelector('#app');
    const clicks: string[] = [];
    const component = {
      hydrateComponent(target) {
        const button = target.querySelector('button');
        const listener = () => clicks.push('saved');
        button?.addEventListener('click', listener);

        return {
          destroy() {
            button?.removeEventListener('click', listener);
          },
        };
      },
    } satisfies HydratableComponentModule;

    if (host === null) {
      throw new Error('Missing hydration host.');
    }

    const before = host.innerHTML;
    const result = hydrate(component, host, { expectedHtml: before });
    host.querySelector('button')?.dispatchEvent(new dom.window.Event('click'));
    result.destroy();
    host.querySelector('button')?.dispatchEvent(new dom.window.Event('click'));

    expect(host.innerHTML).toBe(before);
    expect(result.diagnostics).toEqual([]);
    expect(clicks).toEqual(['saved']);
  });

  it('reads, validates, and removes serialized hydration state', () => {
    const dom = new JSDOM(
      '<script type="application/json" id="__vanrot_hydration_state__">{"route":"/account","count":2}</script>',
    );

    expect(readHydrationState(dom.window.document, { remove: true })).toEqual({
      route: '/account',
      count: 2,
    });
    expect(dom.window.document.getElementById('__vanrot_hydration_state__')).toBeNull();
  });

  it('reports text, attribute, order, missing-node, and extra-node mismatches deterministically', () => {
    const textDom = new JSDOM('<main id="app"><p>Client</p></main>');
    const attrDom = new JSDOM('<main id="app"><button type="submit">Save</button></main>');
    const orderDom = new JSDOM('<main id="app"><section><strong>Two</strong><p>One</p></section></main>');
    const missingDom = new JSDOM('<main id="app"><section><p>One</p></section></main>');
    const extraDom = new JSDOM('<main id="app"><section><p>One</p><p>Two</p></section></main>');

    expect(compareHydrationMarkup('<p>Server</p>', requireHost(textDom), { source: 'profile.page.html' })).toEqual([
      {
        code: 'VRSSR_TEXT_MISMATCH',
        message: 'Hydration text mismatch at root/p[0]/#text[0] in profile.page.html.',
        path: 'root/p[0]/#text[0]',
        expected: 'Server',
        actual: 'Client',
        source: 'profile.page.html',
      },
    ]);
    expect(compareHydrationMarkup('<button type="button">Save</button>', requireHost(attrDom))).toEqual([
      {
        code: 'VRSSR_ATTRIBUTE_MISMATCH',
        message: 'Hydration attribute mismatch for "type" at root/button[0].',
        path: 'root/button[0]',
        expected: 'button',
        actual: 'submit',
        attribute: 'type',
      },
    ]);
    expect(compareHydrationMarkup('<section><p>One</p><strong>Two</strong></section>', requireHost(orderDom))).toEqual([
      {
        code: 'VRSSR_NODE_ORDER_MISMATCH',
        message: 'Hydration node order mismatch at root/section[0]/p[0].',
        path: 'root/section[0]/p[0]',
        expected: 'p',
        actual: 'strong',
      },
    ]);
    expect(compareHydrationMarkup('<section><p>One</p><p>Two</p></section>', requireHost(missingDom))).toEqual([
      {
        code: 'VRSSR_MISSING_NODE',
        message: 'Hydration missing node at root/section[0]/p[1].',
        path: 'root/section[0]/p[1]',
        expected: 'p',
        actual: null,
      },
    ]);
    expect(compareHydrationMarkup('<section><p>One</p></section>', requireHost(extraDom))).toEqual([
      {
        code: 'VRSSR_EXTRA_NODE',
        message: 'Hydration extra node at root/section[0]/p[1].',
        path: 'root/section[0]/p[1]',
        expected: null,
        actual: 'p',
      },
    ]);
  });

  it('keeps event replay explicitly deferred and reports route divergence', () => {
    expect(hydrationEventReplayPolicy).toEqual({
      status: 'deferred',
      supported: false,
    });
    expect(diagnoseRouteHydration({ serverPath: '/account', clientPath: '/login' })).toEqual([
      {
        code: 'VRSSR_ROUTE_DIVERGENCE',
        message: 'Hydrated route diverged from server route: expected "/account" but found "/login".',
        path: 'route',
        expected: '/account',
        actual: '/login',
      },
    ]);
  });
});

function requireHost(dom: JSDOM): Element {
  const host = dom.window.document.querySelector('#app');

  if (host === null) {
    throw new Error('Missing hydration host.');
  }

  return host;
}
