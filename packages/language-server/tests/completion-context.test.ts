import { describe, expect, it } from 'vitest';
import { classifyCompletionContext } from '../src/features/completion-context.js';

function at(markup: string): { source: string; offset: number } {
  const offset = markup.indexOf('|');
  return { source: markup.replace('|', ''), offset };
}

describe('classifyCompletionContext', () => {
  it('detects a tag-name position after <', () => {
    const { source, offset } = at('<div><|');

    expect(classifyCompletionContext(source, offset).kind).toBe('tag-name');
  });

  it('detects an attribute-name position inside an open tag', () => {
    const { source, offset } = at('<vr |></vr>');

    expect(classifyCompletionContext(source, offset).kind).toBe('attribute-name');
  });

  it('detects a route-ref position after route.', () => {
    const { source, offset } = at('<vr route.|');

    expect(classifyCompletionContext(source, offset).kind).toBe('route-ref');
  });

  it('returns none in plain text', () => {
    const { source, offset } = at('hello |world');

    expect(classifyCompletionContext(source, offset).kind).toBe('none');
  });
});
