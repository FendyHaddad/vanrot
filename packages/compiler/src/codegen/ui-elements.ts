import type { CompileFeature } from '../api/types.js';

export interface CompilerUiElement {
  tagName: string;
  nativeTagName: string;
  baseClass: string;
  feature: CompileFeature;
}

export const compilerUiElement = {
  button: {
    tagName: 'vr-button',
    nativeTagName: 'button',
    baseClass: 'vr-button',
    feature: 'ui-button',
  },
} as const satisfies Record<string, CompilerUiElement>;

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
