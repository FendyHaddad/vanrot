import { createLineIndex, positionAtOffset } from '@vanrot/compiler';
import { DiagnosticSeverity, type Diagnostic } from 'vscode-languageserver';
import * as ts from 'typescript';
import { enumerateExpressions } from '../expressions/enumerate.js';
import { createVirtualLanguageService } from '../expressions/language-service.js';
import { buildVirtualDocument } from '../expressions/virtual-document.js';

const virtualPath = '/__vanrot_virtual__.ts';

export function expressionDiagnostics(
  template: string,
  componentSource: string,
  className: string,
): Diagnostic[] {
  const { text, map } = buildVirtualDocument(componentSource, className, enumerateExpressions(template));
  const service = createVirtualLanguageService(virtualPath, text);
  const lineIndex = createLineIndex(template);
  const result: Diagnostic[] = [];

  for (const diagnostic of service.getSemanticDiagnostics(virtualPath)) {
    if (diagnostic.start === undefined) {
      continue;
    }

    const templateStart = map.toTemplate(diagnostic.start);

    if (templateStart === null) {
      continue;
    }

    const templateEnd = map.toTemplate(diagnostic.start + (diagnostic.length ?? 0)) ?? templateStart;
    const start = positionAtOffset(lineIndex, templateStart);
    const end = positionAtOffset(lineIndex, templateEnd);
    result.push({
      severity: DiagnosticSeverity.Error,
      source: 'vanrot-ts',
      code: diagnostic.code,
      message: diagnosticMessage(diagnostic.messageText),
      range: {
        start: { line: start.line - 1, character: start.column - 1 },
        end: { line: end.line - 1, character: end.column - 1 },
      },
    });
  }

  return result;
}

function diagnosticMessage(message: string | ts.DiagnosticMessageChain): string {
  if (typeof message === 'string') {
    return message;
  }

  return message.messageText;
}
