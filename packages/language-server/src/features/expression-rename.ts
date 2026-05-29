import { createLineIndex, positionAtOffset } from '@vanrot/compiler';
import type { TextEdit } from 'vscode-languageserver';
import { enumerateExpressions } from '../expressions/enumerate.js';
import { createVirtualLanguageService } from '../expressions/language-service.js';
import { buildVirtualDocument } from '../expressions/virtual-document.js';

const virtualPath = '/__vanrot_virtual__.ts';

export interface RenameEdits {
  template: TextEdit[];
}

export function expressionRename(
  template: string,
  componentSource: string,
  className: string,
  templateOffset: number,
  newName: string,
): RenameEdits {
  const { text, map } = buildVirtualDocument(componentSource, className, enumerateExpressions(template));
  const virtualOffset = map.toVirtual(templateOffset);

  if (virtualOffset === null) {
    return { template: [] };
  }

  const service = createVirtualLanguageService(virtualPath, text);
  const locations = service.findRenameLocations(virtualPath, virtualOffset, false, false) ?? [];
  const lineIndex = createLineIndex(template);
  const edits: TextEdit[] = [];

  for (const location of locations) {
    const templateStart = map.toTemplate(location.textSpan.start);

    if (templateStart === null) {
      continue;
    }

    const templateEnd = map.toTemplate(location.textSpan.start + location.textSpan.length) ?? templateStart;
    const start = positionAtOffset(lineIndex, templateStart);
    const end = positionAtOffset(lineIndex, templateEnd);
    edits.push({
      range: {
        start: { line: start.line - 1, character: start.column - 1 },
        end: { line: end.line - 1, character: end.column - 1 },
      },
      newText: newName,
    });
  }

  return { template: edits };
}
