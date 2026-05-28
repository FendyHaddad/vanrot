import { describe, expect, it } from 'vitest';
import { resolveSymbolAt } from '../src/features/symbol-at.js';

function at(markup: string) {
  const offset = markup.indexOf('|');
  return { source: markup.replace('|', ''), offset };
}

describe('resolveSymbolAt', () => {
  it('resolves a route ref', () => {
    const { source, offset } = at('<vr route.ho|me />');
    const symbol = resolveSymbolAt(source, offset);

    expect(symbol).toEqual(expect.objectContaining({ kind: 'route-ref', name: 'home' }));
  });

  it('resolves a component tag', () => {
    const { source, offset } = at('<user-ca|rd></user-card>');
    const symbol = resolveSymbolAt(source, offset);

    expect(symbol).toEqual(expect.objectContaining({ kind: 'component-tag', name: 'user-card' }));
  });

  it('prefers nested symbols over containing component elements', () => {
    const { source, offset } = at('<user-card><vr route.ho|me /></user-card>');
    const symbol = resolveSymbolAt(source, offset);

    expect(symbol).toEqual(expect.objectContaining({ kind: 'route-ref', name: 'home' }));
  });

  it('resolves a slot outlet name', () => {
    const { source, offset } = at('<slot.bo|dy></slot.body>');
    const symbol = resolveSymbolAt(source, offset);

    expect(symbol).toEqual(expect.objectContaining({ kind: 'slot', name: 'body' }));
  });

  it('returns null in plain text', () => {
    const { source, offset } = at('hello |world');

    expect(resolveSymbolAt(source, offset)).toBeNull();
  });
});
