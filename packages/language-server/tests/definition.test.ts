import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { findDefinition } from '../src/features/definition.js';

const index = {
  routes: [{ name: 'home', span: span('/app/src/routes.ts', 4, 3, 4, 7) }],
  components: [{ tagName: 'user-card', className: 'UserCardComponent', path: '/app/user-card.component.ts' }],
  routesPath: '/app/src/routes.ts',
  projectRoot: null,
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

  it('points a Vanrot UI tag at the matching primitive source file', () => {
    const projectRoot = temporaryProjectWithUiPrimitive('header');
    const location = findDefinition(
      { kind: 'component-tag', name: 'vr-header', span: span('t.html', 1, 1, 1, 1) },
      { ...index, projectRoot },
    );

    expect(location?.uri).toBe(`file://${projectRoot}/packages/ui/src/primitives/header/ui.header.ts`);
  });

  it('points a Vanrot UI anatomy tag at its owning primitive source file', () => {
    const projectRoot = temporaryProjectWithUiPrimitive('command-menu');
    const location = findDefinition(
      { kind: 'component-tag', name: 'vr-command-menu-item', span: span('t.html', 1, 1, 1, 1) },
      { ...index, projectRoot },
    );

    expect(location?.uri).toBe(
      `file://${projectRoot}/packages/ui/src/primitives/command-menu/ui.command-menu.ts`,
    );
  });

  it('returns null for an unknown route', () => {
    expect(findDefinition({ kind: 'route-ref', name: 'nope', span: span('t.html', 1, 1, 1, 1) }, index)).toBeNull();
  });
});

function temporaryProjectWithUiPrimitive(primitive: string): string {
  const projectRoot = mkdtempSync(join(tmpdir(), 'vanrot-lsp-definition-'));
  const directory = join(projectRoot, 'packages/ui/src/primitives', primitive);
  mkdirSync(directory, { recursive: true });
  writeFileSync(join(directory, `ui.${primitive}.ts`), 'export const example = true;');

  return projectRoot;
}
