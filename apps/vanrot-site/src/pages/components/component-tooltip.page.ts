import { uiPrimitiveType } from '@vanrot/ui';
import { ComponentRegistryDocPage } from './component-registry-doc.ts';
import { setupTooltipPreview } from './component-interaction-preview.widget.ts';

// Tooltip component docs.
export class ComponentTooltipPage extends ComponentRegistryDocPage {
  constructor() {
    super(uiPrimitiveType.tooltip);
    setupTooltipPreview();
  }
}
