import type { TemplateNode } from '../template/ast.js';
import { quoteString } from './bindings.js';
import type { GenerateState } from './state.js';

export type GenerateTemplateNode = (
  node: TemplateNode,
  parentName: string,
  scopeAttribute: string,
  state: GenerateState,
) => void;

export function generateSlotOutlet(
  node: Extract<TemplateNode, { kind: 'slot-outlet' }>,
  parentName: string,
  scopeAttribute: string,
  state: GenerateState,
  generateNode: GenerateTemplateNode,
): void {
  const fallbackName = state.ids.next('slot-fallback');

  state.usesSlots = true;
  state.features.add('slot');
  state.lines.push(`  const ${fallbackName} = document.createDocumentFragment();`);

  for (const child of node.fallback) {
    generateNode(child, fallbackName, scopeAttribute, state);
  }

  state.lines.push(
    `  renderSlot(${parentName}, ${quoteString(node.name)}, ${fallbackName}, projectedSlots);`,
  );
}
