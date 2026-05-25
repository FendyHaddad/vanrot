import {
  uiComponentRegistry,
  uiPrimitive,
  uiPrimitiveOrder,
  uiPrimitiveTokenGroup,
  type UiPrimitiveTokenGroup,
  type UiPrimitiveType,
} from '@vanrot/ui';
import type { CompileFeature } from '../api/types.js';

export interface CompilerUiElement {
  tagName: string;
  nativeTagName: string;
  baseClass: string;
  tokenGroups: Readonly<Record<string, UiPrimitiveTokenGroup>>;
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
  layout: 'ui-layout',
  container: 'ui-container',
  section: 'ui-section',
  grid: 'ui-grid',
  stack: 'ui-stack',
  header: 'ui-header',
  footer: 'ui-footer',
  sidebar: 'ui-sidebar',
  nav: 'ui-nav',
  breadcrumb: 'ui-breadcrumb',
  img: 'ui-img',
  src: 'ui-src',
  form: 'ui-form',
  formField: 'ui-form-field',
  label: 'ui-label',
  input: 'ui-input',
  textarea: 'ui-textarea',
  select: 'ui-select',
  checkbox: 'ui-checkbox',
  radioGroup: 'ui-radio-group',
  radio: 'ui-radio',
  switch: 'ui-switch',
  slider: 'ui-slider',
  table: 'ui-table',
  tableHeader: 'ui-table-header',
  tableBody: 'ui-table-body',
  tableRow: 'ui-table-row',
  tableHead: 'ui-table-head',
  tableCell: 'ui-table-cell',
  tableFooter: 'ui-table-footer',
  tableCaption: 'ui-table-caption',
  pagination: 'ui-pagination',
  list: 'ui-list',
  listItem: 'ui-list-item',
  stat: 'ui-stat',
  emptyState: 'ui-empty-state',
  dialog: 'ui-dialog',
  drawer: 'ui-drawer',
  dropdown: 'ui-dropdown',
  tabs: 'ui-tabs',
  toast: 'ui-toast',
} as const satisfies Record<UiPrimitiveType, CompileFeature>;

export const compilerUiElement = uiPrimitiveOrder.reduce<Record<UiPrimitiveType, CompilerUiElement>>(
  (catalog, primitive) => {
    const metadata = uiPrimitive[primitive];

    catalog[primitive] = {
      tagName: metadata.selector,
      nativeTagName: metadata.nativeTag,
      baseClass: metadata.baseClass,
      tokenGroups: uiPrimitiveTokenGroup[primitive],
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

export interface CompilerUiAnatomyElement {
  tagName: string;
  nativeTagName: string;
  baseClass: string;
  role?: string;
  owner: UiPrimitiveType;
  feature: CompileFeature;
}

export const compilerUiAnatomyElement = Object.fromEntries(
  Object.values(uiComponentRegistry).flatMap((component) =>
    component.anatomy.map((anatomy) => [
      anatomy.selector,
      {
        tagName: anatomy.selector,
        nativeTagName: anatomy.nativeTag,
        baseClass: anatomy.baseClass,
        role: anatomy.role,
        owner: component.type as UiPrimitiveType,
        feature: uiPrimitiveFeature[component.type as UiPrimitiveType],
      },
    ]),
  ),
) as Record<string, CompilerUiAnatomyElement>;

export function findCompilerUiAnatomyElement(tagName: string): CompilerUiAnatomyElement | null {
  return compilerUiAnatomyElement[tagName] === undefined ? null : compilerUiAnatomyElement[tagName];
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
  tokens: readonly string[],
): string {
  return `Invalid variant "${variant}" for <${tagName}>. Supported variants: ${tokens.join(', ')}.`;
}
