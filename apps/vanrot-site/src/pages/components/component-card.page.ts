import { uiPrimitiveType } from '@vanrot/ui';
import { componentDocs, type ComponentDoc } from '../../docs/component-docs.ts';

export class ComponentCardPage {
  doc(): ComponentDoc {
    const doc = componentDocs.find((candidate) => candidate.primitive === uiPrimitiveType.card);

    if (doc !== undefined) {
      return doc;
    }

    throw new Error('Vanrot site requires Card component docs.');
  }
}
