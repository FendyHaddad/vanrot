import { describe, expect, it } from 'vitest';
import { buildComponentIndex, componentTagFromClassName } from '../src/project/component-index.js';

describe('componentTagFromClassName', () => {
  it('kebab-cases a component class name', () => {
    expect(componentTagFromClassName('UserCardComponent')).toBe('user-card');
    expect(componentTagFromClassName('HomePage')).toBe('home');
    expect(componentTagFromClassName('UiButton')).toBe('ui');
  });
});

describe('buildComponentIndex', () => {
  it('records tags from compiler component file conventions', () => {
    const entries = buildComponentIndex([
      {
        path: '/work/src/user-card.component.ts',
        source: 'export class UserCardComponent {}',
      },
    ]);

    expect(entries).toEqual([
      {
        tagName: 'user-card',
        className: 'UserCardComponent',
        path: '/work/src/user-card.component.ts',
      },
    ]);
  });
});
