import postcssModule from 'postcss';
import selectorParserModule from 'postcss-selector-parser';
import type { CompileDiagnostic, SourceMapping } from '../api/types.js';
import { createGeneratedMapping } from '../codegen/mappings.js';
import { createDiagnostic } from '../diagnostics/diagnostics.js';
import { createSourceSpan, type SourceSpan } from '../source/location.js';

interface ScopeCssResult {
  css: string;
  diagnostics: CompileDiagnostic[];
  mappings: SourceMapping[];
}

interface PostcssRoot {
  walkRules(callback: (rule: PostcssRule) => void): void;
  toString(): string;
}

interface PostcssRule {
  selector: string;
  source?: {
    start?: {
      offset?: number;
      line?: number;
      column?: number;
    };
  };
}

interface PostcssModule {
  parse(css: string, options?: { from?: string }): PostcssRoot;
}

interface SelectorParserModule {
  (processor: (root: SelectorRoot) => void): {
    processSync(selector: string): string;
  };
  attribute(options: { attribute: string }): SelectorNode;
}

interface SelectorRoot {
  nodes: SelectorContainer[];
}

interface SelectorContainer extends SelectorNode {
  nodes: SelectorNode[];
  append(node: SelectorNode): void;
  insertAfter(oldNode: SelectorNode, newNode: SelectorNode): void;
  prepend(node: SelectorNode): void;
}

interface SelectorNode {
  type: string;
  value?: string;
  attribute?: string;
  parent?: SelectorContainer;
  nodes?: SelectorNode[];
  replaceWith(...nodes: SelectorNode[]): SelectorNode;
}

const postcss = postcssModule as unknown as PostcssModule;
const selectorParser = selectorParserModule as unknown as SelectorParserModule;

class UnsupportedCssSelectorError extends Error {}

export function scopeCss(styleSource: string, scopeAttribute: string, stylePath: string): ScopeCssResult {
  const diagnostics: CompileDiagnostic[] = [];
  const mappings: SourceMapping[] = [];
  const root = postcss.parse(styleSource, { from: stylePath });

  root.walkRules((rule) => {
    const originalSelector = rule.selector;
    const selectorSpan = createSelectorSourceSpan(styleSource, stylePath, rule, originalSelector);

    if (rule.selector.includes(':host-context(')) {
      diagnostics.push(createCssSelectorDiagnostic(styleSource, stylePath, rule));
      return;
    }

    try {
      rule.selector = selectorParser((selectors) => {
        for (const selector of selectors.nodes) {
          scopeSelector(selector, scopeAttribute);
        }
      }).processSync(rule.selector);
      mappings.push(
        createGeneratedMapping(
          'css',
          rule.source?.start?.line ?? mappings.length + 1,
          rule.source?.start?.column ?? 1,
          selectorSpan,
        ),
      );
    } catch {
      diagnostics.push(createCssSelectorDiagnostic(styleSource, stylePath, rule));
    }
  });

  return {
    css: root.toString(),
    diagnostics,
    mappings,
  };
}

function scopeSelector(selector: SelectorContainer, scopeAttribute: string): void {
  if (replaceGlobalSelector(selector)) {
    return;
  }

  replaceHostSelector(selector, scopeAttribute);
  scopeNormalCompounds(selector, scopeAttribute);
}

function replaceGlobalSelector(selector: SelectorContainer): boolean {
  const globalPseudo = selector.nodes.find(isGlobalPseudo);

  if (globalPseudo === undefined) {
    return false;
  }

  const globalSelectors = globalPseudo.nodes;

  if (globalSelectors === undefined) {
    throw new UnsupportedCssSelectorError();
  }

  if (globalSelectors.length !== 1) {
    throw new UnsupportedCssSelectorError();
  }

  const globalSelector = globalSelectors[0];

  if (globalSelector === undefined) {
    throw new UnsupportedCssSelectorError();
  }

  const globalSelectorNodes = globalSelector.nodes;

  if (globalSelectorNodes === undefined) {
    throw new UnsupportedCssSelectorError();
  }

  globalPseudo.replaceWith(...globalSelectorNodes);
  return true;
}

