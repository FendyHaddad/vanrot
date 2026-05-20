import { createRequire } from 'node:module';
import type { CompileDiagnostic } from '../api/types.js';
import { createDiagnostic } from '../diagnostics/diagnostics.js';

interface ScopeCssResult {
  css: string;
  diagnostics: CompileDiagnostic[];
}

interface PostcssRoot {
  walkRules(callback: (rule: PostcssRule) => void): void;
  toString(): string;
}

interface PostcssRule {
  selector: string;
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
  parent?: SelectorContainer;
}

const require = createRequire(import.meta.url);
const postcss = require('postcss') as PostcssModule;
const selectorParser = require('postcss-selector-parser') as SelectorParserModule;

export function scopeCss(styleSource: string, scopeAttribute: string, stylePath: string): ScopeCssResult {
  const diagnostics: CompileDiagnostic[] = [];
  const root = postcss.parse(styleSource, { from: stylePath });

  root.walkRules((rule) => {
    if (rule.selector.includes(':global(')) {
      diagnostics.push(
        createDiagnostic(
          'VR008',
          'error',
          'Global CSS escapes are not supported by the Phase 3 compiler.',
          stylePath,
        ),
      );
      return;
    }

    try {
      rule.selector = selectorParser((selectors) => {
        for (const selector of selectors.nodes) {
          scopeSelector(selector, scopeAttribute);
        }
      }).processSync(rule.selector);
    } catch {
      diagnostics.push(
        createDiagnostic('VR008', 'error', 'CSS selector cannot be scoped by the MVP compiler.', stylePath),
      );
    }
  });

  return {
    css: root.toString(),
    diagnostics,
  };
}

function scopeSelector(selector: SelectorContainer, scopeAttribute: string): void {
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
    node.type === 'universal'
  );
}
