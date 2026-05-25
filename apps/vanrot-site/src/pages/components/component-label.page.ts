import { uiPrimitiveType } from '@vanrot/ui';
import { ComponentRegistryDocPage } from './component-registry-doc.ts';

export class ComponentLabelPage extends ComponentRegistryDocPage {
  constructor() {
    super(uiPrimitiveType.label);
  }
}
