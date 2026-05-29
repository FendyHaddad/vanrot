import { rewriteExpression } from '../expressions/rewrite-expression.js';
import type { ForBlockNode, IfBlockNode, TemplateNode } from '../template/ast.js';
import { quoteString } from './bindings.js';
import type { GenerateState } from './state.js';

export type GenerateTemplateNode = (
  node: TemplateNode,
  parentName: string,
  scopeAttribute: string,
  state: GenerateState,
) => void;

export function generateIfBlock(
  node: IfBlockNode,
  parentName: string,
  scopeAttribute: string,
  state: GenerateState,
  generateTemplateNode: GenerateTemplateNode,
): void {
  const rewritten = rewriteExpression(node.expression, {
    filePath: state.templatePath,
    source: state.templateSource,
    span: node.expressionSpan,
  });

  state.diagnostics.push(...rewritten.diagnostics);

  if (rewritten.expression === null) {
    return;
  }

  const markerName = state.ids.next('if-marker');
  const branchScopeName = state.ids.next('if-branch-scope');
  const branchNodesName = state.ids.next('if-branch-nodes');
  const fragmentName = state.ids.next('if-fragment');

  state.usesEffect = true;
  state.usesCleanupScopes = true;
  state.features.add('control-flow-if');
  state.features.add('expression-rewriting');
  state.lines.push(`  const ${markerName} = document.createComment(${quoteString('if')});`);
  state.lines.push(`  ${parentName}.append(${markerName});`);
  state.lines.push(`  let ${branchScopeName} = null;`);
  state.lines.push(`  let ${branchNodesName} = [];`);
  state.lines.push('  effect(() => {');
  state.lines.push(`    ${branchScopeName} = createCleanupScope();`);
  state.lines.push(`    const ${fragmentName} = document.createDocumentFragment();`);
  state.lines.push(`    if (${rewritten.expression}) {`);
  generateBranch(node.consequent, fragmentName, branchScopeName, scopeAttribute, state, generateTemplateNode);
  state.lines.push('    } else {');
  generateBranch(node.alternate, fragmentName, branchScopeName, scopeAttribute, state, generateTemplateNode);
  state.lines.push('    }');
  state.lines.push(`    ${branchNodesName} = Array.from(${fragmentName}.childNodes);`);
  state.lines.push(`    ${markerName}.after(${fragmentName});`);
  state.lines.push('    return () => {');
  state.lines.push(`      disposeCleanupScope(${branchScopeName});`);
  state.lines.push(`      for (const node of ${branchNodesName}) {`);
  state.lines.push('        node.remove();');
  state.lines.push('      }');
  state.lines.push(`      ${branchNodesName} = [];`);
  state.lines.push('    };');
  state.lines.push('  });');
}

