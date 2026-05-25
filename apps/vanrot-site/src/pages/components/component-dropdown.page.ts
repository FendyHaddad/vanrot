import { uiPrimitiveType } from '@vanrot/ui';
import { componentDocs, type ComponentDoc } from '../../docs/component-docs.ts';
import { setupOverlayPreview } from './component-interaction-preview.widget.ts';

export class ComponentDropdownPage {
  constructor() {
    setupOverlayPreview();
  }

  doc(): ComponentDoc {
    const doc = componentDocs.find((candidate) => candidate.primitive === uiPrimitiveType.dropdown);

    if (doc !== undefined) {
      return doc;
    }

    throw new Error('Vanrot site requires Dropdown component docs.');
  }
}
