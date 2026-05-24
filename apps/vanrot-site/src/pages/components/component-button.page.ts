import { uiPrimitiveType } from '@vanrot/ui';
import { componentDocs, type ComponentDoc } from '../../docs/component-docs.ts';

export class ComponentButtonPage {
  doc(): ComponentDoc {
    const doc = componentDocs.find((candidate) => candidate.primitive === uiPrimitiveType.button);

    if (doc !== undefined) {
      return doc;
    }

    throw new Error('Vanrot site requires Button component docs.');
  }
}
