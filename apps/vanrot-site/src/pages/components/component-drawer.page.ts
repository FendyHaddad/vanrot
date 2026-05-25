import { uiPrimitiveType } from '@vanrot/ui';
import { componentDocs, type ComponentDoc } from '../../docs/component-docs.ts';

export class ComponentDrawerPage {
  doc(): ComponentDoc {
    const doc = componentDocs.find((candidate) => candidate.primitive === uiPrimitiveType.drawer);

    if (doc !== undefined) {
      return doc;
    }

    throw new Error('Vanrot site requires Drawer component docs.');
  }
}
