import { describe, expect, it } from 'vitest';
import { createScopeAttribute } from '../../src/styles/scope-id.js';

describe('createScopeAttribute', () => {
  it('is deterministic for the same component path and css source', () => {
    expect(createScopeAttribute('/app/counter.component.ts', 'button { color: red; }')).toBe(
      createScopeAttribute('/app/counter.component.ts', 'button { color: red; }'),
    );
  });

  it('changes when the component path changes', () => {
    expect(createScopeAttribute('/app/counter.component.ts', 'button { color: red; }')).not.toBe(
      createScopeAttribute('/app/user-card.component.ts', 'button { color: red; }'),
    );
  });

  it('creates a safe html attribute name', () => {
    expect(createScopeAttribute('/app/counter.component.ts', 'button { color: red; }')).toMatch(
      /^data-vr-[a-f0-9]{6}$/,
    );
  });
});
