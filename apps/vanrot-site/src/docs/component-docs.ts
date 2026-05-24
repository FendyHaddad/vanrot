import { uiPrimitive, uiPrimitiveOrder, type UiPrimitiveType } from '@vanrot/ui';
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
    href: metadata.docsPath,
    title: copy.title,
    summary: copy.summary,
    usage: copy.usage,
    accessibility: copy.accessibility,
    api: `Selector ${metadata.selector}; native tag ${metadata.nativeTag}; variants ${metadata.variants.join(', ')}.`,
  };
});

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
