import * as ts from 'typescript';
import { enumerateExpressions } from '../expressions/enumerate.js';
import { createVirtualLanguageService } from '../expressions/language-service.js';
import { buildVirtualDocument } from '../expressions/virtual-document.js';

const virtualPath = '/__vanrot_virtual__.ts';

export interface ExpressionHover {
  contents: string;
}

export function expressionHover(
  template: string,
  componentSource: string,
  className: string,
  templateOffset: number,
): ExpressionHover | null {
  const { text, map } = buildVirtualDocument(componentSource, className, enumerateExpressions(template));
  const virtualOffset = map.toVirtual(templateOffset);

  if (virtualOffset === null) {
    return null;
  }

  const service = createVirtualLanguageService(virtualPath, text);
  const info = service.getQuickInfoAtPosition(virtualPath, virtualOffset);

  if (info === undefined) {
    return null;
  }

  return { contents: ts.displayPartsToString(info.displayParts) };
}
