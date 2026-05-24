import {
  uiPrimitive,
  uiPrimitiveOrder,
  type UiPrimitiveType,
} from '@vanrot/ui';
import type { CompileFeature } from '../api/types.js';

export interface CompilerUiElement {
  tagName: string;
  nativeTagName: string;
  baseClass: string;
  defaultVariant: string;
  variants: readonly string[];
  feature: CompileFeature;
}

const uiPrimitiveFeature = {
  button: 'ui-button',
  card: 'ui-card',
  badge: 'ui-badge',
  avatar: 'ui-avatar',
  alert: 'ui-alert',
  loader: 'ui-loader',
  skeleton: 'ui-skeleton',
  separator: 'ui-separator',
} as const satisfies Record<UiPrimitiveType, CompileFeature>;

export const compilerUiElement = uiPrimitiveOrder.reduce<Record<UiPrimitiveType, CompilerUiElement>>(
  (catalog, primitive) => {
    const metadata = uiPrimitive[primitive];

    catalog[primitive] = {
      tagName: metadata.selector,
      nativeTagName: metadata.nativeTag,
      baseClass: metadata.baseClass,
      defaultVariant: metadata.variants[0] ?? 'default',
      variants: metadata.variants,
      feature: uiPrimitiveFeature[primitive],
    };

    return catalog;
  },
  {} as Record<UiPrimitiveType, CompilerUiElement>,
);

export function findCompilerUiElement(tagName: string): CompilerUiElement | null {
  const element = Object.values(compilerUiElement).find((candidate) => candidate.tagName === tagName);

  return element ?? null;
}

export function isVanrotUiTag(tagName: string): boolean {
  return tagName.startsWith('vr-');
}

export function createUnsupportedVanrotUiMessage(tagName: string): string {
  return `<${tagName}> is not available in UI October yet. Add the primitive through a Phase 16 UI slice before using it.`;
}

export function createInvalidUiVariantMessage(
  tagName: string,
  variant: string,
  variants: readonly string[],
): string {
  return `Invalid variant "${variant}" for <${tagName}>. Supported variants: ${variants.join(', ')}.`;
}
