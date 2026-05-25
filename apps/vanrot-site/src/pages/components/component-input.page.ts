import { uiPrimitiveType } from '@vanrot/ui';
import { ComponentRegistryDocPage } from './component-registry-doc.ts';

export class ComponentInputPage extends ComponentRegistryDocPage {
  constructor() {
    super(uiPrimitiveType.input);
  }
}
