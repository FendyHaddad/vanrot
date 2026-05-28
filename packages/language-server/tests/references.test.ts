import { describe, expect, it } from 'vitest';
import { findReferences } from '../src/features/references.js';

const docs = [
  { uri: 'file:///a.html', text: '<vr route.home /> <vr route.docs />' },
  { uri: 'file:///b.html', text: '<vr route.home />' },
];

describe('findReferences', () => {
  it('finds every route ref across documents', () => {
    const locations = findReferences({ kind: 'route-ref', name: 'home', span: anySpan() }, docs);

    expect(locations.map((location) => location.uri).sort()).toEqual(['file:///a.html', 'file:///b.html']);
  });
});

function anySpan() {
  return { filePath: '', line: 1, column: 1, endLine: 1, endColumn: 1, startOffset: 0, endOffset: 0 };
}
