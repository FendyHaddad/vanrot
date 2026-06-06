import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildTemplateIndex } from '../src/project/template-index.js';

function workspace(): string {
  const root = mkdtempSync(join(tmpdir(), 'vanrot-template-index-'));
  mkdirSync(join(root, 'src/pages'), { recursive: true });
  return root;
}

describe('buildTemplateIndex', () => {
  it('records route refs, custom tags, bracket bindings, and dotted no-value attributes', () => {
    const root = workspace();
    const templatePath = join(root, 'src/pages/home.page.html');
    writeFileSync(
      templatePath,
      [
        '<docs-page [article]="article">',
        '  <vr route.home />',
        '  <vr-button behavior.tooltip>',
        '    {{ user.name }}',
        '  </vr-button>',
        '</docs-page>',
      ].join('\n'),
    );

    const index = buildTemplateIndex(root);
    const template = index.templates[0];

    expect(template?.path).toBe(templatePath);
    expect(template?.routeRefs.map((ref) => ref.name)).toEqual(['home']);
    expect(template?.tags.map((tag) => tag.name)).toEqual(['docs-page', 'vr', 'vr-button']);
    expect(template?.bracketBindings.map((binding) => binding.name)).toEqual(['article']);
    expect(template?.dottedAttributes.map((attribute) => attribute.name)).toEqual(['behavior.tooltip']);
  });

  it('returns an empty index when project root is null', () => {
    expect(buildTemplateIndex(null)).toEqual({ templates: [] });
  });
});
