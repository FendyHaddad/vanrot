import type { ComponentDependency, ComponentDependencyInput } from '../api/types.js';
import { createDiagnostic } from '../diagnostics/diagnostics.js';
import { rewriteExpression, type ExpressionSourceContext } from '../expressions/rewrite-expression.js';
import type { ElementNode, TemplateAttribute, TemplateNode } from '../template/ast.js';
import { quoteString } from './bindings.js';
import type { GenerateTemplateNode } from './slots.js';
import type { GenerateState } from './state.js';

const vanrotPrimitivePrefix = 'vr-';
const componentTagPattern = /^[a-z][a-z0-9]*(-[a-z0-9]+)+$/;
const componentFileSuffix = '.component.js';
const componentFactoryPrefix = 'create';
const componentInputPattern = /^\[([^\]]+)\]$/;
const javascriptIdentifierPattern = /^[A-Za-z_$][\w$]*$/;

interface RewrittenComponentInput extends ComponentDependencyInput {
  rewrittenExpression: string;
}

export function isChildComponentTag(tagName: string): boolean {
  if (tagName.startsWith(vanrotPrimitivePrefix)) {
    return false;
  }

  return componentTagPattern.test(tagName);
}

export function toComponentName(tagName: string): string {
  return `${tagName.split('-').map(toTitleCase).join('')}Component`;
}

export function toComponentFactoryName(componentName: string): string {
  return `${componentFactoryPrefix}${componentName}`;
}

export function generateChildComponent(
  node: ElementNode,
  parentName: string,
  scopeAttribute: string,
  state: GenerateState,
  generateNode: GenerateTemplateNode,
): void {
  const componentName = toComponentName(node.tagName);
  const factoryName = toComponentFactoryName(componentName);
  const instanceName = state.ids.next(node.tagName);
  const inputs = collectComponentInputs(node, state);
  const initialInputsName = generateInitialInputObject(node.tagName, inputs, state);
  const projectedSlotsName = generateProjectedSlots(node, scopeAttribute, state, generateNode);

  state.features.add('child-component');
  recordComponentDependency(state, {
    tagName: node.tagName,
    componentName,
    importPath: toComponentImportPath(node.tagName),
    inputs: toDependencyInputs(inputs),
  });

  state.lines.push(
    `  const ${instanceName} = ${factoryName}(${createFactoryArguments(initialInputsName, projectedSlotsName)});`,
  );
  state.lines.push(`  ${parentName}.append(${instanceName}.node);`);
  generateChildComponentInputEffects(inputs, instanceName, state);
}

export function generateChildComponentImports(
  dependencies: readonly ComponentDependency[],
): string[] {
  const importsBySpecifier = new Map<string, string>();

  for (const dependency of dependencies) {
    const factoryName = toComponentFactoryName(dependency.componentName);

    importsBySpecifier.set(
      `${factoryName}:${dependency.importPath}`,
      `import { ${factoryName} } from ${quoteString(dependency.importPath)};`,
    );
  }

  return [...importsBySpecifier.values()];
}

function generateChildComponentInputEffects(
  inputs: readonly RewrittenComponentInput[],
  instanceName: string,
  state: GenerateState,
): void {
  for (const input of inputs) {
    state.usesEffect = true;
    state.features.add('expression-rewriting');
    state.lines.push('  effect(() => {');
    state.lines.push(`    ${instanceName}.ctx.${input.name}.set(${input.rewrittenExpression});`);
    state.lines.push('  });');
  }
}

function collectComponentInputs(
  node: ElementNode,
  state: GenerateState,
): RewrittenComponentInput[] {
  const inputs: RewrittenComponentInput[] = [];

  for (const attribute of node.attributes) {
    const inputName = readComponentInputName(attribute);

    if (inputName === null) {
      diagnoseUnsupportedChildAttribute(attribute, state);
      continue;
    }

    if (!javascriptIdentifierPattern.test(inputName)) {
      diagnoseInvalidChildInput(attribute, state);
      continue;
    }

    const rewritten = rewriteExpression(attribute.value, createAttributeSourceContext(attribute, state));

    state.diagnostics.push(...rewritten.diagnostics);

    if (rewritten.expression === null) {
      continue;
    }

    state.features.add('expression-rewriting');
    inputs.push({
      name: inputName,
      expression: attribute.value,
      rewrittenExpression: rewritten.expression,
    });
  }

  return inputs;
}

function readComponentInputName(attribute: TemplateAttribute): string | null {
  const match = componentInputPattern.exec(attribute.name);

  if (match === null) {
    return null;
  }

  const name = match[1] ?? '';

  if (name.length === 0) {
    return null;
  }

  return name;
}

function generateInitialInputObject(
  tagName: string,
  inputs: readonly RewrittenComponentInput[],
  state: GenerateState,
): string | null {
  if (inputs.length === 0) {
    return null;
  }

  const initialInputsName = state.ids.next(`${tagName}-inputs`);

  state.lines.push(`  const ${initialInputsName} = {`);

  for (const input of inputs) {
    state.lines.push(`    ${quoteString(input.name)}: ${input.rewrittenExpression},`);
  }

  state.lines.push('  };');

  return initialInputsName;
}

