import {
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

  return {
    primitive,
    href: componentDocPath[primitive],
    title: copy.title,
    summary: copy.summary,
    usage: copy.usage,
    accessibility: copy.accessibility,
    api: `Selector ${metadata.selector}; native tag ${metadata.nativeTag}; tokens ${formatPrimitiveTokens(primitive)}.`,
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

function findPrimitiveDocCopy(primitive: UiPrimitiveType): {
  title: string;
  summary: string;
  usage: string;
  accessibility: string;
} {
  const copy = primitiveDocCopy.find((doc) => doc.primitive === primitive);

  if (copy === undefined) {
    throw new Error(`Missing Vanrot site primitive docs for ${primitive}.`);
  }

  return copy;
}
