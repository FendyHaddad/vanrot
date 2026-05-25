import { uiPrimitiveType } from '@vanrot/ui';
import { ComponentRegistryDocPage } from './component-registry-doc.ts';

export class ComponentSliderPage extends ComponentRegistryDocPage {
  constructor() {
    super(uiPrimitiveType.slider);
  }
}
