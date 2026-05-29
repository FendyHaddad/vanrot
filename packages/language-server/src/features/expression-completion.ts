import { CompletionItemKind, type CompletionItem } from 'vscode-languageserver';
import { enumerateExpressions } from '../expressions/enumerate.js';
import { createVirtualLanguageService } from '../expressions/language-service.js';
import { buildVirtualDocument } from '../expressions/virtual-document.js';

const virtualPath = '/__vanrot_virtual__.ts';

export function expressionCompletion(
  template: string,
  componentSource: string,
  className: string,
  templateOffset: number,
): CompletionItem[] {
  const { text, map } = buildVirtualDocument(componentSource, className, enumerateExpressions(template));
  const virtualOffset = map.toVirtual(templateOffset);

  if (virtualOffset === null) {
    return [];
  }

  const service = createVirtualLanguageService(virtualPath, text);
  const info = service.getCompletionsAtPosition(virtualPath, virtualOffset, undefined);

  if (info === undefined) {
    return [];
  }

  return info.entries.map((entry) => ({
    label: entry.name,
    kind: CompletionItemKind.Property,
  }));
}
