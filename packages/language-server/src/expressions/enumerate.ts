import {
  extractTemplateBindings,
  parseTemplate,
  type SourceSpan,
  type TemplateNode,
} from '@vanrot/compiler';

const templateFileName = 'template.html';

export interface TemplateExpression {
  expression: string;
  span: SourceSpan;
}

export function enumerateExpressions(source: string): TemplateExpression[] {
  const parsed = parseTemplate(source, templateFileName);
  return collectExpressions(parsed.nodes);
}

function collectExpressions(nodes: readonly TemplateNode[]): TemplateExpression[] {
  const expressions: TemplateExpression[] = [];
  const { bindings } = extractTemplateBindings(nodes, templateFileName);

  for (const binding of bindings) {
    if (binding.kind === 'event') {
      expressions.push({ expression: binding.handler, span: binding.expressionSpan });
      continue;
    }

    expressions.push({ expression: binding.expression, span: binding.expressionSpan });
  }

  for (const node of nodes) {
    if (node.kind === 'if-block') {
      expressions.push({ expression: node.expression, span: node.expressionSpan });
      expressions.push(...collectExpressions([...node.consequent, ...node.alternate]));
      continue;
    }

    if (node.kind === 'for-block') {
      expressions.push({ expression: node.iterableExpression, span: node.expressionSpan });
      expressions.push(...collectExpressions([...node.body, ...node.empty]));
    }
  }

  return expressions;
}
