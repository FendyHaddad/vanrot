import { CompletionItemKind, type CompletionItem } from 'vscode-languageserver';
import type { CompletionContext } from './completion-context.js';
import type { ComponentEntry } from '../project/component-index.js';
import type { RouteEntry } from '../project/route-index.js';
import { emptyVanrotWebTypes, type VanrotWebTypesSummary } from '../project/web-types.js';

export const vanrotElements = ['vr', 'vr-outlet', 'vr-router'] as const;

export interface CompletionIndexes {
  routes: readonly RouteEntry[];
  components: readonly ComponentEntry[];
  webTypes?: VanrotWebTypesSummary;
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
    const webTypes = webTypesSummary(indexes).tags.map((tag) => ({
      label: tag.name,
      kind: CompletionItemKind.Class,
      detail: tag.sourcePath,
      documentation: tag.description ?? undefined,
    }));

    return [...elements, ...components, ...webTypes];
  }

  if (context.kind === 'attribute-name') {
    return [
      {
        label: 'route.',
        kind: CompletionItemKind.Property,
      },
      ...indexes.routes.map((route) => ({
        label: `route.${route.name}`,
        kind: CompletionItemKind.Property,
        detail: route.path ?? route.page ?? route.span.filePath,
      })),
      ...webTypesSummary(indexes).attributes.map((attribute) => ({
        label: attribute.name,
        kind: CompletionItemKind.Property,
        detail: attribute.sourcePath,
        documentation: attribute.description ?? undefined,
      })),
    ];
  }

  return [];
}

function webTypesSummary(indexes: CompletionIndexes): VanrotWebTypesSummary {
  return indexes.webTypes ?? emptyVanrotWebTypes();
}