function generateProjectedSlots(
  node: ElementNode,
  scopeAttribute: string,
  state: GenerateState,
  generateNode: GenerateTemplateNode,
): string | null {
  if (node.children.length === 0) {
    return null;
  }

  const slotsName = state.ids.next(`${node.tagName}-slots`);
  const slots = groupProjectedChildren(node.children);
  const slotFragmentNames: Array<{ name: string; fragmentName: string }> = [];

  state.features.add('slot');

  for (const [slotName, children] of slots) {
    const fragmentName = state.ids.next(`${node.tagName}-${slotName}-slot`);

    slotFragmentNames.push({ name: slotName, fragmentName });
    state.lines.push(`  const ${fragmentName} = document.createDocumentFragment();`);

    for (const child of children) {
      generateNode(removeSlotAttributes(child), fragmentName, scopeAttribute, state);
    }
  }

  state.lines.push(`  const ${slotsName} = {`);

  for (const slot of slotFragmentNames) {
    state.lines.push(`    ${quoteString(slot.name)}: ${slot.fragmentName},`);
  }

  state.lines.push('  };');

  return slotsName;
}

function createFactoryArguments(initialInputsName: string | null, projectedSlotsName: string | null): string {
  if (projectedSlotsName === null) {
    return initialInputsName ?? '';
  }

  return `${initialInputsName ?? '{}'}, ${projectedSlotsName}`;
}

function groupProjectedChildren(children: readonly TemplateNode[]): Map<string, TemplateNode[]> {
  const grouped = new Map<string, TemplateNode[]>();

  for (const child of children) {
    const slotName = readProjectedSlotName(child);
    const group = grouped.get(slotName) ?? [];

    group.push(child);
    grouped.set(slotName, group);
  }

  return grouped;
}

function readProjectedSlotName(node: TemplateNode): string {
  if (node.kind !== 'element') {
    return 'default';
  }

  const slotAttribute = node.attributes.find((attribute) => isSlotAttribute(attribute.name));

  if (slotAttribute === undefined || slotAttribute.name === 'slot') {
    return 'default';
  }

  return slotAttribute.name.slice('slot.'.length);
}

function removeSlotAttributes(node: TemplateNode): TemplateNode {
  if (node.kind !== 'element') {
    return node;
  }

  return {
    ...node,
    attributes: node.attributes.filter((attribute) => !isSlotAttribute(attribute.name)),
    children: node.children.map(removeSlotAttributes),
  };
}

function isSlotAttribute(attributeName: string): boolean {
  return attributeName === 'slot' || /^slot\.[a-z][a-z0-9_-]*$/.test(attributeName);
}

function recordComponentDependency(state: GenerateState, dependency: ComponentDependency): void {
  const existing = state.componentDependencies.find((candidate) =>
    candidate.tagName === dependency.tagName
    && candidate.componentName === dependency.componentName
    && candidate.importPath === dependency.importPath,
  );

  if (existing === undefined) {
    state.componentDependencies.push(dependency);
    return;
  }

  for (const input of dependency.inputs) {
    const alreadyTracked = existing.inputs.some((candidate) =>
      candidate.name === input.name && candidate.expression === input.expression,
    );

    if (alreadyTracked) {
      continue;
    }

    existing.inputs.push(input);
  }
}

function toDependencyInputs(
  inputs: readonly RewrittenComponentInput[],
): ComponentDependencyInput[] {
  return inputs.map((input) => ({
    name: input.name,
    expression: input.expression,
  }));
}

function diagnoseInvalidChildInput(attribute: TemplateAttribute, state: GenerateState): void {
  state.diagnostics.push(
    createDiagnostic(
      'VR012',
      'error',
      'Child component input names must be valid JavaScript identifiers.',
      state.templatePath,
      attribute.span.line,
      attribute.span.column,
      {
        source: state.templateSource,
        span: attribute.span,
      },
    ),
  );
}

function diagnoseUnsupportedChildAttribute(
  attribute: TemplateAttribute,
  state: GenerateState,
): void {
  state.diagnostics.push(
    createDiagnostic(
      'VR012',
      'error',
      'Child component hosts support input bindings only in Phase 12C.',
      state.templatePath,
      attribute.span.line,
      attribute.span.column,
      {
        source: state.templateSource,
        span: attribute.span,
      },
    ),
  );
}

function createAttributeSourceContext(
  attribute: TemplateAttribute,
  state: GenerateState,
): ExpressionSourceContext {
  return {
    filePath: state.templatePath,
    source: state.templateSource,
    span: attribute.span,
    localIdentifiers: state.localIdentifiers,
    localSignalIdentifiers: state.localSignalIdentifiers,
  };
}

export function toComponentImportPath(tagName: string): string {
  return `./${tagName}${componentFileSuffix}`;
}

function toTitleCase(value: string): string {
  if (value.length === 0) {
    return '';
  }

  return `${value[0]?.toUpperCase() ?? ''}${value.slice(1)}`;
}
