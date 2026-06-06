import { describe, expect, it } from 'vitest';
import { buildCodeActions } from '../src/features/code-actions.js';

describe('buildCodeActions', () => {
  it('suggests the closest route ref for a route typo', () => {
    const actions = buildCodeActions({
      documentUri: 'file:///repo/src/pages/home.page.html',
      diagnostics: [
        {
          code: 'VREDITOR001',
          message: 'Unknown route ref route.settngs.',
          source: 'vanrot',
          range: {
            start: { line: 0, character: 4 },
            end: { line: 0, character: 17 },
          },
        },
      ],
      routes: [{ name: 'settings', path: '/settings' }],
      webTypesSources: ['packages/router/web-types.json'],
    });

    expect(actions).toContainEqual(expect.objectContaining({ title: 'Replace with route.settings' }));
  });

  it('points missing metadata fixes at the Web Types source file', () => {
    const actions = buildCodeActions({
      documentUri: 'file:///repo/src/pages/home.page.html',
      diagnostics: [
        {
          code: 'VREDITOR003',
          message: 'Missing Web Types metadata for vr-panel.',
          source: 'vanrot',
          range: {
            start: { line: 0, character: 1 },
            end: { line: 0, character: 9 },
          },
        },
      ],
      routes: [],
      webTypesSources: ['packages/ui/web-types.json'],
    });

    expect(actions[0]?.command?.arguments).toEqual(['packages/ui/web-types.json']);
  });
});
