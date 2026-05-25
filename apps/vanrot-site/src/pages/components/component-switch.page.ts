import { uiPrimitiveType } from '@vanrot/ui';
import { ComponentRegistryDocPage } from './component-registry-doc.ts';

export class ComponentSwitchPage extends ComponentRegistryDocPage {
  constructor() {
    super(uiPrimitiveType.switch);
  }
}
