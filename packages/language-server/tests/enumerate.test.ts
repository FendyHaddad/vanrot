import { describe, expect, it } from 'vitest';
import { enumerateExpressions } from '../src/expressions/enumerate.js';

describe('enumerateExpressions', () => {
  it('collects interpolation expressions with spans', () => {
    const list = enumerateExpressions('<p>{{ user.name }}</p>');

    expect(list).toHaveLength(1);
    expect(list[0]?.expression).toBe('user.name');
    expect(list[0]?.span.startOffset).toBeGreaterThan(0);
  });

  it('collects property and event binding expressions', () => {
    const list = enumerateExpressions('<button (click)="save()" [disabled]="busy">x</button>');

    expect(list.map((entry) => entry.expression).sort()).toEqual(['busy', 'save()']);
  });

  it('collects control-flow expressions', () => {
    const list = enumerateExpressions(
      '@if (ready()) { @for (user of users(); track user.id) { <p>{{ user.name }}</p> } }',
    );

    expect(list.map((entry) => entry.expression)).toEqual([
      'ready()',
      'users()',
      'user.name',
    ]);
  });
});
