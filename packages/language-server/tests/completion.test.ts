import type { SourceSpan } from '@vanrot/compiler';
import { CompletionItemKind } from 'vscode-languageserver';
import { describe, expect, it } from 'vitest';
import { buildCompletions } from '../src/features/completion.js';

const indexes = {
  routes: [
    { name: 'home', span: anySpan() },
    { name: 'docs', path: '/docs', span: anySpan() },
  ],
  components: [{ tagName: 'user-card', className: 'UserCardComponent', path: 'a.ts' }],
  webTypes: {
    sources: [{ path: 'packages/ui/web-types.json', name: 'ui' }],
    tags: [
      {
        name: 'vr-button',
        description: 'Button primitive from Web Types.',
        sourcePath: 'packages/ui/web-types.json',
      },
    ],
    attributes: [
      {
        name: 'behavior.tooltip',
        description: 'Tooltip behavior.',
        sourcePath: 'packages/router/web-types.json',
      },
    ],
  },
};

function anySpan(): SourceSpan {
  return {
    filePath: '',
    line: 1,
    column: 1,
    endLine: 1,
    endColumn: 1,
    startOffset: 0,
    endOffset: 0,
  };
}

describe('buildCompletions', () => {
  it('offers route names for a route-ref context', () => {
    const items = buildCompletions({ kind: 'route-ref' }, indexes);

    expect(items.map((item) => item.label).sort()).toEqual(['docs', 'home']);
  });

  it('offers vr elements and component tags for a tag-name context', () => {
    const items = buildCompletions({ kind: 'tag-name' }, indexes);
    const labels = items.map((item) => item.label);

    expect(labels).toContain('vr');
    expect(labels).toContain('user-card');
    expect(items).toContainEqual(
      expect.objectContaining({
        label: 'vr-button',
        detail: 'packages/ui/web-types.json',
        documentation: 'Button primitive from Web Types.',
      }),
    );
  });

  it('offers route.* for an attribute-name context', () => {
    const items = buildCompletions({ kind: 'attribute-name' }, indexes);

    expect(items.some((item) => item.label === 'route.')).toBe(true);
    expect(items).toContainEqual(expect.objectContaining({ label: 'route.docs', detail: '/docs' }));
    expect(items).toContainEqual(expect.objectContaining({ label: 'behavior.tooltip' }));
    expect(items[0]?.kind).toBe(CompletionItemKind.Property);
  });
});