function replaceHostSelector(selector: SelectorContainer, scopeAttribute: string): void {
  const hostPseudo = selector.nodes.find(isHostPseudo);

  if (hostPseudo === undefined) {
    return;
  }

  const scopeNode = selectorParser.attribute({ attribute: scopeAttribute });
  const hostSelector = hostPseudo.nodes?.[0];

  if (hostSelector === undefined) {
    hostPseudo.replaceWith(scopeNode);
    return;
  }

  const hostSelectorNodes = hostSelector.nodes;

  if (hostSelectorNodes === undefined) {
    hostPseudo.replaceWith(scopeNode);
    return;
  }

  hostPseudo.replaceWith(scopeNode, ...hostSelectorNodes);
}

function scopeNormalCompounds(selector: SelectorContainer, scopeAttribute: string): void {
  const compounds: SelectorNode[][] = [];
  let current: SelectorNode[] = [];

  for (const node of [...selector.nodes]) {
    if (node.type === 'combinator') {
      addCompound(compounds, current);
      current = [];
      continue;
    }

    current.push(node);
  }

  addCompound(compounds, current);

  for (const compound of compounds) {
    scopeCompound(selector, compound, scopeAttribute);
  }
}

function addCompound(compounds: SelectorNode[][], compound: SelectorNode[]): void {
  if (compound.length === 0) {
    return;
  }

  compounds.push(compound);
}

function scopeCompound(
  selector: SelectorContainer,
  compound: readonly SelectorNode[],
  scopeAttribute: string,
): void {
  if (compound.some((node) => isScopeAttribute(node, scopeAttribute))) {
    return;
  }

  const scopeNode = selectorParser.attribute({ attribute: scopeAttribute });
  const target = [...compound].reverse().find(isScopeTarget);

  if (target === undefined) {
    selector.append(scopeNode);
    return;
  }

  const parent = target.parent ?? selector;
  parent.insertAfter(target, scopeNode);
}

function isScopeTarget(node: SelectorNode): boolean {
  return (
    node.type === 'tag' ||
    node.type === 'class' ||
    node.type === 'id' ||
    node.type === 'attribute' ||
    isPseudoClass(node) ||
    node.type === 'universal'
  );
}

function isScopeAttribute(node: SelectorNode, scopeAttribute: string): boolean {
  return node.type === 'attribute' && node.attribute === scopeAttribute;
}

function isGlobalPseudo(node: SelectorNode): boolean {
  return node.type === 'pseudo' && node.value === ':global';
}

function isHostPseudo(node: SelectorNode): boolean {
  return node.type === 'pseudo' && node.value === ':host';
}

function isPseudoClass(node: SelectorNode): boolean {
  return node.type === 'pseudo' && node.value?.startsWith('::') !== true;
}

function getSelectorSourceOffset(styleSource: string, selector: string, fallbackOffset: number): number {
  const selectorOffset = styleSource.indexOf(selector, fallbackOffset);

  if (selectorOffset === -1) {
    return fallbackOffset;
  }

  return selectorOffset;
}

function createCssSelectorDiagnostic(
  styleSource: string,
  stylePath: string,
  rule: PostcssRule,
): CompileDiagnostic {
  const selectorSourceOffset = getSelectorSourceOffset(
    styleSource,
    rule.selector,
    rule.source?.start?.offset ?? 0,
  );

  return createDiagnostic(
    'VR008',
    'error',
    undefined,
    stylePath,
    1,
    1,
    {
      source: styleSource,
      span: createSourceSpan(
        styleSource,
        stylePath,
        selectorSourceOffset,
        selectorSourceOffset + rule.selector.length,
      ),
    },
  );
}

function createSelectorSourceSpan(
  styleSource: string,
  stylePath: string,
  rule: PostcssRule,
  selector: string,
): SourceSpan {
  const selectorSourceOffset = getSelectorSourceOffset(
    styleSource,
    selector,
    rule.source?.start?.offset ?? 0,
  );

  return createSourceSpan(
    styleSource,
    stylePath,
    selectorSourceOffset,
    selectorSourceOffset + selector.length,
  );
}
