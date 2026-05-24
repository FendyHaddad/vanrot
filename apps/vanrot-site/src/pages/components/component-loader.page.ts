import { uiPrimitiveType } from '@vanrot/ui';
import { componentDocs, type ComponentDoc } from '../../docs/component-docs.ts';

export class ComponentLoaderPage {
  doc(): ComponentDoc {
    const doc = componentDocs.find((candidate) => candidate.primitive === uiPrimitiveType.loader);

    if (doc !== undefined) {
      return doc;
    }

    throw new Error('Vanrot site requires Loader component docs.');
  }
}
