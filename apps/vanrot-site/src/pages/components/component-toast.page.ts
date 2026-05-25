import { uiPrimitiveType } from '@vanrot/ui';
import { componentDocs, type ComponentDoc } from '../../docs/component-docs.ts';
import { setupToastPreview } from './component-interaction-preview.widget.ts';

export class ComponentToastPage {
  constructor() {
    setupToastPreview();
  }

  doc(): ComponentDoc {
    const doc = componentDocs.find((candidate) => candidate.primitive === uiPrimitiveType.toast);

    if (doc !== undefined) {
      return doc;
    }

    throw new Error('Vanrot site requires Toast component docs.');
  }
}
