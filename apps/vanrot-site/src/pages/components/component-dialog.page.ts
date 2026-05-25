import { uiPrimitiveType } from '@vanrot/ui';
import { componentDocs, type ComponentDoc } from '../../docs/component-docs.ts';
import { setupOverlayPreview } from './component-interaction-preview.widget.ts';

export class ComponentDialogPage {
  constructor() {
    setupOverlayPreview();
  }

  doc(): ComponentDoc {
    const doc = componentDocs.find((candidate) => candidate.primitive === uiPrimitiveType.dialog);

    if (doc !== undefined) {
      return doc;
    }

    throw new Error('Vanrot site requires Dialog component docs.');
  }
}
