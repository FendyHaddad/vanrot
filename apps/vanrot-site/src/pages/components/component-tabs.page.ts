import { uiPrimitiveType } from '@vanrot/ui';
import { componentDocs, type ComponentDoc } from '../../docs/component-docs.ts';
import { setupTabsPreview } from './component-interaction-preview.widget.ts';

export class ComponentTabsPage {
  constructor() {
    setupTabsPreview();
  }

  doc(): ComponentDoc {
    const doc = componentDocs.find((candidate) => candidate.primitive === uiPrimitiveType.tabs);

    if (doc !== undefined) {
      return doc;
    }

    throw new Error('Vanrot site requires Tabs component docs.');
  }
}
