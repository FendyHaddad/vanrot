import { uiPrimitiveType } from '@vanrot/ui';
import { ComponentRegistryDocPage } from './component-registry-doc.ts';
import { setupCommandMenuPreview } from './component-interaction-preview.widget.ts';

// Command Menu component docs.
export class ComponentCommandMenuPage extends ComponentRegistryDocPage {
  constructor() {
    super(uiPrimitiveType.commandMenu);
    setupCommandMenuPreview();
  }
}
