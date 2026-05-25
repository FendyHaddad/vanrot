import {
  getUiComponentRegistryItem,
  uiPrimitive,
  uiPrimitiveOrder,
  uiPrimitiveTokenGroup,
  type UiPrimitiveType,
} from '@vanrot/ui';
import { componentDocPath } from './component-doc-paths.ts';
import { primitiveDocCopy } from './site-data.ts';

export interface ComponentDoc {
  primitive: UiPrimitiveType;
  href: string;
  title: string;
  summary: string;
  usage: string;
  accessibility: string;
  api: string;
}

export const componentDocs: readonly ComponentDoc[] = uiPrimitiveOrder.map((primitive) => {
  const metadata = uiPrimitive[primitive];
  const copy = findPrimitiveDocCopy(primitive);
  const registryItem = getUiComponentRegistryItem(primitive);
  const api = registryItem === undefined
    ? `Selector ${metadata.selector}; native tag ${metadata.nativeTag}; tokens ${formatPrimitiveTokens(primitive)}.`
    : formatRegistryApi(registryItem);

  return {
    primitive,
    href: componentDocPath[primitive],
    title: copy.title,
    summary: copy.summary,
    usage: copy.usage,
    accessibility: copy.accessibility,
    api,
  };
}).sort((left, right) => left.title.localeCompare(right.title));

function formatPrimitiveTokens(primitive: UiPrimitiveType): string {
  const tokenGroups = uiPrimitiveTokenGroup[primitive];
  const tokens = Object.entries(tokenGroups).flatMap(([groupName, tokenGroup]) =>
    tokenGroup.tokens.map((token) => `${groupName}.${token}`),
  );

  if (tokens.length === 0) {
    return 'none';
  }

  return tokens.join(', ');
}

function formatRegistryApi(registryItem: NonNullable<ReturnType<typeof getUiComponentRegistryItem>>): string {
  const tokenGroups = Object.values(registryItem.tokens);
  const tokens = tokenGroups.flatMap((group) =>
    group.tokens.map((token) => `${group.name}.${token}`),
  );
  const booleans = registryItem.booleans.map((attribute) => attribute.name);
  const openAttributes = registryItem.openAttributes.map((attribute) => attribute.name);

  return [
    `Selector ${registryItem.selector}; native tag ${registryItem.nativeTag}.`,
    tokens.length > 0 ? `Dotted tokens: ${tokens.join(', ')}.` : 'Dotted tokens: none.',
    booleans.length > 0 ? `Booleans: ${booleans.join(', ')}.` : '',
    openAttributes.length > 0 ? `Open attributes: ${openAttributes.join(', ')}.` : '',
  ]
    .filter((line) => line.length > 0)
    .join(' ');
}

function findPrimitiveDocCopy(primitive: UiPrimitiveType): {
  title: string;
  summary: string;
  usage: string;
  accessibility: string;
} {
  const copy = primitiveDocCopy.find((doc) => doc.primitive === primitive);

  if (copy !== undefined) {
    return copy;
  }

  const registryItem = getUiComponentRegistryItem(primitive);

  if (registryItem === undefined) {
    throw new Error(`Missing Vanrot site primitive docs for ${primitive}.`);
  }

  const title = registryItem.selector
    .replace('vr-', '')
    .split('-')
    .map((part) => `${part[0]?.toUpperCase() ?? ''}${part.slice(1)}`)
    .join(' ');

  return {
    title,
    summary: `${registryItem.selector} is a Phase 16E ${registryItem.category} primitive.`,
    usage: registryItem.examples[0]?.code ?? `<${registryItem.selector}></${registryItem.selector}>`,
    accessibility: registryItem.accessibility.join(' '),
  };
}
