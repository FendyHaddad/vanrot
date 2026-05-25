import { uiPrimitiveType } from '@vanrot/ui';
import { ComponentRegistryDocPage } from './component-registry-doc.ts';

export class ComponentRadioPage extends ComponentRegistryDocPage {
  constructor() {
    super(uiPrimitiveType.radio);
  }
}
