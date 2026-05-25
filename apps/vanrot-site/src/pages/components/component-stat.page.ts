import { uiPrimitiveType } from '@vanrot/ui';
import { ComponentRegistryDocPage } from './component-registry-doc.ts';

export class ComponentStatPage extends ComponentRegistryDocPage {
  constructor() {
    super(uiPrimitiveType.stat);
  }
}
