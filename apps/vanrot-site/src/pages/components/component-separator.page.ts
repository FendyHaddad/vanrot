import { uiPrimitiveType } from '@vanrot/ui';
import { componentDocs, type ComponentDoc } from '../../docs/component-docs.ts';

export class ComponentSeparatorPage {
  doc(): ComponentDoc {
    const doc = componentDocs.find((candidate) => candidate.primitive === uiPrimitiveType.separator);

    if (doc !== undefined) {
      return doc;
    }

    throw new Error('Vanrot site requires Separator component docs.');
  }
}
