import { CompletionItemKind, type CompletionItem } from 'vscode-languageserver';
import type { CompletionContext } from './completion-context.js';
import type { ComponentEntry } from '../project/component-index.js';
import type { RouteEntry } from '../project/route-index.js';

export const vanrotElements = ['vr', 'vr-outlet', 'vr-router'] as const;

export interface CompletionIndexes {
  routes: readonly RouteEntry[];
  components: readonly ComponentEntry[];
}

export function buildCompletions(
  context: CompletionContext,
  indexes: CompletionIndexes,
): CompletionItem[] {
  if (context.kind === 'route-ref') {
    return indexes.routes.map((route) => ({
      label: route.name,
      kind: CompletionItemKind.EnumMember,
    }));
  }

  if (context.kind === 'tag-name') {
    const elements = vanrotElements.map((name) => ({
      label: name,
      kind: CompletionItemKind.Class,
    }));
    const components = indexes.components.map((component) => ({
      label: component.tagName,
      kind: CompletionItemKind.Class,
      detail: component.className,
    }));

    return [...elements, ...components];
  }

  if (context.kind === 'attribute-name') {
    return [
      {
        label: 'route.',
        kind: CompletionItemKind.Property,
      },
    ];
  }

  return [];
}
