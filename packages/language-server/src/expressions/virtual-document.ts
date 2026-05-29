import type { TemplateExpression } from './enumerate.js';
import { collectInstanceMemberNames } from './members.js';
import { PositionMap, type MapSegment } from './position-map.js';

export interface VirtualDocument {
  text: string;
  map: PositionMap;
}

export function buildVirtualDocument(
  componentSource: string,
  className: string,
  expressions: readonly TemplateExpression[],
): VirtualDocument {
  const members = collectInstanceMemberNames(componentSource, className);
  const destructure = members.length > 0 ? `  const { ${members.join(', ')} } = ctx;\n` : '';
  const header =
    `${componentSource}\n` +
    `type __VrInstance = InstanceType<typeof ${className}>;\n` +
    `function __vrTpl(ctx: __VrInstance) {\n${destructure}`;
  const segments: MapSegment[] = [];
  let body = '';

  for (const expression of expressions) {
    const prefix = '  ;(';
    const virtualStart = header.length + body.length + prefix.length;
    segments.push({
      templateStart: expression.span.startOffset,
      virtualStart,
      length: expression.expression.length,
    });
    body += `${prefix}${expression.expression});\n`;
  }

  return { text: `${header}${body}}\n`, map: new PositionMap(segments) };
}
