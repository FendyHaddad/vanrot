import { uiPrimitiveType } from '@vanrot/ui';
import { componentDocs, type ComponentDoc } from '../../docs/component-docs.ts';

export class ComponentAlertPage {
  doc(): ComponentDoc {
    const doc = componentDocs.find((candidate) => candidate.primitive === uiPrimitiveType.alert);

    if (doc !== undefined) {
      return doc;
    }

    throw new Error('Vanrot site requires Alert component docs.');
  }
}
