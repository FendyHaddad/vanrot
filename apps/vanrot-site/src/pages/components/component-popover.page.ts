import { uiPrimitiveType } from '@vanrot/ui';
import { ComponentRegistryDocPage } from './component-registry-doc.ts';
import { setupOverlayPreview } from './component-interaction-preview.widget.ts';

// Popover component docs.
export class ComponentPopoverPage extends ComponentRegistryDocPage {
  constructor() {
    super(uiPrimitiveType.popover);
    setupOverlayPreview();
  }
}