export function generateForBlock(
  node: ForBlockNode,
  parentName: string,
  scopeAttribute: string,
  state: GenerateState,
  generateTemplateNode: GenerateTemplateNode,
): void {
  const rewrittenIterable = rewriteExpression(node.iterableExpression, {
    filePath: state.templatePath,
    source: state.templateSource,
    localIdentifiers: state.localIdentifiers,
    localSignalIdentifiers: state.localSignalIdentifiers,
    span: node.expressionSpan,
  });
  const rewrittenTrack = rewriteExpression(node.trackExpression, {
    filePath: state.templatePath,
    source: state.templateSource,
    span: node.expressionSpan,
    localIdentifiers: [...state.localIdentifiers, node.itemName],
    localSignalIdentifiers: state.localSignalIdentifiers,
  });

  state.diagnostics.push(...rewrittenIterable.diagnostics, ...rewrittenTrack.diagnostics);

  if (rewrittenIterable.expression === null || rewrittenTrack.expression === null) {
    return;
  }

  const markerName = state.ids.next('for-marker');
  const loopScopeName = state.ids.next('for-scope');
  const recordsName = state.ids.next('for-records');
  const emptyScopeName = state.ids.next('for-empty-scope');
  const emptyNodesName = state.ids.next('for-empty-nodes');
  const itemsName = state.ids.next('for-items');
  const keysName = state.ids.next('for-keys');
  const previousNodeName = state.ids.next('for-previous-node');
  const itemValueName = state.ids.next('for-item');
  const keyName = state.ids.next('for-key');
  const recordName = state.ids.next('for-record');
  const itemScopeName = state.ids.next('for-item-scope');
  const itemSignalName = state.ids.next('for-item-signal');
  const fragmentName = state.ids.next('for-fragment');
  const removedKeyName = state.ids.next('for-removed-key');
  const removedRecordName = state.ids.next('for-removed-record');
  const nodeName = state.ids.next('for-node');

  state.usesEffect = true;
  state.usesSignal = true;
  state.usesCleanupScopes = true;
  state.usesRegisterCleanup = true;
  state.features.add('control-flow-for');
  state.features.add('expression-rewriting');
  state.lines.push(`  const ${markerName} = document.createComment(${quoteString('for')});`);
  state.lines.push(`  ${parentName}.append(${markerName});`);
  state.lines.push(`  const ${loopScopeName} = createCleanupScope();`);
  state.lines.push(`  const ${recordsName} = new Map();`);
  state.lines.push(`  let ${emptyScopeName} = null;`);
  state.lines.push(`  let ${emptyNodesName} = [];`);
  state.lines.push(`  runWithCleanupScope(${loopScopeName}, () => {`);
  state.lines.push('    registerCleanup(() => {');
  generateDisposeRecords(recordsName, removedKeyName, removedRecordName, nodeName, state, '      ');
  generateDisposeEmptyBranch(emptyScopeName, emptyNodesName, nodeName, state, '      ');
  state.lines.push('    });');
  state.lines.push('    effect(() => {');
  state.lines.push(`      runWithCleanupScope(${loopScopeName}, () => {`);
  state.lines.push(`        const ${itemsName} = Array.from(${rewrittenIterable.expression} ?? []);`);
  state.lines.push(`        const ${keysName} = new Set();`);
  state.lines.push(`        let ${previousNodeName} = ${markerName};`);
  state.lines.push(`        if (${itemsName}.length === 0) {`);
  generateDisposeRecords(recordsName, removedKeyName, removedRecordName, nodeName, state, '          ');
  state.lines.push(`      if (${emptyScopeName} === null) {`);
  state.lines.push(`        ${emptyScopeName} = createCleanupScope();`);
  state.lines.push(`        const ${fragmentName} = document.createDocumentFragment();`);
  generateScopedNodes(node.empty, fragmentName, emptyScopeName, scopeAttribute, state, generateTemplateNode, [], []);
  state.lines.push(`        ${emptyNodesName} = Array.from(${fragmentName}.childNodes);`);
  state.lines.push(`        ${markerName}.after(${fragmentName});`);
  state.lines.push('      }');
  state.lines.push('      return;');
  state.lines.push('    }');
  generateDisposeEmptyBranch(emptyScopeName, emptyNodesName, nodeName, state, '        ');
  state.lines.push(`        for (const ${itemValueName} of ${itemsName}) {`);
  state.lines.push(`      const ${node.itemName} = ${itemValueName};`);
  state.lines.push(`      const ${keyName} = ${rewrittenTrack.expression};`);
  state.lines.push(`      ${keysName}.add(${keyName});`);
  state.lines.push(`      let ${recordName} = ${recordsName}.get(${keyName});`);
  state.lines.push(`      if (${recordName} === undefined) {`);
  state.lines.push(`        const ${itemScopeName} = createCleanupScope();`);
  state.lines.push(`        const ${itemSignalName} = signal(${itemValueName});`);
  state.lines.push(`        const ${node.itemName} = ${itemSignalName};`);
  state.lines.push(`        const ${fragmentName} = document.createDocumentFragment();`);
  generateScopedNodes(node.body, fragmentName, itemScopeName, scopeAttribute, state, generateTemplateNode, [], [node.itemName]);
  state.lines.push(`        ${recordName} = {`);
  state.lines.push(`          item: ${itemSignalName},`);
  state.lines.push(`          scope: ${itemScopeName},`);
  state.lines.push(`          nodes: Array.from(${fragmentName}.childNodes),`);
  state.lines.push('        };');
  state.lines.push(`        ${recordsName}.set(${keyName}, ${recordName});`);
  state.lines.push('      } else {');
  state.lines.push(`        ${recordName}.item.set(${itemValueName});`);
  state.lines.push('      }');
  state.lines.push(`      ${previousNodeName}.after(...${recordName}.nodes);`);
  state.lines.push(`      ${previousNodeName} = ${recordName}.nodes[${recordName}.nodes.length - 1] ?? ${previousNodeName};`);
  state.lines.push('    }');
  state.lines.push(`    for (const [${removedKeyName}, ${removedRecordName}] of [...${recordsName}]) {`);
  state.lines.push(`      if (${keysName}.has(${removedKeyName})) {`);
  state.lines.push('        continue;');
  state.lines.push('      }');
  state.lines.push(`      disposeCleanupScope(${removedRecordName}.scope);`);
  state.lines.push(`      for (const ${nodeName} of ${removedRecordName}.nodes) {`);
  state.lines.push(`        ${nodeName}.remove();`);
  state.lines.push('      }');
  state.lines.push(`      ${recordsName}.delete(${removedKeyName});`);
  state.lines.push('    }');
  state.lines.push('      });');
  state.lines.push('    });');
  state.lines.push('  });');
}

