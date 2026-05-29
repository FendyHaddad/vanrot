import { describe, expect, it } from 'vitest';
import { buildVirtualDocument } from '../src/expressions/virtual-document.js';

const componentSource = `export class XComponent {
  user = { name: 'a' };
}
`;

describe('buildVirtualDocument', () => {
  it('embeds each expression verbatim and maps its offset', () => {
    const expr = { expression: 'user.name', span: span(3, 12) };
    const result = buildVirtualDocument(componentSource, 'XComponent', [expr]);

    expect(result.text).toContain('user.name');
    const virtualOffset = result.map.toVirtual(3);
    expect(virtualOffset).not.toBeNull();
    expect(result.text.slice(virtualOffset!, virtualOffset! + 9)).toBe('user.name');
  });
});

function span(startOffset: number, endOffset: number) {
  return { filePath: '', line: 1, column: 1, endLine: 1, endColumn: 1, startOffset, endOffset };
}
