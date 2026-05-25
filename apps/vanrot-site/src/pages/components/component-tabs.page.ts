import { uiPrimitiveType } from '@vanrot/ui';
import { componentDocs, type ComponentDoc } from '../../docs/component-docs.ts';

export class ComponentTabsPage {
  doc(): ComponentDoc {
    const doc = componentDocs.find((candidate) => candidate.primitive === uiPrimitiveType.tabs);

    if (doc !== undefined) {
      return doc;
    }

    throw new Error('Vanrot site requires Tabs component docs.');
  }
}