function generateBranch(
  nodes: readonly TemplateNode[],
  fragmentName: string,
  branchScopeName: string,
  scopeAttribute: string,
  state: GenerateState,
  generateTemplateNode: GenerateTemplateNode,
): void {
  state.lines.push(`      runWithCleanupScope(${branchScopeName}, () => {`);

  for (const child of nodes) {
    generateTemplateNode(child, fragmentName, scopeAttribute, state);
  }

  state.lines.push('      });');
}

function generateScopedNodes(
  nodes: readonly TemplateNode[],
  fragmentName: string,
  cleanupScopeName: string,
  scopeAttribute: string,
  state: GenerateState,
  generateTemplateNode: GenerateTemplateNode,
  localIdentifiers: readonly string[],
  localSignalIdentifiers: readonly string[],
): void {
  const previousLocalIdentifiers = state.localIdentifiers;
  const previousLocalSignalIdentifiers = state.localSignalIdentifiers;

  state.localIdentifiers = [...previousLocalIdentifiers, ...localIdentifiers];
  state.localSignalIdentifiers = [...previousLocalSignalIdentifiers, ...localSignalIdentifiers];
  state.lines.push(`        runWithCleanupScope(${cleanupScopeName}, () => {`);

  for (const child of nodes) {
    generateTemplateNode(child, fragmentName, scopeAttribute, state);
  }

  state.lines.push('        });');
  state.localIdentifiers = previousLocalIdentifiers;
  state.localSignalIdentifiers = previousLocalSignalIdentifiers;
}

function generateDisposeRecords(
  recordsName: string,
  keyName: string,
  recordName: string,
  nodeName: string,
  state: GenerateState,
  indent: string,
): void {
  state.lines.push(`${indent}for (const [${keyName}, ${recordName}] of [...${recordsName}]) {`);
  state.lines.push(`${indent}  disposeCleanupScope(${recordName}.scope);`);
  state.lines.push(`${indent}  for (const ${nodeName} of ${recordName}.nodes) {`);
  state.lines.push(`${indent}    ${nodeName}.remove();`);
  state.lines.push(`${indent}  }`);
  state.lines.push(`${indent}  ${recordsName}.delete(${keyName});`);
  state.lines.push(`${indent}}`);
}

function generateDisposeEmptyBranch(
  emptyScopeName: string,
  emptyNodesName: string,
  nodeName: string,
  state: GenerateState,
  indent: string,
): void {
  state.lines.push(`${indent}if (${emptyScopeName} !== null) {`);
  state.lines.push(`${indent}  disposeCleanupScope(${emptyScopeName});`);
  state.lines.push(`${indent}  ${emptyScopeName} = null;`);
  state.lines.push(`${indent}  for (const ${nodeName} of ${emptyNodesName}) {`);
  state.lines.push(`${indent}    ${nodeName}.remove();`);
  state.lines.push(`${indent}  }`);
  state.lines.push(`${indent}  ${emptyNodesName} = [];`);
  state.lines.push(`${indent}}`);
}
