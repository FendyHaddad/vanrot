import { describe, expect, it } from 'vitest';
import { findDefinition } from '../src/features/definition.js';

const index = {
  routes: [{ name: 'home', span: span('/app/src/routes.ts', 4, 3, 4, 7) }],
  components: [{ tagName: 'user-card', className: 'UserCardComponent', path: '/app/user-card.component.ts' }],
  routesPath: '/app/src/routes.ts',
};

function span(filePath: string, line: number, column: number, endLine: number, endColumn: number) {
  return { filePath, line, column, endLine, endColumn, startOffset: 0, endOffset: 0 };
}

describe('findDefinition', () => {
  it('points a route ref at the routes.ts name span', () => {
    const location = findDefinition({ kind: 'route-ref', name: 'home', span: span('t.html', 1, 1, 1, 1) }, index);

    expect(location?.uri).toBe('file:///app/src/routes.ts');
    expect(location?.range.start).toEqual({ line: 3, character: 2 });
  });

  it('points a component tag at its .component.ts', () => {
    const location = findDefinition(
      { kind: 'component-tag', name: 'user-card', span: span('t.html', 1, 1, 1, 1) },
      index,
    );

    expect(location?.uri).toBe('file:///app/user-card.component.ts');
  });

  it('returns null for an unknown route', () => {
    expect(findDefinition({ kind: 'route-ref', name: 'nope', span: span('t.html', 1, 1, 1, 1) }, index)).toBeNull();
  });
});
