import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadVanrotWebTypes } from '../src/project/web-types.js';

function workspace(): string {
  return mkdtempSync(join(tmpdir(), 'vanrot-web-types-'));
}

describe('loadVanrotWebTypes', () => {
  it('loads root, app, ui, and router web types into one summary', () => {
    const root = workspace();
    mkdirSync(join(root, 'apps/vanrot-site'), { recursive: true });
    mkdirSync(join(root, 'packages/ui'), { recursive: true });
    mkdirSync(join(root, 'packages/router'), { recursive: true });

    writeFileSync(
      join(root, 'web-types.json'),
      JSON.stringify({
        name: 'root',
        contributions: { html: { tags: [{ name: 'vr', description: 'Route object shorthand' }] } },
      }),
    );
    writeFileSync(
      join(root, 'apps/vanrot-site/web-types.json'),
      JSON.stringify({
        name: 'site',
        contributions: { html: { tags: [{ name: 'docs-page', description: 'Docs page shell' }] } },
      }),
    );
    writeFileSync(
      join(root, 'packages/ui/web-types.json'),
      JSON.stringify({
        name: 'ui',
        contributions: { html: { elements: [{ name: 'vr-button', description: 'Button primitive' }] } },
      }),
    );
    writeFileSync(
      join(root, 'packages/router/web-types.json'),
      JSON.stringify({
        name: 'router',
        contributions: { html: { attributes: [{ name: 'route.home', description: 'Home route ref' }] } },
      }),
    );

    const summary = loadVanrotWebTypes(root);

    expect(summary.sources.map((source) => source.path)).toEqual([
      'web-types.json',
      'apps/vanrot-site/web-types.json',
      'packages/ui/web-types.json',
      'packages/router/web-types.json',
    ]);
    expect(summary.tags.map((tag) => tag.name)).toEqual(['vr', 'docs-page', 'vr-button']);
    expect(summary.attributes.map((attribute) => attribute.name)).toEqual(['route.home']);
  });

  it('returns an empty summary when project root is null', () => {
    expect(loadVanrotWebTypes(null)).toEqual({ sources: [], tags: [], attributes: [] });
  });
});
