import { uiPrimitiveType } from '@vanrot/ui';
import { ComponentRegistryDocPage } from './component-registry-doc.ts';

export class ComponentRadioGroupPage extends ComponentRegistryDocPage {
  constructor() {
    super(uiPrimitiveType.radioGroup);
  }
}
