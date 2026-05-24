import { uiPrimitiveType } from '@vanrot/ui';
import { componentDocs, type ComponentDoc } from '../../docs/component-docs.ts';

export class ComponentBadgePage {
  doc(): ComponentDoc {
    const doc = componentDocs.find((candidate) => candidate.primitive === uiPrimitiveType.badge);

    if (doc !== undefined) {
      return doc;
    }

    throw new Error('Vanrot site requires Badge component docs.');
  }
}
